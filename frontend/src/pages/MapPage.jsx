import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import { getStores, getStoreBags } from '../api'
import styles from './MapPage.module.css'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

export default function MapPage() {
  const [stores, setStores] = useState([])
  const [bagsMap, setBagsMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStores().then(async res => {
      const list = res.data
      setStores(list)
      const results = await Promise.all(list.map(s => getStoreBags(s.id).catch(() => ({ data: [] }))))
      const map = {}
      list.forEach((s, i) => { map[s.id] = results[i].data })
      setBagsMap(map)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        <h2 className={styles.title}>Stores near you</h2>
        <div className={styles.list}>
          {stores.map(store => {
            const bags = bagsMap[store.id] || []
            const total = bags.reduce((s, b) => s + b.quantity_available, 0)
            return (
              <Link key={store.id} to={`/stores/${store.id}`} className={styles.storeItem}>
                <div className={styles.storeName}>{store.name}</div>
                <div className={styles.storeAddress}>{store.address}</div>
                {total > 0 && <span className="badge badge-green">{total} bag{total !== 1 ? 's' : ''} left</span>}
              </Link>
            )
          })}
        </div>
      </div>
      <div className={styles.mapWrap}>
        {!loading && (
          <MapContainer center={[40.73, -73.99]} zoom={13} className={styles.map}>
            <TileLayer
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {stores.map(store => (
              <Marker key={store.id} position={[store.latitude, store.longitude]} icon={greenIcon}>
                <Popup>
                  <div style={{minWidth:160}}>
                    <strong>{store.name}</strong>
                    <p style={{fontSize:12,margin:'4px 0',color:'#666'}}>{store.address}</p>
                    {(bagsMap[store.id] || []).length > 0 && (
                      <p style={{fontSize:12,color:'#00a651',fontWeight:600}}>
                        {bagsMap[store.id].reduce((s,b)=>s+b.quantity_available,0)} bags available
                      </p>
                    )}
                    <a href={`/stores/${store.id}`} style={{color:'#00a651',fontSize:13,fontWeight:600}}>View store →</a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  )
}