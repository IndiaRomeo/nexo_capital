import { TrendingDown, Calendar, Hash } from 'lucide-react'

export default function LoanCard({ loan }) {
  const paid = loan.monto - loan.saldo_pendiente
  const pct = Math.round((paid / loan.monto) * 100)
  const estadoColors = {
    activo:     'bg-green-100 text-green-700',
    en_proceso: 'bg-green-100 text-green-700',
    pagado:     'bg-blue-100 text-blue-700',
    rechazado:  'bg-red-100 text-red-700',
  }

  return (
    <div className="card-hover border border-gray-50 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400 flex items-center gap-1 mb-1"><Hash size={11}/>{loan.numero_prestamo}</p>
          <p className="text-3xl font-black text-primary">${loan.monto?.toLocaleString()}</p>
          <p className="text-sm text-gray-400">Préstamo total</p>
        </div>
        <span className={`badge ${estadoColors[loan.estado] || 'bg-gray-100 text-gray-600'} uppercase`}>
          {loan.estado}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Pagado: ${paid.toLocaleString()}</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-secondary to-primary h-2.5 rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, animation: 'progressBar 1.2s ease both' }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Pagado</span>
          <span>Pendiente: ${loan.saldo_pendiente?.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-50 rounded-xl p-2.5 text-center">
          <p className="text-xs text-gray-400 mb-1 leading-tight">Cuota mensual</p>
          <p className="font-black text-primary text-sm">${loan.cuota_mensual?.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5 text-center">
          <p className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-0.5"><TrendingDown size={10}/>Tasa</p>
          <p className="font-black text-primary text-sm">{(loan.tasa_interes * 100).toFixed(0)}%</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5 text-center">
          <p className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-0.5"><Calendar size={10}/>Plazo</p>
          <p className="font-black text-primary text-sm">{loan.plazo_meses}m</p>
        </div>
      </div>

      {loan.fecha_vencimiento && (
        <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
          <Calendar size={11}/>Fecha de vencimiento: {new Date(loan.fecha_vencimiento).toLocaleDateString('es-US', { year:'numeric', month:'long', day:'numeric' })}
        </p>
      )}
    </div>
  )
}
