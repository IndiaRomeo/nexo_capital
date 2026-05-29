import { useState, useEffect } from 'react'
import { X, Phone, Mail, MapPin, DollarSign, Building2, CreditCard, FileText, Upload, Calculator, CheckCircle, XCircle, AlertCircle, Archive, ArchiveRestore } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'
import ContractModal from '../ContractModal.jsx'

const PIPELINE_STAGES = [
  { id: 'nuevo',        label: 'Nuevo Lead' },
  { id: 'llamada1',     label: 'Llamada 1' },
  { id: 'documentos',   label: 'Documentos' },
  { id: 'llamada2',     label: 'Llamada 2' },
  { id: 'desembolsado', label: 'Desembolsado' },
]

const PRESET_RATES = { 12: 1, 24: 1, 36: 1 }  // percent
const AMOUNT_MID   = { '$500 – $1,000': 750, '$1,000 – $2,000': 1500, '$2,000 – $5,000': 3500, 'Más de $5,000': 7000 }

const DISBURSEMENT_STATUS = {
  '':           { label: 'Sin estado',            color: 'bg-gray-100 text-gray-600',   Icon: AlertCircle },
  'exitoso':    { label: 'Desembolso Exitoso',    color: 'bg-green-100 text-green-700', Icon: CheckCircle },
  'incorrecto': { label: 'Desembolso Incorrecto', color: 'bg-red-100 text-red-700',     Icon: XCircle     },
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="bg-gray-100 rounded-lg p-2 flex-shrink-0 mt-0.5"><Icon size={13} className="text-gray-500"/></div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-gray-800 font-semibold text-sm">{value || '—'}</p>
      </div>
    </div>
  )
}

export default function LeadProfile({ lead, currentAdmin, onClose, onUpdate }) {
  const [extra, setExtra] = useState({
    fecha_nacimiento_admin: lead.fecha_nacimiento_admin || '',
    direccion_admin:        lead.direccion_admin || '',
    codigo_postal_admin:    lead.codigo_postal_admin || '',
    estado_civil_admin:     lead.estado_civil_admin || '',
    notas:                  lead.notas || '',
  })
  const [stage, setStage]                 = useState(lead.stage || 'nuevo')
  const [calcAmount, setCalcAmount]       = useState(Number(lead.loan_amount) || AMOUNT_MID[lead.monto_necesario] || 3500)
  const [calcTerm, setCalcTerm]           = useState(Number(lead.loan_term_months) || 12)
  const [calcRate, setCalcRate]           = useState(Number(lead.loan_rate_pct) || 1)   // percentage
  const [saving, setSaving]               = useState(false)
  const [creatingLoan, setCreatingLoan]   = useState(false)
  const [loanMessage, setLoanMessage]     = useState('')
  const [existingLoan, setExistingLoan]   = useState(null)
  const [loanInitialized, setLoanInit]    = useState(false)
  const [desembolsoEstado, setDesembolsoEstado] = useState(lead.desembolso_estado || '')
  const [settingStatus, setSettingStatus]   = useState(false)
  const [showContract, setShowContract]     = useState(false)
  const [archiveConfirm, setArchiveConfirm] = useState(false)
  const [archiving, setArchiving]           = useState(false)
  const [saveError, setSaveError]           = useState('')

  const rateDecimal = calcRate / 100
  const monthly = calcTerm > 0 ? ((calcAmount * (1 + rateDecimal)) / calcTerm).toFixed(2) : '0.00'
  const total   = (calcAmount * (1 + rateDecimal)).toFixed(2)

  const waMsg = encodeURIComponent(`Hola ${lead.nombre}, soy asesor de Nexo Capital. Quería dar seguimiento a tu solicitud de ${lead.monto_necesario}. ¿Tienes un momento?`)

  useEffect(() => { fetchExistingLoan() }, [])

  async function fetchExistingLoan() {
    const { data } = await supabase
      .from('loans')
      .select('*')
      .eq('lead_id', lead.id)
      .eq('created_by_admin_id', currentAdmin?.id)
      .maybeSingle()
    if (data) {
      setExistingLoan(data)
      if (!loanInitialized) {
        setCalcAmount(Number(data.monto) || AMOUNT_MID[lead.monto_necesario] || 3500)
        setCalcTerm(data.plazo_meses || 12)
        setCalcRate(Number((data.tasa_interes * 100).toFixed(2)) || 4)
        setLoanInit(true)
      }
    }
  }

  function applyPreset(term) {
    setCalcTerm(term)
    setCalcRate(PRESET_RATES[term] ?? 4)
  }

  async function persistLoan() {
    if (!lead.user_id) throw new Error('Este lead no tiene usuario vinculado.')

    const start = new Date()
    const due = new Date(start)
    due.setMonth(due.getMonth() + calcTerm)

    const newTotal = calcAmount * (1 + rateDecimal)
    const newMonthly = calcTerm > 0 ? newTotal / calcTerm : 0
    const payload = {
      user_id:             lead.user_id,
      lead_id:             lead.id,
      created_by_admin_id: currentAdmin?.id || null,
      monto:               Number(Number(calcAmount).toFixed(2)),
      plazo_meses:         calcTerm,
      tasa_interes:        rateDecimal,
      cuota_mensual:       Number(newMonthly.toFixed(2)),
      total_pagar:         Number(newTotal.toFixed(2)),
      saldo_pendiente:     Number(newTotal.toFixed(2)),
      estado:              'activo',
      fecha_inicio:        start.toISOString().slice(0, 10),
      fecha_vencimiento:   due.toISOString().slice(0, 10),
    }

    if (existingLoan) {
      const { data, error } = await supabase
        .from('loans')
        .update({
          monto:           payload.monto,
          plazo_meses:     payload.plazo_meses,
          tasa_interes:    payload.tasa_interes,
          cuota_mensual:   payload.cuota_mensual,
          total_pagar:     payload.total_pagar,
          saldo_pendiente: payload.saldo_pendiente,
          estado:          payload.estado,
        })
        .eq('id', existingLoan.id)
        .select()
        .single()
      if (error) throw error
      setExistingLoan(data)
      return data
    }

    const { data, error } = await supabase
      .from('loans')
      .insert({
        ...payload,
        numero_prestamo: `IL-${Date.now().toString().slice(-8)}`,
      })
      .select()
      .single()
    if (error) throw error
    setExistingLoan(data)
    setLoanInit(true)
    return data
  }

  async function save() {
    setSaving(true)
    setSaveError('')
    try {
      await onUpdate({
        ...lead,
        ...extra,
        stage,
        desembolso_estado: desembolsoEstado,
        loan_amount: Number(calcAmount),
        loan_term_months: Number(calcTerm),
        loan_rate_pct: Number(calcRate),
      })

      if (existingLoan) {
        await persistLoan()
      }

      onClose()
    } catch (err) {
      console.error('Lead save error:', err)
      setSaveError(err.message || 'No se pudieron guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  async function createLoan() {
    setLoanMessage('')
    setCreatingLoan(true)
    try {
      await persistLoan()
      await onUpdate({
        ...lead,
        ...extra,
        stage: 'desembolsado',
        desembolso_estado: desembolsoEstado,
        loan_amount: Number(calcAmount),
        loan_term_months: Number(calcTerm),
        loan_rate_pct: Number(calcRate),
      })
      setStage('desembolsado')
      setLoanMessage('Prestamo guardado correctamente.')
    } catch (err) {
      console.error('Loan create error:', err)
      setLoanMessage(err.message || 'No se pudo guardar el prestamo.')
    } finally {
      setCreatingLoan(false)
    }
  }

  async function handleArchive() {
    setArchiving(true)
    const newArchived = !lead.archived
    setSaveError('')
    try {
      await onUpdate({
        ...lead,
        ...extra,
        stage,
        desembolso_estado: desembolsoEstado,
        archived: newArchived,
        loan_amount: Number(calcAmount),
        loan_term_months: Number(calcTerm),
        loan_rate_pct: Number(calcRate),
      })
      setArchiveConfirm(false)
      onClose()
    } catch (err) {
      console.error('Lead archive error:', err)
      setSaveError(err.message || 'No se pudo cambiar el archivo del lead.')
    } finally {
      setArchiving(false)
    }
  }

  async function setDisbursementStatus(status) {
    setSettingStatus(true)
    setSaveError('')
    try {
      await onUpdate({
        ...lead,
        ...extra,
        stage,
        desembolso_estado: status,
        loan_amount: Number(calcAmount),
        loan_term_months: Number(calcTerm),
        loan_rate_pct: Number(calcRate),
      })
      setDesembolsoEstado(status)
    } catch (err) {
      console.error('Disbursement status error:', err)
      setSaveError(err.message || 'No se pudo guardar el estado de desembolso.')
    } finally {
      setSettingStatus(false)
    }
  }

  const disbStatus = DISBURSEMENT_STATUS[desembolsoEstado] || DISBURSEMENT_STATUS['']
  const DisbIcon   = disbStatus.Icon

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end" onClick={onClose}>
        <div className="bg-white w-full md:max-w-2xl h-full overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="bg-primary px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div>
              <h2 className="text-white font-bold text-xl">{lead.nombre}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-blue-300">#{lead.id?.slice(0,8).toUpperCase()}</span>
                <span className="text-xs text-blue-300">·</span>
                <span className="text-xs text-blue-200">{lead.email}</span>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:text-blue-200"><X size={22}/></button>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={`https://wa.me/${lead.telefono?.replace(/\D/g,'')}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
              <a href={`tel:${lead.telefono}`} className="flex-1 bg-secondary hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                <Phone size={15}/> Llamar
              </a>
            </div>

            {/* Stage */}
            <div>
              <label className="label text-xs">Etapa del Pipeline</label>
              <select value={stage} onChange={e => setStage(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-700 focus:outline-none focus:border-secondary">
                {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            {/* Form data */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"><FileText size={13}/>Datos del Formulario</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={Phone}      label="Teléfono"          value={lead.telefono}/>
                <InfoRow icon={Mail}       label="Email"             value={lead.email}/>
                <InfoRow icon={MapPin}     label="Estado"            value={lead.estado_residencia}/>
                <InfoRow icon={DollarSign} label="Ingresos"          value={lead.ingresos}/>
                <InfoRow icon={Building2}  label="Banco"             value={lead.banco}/>
                <InfoRow icon={Calculator} label="Antigüedad de cuenta" value={lead.tiempo_cuenta}/>
                <InfoRow icon={CreditCard} label="Historial crédito" value={lead.historial_credito}/>
                <InfoRow icon={DollarSign} label="Monto solicitado"  value={lead.monto_necesario}/>
                <InfoRow icon={FileText}   label="Trabaja"           value={lead.trabajando}/>
              </div>
              {lead.proposito && (
                <div className="mt-3 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Propósito</p>
                  <p className="text-gray-700 text-sm">{lead.proposito}</p>
                </div>
              )}
            </div>

            {/* Calculator — manual amount + term + rate */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Calculator size={13}/>Calculadora de Tasas</h3>
              {existingLoan && <p className="text-xs text-blue-600 mb-3 bg-blue-50 rounded-lg px-3 py-2">Editando préstamo activo · Al guardar cambios se actualizará para el cliente.</p>}
              {!existingLoan && <p className="text-xs text-blue-600 mb-3 bg-blue-50 rounded-lg px-3 py-2">Al guardar cambios se guardan estos valores en el lead. El préstamo real solo se crea con "Crear prestamo".</p>}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
                {/* Amount */}
                <div>
                  <label className="text-xs text-gray-500 font-semibold mb-1 block">Monto a otorgar (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input type="number" min="100" step="50" value={calcAmount}
                      onChange={e => setCalcAmount(Number(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:border-secondary bg-white"/>
                  </div>
                </div>

                {/* Term — presets + custom */}
                <div>
                  <label className="text-xs text-gray-500 font-semibold mb-1 block">Plazo (meses)</label>
                  <div className="flex gap-2">
                    {[12, 24, 36].map(t => (
                      <button key={t} type="button" onClick={() => applyPreset(t)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex-shrink-0 ${calcTerm === t && calcRate === PRESET_RATES[t] ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'}`}>
                        {t}m
                      </button>
                    ))}
                    <input type="number" min="1" max="360" value={calcTerm}
                      onChange={e => setCalcTerm(Number(e.target.value) || 1)}
                      className="flex-1 min-w-0 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:border-secondary bg-white text-center"
                      placeholder="Custom"/>
                  </div>
                </div>

                {/* Rate */}
                <div>
                  <label className="text-xs text-gray-500 font-semibold mb-1 block">Tasa de interés anual (%)</label>
                  <div className="relative">
                    <input type="number" min="0" max="100" step="0.1" value={calcRate}
                      onChange={e => setCalcRate(Number(e.target.value) || 0)}
                      className="w-full pr-8 pl-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:border-secondary bg-white"/>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                  </div>
                </div>

                {/* Results */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  {[['Cuota mensual', `$${monthly}`], ['Total a pagar', `$${total}`], ['Tasa anual', `${calcRate}%`]].map(([l, v]) => (
                    <div key={l} className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-400">{l}</p>
                      <p className="font-black text-primary">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Create loan (only when no loan exists and stage = desembolsado) */}
            {stage === 'desembolsado' && !existingLoan && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-green-800">Crear prestamo activo</h3>
                    <p className="text-sm text-green-700 mt-1">Se registrará el préstamo y el cliente lo verá en su cuenta.</p>
                    <p className="text-xs text-green-600 mt-2">Monto: ${Number(calcAmount).toLocaleString()} · Plazo: {calcTerm}m · Tasa: {calcRate}% · Cuota: ${monthly}</p>
                  </div>
                  <button onClick={createLoan} disabled={creatingLoan}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex-shrink-0 w-full sm:w-auto">
                    {creatingLoan ? 'Creando...' : 'Crear prestamo'}
                  </button>
                </div>
                {loanMessage && <p className="text-sm mt-3 text-green-800">{loanMessage}</p>}
              </div>
            )}

            {/* Disbursement status panel — only when loan exists */}
            {existingLoan && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Estado del Desembolso</p>
                    <p className="text-xs text-gray-400 mt-0.5">{existingLoan.numero_prestamo} · ${Number(existingLoan.monto).toLocaleString()}</p>
                  </div>
                  <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${disbStatus.color}`}>
                    <DisbIcon size={13}/>{disbStatus.label}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-xs text-gray-500">Marca el resultado del desembolso para que el cliente lo vea actualizado:</p>
                  <div className="flex gap-3">
                    <button onClick={() => setDisbursementStatus('exitoso')} disabled={settingStatus || desembolsoEstado === 'exitoso'}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 ${desembolsoEstado === 'exitoso' ? 'bg-green-600 text-white' : 'bg-green-50 hover:bg-green-100 text-green-700 border-2 border-green-200'}`}>
                      <CheckCircle size={16}/> Exitoso
                    </button>
                    <button onClick={() => setDisbursementStatus('incorrecto')} disabled={settingStatus || desembolsoEstado === 'incorrecto'}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 ${desembolsoEstado === 'incorrecto' ? 'bg-red-600 text-white' : 'bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-200'}`}>
                      <XCircle size={16}/> Incorrecto
                    </button>
                  </div>
                  <button onClick={() => setShowContract(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border-2 border-primary/30 hover:border-primary text-primary font-semibold text-sm rounded-xl transition-all hover:bg-primary/5">
                    <FileText size={15}/> Ver / Generar Contrato
                  </button>
                </div>
              </div>
            )}

            {loanMessage && !existingLoan && (
              <p className="text-sm text-green-700 bg-green-50 rounded-xl p-3">{loanMessage}</p>
            )}

            {/* Extra admin fields */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Datos del Cliente</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">Fecha de nacimiento</label>
                    <input type="date" value={extra.fecha_nacimiento_admin} onChange={e => setExtra(p => ({ ...p, fecha_nacimiento_admin: e.target.value }))} className="input-field text-sm"/>
                  </div>
                  <div>
                    <label className="label text-xs">Estado civil</label>
                    <select value={extra.estado_civil_admin} onChange={e => setExtra(p => ({ ...p, estado_civil_admin: e.target.value }))} className="input-field text-sm bg-white">
                      <option value="">Seleccionar...</option>
                      {['Soltero/a','Casado/a','Divorciado/a','Viudo/a','Unión libre'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label text-xs">Dirección completa</label>
                  <input type="text" placeholder="123 Main St, City, State ZIP" value={extra.direccion_admin} onChange={e => setExtra(p => ({ ...p, direccion_admin: e.target.value }))} className="input-field text-sm"/>
                </div>
                <div>
                  <label className="label text-xs">Código Postal</label>
                  <input type="text" placeholder="12345" value={extra.codigo_postal_admin} onChange={e => setExtra(p => ({ ...p, codigo_postal_admin: e.target.value }))} className="input-field text-sm"/>
                </div>
                <div>
                  <label className="label text-xs">Notas del Asesor</label>
                  <textarea rows={3} placeholder="Notas internas..." value={extra.notas} onChange={e => setExtra(p => ({ ...p, notas: e.target.value }))} className="input-field text-sm resize-none"/>
                </div>
                <div>
                  <label className="label text-xs flex items-center gap-1.5"><Upload size={11}/>Foto del ID / Licencia</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-secondary transition-colors cursor-pointer">
                    <Upload size={22} className="mx-auto text-gray-300 mb-1"/>
                    <p className="text-sm text-gray-400">Haz clic para subir documento</p>
                    <p className="text-xs text-gray-300 mt-0.5">PNG, JPG, PDF hasta 10MB</p>
                    <input type="file" accept="image/*,.pdf" className="hidden"/>
                  </div>
                </div>
              </div>
            </div>

            {/* Archive / Restore */}
            <div className="border-t border-gray-100 pt-2">
              {!archiveConfirm ? (
                <button
                  type="button"
                  onClick={() => setArchiveConfirm(true)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl border border-dashed transition-all ${
                    lead.archived
                      ? 'border-green-200 text-green-600 hover:bg-green-50 hover:border-green-400'
                      : 'border-gray-200 text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  {lead.archived
                    ? <><ArchiveRestore size={15}/> Restaurar lead al pipeline</>
                    : <><Archive size={15}/> Archivar lead</>
                  }
                </button>
              ) : (
                <div className={`rounded-xl p-4 border ${lead.archived ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                  <p className={`text-sm font-bold mb-1 ${lead.archived ? 'text-green-800' : 'text-blue-800'}`}>
                    {lead.archived ? '¿Restaurar este lead?' : '¿Archivar este lead?'}
                  </p>
                  <p className={`text-xs mb-3 ${lead.archived ? 'text-green-700' : 'text-blue-700'}`}>
                    {lead.archived
                      ? 'Volverá a aparecer en el pipeline activo.'
                      : 'Se ocultará del pipeline. Puedes consultarlo en "Ver archivados" cuando lo necesites.'}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setArchiveConfirm(false)} className={`flex-1 py-2 rounded-lg border text-sm font-semibold ${lead.archived ? 'border-green-200 text-green-700' : 'border-blue-200 text-blue-700'}`}>
                      Cancelar
                    </button>
                    <button onClick={handleArchive} disabled={archiving} className={`flex-1 py-2 rounded-lg text-white text-sm font-bold disabled:opacity-60 ${lead.archived ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-500 hover:bg-green-700'}`}>
                      {archiving ? 'Procesando...' : 'Confirmar'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 pb-4">
              {saveError && (
                <div className="w-full bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                  {saveError}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition-all">Cancelar</button>
                <button onClick={save} disabled={saving} className="flex-1 bg-primary hover:bg-blue-900 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all">
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showContract && existingLoan && (
        <ContractModal clientName={lead.nombre} clientEmail={lead.email} loan={existingLoan} onClose={() => setShowContract(false)}/>
      )}
    </>
  )
}
