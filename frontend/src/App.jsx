import { useEffect, useMemo, useState } from 'react'
import LessonView from './components/LessonView'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const themeStorageKey = 'bigdata-theme'

function formatFolderName(folder) {
  return folder
    .replace(/^lesson-\d+-/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function App() {
  const [theme, setTheme] = useState('light')
  const [lessonFolders, setLessonFolders] = useState([])
  const [lessonTitles, setLessonTitles] = useState({})
  const [activeLessonFolder, setActiveLessonFolder] = useState('')
  const [activeLessonMeta, setActiveLessonMeta] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = window.localStorage.getItem(themeStorageKey)
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored)
      return
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark ? 'dark' : 'light')
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem(themeStorageKey, theme)
  }, [theme])

  useEffect(() => {
    async function loadLessonIndex() {
      try {
        setError('')
        const response = await fetch(`${apiBaseUrl}/mock_gcs_bucket/classes/index.json`, {
          cache: 'no-store',
        })
        if (!response.ok) {
          throw new Error(`Unable to load classes index (${response.status})`)
        }

        const folders = await response.json()
        setLessonFolders(folders)

        const titleEntries = await Promise.all(
          folders.map(async (folder) => {
            try {
              const metaResponse = await fetch(
                `${apiBaseUrl}/mock_gcs_bucket/classes/${folder}/meta.json`,
                {
                  cache: 'no-store',
                },
              )
              if (!metaResponse.ok) {
                return [folder, formatFolderName(folder)]
              }
              const meta = await metaResponse.json()
              return [folder, meta?.title || formatFolderName(folder)]
            } catch {
              return [folder, formatFolderName(folder)]
            }
          }),
        )
        setLessonTitles(Object.fromEntries(titleEntries))

        if (folders.length > 0) {
          setActiveLessonFolder(folders[0])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error while loading lessons')
      }
    }

    loadLessonIndex()
  }, [])

  useEffect(() => {
    if (!activeLessonFolder) return

    async function loadLessonMeta() {
      try {
        setError('')
        const response = await fetch(
          `${apiBaseUrl}/mock_gcs_bucket/classes/${activeLessonFolder}/meta.json`,
          {
            cache: 'no-store',
          },
        )

        if (!response.ok) {
          throw new Error(`Unable to load lesson metadata (${response.status})`)
        }

        const meta = await response.json()
        setActiveLessonMeta(meta)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error while loading metadata')
      }
    }

    loadLessonMeta()
  }, [activeLessonFolder])

  const lessonTitle = useMemo(() => {
    if (activeLessonMeta?.title) return activeLessonMeta.title
    if (activeLessonFolder) return formatFolderName(activeLessonFolder)
    return 'No lesson selected'
  }, [activeLessonFolder, activeLessonMeta])

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-soft-float absolute -left-24 top-16 h-64 w-64 rounded-full bg-cyan-200/45 blur-3xl dark:bg-cyan-600/20" />
        <div className="animate-soft-float absolute -right-20 top-44 h-72 w-72 rounded-full bg-blue-200/45 blur-3xl [animation-delay:0.7s] dark:bg-blue-700/20" />
        <div className="animate-soft-float absolute bottom-0 left-1/3 h-60 w-60 rounded-full bg-emerald-200/35 blur-3xl [animation-delay:1.1s] dark:bg-emerald-700/20" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="glass-panel animate-fade-up mb-6 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="soft-badge">Zero-Touch Modular Learning Platform</p>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Big Data Interactive Classroom
              </h1>
              <p className="mt-1 text-sm text-slate-600 sm:text-base">
                Drop-in lessons and simulations, dynamically discovered at runtime.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="soft-badge">{lessonFolders.length} lessons loaded</p>
              <button
                type="button"
                className="rounded-xl border border-slate-200/70 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              >
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="glass-panel animate-fade-up rounded-2xl p-4 [animation-delay:0.06s] sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Course Navigator</h2>
              <span className="text-xs text-slate-500">Dynamic</span>
            </div>

            <nav className="space-y-2">
              {lessonFolders.map((folder) => {
                const isActive = folder === activeLessonFolder
                return (
                  <button
                    key={folder}
                    type="button"
                    className={`nav-chip ${isActive ? 'nav-chip-active animate-glow' : ''}`}
                    onClick={() => setActiveLessonFolder(folder)}
                  >
                    <span className="block truncate">{lessonTitles[folder] || formatFolderName(folder)}</span>
                  </button>
                )
              })}

              {lessonFolders.length === 0 && !error && (
                <p className="rounded-xl bg-white/70 px-3 py-3 text-sm text-slate-500">
                  No lessons available in classes/index.json.
                </p>
              )}
            </nav>
          </aside>

          <main className="glass-panel animate-fade-up rounded-2xl p-5 [animation-delay:0.1s] sm:p-6 lg:p-7">
            <header className="mb-5 border-b border-white/70 pb-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Current Lesson</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {lessonTitle}
              </h2>
            </header>

            {error ? (
              <p className="rounded-xl border border-red-100 bg-red-50/90 p-3 text-sm text-red-700">
                {error}
              </p>
            ) : (
              <LessonView
                apiBaseUrl={apiBaseUrl}
                lessonFolder={activeLessonFolder}
                lessonMeta={activeLessonMeta}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
