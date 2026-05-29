import { Star, Shield, Users, Award } from 'lucide-react'

const testimonials = [
  {
    name: 'María G.',
    state: 'Texas',
    text: 'Me aprobaron rápido y sin complicaciones. Fue el proceso más fácil que he tenido para un préstamo en USA.',
    rating: 5,
    amount: '$3,000',
  },
  {
    name: 'Carlos R.',
    state: 'Florida',
    text: 'Excelente atención, todo claro desde el inicio. Sin sorpresas ni letras pequeñas. 100% recomendado.',
    rating: 5,
    amount: '$5,000',
  },
  {
    name: 'Ana L.',
    state: 'California',
    text: 'Gracias a Nexo Capital pude cubrir una emergencia familiar. El proceso fue muy rápido y profesional.',
    rating: 5,
    amount: '$2,000',
  },
]

const pillars = [
  { icon: Shield, title: 'Datos Protegidos', desc: 'SSL 256-bit. Tu información financiera siempre segura.' },
  { icon: Users, title: 'Sin Intermediarios', desc: 'Prestamistas directos. Sin comisiones ocultas.' },
  { icon: Award, title: 'Transparencia Total', desc: 'Tasas claras. Sin letras pequeñas.' },
]

export default function TrustBuilder() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-secondary font-semibold uppercase tracking-wider text-sm mb-2">Lo que dicen nuestros clientes</p>
          <h2 className="section-title">Confianza que se construye con hechos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((t, i) => (
            <div key={i} className="card hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-1 mb-4">
                {Array(t.rating).fill(0).map((_, j) => (
                  <Star key={j} size={16} className="text-accent fill-accent" />
                ))}
              </div>
              <p className="text-gray-600 italic mb-4 leading-relaxed">"{t.text}"</p>
              <div className="border-t pt-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-primary">{t.name}</p>
                  <p className="text-gray-400 text-sm">{t.state}</p>
                </div>
                <div className="bg-green-50 text-green-700 font-bold text-sm px-3 py-1 rounded-full">
                  {t.amount} aprobados
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p, i) => {
            const Icon = p.icon
            return (
              <div key={i} className="flex gap-4 items-start bg-white rounded-2xl p-6 shadow-sm">
                <div className="bg-secondary/10 rounded-xl p-3 flex-shrink-0">
                  <Icon size={24} className="text-secondary" />
                </div>
                <div>
                  <h4 className="font-bold text-primary mb-1">{p.title}</h4>
                  <p className="text-gray-500 text-sm">{p.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
