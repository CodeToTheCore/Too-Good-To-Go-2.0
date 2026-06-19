import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, AlertCircle } from 'lucide-react'
import StoreCard from '../components/StoreCard'
import { getStores, getStoreBags } from '../api'
import styles from './HomePage.module.css'

const CATEGORIES = ['All', 'bakery', 'restaurant', 'grocery', 'cafe', 'other']

export default function HomePage() {
  const [stores, setStores] = useState([])
  const [bagsMap, setBagsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [searchLocation, setSearchLocation] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getStores()
      .then(async res => {
        const storeList = Array.isArray(res.data) ? res.data : []
        setStores(storeList)
        if (storeList.length > 0) {
          const bagResults = await Promise.allSettled(storeList.map(s => getStoreBags(s.id)))
          const map = {}
          storeList.forEach((s, i) => {
            map[s.id] = bagResults[i].status === 'fulfilled' ? bagResults[i].value.data : []
          })
          setBagsMap(map)
        }
      })
      .catch(err => {
        console.error('Failed to load stores:', err)
        setError('Could not connect to the server. Make sure the backend is running.')
      })
      .finally(() => setLoading(false))
  }, [])

  // FIXED FILTER: Now tracks both button clicks and text typing
//   const filtered = stores.filter(s => {
//     // 1. Category filter logic
//     const matchCategory = category === 'All' || 
//       s.category?.toLowerCase() === category.toLowerCase();

//     // 2. Search bar filter logic (Name, City, and Description)
//     const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || 
//       s.city?.toLowerCase().includes(search.toLowerCase()) || 
//       s.description?.toLowerCase().includes(search.toLowerCase());
//     // Both conditions must pass
//     return matchCategory && matchSearch;
const filtered = stores.filter(s => {
    const matchCat = category === 'All' || s.category === category
    if (!matchCat) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      s.name.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q) ||
      (s.city || '').toLowerCase().includes(q) ||
      (s.description || '').toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    )

  })

  return (
    <div>
      <div className={styles.hero}>
        <h1>Fight food waste,<br/>save money 🌿</h1>
        <p>Pick up surplus food from local stores at a fraction of the price</p>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon}/>
          <input
            type="text"
            placeholder="Search stores or neighborhoods..."
            value={search}
            onChange={e => { setSearch(e.target.value); setSearchLocation(null) }}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className="page-container" style={{paddingTop: 24, paddingBottom: 48}}>
        <div className={styles.filters}>
          <SlidersHorizontal size={16} style={{color:'var(--gray-500)'}}/>
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`${styles.filterBtn} ${category === c ? styles.active : ''}`}
              onClick={() => setCategory(c)}
            >
              {c === 'All' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'60px 20px'}}>
            <div className="spinner"/>
            <p style={{color:'var(--gray-400)', fontSize:14}}>Loading stores...</p>
          </div>
        ) : error ? (
          <div style={{display:'flex', alignItems:'center', gap:10, padding:'24px', background:'#fff3cd', borderRadius:'var(--radius-md)', color:'#856404', border:'1px solid #ffd34e'}}>
            <AlertCircle size={20}/>
            <div>
              <strong>Backend not connected</strong>
              <p style={{fontSize:13, marginTop:4}}>{error}</p>
              <p style={{fontSize:12, marginTop:4}}>Run: <code style={{background:'rgba(0,0,0,0.1)', padding:'2px 6px', borderRadius:4}}>uvicorn main:app --reload --port 8001</code> in the backend folder</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <p>No stores found. Try a different search or category.</p>
          </div>
        ) : (
          <>
            <p className={styles.resultCount}>{filtered.length} store{filtered.length !== 1 ? 's' : ''} available</p>
            <div className={styles.grid}>
              {filtered.map(store => (
                <StoreCard key={store.id} store={store} bags={bagsMap[store.id] || []}/>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}