export function isAllowedOrigin(): boolean {
  if (typeof window === 'undefined') return false
  const allowed = ['https://www.riyatouch.com', 'https://riyatouch.com', 'https://dev-traders.vercel.app']
  if (allowed.includes(window.location.origin)) return true
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (clientId && clientId !== 'your-google-client-id-here') return true
  }
  return false
}

export function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Sign-In script'))
    document.head.appendChild(script)
  })
}
