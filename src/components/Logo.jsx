export default function Logo({ className = 'h-10 w-auto', textClass = 'text-white font-bold text-xl' }) {
  const iconSize = className.includes('h-12')
    ? 'h-12 w-12'
    : className.includes('h-14')
      ? 'h-14 w-14'
    : className.includes('h-9')
      ? 'h-9 w-9'
      : className.includes('h-8')
        ? 'h-8 w-8'
      : 'h-10 w-10'

  return (
    <div className="flex items-center gap-3">
      <div className={`${iconSize} rounded-xl bg-secondary text-white flex items-center justify-center font-black shadow-lg shadow-secondary/20`}>
        N
      </div>
      <span className={textClass}>
        <span className="text-white">Nexo </span>
        <span className="text-accent">Capital</span>
      </span>
    </div>
  )
}
