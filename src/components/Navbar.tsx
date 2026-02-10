import viteLogo from '/assets/logos/vite.svg'

export function Navbar() {
  return (
    <nav className="navbar">
      <a href="/" className="navbar-logo">
        <img src={viteLogo} alt="Logo" />
      </a>
      <button type="button" className="navbar-login">
        Login
      </button>
    </nav>
  )
}
