import Navbar from '../components/landing/Navbar.jsx'
import Hero from '../components/landing/Hero.jsx'
import HowItWorks from '../components/landing/HowItWorks.jsx'
import Requirements from '../components/landing/Requirements.jsx'
import TrustBuilder from '../components/landing/TrustBuilder.jsx'
import QuienesSomos from '../components/landing/QuienesSomos.jsx'
import ContactFormSection from '../components/landing/ContactFormSection.jsx'
import Footer from '../components/landing/Footer.jsx'
import WhatsAppButton from '../components/landing/WhatsAppButton.jsx'
import MultiStepForm from '../components/form/MultiStepForm.jsx'
import LoanCalculator from '../components/landing/LoanCalculator.jsx'
import { Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useSearchParams } from 'react-router-dom'
import { resolveAdminRoute } from '../config/adminRouting.js'
import { useState } from 'react'

export default function LandingPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formActive, setFormActive] = useState(false)
  const adminRoute = resolveAdminRoute(searchParams)
  const showForm = !user || formActive

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Requirements />
      <TrustBuilder />

      {/* Form section */}
      {showForm && <section id="formulario" className="pt-24 pb-28 bg-gradient-to-br from-primary via-blue-800 to-secondary relative overflow-hidden">
        {/* Top wave */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 md:h-20" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,0 L1440,0 L1440,40 C1080,80 720,0 360,40 C180,60 90,20 0,40 Z" fill="#f9fafb"/>
          </svg>
        </div>
        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 md:h-20" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,80 L1440,80 L1440,40 C1080,0 720,80 360,40 C180,20 90,60 0,40 Z" fill="white"/>
          </svg>
        </div>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize:'32px 32px'}}></div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold uppercase tracking-wider text-sm mb-2">Solicitud en línea</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Aplicar es fácil y rápido</h2>
            <p className="text-blue-200 max-w-xl mx-auto">Completa el formulario en menos de 2 minutos. 100% en español, 100% seguro.</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Shield size={14} className="text-accent"/>
              <span className="text-blue-300 text-sm">Datos protegidos con encriptación SSL</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-10 items-start">
            <div className="lg:col-span-3">
              <MultiStepForm
                assignedAdminId={adminRoute.id}
                adminRoute={adminRoute}
                onSubmissionStart={() => setFormActive(true)}
                onSubmitted={() => setFormActive(true)}
              />
            </div>
            <div className="hidden lg:block lg:col-span-2">
              <div className="animate-float">
                <LoanCalculator />
              </div>
            </div>
          </div>
        </div>
      </section>}

      <QuienesSomos />
      <ContactFormSection adminRoute={adminRoute} />
      <Footer adminRoute={adminRoute} />
      <WhatsAppButton adminRoute={adminRoute} />
    </div>
  )
}
