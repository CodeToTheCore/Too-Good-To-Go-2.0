import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Map, Heart, Package, User, LogOut, LayoutDashboard, ShoppingCart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>🛍️</span>
          <span className={styles.logoText}>Too Good To Go</span>
          <span className={styles.logoBadge}>2.0</span>
        </Link>

        <div className={styles.links}>
          <Link to="/" className={styles.link}><ShoppingBag size={18}/>Stores</Link>
          <Link to="/map" className={styles.link}><Map size={18}/>Map</Link>
          {user && <Link to="/favorites" className={styles.link}><Heart size={18}/>Favorites</Link>}
          {user && <Link to="/orders" className={styles.link}><Package size={18}/>Orders</Link>}
          {user?.role === 'store_owner' && <Link to="/dashboard" className={styles.link}><LayoutDashboard size={18}/>Dashboard</Link>}
        </div>

        <div className={styles.actions}>
          {user ? (
            <>
              <Link to="/cart" className={styles.cartBtn}>
                <ShoppingCart size={20}/>
                {count > 0 && <span className={styles.cartBadge}>{count}</span>}
              </Link>
              <Link to="/profile" className={styles.link}><User size={18}/>{user.full_name?.split(' ')[0]}</Link>
              <button onClick={handleLogout} className={styles.logoutBtn}><LogOut size={16}/></button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" style={{padding:'8px 16px',fontSize:'13px'}}>Log in</Link>
              <Link to="/register" className="btn btn-primary" style={{padding:'8px 16px',fontSize:'13px'}}>Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}