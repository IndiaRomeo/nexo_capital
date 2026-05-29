import { Phone, Calendar, DollarSign } from 'lucide-react'

const PIPELINE_STAGES = [
  { id: 'nuevo',        label: 'Nuevo Lead',   color: 'bg-blue-100 text-blue-800',    dot: 'bg-blue-500' },
  { id: 'llamada1',     label: 'Llamada 1',    color: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
  { id: 'documentos',   label: 'Documentos',   color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
  { id: 'llamada2',     label: 'Llamada 2',    color: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500' },
  { id: 'desembolsado', label: 'Desembolsado', color: 'bg-green-100 text-green-800',   dot: 'bg-green-500' },
]

function LeadCard({ lead, onClick, stageInfo }) {
  return (
    <div
      onClick={() => onClick(lead)}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-bold text-gray-800">{lead.nombre}</p>
          <p className="text-xs text-gray-400">{lead.estado_residencia || lead.estado}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stageInfo.color}`}>
          {stageInfo.label}
        </span>
      </div>

      <div className="space-y-1.5 mt-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Phone size={12}/><span>{lead.telefono}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <DollarSign size={12}/><span>{lead.monto_necesario}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar size={12}/><span>{lead.created_at ? new Date(lead.created_at).toLocaleDateString('es-US') : ''}</span>
        </div>
      </div>

      {lead.notas && (
        <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2 border-l-2 border-secondary truncate">
          {lead.notas}
        </p>
      )}
    </div>
  )
}

export default function KanbanBoard({ leads, onLeadClick }) {
  return (
    <div className="overflow-x-auto pb-4 -mx-1 px-1">
      <p className="text-xs text-gray-400 mb-2 md:hidden">← Desliza para ver todas las etapas →</p>
      <div className="flex gap-4 min-w-max">
        {PIPELINE_STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.stage === stage.id)
          return (
            <div key={stage.id} className="w-72 flex-shrink-0">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className={`w-2.5 h-2.5 rounded-full ${stage.dot}`}></div>
                <h3 className="font-bold text-gray-700 text-sm">{stage.label}</h3>
                <span className="ml-auto bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{stageLeads.length}</span>
              </div>
              <div className={`min-h-40 rounded-xl p-3 space-y-3 ${stageLeads.length ? 'bg-gray-50' : 'bg-gray-50/50 border-2 border-dashed border-gray-200'}`}>
                {stageLeads.length === 0 && (
                  <p className="text-center text-gray-400 text-xs pt-8">Sin leads aquí</p>
                )}
                {stageLeads.map(lead => (
                  <LeadCard key={lead.id} lead={lead} onClick={onLeadClick} stageInfo={stage}/>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
