import { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import { Search, MapPin, Navigation, SlidersHorizontal, X, Star, ShoppingBag, Clock, ChevronDown } from 'lucide-react'
import { getStores, getStoreBags } from '../api'
import toast from 'react-hot-toast'
import styles from './MapPage.module.css'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const makeIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})
const greenIcon = makeIcon('green')
const orangeIcon = makeIcon('orange')
const blueIcon = makeIcon('blue')

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function FlyTo({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, zoom || 13, { duration: 1.2 })
  }, [center, zoom, map])
  return null
}

function UserMarker({ position }) {
  const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41],
  })
  if (!position) return null
  return (
    <Marker position={position} icon={userIcon}>
      <Popup><strong>📍 You are here</strong></Popup>
    </Marker>
  )
}

const CATEGORIES = ['All', 'bakery', 'restaurant', 'grocery', 'cafe', 'other']
const RADIUS_OPTIONS = [1, 2, 5, 10, 25, 50]

export default function MapPage() {
  const [stores, setStores] = useState([])
  const [bagsMap, setBagsMap] = useState({})
  const [filteredStores, setFilteredStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060])
  const [mapZoom, setMapZoom] = useState(12)
  const [userLocation, setUserLocation] = useState(null)
  const [searchCenter, setSearchCenter] = useState(null)
  const [radius, setRadius] = useState(10)
  const [category, setCategory] = useState('All')
  const [selectedStore, setSelectedStore] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    getStores()
      .then(async res => {
        const list = res.data
        setStores(list)
        setFilteredStores(list)
        const bagResults = await Promise.allSettled(list.map(s => getStoreBags(s.id)))
        const map = {}
        list.forEach((s, i) => {
          map[s.id] = bagResults[i].status === 'fulfilled' ? bagResults[i].value.data : []
        })
        setBagsMap(map)
      })
      .catch(() => toast.error('Could not load stores'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = [...stores]
    if (searchCenter) {
      result = result.filter(s => {
        const dist = getDistance(searchCenter[0], searchCenter[1], s.latitude, s.longitude)
        s._distance = dist
        return dist <= radius
      })
      result.sort((a, b) => a._distance - b._distance)
    } else {
      result.forEach(s => { s._distance = null })
    }
    if (category !== 'All') {
      result = result.filter(s => s.category === category)
    }
    setFilteredStores(result)
  }, [stores, searchCenter, radius, category])

  const geocodeSearch = useCallback((query) => {
    if (!query || query.length < 3) {
      setSearchResults([])
      setShowSuggestions(false)
      return
    }
    setSearching(true)
    fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(query) + '&limit=6&addressdetails=1')
      .then(r => r.json())
      .then(data => {
        setSearchResults(data)
        setShowSuggestions(data.length > 0)
      })
      .catch(() => {})
      .finally(() => setSearching(false))
  }, [])

  const handleSearchInput = (e) => {
    const val = e.target.value
    setSearchQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => geocodeSearch(val), 350)
  }

  const handleSelectLocation = (result) => {
    const lat = parseFloat(result.lat)
    const lon = parseFloat(result.lon)
    setSearchQuery(result.display_name.split(',').slice(0, 2).join(', '))
    setSearchCenter([lat, lon])
    setMapCenter([lat, lon])
    setMapZoom(13)
    setShowSuggestions(false)
    setSearchResults([])
  }

  const handleLocateMe = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return }
    toast.loading('Finding your location...', { id: 'geo' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation([latitude, longitude])
        setSearchCenter([latitude, longitude])
        setMapCenter([latitude, longitude])
        setMapZoom(13)
        setSearchQuery('📍 Your current location')
        toast.success('Found your location!', { id: 'geo' })
      },
      () => toast.error('Could not get location. Check browser permissions.', { id: 'geo' })
    )
  }

  const handleClear = () => {
    setSearchQuery('')
    setSearchCenter(null)
    setSearchResults([])
    setShowSuggestions(false)
    setFilteredStores(stores)
    setUserLocation(null)
  }

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const getBagsCount = (storeId) =>
    (bagsMap[storeId] || []).reduce((s, b) => s + b.quantity_available, 0)

  const getMinPrice = (storeId) => {
    const bags = bagsMap[storeId] || []
    return bags.length ? Math.min(...bags.map(b => b.discounted_price)) : null
  }

  return (
    <div className={styles.page}>
      <div className={styles.searchBar} ref={searchRef}>
        <div className={styles.searchInputWrap}>
          <Search size={16} className={styles.searchIcon}/>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search city, neighborhood, address — anywhere in the world"
            value={searchQuery}
            onChange={handleSearchInput}
            onFocus={() => searchResults.length > 0 && setShowSuggestions(true)}
          />
          {searching && <div className={styles.searchSpinner}/>}
          {searchQuery && !searching && (
            <button className={styles.clearBtn} onClick={handleClear}><X size={14}/></button>
          )}
        </div>
        <button className={styles.locateBtn} onClick={handleLocateMe}>
          <Navigation size={15}/> Near Me
        </button>
        <button
          className={styles.filterToggle + (showFilters ? ' ' + styles.active : '')}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={15}/> Filters <ChevronDown size={13}/>
        </button>
        {showSuggestions && searchResults.length > 0 && (
          <div className={styles.suggestions}>
            {searchResults.map((r, i) => (
              <button key={i} className={styles.suggestion} onClick={() => handleSelectLocation(r)}>
                <MapPin size={13} className={styles.suggestionIcon}/>
                <div>
                  <div className={styles.suggestionMain}>{r.display_name.split(',').slice(0, 2).join(', ')}</div>
                  <div className={styles.suggestionSub}>{r.display_name.split(',').slice(2, 4).join(', ')}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {showFilters && (
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <label>Category</label>
            <div className={styles.categoryBtns}>
              {CATEGORIES.map(c => (
                <button key={c}
                  className={styles.catBtn + (category === c ? ' ' + styles.catActive : '')}
                  onClick={() => setCategory(c)}>
                  {c === 'All' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.filterGroup}>
            <label>Radius: <strong>{radius} km</strong></label>
            <div className={styles.radiusBtns}>
              {RADIUS_OPTIONS.map(r => (
                <button key={r}
                  className={styles.radiusBtn + (radius === r ? ' ' + styles.radiusActive : '')}
                  onClick={() => setRadius(r)}>
                  {r} km
                </button>
              ))}
            </div>
          </div>
          <div className={styles.filterStats}>
            {searchCenter
              ? filteredStores.length + ' store' + (filteredStores.length !== 1 ? 's' : '') + ' within ' + radius + ' km'
              : filteredStores.length + ' stores total'}
          </div>
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>{searchCenter ? filteredStores.length + ' stores found' : 'All stores'}</h2>
            {searchCenter && (
              <button className={styles.clearSearchBtn} onClick={handleClear}><X size={12}/> Clear</button>
            )}
          </div>
          {loading ? (
            <div className={styles.sidebarLoading}><div className="spinner"/><p>Loading stores...</p></div>
          ) : filteredStores.length === 0 ? (
            <div className={styles.noResults}>
              <MapPin size={36}/>
              <p>No stores found in this area.</p>
              <p>Try a larger radius or different location.</p>
              <button className="btn btn-outline" style={{fontSize:13,marginTop:8}} onClick={handleClear}>Show all stores</button>
            </div>
          ) : (
            <div className={styles.storeList}>
              {filteredStores.map(store => {
                const bagsCount = getBagsCount(store.id)
                const minPrice = getMinPrice(store.id)
                const bags = bagsMap[store.id] || []
                const isSelected = selectedStore?.id === store.id
                return (
                  <div key={store.id}
                    className={styles.storeCard + (isSelected ? ' ' + styles.selected : '')}
                    onClick={() => { setSelectedStore(store); setMapCenter([store.latitude, store.longitude]); setMapZoom(15) }}>
                    <div className={styles.storeCardTop}>
                      <div className={styles.storeInfo}>
                        <div className={styles.storeName}>{store.name}</div>
                        <div className={styles.storeAddress}><MapPin size={11}/> {store.address}</div>
                        {store._distance != null && (
                          <div className={styles.storeDist}>📍 {store._distance.toFixed(1)} km away</div>
                        )}
                      </div>
                      <div className={styles.storeRight}>
                        <span className={'badge badge-green ' + styles.catTag}>{store.category}</span>
                        {store.rating > 0 && (
                          <div className={styles.rating}><Star size={11} fill="#f5821f" stroke="none"/>{store.rating.toFixed(1)}</div>
                        )}
                      </div>
                    </div>
                    {bags.length > 0 && (
                      <div className={styles.bagRow}>
                        <div className={styles.bagInfo}>
                          <ShoppingBag size={12} style={{color:'var(--green)'}}/>
                          <span>{bagsCount} bag{bagsCount !== 1 ? 's' : ''} left</span>
                          {bags[0]?.pickup_start && <><Clock size={11}/>{bags[0].pickup_start}–{bags[0].pickup_end}</>}
                        </div>
                        {minPrice && <span className={styles.price}>from ${minPrice.toFixed(2)}</span>}
                      </div>
                    )}
                    <Link to={'/stores/' + store.id} className={styles.viewBtn} onClick={e => e.stopPropagation()}>View store →</Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className={styles.mapWrap}>
          <MapContainer center={mapCenter} zoom={mapZoom} className={styles.map}>
            <TileLayer
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FlyTo center={mapCenter} zoom={mapZoom}/>
            <UserMarker position={userLocation}/>
            {searchCenter && (
              <Circle center={searchCenter} radius={radius * 1000}
                pathOptions={{color:'#00a651',fillColor:'#00a651',fillOpacity:0.06,weight:2,dashArray:'6 4'}}/>
            )}
            {filteredStores.map(store => {
              const bagsCount = getBagsCount(store.id)
              const icon = bagsCount > 0 ? greenIcon : selectedStore?.id === store.id ? blueIcon : orangeIcon
              return (
                <Marker key={store.id} position={[store.latitude, store.longitude]} icon={icon}
                  eventHandlers={{ click: () => setSelectedStore(store) }}>
                  <Popup minWidth={200}>
                    <div style={{fontFamily:'Inter,sans-serif'}}>
                      <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{store.name}</div>
                      <div style={{fontSize:12,color:'#666',marginBottom:6}}>📍 {store.address}</div>
                      {store._distance != null && <div style={{fontSize:12,color:'#888',marginBottom:6}}>{store._distance.toFixed(1)} km away</div>}
                      {getBagsCount(store.id) > 0
                        ? <div style={{fontSize:12,color:'#00a651',fontWeight:600,marginBottom:8}}>🛍️ {getBagsCount(store.id)} bags · from ${getMinPrice(store.id)?.toFixed(2)}</div>
                        : <div style={{fontSize:12,color:'#f5821f',marginBottom:8}}>😔 No bags right now</div>
                      }
                      <a href={'/stores/' + store.id} style={{background:'#00a651',color:'white',padding:'6px 14px',borderRadius:999,fontSize:12,fontWeight:600,textDecoration:'none',display:'inline-block'}}>View store →</a>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
            {searchCenter && stores.filter(s => !filteredStores.find(f => f.id === s.id)).map(store => (
              <Marker key={'bg-'+store.id} position={[store.latitude, store.longitude]}
                icon={new L.Icon({
                  iconUrl:'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
                  shadowUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                  iconSize:[20,33],iconAnchor:[10,33]
                })} opacity={0.4}>
                <Popup><div style={{fontSize:13}}><strong>{store.name}</strong><p style={{color:'#999',fontSize:11,margin:'4px 0'}}>Outside search radius</p></div></Popup>
              </Marker>
            ))}
          </MapContainer>
          {searchCenter && (
            <div className={styles.mapBadge}>
              <MapPin size={12}/> {filteredStores.length} store{filteredStores.length !== 1 ? 's' : ''} within {radius} km
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
