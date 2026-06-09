import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, Star, Heart } from 'lucide-react'
import BagCard from '../components/BagCard'
import { getStore, getStoreBags, toggleFavorite, getFavorites } from '../api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './StorePage.module.css'

export default function StorePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [store, setStore] = useState(null)
  const [bags, setBags] = useState([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getStore(id), getStoreBags(id)])
      .then(([sRes, bRes]) => { setStore(sRes.data); setBags(bRes.data) })
      .finally(() => setLoading(false))
    if (user) getFavorites().then(r => setIsFavorite(r.data.includes(parseInt(id))))
  }, [id, user])

  const handleFavorite = async () => {
    if (!user) return toast.error('Log in to save favorites')
    const res = await toggleFavorite(id)
    setIsFavorite(res.data.favorited)
    toast.success(res.data.favorited ? 'Added to favorites!' : 'Removed from favorites')
  }

  if (loading) return <div className="loading-spinner"><div className="spinner"/></div>
  if (!store) return <div style={{textAlign:'center',padding:60}}>Store not found</div>

  return (
    <div>
      <div className={styles.cover}>
        <img src={store.cover_url || `https://source.unsplash.com/1200x300/?${store.category},food`} alt={store.name}
             onError={e => e.target.src='https://via.placeholder.com/1200x300?text=Store'}/>
        <div className={styles.overlay}/>
        <div className={styles.coverContent}>
          <h1>{store.name}</h1>
          <div className={styles.meta}>
            <span className="badge badge-green">{store.category}</span>
            <div className={styles.metaItem}><Star size={14} fill="#f5821f" stroke="none"/>{store.rating?.toFixed(1)}</div>
            <div className={styles.metaItem}><MapPin size={14}/>{store.address}</div>
          </div>
        </div>
        <button className={`${styles.favBtn} ${isFavorite ? styles.favorited : ''}`} onClick={handleFavorite}>
          <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'}/>
        </button>
      </div>

      <div className="page-container" style={{paddingTop:28, paddingBottom:48}}>
        {store.description && <p className={styles.desc}>{store.description}</p>}
        <h2 className={styles.sectionTitle}>Available Magic Bags</h2>
        {bags.length === 0 ? (
          <div className={styles.noBags}>
            <p>😔 No bags available right now. Check back later!</p>
          </div>
        ) : (
          <div className={styles.bagsGrid}>
            {bags.map(bag => <BagCard key={bag.id} bag={bag} store={store}/>)}
          </div>
        )}
      </div>
    </div>
  )
}