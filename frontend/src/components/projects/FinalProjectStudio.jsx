import { useMemo, useState } from 'react'

const PILLARS = [
  {
    key: 'segment',
    title: 'One Primary Customer Segment',
    method: 'K-Means Clustering',
    detail:
      'Your startup must commit to one primary customer segment discovered from K-Means clustering. This selected cluster is the core audience for your storefront and must be translated into a clear customer persona with concrete business implications.',
  },
  {
    key: 'bundle',
    title: 'One Flagship Product Bundle',
    method: 'Market Basket Analysis (Apriori)',
    detail:
      'Your startup must commit to one flagship product bundle discovered from Apriori. The rule must be defended with exact Support, Confidence, and Lift values and tied to a launch strategy that is commercially logical.',
  },
  {
    key: 'recsys',
    title: 'One Recommendation Engine Logic Flow',
    method: 'RecSys Filtering Principles',
    detail:
      'Your startup must commit to one recommendation-engine logic flow. You must clearly explain whether your logic is Collaborative, Content-Based, or hybrid and how cold start is solved for your target audience.',
  },
]

const ROLES = [
  {
    key: 'cdo',
    role: 'Chief Data Officer (CDO)',
    mission:
      'Manages the VS Code environment, runs algorithms, and extracts the raw metrics.',
    deliverables: [
      'Compiled PySpark code in the notebook.',
      'Printed final outputs for K-Means target cluster.',
      'Printed Apriori outputs with Support, Confidence, and Lift.',
    ],
  },
  {
    key: 'cmo',
    role: 'Chief Marketing Officer (CMO)',
    mission:
      'Translates the K-Means output into customer narrative and owns recommendation and growth strategy.',
    deliverables: [
      'Customer persona narrative for selected cluster.',
      'RecSys UX flow and cold-start strategy.',
      'SEO and social/KOL strategy for traffic acquisition.',
    ],
  },
  {
    key: 'cfo',
    role: 'Chief Financial Officer (CFO)',
    mission:
      'Calculates AOV, prices the launch collection, and manages acquisition budget assumptions.',
    deliverables: [
      'Average Order Value (AOV) for target cluster.',
      'Launch collection pricing and bundle margin math.',
      'AdTech acquisition budget and bid logic.',
    ],
  },
  {
    key: 'ceo',
    role: 'Chief Executive Officer (CEO)',
    mission:
      'Submits weekly milestones, aligns strategy, and leads final Shark Tank presentation.',
    deliverables: [
      'Week-by-week milestone submissions.',
      'Consistency across Data Proof, Business Plan, and Deck.',
      'Final boardroom narrative and live defense leadership.',
    ],
  },
]

const DELIVERABLES = [
  {
    key: 'proof',
    name: 'The Data Proof (Google Colab Notebook)',
    format: 'One .ipynb file',
    requirement:
      'Notebook must display compiled PySpark code and clearly printed final outputs for selected K-Means cluster and Apriori rules, including exact Support, Confidence, and Lift values.',
    criticality: 'Critical Gate',
  },
  {
    key: 'plan',
    name: 'The Business Plan (Executive Summary)',
    format: 'At most 10 pages PDF or Word',
    requirement:
      'Summary combines weekly milestones and outlines RecSys logic, AdTech bidding strategy, and financial math for target cluster (AOV and bundle margins).',
    criticality: 'Critical Gate',
  },
  {
    key: 'deck',
    name: 'The Pitch Deck (Presentation Slides)',
    format: 'PDF or PowerPoint, strict 10-12 slides',
    requirement:
      'Must include at least one Big Data infrastructure slide and one recommendation-engine mock-up slide. Overlong decks fail speed-run constraints.',
    criticality: 'Critical Gate',
  },
]

const GANTT_TOTAL_WEEKS = 5

const GANTT_TRACKS = [
  { id: 'data', label: 'Data Workstream (CDO)' },
  { id: 'growth', label: 'Growth Workstream (CMO)' },
  { id: 'finance', label: 'Financial Workstream (CFO)' },
  { id: 'executive', label: 'Executive Governance (CEO)' },
  { id: 'boardroom', label: 'Boardroom Performance (All Team)' },
]

const GANTT_TASKS = [
  {
    id: 'week0-patent-office',
    trackId: 'data',
    title: 'Week 0: The Patent Office',
    start: 0,
    end: 1,
    owner: 'CDO + CEO',
    goal:
      'Set up your Colab environment, load the data, and run initial Exploratory Data Analysis.',
    due:
      'CEO submits a 2-sentence Letter of Intent detailing target segment and flagship Apriori bundle for instructor approval.',
    output: 'Letter of Intent approval gate',
    critical: true,
  },
  {
    id: 'week1-growth-blueprint',
    trackId: 'growth',
    title: 'Week 1: Growth Blueprint (RecSys)',
    start: 1,
    end: 2,
    owner: 'CMO',
    goal:
      'Apply recommendation-system concepts to define how your app recommends clothing.',
    due:
      'Submit a 1-page strategy detailing RecSys logic and cold-start solution for target audience.',
    output: 'RecSys strategy document',
    critical: false,
  },
  {
    id: 'week2-acquisition-financials',
    trackId: 'finance',
    title: 'Week 2: Acquisition and Financials',
    start: 2,
    end: 3,
    owner: 'CFO + CMO',
    goal:
      'Apply marketing and financial concepts to prove user acquisition can be profitable.',
    due:
      'Submit a 1-page AdTech bidding strategy, SEO/KOL traffic strategy, and AOV calculation for target cluster.',
    output: 'Acquisition + AOV submission',
    critical: false,
  },
  {
    id: 'week3-data-room',
    trackId: 'executive',
    title: 'Week 3: Synthesis and Q&A Preparation',
    start: 3,
    end: 4,
    owner: 'CEO + Entire Team',
    goal:
      'Synthesize all milestones into a coherent pitch narrative, run internal due diligence, and rehearse rapid-fire defense.',
    due:
      'Complete pre-final deck, align speaking flow, and prepare Q&A defense responses for likely Shark attacks.',
    output: 'Pre-final deck + Q&A defense bank',
    critical: false,
  },
  {
    id: 'week4-final-upload',
    trackId: 'boardroom',
    title: 'Week 4: Final Upload Deadline (Before Presentation)',
    start: 4,
    end: 4.45,
    owner: 'CEO + Entire Team',
    goal:
      'Finalize and upload all required artifacts before the presentation window begins.',
    due:
      'Final upload deadline is in Week 4 before presentation. Missing this gate risks severe penalties or pitch disqualification.',
    output: 'Final Data Room upload complete',
    critical: true,
  },
  {
    id: 'week4-presentation',
    trackId: 'boardroom',
    title: 'Week 4: Presentation and Speed-Run Defense',
    start: 4.5,
    end: 5,
    owner: 'Entire Team',
    goal:
      'Deliver live Shark Tank pitch and defend decisions under rapid cross-examination.',
    due:
      'Run the 20-minute boardroom format: 10-minute pitch plus 10-minute speed-run defense.',
    output: 'Live defense performance',
    critical: true,
  },
]

const SHARK_PHASES = {
  pitch: {
    title: 'Phase 1: The Pitch (10 Minutes)',
    description:
      'Present your business model and the data that proves it works without interruption. Since rival teams have pre-read your slides, live value comes from clarity and defensible logic.',
  },
  defense: {
    title: 'Phase 2: Speed Run Defense (10 Minutes)',
    description:
      'Room opens for rapid-fire cross-examination. Strong data-backed answers unlock bonus points, while weak answers disconnected from evidence are rejected and score zero.',
  },
}

const GRADING = [
  {
    label: 'Data Accuracy',
    weight: 30,
    detail:
      'Did you successfully and accurately apply K-Means and Apriori to the provided large-scale dataset?',
  },
  {
    label: 'Business Translation',
    weight: 30,
    detail:
      'Did you translate technical outputs into logical product, marketing, and financial decisions?',
  },
  {
    label: 'Defensible Logic and Shark Performance',
    weight: 40,
    detail:
      'How well did you defend assumptions and answer data-driven attacks in the boardroom?',
  },
]

const WEEK_TICKS = ['Week 0', 'Week 1', 'Week 2', 'Week 3', 'Week 4']

function ProgressBar({ value }) {
  return (
    <div className="ps-progress-track" aria-hidden>
      <div className="ps-progress-fill" style={{ width: `${value}%` }} />
    </div>
  )
}

function taskLeftPercent(start) {
  return (start / GANTT_TOTAL_WEEKS) * 100
}

function taskWidthPercent(start, end) {
  const value = ((end - start) / GANTT_TOTAL_WEEKS) * 100
  return Math.max(value, 4)
}

export default function FinalProjectStudio() {
  const [selectedPillar, setSelectedPillar] = useState(PILLARS[0].key)
  const [selectedRole, setSelectedRole] = useState(ROLES[0].key)
  const [selectedTaskId, setSelectedTaskId] = useState(GANTT_TASKS[0].id)
  const [selectedPhase, setSelectedPhase] = useState('pitch')

  const pillar = useMemo(
    () => PILLARS.find((item) => item.key === selectedPillar) || PILLARS[0],
    [selectedPillar],
  )
  const role = useMemo(
    () => ROLES.find((item) => item.key === selectedRole) || ROLES[0],
    [selectedRole],
  )
  const selectedTask = useMemo(
    () => GANTT_TASKS.find((item) => item.id === selectedTaskId) || GANTT_TASKS[0],
    [selectedTaskId],
  )

  const tasksByTrack = useMemo(() => {
    const grouped = {}
    for (const track of GANTT_TRACKS) grouped[track.id] = []
    for (const task of GANTT_TASKS) grouped[task.trackId].push(task)
    return grouped
  }, [])

  return (
    <div className="space-y-5">
      <section className="ps-hero">
        <div className="ps-hero-grid">
          <div className="space-y-3">
            <p className="ps-kicker">Final Project · VC Boardroom Scenario</p>
            <h3 className="ps-headline">THE FAST FASHION DISRUPTOR CHALLENGE</h3>
            <p className="ps-body">
              The global e-commerce apparel market is bloated. Mega-marketplaces are trying to
              sell everything to everyone, leaving highly profitable niche audiences underserved.
              Your startup task force is pitching to a Ho Chi Minh City-based VC syndicate with a
              $1,000,000 seed fund available only for the strongest data-driven business.
            </p>
            <p className="ps-body">
              Your mission is to identify a Blue Ocean inside 31.8 million real-world H&M
              transactions, design a targeted storefront, and prove the model with defensible
              metrics rather than broad marketing claims.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <article className="ps-stat">
              <p className="ps-stat-label">Seed Fund</p>
              <p className="ps-stat-value">$1,000,000</p>
            </article>
            <article className="ps-stat">
              <p className="ps-stat-label">Dataset</p>
              <p className="ps-stat-value">31.8M H&M transactions</p>
            </article>
            <article className="ps-stat">
              <p className="ps-stat-label">Boardroom</p>
              <p className="ps-stat-value">10 + 10 minutes</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section-shell ps-section space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-lg font-semibold text-slate-900">Startup Scope Lock</h4>
          <p className="ps-notice-pill ps-notice-warning">If you build 100 things, funding is rejected</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PILLARS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`ps-chip ${selectedPillar === item.key ? 'ps-chip-active' : ''}`}
              onClick={() => setSelectedPillar(item.key)}
            >
              {item.title}
            </button>
          ))}
        </div>
        <article className="ps-card">
          <p className="ps-notice-pill ps-notice-method">Method: {pillar.method}</p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{pillar.detail}</p>
        </article>
      </section>

      <section className="section-shell ps-section space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-lg font-semibold text-slate-900">C-Suite Operating Roles</h4>
          <p className="ps-notice-pill ps-notice-team">Teams of 4-6</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`ps-chip ${selectedRole === item.key ? 'ps-chip-active' : ''}`}
              onClick={() => setSelectedRole(item.key)}
            >
              {item.role}
            </button>
          ))}
        </div>
        <article className="ps-card">
          <h5 className="text-base font-semibold text-slate-900">{role.role}</h5>
          <p className="mt-2 text-sm leading-7 text-slate-700">{role.mission}</p>
          <div className="mt-3 space-y-2">
            {role.deliverables.map((line) => (
              <p key={line} className="ps-line-item">
                {line}
              </p>
            ))}
          </div>
        </article>
      </section>

      <section className="section-shell ps-section space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-lg font-semibold text-slate-900">Project Timeline (Interactive Gantt)</h4>
          <p className="ps-notice-pill ps-notice-timeline">Click any bar to inspect milestone details</p>
        </div>

        <div className="ps-gantt-shell">
          <div className="ps-gantt-board">
            <div className="ps-gantt-header">
              <div className="ps-gantt-track-head">Workstream</div>
              <div className="ps-gantt-time-head">
                {WEEK_TICKS.map((weekLabel) => (
                  <div key={weekLabel} className="ps-gantt-week-head">
                    {weekLabel}
                  </div>
                ))}
              </div>
            </div>

            {GANTT_TRACKS.map((track) => (
              <div key={track.id} className="ps-gantt-row">
                <div className="ps-gantt-track">{track.label}</div>
                <div className="ps-gantt-lane">
                  {Array.from({ length: GANTT_TOTAL_WEEKS + 1 }).map((_, index) => (
                    <span
                      key={`${track.id}-grid-${index}`}
                      className="ps-gantt-gridline"
                      style={{ left: `${(index / GANTT_TOTAL_WEEKS) * 100}%` }}
                    />
                  ))}

                  {(tasksByTrack[track.id] || []).map((task) => {
                    const active = task.id === selectedTaskId
                    const left = taskLeftPercent(task.start)
                    const width = taskWidthPercent(task.start, task.end)
                    return (
                      <button
                        key={task.id}
                        type="button"
                        className={`ps-gantt-task ${task.critical ? 'ps-gantt-task-critical' : ''} ${
                          active ? 'ps-gantt-task-active' : ''
                        }`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                        onClick={() => setSelectedTaskId(task.id)}
                        title={task.title}
                      >
                        <span className="ps-gantt-task-text">{task.title}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <article className="ps-card">
          <p className="ps-notice-pill ps-notice-owner">{selectedTask.owner}</p>
          <h5 className="mt-3 text-base font-semibold text-slate-900">{selectedTask.title}</h5>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            <strong>Goal:</strong> {selectedTask.goal}
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            <strong>Due:</strong> {selectedTask.due}
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            <strong>Required Output:</strong> {selectedTask.output}
          </p>
        </article>
      </section>

      <section className="section-shell ps-section space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-lg font-semibold text-slate-900">Data Room Checklist Gate</h4>
          <p className="ps-notice-pill ps-notice-critical">All 3 are mandatory for pitch eligibility</p>
        </div>
        <div className="space-y-3">
          {DELIVERABLES.map((item) => (
            <article key={item.key} className="ps-check-row">
              <span className="ps-check-critical">Critical</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {item.format} · {item.criticality}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-700">{item.requirement}</p>
              </div>
            </article>
          ))}
        </div>
        <article className="ps-alert ps-alert-critical">
          <p className="text-sm font-semibold text-rose-900">
            Missing any one of the 3 deliverables means your team is not eligible to pitch.
          </p>
          <p className="mt-1 text-sm text-rose-900">
            Treat these as hard compliance gates, not optional checklist items.
          </p>
        </article>
      </section>

      <section className="section-shell ps-section space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-lg font-semibold text-slate-900">Shark Tank Rules of Engagement</h4>
          <p className="ps-notice-pill ps-notice-boardroom">20-minute boardroom limit</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`ps-chip ${selectedPhase === 'pitch' ? 'ps-chip-active' : ''}`}
            onClick={() => setSelectedPhase('pitch')}
          >
            Pitch Phase
          </button>
          <button
            type="button"
            className={`ps-chip ${selectedPhase === 'defense' ? 'ps-chip-active' : ''}`}
            onClick={() => setSelectedPhase('defense')}
          >
            Defense Phase
          </button>
        </div>
        <article className="ps-card">
          <h5 className="text-base font-semibold text-slate-900">{SHARK_PHASES[selectedPhase].title}</h5>
          <p className="mt-2 text-sm leading-7 text-slate-700">{SHARK_PHASES[selectedPhase].description}</p>
        </article>
        <article className="ps-alert">
          <p className="text-sm font-semibold">
            Each team is given 3 Shark Tokens. Each question costs 1 token.
          </p>
          <p className="mt-1 text-sm">
            High-quality, data-driven questions score the highest.
          </p>
          <p className="mt-1 text-sm">
            Weak answers that ignore data are rejected by the instructor and receive zero points for that question.
          </p>
        </article>
      </section>

      <section className="section-shell ps-section space-y-4">
        <h4 className="text-lg font-semibold text-slate-900">Grading: Defensible Logic</h4>
        <p className="text-sm leading-7 text-slate-700">
          There is no single right startup to build from this dataset. Teams are graded on their ability
          to defend strategic decisions with transparent data logic.
        </p>
        <div className="space-y-3">
          {GRADING.map((item) => (
            <article key={item.label} className="ps-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="ps-notice-pill ps-notice-grade">{item.weight}%</p>
              </div>
              <div className="mt-2">
                <ProgressBar value={item.weight} />
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-700">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
