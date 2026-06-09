import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import StoreCard from '../components/StoreCard'
import { getStores, getStoreBags } from '../api'
import styles from './HomePage.module.css'

const CATEGORIES = ['All', 'bakery', 'restaurant', 'grocery', 'cafe', 'other']

export default function HomePage() {
  const [stores, setStores] = useState([])
  const [bagsMap, setBagsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    setLoading(true)
    getStores()
      .then(async res => {
        const storeList = res.data
        setStores(storeList)
        const bagResults = await Promise.all(storeList.map(s => getStoreBags(s.id).catch(() => ({ data: [] }))))
        const map = {}
        storeList.forEach((s, i) => { map[s.id] = bagResults[i].data })
        setBagsMap(map)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = stores.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.address.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || s.category === category
    return matchSearch && matchCat
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
            onChange={e => setSearch(e.target.value)}
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
          <div className="loading-spinner"><div className="spinner"/></div>
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