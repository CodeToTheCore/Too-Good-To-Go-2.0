import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './HowItWorks.module.css'

const STORAGE_KEY = 'tgtg_onboarded_v1'

const STEPS = [
  {
    emoji: '🛍️',
    title: 'Browse & Pick',
    body: 'Find local stores selling surplus food at a steep discount. Each store shows a color clue (🥐 Bakery, 🥩 Meat, 🐟 Seafood, 🥗 Veggie) so you know what to expect.',
  },
  {
    emoji: '💳',
    title: 'Reserve Your Bag',
    body: 'Tap "Add to Cart" and check out. You instantly get a pickup code and a QR code — no surprises. Your money saved is tracked on your profile.',
  },
  {
    emoji: '📍',
    title: 'Show Up & Enjoy',
    body: 'Go to the store during your pickup window, show your code, and grab your mystery deal. Tap "Navigate Me" on your order to get directions in one click.',
  },
]

// Listen for this anywhere to re-open the guide:  window.dispatchEvent(new Event('open-how-it-works'))
export const openHowItWorks = () => window.dispatchEvent(new Event('open-how-it-works'))

export default function HowItWorks() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setOpen(true)
    const reopen = () => { setStep(0); setOpen(true) }
    window.addEventListener('open-how-it-works', reopen)
    return () => window.removeEventListener('open-how-it-works', reopen)
  }, [])

  const close = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setOpen(false)
  }

  if (!open) return null
  const s = STEPS[step]
  const last = step === STEPS.length - 1

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="How it works">
      <div className={styles.modal}>
        <button className={styles.close} onClick={close} aria-label="Close"><X size={22}/></button>

        <div className={styles.emoji} aria-hidden="true">{s.emoji}</div>
        <div className={styles.stepLabel}>Step {step + 1} of {STEPS.length}</div>
        <h2 className={styles.title}>{s.title}</h2>
        <p className={styles.body}>{s.body}</p>

        <div className={styles.dots}>
          {STEPS.map((_, i) => (
            <span key={i} className={`${styles.dot} ${i === step ? styles.activeDot : ''}`}/>
          ))}
        </div>

        <div className={styles.nav}>
          {step > 0 ? (
            <button className={styles.back} onClick={() => setStep(step - 1)}>
              <ChevronLeft size={18}/> Back
            </button>
          ) : <span/>}
          {last ? (
            <button className={styles.next} onClick={close}>Start saving food 🌿</button>
          ) : (
            <button className={styles.next} onClick={() => setStep(step + 1)}>
              Next <ChevronRight size={18}/>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
