
import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, SlidersHorizontal, MapPin, Navigation, X } from 'lucide-react'
import StoreCard from '../components/StoreCard'
import { getStores, getStoreBags } from '../api'
import { useNavigate } from 'react-router-dom'
import styles from './HomePage.module.css'

const CATEGORIES = ['All', 'bakery', 'restaurant', 'grocery', 'cafe', 'other']

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export default function HomePage() {
  const [stores, setStores] = useState([])
  const [bagsMap, setBagsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Search state
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [searchLocation, setSearchLocation] = useState(null) // {lat, lon, label}
  const [category, setCategory] = useState('All')

  const debounceRef = useRef(null)
  const searchRef = useRef(null)
  const navigate = useNavigate()

  // Load stores
  useEffect(() => {
    setLoading(true)
    getStores()
      .then(async res => {
        const list = res.data
        setStores(list)
        const bagResults = await Promise.allSettled(list.map(s => getStoreBags(s.id)))
        const map = {}
        list.forEach((s, i) => {
          map[s.id] = bagResults[i].status === 'fulfilled' ? bagResults[i].value.data : []
        })
        setBagsMap(map)
      })
      .catch(() => setError('Could not connect to server. Make sure the backend is running.'))
      .finally(() => setLoading(false))
  }, [])

  // Nominatim geocoding suggestions
  const fetchSuggestions = useCallback((query) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    setGeocoding(true)
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`)
      .then(r => r.json())
      .then(data => {
        setSuggestions(data)
        setShowSuggestions(data.length > 0)
      })
      .catch(() => {})
      .finally(() => setGeocoding(false))
  }, [])

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearch(val)
    setSearchLocation(null) // clear geo lock when typing
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300)
  }

  const handleSelectSuggestion = (result) => {
    const label = result.display_name.split(',').slice(0, 2).join(', ')
    setSearch(label)
    setSearchLocation({
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      label
    })
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleLocateMe = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords
      setSearch('📍 Your location')
      setSearchLocation({ lat: latitude, lon: longitude, label: 'Your location' })
      setShowSuggestions(false)
    })
  }

  const handleClear = () => {
    setSearch('')
    setSearchLocation(null)
    setSuggestions([])
    setShowSuggestions(false)
  }

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Filter stores
  const filtered = stores.filter(s => {
    // Category filter
    if (category !== 'All' && s.category !== category) return false

    // If a geo location was selected — show stores within 25km
    if (searchLocation) {
      const dist = getDistance(searchLocation.lat, searchLocation.lon, s.latitude, s.longitude)
      s._distance = dist
      return dist <= 25
    }

    // Plain text filter — name, address, city, description, category
    if (search.trim()) {
      const q = search.toLowerCase()
      return (
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      )
    }

    return true
  })

  // Sort by distance if geo search active
  if (searchLocation) {
    filtered.sort((a, b) => (a._distance || 0) - (b._distance || 0))
  }

  return (
    <div>
      <div className={styles.hero}>
        <h1>Fight food waste,<br/>save money 🌿</h1>
        <p>Pick up surplus food from local stores at a fraction of the price</p>

        {/* SEARCH BOX */}
        <div className={styles.searchOuter} ref={searchRef}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon}/>
            <input
              type="text"
              placeholder="Search stores, neighborhoods, cities — anywhere"
              value={search}
              onChange={handleSearchChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className={styles.searchInput}
            />
            {geocoding && <div className={styles.geocodeSpinner}/>}
            {search && !geocoding && (
              <button className={styles.clearBtn} onClick={handleClear}><X size={14}/></button>
            )}
            <button className={styles.locateBtn} onClick={handleLocateMe} title="Use my location">
              <Navigation size={15}/>
            </button>
          </div>

          {/* SUGGESTIONS DROPDOWN */}
          {showSuggestions && suggestions.length > 0 && (
            <div className={styles.suggestions}>
              <div className={styles.suggestionsLabel}>Locations</div>
              {suggestions.map((r, i) => (
                <button key={i} className={styles.suggestion}
                  onClick={() => handleSelectSuggestion(r)}>
                  <MapPin size={13} className={styles.suggestionPin}/>
                  <div>
                    <div className={styles.suggestionMain}>
                      {r.display_name.split(',').slice(0, 2).join(', ')}
                    </div>
                    <div className={styles.suggestionSub}>
                      {r.display_name.split(',').slice(2, 5).join(', ')}
                    </div>
                  </div>
                </button>
              ))}
              <button className={styles.suggestionMap}
                onClick={() => { setShowSuggestions(false); navigate('/map') }}>
                🗺️ Search on full map instead →
              </button>
            </div>
          )}
        </div>

        {/* Active location badge */}
        {searchLocation && (
          <div className={styles.locationBadge}>
            <MapPin size={13}/> Showing stores near <strong>{searchLocation.label}</strong>
            <button onClick={handleClear}><X size={12}/></button>
          </div>
        )}
      </div>

      {/* FILTERS + RESULTS */}
      <div className="page-container" style={{paddingTop:24, paddingBottom:48}}>
        <div className={styles.filters}>
          <SlidersHorizontal size={16} style={{color:'var(--gray-500)'}}/>
          {CATEGORIES.map(c => (
            <button key={c}
              className={`${styles.filterBtn} ${category === c ? styles.active : ''}`}
              onClick={() => setCategory(c)}>
              {c === 'All' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,padding:'60px 20px'}}>
            <div className="spinner"/>
            <p style={{color:'var(--gray-400)',fontSize:14}}>Loading stores...</p>
          </div>
        ) : error ? (
          <div style={{padding:24,background:'#fff3cd',borderRadius:'var(--radius-md)',color:'#856404',border:'1px solid #ffd34e'}}>
            <strong>Backend not connected</strong>
            <p style={{fontSize:13,marginTop:4}}>{error}</p>
          </div>
        ) : (
          <>
            <div className={styles.resultsRow}>
              <p className={styles.resultCount}>
                {filtered.length} store{filtered.length !== 1 ? 's' : ''} 
                {searchLocation ? ` within 25 km of "${searchLocation.label}"` : ' available'}
              </p>
              {search && !searchLocation && (
                <p className={styles.searchingFor}>Results for "<strong>{search}</strong>"</p>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className={styles.empty}>
                <p>No stores found matching your search.</p>
                <button className="btn btn-outline" style={{marginTop:12,fontSize:13}}
                  onClick={handleClear}>Clear search</button>
              </div>
            ) : (
              <div className={styles.grid}>
                {filtered.map(store => (
                  <div key={store.id} style={{position:'relative'}}>
                    {store._distance != null && (
                      <div className={styles.distancePill}>
                        📍 {store._distance.toFixed(1)} km
                      </div>
                    )}
                    <StoreCard store={store} bags={bagsMap[store.id] || []}/>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

















// import { useState, useEffect } from 'react'
// import { Search, SlidersHorizontal, AlertCircle } from 'lucide-react'
// import StoreCard from '../components/StoreCard'
// import { getStores, getStoreBags } from '../api'
// import styles from './HomePage.module.css'

// const CATEGORIES = ['All', 'bakery', 'restaurant', 'grocery', 'cafe', 'other']

// export default function HomePage() {
//   const [stores, setStores] = useState([])
//   const [bagsMap, setBagsMap] = useState({})
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [search, setSearch] = useState('')
//   const [category, setCategory] = useState('All')

//   useEffect(() => {
//     setLoading(true)
//     setError(null)
//     getStores()
//       .then(async res => {
//         const storeList = res.data
//         setStores(storeList)
//         if (storeList.length > 0) {
//           const bagResults = await Promise.allSettled(storeList.map(s => getStoreBags(s.id)))
//           const map = {}
//           storeList.forEach((s, i) => {
//             map[s.id] = bagResults[i].status === 'fulfilled' ? bagResults[i].value.data : []
//           })
//           setBagsMap(map)
//         }
//       })
//       .catch(err => {
//         console.error('Failed to load stores:', err)
//         setError('Could not connect to the server. Make sure the backend is running.')
//       })
//       .finally(() => setLoading(false))
//   }, [])

//   // FIXED FILTER: Now tracks both button clicks and text typing
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
//   })

//   return (
//     <div>
//       <div className={styles.hero}>
//         <h1>Fight food waste,<br/>save money 🌿</h1>
//         <p>Pick up surplus food from local stores at a fraction of the price</p>
//         <div className={styles.searchBox}>
//           <Search size={18} className={styles.searchIcon}/>
//           <input
//             type="text"
//             placeholder="Search stores or neighborhoods..."
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//             className={styles.searchInput}
//           />
//         </div>
//       </div>

//       <div className="page-container" style={{paddingTop: 24, paddingBottom: 48}}>
//         <div className={styles.filters}>
//           <SlidersHorizontal size={16} style={{color:'var(--gray-500)'}}/>
//           {CATEGORIES.map(c => (
//             <button
//               key={c}
//               className={`${styles.filterBtn} ${category === c ? styles.active : ''}`}
//               onClick={() => setCategory(c)}
//             >
//               {c === 'All' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
//             </button>
//           ))}
//         </div>

//         {loading ? (
//           <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'60px 20px'}}>
//             <div className="spinner"/>
//             <p style={{color:'var(--gray-400)', fontSize:14}}>Loading stores...</p>
//           </div>
//         ) : error ? (
//           <div style={{display:'flex', alignItems:'center', gap:10, padding:'24px', background:'#fff3cd', borderRadius:'var(--radius-md)', color:'#856404', border:'1px solid #ffd34e'}}>
//             <AlertCircle size={20}/>
//             <div>
//               <strong>Backend not connected</strong>
//               <p style={{fontSize:13, marginTop:4}}>{error}</p>
//               <p style={{fontSize:12, marginTop:4}}>Run: <code style={{background:'rgba(0,0,0,0.1)', padding:'2px 6px', borderRadius:4}}>uvicorn main:app --reload --port 8001</code> in the backend folder</p>
//             </div>
//           </div>
//         ) : filtered.length === 0 ? (
//           <div className={styles.empty}>
//             <p>No stores found. Try a different search or category.</p>
//           </div>
//         ) : (
//           <>
//             <p className={styles.resultCount}>{filtered.length} store{filtered.length !== 1 ? 's' : ''} available</p>
//             <div className={styles.grid}>
//               {filtered.map(store => (
//                 <StoreCard key={store.id} store={store} bags={bagsMap[store.id] || []}/>
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   )
// }