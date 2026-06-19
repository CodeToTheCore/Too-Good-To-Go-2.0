import { Smartphone, Monitor } from 'lucide-react'
import { useDevice } from '../context/DeviceContext'
import styles from './DeviceToggle.module.css'

export default function DeviceToggle() {
  const { mobile, toggle } = useDevice()
  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      title={mobile ? 'Switch to desktop view' : 'Preview mobile view'}
    >
      {mobile ? <Monitor size={16}/> : <Smartphone size={16}/>}
      {mobile ? 'Desktop view' : 'Mobile view'}
    </button>
  )
}
