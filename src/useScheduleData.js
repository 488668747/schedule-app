import { useEffect, useRef, useState } from 'react'
import { createScheduleStorage } from './utils/storage'

export default function useScheduleData() {
  const [data, setData] = useState({ projects: [], tasks: [] })
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(0)
  const current = useRef(data)
  const queue = useRef(Promise.resolve())
  const storage = useRef(null)

  useEffect(() => {
    let active = true
    if (!storage.current) storage.current = createScheduleStorage({ indexedDB: window.indexedDB, legacyStorage: window.localStorage })
    storage.current.load().then(snapshot => {
      if (!active) return
      current.current = snapshot
      setData(snapshot)
      setReady(true)
      setLoading(false)
    }).catch(error => { if (active) { setError(error.message); setLoading(false) } })
    return () => { active = false }
  }, [])

  const updateData = (change) => {
    setPending(value => value + 1)
    setError('')
    const job = queue.current.then(async () => {
      const snapshot = change(current.current)
      await storage.current.save(snapshot)
      current.current = snapshot
      setData(snapshot)
    })
    queue.current = job.catch(() => {})
    return job.catch(error => { setError(error.message); throw error }).finally(() => setPending(value => value - 1))
  }
  return { ...data, ready, loading, error, saving: pending > 0, updateData }
}
