import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login } from '../api'
import toast from 'react-hot-toast'
import styles from './AuthPage.module.css'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await login(form)
      loginUser(res.data.access_token, res.data.user)
      toast.success(`Welcome back, ${res.data.user.full_name}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>🛍️</div>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Log in to your Too Good To Go account</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="you@example.com"/>
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required placeholder="••••••••"/>
          </div>
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className={styles.demo}>
          <p>Demo: <strong>demo@tgtg.com</strong> / <strong>demo1234</strong></p>
        </div>

        <p className={styles.switch}>Don't have an account? <Link to="/register">Sign up</Link></p>
      </div>
    </div>
  )
}