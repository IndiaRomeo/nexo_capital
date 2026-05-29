import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Plus, Home, User, CreditCard, FileText, ChevronRight, Save, Edit3, X, XCircle, CheckCircle2, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from '../components/Logo.jsx'
import ProfileCard from '../components/client/ProfileCard.jsx'
import ApplicationStatus from '../components/client/ApplicationStatus.jsx'
import LoanCard from '../components/client/LoanCard.jsx'
import NewLoanRequestModal from '../components/client/NewLoanRequestModal.jsx'
import DisbursementFormModal from '../components/client/DisbursementFormModal.jsx'
import ContractModal from '../components/ContractModal.jsx'

const WA_NUMBER = '19472804624'

const STAGE_LABELS = {
  'nuevo': 'Solicitud recibida',
  'llamada1': 'Pre-aprobación',
  'documentos': 'Documentos',
  'llamada2': 'Aprobación final',
  'desembolsado': 'Dinero enviado',
}

export default function DashboardPage() {
  const { user, profile, signOut, refetchProfile } = useAuth()
  const [leads, setLeads] = useState([])
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('inicio')
  const [requestOpen, setRequestOpen] = useState(false)
  const [disbursementModalOpen, setDisbursementModalOpen] = useState(false)
  const [disbursementLead, setDisbursementLead] = useState(null)
  const [hasShownDisbursementModal, setHasShownDisbursementModal] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [contractLoan, setContractLoan] = useState(null)
  const [profileForm, setProfileForm] = useState({
    nombre: '',
    telefono: '',
    estado_residencia: '',
    direccion: '',
    codigo_postal: '',
    estado_civil: '',
    fecha_nacimiento: '',
  })

  useEffect(() => {
    if (!user) return
    fetchAccount()
  }, [user])

  // Verificar si hay una solicitud pendiente de desembolso
  useEffect(() => {
    const pendingDisbursement = leads.find(
      lead => lead.stage === 'llamada2' && !lead.desembolso_completado
    )
    
    // Solo mostrar el modal una vez por sesión
    if (pendingDisbursement && !hasShownDisbursementModal && !disbursementModalOpen) {
      setDisbursementLead(pendingDisbursement)
      setDisbursementModalOpen(true)
      setHasShownDisbursementModal(true)
    }
  }, [leads, hasShownDisbursementModal, disbursementModalOpen])

  useEffect(() => {
    setProfileForm({
      nombre: profile?.nombre || '',
      telefono: profile?.telefono || '',
      estado_residencia: profile?.estado_residencia || '',
      direccion: profile?.direccion || '',
      codigo_postal: profile?.codigo_postal || '',
      estado_civil: profile?.estado_civil || '',
      fecha_nacimiento: profile?.fecha_nacimiento || '',
    })
  }, [profile])

  async function fetchAccount() {
    setLoading(true)
    const [{ data: l }, { data: ln }] = await Promise.all([
      supabase.from('leads').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('loans').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ])
    const { data: publicStatuses, error: statusError } = await supabase.rpc('get_my_lead_public_statuses')
    if (statusError) console.error('Lead public status load error:', statusError)
    const statusesByLead = new Map((publicStatuses || []).map(status => [status.lead_id, status]))
    const mergedLeads = (l || []).map(lead => {
      const status = statusesByLead.get(lead.id)
      return status
        ? {
            ...lead,
            stage: status.stage || lead.stage,
            desembolso_estado: status.desembolso_estado ?? lead.desembolso_estado,
          }
        : lead
    })
    setLeads(mergedLeads)
    if (!profile?.nombre && mergedLeads[0]?.nombre) {
      await supabase.from('profiles').update({ nombre: mergedLeads[0].nombre }).eq('id', user.id)
      await refetchProfile()
    }
    setLoans(ln || [])
    setLoading(false)
  }

  function handleLeadCreated(lead) {
    setLeads(prev => [lead, ...prev])
    setRequestOpen(false)
    setTab('creditos')
  }

  function handleDisbursementCompleted() {
    setDisbursementModalOpen(false)
    setDisbursementLead(null)
    setTab('inicio')
    fetchAccount() // Refresh para obtener el estado actualizado
  }

  function openDisbursementModal() {
    const pendingDisbursement = leads.find(
      lead => lead.stage === 'llamada2' && !lead.desembolso_completado
    )

    if (pendingDisbursement) {
      setDisbursementLead(pendingDisbursement)
      setDisbursementModalOpen(true)
      setHasShownDisbursementModal(true)
    }
  }

  const updateProfileForm = (field, value) => setProfileForm(prev => ({ ...prev, [field]: value }))

  async function saveProfile(e) {
    e.preventDefault()
    setSavingProfile(true)
    setProfileError('')

    const { error } = await supabase.from('profiles').update({
      nombre: profileForm.nombre,
      telefono: profileForm.telefono,
      estado_residencia: profileForm.estado_residencia,
      direccion: profileForm.direccion || null,
      codigo_postal: profileForm.codigo_postal || null,
      estado_civil: profileForm.estado_civil || null,
      fecha_nacimiento: profileForm.fecha_nacimiento || null,
    }).eq('id', user.id)

    setSavingProfile(false)
    if (error) {
      setProfileError(error.message || 'No se pudo guardar el perfil.')
      return
    }

    await refetchProfile()
    setEditingProfile(false)
  }

  const activeLoan = loans.find(l => l.estado === 'activo')
  const latestLead = leads[0]
  const displayName = profile?.nombre || latestLead?.nombre || user?.email?.split('@')[0] || 'Cliente'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando tu cuenta...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-primary shadow-lg sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/">
            <Logo className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-white font-semibold text-sm">{displayName}</p>
              <p className="text-blue-300 text-xs">Mi cuenta</p>
            </div>
            <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center text-white font-black text-sm">
              {(displayName || 'U')[0].toUpperCase()}
            </div>
            <button onClick={signOut} className="text-blue-300 hover:text-white transition-colors p-1">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-100 sticky top-[56px] z-30">
        <div className="max-w-5xl mx-auto px-4 flex">
          {[
            { id: 'inicio', icon: Home, label: 'Inicio' },
            { id: 'cuenta', icon: CreditCard, label: 'Mi Cuenta' },
            { id: 'creditos', icon: FileText, label: 'Creditos' },
            { id: 'perfil', icon: User, label: 'Perfil' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-all border-b-2 ${
                tab === id ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        {tab === 'inicio' && (
          <div className="space-y-6">
            <div className="animate-fade-up">
              <h1 className="text-2xl font-black text-primary">
                Hola, {displayName.split(' ')[0]}
              </h1>
              <p className="text-gray-500 mt-1">Aqui tienes un resumen de tu cuenta con Nexo Capital.</p>
            </div>

            {latestLead && !activeLoan && (
              <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-5 text-white flex items-center justify-between gap-4 animate-fade-up delay-100">
                <div className="min-w-0">
                  <p className="font-bold text-base sm:text-lg">Tu solicitud esta en proceso</p>
                  <p className="text-blue-200 text-xs sm:text-sm mt-0.5 truncate">Un asesor te contactara pronto a {user?.email}</p>
                </div>
                <ChevronRight size={24} className="text-white/70 flex-shrink-0" />
              </div>
            )}

            {activeLoan && (() => {
              const ds = latestLead?.desembolso_estado
              const isError = ds === 'incorrecto'
              return (
                <div className={`rounded-2xl p-5 text-white flex items-center justify-between gap-4 animate-fade-up delay-100 bg-gradient-to-r ${isError ? 'from-red-700 to-red-500' : 'from-green-600 to-green-500'}`}>
                  <div className="min-w-0">
                    <p className="font-bold text-base sm:text-lg">
                      {isError ? 'Problema con el desembolso' : 'Prestamo activo'}
                    </p>
                    <p className={`text-sm mt-0.5 ${isError ? 'text-red-200' : 'text-green-100'}`}>
                      {isError ? 'Dinero en espera · Un asesor te contactará pronto' : `Saldo: $${activeLoan.saldo_pendiente?.toLocaleString()}`}
                    </p>
                  </div>
                  {!isError && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-green-100 text-xs">Cuota mensual</p>
                      <p className="font-black text-xl">${activeLoan.cuota_mensual?.toLocaleString()}</p>
                    </div>
                  )}
                  {isError && <XCircle size={32} className="text-red-300 flex-shrink-0"/>}
                </div>
              )
            })()}

            <div className="grid grid-cols-3 gap-4 animate-fade-up delay-200">
              {[
                { label: 'Solicitudes', value: leads.length, color: 'text-secondary' },
                { label: 'Prestamos', value: loans.length, color: 'text-green-600' },
                { label: 'Estado', value: activeLoan ? 'Activo' : latestLead ? 'En proceso' : 'Sin solicitud', color: 'text-accent' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-50">
                  <p className={`font-black text-2xl ${color}`}>{value}</p>
                  <p className="text-gray-400 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>

            {latestLead ? (
              <div className="animate-fade-up delay-300">
                <ApplicationStatus lead={latestLead} onOpenDisbursement={openDisbursementModal} />
              </div>
            ) : (
              <div className="card text-center py-10 animate-fade-up delay-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={28} className="text-gray-300" />
                </div>
                <h3 className="font-bold text-gray-700 mb-2">Aun no tienes solicitudes</h3>
                <p className="text-gray-400 text-sm mb-5">Aplica ahora y recibe una respuesta en menos de 24 horas.</p>
                <button onClick={() => setRequestOpen(true)} className="btn-cta inline-block">Solicitar prestamo</button>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between animate-fade-up delay-400">
              <div>
                <p className="font-bold text-green-800 text-sm">Necesitas ayuda?</p>
                <p className="text-green-600 text-xs">Escribenos por WhatsApp</p>
              </div>
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-4 py-2 rounded-xl transition-colors">
                Escribir
              </a>
            </div>
          </div>
        )}

        {tab === 'cuenta' && (
          <div className="space-y-6">
            <div className="animate-fade-up">
              <h2 className="text-2xl font-black text-primary mb-1">Mi Cuenta</h2>
              <p className="text-gray-500 text-sm">Tu tarjeta de credito Nexo Capital</p>
            </div>
            <div className="flex justify-center animate-fade-up delay-100">
              <ProfileCard profile={profile} loan={activeLoan} holderName={displayName} />
            </div>
            {activeLoan ? (
              <div className="animate-fade-up delay-200 space-y-3">
                <h3 className="font-bold text-primary mb-3">Detalles del prestamo activo</h3>
                {latestLead?.desembolso_estado === 'incorrecto' && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-300 rounded-xl p-4">
                    <XCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5"/>
                    <div>
                      <p className="font-bold text-red-800 text-sm">Problema en el desembolso</p>
                      <p className="text-xs text-red-700 mt-0.5">El dinero está en espera. Tu asesor te contactará para resolver el inconveniente.</p>
                    </div>
                  </div>
                )}
                {latestLead?.desembolso_estado === 'exitoso' && (
                  <div className="flex items-start gap-3 bg-green-50 border border-green-300 rounded-xl p-3">
                    <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5"/>
                    <p className="text-sm font-semibold text-green-800">¡Desembolso exitoso! Tu dinero fue enviado correctamente.</p>
                  </div>
                )}
                <LoanCard loan={activeLoan} />
                <button
                  onClick={() => setContractLoan(activeLoan)}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-primary/20 hover:border-primary text-primary font-semibold text-sm rounded-xl transition-all hover:bg-primary/5"
                >
                  <FileText size={15}/> Ver Contrato de Crédito
                </button>
              </div>
            ) : (
              <div className="card text-center py-8 animate-fade-up delay-200">
                <CreditCard size={40} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-500 text-sm">Aun no tienes un prestamo aprobado.</p>
                <p className="text-gray-400 text-xs mt-1">Cuando sea aprobado aparecera aqui.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'creditos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between animate-fade-up">
              <div>
                <h2 className="text-2xl font-black text-primary">Mis Creditos</h2>
                <p className="text-gray-500 text-sm mt-0.5">Historial de solicitudes y prestamos</p>
              </div>
              <button onClick={() => setRequestOpen(true)} className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-sm px-4 py-2 rounded-xl transition-all">
                <Plus size={16} /> Nuevo
              </button>
            </div>

            {loans.length > 0 && (
              <div className="space-y-4 animate-fade-up delay-100">
                <h3 className="font-bold text-gray-700">Prestamos</h3>
                {loans.map(l => (
                  <div key={l.id} className="space-y-2">
                    <LoanCard loan={l} />
                    <button
                      onClick={() => setContractLoan(l)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-primary/20 hover:border-primary text-primary font-semibold text-sm rounded-xl transition-all hover:bg-primary/5"
                    >
                      <FileText size={14}/> Ver Contrato
                    </button>
                  </div>
                ))}
              </div>
            )}

            {leads.length > 0 && (
              <div className="space-y-3 animate-fade-up delay-200">
                <h3 className="font-bold text-gray-700">Solicitudes</h3>
                {leads.map(lead => (
                  <div key={lead.id} className={`card-hover border shadow-sm ${lead.desembolso_estado === 'incorrecto' ? 'border-red-200 bg-red-50/30' : 'border-gray-50'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{lead.monto_necesario}</p>
                        <p className="text-gray-400 text-xs">{lead.proposito}</p>
                        <p className="text-gray-300 text-xs mt-1">{new Date(lead.created_at).toLocaleDateString('es-US')}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        {lead.desembolso_estado === 'incorrecto' ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                            <XCircle size={11}/> Error desembolso
                          </span>
                        ) : lead.desembolso_estado === 'exitoso' ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            <CheckCircle2 size={11}/> Desembolso exitoso
                          </span>
                        ) : (
                          <span className="badge bg-blue-100 text-blue-700">{STAGE_LABELS[lead.stage] || lead.stage || 'nuevo'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {leads.length === 0 && loans.length === 0 && (
              <div className="card text-center py-12 animate-fade-up">
                <FileText size={44} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-500">Sin solicitudes aun</p>
                <button onClick={() => setRequestOpen(true)} className="btn-cta inline-block mt-5">Solicitar ahora</button>
              </div>
            )}
          </div>
        )}

        {tab === 'perfil' && (
          <div className="space-y-5 animate-fade-up">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-primary">Mi Perfil</h2>
              {!editingProfile && (
                <button onClick={() => setEditingProfile(true)} className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-sm px-4 py-2 rounded-xl transition-all">
                  <Edit3 size={15} /> Editar
                </button>
              )}
            </div>

            <div className="card">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg">
                  {(displayName || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-primary text-xl">{displayName}</p>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                  <span className="badge bg-green-100 text-green-700 mt-1">Cuenta activa</span>
                </div>
              </div>

              {editingProfile ? (
                <form onSubmit={saveProfile} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Nombre completo</label>
                      <input value={profileForm.nombre} onChange={e => updateProfileForm('nombre', e.target.value)} className="input-field" required />
                    </div>
                    <div>
                      <label className="label">Telefono</label>
                      <input value={profileForm.telefono} onChange={e => updateProfileForm('telefono', e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Estado</label>
                      <input value={profileForm.estado_residencia} onChange={e => updateProfileForm('estado_residencia', e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Fecha de nacimiento</label>
                      <input type="date" value={profileForm.fecha_nacimiento} onChange={e => updateProfileForm('fecha_nacimiento', e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Direccion</label>
                      <input value={profileForm.direccion} onChange={e => updateProfileForm('direccion', e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Codigo postal</label>
                      <input value={profileForm.codigo_postal} onChange={e => updateProfileForm('codigo_postal', e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Estado civil</label>
                      <select value={profileForm.estado_civil} onChange={e => updateProfileForm('estado_civil', e.target.value)} className="input-field bg-white">
                        <option value="">Selecciona...</option>
                        <option value="Soltero/a">Soltero/a</option>
                        <option value="Casado/a">Casado/a</option>
                        <option value="Union libre">Union libre</option>
                        <option value="Divorciado/a">Divorciado/a</option>
                        <option value="Viudo/a">Viudo/a</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Numero de cuenta</label>
                      <input value={profile?.numero_cuenta || ''} className="input-field bg-gray-50 text-gray-400" disabled />
                    </div>
                  </div>

                  {profileError && <p className="text-sm text-red-500">{profileError}</p>}

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setEditingProfile(false)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-600 hover:border-gray-300 flex items-center justify-center gap-2">
                      <X size={16} /> Cancelar
                    </button>
                    <button type="submit" disabled={savingProfile} className="flex-1 btn-cta py-3 rounded-xl flex items-center justify-center gap-2">
                      <Save size={16} /> {savingProfile ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  {[
                    ['Numero de cuenta', profile?.numero_cuenta],
                    ['Telefono', profile?.telefono],
                    ['Estado', profile?.estado_residencia],
                    ['Direccion', profile?.direccion],
                    ['Codigo postal', profile?.codigo_postal],
                    ['Estado civil', profile?.estado_civil],
                    ['Fecha de nacimiento', profile?.fecha_nacimiento],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                      <p className="font-semibold text-gray-700">{val || '-'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={signOut} className="w-full py-3 border-2 border-red-200 text-red-500 hover:bg-red-50 font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
              <LogOut size={16} /> Cerrar sesion
            </button>
          </div>
        )}
      </main>

      {requestOpen && (
        <NewLoanRequestModal
          user={user}
          profile={profile}
          onClose={() => setRequestOpen(false)}
          onCreated={handleLeadCreated}
        />
      )}

      {disbursementModalOpen && disbursementLead && (
        <DisbursementFormModal
          lead={disbursementLead}
          user={user}
          onClose={() => {
            setDisbursementModalOpen(false)
            setDisbursementLead(null)
          }}
          onCompleted={handleDisbursementCompleted}
        />
      )}

      {contractLoan && (
        <ContractModal
          clientName={displayName}
          clientEmail={user?.email}
          loan={contractLoan}
          onClose={() => setContractLoan(null)}
        />
      )}
    </div>
  )
}
