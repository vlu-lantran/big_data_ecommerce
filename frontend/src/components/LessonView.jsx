import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import Class5ClusteringSimulation from './simulations/Class5ClusteringSimulation'
import MidtermTestSimulation from './simulations/MidtermTestSimulation'
import FinalProjectStudio from './projects/FinalProjectStudio'
import InfographicView from './InfographicView'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const tabs = {
  slides: 'Slides',
  infographic: 'Infographic',
  project: 'Project Studio',
  simulation: 'Simulation',
}

const markdownComponents = {
  iframe: ({ node, ...props }) => (
    <div className="not-prose my-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <iframe
        {...props}
        className="h-[260px] w-full sm:h-[400px] lg:h-[520px]"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  ),
}

function GenericChart({ chartType, data, xKey, yKey }) {
  const commonProps = {
    data,
    margin: { top: 16, right: 24, bottom: 12, left: 6 },
  }

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={360}>
        <LineChart {...commonProps}>
          <CartesianGrid stroke="#dbeafe" strokeDasharray="3 3" />
          <XAxis dataKey={xKey} tick={{ fill: '#4b5563', fontSize: 12 }} />
          <YAxis tick={{ fill: '#4b5563', fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey={yKey} stroke="#0f766e" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  if (chartType === 'area') {
    return (
      <ResponsiveContainer width="100%" height={360}>
        <AreaChart {...commonProps}>
          <CartesianGrid stroke="#dbeafe" strokeDasharray="3 3" />
          <XAxis dataKey={xKey} tick={{ fill: '#4b5563', fontSize: 12 }} />
          <YAxis tick={{ fill: '#4b5563', fontSize: 12 }} />
          <Tooltip />
          <Area type="monotone" dataKey={yKey} stroke="#2563eb" fill="#bfdbfe" />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart {...commonProps}>
        <CartesianGrid stroke="#dbeafe" strokeDasharray="3 3" />
        <XAxis dataKey={xKey} tick={{ fill: '#4b5563', fontSize: 12 }} />
        <YAxis tick={{ fill: '#4b5563', fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey={yKey} fill="#2563eb" radius={[7, 7, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function SlidesSkeleton() {
  return (
    <div className="space-y-3">
      <div className="skeleton-line w-2/3" />
      <div className="skeleton-line w-full" />
      <div className="skeleton-line w-5/6" />
      <div className="skeleton-line w-4/6" />
    </div>
  )
}

export default function LessonView({ apiBaseUrl, lessonFolder, lessonMeta }) {
  const [activeTab, setActiveTab] = useState(tabs.slides)
  const [slidesMarkdown, setSlidesMarkdown] = useState('')
  const [infographicPayload, setInfographicPayload] = useState(null)
  const [simulationData, setSimulationData] = useState([])
  const [loadingSlides, setLoadingSlides] = useState(false)
  const [loadingInfographic, setLoadingInfographic] = useState(false)
  const [loadingSimulation, setLoadingSimulation] = useState(false)
  const [error, setError] = useState('')

  const hasInfographic = useMemo(() => !!lessonMeta?.infographic_file, [lessonMeta])
  const hideSlides = useMemo(() => lessonMeta?.hide_slides === true, [lessonMeta])
  const hasProject = useMemo(() => !!lessonMeta?.project_module, [lessonMeta])
  const hasSimulation = useMemo(
    () => !!lessonMeta?.api_route || !!lessonMeta?.simulation_module,
    [lessonMeta],
  )

  const availableTabs = useMemo(() => {
    const result = []
    if (!hideSlides) result.push(tabs.slides)
    if (hasInfographic) result.push(tabs.infographic)
    if (hasProject) result.push(tabs.project)
    if (hasSimulation) result.push(tabs.simulation)
    if (result.length === 0) result.push(tabs.slides)
    return result
  }, [hideSlides, hasInfographic, hasProject, hasSimulation])

  useEffect(() => {
    if (!lessonFolder || !lessonMeta) return

    async function loadSlides() {
      setLoadingSlides(true)
      setError('')

      try {
        const response = await fetch(
          `${apiBaseUrl}/mock_gcs_bucket/classes/${lessonFolder}/slides.md`,
          {
            cache: 'no-store',
          },
        )
        if (!response.ok) {
          throw new Error(`Unable to load slides (${response.status})`)
        }
        const markdown = await response.text()
        setSlidesMarkdown(markdown)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error while loading slides')
      } finally {
        setLoadingSlides(false)
      }
    }

    setActiveTab((prev) => (availableTabs.includes(prev) ? prev : availableTabs[0]))
    setSimulationData([])

    if (!hideSlides) {
      loadSlides()
    } else {
      setSlidesMarkdown('')
      setLoadingSlides(false)
      setError('')
    }
  }, [apiBaseUrl, lessonFolder, lessonMeta, hideSlides, availableTabs])

  useEffect(() => {
    let ignore = false

    if (!lessonFolder || !lessonMeta || !lessonMeta?.infographic_file) {
      setInfographicPayload(null)
      setLoadingInfographic(false)
      return
    }

    async function loadInfographic() {
      setLoadingInfographic(true)
      setInfographicPayload(null) // Reset payload immediately when starting a new load
      setError('')

      try {
        const response = await fetch(
          `${apiBaseUrl}/mock_gcs_bucket/classes/${lessonFolder}/${lessonMeta.infographic_file}`,
          {
            cache: 'no-store',
          },
        )

        if (!response.ok) {
          throw new Error(`Unable to load infographic (${response.status})`)
        }

        const payload = await response.json()
        if (!ignore) {
          setInfographicPayload(payload)
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Unknown error while loading infographic')
        }
      } finally {
        if (!ignore) {
          setLoadingInfographic(false)
        }
      }
    }

    loadInfographic()

    return () => {
      ignore = true
    }
  }, [apiBaseUrl, lessonFolder, lessonMeta?.infographic_file])

  useEffect(() => {
    if (availableTabs.includes(activeTab)) return
    setActiveTab(availableTabs[0])
  }, [activeTab, availableTabs])

  const hasMeta = useMemo(() => !!lessonMeta?.api_route, [lessonMeta])
  const DedicatedSimulationModule = useMemo(() => {
    if (lessonMeta?.simulation_module === 'class5-kmeans') {
      return Class5ClusteringSimulation
    }
    if (lessonMeta?.simulation_module === 'midterm-test') {
      return MidtermTestSimulation
    }
    return null
  }, [lessonMeta?.simulation_module])

  const DedicatedProjectModule = useMemo(() => {
    if (lessonMeta?.project_module === 'final-project-studio') {
      return FinalProjectStudio
    }
    return null
  }, [lessonMeta?.project_module])

  async function runSimulation() {
    if (!hasMeta) return

    setLoadingSimulation(true)
    setError('')

    try {
      const response = await fetch(`${apiBaseUrl}${lessonMeta.api_route}`)
      if (!response.ok) {
        throw new Error(`Simulation API call failed (${response.status})`)
      }

      const payload = await response.json()
      if (!Array.isArray(payload)) {
        throw new Error('Simulation response must be an array of objects')
      }

      setSimulationData(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error while running simulation')
    } finally {
      setLoadingSimulation(false)
    }
  }

  return (
    <section className="animate-fade-up [animation-delay:0.16s]">
      <div className="mb-5 inline-flex rounded-xl border border-white/80 bg-white/65 p-1 backdrop-blur-md">
        {availableTabs.map((tab) => {
          const isActive = tab === activeTab
          return (
            <button
              key={tab}
              type="button"
              className={`tab-chip ${isActive ? 'tab-chip-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-red-100 bg-red-50/90 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {activeTab === tabs.slides && (
        <article className="section-shell">
          {loadingSlides ? (
            <SlidesSkeleton />
          ) : (
            <div className="markdown-content">
              <ReactMarkdown rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                {slidesMarkdown}
              </ReactMarkdown>
            </div>
          )}
        </article>
      )}

      {activeTab === tabs.infographic && (
        <>
          {loadingInfographic ? (
            <div className="section-shell">
              <SlidesSkeleton />
            </div>
          ) : hasInfographic && infographicPayload ? (
            <InfographicView payload={infographicPayload} />
          ) : (
            <div className="section-shell">
              <p className="text-sm text-slate-600">
                No infographic content configured for this lesson.
              </p>
            </div>
          )}
        </>
      )}

      {activeTab === tabs.project && hasProject && (
        <>
          {DedicatedProjectModule ? (
            <DedicatedProjectModule />
          ) : (
            <div className="section-shell">
              <p className="text-sm text-slate-600">No project module configured for this lesson.</p>
            </div>
          )}
        </>
      )}

      {activeTab === tabs.simulation && hasSimulation && (
        <>
          {DedicatedSimulationModule ? (
            <DedicatedSimulationModule apiBaseUrl={apiBaseUrl} apiRoute={lessonMeta?.api_route} />
          ) : (
            <div className="section-shell space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="soft-badge max-w-full truncate text-slate-700">
                  API route: <code className="ml-1">{lessonMeta?.api_route || 'N/A'}</code>
                </p>
                <button
                  type="button"
                  className="primary-pill"
                  onClick={runSimulation}
                  disabled={!hasMeta || loadingSimulation}
                >
                  {loadingSimulation ? 'Running...' : 'Run Simulation'}
                </button>
              </div>

              {simulationData.length > 0 ? (
                <div className="animate-fade-up rounded-xl border border-white/70 bg-white p-3 shadow-sm sm:p-4">
                  <GenericChart
                    chartType={lessonMeta?.chart_type}
                    data={simulationData}
                    xKey={lessonMeta?.x_key}
                    yKey={lessonMeta?.y_key}
                  />
                </div>
              ) : (
                <p className="rounded-lg bg-white/70 px-3 py-2 text-sm text-slate-600">
                  No simulation data yet. Click "Run Simulation".
                </p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}
