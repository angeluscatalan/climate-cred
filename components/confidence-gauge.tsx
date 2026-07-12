type Props = {
  /** 0–100 */
  value: number
  color: string
}

/**
 * Semicircular barometer-style instrument dial.
 * 180° sweep from left (0) to right (100), with tick marks and a needle.
 */
export function ConfidenceGauge({ value, color }: Props) {
  const cx = 110
  const cy = 110
  const r = 86
  const clamped = Math.max(0, Math.min(100, value))

  // angle: 180° (left) at 0 → 0° (right) at 100
  const toXY = (pct: number, radius: number) => {
    const angle = Math.PI - (pct / 100) * Math.PI
    return {
      x: cx + radius * Math.cos(angle),
      y: cy - radius * Math.sin(angle),
    }
  }

  const needle = toXY(clamped, r - 14)
  const ticks = Array.from({ length: 11 }, (_, i) => i * 10)

  return (
    <svg
      viewBox="0 0 220 138"
      className="h-auto w-full max-w-[240px] animate-pulse-slow"
      role="img"
      aria-label={`Confidence ${clamped} percent`}
      id='confidence-gauge'
    >
      {/* outer arc */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="var(--ink)"
        strokeWidth={1.5}
      />
      {/* inner arc */}
      <path
        d={`M ${cx - (r - 28)} ${cy} A ${r - 28} ${r - 28} 0 0 1 ${cx + (r - 28)} ${cy}`}
        fill="none"
        stroke="var(--hairline)"
        strokeWidth={1}
      />
      {/* ticks */}
      {ticks.map((t) => {
        const isMajor = t % 50 === 0
        const outer = toXY(t, r)
        const inner = toXY(t, r - (isMajor ? 16 : 9))
        return (
          <line
            key={t}
            x1={outer.x}
            y1={outer.y}
            x2={inner.x}
            y2={inner.y}
            stroke="var(--ink)"
            strokeWidth={isMajor ? 1.6 : 0.9}
            opacity={isMajor ? 0.9 : 0.55}
          />
        )
      })}
      {/* needle */}
      <line
        x1={cx}
        y1={cy}
        x2={needle.x}
        y2={needle.y}
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={5} fill="var(--ink)" />
      <circle cx={cx} cy={cy} r={5} fill="none" stroke={color} strokeWidth={1.2} />

      {/* readout */}
      <text
        x={cx}
        y={cy - 30}
        textAnchor="middle"
        className="font-mono"
        fontSize="22"
        fill="var(--ink)"
        fontWeight={600}
      >
        {clamped}%
      </text>
      {/* scale labels */}
      <text x={cx - r} y={cy + 14} textAnchor="middle" className="font-mono" fontSize="8" fill="var(--ink-muted)">
        0
      </text>
      <text x={cx + r} y={cy + 14} textAnchor="middle" className="font-mono" fontSize="8" fill="var(--ink-muted)">
        100
      </text>
    </svg>
  )
}
