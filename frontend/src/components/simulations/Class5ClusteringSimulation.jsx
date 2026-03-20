import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const DATASET_OPTIONS = [
  {
    value: 'spending-frequency',
    label: 'Users: Spending vs Frequency (famous example)',
  },
  {
    value: 'session-engagement',
    label: 'Visitors: Session Duration vs Pages Viewed',
  },
]

const CLUSTER_COLORS = ['#0f766e', '#2563eb', '#f97316', '#dc2626', '#8b5cf6', '#0ea5e9']
const FRAME_DELAY_MS = 1600
const CENTROID_TRANSITION_MS = 950

function StepBadge({ frame }) {
  if (!frame) return null

  return (
    <p className="soft-badge">
      Iteration {frame.iteration} · {frame.phase} step · changed assignments: {frame.changed_count}
    </p>
  )
}

function CentroidMarker({ cx, cy, fill }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={9} fill={fill} stroke="#ffffff" strokeWidth={2.5} />
      <path d={`M ${cx - 5} ${cy} L ${cx + 5} ${cy} M ${cx} ${cy - 5} L ${cx} ${cy + 5}`} stroke="#ffffff" strokeWidth={1.7} strokeLinecap="round" />
    </g>
  )
}

export default function Class5ClusteringSimulation({ apiBaseUrl, apiRoute }) {
  const effectiveApiRoute = apiRoute || '/api/simulations/clustering'

  const [dataset, setDataset] = useState('spending-frequency')
  const [k, setK] = useState(3)
  const [maxIter, setMaxIter] = useState(10)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const [frameIndex, setFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const frames = result?.history || []
  const currentFrame = frames[frameIndex]

  useEffect(() => {
    if (!isPlaying) return
    if (frames.length === 0) return

    if (frameIndex >= frames.length - 1) {
      setIsPlaying(false)
      return
    }

    const timer = setTimeout(() => {
      setFrameIndex((prev) => Math.min(prev + 1, frames.length - 1))
    }, FRAME_DELAY_MS)

    return () => clearTimeout(timer)
  }, [isPlaying, frameIndex, frames])

  const clusterSeries = useMemo(() => {
    if (!currentFrame) {
      return { grouped: [], unassigned: [], centroidsByCluster: [] }
    }

    const grouped = Array.from({ length: result?.k || 0 }, (_, idx) => ({ cluster: idx, points: [] }))
    const unassigned = []

    for (const point of currentFrame.points) {
      if (point.cluster === -1 || point.cluster === null || point.cluster === undefined) {
        unassigned.push(point)
      } else if (grouped[point.cluster]) {
        grouped[point.cluster].points.push(point)
      }
    }

    const centroidsByCluster = (currentFrame.centroids || []).map((centroid) => ({ ...centroid }))

    return {
      grouped,
      unassigned,
      centroidsByCluster,
    }
  }, [currentFrame, result])

  async function runSimulation() {
    setLoading(true)
    setError('')
    setIsPlaying(false)

    try {
      const params = new URLSearchParams({
        dataset,
        k: String(k),
        max_iter: String(maxIter),
      })

      const response = await fetch(`${apiBaseUrl}${effectiveApiRoute}?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`Simulation API call failed (${response.status})`)
      }

      const payload = await response.json()
      setResult(payload)
      setFrameIndex(0)
      setIsPlaying(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error while running k-means')
    } finally {
      setLoading(false)
    }
  }

  function handlePlayPause() {
    if (frames.length === 0) return

    if (frameIndex >= frames.length - 1) {
      setFrameIndex(0)
      setIsPlaying(true)
      return
    }

    setIsPlaying((prev) => !prev)
  }

  function stepBackward() {
    setIsPlaying(false)
    setFrameIndex((prev) => Math.max(prev - 1, 0))
  }

  function stepForward() {
    setIsPlaying(false)
    setFrameIndex((prev) => Math.min(prev + 1, Math.max(frames.length - 1, 0)))
  }

  function resetAnimation() {
    setIsPlaying(false)
    setFrameIndex(0)
  }

  return (
    <div className="space-y-4">
      <div className="section-shell space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm font-medium text-slate-700">
            Dataset example
            <select
              className="theme-input"
              value={dataset}
              onChange={(event) => setDataset(event.target.value)}
            >
              {DATASET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Number of clusters (k)
            <select
              className="theme-input"
              value={k}
              onChange={(event) => setK(Number(event.target.value))}
            >
              {[2, 3, 4, 5, 6].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Max iterations
            <select
              className="theme-input"
              value={maxIter}
              onChange={(event) => setMaxIter(Number(event.target.value))}
            >
              {[6, 8, 10, 12, 15].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="soft-badge max-w-full truncate text-slate-700">
            API route: <code className="ml-1">{effectiveApiRoute}</code>
          </p>
          <button type="button" className="primary-pill" onClick={runSimulation} disabled={loading}>
            {loading ? 'Running K-Means...' : 'Run K-Means Simulation'}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-100 bg-red-50/90 p-3 text-sm text-red-700">{error}</p>
      )}

      {result && (
        <>
          <div className="section-shell space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StepBadge frame={currentFrame} />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                  onClick={stepBackward}
                  disabled={frameIndex === 0}
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? 'Pause' : frameIndex >= frames.length - 1 ? 'Replay' : 'Play'}
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                  onClick={stepForward}
                  disabled={frameIndex >= frames.length - 1}
                >
                  Next
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                  onClick={resetAnimation}
                  disabled={frameIndex === 0}
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-white/70 bg-white p-3 shadow-sm sm:p-4">
              <div className="mb-2 text-sm font-semibold text-slate-700">{result.dataset_label}</div>
              <div className="mb-3 flex flex-wrap gap-2">
                {Array.from({ length: result.k }, (_, idx) => (
                  <span
                    key={`cluster-legend-${idx}`}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: CLUSTER_COLORS[idx % CLUSTER_COLORS.length] }}
                    />
                    Cluster {idx + 1}
                  </span>
                ))}
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
                  <span className="inline-block h-3 w-3 rounded-full border-2 border-slate-800 bg-white" />
                  Centroids
                </span>
              </div>

              <ResponsiveContainer width="100%" height={390}>
                <ScatterChart margin={{ top: 10, right: 18, bottom: 14, left: 8 }}>
                  <CartesianGrid stroke="#dbeafe" strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="x" tick={{ fill: '#4b5563', fontSize: 12 }} tickMargin={8} />
                  <YAxis
                    type="number"
                    dataKey="y"
                    tick={{ fill: '#4b5563', fontSize: 12 }}
                    width={42}
                    tickMargin={8}
                  />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />

                  {clusterSeries.grouped.map((clusterSet) => (
                    <Scatter
                      key={clusterSet.cluster}
                      name={`Cluster ${clusterSet.cluster + 1}`}
                      data={clusterSet.points}
                      fill={CLUSTER_COLORS[clusterSet.cluster % CLUSTER_COLORS.length]}
                      isAnimationActive={false}
                    />
                  ))}

                  {clusterSeries.unassigned.length > 0 && (
                    <Scatter
                      name="Unassigned"
                      data={clusterSeries.unassigned}
                      fill="#94a3b8"
                      isAnimationActive={false}
                    />
                  )}

                  {clusterSeries.centroidsByCluster.map((centroid) => (
                    <Scatter
                      key={`centroid-${centroid.cluster}`}
                      name={`Centroid ${centroid.cluster + 1}`}
                      data={[centroid]}
                      fill={CLUSTER_COLORS[centroid.cluster % CLUSTER_COLORS.length]}
                      shape={CentroidMarker}
                      isAnimationActive
                      animationDuration={CENTROID_TRANSITION_MS}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>

              <p className="mt-2 text-xs text-slate-500">
                X axis: {result.features.x_label} | Y axis: {result.features.y_label}
              </p>
            </div>

            <div
              className={`rounded-xl px-3 py-2 text-sm ${
                result.converged
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border border-amber-200 bg-amber-50 text-amber-700'
              }`}
            >
              {result.message}
            </div>
          </div>

          <div className="section-shell">
            <h4 className="mb-3 text-sm font-semibold text-slate-800">Input data sample</h4>
            <div className="theme-table-shell overflow-x-auto rounded-xl">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">{result.features.x_label}</th>
                    <th className="px-3 py-2">{result.features.y_label}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.table_rows.slice(0, 12).map((row) => (
                    <tr key={row.id} className="border-t border-slate-100 text-slate-700">
                      <td className="px-3 py-2 font-medium">{row.id}</td>
                      <td className="px-3 py-2">{row.name}</td>
                      <td className="px-3 py-2">{row[result.features.x_key]}</td>
                      <td className="px-3 py-2">{row[result.features.y_key]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Showing source rows for context while the chart renders a denser point cloud.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
