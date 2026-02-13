import viteLogo from '/assets/logos/vite.svg'
import { useState } from 'react'

export function Navbar() {
  const [q, setQ] = useState('')

  function onSearch(e: React.FormEvent) {
    e.preventDefault()
    
    console.log('search submit', q)
    
  }

  return (
    <nav className="navbar">
      <a href="/" className="navbar-logo">
        <img src={viteLogo} alt="Logo" />
      </a>

      <form className="navbar-search" onSubmit={onSearch}>
        <input
          aria-label="Search restaurants"
          placeholder="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <button type="button" className="navbar-login">
        Login
      </button>
    </nav>
  )
}
