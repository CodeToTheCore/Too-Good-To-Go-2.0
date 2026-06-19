// Builds a universal Google Maps directions link (works on desktop, Android, and iOS).
export function directionsUrl({ address, lat, lng }) {
  const dest = (lat != null && lng != null) ? `${lat},${lng}` : (address || '')
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`
}
