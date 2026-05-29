import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, Lock, LogIn } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from '../components/Logo.jsx'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const { user, isAdmin, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) navigate(isAdmin ? '/admin' : '/dashboard', { replace: true })
  }, [user, isAdmin, loading, navigate])

  async function handleLogin(e) {
    e.preventDefault()
    if (!email || !password) return
    setStatus('sending')
    setError('')

    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (err) {
      setError('Correo o contrasena incorrectos. Verifica los datos e intenta nuevamente.')
      setStatus('error')
    } else {
      setStatus('idle')
    }
  }

  return (
    <div className="min-h-screen bg-animated-gradient flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-10 right-10 w-72 h-72 bg-accent/15 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-secondary/25 rounded-full blur-3xl animate-blob delay-300"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-up">
          <Link to="/" className="inline-block mb-6">
            <Logo className="h-14 w-auto mx-auto" />
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Portal Nexo Capital</h1>
          <p className="text-blue-200">Ingresa con tu correo y contrasena</p>
        </div>

        <div className="card shadow-2xl animate-scale-in delay-100">
          <form onSubmit={handleLogin}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <LogIn size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-primary text-lg">Iniciar sesion</h2>
                <p className="text-xs text-gray-400">Clientes y administradores</p>
              </div>
            </div>

            <div className="space-y-4 mb-5">
              <div>
                <label className="label"><Mail size={13} className="inline mr-1" />Correo electronico</label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field"
                  required
                  autoFocus
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label mb-0"><Lock size={13} className="inline mr-1" />Contrasena</label>
                  <Link to="/forgot-password" className="text-xs text-secondary hover:text-primary transition-colors font-medium">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <input
                  type="password"
                  placeholder="Tu contrasena"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!email || !password || status === 'sending'}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                email && password && status !== 'sending' ? 'btn-cta' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {status === 'sending' ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Ingresando...</>
              ) : (
                <>Ingresar</>
              )}
            </button>

            <div className="mt-6 text-center text-sm text-gray-400">
              Aun no tienes cuenta?{' '}
              <a href="/#formulario" className="text-secondary font-semibold hover:text-primary transition-colors">
                Solicita tu prestamo aqui
              </a>
            </div>
          </form>
        </div>

        <div className="text-center mt-6 animate-fade-up delay-300">
          <Link to="/" className="flex items-center justify-center gap-2 text-blue-200 hover:text-white transition-colors text-sm">
            <ArrowLeft size={14} /> Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
