import { useEffect, useRef, useState } from 'react'

/** Anima um número até o alvo (easing de telégrafo mecânico). */
export function useAnimatedNumber(target, duration = 650) {
  const [value, setValue] = useState(target)
  const from = useRef(target)
  useEffect(() => {
    const start = performance.now()
    const a = from.current
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const v = a + (target - a) * eased
      setValue(v)
      from.current = v
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

/**
 * Telegraph Dial — medidor circular de confiança (DESIGN.md §7):
 * marcas mecânicas, arco de latão/oxide, ponteiro dourado e escore em Garamond no núcleo.
 */
export default function Gauge({ probability, size = 220, compact = false }) {
  const p = useAnimatedNumber(probability)
  const pct = Math.round(p * 100)
  const danger = probability < 0.35
  const color = danger ? '#FFB3B0' : probability < 0.55 ? '#E9C176' : '#C5A059'

  const c = 110
  const r = 84
  const sweep = 270 // arco de 270°, abertura na base
  const startAngle = 135
  const polar = (angle, radius) => {
    const rad = (angle * Math.PI) / 180
    return [c + radius * Math.cos(rad), c + radius * Math.sin(rad)]
  }
  const arc = (from, to, radius) => {
    const [x1, y1] = polar(from, radius)
    const [x2, y2] = polar(to, radius)
    const large = to - from > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`
  }
  const end = startAngle + sweep * Math.max(0.001, p)
  const ticks = Array.from({ length: 28 }, (_, i) => i)
  const needle = polar(end, r - 22)

  return (
    <div className="relative mx-auto" style={{ width: size, maxWidth: '100%' }}>
      <svg viewBox="0 0 220 220" className="block h-auto w-full" role="img" aria-label={`Probabilidade de sobrevivência: ${Math.round(probability * 100)}%`}>
        <defs>
          <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#E9C176" />
            <stop offset="1" stopColor="#9E7B35" />
          </linearGradient>
          <radialGradient id="dialCore" cx="50%" cy="45%" r="60%">
            <stop offset="0" stopColor="#1B2B40" />
            <stop offset="1" stopColor="#0F1C2C" />
          </radialGradient>
        </defs>
        {/* Moldura */}
        <circle cx={c} cy={c} r={106} fill="none" stroke="rgba(197,160,89,0.18)" />
        <circle cx={c} cy={c} r={70} fill="url(#dialCore)" stroke="rgba(197,160,89,0.22)" />
        {/* Marcas mecânicas */}
        {ticks.map((i) => {
          const a = startAngle + (sweep / (ticks.length - 1)) * i
          const major = i % 3 === 0
          const [x1, y1] = polar(a, 100)
          const [x2, y2] = polar(a, major ? 93 : 96.5)
          const lit = (i / (ticks.length - 1)) <= p
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={lit ? color : 'rgba(197,160,89,0.3)'} strokeWidth={major ? 1.6 : 1} />
        })}
        {/* Trilho e arco */}
        <path d={arc(startAngle, startAngle + sweep, r)} fill="none" stroke="#283646" strokeWidth="9" strokeLinecap="butt" />
        <path d={arc(startAngle, end, r)} fill="none" stroke={danger ? color : 'url(#brass)'} strokeWidth="9" strokeLinecap="butt" />
        {/* Ponteiro */}
        <circle cx={needle[0]} cy={needle[1]} r="3.2" fill={color} stroke="#0A131E" strokeWidth="1" />
        {/* Escala */}
        {!compact && (
          <>
            <text x={polar(startAngle, 70)[0] - 6} y={polar(startAngle, 70)[1] + 26} fill="#6F7D8E" fontSize="8" fontFamily="Manrope" fontWeight="700" letterSpacing="1">0</text>
            <text x={polar(startAngle + sweep, 70)[0] - 6} y={polar(startAngle + sweep, 70)[1] + 26} fill="#6F7D8E" fontSize="8" fontFamily="Manrope" fontWeight="700" letterSpacing="1">100</text>
          </>
        )}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular font-serif leading-none" style={{ color, fontSize: size * 0.24 }}>
          {pct}
          <span style={{ fontSize: size * 0.13 }}>%</span>
        </span>
        <span className="mt-1.5 text-label-sm uppercase text-cream">Probabilidade</span>
      </div>
    </div>
  )
}
