import { ShoppingCart, Clock, Tag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { to12h } from '../utils/time'
import styles from './BagCard.module.css'

export default function BagCard({ bag, store }) {
  const { addToCart } = useCart()
  const savings = bag.original_price - bag.discounted_price
  const pct = Math.round((savings / bag.original_price) * 100)

  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        <img
          src={bag.image_url || `https://source.unsplash.com/300x200/?${store?.category || 'food'},surprise`}
          alt={bag.title}
          onError={e => e.target.src = 'https://via.placeholder.com/300x200?text=Magic+Bag'}
        />
        <span className={styles.savingsBadge}>Save {pct}%</span>
      </div>
      <div className={styles.body}>
        <h4 className={styles.title}>{bag.title}</h4>
        <p className={styles.desc}>{bag.description}</p>
        <div className={styles.priceRow}>
          <div>
            <span className={styles.price}>${bag.discounted_price.toFixed(2)}</span>
            <span className={styles.original}>${bag.original_price.toFixed(2)}</span>
          </div>
          <span className={styles.stock}>
            {bag.quantity_available} left
          </span>
        </div>
        <div className={styles.pickup}>
          <Clock size={13}/>
          {/* Updated usage here */}
          <span>Pick up {to12h(bag.pickup_start)} – {to12h(bag.pickup_end)}</span>
        </div>
        
        <button
          className={`btn btn-primary ${styles.addBtn}`}
          onClick={() => addToCart(bag, store)}
          disabled={bag.quantity_available === 0}
        >
          <ShoppingCart size={16}/>
          {bag.quantity_available === 0 ? 'Sold Out' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}