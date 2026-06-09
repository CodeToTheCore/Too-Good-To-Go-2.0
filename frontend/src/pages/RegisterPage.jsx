import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { register } from '../api'
import toast from 'react-hot-toast'
import styles from './AuthPage.module.css'

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '', role: 'customer' })
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await register(form)
      loginUser(res.data.access_token, res.data.user)
      toast.success('Account created!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>🛍️</div>
        <h1 className={styles.title}>Join the movement</h1>
        <p className={styles.sub}>Save food. Save money. Save the planet.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Full name</label>
            <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required placeholder="Jane Doe"/>
          </div>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="you@example.com"/>
          </div>
          <div className={styles.field}>
            <label>Phone (optional)</label>
            <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 555 000 0000"/>
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required placeholder="Min. 8 characters" minLength={8}/>
          </div>
          <div className={styles.field}>
            <label>I am a...</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="customer">Customer — looking for deals</option>
              <option value="store_owner">Store Owner — have surplus food</option>
            </select>
          </div>
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className={styles.switch}>Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  )
}