import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import { getFavorites, getStoreBags } from '../api'
import { useAuth } from '../context/AuthContext'
import styles from './FavoritesBell.module.css'

// Shows how many favorited stores currently have bags available, and toasts once per session.
export default function FavoritesBell() {
  const { user } = useAuth()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!user) { setCount(0); return }
    let cancelled = false

    getFavorites()
      .then(async r => {
        const ids = Array.isArray(r.data) ? r.data : []
        if (ids.length === 0) return
        const results = await Promise.allSettled(ids.map(id => getStoreBags(id)))
        const storesWithBags = results.filter(
          res => res.status === 'fulfilled' &&
                 Array.isArray(res.value.data) &&
                 res.value.data.some(b => b.quantity_available > 0)
        ).length
        if (cancelled) return
        setCount(storesWithBags)
        // toast once per browser session so we don't nag on every page change
        if (storesWithBags > 0 && !sessionStorage.getItem('tgtg_fav_alerted')) {
          sessionStorage.setItem('tgtg_fav_alerted', '1')
          toast(`🔔 ${storesWithBags} of your favorite store${storesWithBags > 1 ? 's have' : ' has'} bags right now!`)
        }
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, [user])

  if (!user) return null

  return (
    <Link to="/favorites" className={styles.bell} title="Favorite stores with bags available">
      <Bell size={20}/>
      {count > 0 && <span className={styles.badge}>{count}</span>}
    </Link>
  )
}
