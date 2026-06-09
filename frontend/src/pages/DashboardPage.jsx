import { useState, useEffect } from 'react'
import { getStores, createStore } from '../api'
import { useAuth } from '../context/AuthContext'
import { Plus, Store } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stores, setStores] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', description:'', category:'bakery', address:'', city:'New York', latitude:'', longitude:'' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getStores().then(r => setStores(r.data.filter(s => s.owner_id === user?.id || true)))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await createStore({ ...form, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) })
      setStores(prev => [...prev, res.data])
      setShowForm(false)
      setForm({ name:'', description:'', category:'bakery', address:'', city:'New York', latitude:'', longitude:'' })
      toast.success('Store created!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create store')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container" style={{paddingTop:32, paddingBottom:48}}>
      <div className={styles.header}>
        <h1>Store Dashboard</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16}/> {showForm ? 'Cancel' : 'Add Store'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className={styles.form}>
          <h3>New Store</h3>
          <div className={styles.grid2}>
            <div className={styles.field}><label>Store name</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}/></div>
            <div className={styles.field}><label>Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {['bakery','restaurant','grocery','cafe','other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.field}><label>Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2}/></div>
          <div className={styles.grid2}>
            <div className={styles.field}><label>Address</label><input required value={form.address} onChange={e => setForm({...form, address: e.target.value})}/></div>
            <div className={styles.field}><label>City</label><input required value={form.city} onChange={e => setForm({...form, city: e.target.value})}/></div>
          </div>
          <div className={styles.grid2}>
            <div className={styles.field}><label>Latitude</label><input required type="number" step="any" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} placeholder="40.7128"/></div>
            <div className={styles.field}><label>Longitude</label><input required type="number" step="any" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} placeholder="-74.0060"/></div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Store'}</button>
        </form>
      )}

      <div className={styles.storeList}>
        {stores.map(s => (
          <div key={s.id} className={styles.storeRow}>
            <Store size={20} style={{color:'var(--green)', flexShrink:0}}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:600}}>{s.name}</div>
              <div style={{fontSize:13, color:'var(--gray-500)'}}>{s.address} · {s.category}</div>
            </div>
            <span className="badge badge-green">Active</span>
          </div>
        ))}
      </div>
    </div>
  )
}