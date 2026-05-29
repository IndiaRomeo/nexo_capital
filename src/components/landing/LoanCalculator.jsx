import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const DISPLAY_RATES = { 12: 0.01, 24: 0.01, 36: 0.01 }
const CALC_RATES = { 12: 0.01, 24: 0.01, 36: 0.01 }

export default function LoanCalculator() {
  const [amount, setAmount] = useState(3000)
  const [term, setTerm] = useState(12)
  const { user } = useAuth()

  const displayRate = DISPLAY_RATES[term]
  const calcRate = CALC_RATES[term]
  const years = term / 12
  const totalInterest = amount * calcRate * years
  const monthly = ((amount + totalInterest) / term).toFixed(2)
  const total = (amount + totalInterest).toFixed(2)

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-white">
      <h3 className="text-xl font-bold mb-1">Calculadora de Prestamo</h3>
      <p className="text-blue-200 text-sm mb-5">Desliza para ver tu cuota estimada</p>

      <div className="mb-5">
        <div className="flex justify-between mb-2">
          <label className="text-sm font-semibold text-blue-100">Monto</label>
          <span className="text-accent font-black text-lg">${amount.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={500}
          max={50000}
          step={500}
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="w-full h-2 bg-blue-800 rounded-full appearance-none cursor-pointer accent-secondary"
        />
        <div className="flex justify-between text-xs text-blue-300 mt-1">
          <span>$500</span><span>$50,000</span>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm font-semibold text-blue-100 mb-2 block">Plazo</label>
        <div className="grid grid-cols-3 gap-2">
          {[12, 24, 36].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTerm(t)}
              className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                term === t ? 'bg-accent text-white' : 'bg-white/10 hover:bg-white/20 text-blue-100'
              }`}
            >
              {t} meses
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/10 rounded-xl p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-blue-200 text-sm">Cuota mensual</span>
          <span className="font-black text-accent text-xl">${monthly}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-blue-200">Total a pagar</span>
          <span className="text-white font-semibold">${total}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-blue-200">Tasa de interes</span>
          <span className="text-white font-semibold">{displayRate * 100}% anual</span>
        </div>
      </div>

      {user ? (
        <Link to="/dashboard" className="btn-cta w-full text-center block mt-4">
          Solicitar este prestamo
        </Link>
      ) : (
        <a href="#formulario" className="btn-cta w-full text-center block mt-4">
          Solicitar este prestamo
        </a>
      )}
    </div>
  )
}
