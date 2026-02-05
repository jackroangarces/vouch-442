import { useState } from 'react'
import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <a href="https://vite.dev" target="_blank" rel="noreferrer">
        <img src={viteLogo} className="logo" alt="Vite logo" />
      </a>
      <a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer">
        <img src={typescriptLogo} className="logo vanilla" alt="TypeScript logo" />
      </a>
      <h1>Vite + React</h1>
      <div className="card">
        <button type="button" onClick={() => setCount((c) => c + 1)}>
          count is {count}
        </button>
      </div>
      <p className="read-the-docs">
        Click on the Vite and TypeScript logos to learn more
      </p>
    </div>
  )
}

export default App
