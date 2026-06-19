import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, Star, Heart, Info } from 'lucide-react'
import BagCard from '../components/BagCard'
import FlexPassWidget from '../components/FlexPassWidget'
import { getStore, getStoreBags, toggleFavorite, getFavorites } from '../api'
import { getFoodClue } from '../utils/foodClue'
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

  const clue = getFoodClue(store)

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
          <div
            style={{ display:'inline-flex', alignItems:'center', gap:8, marginTop:10,
                     padding:'6px 14px', borderRadius:999, color:'#fff', fontWeight:700,
                     fontSize:14, background: clue.color }}
            title={`Food clue: ${clue.label}`}
          >
            <span aria-hidden="true">{clue.emoji}</span> Clue: {clue.label}
          </div>
        </div>
        <button className={`${styles.favBtn} ${isFavorite ? styles.favorited : ''}`} onClick={handleFavorite}>
          <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'}/>
        </button>
      </div>

      <div className="page-container" style={{paddingTop:28, paddingBottom:48}}>
        {store.description && <p className={styles.desc}>{store.description}</p>}
        {store.pickup_instructions && (
          <div style={{display:'flex', gap:10, alignItems:'flex-start', background:'#eff6ff',
                       border:'1px solid #bfdbfe', borderRadius:12, padding:'14px 16px', margin:'4px 0 24px'}}>
            <Info size={20} style={{color:'#2563eb', flexShrink:0, marginTop:1}}/>
            <div>
              <div style={{fontWeight:700, color:'#1e3a8a', marginBottom:2}}>When you arrive</div>
              <div style={{color:'#1e40af', fontSize:14, lineHeight:1.5}}>{store.pickup_instructions}</div>
            </div>
          </div>
        )}
        <FlexPassWidget store={store}/>

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