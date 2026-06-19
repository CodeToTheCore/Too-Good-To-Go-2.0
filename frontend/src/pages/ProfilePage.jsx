import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfile, updateDietary, getMyOrders, getMyFlexPasses, redeemFlexPass } from '../api'
import { DIETARY_OPTIONS } from '../utils/foodClue'
import toast from 'react-hot-toast'
import { User, Mail, Phone, Shield, PiggyBank, Utensils, Receipt, Leaf, ShieldAlert, Ticket } from 'lucide-react'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth()
  const [form, setForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' })
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ saved: 0, meals: 0, orders: 0 })
  const [prefs, setPrefs] = useState(user?.dietary_prefs ? user.dietary_prefs.split(',').filter(Boolean) : [])
  const [autoCancel, setAutoCancel] = useState(!!user?.auto_cancel_conflicts)
  const [savingDiet, setSavingDiet] = useState(false)
  const [passes, setPasses] = useState([])

  useEffect(() => {
    getMyFlexPasses().then(r => setPasses(Array.isArray(r.data) ? r.data : [])).catch(() => {})
  }, [])

  const usePunch = async (id) => {
    try {
      const res = await redeemFlexPass(id)
      setPasses(prev => prev.map(p => p.id === id ? res.data : p))
      toast.success(`Punch used — ${res.data.remaining_punches} left`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not redeem')
    }
  }

  const togglePref = (key) =>
    setPrefs(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key])

  const saveDietary = async () => {
    setSavingDiet(true)
    try {
      const res = await updateDietary({ dietary_prefs: prefs, auto_cancel_conflicts: autoCancel })
      setUser(res.data)
      toast.success('Dietary settings saved!')
    } catch {
      toast.error('Failed to save dietary settings')
    } finally {
      setSavingDiet(false)
    }
  }

  useEffect(() => {
    getMyOrders()
      .then(r => {
        const orders = Array.isArray(r.data) ? r.data : []
        let saved = 0, meals = 0
        orders.forEach(o => {
          if (o.status === 'cancelled') return
          ;(o.items || []).forEach(it => {
            const qty = it.quantity || 0
            meals += qty
            if (it.original_price != null && it.price != null) {
              saved += (it.original_price - it.price) * qty
            }
          })
        })
        setStats({ saved, meals, orders: orders.filter(o => o.status !== 'cancelled').length })
      })
      .catch(() => {}) // counter is non-critical; ignore failures
  }, [])

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

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <PiggyBank size={22} style={{color:'#16a34a'}}/>
          <div className={styles.statValue}>${stats.saved.toFixed(2)}</div>
          <div className={styles.statLabel}>Total saved</div>
        </div>
        <div className={styles.statCard}>
          <Utensils size={22} style={{color:'#ea580c'}}/>
          <div className={styles.statValue}>{stats.meals}</div>
          <div className={styles.statLabel}>Meals rescued</div>
        </div>
        <div className={styles.statCard}>
          <Receipt size={22} style={{color:'#2563eb'}}/>
          <div className={styles.statValue}>{stats.orders}</div>
          <div className={styles.statLabel}>Orders</div>
        </div>
      </div>

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

      {passes.length > 0 && (
        <div className={styles.card} style={{marginTop:20}}>
          <h2 style={{display:'flex', alignItems:'center', gap:8, fontSize:18, fontWeight:800, marginBottom:14}}>
            <Ticket size={18} style={{color:'#047857'}}/> My Flex Passes
          </h2>
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {passes.map(p => (
              <div key={p.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between',
                       border:'1px solid var(--gray-200)', borderRadius:12, padding:'12px 14px'}}>
                <div>
                  <div style={{fontWeight:700}}>{p.store_name || `Store #${p.store_id}`}</div>
                  <div style={{fontSize:13, color:'var(--gray-500)'}}>
                    <strong style={{color: p.remaining_punches ? '#047857' : 'var(--gray-400)'}}>{p.remaining_punches}</strong> of {p.total_punches} pickups left · paid ${p.price_paid.toFixed(2)}
                  </div>
                </div>
                <button className="btn btn-outline" style={{fontSize:13, padding:'7px 14px'}}
                        onClick={() => usePunch(p.id)} disabled={p.remaining_punches <= 0}>
                  {p.remaining_punches > 0 ? 'Use a punch' : 'Used up'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.card} style={{marginTop:20}}>
        <h2 style={{display:'flex', alignItems:'center', gap:8, fontSize:18, fontWeight:800, marginBottom:6}}>
          <Leaf size={18} style={{color:'#16a34a'}}/> Dietary needs
        </h2>
        <p style={{fontSize:13.5, color:'var(--gray-500)', marginBottom:14}}>
          Flag your dietary requirements. We use each store's food clue to warn you about risky bags.
        </p>
        <div style={{display:'flex', flexWrap:'wrap', gap:8, marginBottom:18}}>
          {DIETARY_OPTIONS.map(opt => {
            const on = prefs.includes(opt.key)
            return (
              <button key={opt.key} type="button" onClick={() => togglePref(opt.key)}
                style={{padding:'8px 14px', borderRadius:999, fontSize:13.5, fontWeight:700, cursor:'pointer',
                        border: on ? '1.5px solid #16a34a' : '1.5px solid var(--gray-200)',
                        background: on ? '#ecfdf5' : '#fff', color: on ? '#065f46' : 'var(--gray-600)'}}>
                {on ? '✓ ' : ''}{opt.label}
              </button>
            )
          })}
        </div>
        <label style={{display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer',
                       background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:10, padding:'12px 14px'}}>
          <input type="checkbox" checked={autoCancel} onChange={e => setAutoCancel(e.target.checked)}
                 style={{marginTop:3, width:16, height:16}}/>
          <span>
            <span style={{display:'flex', alignItems:'center', gap:6, fontWeight:700, color:'#9a3412'}}>
              <ShieldAlert size={15}/> Hard auto-cancel
            </span>
            <span style={{fontSize:13, color:'#b45309'}}>
              Block any order that conflicts with my dietary needs so I never spend money on a bag I can't eat.
            </span>
          </span>
        </label>
        <div className={styles.actions} style={{marginTop:16}}>
          <button className="btn btn-primary" onClick={saveDietary} disabled={savingDiet}>
            {savingDiet ? 'Saving...' : 'Save dietary settings'}
          </button>
        </div>
      </div>
    </div>
  )
}