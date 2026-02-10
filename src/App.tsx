import './style.css'
import viteLogo from '/vite.svg'

function App() {
  return (
    <>
      <nav className="navbar">
        <a href="/" className="navbar-logo">
          <img src={viteLogo} alt="Logo" />
        </a>
        <button type="button" className="navbar-login">
          Login
        </button>
      </nav>
      <main className="main">
        {/* Main content goes here */}
      </main>
    </>
  )
}

export default App
