import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { createOrder } from '../api'
import toast from 'react-hot-toast'
import styles from './CartPage.module.css'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, total } = useCart()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleCheckout = async () => {
    if (items.length === 0) return
    setLoading(true)
    try {
      const payload = {
        items: items.map(i => ({ bag_id: i.bag.id, quantity: i.quantity })),
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
        </div>

        <div className={styles.summary}>
          <h3>Order Summary</h3>
          {items.map(({ bag, quantity }) => (
            <div key={bag.id} className={styles.summaryRow}>
              <span>{bag.title} × {quantity}</span>
              <span>${(bag.discounted_price * quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className={styles.divider}/>
          <div className={styles.totalRow}>
            <span>Total</span>
            <span className={styles.totalAmt}>${total.toFixed(2)}</span>
          </div>
          <button
            className={`btn btn-primary ${styles.checkoutBtn}`}
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? 'Placing order...' : `Place Order — $${total.toFixed(2)}`}
          </button>
          <p className={styles.note}>🌿 You're saving food from going to waste!</p>
        </div>
      </div>
    </div>
  )
}