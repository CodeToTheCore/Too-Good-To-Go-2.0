import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../api'
import toast from 'react-hot-toast'
import { User, Mail, Phone, Shield } from 'lucide-react'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [form, setForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateProfile(form)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container" style={{paddingTop:32, paddingBottom:48, maxWidth:600}}>
      <h1 className={styles.title}>My Profile</h1>

      <div className={styles.card}>
        <div className={styles.avatar}>
          {user?.avatar_url ? <img src={user.avatar_url} alt="avatar"/> : (
            <div className={styles.avatarPlaceholder}>{user?.full_name?.[0]?.toUpperCase() || '?'}</div>
          )}
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label><User size={14}/> Full name</label>
            <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}/>
          </div>
          <div className={styles.field}>
            <label><Mail size={14}/> Email</label>
            <input value={user?.email} disabled className={styles.disabled}/>
          </div>
          <div className={styles.field}>
            <label><Phone size={14}/> Phone</label>
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 555 000 0000"/>
          </div>
          <div className={styles.field}>
            <label><Shield size={14}/> Role</label>
            <input value={user?.role} disabled className={styles.disabled}/>
          </div>
        </div>

        <div className={styles.actions}>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save changes'}
          </button>
          <button className="btn btn-danger" onClick={logout}>Log out</button>
        </div>
      </div>
    </div>
  )
}