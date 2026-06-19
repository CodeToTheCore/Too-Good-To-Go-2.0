import { useState, useEffect } from 'react'
import { Ticket, Zap } from 'lucide-react'
import { getFlexQuote, buyFlexPass } from '../api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './FlexPassWidget.module.css'

const PUNCH_OPTIONS = [5, 10, 20]

export default function FlexPassWidget({ store }) {
  const { user } = useAuth()
  const [punches, setPunches] = useState(5)
  const [quote, setQuote] = useState(null)
  const [buying, setBuying] = useState(false)

  useEffect(() => {
    let cancelled = false
    getFlexQuote(store.id, punches)
      .then(r => { if (!cancelled) setQuote(r.data) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [store.id, punches])

  const handleBuy = async () => {
    if (!user) return toast.error('Log in to buy a Flex Pass')
    setBuying(true)
    try {
      await buyFlexPass({ store_id: store.id, total_punches: punches })
      toast.success(`Flex Pass purchased — ${punches} pickups at ${store.name}!`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not buy pass')
    } finally {
      setBuying(false)
    }
  }

  const full = quote ? (quote.per_punch / (1 - quote.discount_pct / 100)) * punches : null

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <Ticket size={20}/>
        <div>
          <div className={styles.title}>Flex Pass</div>
          <div className={styles.sub}>Prepay & save. <Zap size={12} style={{verticalAlign:'-1px'}}/> Priority early access to daily leftovers.</div>
        </div>
      </div>

      <div className={styles.options}>
        {PUNCH_OPTIONS.map(n => (
          <button key={n} onClick={() => setPunches(n)}
                  className={`${styles.opt} ${punches === n ? styles.optActive : ''}`}>
            {n} pickups
          </button>
        ))}
      </div>

      {quote && (
        <div className={styles.priceRow}>
          <div>
            <span className={styles.price}>${quote.total.toFixed(2)}</span>
            {full && <span className={styles.full}>${full.toFixed(2)}</span>}
          </div>
          <span className={styles.save}>Save {quote.discount_pct}%</span>
        </div>
      )}

      <button className={`btn btn-primary ${styles.buy}`} onClick={handleBuy} disabled={buying}>
        {buying ? 'Processing...' : `Buy ${punches}-pickup pass`}
      </button>
    </div>
  )
}
