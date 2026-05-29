import { Target, Eye, Heart, Users } from 'lucide-react'
import useScrollReveal from '../../hooks/useScrollReveal.js'

const values = [
  { icon: Heart, title: 'Comunidad', desc: 'Nacimos para servir a la comunidad latina, entendemos sus necesidades y hablamos su idioma.' },
  { icon: Target, title: 'Misión', desc: 'Brindar acceso a financiamiento justo y transparente, eliminando barreras del idioma y la burocracia.' },
  { icon: Eye, title: 'Visión', desc: 'Ser la plataforma financiera de mayor confianza para los hispanos en Estados Unidos.' },
  { icon: Users, title: 'Equipo', desc: 'Un equipo bilingüe comprometido con tu bienestar financiero, de principio a fin.' },
]

export default function QuienesSomos() {
  const [ref, visible] = useScrollReveal()

  return (
    <section id="quienes-somos" className="py-20 bg-white" ref={ref}>
      <div className="max-w-6xl mx-auto px-4">
        <div className={`text-center mb-14 transition-all duration-700 ${visible ? 'animate-fade-up' : 'opacity-0 translate-y-8'}`}>
          <p className="text-secondary font-semibold uppercase tracking-wider text-sm mb-2">Nuestra historia</p>
          <h2 className="section-title mb-4">¿Quiénes Somos?</h2>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Nexo Capital nació de la necesidad real de nuestra comunidad. Somos un equipo de profesionales
            hispanos que entendemos los obstáculos que enfrentan los latinos al buscar financiamiento en USA.
            Por eso creamos una solución directa, honesta y en tu idioma.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-14">
          <div className={`transition-all duration-700 delay-100 ${visible ? 'animate-fade-left' : 'opacity-0 -translate-x-8'}`}>
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary to-secondary p-8 text-white h-full">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="text-6xl font-black text-accent mb-2">5+</div>
                <p className="text-xl font-bold mb-2">Años de experiencia</p>
                <p className="text-blue-200 leading-relaxed">
                  Ayudando a familias latinas a alcanzar sus metas financieras en Estados Unidos con productos
                  diseñados para su realidad.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {[['500+','Clientes'],['$2M+','Prestado'],['98%','Satisfacción'],['24h','Respuesta']].map(([v,l]) => (
                    <div key={l} className="bg-white/10 rounded-xl p-3 text-center">
                      <p className="text-2xl font-black text-accent">{v}</p>
                      <p className="text-blue-200 text-xs">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-700 delay-200 ${visible ? 'animate-fade-right' : 'opacity-0 translate-x-8'}`}>
            {values.map((v, i) => {
              const Icon = v.icon
              return (
                <div key={i} className={`card-hover border border-gray-50 delay-${(i+1)*100}`}>
                  <div className="bg-primary/10 rounded-2xl p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <Icon size={22} className="text-primary" />
                  </div>
                  <h3 className="font-bold text-primary mb-2">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
