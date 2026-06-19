// Shared time-formatting helpers.
// pickup_start / pickup_end are stored as plain "HH:MM" 24h strings,
// so this is a display-format conversion to 12h AM/PM (not a timezone shift).
export const to12h = t => {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hr = +h % 12 || 12
  const ap = +h >= 12 ? 'PM' : 'AM'
  return +m === 0 ? `${hr} ${ap}` : `${hr}:${m} ${ap}`
}
