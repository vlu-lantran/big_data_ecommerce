import { useState } from 'react'

export default function CustomSimulation({ apiBaseUrl, apiRoute }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [payload, setPayload] = useState(null)

  async function runSimulation() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${apiBaseUrl}${apiRoute}`)
      if (!response.ok) {
        throw new Error(`Simulation failed (${response.status})`)
      }
      const data = await response.json()
      setPayload(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown simulation error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <button type="button" onClick={runSimulation} disabled={loading}>
        {loading ? 'Running...' : 'Run Simulation'}
      </button>

      {error && <p>{error}</p>}

      {payload && <pre>{JSON.stringify(payload, null, 2)}</pre>}
    </section>
  )
}
