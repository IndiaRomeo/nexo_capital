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

  const linkClass = scrolled
    ? 'text-gray-600 hover:text-primary'
    : 'text-white/90 hover:text-white'

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex-shrink-0">
          <Logo className="h-10 w-auto" textClass={`font-bold text-xl ${scrolled ? 'text-primary' : 'text-white'}`} />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <a href="#como-funciona" className={`${linkClass} transition-colors text-sm font-medium`}>¿Cómo funciona?</a>
          <a href="#requisitos" className={`${linkClass} transition-colors text-sm font-medium`}>Requisitos</a>
          <a href="#quienes-somos" className={`${linkClass} transition-colors text-sm font-medium`}>Quiénes Somos</a>
          <a href="#contacto" className={`${linkClass} transition-colors text-sm font-medium`}>Contacto</a>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all ${scrolled ? 'bg-primary/10 hover:bg-primary/20 text-primary' : 'bg-white/20 hover:bg-white/30 text-white'}`}
              >
                <LayoutDashboard size={14} />
                {isAdmin ? 'Admin' : 'Mi Cuenta'}
              </Link>
              <button onClick={signOut} className={`transition-colors ${scrolled ? 'text-gray-400 hover:text-red-500' : 'text-white/70 hover:text-white'}`}>
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${linkClass}`}>
                <User size={14} /> Iniciar sesión
              </Link>
              <a href="#formulario" className="btn-cta text-sm py-2.5 px-5">Aplicar ahora</a>
            </div>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className={`md:hidden p-1 transition-colors ${scrolled ? 'text-primary' : 'text-white'}`}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className={`md:hidden border-t px-4 py-5 flex flex-col gap-4 animate-fade-up ${scrolled ? 'bg-white border-gray-100' : 'bg-primary/95 backdrop-blur-md border-white/10'}`}>
          {['#como-funciona:¿Cómo funciona?','#requisitos:Requisitos','#quienes-somos:Quiénes Somos','#contacto:Contacto'].map(item => {
            const [href, label] = item.split(':')
            return <a key={href} href={href} onClick={() => setOpen(false)} className={`font-medium ${scrolled ? 'text-gray-600' : 'text-white/90'}`}>{label}</a>
          })}
          {user ? (
            <>
              <Link to={isAdmin ? '/admin' : '/dashboard'} onClick={() => setOpen(false)} className={`font-medium flex items-center gap-2 ${scrolled ? 'text-primary' : 'text-white'}`}><LayoutDashboard size={14}/>{isAdmin ? 'Admin Panel' : 'Mi Cuenta'}</Link>
              <button onClick={() => { signOut(); setOpen(false) }} className="text-left text-red-400 font-medium flex items-center gap-2"><LogOut size={14}/> Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className={`font-medium flex items-center gap-2 ${scrolled ? 'text-gray-600' : 'text-white/90'}`}><User size={14}/> Iniciar sesión</Link>
              <a href="#formulario" onClick={() => setOpen(false)} className="btn-cta text-center">Aplicar ahora</a>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
