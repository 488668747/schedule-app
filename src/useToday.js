import { useEffect, useState } from 'react'
import { toDateString } from './utils/date'

export default function useToday() {
  const [today, setToday] = useState(() => toDateString(new Date()))

  useEffect(() => {
    const update = () => setToday(toDateString(new Date()))
    const timer = window.setInterval(update, 60000)
    window.addEventListener('focus', update)
    document.addEventListener('visibilitychange', update)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  return today
}
