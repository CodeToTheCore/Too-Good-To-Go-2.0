import { createContext, useContext, useState, useEffect } from 'react'

const DeviceContext = createContext()

// Lets you toggle a phone-frame "mobile" preview of the whole app for show-and-tell.
export function DeviceProvider({ children }) {
  const [mobile, setMobile] = useState(() => localStorage.getItem('tgtg_device') === 'mobile')

  useEffect(() => {
    localStorage.setItem('tgtg_device', mobile ? 'mobile' : 'desktop')
    document.body.classList.toggle('device-mobile-active', mobile)
    return () => document.body.classList.remove('device-mobile-active')
  }, [mobile])

  const toggle = () => setMobile(m => !m)

  return (
    <DeviceContext.Provider value={{ mobile, toggle }}>
      {children}
    </DeviceContext.Provider>
  )
}

export const useDevice = () => useContext(DeviceContext)
