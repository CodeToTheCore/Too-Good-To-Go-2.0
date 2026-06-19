import { useState, useEffect } from 'react'
import { getStores, createStore, getStoreAddOns, createAddOn, deleteAddOn, createBag, getIncomingOrders } from '../api'
import { useAuth } from '../context/AuthContext'
import { Plus, Store, Sparkles, Trash2, ShoppingBag, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './DashboardPage.module.css'

const EMPTY_BAG = { store_id:'', title:'', description:'', original_price:'', discounted_price:'', quantity_available:'', pickup_start:'17:00', pickup_end:'20:00' }

export default function DashboardPage() {
  const { user } = useAuth()
  const [stores, setStores] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', description:'', pickup_instructions:'', category:'bakery', address:'', city:'New York', latitude:'', longitude:'' })
  const [loading, setLoading] = useState(false)
  const [addonStore, setAddonStore] = useState('')
  const [addonForm, setAddonForm] = useState({ name:'', price:'' })
  const [addons, setAddons] = useState([])
  const [incoming, setIncoming] = useState([])
  const [bagForm, setBagForm] = useState(EMPTY_BAG)

  const handleAddBag = async (e) => {
    e.preventDefault()
    if (!bagForm.store_id) return toast.error('Pick a store first')
    try {
      const qty = parseInt(bagForm.quantity_available) || 0
      await createBag({
        store_id: Number(bagForm.store_id),
        title: bagForm.title,
        description: bagForm.description,
        original_price: parseFloat(bagForm.original_price),
        discounted_price: parseFloat(bagForm.discounted_price),
        quantity_available: qty,
        quantity_total: qty,
        pickup_start: bagForm.pickup_start,
        pickup_end: bagForm.pickup_end,
        bag_type: 'surprise',
      })
      setBagForm({ ...EMPTY_BAG, store_id: bagForm.store_id })
      toast.success('Magic Bag published!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create bag')
    }
  }

  useEffect(() => {
    if (!addonStore) { setAddons([]); return }
    getStoreAddOns(addonStore).then(r => setAddons(r.data)).catch(() => setAddons([]))
  }, [addonStore])

  const handleAddAddon = async (e) => {
    e.preventDefault()
    if (!addonStore) return toast.error('Pick a store first')
    try {
      const res = await createAddOn({ store_id: Number(addonStore), name: addonForm.name, price: parseFloat(addonForm.price) })
      setAddons(prev => [...prev, res.data])
      setAddonForm({ name:'', price:'' })
      toast.success('Add-on item created!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add item')
    }
  }

  const handleDeleteAddon = async (id) => {
    try {
      await deleteAddOn(id)
      setAddons(prev => prev.filter(a => a.id !== id))
    } catch {
      toast.error('Failed to remove item')
    }
  }

  useEffect(() => {
    getStores().then(r => setStores(r.data.filter(s => s.owner_id === user?.id)))
    getIncomingOrders().then(r => setIncoming(Array.isArray(r.data) ? r.data : [])).catch(() => {})
  }, [user])

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await createStore({ ...form, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) })
      setStores(prev => [...prev, res.data])
      setShowForm(false)
      setForm({ name:'', description:'', pickup_instructions:'', category:'bakery', address:'', city:'New York', latitude:'', longitude:'' })
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
          <div className={styles.field}>
            <label>Pickup instructions <span style={{fontWeight:400, color:'var(--gray-500)'}}>— tell customers exactly what to do when they arrive</span></label>
            <textarea value={form.pickup_instructions} onChange={e => setForm({...form, pickup_instructions: e.target.value})} rows={2}
                      placeholder="e.g. Walk up to the counter and tell the barista you have a Too Good To Go pickup."/>
          </div>
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

      {stores.length === 0 && (
        <div style={{textAlign:'center', color:'var(--gray-500)', padding:'24px', background:'#fff', border:'1px dashed var(--gray-300)', borderRadius:12}}>
          You don't own any stores yet. Click <strong>Add Store</strong> above to get started.
        </div>
      )}

      {stores.length > 0 && (
        <form onSubmit={handleAddBag} className={styles.form} style={{marginTop:28}}>
          <h3 style={{display:'flex', alignItems:'center', gap:8}}>
            <ShoppingBag size={18} style={{color:'var(--green)'}}/> Publish a Magic Bag
          </h3>
          <p style={{fontSize:13, color:'var(--gray-500)', marginBottom:14}}>List surplus food as a discounted surprise bag.</p>
          <div className={styles.field}><label>Store</label>
            <select required value={bagForm.store_id} onChange={e => setBagForm({...bagForm, store_id: e.target.value})}>
              <option value="">— select a store —</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className={styles.field}><label>Title</label>
            <input required value={bagForm.title} onChange={e => setBagForm({...bagForm, title: e.target.value})} placeholder="Surprise Bag"/>
          </div>
          <div className={styles.field}><label>Description</label>
            <textarea rows={2} value={bagForm.description} onChange={e => setBagForm({...bagForm, description: e.target.value})} placeholder="A mix of today's unsold items"/>
          </div>
          <div className={styles.grid2}>
            <div className={styles.field}><label>Original price ($)</label><input required type="number" step="0.01" min="0" value={bagForm.original_price} onChange={e => setBagForm({...bagForm, original_price: e.target.value})} placeholder="15.00"/></div>
            <div className={styles.field}><label>Discounted price ($)</label><input required type="number" step="0.01" min="0" value={bagForm.discounted_price} onChange={e => setBagForm({...bagForm, discounted_price: e.target.value})} placeholder="4.99"/></div>
          </div>
          <div className={styles.grid2}>
            <div className={styles.field}><label>Quantity available</label><input required type="number" min="0" value={bagForm.quantity_available} onChange={e => setBagForm({...bagForm, quantity_available: e.target.value})} placeholder="5"/></div>
            <div className={styles.field}><label>&nbsp;</label><div style={{display:'flex', gap:8}}>
              <input type="time" value={bagForm.pickup_start} onChange={e => setBagForm({...bagForm, pickup_start: e.target.value})}/>
              <input type="time" value={bagForm.pickup_end} onChange={e => setBagForm({...bagForm, pickup_end: e.target.value})}/>
            </div></div>
          </div>
          <button type="submit" className="btn btn-primary"><Plus size={16}/> Publish bag</button>
        </form>
      )}

      {incoming.length > 0 && (
        <div className={styles.form} style={{marginTop:28}}>
          <h3 style={{display:'flex', alignItems:'center', gap:8}}>
            <Package size={18} style={{color:'#2563eb'}}/> Incoming orders
          </h3>
          <div style={{display:'flex', flexDirection:'column', gap:10, marginTop:8}}>
            {incoming.map(o => (
              <div key={o.id} style={{border:'1px solid var(--gray-200)', borderRadius:10, padding:'12px 14px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4}}>
                  <strong>Order #{o.id}</strong>
                  <span className="badge badge-green">{o.status}</span>
                </div>
                <div style={{fontSize:13, color:'var(--gray-600)'}}>
                  {o.customer || 'Customer'} · code <strong>{o.pickup_code}</strong>
                </div>
                <div style={{fontSize:13, color:'var(--gray-500)', marginTop:4}}>
                  {o.items.map((it, i) => <span key={i}>{it.title} × {it.quantity}{i < o.items.length - 1 ? ', ' : ''}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.form} style={{marginTop:28}}>
        <h3 style={{display:'flex', alignItems:'center', gap:8}}>
          <Sparkles size={18} style={{color:'#ea580c'}}/> Cross-sell add-on items
        </h3>
        <p style={{fontSize:13, color:'var(--gray-500)', marginBottom:14}}>
          High-margin extras shown to customers at checkout (e.g. fresh coffee, a tote bag).
        </p>
        <div className={styles.field}>
          <label>Store</label>
          <select value={addonStore} onChange={e => setAddonStore(e.target.value)}>
            <option value="">— select a store —</option>
            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {addonStore && (
          <>
            {addons.length > 0 && (
              <div style={{display:'flex', flexDirection:'column', gap:8, margin:'8px 0 16px'}}>
                {addons.map(a => (
                  <div key={a.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between',
                           border:'1px solid var(--gray-200)', borderRadius:10, padding:'8px 12px'}}>
                    <span style={{fontWeight:600}}>{a.name} <span style={{color:'#ea580c', fontWeight:700}}>${a.price.toFixed(2)}</span></span>
                    <button type="button" onClick={() => handleDeleteAddon(a.id)}
                            style={{background:'none', border:'none', cursor:'pointer', color:'var(--gray-400)'}}>
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleAddAddon} className={styles.grid2}>
              <div className={styles.field}><label>Item name</label>
                <input required value={addonForm.name} onChange={e => setAddonForm({...addonForm, name: e.target.value})} placeholder="Fresh hot coffee"/>
              </div>
              <div className={styles.field}><label>Price ($)</label>
                <input required type="number" step="0.01" min="0" value={addonForm.price} onChange={e => setAddonForm({...addonForm, price: e.target.value})} placeholder="2.50"/>
              </div>
              <button type="submit" className="btn btn-primary" style={{gridColumn:'1 / -1'}}>
                <Plus size={16}/> Add item
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}