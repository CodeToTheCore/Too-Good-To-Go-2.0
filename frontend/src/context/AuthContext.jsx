import { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('tgtg_token')
    if (token) {
      getMe()
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('tgtg_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const loginUser = (token, userData) => {
    localStorage.setItem('tgtg_token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('tgtg_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)