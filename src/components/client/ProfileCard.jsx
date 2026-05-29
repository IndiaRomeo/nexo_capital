import { Wifi, CreditCard } from 'lucide-react'

function formatAccount(num = '') {
  const clean = num.replace(/[^A-Z0-9]/gi, '').toUpperCase().padEnd(12, '0')
  return `${clean.slice(0,4)} ${clean.slice(4,8)} ${clean.slice(8,12)}`
}

export default function ProfileCard({ profile, loan, holderName }) {
  const hasLoan = loan && loan.estado === 'activo'
  const displayName = profile?.nombre || holderName || profile?.email || 'Cliente'

  return (
    <div className="w-full max-w-sm animate-card-flip">
      <div className="credit-card w-full aspect-[1.6/1] p-6 flex flex-col justify-between text-white relative select-none">
        {/* Top row */}
        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-blue-200 text-xs font-medium uppercase tracking-widest">Nexo Capital</p>
            <p className="text-white font-bold text-sm mt-0.5">Cuenta de Crédito</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Wifi size={20} className="text-blue-300 rotate-90" />
            {hasLoan && (
              <span className="badge bg-green-500/20 text-green-300 border border-green-500/30 text-xs">ACTIVO</span>
            )}
            {!hasLoan && (
              <span className="badge bg-green-500/20 text-accent border border-green-500/30 text-xs">PENDIENTE</span>
            )}
          </div>
        </div>

        {/* Chip + number */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-7 rounded-md border border-green-400/60" style={{background:'linear-gradient(135deg,#16D5B5,#7DF3DC)'}}>
              <div className="w-full h-1/2 border-b border-green-300/40 rounded-t-md"></div>
            </div>
            <Wifi size={14} className="text-blue-300" />
          </div>
          <p className="font-mono text-lg tracking-[0.2em] font-bold text-white/95">
            {formatAccount(profile?.numero_cuenta)}
          </p>
        </div>

        {/* Bottom */}
        <div className="flex items-end justify-between relative z-10">
          <div>
            <p className="text-blue-300 text-xs uppercase tracking-widest mb-1">Titular</p>
            <p className="font-bold text-white uppercase tracking-wide text-sm">
              {displayName}
            </p>
          </div>
          <div className="text-right">
            {hasLoan ? (
              <>
                <p className="text-blue-300 text-xs uppercase tracking-widest mb-1">Saldo pendiente</p>
                <p className="text-accent font-black text-xl">${loan.saldo_pendiente?.toLocaleString()}</p>
              </>
            ) : (
              <>
                <p className="text-blue-300 text-xs uppercase tracking-widest mb-1">Estado</p>
                <p className="text-accent font-bold text-sm">En revisión</p>
              </>
            )}
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute right-4 bottom-4 opacity-30 z-0">
          <div className="w-16 h-16 rounded-full border-4 border-accent/60"></div>
          <div className="w-16 h-16 rounded-full border-4 border-white/20 absolute top-0 right-5"></div>
        </div>
      </div>

      {/* Info below card */}
      {hasLoan && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-center w-full max-w-sm">
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <p className="text-xs text-gray-400">Cuota mensual</p>
            <p className="font-black text-primary text-sm">${loan.cuota_mensual?.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <p className="text-xs text-gray-400">Plazo</p>
            <p className="font-black text-primary text-sm">{loan.plazo_meses} meses</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <p className="text-xs text-gray-400">Tasa</p>
            <p className="font-black text-primary text-sm">{(loan.tasa_interes * 100).toFixed(0)}%</p>
          </div>
        </div>
      )}
    </div>
  )
}
