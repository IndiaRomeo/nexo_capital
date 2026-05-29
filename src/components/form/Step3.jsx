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

export default function Step3({ data, update, onNext, onBack }) {
  const valid = data.cuentaActiva && data.historialCredito && (data.cuentaActiva === 'No' || (data.ingresosEnCuenta && data.banco && data.tiempoCuenta))

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary mb-1">Perfil Bancario y Crediticio</h2>
      <p className="text-gray-500 mb-6">Información sobre tu cuenta bancaria en USA.</p>

      <div className="space-y-6">
        <div>
          <label className="label">¿Tienes cuenta bancaria activa en USA?</label>
          <div className="grid grid-cols-2 gap-3">
            {['Sí', 'No'].map(v => (
              <OptionCard key={v} label={v} value={v} selected={data.cuentaActiva === v} onClick={val => update('cuentaActiva', val)} />
            ))}
          </div>
        </div>

        {data.cuentaActiva === 'Sí' && (
          <>
            <div>
              <label className="label">¿Recibes tus ingresos en esa cuenta?</label>
              <div className="grid grid-cols-2 gap-3">
                {['Sí', 'No'].map(v => (
                  <OptionCard key={v} label={v} value={v} selected={data.ingresosEnCuenta === v} onClick={val => update('ingresosEnCuenta', val)} />
                ))}
              </div>
            </div>

            <div>
              <label className="label">¿Qué banco usas?</label>
              <input
                type="text"
                placeholder="Ej: Chase, Bank of America, Wells Fargo..."
                value={data.banco}
                onChange={e => update('banco', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">¿Cuánto tiempo llevas usando esa cuenta?</label>
              <div className="space-y-2">
                {['Menos de 3 meses', '3 a 6 meses', 'Más de 6 meses'].map(v => (
                  <OptionCard key={v} label={v} value={v} selected={data.tiempoCuenta === v} onClick={val => update('tiempoCuenta', val)} />
                ))}
              </div>
            </div>
          </>
        )}

        {data.cuentaActiva === 'No' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-800 text-sm font-medium">Una cuenta bancaria activa en USA es necesaria para recibir el préstamo. Te recomendamos abrir una cuenta antes de aplicar.</p>
          </div>
        )}

        <div>
          <label className="label">¿Tienes historial crediticio en USA?</label>
          <div className="grid grid-cols-2 gap-3">
            {['Sí', 'No'].map(v => (
              <OptionCard key={v} label={v} value={v} selected={data.historialCredito === v} onClick={val => update('historialCredito', val)} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">No te preocupes si no tienes historial crediticio, igual podemos ayudarte.</p>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button onClick={onBack} className="flex-1 py-4 rounded-xl font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition-all">
          ← Atrás
        </button>
        <button
          onClick={onNext}
          disabled={!valid}
          className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
            valid ? 'btn-cta' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}
