import '../styles/style.css'
import PolarChart from '../components/PolarChart'

export default function Home() {
  
  const vibe = [0,0,0,0,0,0]

  return (
    <div className="main home-grid">
      <div className="results">
        <h2>Results</h2>
        <div className="card-placeholder">No results yet — search to begin</div>
      </div>

      <aside className="chart-area">
        <h3>Vibe Chart</h3>
        <PolarChart values={vibe} />
      </aside>
    </div>
  )
}
