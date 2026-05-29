import { useState, useEffect } from 'react'
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from '../Logo.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, isAdmin, signOut } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100' : 'bg-white shadow-sm border-b border-gray-100'}`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex-shrink-0">
          <Logo className="h-10 w-auto" textClass="text-primary font-bold text-xl" />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <a href="#como-funciona" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">¿Cómo funciona?</a>
          <a href="#requisitos" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Requisitos</a>
          <a href="#quienes-somos" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Quiénes Somos</a>
          <a href="#contacto" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Contacto</a>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium px-4 py-2 rounded-lg transition-all"
              >
                <LayoutDashboard size={14} />
                {isAdmin ? 'Admin' : 'Mi Cuenta'}
              </Link>
              <button onClick={signOut} className="text-gray-400 hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="flex items-center gap-1.5 text-gray-600 hover:text-primary text-sm font-medium transition-colors">
                <User size={14} /> Iniciar sesión
              </Link>
              <a href="#formulario" className="btn-cta text-sm py-2.5 px-5">Aplicar ahora</a>
            </div>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-primary p-1">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-5 flex flex-col gap-4 animate-fade-up">
          {['#como-funciona:¿Cómo funciona?','#requisitos:Requisitos','#quienes-somos:Quiénes Somos','#contacto:Contacto'].map(item => {
            const [href, label] = item.split(':')
            return <a key={href} href={href} onClick={() => setOpen(false)} className="text-gray-600 font-medium">{label}</a>
          })}
          {user ? (
            <>
              <Link to={isAdmin ? '/admin' : '/dashboard'} onClick={() => setOpen(false)} className="text-primary font-medium flex items-center gap-2"><LayoutDashboard size={14}/>{isAdmin ? 'Admin Panel' : 'Mi Cuenta'}</Link>
              <button onClick={() => { signOut(); setOpen(false) }} className="text-left text-red-500 font-medium flex items-center gap-2"><LogOut size={14}/> Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="text-gray-600 font-medium flex items-center gap-2"><User size={14}/> Iniciar sesión</Link>
              <a href="#formulario" onClick={() => setOpen(false)} className="btn-cta text-center">Aplicar ahora</a>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
