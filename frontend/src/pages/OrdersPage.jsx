import { useState, useEffect } from 'react'
import { getMyOrders } from '../api'
import { format } from 'date-fns'
import { Package, CheckCircle, Clock, QrCode } from 'lucide-react'
import PickupWindow from '../components/PickupWindow'
import styles from './OrdersPage.module.css'

const STATUS_COLORS = {
  pending: 'orange',
  confirmed: 'blue',
  ready: 'green',
  collected: 'gray',
  cancelled: 'red'
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showQr, setShowQr] = useState(null)

  useEffect(() => {
    getMyOrders().then(r => setOrders(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-spinner"><div className="spinner"/></div>

  return (
    <div className="page-container" style={{paddingTop:32, paddingBottom:48}}>
      <h1 className={styles.title}>My Orders</h1>

      {orders.length === 0 ? (
        <div className={styles.empty}>
          <Package size={56}/>
          <p>No orders yet. Go save some food!</p>
        </div>
      ) : (
        <div className={styles.list}>
          {orders.map(order => (
            <div key={order.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <span className={styles.orderId}>Order #{order.id}</span>
                  <span className={`badge ${styles[`status_${STATUS_COLORS[order.status]}`]}`}>{order.status}</span>
                </div>
                <div className={styles.cardDate}>
                  <Clock size={13}/> {format(new Date(order.created_at), 'MMM d, yyyy HH:mm')}
                </div>
              </div>

              {order.items?.[0]?.pickup_start && order.status !== 'collected' && order.status !== 'cancelled' && (
                <PickupWindow
                  start={order.items[0].pickup_start}
                  end={order.items[0].pickup_end}
                  address={order.items[0].store_address}
                  lat={order.items[0].store_lat}
                  lng={order.items[0].store_lng}
                  storeName={order.items[0].store_name}
                />
              )}

              <div className={styles.items}>
                {order.items?.map((item, i) => (
                  <div key={i} className={styles.itemRow}>
                    <span>{item.title || `Bag #${item.bag_id}`} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.total}>Total: <strong>${order.total_price?.toFixed(2)}</strong></div>
                {order.pickup_code && (
                  <div className={styles.pickupCode}>
                    Pickup code: <strong>{order.pickup_code}</strong>
                  </div>
                )}
                {order.qr_code_url && (
                  <button className="btn btn-outline" style={{fontSize:13, padding:'6px 14px'}} onClick={() => setShowQr(showQr === order.id ? null : order.id)}>
                    <QrCode size={14}/> QR Code
                  </button>
                )}
              </div>

              {showQr === order.id && order.qr_code_url && (
                <div className={styles.qrWrap}>
                  <img src={order.qr_code_url} alt="QR Code" className={styles.qrCode}/>
                  <p className={styles.qrNote}>Show this at the store</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}