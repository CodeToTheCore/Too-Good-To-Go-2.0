import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart, ShieldAlert, Sparkles } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrder, getStoreAddOns } from '../api'
import { dietaryConflict } from '../utils/foodClue'
import toast from 'react-hot-toast'
import styles from './CartPage.module.css'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, total } = useCart()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [addOns, setAddOns] = useState([])
  const [selected, setSelected] = useState([])   // selected add-on ids
  const navigate = useNavigate()

  // Cross-sell: load add-ons for every store represented in the cart.
  const storeKey = [...new Set(items.map(i => i.store?.id).filter(Boolean))].sort().join(',')
  useEffect(() => {
    const ids = storeKey ? storeKey.split(',').map(Number) : []
    if (ids.length === 0) { setAddOns([]); return }
    Promise.all(ids.map(id => getStoreAddOns(id).then(r => r.data).catch(() => [])))
      .then(lists => setAddOns(lists.flat()))
  }, [storeKey])

  const toggleAddOn = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const selectedAddOns = addOns.filter(a => selected.includes(a.id))
  const addOnTotal = selectedAddOns.reduce((s, a) => s + a.price, 0)
  const grandTotal = total + addOnTotal

  // Dietary "hard auto-cancel" pre-check (mirrors the backend block).
  const prefs = user?.dietary_prefs ? user.dietary_prefs.split(',').filter(Boolean) : []
  const conflicts = (user?.auto_cancel_conflicts && prefs.length)
    ? items
        .map(({ store }) => ({ store, reason: dietaryConflict(prefs, store) }))
        .filter(c => c.reason)
    : []
  const blocked = conflicts.length > 0

  const handleCheckout = async () => {
    if (items.length === 0) return
    if (blocked) {
      toast.error('Order blocked by your dietary settings. Remove the flagged item or adjust your profile.')
      return
    }
    setLoading(true)
    try {
      const payload = {
        items: items.map(i => ({ bag_id: i.bag.id, quantity: i.quantity })),
        addon_ids: selected,
        notes: ''
      }
      const res = await createOrder(payload)
      clearCart()
      toast.success('Order placed!')
      navigate('/orders')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Order failed')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) return (
    <div className={styles.empty}>
      <ShoppingCart size={60} className={styles.emptyIcon}/>
      <h2>Your cart is empty</h2>
      <p>Find a Magic Bag near you to get started!</p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>Browse stores</button>
    </div>
  )

  return (
    <div className="page-container" style={{paddingTop:32, paddingBottom:48}}>
      <h1 className={styles.title}>Your Cart</h1>
      <div className={styles.layout}>
        <div className={styles.items}>
          {items.map(({ bag, store, quantity }) => (
            <div key={bag.id} className={styles.item}>
              <img
                src={bag.image_url || `https://source.unsplash.com/120x120/?${store?.category || 'food'}`}
                alt={bag.title}
                className={styles.itemImg}
                onError={e => e.target.src='https://via.placeholder.com/120x120?text=Bag'}
              />
              <div className={styles.itemInfo}>
                <div className={styles.itemName}>{bag.title}</div>
                <div className={styles.itemStore}>{store?.name}</div>
                <div className={styles.itemPrice}>${(bag.discounted_price * quantity).toFixed(2)}</div>
              </div>
              <div className={styles.itemControls}>
                <button onClick={() => updateQuantity(bag.id, quantity - 1)}><Minus size={14}/></button>
                <span>{quantity}</span>
                <button onClick={() => updateQuantity(bag.id, quantity + 1)}><Plus size={14}/></button>
              </div>
              <button className={styles.removeBtn} onClick={() => removeFromCart(bag.id)}>
                <Trash2 size={16}/>
              </button>
            </div>
          ))}

          {addOns.length > 0 && (
            <div style={{marginTop:20}}>
              <h3 style={{display:'flex', alignItems:'center', gap:7, fontSize:16, fontWeight:800, marginBottom:4}}>
                <Sparkles size={17} style={{color:'#ea580c'}}/> Add something fresh
              </h3>
              <p style={{fontSize:13, color:'var(--gray-500)', marginBottom:12}}>Popular extras from your cart's stores.</p>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10}}>
                {addOns.map(a => {
                  const on = selected.includes(a.id)
                  return (
                    <button key={a.id} type="button" onClick={() => toggleAddOn(a.id)}
                      style={{textAlign:'left', cursor:'pointer', borderRadius:12, padding:'12px 14px',
                              border: on ? '2px solid #ea580c' : '1.5px solid var(--gray-200)',
                              background: on ? '#fff7ed' : '#fff'}}>
                      <div style={{fontWeight:700, fontSize:14}}>{a.name}</div>
                      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:6}}>
                        <span style={{fontWeight:800, color:'#ea580c'}}>+${a.price.toFixed(2)}</span>
                        <span style={{fontSize:12, fontWeight:700, color: on ? '#ea580c' : 'var(--gray-400)'}}>
                          {on ? '✓ Added' : '+ Add'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className={styles.summary}>
          <h3>Order Summary</h3>
          {blocked && (
            <div style={{display:'flex', gap:8, alignItems:'flex-start', background:'#fef2f2',
                         border:'1px solid #fecaca', borderRadius:10, padding:'12px 14px', marginBottom:14}}>
              <ShieldAlert size={18} style={{color:'#dc2626', flexShrink:0, marginTop:1}}/>
              <div style={{fontSize:13, color:'#991b1b'}}>
                <strong>Blocked by your dietary settings.</strong> {conflicts.map(c => c.store?.name).join(', ')} may
                not be safe ({conflicts.map(c => c.reason).join(', ')}). Remove it or update your profile.
              </div>
            </div>
          )}
          {items.map(({ bag, quantity }) => (
            <div key={bag.id} className={styles.summaryRow}>
              <span>{bag.title} × {quantity}</span>
              <span>${(bag.discounted_price * quantity).toFixed(2)}</span>
            </div>
          ))}
          {selectedAddOns.map(a => (
            <div key={`a${a.id}`} className={styles.summaryRow}>
              <span>{a.name}</span>
              <span>${a.price.toFixed(2)}</span>
            </div>
          ))}
          <div className={styles.divider}/>
          <div className={styles.totalRow}>
            <span>Total</span>
            <span className={styles.totalAmt}>${grandTotal.toFixed(2)}</span>
          </div>
          <button
            className={`btn btn-primary ${styles.checkoutBtn}`}
            onClick={handleCheckout}
            disabled={loading || blocked}
          >
            {loading ? 'Placing order...' : blocked ? 'Order blocked' : `Place Order — $${grandTotal.toFixed(2)}`}
          </button>
          <p className={styles.note}>🌿 You're saving food from going to waste!</p>
        </div>
      </div>
    </div>
  )
}