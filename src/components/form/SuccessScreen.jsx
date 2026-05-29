import { CheckCircle, LogIn, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getDefaultAdminRoute } from '../../config/adminRouting.js'

export default function SuccessScreen({ data, adminRoute }) {
  const contact = adminRoute || getDefaultAdminRoute()
  const waMessage = encodeURIComponent(
    `Hola! Soy ${data.nombre} de ${data.estado}. Ya llene el formulario de solicitud de prestamo en Nexo Capital y quiero continuar con mi aplicacion.`
  )

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card shadow-2xl text-center py-10">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
            <CheckCircle size={52} className="text-green-500" />
          </div>
        </div>

        <h2 className="text-3xl font-black text-primary mb-3 animate-fade-up delay-100">
          Solicitud enviada
        </h2>

        <p className="text-gray-600 text-lg mb-2 animate-fade-up delay-200">
          Hola <span className="font-bold text-primary">{data.nombre}</span>, recibimos tu solicitud.
        </p>

        <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed animate-fade-up delay-300">
          Tu cuenta fue creada con <span className="font-semibold text-secondary">{data.email}</span>. Puedes ingresar con ese correo y la contrasena que acabas de crear.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-fade-up delay-400">
          <a
            href={`https://wa.me/${contact.whatsapp}?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-4 px-7 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
          >
            <MessageCircle size={24} />
            Confirmar por WhatsApp
          </a>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-blue-50 text-secondary font-semibold text-sm py-4 px-6 rounded-xl border border-secondary/20 hover:bg-blue-100 transition-colors"
          >
            <LogIn size={16} />
            Entrar a mi cuenta
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center animate-fade-up delay-500">
          {[['Nombre', data.nombre],['Estado', data.estado],['Monto', data.montoNecesario]].map(([label, val]) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className="font-semibold text-gray-700 text-sm">{val}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Tambien puedes llamarnos al {contact.whatsappLabel} - Lun-Vie 9am-6pm EST
        </p>
      </div>
    </div>
  )
}
