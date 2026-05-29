function OptionCard({ label, value, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all duration-200 ${
        selected
          ? 'border-secondary bg-secondary/5 text-secondary'
          : 'border-gray-200 hover:border-gray-300 text-gray-700'
      }`}
    >
      {label}
    </button>
  )
}

const RATES = { 12: 0.01, 24: 0.01, 36: 0.01 }
const AMOUNT_MAP = { '$500 – $1,000': 750, '$1,000 – $2,000': 1500, '$2,000 – $5,000': 3500, 'Más de $5,000': 5000 }

export default function Step4({ data, update, onSubmit, onBack, loading = false, error = '' }) {
  const valid = data.montoNecesario && data.proposito.trim().length > 5

  const midAmount = AMOUNT_MAP[data.montoNecesario]

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary mb-1">Tu Préstamo</h2>
      <p className="text-gray-500 mb-6">¡Estamos casi listos! Cuéntanos sobre el préstamo que necesitas.</p>

      <div className="space-y-6">
        <div>
          <label className="label">¿Cuánto dinero necesitas?</label>
          <div className="space-y-2">
            {['$500 – $1,000', '$1,000 – $2,000', '$2,000 – $5,000', 'Más de $5,000'].map(v => (
              <OptionCard key={v} label={v} value={v} selected={data.montoNecesario === v} onClick={val => update('montoNecesario', val)} />
            ))}
          </div>
        </div>

        {midAmount && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <p className="text-primary font-semibold text-sm mb-2">Estimado de cuotas para ${midAmount.toLocaleString()}:</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(RATES).map(([months, rate]) => {
                const total = midAmount * (1 + rate)
                const monthly = (total / Number(months)).toFixed(0)
                return (
                  <div key={months} className="bg-white rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-500">{months}m</p>
                    <p className="font-bold text-primary text-sm">${monthly}<span className="text-xs font-normal">/mes</span></p>
                    <p className="text-xs text-gray-400">{rate * 100}%</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div>
          <label className="label">¿Para qué necesitas el préstamo?</label>
          <textarea
            rows={3}
            placeholder="Ej: Para cubrir gastos médicos, pagar deudas, emergencia familiar, iniciar un negocio..."
            value={data.proposito}
            onChange={e => update('proposito', e.target.value)}
            className="input-field resize-none"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

      <div className="mt-5 flex gap-3">
        <button onClick={onBack} disabled={loading} className="flex-1 py-4 rounded-xl font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition-all disabled:opacity-50">
          ← Atrás
        </button>
        <button
          onClick={onSubmit}
          disabled={!valid || loading}
          className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            valid && !loading ? 'btn-cta' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Enviando...</> : 'Enviar solicitud ✓'}
        </button>
      </div>
    </div>
  )
}
