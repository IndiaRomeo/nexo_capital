import { useState } from 'react'
import { Shield, Lock } from 'lucide-react'
import Step1 from './Step1.jsx'
import Step2 from './Step2.jsx'
import Step3 from './Step3.jsx'
import Step4 from './Step4.jsx'
import SuccessScreen from './SuccessScreen.jsx'
import { supabase } from '../../lib/supabase.js'

const STEPS = ['Datos Personales', 'Situacion Laboral', 'Perfil Bancario', 'Tu Prestamo']

const initialData = {
  nombre: '', email: '', password: '', confirmPassword: '', telefono: '', estado: '',
  trabajando: '', tipoTrabajo: '', ingresos: '',
  cuentaActiva: '', ingresosEnCuenta: '', banco: '', tiempoCuenta: '', historialCredito: '',
  montoNecesario: '', proposito: '',
}

function generateAccountNumber() {
  return `IL${crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`
}

function getSubmitErrorMessage(err) {
  const message = err?.message || ''
  const normalized = message.toLowerCase()

  if (normalized.includes('email rate limit exceeded')) {
    return 'Supabase alcanzo el limite de emails de autenticacion. Desactiva "Confirm email" en Authentication > Providers > Email, o espera unos minutos antes de intentar de nuevo.'
  }

  if (normalized.includes('invalid') && normalized.includes('email')) {
    return 'El correo no fue aceptado por Supabase. Usa un correo real y evita correos de prueba como test@gmail.com.'
  }

  if (normalized.includes('already') || normalized.includes('registered')) {
    return 'Ya existe una cuenta con ese correo. Inicia sesion o usa la misma contrasena que creaste antes.'
  }

  return message || 'Ocurrio un error al enviar tu solicitud. Intenta nuevamente.'
}

export default function MultiStepForm({ assignedAdminId = null, adminRoute = null }) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState(initialData)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (field, value) => setData(prev => ({ ...prev, [field]: value }))
  const next = () => setStep(s => Math.min(s + 1, STEPS.length))
  const back = () => setStep(s => Math.max(s - 1, 1))

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      let authUser = null
      const email = data.email.trim().toLowerCase()

      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email,
        password: data.password,
        options: {
          data: { nombre: data.nombre },
        },
      })

      if (signUpErr) {
        // Log full Supabase error for debugging (temporal)
        console.error('Supabase signUp error:', signUpErr)
        const message = signUpErr.message?.toLowerCase() || ''
        const accountExists = message.includes('already') || message.includes('registered')

        if (!accountExists) throw signUpErr

        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password: data.password,
        })

        if (signInErr) {
          throw new Error('Ya existe una cuenta con ese correo. Ingresa la contrasena correcta o inicia sesion.')
        }

        authUser = signInData.user
      } else {
        authUser = signUpData.user
      }

      if (!authUser?.id) {
        throw new Error('No se pudo crear la cuenta. Revisa la configuracion de Auth en Supabase.')
      }

      const { data: existingProfile, error: profileLookupErr } = await supabase
        .from('profiles')
        .select('id, assigned_admin_id')
        .eq('id', authUser.id)
        .maybeSingle()

      if (profileLookupErr) throw profileLookupErr

      const profilePayload = {
        email,
        nombre: data.nombre,
        telefono: data.telefono,
        estado_residencia: data.estado,
      }

      if (!existingProfile?.assigned_admin_id) {
        profilePayload.assigned_admin_id = assignedAdminId
      }

      const { error: profileErr } = existingProfile
        ? await supabase.from('profiles').update(profilePayload).eq('id', authUser.id)
        : await supabase.from('profiles').insert({
            id: authUser.id,
            ...profilePayload,
            numero_cuenta: generateAccountNumber(),
            is_admin: false,
          })

      if (profileErr) throw profileErr

      const { error: dbErr } = await supabase.from('leads').insert({
        user_id: authUser.id,
        assigned_admin_id: assignedAdminId,
        nombre: data.nombre,
        email,
        telefono: data.telefono,
        estado_residencia: data.estado,
        trabajando: data.trabajando,
        tipo_trabajo: data.tipoTrabajo,
        ingresos: data.ingresos,
        cuenta_activa: data.cuentaActiva,
        ingresos_en_cuenta: data.ingresosEnCuenta,
        banco: data.banco,
        tiempo_cuenta: data.tiempoCuenta,
        historial_credito: data.historialCredito,
        monto_necesario: data.montoNecesario,
        proposito: data.proposito,
      })
      if (dbErr) throw dbErr

      setSubmitted(true)
    } catch (err) {
      setError(getSubmitErrorMessage(err))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const progress = (step / STEPS.length) * 100

  if (submitted) return <SuccessScreen data={data} adminRoute={adminRoute} />

  return (
    <div className="max-w-2xl mx-auto px-0 sm:px-4">
      <div className="card shadow-2xl rounded-xl sm:rounded-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-500">Paso {step} de {STEPS.length}</span>
            <span className="text-sm font-bold text-secondary">{STEPS[step - 1]}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-secondary to-primary h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex mt-3 gap-1">
            {STEPS.map((label, i) => (
              <div key={i} className="flex-1">
                <div className={`h-1 rounded-full transition-all duration-300 ${i < step ? 'bg-secondary' : 'bg-gray-100'}`}></div>
              </div>
            ))}
          </div>
        </div>

        {step === 1 && <Step1 data={data} update={update} onNext={next} />}
        {step === 2 && <Step2 data={data} update={update} onNext={next} onBack={back} />}
        {step === 3 && <Step3 data={data} update={update} onNext={next} onBack={back} />}
        {step === 4 && <Step4 data={data} update={update} onSubmit={handleSubmit} onBack={back} loading={loading} error={error} />}

        <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
          <Lock size={13} />
          <p className="text-xs">Tus datos estan protegidos y encriptados con SSL de 256 bits</p>
          <Shield size={13} />
        </div>
      </div>
    </div>
  )
}
