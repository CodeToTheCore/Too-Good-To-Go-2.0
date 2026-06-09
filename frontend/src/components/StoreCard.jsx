import { Link } from 'react-router-dom'
import { Star, Clock, ShoppingBag } from 'lucide-react'
import styles from './StoreCard.module.css'

export default function StoreCard({ store, bags = [] }) {
  const available = bags.reduce((s, b) => s + b.quantity_available, 0)
  const minPrice = bags.length ? Math.min(...bags.map(b => b.discounted_price)) : null

  return (
    <Link to={`/stores/${store.id}`} className={styles.card}>
      <div className={styles.cover}>
        <img
          src={store.cover_url || `https://source.unsplash.com/400x200/?${store.category},food`}
          alt={store.name}
          onError={e => e.target.src = 'https://via.placeholder.com/400x200?text=Store'}
        />
        <span className={`badge badge-green ${styles.categoryBadge}`}>{store.category}</span>
      </div>
      <div className={styles.body}>
        <div className={styles.header}>
          <h3 className={styles.name}>{store.name}</h3>
          <div className={styles.rating}>
            <Star size={14} fill="#f5821f" stroke="none"/>
            <span>{store.rating?.toFixed(1) || '—'}</span>
          </div>
        </div>
        <p className={styles.address}>{store.address}</p>
        {bags.length > 0 && (
          <div className={styles.bagInfo}>
            <div className={styles.bagRow}>
              <ShoppingBag size={14} className={styles.bagIcon}/>
              <span>{available} bag{available !== 1 ? 's' : ''} left</span>
            </div>
            {minPrice && (
              <span className={styles.price}>from ${minPrice.toFixed(2)}</span>
            )}
          </div>
        )}
        {bags.length > 0 && bags[0].pickup_start && (
          <div className={styles.pickup}>
            <Clock size={13}/>
            <span>Pickup {bags[0].pickup_start} – {bags[0].pickup_end}</span>
          </div>
        )}
      </div>
    </Link>
  )
}