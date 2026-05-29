import { useState, useEffect } from 'react'
import { X, Save, User, Phone, MapPin, Calendar, Mail, CreditCard, Shield, FileText, DollarSign, Building2, ChevronDown, ChevronUp, KeyRound, Send } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'

const PIPELINE_STAGES = [
  { id: 'nuevo',        label: 'Solicitud recibida' },
  { id: 'llamada1',     label: 'Pre-aprobación' },
  { id: 'documentos',   label: 'Documentos' },
  { id: 'llamada2',     label: 'Aprobación final' },
  { id: 'desembolsado', label: 'Dinero enviado' },
]

function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-primary"/>
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{title}</span>
        </div>
        {open ? <ChevronUp size={14} className="text-gray-400"/> : <ChevronDown size={14} className="text-gray-400"/>}
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label text-xs">{label}</label>
      {children}
    </div>
  )
}

export default function ClientProfileEditor({ profile: initialProfile, currentAdmin, onClose, onSaved }) {
  // Profile
  const [profileForm, setProfileForm] = useState({
    nombre:            initialProfile.nombre || '',
    telefono:          initialProfile.telefono || '',
    estado_residencia: initialProfile.estado_residencia || '',
    direccion:         initialProfile.direccion || '',
    codigo_postal:     initialProfile.codigo_postal || '',
    estado_civil:      initialProfile.estado_civil || '',
    fecha_nacimiento:  initialProfile.fecha_nacimiento || '',
  })

  // Lead
  const [lead, setLead]       = useState(null)
  const [leadForm, setLeadForm] = useState({})

  // Loan
  const [loan, setLoan]       = useState(null)
  const [loanForm, setLoanForm] = useState({})

  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [resetStatus, setResetStatus] = useState('idle') // idle | sending | sent | error

  const setP = (f, v) => setProfileForm(p => ({ ...p, [f]: v }))
  const setL = (f, v) => setLeadForm(p => ({ ...p, [f]: v }))
  const setLn = (f, v) => setLoanForm(p => ({ ...p, [f]: v }))

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const [{ data: leads }, { data: states }, { data: loans }] = await Promise.all([
      supabase.from('leads').select('*').eq('user_id', initialProfile.id).eq('assigned_admin_id', currentAdmin?.id).order('created_at', { ascending: false }).limit(1),
      supabase.from('lead_admin_states').select('*').eq('admin_id', currentAdmin?.id),
      supabase.from('loans').select('*').eq('user_id', initialProfile.id).eq('created_by_admin_id', currentAdmin?.id).order('created_at', { ascending: false }).limit(1),
    ])
    if (leads?.[0]) {
      const baseLead = leads[0]
      const state = (states || []).find(item => item.lead_id === baseLead.id)
      const ld = state
        ? {
            ...baseLead,
            ...Object.fromEntries(Object.entries(state).filter(([, value]) => value !== null && value !== undefined)),
            id: baseLead.id,
          }
        : baseLead
      setLead(ld)
      setLeadForm({
        stage:                  ld.stage || 'nuevo',
        ingresos:               ld.ingresos || '',
        banco:                  ld.banco || '',
        tiempo_cuenta:          ld.tiempo_cuenta || '',
        trabajando:             ld.trabajando || '',
        historial_credito:      ld.historial_credito || '',
        monto_necesario:        ld.monto_necesario || '',
        proposito:              ld.proposito || '',
        notas:                  ld.notas || '',
        fecha_nacimiento_admin: ld.fecha_nacimiento_admin || '',
        estado_civil_admin:     ld.estado_civil_admin || '',
        direccion_admin:        ld.direccion_admin || '',
        codigo_postal_admin:    ld.codigo_postal_admin || '',
      })
    }
    if (loans?.[0]) {
      const ln = loans[0]
      setLoan(ln)
      setLoanForm({
        monto:             ln.monto || '',
        plazo_meses:       ln.plazo_meses || 12,
        tasa_pct:          Number((ln.tasa_interes * 100).toFixed(2)) || 1,
        estado:            ln.estado || 'activo',
      })
    }
    setLoading(false)
  }

  async function handleSendReset() {
    if (!window.confirm(`¿Enviar enlace de recuperación de contraseña a ${initialProfile.email}?`)) return
    setResetStatus('sending')
    try {
      const res = await fetch('/api/send-reset-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: initialProfile.email }),
      })
      setResetStatus(res.ok ? 'sent' : 'error')
    } catch {
      setResetStatus('error')
    }
    setTimeout(() => setResetStatus('idle'), 4000)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    const errors = []

    // 1. Update profile
    const { error: pe } = await supabase.from('profiles').update({
      nombre:            profileForm.nombre,
      telefono:          profileForm.telefono || null,
      estado_residencia: profileForm.estado_residencia || null,
      direccion:         profileForm.direccion || null,
      codigo_postal:     profileForm.codigo_postal || null,
      estado_civil:      profileForm.estado_civil || null,
      fecha_nacimiento:  profileForm.fecha_nacimiento || null,
    }).eq('id', initialProfile.id)
    if (pe) errors.push('Perfil: ' + pe.message)

    // 2. Update lead if exists
    if (lead) {
      const { error: le } = await supabase.from('lead_admin_states').upsert({
        lead_id:                lead.id,
        admin_id:               currentAdmin?.id,
        stage:                  leadForm.stage,
        ingresos:               leadForm.ingresos || null,
        banco:                  leadForm.banco || null,
        tiempo_cuenta:          leadForm.tiempo_cuenta || null,
        trabajando:             leadForm.trabajando || null,
        historial_credito:      leadForm.historial_credito || null,
        monto_necesario:        leadForm.monto_necesario || null,
        proposito:              leadForm.proposito || null,
        notas:                  leadForm.notas || null,
        fecha_nacimiento_admin: leadForm.fecha_nacimiento_admin || null,
        estado_civil_admin:     leadForm.estado_civil_admin || null,
        direccion_admin:        leadForm.direccion_admin || null,
        codigo_postal_admin:    leadForm.codigo_postal_admin || null,
        updated_at:             new Date().toISOString(),
      }, { onConflict: 'lead_id,admin_id' })
      if (le) errors.push('Solicitud: ' + le.message)
    }

    // 3. Update loan if exists
    if (loan && loanForm.monto && loanForm.plazo_meses) {
      const rate     = (Number(loanForm.tasa_pct) || 0) / 100
      const total    = Number(loanForm.monto) * (1 + rate)
      const monthly  = loanForm.plazo_meses > 0 ? total / loanForm.plazo_meses : 0
      const { error: lne } = await supabase.from('loans').update({
        monto:           Number(Number(loanForm.monto).toFixed(2)),
        plazo_meses:     Number(loanForm.plazo_meses),
        tasa_interes:    rate,
        cuota_mensual:   Number(monthly.toFixed(2)),
        total_pagar:     Number(total.toFixed(2)),
        saldo_pendiente: Number(total.toFixed(2)),
        estado:          loanForm.estado,
      }).eq('id', loan.id)
      if (lne) errors.push('Préstamo: ' + lne.message)
    }

    setSaving(false)
    if (errors.length > 0) { setError(errors.join(' · ')); return }
    setSuccess('Todos los cambios se guardaron correctamente')
    onSaved({ ...initialProfile, ...profileForm })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end" onClick={onClose}>
      <div className="bg-white w-full md:max-w-2xl h-full overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white font-black text-lg">
              {(initialProfile.nombre || initialProfile.email || 'C')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-white font-bold">{initialProfile.nombre || 'Sin nombre'}</h2>
              <p className="text-blue-200 text-xs">{initialProfile.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={20}/></button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-4">
            {/* Read-only identity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                <Mail size={13} className="text-gray-400 flex-shrink-0"/>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-semibold text-gray-700 truncate">{initialProfile.email}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                <CreditCard size={13} className="text-gray-400 flex-shrink-0"/>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">No. Cuenta</p>
                  <p className="text-sm font-semibold text-gray-700 font-mono truncate">{initialProfile.numero_cuenta || '—'}</p>
                </div>
              </div>
            </div>
            {/* Password reset button for admin */}
            {!initialProfile.is_admin && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <KeyRound size={14} className="text-secondary"/>
                  <p className="text-sm text-blue-700">Recuperación de contraseña</p>
                </div>
                <button
                  type="button"
                  onClick={handleSendReset}
                  disabled={resetStatus === 'sending'}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all bg-blue-500 hover:bg-green-700 disabled:opacity-60 text-white"
                >
                  {resetStatus === 'sending' ? (
                    <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Enviando...</>
                  ) : resetStatus === 'sent' ? (
                    '✓ Enviado'
                  ) : resetStatus === 'error' ? (
                    'Error — reintentar'
                  ) : (
                    <><Send size={12}/> Enviar enlace</>
                  )}
                </button>
              </div>
            )}
            {initialProfile.is_admin && (
              <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5">
                <Shield size={14} className="text-purple-600"/>
                <p className="text-sm font-semibold text-purple-700">Cuenta de Administrador</p>
              </div>
            )}

            {/* ── SECTION 1: Profile ── */}
            <Section title="Datos del Perfil" icon={User}>
              <Field label="Nombre completo *">
                <input type="text" required value={profileForm.nombre} onChange={e => setP('nombre', e.target.value)} className="input-field text-sm" placeholder="Juan Pérez García"/>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Teléfono">
                  <input type="tel" value={profileForm.telefono} onChange={e => setP('telefono', e.target.value)} className="input-field text-sm" placeholder="5551234567"/>
                </Field>
                <Field label="Estado de residencia">
                  <input type="text" value={profileForm.estado_residencia} onChange={e => setP('estado_residencia', e.target.value)} className="input-field text-sm" placeholder="California"/>
                </Field>
                <Field label="Fecha de nacimiento">
                  <input type="date" value={profileForm.fecha_nacimiento} onChange={e => setP('fecha_nacimiento', e.target.value)} className="input-field text-sm"/>
                </Field>
                <Field label="Estado civil">
                  <select value={profileForm.estado_civil} onChange={e => setP('estado_civil', e.target.value)} className="input-field text-sm bg-white">
                    <option value="">Seleccionar...</option>
                    {['Soltero/a','Casado/a','Divorciado/a','Viudo/a','Unión libre'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Dirección completa">
                <input type="text" value={profileForm.direccion} onChange={e => setP('direccion', e.target.value)} className="input-field text-sm" placeholder="123 Main St, City, State ZIP"/>
              </Field>
              <Field label="Código Postal">
                <input type="text" value={profileForm.codigo_postal} onChange={e => setP('codigo_postal', e.target.value)} className="input-field text-sm" placeholder="90210"/>
              </Field>
            </Section>

            {/* ── SECTION 2: Lead / Application ── */}
            {lead ? (
              <Section title="Solicitud de Crédito" icon={FileText}>
                <Field label="Etapa del Pipeline">
                  <select value={leadForm.stage} onChange={e => setL('stage', e.target.value)} className="input-field text-sm bg-white">
                    {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Monto solicitado">
                    <input type="text" value={leadForm.monto_necesario} onChange={e => setL('monto_necesario', e.target.value)} className="input-field text-sm" placeholder="Más de $5,000"/>
                  </Field>
                  <Field label="Ingresos mensuales">
                    <input type="text" value={leadForm.ingresos} onChange={e => setL('ingresos', e.target.value)} className="input-field text-sm" placeholder="$2,000 – $3,000"/>
                  </Field>
                  <Field label="Banco">
                    <input type="text" value={leadForm.banco} onChange={e => setL('banco', e.target.value)} className="input-field text-sm" placeholder="Chase Bank"/>
                  </Field>
                  <Field label="Antigüedad de cuenta">
                    <select value={leadForm.tiempo_cuenta} onChange={e => setL('tiempo_cuenta', e.target.value)} className="input-field text-sm bg-white">
                      <option value="">Seleccionar...</option>
                      <option value="Menos de 3 meses">Menos de 3 meses</option>
                      <option value="3 a 6 meses">3 a 6 meses</option>
                      <option value="Más de 6 meses">Más de 6 meses</option>
                    </select>
                  </Field>
                  <Field label="¿Trabaja?">
                    <select value={leadForm.trabajando} onChange={e => setL('trabajando', e.target.value)} className="input-field text-sm bg-white">
                      <option value="">Seleccionar...</option>
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </Field>
                  <Field label="Historial de crédito">
                    <select value={leadForm.historial_credito} onChange={e => setL('historial_credito', e.target.value)} className="input-field text-sm bg-white">
                      <option value="">Seleccionar...</option>
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </Field>
                  <Field label="Fecha nacimiento (asesor)">
                    <input type="date" value={leadForm.fecha_nacimiento_admin} onChange={e => setL('fecha_nacimiento_admin', e.target.value)} className="input-field text-sm"/>
                  </Field>
                  <Field label="Estado civil (asesor)">
                    <select value={leadForm.estado_civil_admin} onChange={e => setL('estado_civil_admin', e.target.value)} className="input-field text-sm bg-white">
                      <option value="">Seleccionar...</option>
                      {['Soltero/a','Casado/a','Divorciado/a','Viudo/a','Unión libre'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </Field>
                  <Field label="Código postal (asesor)">
                    <input type="text" value={leadForm.codigo_postal_admin} onChange={e => setL('codigo_postal_admin', e.target.value)} className="input-field text-sm" placeholder="12345"/>
                  </Field>
                </div>
                <Field label="Dirección (asesor)">
                  <input type="text" value={leadForm.direccion_admin} onChange={e => setL('direccion_admin', e.target.value)} className="input-field text-sm" placeholder="123 Main St, City, State ZIP"/>
                </Field>
                <Field label="Propósito del crédito">
                  <input type="text" value={leadForm.proposito} onChange={e => setL('proposito', e.target.value)} className="input-field text-sm" placeholder="Gastos personales, negocio..."/>
                </Field>
                <Field label="Notas del Asesor">
                  <textarea rows={3} value={leadForm.notas} onChange={e => setL('notas', e.target.value)} className="input-field text-sm resize-none" placeholder="Notas internas..."/>
                </Field>
              </Section>
            ) : (
              <div className="border border-dashed border-gray-200 rounded-xl p-5 text-center text-gray-400">
                <FileText size={28} className="mx-auto mb-2 opacity-30"/>
                <p className="text-sm">Este cliente no tiene solicitudes registradas</p>
              </div>
            )}

            {/* ── SECTION 3: Loan ── */}
            {loan ? (
              <Section title="Préstamo Activo" icon={DollarSign}>
                <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-2.5 flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 font-semibold">{loan.numero_prestamo}</span>
                  <span className="text-xs font-bold text-primary">{loan.estado?.toUpperCase()}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Monto (USD)">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input type="number" min="0" step="50" value={loanForm.monto}
                        onChange={e => setLn('monto', e.target.value)}
                        className="input-field text-sm pl-7"/>
                    </div>
                  </Field>
                  <Field label="Plazo (meses)">
                    <input type="number" min="1" max="360" value={loanForm.plazo_meses}
                      onChange={e => setLn('plazo_meses', e.target.value)}
                      className="input-field text-sm"/>
                  </Field>
                  <Field label="Tasa de interés anual (%)">
                    <div className="relative">
                      <input type="number" min="0" max="100" step="0.1" value={loanForm.tasa_pct}
                        onChange={e => setLn('tasa_pct', e.target.value)}
                        className="input-field text-sm pr-7"/>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                    </div>
                  </Field>
                  <Field label="Estado del préstamo">
                    <select value={loanForm.estado} onChange={e => setLn('estado', e.target.value)} className="input-field text-sm bg-white">
                      <option value="activo">Activo</option>
                      <option value="pagado">Pagado</option>
                      <option value="en_mora">En mora</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </Field>
                </div>
                {loanForm.monto && loanForm.plazo_meses && (
                  <div className="grid grid-cols-3 gap-2 text-center mt-1">
                    {(() => {
                      const rate    = (Number(loanForm.tasa_pct) || 0) / 100
                      const total   = Number(loanForm.monto) * (1 + rate)
                      const monthly = loanForm.plazo_meses > 0 ? total / loanForm.plazo_meses : 0
                      return [['Cuota mensual', `$${monthly.toFixed(2)}`], ['Total a pagar', `$${total.toFixed(2)}`], ['Tasa', `${loanForm.tasa_pct}%`]]
                    })().map(([l, v]) => (
                      <div key={l} className="bg-primary/5 rounded-lg p-3">
                        <p className="text-xs text-gray-400">{l}</p>
                        <p className="font-black text-primary text-sm">{v}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            ) : (
              <div className="border border-dashed border-gray-200 rounded-xl p-5 text-center text-gray-400">
                <DollarSign size={28} className="mx-auto mb-2 opacity-30"/>
                <p className="text-sm">Sin préstamo activo registrado</p>
              </div>
            )}

            {error   && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm font-semibold">✓ {success}</div>}

            <div className="flex gap-3 pt-2 pb-4">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition-all">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-blue-900 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                <Save size={16}/> {saving ? 'Guardando todo...' : 'Guardar todos los cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
