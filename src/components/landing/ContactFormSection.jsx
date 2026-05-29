import { useState } from 'react'
import { Send, CheckCircle, Phone, Mail, Clock, MessageSquare } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'
import useScrollReveal from '../../hooks/useScrollReveal.js'
import { CONTACT_MESSAGES_ADMIN_ID, getContactMessagesAdminRoute } from '../../config/adminRouting.js'

export default function ContactFormSection({ adminRoute }) {
  const contact = adminRoute || getContactMessagesAdminRoute()
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', mensaje: '' })
  const [status, setStatus] = useState('idle') // idle | sending | done | error
  const [ref, visible] = useScrollReveal()

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const valid = form.nombre && form.mensaje && (form.telefono || form.email)

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    const { error } = await supabase.from('contact_messages').insert({
      nombre: form.nombre,
      telefono: form.telefono || null,
      email: form.email || null,
      mensaje: form.mensaje,
      assigned_admin_id: CONTACT_MESSAGES_ADMIN_ID,
    })
    if (error) { setStatus('error'); return }
    setStatus('done')
    setForm({ nombre: '', telefono: '', email: '', mensaje: '' })
  }

  return (
    <section id="contacto" className="py-20 bg-gray-50" ref={ref}>
      <div className="max-w-6xl mx-auto px-4">
        <div className={`text-center mb-14 transition-all duration-700 ${visible ? 'animate-fade-up' : 'opacity-0 translate-y-8'}`}>
          <p className="text-secondary font-semibold uppercase tracking-wider text-sm mb-2">Estamos aquí para ti</p>
          <h2 className="section-title mb-4">Contáctanos</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            ¿Tienes preguntas o dudas? Escríbenos y un asesor te responderá a la brevedad.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-10">
          {/* Contact info */}
          <div className={`md:col-span-2 space-y-6 transition-all duration-700 delay-100 ${visible ? 'animate-fade-left' : 'opacity-0'}`}>
            <div className="card-hover border border-gray-50">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 rounded-2xl p-3 flex-shrink-0">
                  <Phone size={22} className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-primary mb-1">WhatsApp</h4>
                  <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline font-medium">
                    {contact.whatsappLabel}
                  </a>
                  <p className="text-gray-400 text-sm mt-1">Respuesta en minutos</p>
                </div>
              </div>
            </div>

            <div className="card-hover border border-gray-50">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-2xl p-3 flex-shrink-0">
                  <Mail size={22} className="text-secondary" />
                </div>
                <div>
                  <h4 className="font-bold text-primary mb-1">Email</h4>
                  <a href="mailto:info@nexocapital.com" className="text-secondary hover:underline font-medium">
                    info@nexocapital.com
                  </a>
                  <p className="text-gray-400 text-sm mt-1">Respuesta en 24 horas</p>
                </div>
              </div>
            </div>

            <div className="card-hover border border-gray-50">
              <div className="flex items-start gap-4">
                <div className="bg-accent/15 rounded-2xl p-3 flex-shrink-0">
                  <Clock size={22} className="text-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-primary mb-1">Horario de atención</h4>
                  <p className="text-gray-600 font-medium">Lun – Vie: 9am – 6pm EST</p>
                  <p className="text-gray-400 text-sm mt-1">Sábados con cita previa</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className={`md:col-span-3 transition-all duration-700 delay-200 ${visible ? 'animate-fade-right' : 'opacity-0'}`}>
            {status === 'done' ? (
              <div className="card h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
                  <CheckCircle size={44} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-black text-primary mb-2">¡Mensaje enviado!</h3>
                <p className="text-gray-500 mb-6">Un asesor se pondrá en contacto contigo a la brevedad.</p>
                <button onClick={() => setStatus('idle')} className="btn-primary">Enviar otro mensaje</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare size={20} className="text-secondary" />
                  <h3 className="text-xl font-bold text-primary">Envíanos un mensaje</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="label">Nombre completo *</label>
                    <input type="text" placeholder="Tu nombre" value={form.nombre} onChange={e => update('nombre', e.target.value)} className="input-field" required />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Teléfono</label>
                      <input type="tel" placeholder="(555) 123-4567" value={form.telefono} onChange={e => update('telefono', e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input type="email" placeholder="tu@email.com" value={form.email} onChange={e => update('email', e.target.value)} className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Tu mensaje o duda *</label>
                    <textarea rows={4} placeholder="Escribe aquí tu pregunta o mensaje..." value={form.mensaje} onChange={e => update('mensaje', e.target.value)} className="input-field resize-none" required />
                  </div>
                </div>

                {status === 'error' && (
                  <p className="text-red-500 text-sm mt-3">Ocurrió un error. Intenta nuevamente o contáctanos por WhatsApp.</p>
                )}

                <button
                  type="submit"
                  disabled={!valid || status === 'sending'}
                  className={`w-full mt-5 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all ${
                    valid && status !== 'sending' ? 'btn-cta' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {status === 'sending' ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Enviando...</>
                  ) : (
                    <><Send size={18} /> Enviar mensaje</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
