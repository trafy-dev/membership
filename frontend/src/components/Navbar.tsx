import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.jpg'
import { getSession } from '../lib/api'

export default function Navbar() {
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    getSession().then((res) => {
      if (res.success && res.authenticated) {
        setIsAuth(true)
      }
    }).catch(() => {})
  }, [])

  return (
    <nav className="navbar">
      <Link to="/" className="flex items-center gap-2">
        <img src={logo} alt="Dravida Manavar Peravai" className="logo-badge" />
      </Link>
      <div className="flex items-center gap-3">
        {isAuth ? (
          <Link to="/dashboard" className="btn-primary">
            Dashboard
          </Link>
        ) : (
          <>
            <Link to="/login" className="btn-ghost">
              Login
            </Link>
            <Link to="/signup" className="btn-primary">
              Join the Movement
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
