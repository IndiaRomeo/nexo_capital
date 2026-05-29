import { X, FileText, Printer } from 'lucide-react'

function buildContractHTML({ clientName, clientEmail, amount, term, rate, monthly, total, disbursementDate, signDate, numero }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Contrato de Crédito - ${clientName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #1a1a1a; background: white; padding: 40px 60px; line-height: 1.7; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #0B1F33; }
    .logo-text { font-size: 28pt; font-weight: 900; }
    .logo-il { color: #0B1F33; }
    .logo-an { color: #16D5B5; }
    .logo-sub { font-size: 9pt; color: #666; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px; }
    .contract-number { font-size: 9pt; color: #999; margin-top: 6px; }
    h1 { font-size: 16pt; text-align: center; text-transform: uppercase; letter-spacing: 2px; margin: 30px 0 20px; color: #0B1F33; border-bottom: 1px solid #0B1F33; padding-bottom: 8px; }
    h2 { font-size: 12pt; text-transform: uppercase; letter-spacing: 1px; color: #0B1F33; margin: 24px 0 8px; }
    p { margin-bottom: 10px; text-align: justify; }
    .parties { background: #F8FAFC; border-left: 4px solid #0B1F33; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .conditions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
    .condition-item { background: #F8FAFC; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
    .condition-label { font-size: 9pt; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .condition-value { font-size: 13pt; font-weight: bold; color: #0B1F33; }
    .highlight { background: #0B1F33; color: white; padding: 16px 20px; border-radius: 8px; margin: 20px 0; }
    .highlight .label { font-size: 9pt; opacity: 0.8; margin-bottom: 4px; }
    .highlight .value { font-size: 16pt; font-weight: 900; }
    .alert-box { background: #ECFDF5; border: 1px solid #16D5B5; border-radius: 8px; padding: 14px 18px; margin: 16px 0; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 60px; }
    .sig-block { text-align: center; }
    .sig-line { border-top: 1px solid #1a1a1a; margin-bottom: 8px; width: 100%; }
    .sig-name { font-weight: bold; font-size: 11pt; }
    .sig-role { font-size: 9pt; color: #666; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 2px solid #0B1F33; text-align: center; font-size: 8pt; color: #999; }
    @media print {
      body { padding: 20px 40px; }
      @page { margin: 1.5cm; size: Letter; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-text">
      <span class="logo-il">Nexo </span><span class="logo-an">Capital</span>
    </div>
    <div class="logo-sub">Servicios Financieros</div>
    ${numero ? `<div class="contract-number">Préstamo No. ${numero}</div>` : ''}
  </div>

  <h1>Contrato de Crédito Personal</h1>

  <div class="parties">
    <p><strong>Entre:</strong> Nexo Capital, en calidad de entidad financiera prestamista,</p>
    <p><strong>y el cliente:</strong> ${clientName}${clientEmail ? ` &lt;${clientEmail}&gt;` : ''}.</p>
  </div>

  <p><strong>Objeto del contrato:</strong> El presente contrato tiene como objeto formalizar la solicitud y aprobación del crédito personal solicitado por el cliente, bajo las condiciones establecidas a continuación.</p>

  <h2>Condiciones del Crédito</h2>

  <div class="conditions-grid">
    <div class="condition-item">
      <div class="condition-label">Monto del préstamo</div>
      <div class="condition-value">$${amount} USD</div>
    </div>
    <div class="condition-item">
      <div class="condition-label">Plazo de pago</div>
      <div class="condition-value">${term} meses</div>
    </div>
    <div class="condition-item">
      <div class="condition-label">Tasa de interés anual</div>
      <div class="condition-value">${rate}%</div>
    </div>
    <div class="condition-item">
      <div class="condition-label">Cuota mensual</div>
      <div class="condition-value">$${monthly} USD</div>
    </div>
  </div>

  <div class="highlight">
    <div class="label">Monto total a pagar</div>
    <div class="value">$${total} USD</div>
  </div>

  <p>El monto total de <strong>$${total} USD</strong> será cancelado mes a mes en cuotas de <strong>$${monthly} USD</strong> durante <strong>${term} meses</strong>.</p>

  <hr class="divider">

  <h2>Forma y Condiciones de Pago</h2>

  <p><strong>Forma de pago:</strong> Los pagos se realizarán mediante envíos a través de Western Union.</p>
  <p><strong>Destino de pagos:</strong> Los pagos deberán ser enviados a Colombia, al beneficiario que le proporcionaremos.</p>
  <p><strong>Fecha de desembolso:</strong> El desembolso del crédito se realizará directamente a su cuenta bancaria el día <strong>${disbursementDate}</strong>.</p>
  <p><strong>Fecha de pago mensual:</strong> Los pagos deberán realizarse el <strong>15 de cada mes</strong>, con un plazo máximo de 3 días posteriores para cumplir con la fecha límite de pago.</p>

  <hr class="divider">

  <h2>Condiciones Adicionales</h2>

  <div class="alert-box">
    <p><strong>Incumplimiento de pago:</strong> En caso de incumplir con el pago de alguna cuota, se procederá a reportar el incumplimiento a las centrales de riesgo crediticio. Este reporte puede afectar su historial y su capacidad para acceder a futuros créditos.</p>
  </div>

  <h2>Declaraciones del Cliente</h2>

  <p>El cliente, <strong>${clientName}</strong>, declara haber recibido la información completa y clara sobre las condiciones del crédito y acepta las condiciones mencionadas en este contrato.</p>

  <p>El cliente se compromete a realizar los pagos mensuales de acuerdo con lo estipulado en este contrato, mediante los envíos a través de Western Union, según las instrucciones proporcionadas por Nexo Capital.</p>

  <div class="signatures">
    <div class="sig-block">
      <br><br>
      <div class="sig-line"></div>
      <div class="sig-name">Representante Nexo Capital</div>
      <div class="sig-role">Asesor(a) Financiero(a)</div>
      <div class="sig-role">Nexo Capital</div>
      <div class="sig-role">Fecha: ${signDate}</div>
    </div>
    <div class="sig-block">
      <br><br>
      <div class="sig-line"></div>
      <div class="sig-name">${clientName}</div>
      <div class="sig-role">Cliente</div>
      <div class="sig-role">Fecha: ${signDate}</div>
    </div>
  </div>

  <div class="footer">
    <p>Nexo Capital · Servicios Financieros · Este documento es un contrato legalmente vinculante.</p>
    <p>Generado el ${signDate}</p>
  </div>
</body>
</html>`
}

export default function ContractModal({ clientName, clientEmail, loan, onClose }) {
  const fmt = (n) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const fmtDate = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'
  const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })

  const amount   = fmt(loan?.monto)
  const monthly  = fmt(loan?.cuota_mensual)
  const total    = fmt(loan?.total_pagar)
  const term     = loan?.plazo_meses || 12
  const rate     = loan ? Math.round(loan.tasa_interes * 100) : 4
  const disbDate = fmtDate(loan?.fecha_inicio)
  const numero   = loan?.numero_prestamo || ''

  function printContract() {
    const html = buildContractHTML({ clientName, clientEmail, amount, term, rate, monthly, total, disbursementDate: disbDate, signDate: today, numero })
    const win = window.open('', '_blank', 'width=900,height=750')
    win.document.write(html)
    win.document.close()
    setTimeout(() => { win.focus(); win.print() }, 600)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-lg p-2"><FileText size={18} className="text-white"/></div>
            <div>
              <h2 className="text-white font-bold text-base">Contrato de Crédito Personal</h2>
              <p className="text-blue-200 text-xs">{clientName}{numero && ` · ${numero}`}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={printContract}
              className="flex items-center gap-2 bg-accent hover:bg-green-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
            >
              <Printer size={15}/> Descargar / Imprimir
            </button>
            <button onClick={onClose} className="text-white/70 hover:text-white ml-1"><X size={20}/></button>
          </div>
        </div>

        {/* Contract Preview */}
        <div className="overflow-y-auto flex-1 p-6 bg-gray-50">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-xl mx-auto" style={{ fontFamily: 'Georgia, serif' }}>

            {/* Logo */}
            <div className="text-center mb-8 pb-5 border-b-2 border-primary">
              <div className="text-2xl font-black">
                <span className="text-primary">Nexo </span>
                <span className="text-accent">Capital</span>
              </div>
              <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">Servicios Financieros</p>
              {numero && <p className="text-xs text-gray-400 mt-1">Préstamo No. {numero}</p>}
            </div>

            <h1 className="text-center text-sm font-bold text-primary uppercase tracking-wider mb-6 underline">
              Contrato de Crédito Personal
            </h1>

            <div className="bg-blue-50 border-l-4 border-primary rounded-r-lg p-4 mb-5 text-sm">
              <p><strong>Entre:</strong> Nexo Capital, en calidad de entidad financiera prestamista,</p>
              <p className="mt-1"><strong>y el cliente:</strong> {clientName}{clientEmail && <span className="text-gray-500"> &lt;{clientEmail}&gt;</span>}.</p>
            </div>

            <p className="text-sm mb-5 leading-relaxed">
              <strong>Objeto del contrato:</strong> El presente contrato tiene como objeto formalizar la solicitud y aprobación del crédito personal solicitado por el cliente, bajo las condiciones establecidas a continuación.
            </p>

            <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Condiciones del Crédito</h2>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                ['Monto del préstamo', `$${amount} USD`],
                ['Plazo de pago', `${term} meses`],
                ['Tasa de interés anual', `${rate}%`],
                ['Cuota mensual', `$${monthly} USD`],
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="font-bold text-primary text-sm">{value}</p>
                </div>
              ))}
            </div>

            <div className="bg-primary rounded-xl p-4 text-white text-center mb-5">
              <p className="text-xs opacity-75 mb-1">Monto total a pagar</p>
              <p className="text-2xl font-black">${total} USD</p>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-4">
              <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Forma y Condiciones de Pago</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Forma de pago:</strong> Envíos a través de Western Union.</p>
                <p><strong>Destino:</strong> Colombia, al beneficiario que le proporcionaremos.</p>
                <p><strong>Fecha de desembolso:</strong> {disbDate}.</p>
                <p><strong>Pago mensual:</strong> El 15 de cada mes, con plazo máximo de 3 días.</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-xs font-bold text-green-800 mb-1">Incumplimiento de pago</p>
              <p className="text-xs text-green-700">En caso de incumplir con el pago de alguna cuota, se procederá a reportar el incumplimiento a las centrales de riesgo crediticio.</p>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6">
              <p className="text-sm leading-relaxed">
                El cliente, <strong>{clientName}</strong>, declara haber recibido la información completa y clara sobre las condiciones del crédito y acepta las condiciones mencionadas en este contrato. El cliente se compromete a realizar los pagos mensuales de acuerdo con lo estipulado, mediante envíos a través de Western Union.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-10 pt-4">
              <div className="text-center">
                <div className="border-t border-gray-800 pt-2">
                  <p className="text-xs font-bold">Nexo Capital</p>
                  <p className="text-xs text-gray-500">Asesor(a) Financiero(a)</p>
                  <p className="text-xs text-gray-400">{today}</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-800 pt-2">
                  <p className="text-xs font-bold">{clientName}</p>
                  <p className="text-xs text-gray-500">Cliente</p>
                  <p className="text-xs text-gray-400">{today}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t-2 border-primary text-center">
              <p className="text-xs text-gray-400">Nexo Capital · Servicios Financieros</p>
              <p className="text-xs text-gray-300">Generado el {today}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
