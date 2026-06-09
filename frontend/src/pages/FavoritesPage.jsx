import { useState, useEffect } from 'react'
import { getFavorites, getStore, getStoreBags } from '../api'
import StoreCard from '../components/StoreCard'
import { Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function FavoritesPage() {
  const [stores, setStores] = useState([])
  const [bagsMap, setBagsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getFavorites().then(async r => {
      const ids = r.data
      const storeResults = await Promise.all(ids.map(id => getStore(id).catch(() => null)))
      const storeList = storeResults.filter(Boolean).map(r => r.data)
      setStores(storeList)
      const bagResults = await Promise.all(storeList.map(s => getStoreBags(s.id).catch(() => ({ data: [] }))))
      const map = {}
      storeList.forEach((s, i) => { map[s.id] = bagResults[i].data })
      setBagsMap(map)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-spinner"><div className="spinner"/></div>

  return (
    <div className="page-container" style={{paddingTop:32, paddingBottom:48}}>
      <h1 style={{fontSize:24, fontWeight:800, marginBottom:24}}>My Favorites</h1>
      {stores.length === 0 ? (
        <div style={{textAlign:'center', padding:'80px 20px', color:'var(--gray-400)'}}>
          <Heart size={56} style={{marginBottom:12}}/>
          <p style={{fontSize:15}}>No favorites yet. Heart a store to save it here!</p>
          <button className="btn btn-primary" style={{marginTop:16}} onClick={() => navigate('/')}>Browse stores</button>
        </div>
      ) : (
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20}}>
          {stores.map(store => <StoreCard key={store.id} store={store} bags={bagsMap[store.id] || []}/>)}
        </div>
      )}
    </div>
  )
}