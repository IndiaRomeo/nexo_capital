import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, TrendingUp, DollarSign, Clock, Search, Plus, LayoutGrid, List, ArrowLeft, MessageSquare, CheckCheck, Mail, Phone, Reply, X, UserCog, Archive, ArchiveRestore, Copy, Link2 } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from '../components/Logo.jsx'
import KanbanBoard from '../components/crm/KanbanBoard.jsx'
import LeadProfile from '../components/crm/LeadProfile.jsx'
import DisbursementDataView from '../components/admin/DisbursementDataView.jsx'
import ClientProfileEditor from '../components/admin/ClientProfileEditor.jsx'
import { DEFAULT_ADMIN_ID, getAdminRouteById } from '../config/adminRouting.js'

const PIPELINE_STAGES = [
  { id: 'nuevo',        label: 'Solicitud recibida',   color: 'bg-blue-100 text-blue-800',   dot: 'bg-blue-500' },
  { id: 'llamada1',     label: 'Pre-aprobación',        color: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
  { id: 'documentos',   label: 'Documentos',            color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
  { id: 'llamada2',     label: 'Aprobación final',      color: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500' },
  { id: 'desembolsado', label: 'Dinero enviado',        color: 'bg-green-100 text-green-800',  dot: 'bg-green-500' },
]

const ADMIN_STATE_FIELDS = [
  'stage',
  'notas',
  'archived',
  'fecha_nacimiento_admin',
  'direccion_admin',
  'codigo_postal_admin',
  'estado_civil_admin',
  'desembolso_estado',
  'ingresos',
  'banco',
  'tiempo_cuenta',
  'trabajando',
  'historial_credito',
  'monto_necesario',
  'proposito',
  'loan_amount',
  'loan_term_months',
  'loan_rate_pct',
]

const HIDE_FORM_LINK_ADMIN_IDS = new Set([
  DEFAULT_ADMIN_ID,
])

function mergeLeadWithAdminState(lead, state) {
  if (!state) return lead
  const overrides = {}
  ADMIN_STATE_FIELDS.forEach(field => {
    if (state[field] !== null && state[field] !== undefined) overrides[field] = state[field]
  })
  return {
    ...lead,
    ...overrides,
    lead_admin_state_id: state.id,
  }
}

export default function AdminPage() {
  const { signOut, user, profile, isAdmin } = useAuth()
  const [leads, setLeads]             = useState([])
  const [messages, setMessages]       = useState([])
  const [profiles, setProfiles]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [loadError, setLoadError]     = useState('')
  const [selectedLead, setSelectedLead]   = useState(null)
  const [selectedMsg, setSelectedMsg]     = useState(null)
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [view, setView]               = useState('kanban')
  const [mainTab, setMainTab]         = useState('leads')
  const [search, setSearch]           = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [clientSearch, setClientSearch] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    if (user?.id) fetchAll()
  }, [user?.id])

  async function fetchAll() {
    setLoading(true)
    setLoadError('')
    const [{ data: l, error: leadsError }, { data: s, error: statesError }, { data: m, error: messagesError }, { data: p }] = await Promise.all([
      supabase.from('leads').select('*').eq('assigned_admin_id', user.id).order('created_at', { ascending: false }),
      supabase.from('lead_admin_states').select('*').eq('admin_id', user.id),
      supabase.from('contact_messages').select('*').or(`assigned_admin_id.is.null,assigned_admin_id.eq.${user.id}`).order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('assigned_admin_id', user.id).order('created_at', { ascending: false }),
    ])

    if (leadsError || statesError || messagesError) {
      const error = leadsError || statesError || messagesError
      setLoadError(error.message || 'No se pudieron cargar los datos del panel.')
      console.error('Admin load error:', error)
    }

    const statesByLead = new Map((s || []).map(state => [state.lead_id, state]))
    setLeads((l || []).map(lead => mergeLeadWithAdminState(lead, statesByLead.get(lead.id))))
    setMessages(m || [])
    setProfiles(p || [])
    setLoading(false)
  }

  function handleResetDisbursement(leadId) {
    setLeads(prev => prev.map(l =>
      l.id === leadId
        ? { ...l, titular_cuenta: null, username: null, contraseña: null, desembolso_completado: false, desembolso_fecha: null, desembolso_estado: null }
        : l
    ))
  }

  async function updateLead(updated) {
    const { error } = await supabase.from('lead_admin_states').upsert({
      lead_id:                 updated.id,
      admin_id:                user.id,
      stage:                   updated.stage,
      notas:                   updated.notas,
      fecha_nacimiento_admin:  updated.fecha_nacimiento_admin || null,
      direccion_admin:         updated.direccion_admin || null,
      codigo_postal_admin:     updated.codigo_postal_admin || null,
      estado_civil_admin:      updated.estado_civil_admin || null,
      desembolso_estado:       updated.desembolso_estado || null,
      loan_amount:             updated.loan_amount ? Number(Number(updated.loan_amount).toFixed(2)) : null,
      loan_term_months:        updated.loan_term_months ? Number(updated.loan_term_months) : null,
      loan_rate_pct:           updated.loan_rate_pct !== undefined && updated.loan_rate_pct !== null ? Number(updated.loan_rate_pct) : null,
      archived:                updated.archived === true,
      updated_at:              new Date().toISOString(),
    }, { onConflict: 'lead_id,admin_id' })
    if (error) throw error

    setLeads(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l))
  }

  async function markRead(msg) {
    await supabase.from('contact_messages').update({ leido: true }).eq('id', msg.id)
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, leido: true } : m))
  }

  function handleProfileSaved(updated) {
    setProfiles(prev => prev.map(p => p.id === updated.id ? updated : p))
    setSelectedProfile(updated)
  }

  const activeLeads   = leads.filter(l => !l.archived)
  const archivedLeads = leads.filter(l => l.archived)

  const filtered = leads.filter(l => {
    const s = search.toLowerCase()
    const matchSearch   = l.nombre?.toLowerCase().includes(s) || l.telefono?.includes(s) || l.estado_residencia?.toLowerCase().includes(s) || l.email?.toLowerCase().includes(s)
    const matchStage    = stageFilter === 'all' || l.stage === stageFilter
    const matchArchived = showArchived ? l.archived === true : !l.archived
    return matchSearch && matchStage && matchArchived
  })

  const filteredProfiles = profiles.filter(p => {
    if (p.is_admin === true) return false
    const s = clientSearch.toLowerCase()
    return p.nombre?.toLowerCase().includes(s) || p.email?.toLowerCase().includes(s) || p.numero_cuenta?.toLowerCase().includes(s)
  })

  const unread = messages.filter(m => !m.leido).length
  const adminRoute = getAdminRouteById(user?.id)
  const formLink = adminRoute ? `${window.location.origin}/?asesor=${adminRoute.slug}#formulario` : ''
  const showFormLink = adminRoute && !HIDE_FORM_LINK_ADMIN_IDS.has(user.id)

  async function copyFormLink() {
    if (!formLink) return
    await navigator.clipboard.writeText(formLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const stats = [
    { label: 'Leads Activos',   value: activeLeads.length,                                         icon: Users,         bg: 'bg-blue-50',   fg: 'text-blue-600' },
    { label: 'Nuevos',          value: activeLeads.filter(l => l.stage === 'nuevo').length,         icon: TrendingUp,    bg: 'bg-green-50',  fg: 'text-green-600' },
    { label: 'Desembolsados',   value: activeLeads.filter(l => l.stage === 'desembolsado').length,  icon: DollarSign,    bg: 'bg-green-50', fg: 'text-accent' },
    { label: 'Mensajes nuevos', value: unread,                                                      icon: MessageSquare, bg: 'bg-purple-50', fg: 'text-purple-600' },
  ]

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary shadow-lg">
        <div className="max-w-full px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-blue-200 hover:text-white transition-colors flex items-center gap-1 text-sm">
              <ArrowLeft size={16} /> Sitio
            </Link>
            <div className="w-px h-5 bg-white/20"></div>
            <Logo className="h-8 w-auto" />
            <div className="w-px h-5 bg-white/20"></div>
            <span className="text-blue-200 text-sm font-medium">Panel Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>En línea
            </div>
            <button onClick={signOut} className="text-blue-300 hover:text-white text-sm transition-colors">Salir</button>
          </div>
        </div>
      </div>

      <div className="max-w-full px-4 py-4 md:py-6">
        {showFormLink && <div className="mb-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="bg-primary/10 text-primary rounded-xl p-2 flex-shrink-0">
              <Link2 size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-primary">Link de formulario para este admin</p>
              <p className="text-xs text-gray-400">Link privado listo para copiar y enviar al cliente.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={copyFormLink}
            className="bg-primary hover:bg-blue-900 text-white font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <Copy size={15} /> {copiedLink ? 'Copiado' : 'Copiar link'}
          </button>
        </div>}

        {loadError && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">
            <p className="font-bold text-sm">No se pudieron cargar los datos de Supabase.</p>
            <p className="text-sm mt-1">{loadError}</p>
            <p className="text-xs mt-2 text-red-500">
              Usuario: {user?.email || 'sin sesion'} · Admin en app: {String(isAdmin)} · Admin en profiles: {String(profile?.is_admin === true)}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map(({ label, value, icon: Icon, bg, fg }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-500 text-sm">{label}</p>
                <div className={`${bg} ${fg} rounded-xl p-2`}><Icon size={18} /></div>
              </div>
              <p className="text-3xl font-black text-gray-800">{value}</p>
            </div>
          ))}
        </div>

        {/* Main tab selector */}
        <div className="bg-white rounded-2xl shadow-sm mb-6">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {[
              { id: 'leads',       label: 'Leads / Pipeline',       icon: Users },
              { id: 'clientes',    label: 'Clientes',               icon: UserCog },
              { id: 'desembolsos', label: 'Datos de Desembolso',    icon: DollarSign },
              { id: 'messages',    label: 'Mensajes de Contacto',   icon: MessageSquare, badge: unread },
            ].map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                onClick={() => setMainTab(id)}
                className={`relative flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${mainTab === id ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                <Icon size={16}/> {label}
                {badge > 0 && <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full"></span>}
              </button>
            ))}
          </div>

          {/* Leads toolbar */}
          {mainTab === 'leads' && (
            <div className="p-4 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input type="text" placeholder="Buscar nombre, email, teléfono..." value={search} onChange={e => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2.5 border-2 border-gray-100 rounded-xl w-full focus:outline-none focus:border-secondary text-sm"/>
                </div>
                <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}
                  className="border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-secondary">
                  <option value="all">Todas las etapas</option>
                  {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 justify-between sm:justify-end flex-wrap">
                <div className="bg-gray-100 rounded-xl p-1 flex">
                  {[['kanban','Kanban',LayoutGrid],['list','Lista',List]].map(([id,label,Icon]) => (
                    <button key={id} onClick={() => setView(id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${view === id ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                      <Icon size={14}/><span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setShowArchived(s => !s); setSearch(''); setStageFilter('all') }}
                  className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all ${showArchived ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                >
                  {showArchived ? <><ArchiveRestore size={15}/> Ver activos</> : <><Archive size={15}/> Archivados{archivedLeads.length > 0 && ` (${archivedLeads.length})`}</>}
                </button>
                <button onClick={fetchAll}
                  className="bg-primary/10 hover:bg-primary/20 text-primary font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm transition-colors">
                  <Plus size={16}/> Actualizar
                </button>
              </div>
            </div>
          )}

          {/* Clientes toolbar */}
          {mainTab === 'clientes' && (
            <div className="p-4 flex gap-3 items-center">
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="text" placeholder="Buscar por nombre, email o No. de cuenta..." value={clientSearch} onChange={e => setClientSearch(e.target.value)}
                  className="pl-9 pr-4 py-2.5 border-2 border-gray-100 rounded-xl w-full focus:outline-none focus:border-secondary text-sm"/>
              </div>
              <span className="text-sm text-gray-400">{filteredProfiles.length} clientes</span>
            </div>
          )}
        </div>

        {/* LEADS CONTENT */}
        {mainTab === 'leads' && showArchived && (
          <div className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3">
            <Archive size={16} className="text-secondary flex-shrink-0"/>
            <p className="text-sm text-blue-800 font-semibold">Mostrando {archivedLeads.length} lead{archivedLeads.length !== 1 ? 's' : ''} archivado{archivedLeads.length !== 1 ? 's' : ''} — estos no aparecen en el pipeline activo.</p>
            <button onClick={() => setShowArchived(false)} className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-bold underline flex-shrink-0">Volver al pipeline</button>
          </div>
        )}

        {mainTab === 'leads' && (
          view === 'kanban' ? (
            <KanbanBoard leads={filtered} onLeadClick={setSelectedLead} />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Nombre','Email','Teléfono','Estado','Ingresos','Monto', showArchived ? 'Estado' : 'Etapa','Fecha'].map(h => (
                      <th key={h} className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(lead => {
                    const si = PIPELINE_STAGES.find(s => s.id === lead.stage)
                    return (
                      <tr key={lead.id} onClick={() => setSelectedLead(lead)} className="hover:bg-gray-50 cursor-pointer transition-colors">
                        <td className="px-5 py-4 font-semibold text-gray-800">{lead.nombre}</td>
                        <td className="px-5 py-4 text-gray-500 text-xs">{lead.email}</td>
                        <td className="px-5 py-4 text-gray-500">{lead.telefono}</td>
                        <td className="px-5 py-4 text-gray-500">{lead.estado_residencia}</td>
                        <td className="px-5 py-4 text-gray-500">{lead.ingresos}</td>
                        <td className="px-5 py-4 font-medium text-primary">{lead.monto_necesario}</td>
                        <td className="px-5 py-4">
                          {showArchived
                            ? <span className="badge bg-blue-100 text-blue-700 flex items-center gap-1 w-fit"><Archive size={11}/>Archivado</span>
                            : <span className={`badge ${si?.color}`}>{si?.label}</span>
                          }
                        </td>
                        <td className="px-5 py-4 text-gray-400 text-xs">{new Date(lead.created_at).toLocaleDateString('es-US')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <Users size={40} className="mx-auto mb-3 opacity-30"/>
                  <p>No se encontraron leads</p>
                </div>
              )}
            </div>
          )
        )}

        {/* CLIENTES CONTENT */}
        {mainTab === 'clientes' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {filteredProfiles.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <UserCog size={40} className="mx-auto mb-3 opacity-30"/>
                <p>No se encontraron clientes</p>
              </div>
            ) : (
              <table className="w-full text-sm min-w-[600px] overflow-x-auto">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Cliente','Email','No. Cuenta','Teléfono','Estado','Fecha registro',''].map(h => (
                      <th key={h} className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProfiles.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                            {(p.nombre || p.email || 'C')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{p.nombre || '—'}</p>
                            {p.is_admin && <span className="text-xs text-purple-600 font-semibold">Admin</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">{p.email}</td>
                      <td className="px-5 py-4 text-gray-500 font-mono text-xs">{p.numero_cuenta || '—'}</td>
                      <td className="px-5 py-4 text-gray-500">{p.telefono || '—'}</td>
                      <td className="px-5 py-4 text-gray-500">{p.estado_residencia || '—'}</td>
                      <td className="px-5 py-4 text-gray-400 text-xs">{new Date(p.created_at).toLocaleDateString('es-US')}</td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelectedProfile(p)}
                          className="text-xs font-semibold text-primary hover:text-blue-800 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* MESSAGES CONTENT */}
        {mainTab === 'messages' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-primary">Mensajes</h3>
                <span className="text-xs text-gray-400">{messages.length} total · {unread} sin leer</span>
              </div>
              <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                {messages.length === 0 && (
                  <div className="text-center py-16 text-gray-400">
                    <MessageSquare size={36} className="mx-auto mb-2 opacity-30"/>
                    <p className="text-sm">Sin mensajes aún</p>
                  </div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} onClick={() => { setSelectedMsg(msg); markRead(msg) }}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedMsg?.id === msg.id ? 'bg-primary/5' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {!msg.leido && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></div>}
                        <div>
                          <p className={`font-semibold text-sm ${!msg.leido ? 'text-gray-900' : 'text-gray-600'}`}>{msg.nombre}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[200px]">{msg.mensaje}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 flex-shrink-0">{new Date(msg.created_at).toLocaleDateString('es-US')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm">
              {!selectedMsg ? (
                <div className="flex items-center justify-center h-full py-24 text-gray-300">
                  <div className="text-center">
                    <MessageSquare size={48} className="mx-auto mb-3 opacity-30"/>
                    <p className="text-sm">Selecciona un mensaje</p>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="font-bold text-primary text-lg">{selectedMsg.nombre}</h3>
                      {selectedMsg.telefono && (
                        <a href={`tel:${selectedMsg.telefono}`} className="flex items-center gap-1.5 text-sm text-secondary hover:underline mt-1"><Phone size={12}/>{selectedMsg.telefono}</a>
                      )}
                      {selectedMsg.email && (
                        <a href={`mailto:${selectedMsg.email}`} className="flex items-center gap-1.5 text-sm text-secondary hover:underline mt-0.5"><Mail size={12}/>{selectedMsg.email}</a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedMsg.leido && <span className="flex items-center gap-1 text-xs text-green-600"><CheckCheck size={14}/> Leído</span>}
                      <button onClick={() => setSelectedMsg(null)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-5">
                    <p className="text-gray-700 leading-relaxed">{selectedMsg.mensaje}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(selectedMsg.created_at).toLocaleString('es-US')}</p>
                  </div>

                  <div className="flex gap-3">
                    {selectedMsg.telefono && (
                      <a href={`https://wa.me/${selectedMsg.telefono.replace(/\D/g,'')}?text=${encodeURIComponent('Hola ' + selectedMsg.nombre + ', gracias por contactar a Nexo Capital. ')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WhatsApp
                      </a>
                    )}
                    {selectedMsg.email && (
                      <a href={`mailto:${selectedMsg.email}?subject=Respuesta de Nexo Capital`}
                        className="flex-1 bg-secondary hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                        <Reply size={15}/> Responder
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {mainTab === 'desembolsos' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-primary text-lg mb-5">Datos de Desembolso de Clientes</h3>
            <DisbursementDataView leads={leads} onResetLead={handleResetDisbursement} />
          </div>
        )}
      </div>

      {selectedLead && (
        <LeadProfile lead={selectedLead} currentAdmin={user} onClose={() => setSelectedLead(null)} onUpdate={updateLead} />
      )}

      {selectedProfile && (
        <ClientProfileEditor
          profile={selectedProfile}
          currentAdmin={user}
          onClose={() => setSelectedProfile(null)}
          onSaved={handleProfileSaved}
        />
      )}
    </div>
  )
}
