import { Phone, Mail, Clock, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from '../Logo.jsx'
import { getDefaultAdminRoute } from '../../config/adminRouting.js'

export default function Footer({ adminRoute }) {
  const contact = adminRoute || getDefaultAdminRoute()

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="mb-5">
              <Logo className="h-12 w-auto" />
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              Prestamistas directos para la comunidad latina en Estados Unidos.
              Sin intermediarios, sin letras pequeñas.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Contacto</h4>
            <div className="space-y-3">
              <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-200 hover:text-white transition-colors">
                <Phone size={16} /><span className="text-sm">{contact.whatsappLabel}</span>
              </a>
              <a href="mailto:info@nexocapital.com" className="flex items-center gap-3 text-blue-200 hover:text-white transition-colors">
                <Mail size={16} /><span className="text-sm">info@nexocapital.com</span>
              </a>
              <div className="flex items-center gap-3 text-blue-200">
                <Clock size={16} /><span className="text-sm">Lun–Vie: 9am – 6pm EST</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Legal</h4>
            <div className="flex items-start gap-2 bg-white/5 rounded-xl p-4">
              <Shield size={16} className="text-accent flex-shrink-0 mt-0.5" />
              <p className="text-blue-200 text-xs leading-relaxed">
                Nexo Capital ofrece servicios de evaluación y gestión de préstamos.
                Los términos pueden variar según el perfil del cliente. Datos protegidos
                con cifrado SSL de 256 bits.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-blue-300 text-sm">© 2025 Nexo Capital. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="text-blue-300 hover:text-white text-sm transition-colors">Privacidad</a>
            <a href="#" className="text-blue-300 hover:text-white text-sm transition-colors">Términos</a>
            <Link to="/login" className="text-blue-300 hover:text-white text-sm transition-colors">Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
