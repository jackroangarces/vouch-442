import React from 'react'

type Props = {
  values?: number[]
  size?: number
  onChange?: (next: number[]) => void
  onRelease?: (final: number[]) => void
}

export default function PolarChart({ values, size = 260, onChange, onRelease }: Props) {
  const max = 5
  const axes = ['Food','Ambience','Service','Price','Sustainability','Location']
  const interactive = typeof onChange === 'function'

  const baseVals = React.useMemo(() => {
    const v = values && values.length === 6 ? values : [0,0,0,0,0,0]
    return v.map((n) => {
      const x = Number.isFinite(n) ? Math.round(n) : 0
      return Math.max(0, Math.min(max, x))
    })
  }, [values])

  const [draft, setDraft] = React.useState<number[] | null>(null)
  const draggingRef = React.useRef<number | null>(null)
  const svgRef = React.useRef<SVGSVGElement | null>(null)
  const latestRef = React.useRef<number[]>(baseVals)

  const vals = draft ?? baseVals

  React.useEffect(() => {
    latestRef.current = vals
  }, [vals])

  React.useEffect(() => {
    if (draggingRef.current == null) setDraft(null)
  }, [baseVals])

  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 24

  const angleFor = (i: number) => (Math.PI * 2 * i) / 6 - Math.PI / 2

  const points = React.useMemo(() => {
    const pts: { x: number; y: number }[] = []
    for (let i = 0; i < 6; i++) {
      const angle = angleFor(i)
      const ratio = Math.max(0, Math.min(1, vals[i] / max))
      const px = cx + Math.cos(angle) * r * ratio
      const py = cy + Math.sin(angle) * r * ratio
      pts.push({ x: px, y: py })
    }
    return pts
  }, [vals, cx, cy, r])

  const poly = React.useMemo(() => points.map((p) => `${p.x},${p.y}`).join(' '), [points])

  const setAxisFromEvent = React.useCallback(
    (axis: number, evt: React.PointerEvent<SVGElement>) => {
      if (!interactive || !onChange) return
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      const sx = (evt.clientX - rect.left) * (size / rect.width)
      const sy = (evt.clientY - rect.top) * (size / rect.height)

      const dx = sx - cx
      const dy = sy - cy

      const a = angleFor(axis)
      const ux = Math.cos(a)
      const uy = Math.sin(a)

      const proj = dx * ux + dy * uy
      const clamped = Math.max(0, Math.min(r, proj))
      const raw = (clamped / r) * max
      const q = Math.max(1, Math.min(max, Math.round(raw)))

      const next = latestRef.current.slice()
      next[axis] = q
      latestRef.current = next
      setDraft(next)
      onChange(next)
    },
    [interactive, onChange, size, cx, cy, r],
  )

  const startDrag = React.useCallback(
    (axis: number) => (evt: React.PointerEvent<SVGElement>) => {
      if (!interactive) return
      draggingRef.current = axis
      try {
        evt.currentTarget.setPointerCapture(evt.pointerId)
      } catch {
      }
      setAxisFromEvent(axis, evt)
      evt.preventDefault()
    },
    [interactive, setAxisFromEvent],
  )

  const onMove = React.useCallback(
    (evt: React.PointerEvent<SVGSVGElement>) => {
      const axis = draggingRef.current
      if (axis == null) return
      setAxisFromEvent(axis, evt)
      evt.preventDefault()
    },
    [setAxisFromEvent],
  )

  const endDrag = React.useCallback(
    (evt: React.PointerEvent<SVGSVGElement>) => {
      if (draggingRef.current == null) return
      draggingRef.current = null
      setDraft(null)
      if (onRelease) onRelease(latestRef.current)
      evt.preventDefault()
    },
    [onRelease],
  )

  return (
    <div className="polar-wrap" style={{ width: size }}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        onPointerMove={onMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{ touchAction: 'none' }}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const rr = (r * n) / max
          return (
            <circle
              key={n}
              cx={cx}
              cy={cy}
              r={rr}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
            />
          )
        })}

        {Array.from({ length: 6 }).map((_, i) => {
          const angle = angleFor(i)
          const x = cx + Math.cos(angle) * r
          const y = cy + Math.sin(angle) * r
          return (
            <g key={i}>
              <line
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
              />
              {interactive && (
                <line
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke="transparent"
                  strokeWidth={24}
                  onPointerDown={startDrag(i)}
                  style={{ cursor: 'pointer' }}
                />
              )}
            </g>
          )
        })}

        <polygon
          points={poly}
          fill="rgba(100,108,255,0.18)"
          stroke="#646cff"
          strokeWidth={1.5}
        />

        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={interactive ? 6 : 4}
            fill="#646cff"
            onPointerDown={interactive ? startDrag(idx) : undefined}
            style={interactive ? { cursor: 'grab' } : undefined}
          />
        ))}
      </svg>

      <div className="polar-labels">
        {axes.map((t, i) => {
          const angle = angleFor(i)
          const x = cx + Math.cos(angle) * (r + 14)
          const y = cy + Math.sin(angle) * (r + 14)
          const style: React.CSSProperties = {
            position: 'absolute',
            left: x - 24,
            top: y - 8,
            width: 48,
            textAlign: 'center',
            fontSize: 12,
          }
          return (
            <div key={i} style={style}>
              {t}
            </div>
          )
        })}
      </div>
    </div>
  )
}
