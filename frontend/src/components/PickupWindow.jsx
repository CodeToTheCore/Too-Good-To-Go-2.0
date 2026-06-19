import { useState, useEffect } from 'react'
import { Clock, Navigation } from 'lucide-react'
import { to12h } from '../utils/time'
import { directionsUrl } from '../utils/maps'
import styles from './PickupWindow.module.css'

// Turns an "HH:MM" wall-clock string into a Date for today.
function todayAt(hhmm) {
  if (!hhmm) return null
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}

function describe(start, end) {
  const now = new Date()
  const s = todayAt(start), e = todayAt(end)
  if (!s || !e) return { text: '', tone: 'neutral' }
  const mins = d => Math.round((d - now) / 60000)
  if (now < s) {
    const m = mins(s)
    return { text: `Opens in ${m >= 60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m}m`}`, tone: 'upcoming' }
  }
  if (now > e) return { text: 'Pickup window closed', tone: 'closed' }
  const m = mins(e)
  return {
    text: `Closes in ${m >= 60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m}m`}`,
    tone: m <= 30 ? 'urgent' : 'open',
  }
}

export default function PickupWindow({ start, end, address, lat, lng, storeName }) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000) // refresh countdown every 30s
    return () => clearInterval(id)
  }, [])

  if (!start || !end) return null
  const { text, tone } = describe(start, end)

  return (
    <div className={`${styles.wrap} ${styles[tone]}`}>
      <div className={styles.left}>
        <Clock size={18}/>
        <div>
          <div className={styles.window}>Pick up between {to12h(start)} – {to12h(end)}</div>
          {text && <div className={styles.countdown}>{text}</div>}
        </div>
      </div>
      {(address || (lat != null && lng != null)) && (
        <a
          className={styles.navBtn}
          href={directionsUrl({ address, lat, lng })}
          target="_blank"
          rel="noopener noreferrer"
          title={`Directions to ${storeName || 'the store'}`}
        >
          <Navigation size={16}/> Navigate Me
        </a>
      )}
    </div>
  )
}
