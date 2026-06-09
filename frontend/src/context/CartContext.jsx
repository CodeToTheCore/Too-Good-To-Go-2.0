import { createContext, useContext, useState } from 'react'
import toast from 'react-hot-toast'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  const addToCart = (bag, store) => {
    setItems(prev => {
      const existing = prev.find(i => i.bag.id === bag.id)
      if (existing) {
        if (existing.quantity >= bag.quantity_available) {
          toast.error('No more bags available!')
          return prev
        }
        return prev.map(i => i.bag.id === bag.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      toast.success(`Added to cart!`)
      return [...prev, { bag, store, quantity: 1 }]
    })
  }

  const removeFromCart = (bagId) => setItems(prev => prev.filter(i => i.bag.id !== bagId))
  const updateQuantity = (bagId, qty) => {
    if (qty <= 0) return removeFromCart(bagId)
    setItems(prev => prev.map(i => i.bag.id === bagId ? { ...i, quantity: qty } : i))
  }
  const clearCart = () => setItems([])
  const total = items.reduce((sum, i) => sum + i.bag.discounted_price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)