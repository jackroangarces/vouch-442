import React from 'react'

type Props = {
  values?: number[] 
  size?: number
}

export default function PolarChart({ values, size = 260 }: Props) {
  const vals = (values && values.length === 6) ? values : [0,0,0,0,0,0]
  const cx = size/2
  const cy = size/2
  const r = size/2 - 24
  const axes = ['Food','Ambience','Service','Price','Sustainability','Location']
  const points: string[] = []

  for (let i=0;i<6;i++){
    const angle = (Math.PI * 2 * i) / 6 - Math.PI/2
    const ratio = Math.max(0, Math.min(1, vals[i]/5))
    const px = cx + Math.cos(angle) * r * ratio
    const py = cy + Math.sin(angle) * r * ratio
    points.push(`${px},${py}`)
  }

  
  const poly = points.join(' ')

  
  const axisLine = (i:number) => {
    const angle = (Math.PI * 2 * i) / 6 - Math.PI/2
    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r
    return `${cx},${cy} ${x},${y}`
  }

  return (
    <div className="polar-wrap" style={{width:size}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        
        {[1,2,3,4,5].map((n)=>{
          const rr = (r * n)/5
          return <circle key={n} cx={cx} cy={cy} r={rr} fill="none" stroke="rgba(255,255,255,0.06)" />
        })}

        
        {Array.from({length:6}).map((_,i)=>{
          const angle = (Math.PI * 2 * i) / 6 - Math.PI/2
          const x = cx + Math.cos(angle) * r
          const y = cy + Math.sin(angle) * r
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.08)" />
        })}

        
        <polygon points={poly} fill="rgba(100,108,255,0.18)" stroke="#646cff" strokeWidth={1.5} />

        
        {points.map((p,idx)=>{
          const [px,py] = p.split(',').map(Number)
          return <circle key={idx} cx={px} cy={py} r={4} fill="#646cff" />
        })}
      </svg>

      <div className="polar-labels">
        {axes.map((t,i)=>{
          const angle = (Math.PI * 2 * i) / 6 - Math.PI/2
          const x = cx + Math.cos(angle) * (r + 14)
          const y = cy + Math.sin(angle) * (r + 14)
          
          const style: React.CSSProperties = {position: 'absolute', left: x - 24, top: y - 8, width: 48, textAlign: 'center', fontSize: 12}
          return <div key={i} style={style}>{t}</div>
        })}
      </div>
    </div>
  )
}
