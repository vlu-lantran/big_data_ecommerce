import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

const toneClasses = {
  info: 'inf-callout-info',
  success: 'inf-callout-success',
  warning: 'inf-callout-warning',
  danger: 'inf-callout-danger',
}

const formulaToneClasses = {
  blue: 'inf-formula-blue',
  teal: 'inf-formula-teal',
  violet: 'inf-formula-violet',
  slate: 'inf-formula-slate',
}

function BlockTitle({ title }) {
  if (!title) return null
  return <h4 className="text-base font-semibold text-slate-900">{title}</h4>
}

function TaskItem({ content, index }) {
  return (
    <article className="flex items-center gap-4 rounded-xl border border-slate-200/60 bg-white/50 p-3 shadow-sm transition-all hover:bg-white/80">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-[12px] font-bold text-blue-600 shadow-sm">
        {index + 1}
      </span>
      <div className="markdown-content min-w-0 flex-1 text-[14px] leading-relaxed text-slate-700">
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
      </div>
    </article>
  )
}

function HeroBlock({ block }) {
  return (
    <section className="section-shell space-y-3">
      {block.eyebrow && <p className="soft-badge">{block.eyebrow}</p>}
      <h3 className="text-2xl font-bold tracking-tight text-slate-900">{block.title}</h3>
      {block.description && <p className="theme-muted text-sm leading-6">{block.description}</p>}

      {Array.isArray(block.badges) && block.badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {block.badges.map((badge) => (
            <span key={badge} className="inf-chip">
              {badge}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}

function KeyValueGridBlock({ block }) {
  return (
    <section className="section-shell space-y-3">
      <BlockTitle title={block.title} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(block.items || []).map((item, index) => (
          <article key={`${item.label}-${index}`} className="inf-kv-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{item.value}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function CalloutBlock({ block }) {
  const tone = toneClasses[block.tone] || toneClasses.info
  return (
    <section className={`inf-callout ${tone}`}>
      {block.title && <p className="text-sm font-semibold">{block.title}</p>}
      {block.body && <p className="mt-1 text-sm leading-6">{block.body}</p>}
    </section>
  )
}

function ChecklistBlock({ block }) {
  const tone = toneClasses[block.tone] || toneClasses.warning
  const items = Array.isArray(block.items) ? block.items : []

  return (
    <section className={`section-shell space-y-3 inf-checklist ${tone}`}>
      <div className="space-y-1">
        <BlockTitle title={block.title} />
        {block.description && <p className="theme-muted text-sm leading-6">{block.description}</p>}
      </div>

      <div className="space-y-2">
        {items.map((item, index) => {
          const label = typeof item === 'string' ? item : item?.label
          const detail = typeof item === 'string' ? '' : item?.detail
          const tag = typeof item === 'string' ? '' : item?.tag || item?.priority

          return (
            <article key={`check-${index}-${String(label).slice(0, 20)}`} className="inf-check-item">
              <span className="inf-check-icon" aria-hidden>
                !
              </span>
              <div className="inf-check-content">
                <p className="inf-check-title">{label}</p>
                {detail && <p className="inf-check-detail">{detail}</p>}
              </div>
              {tag && <span className="inf-check-tag">{tag}</span>}
            </article>
          )
        })}
      </div>
    </section>
  )
}

function ListBlock({ block, ordered = false }) {
  const ListTag = ordered ? 'ol' : 'ul'
  const listClass = ordered ? 'list-decimal' : 'list-disc'

  return (
    <section className="section-shell space-y-3">
      <BlockTitle title={block.title} />
      {block.description && <p className="theme-muted text-sm leading-6">{block.description}</p>}
      <ListTag className={`ml-5 space-y-2 ${listClass} text-sm text-slate-700`}>
        {(block.items || []).map((item, index) => (
          <li key={`${index}-${String(item).slice(0, 24)}`}>{item}</li>
        ))}
      </ListTag>
    </section>
  )
}

function GenericTableBlock({ block }) {
  const columns = block.columns || []
  const rows = block.rows || []

  return (
    <section className="section-shell space-y-3">
      <BlockTitle title={block.title} />
      {block.description && <p className="theme-muted text-sm leading-6">{block.description}</p>}
      <div className="theme-table-shell overflow-x-auto rounded-xl">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              {columns.map((column) => (
                <th key={column.key || column} className="px-3 py-2">
                  {column.label || column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="border-t border-slate-100 text-slate-700">
                {columns.map((column) => {
                  const key = column.key || column
                  return (
                    <td key={`${rowIndex}-${key}`} className="px-3 py-2 align-top">
                      {row[key]}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function CsvTableBlock({ block }) {
  const columns = block.columns || []
  const rows = block.rows || []

  return (
    <section className="section-shell space-y-3">
      <BlockTitle title={block.title} />
      <p className="theme-muted text-xs">
        Showing sample rows for orientation. Full calculations should be done by students externally.
      </p>
      <div className="theme-table-shell overflow-x-auto rounded-xl">
        <table className="min-w-[980px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-3 py-2">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`csv-row-${rowIndex}`} className="border-t border-slate-100 text-slate-700">
                {columns.map((column) => (
                  <td key={`${rowIndex}-${column}`} className="px-3 py-2">
                    {row[column]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function FormulaCardBlock({ block }) {
  const toneClass = formulaToneClasses[block.tone] || formulaToneClasses.slate

  return (
    <section className={`inf-formula ${toneClass}`}>
      {block.title && <p className="text-sm font-semibold">{block.title}</p>}
      <pre className="inf-formula-pre">
        <code>{block.formula}</code>
      </pre>
      {block.note && <p className="mt-2 text-xs">{block.note}</p>}
    </section>
  )
}

function PartBlock({ block }) {
  const tasksCount = Array.isArray(block.tasks) ? block.tasks.length : 0
  const hintsCount = Array.isArray(block.hints) ? block.hints.length : 0
  const formulasCount = Array.isArray(block.formulas) ? block.formulas.length : 0

  return (
    <details className="inf-part" open={block.open_by_default === true}>
      <summary className="inf-part-summary">
        <div className="space-y-1">
          {block.eyebrow && <p className="inf-part-eyebrow">{block.eyebrow}</p>}
          <h4 className="text-lg font-semibold text-slate-900">{block.title}</h4>
          {block.description && <p className="theme-muted text-sm leading-6">{block.description}</p>}
        </div>

        <div className="inf-part-meta">
          {tasksCount > 0 && <span className="inf-part-pill">{tasksCount} tasks</span>}
          {hintsCount > 0 && <span className="inf-part-pill">{hintsCount} hints</span>}
          {formulasCount > 0 && <span className="inf-part-pill">{formulasCount} formulas</span>}
          <span className="inf-chevron" aria-hidden>
            ▼
          </span>
        </div>
      </summary>

      <div className="inf-part-body">
        {Array.isArray(block.tasks) && block.tasks.length > 0 && (
          <div className="inf-subsection space-y-3">
            <p className="inf-subtitle">Tasks</p>
            <div className="space-y-3">
              {block.tasks.map((task, taskIndex) => (
                <TaskItem key={`task-${taskIndex}`} content={task} index={taskIndex} />
              ))}
            </div>
          </div>
        )}

        {block.table && Array.isArray(block.table.columns) && Array.isArray(block.table.rows) && (
          <div className="inf-subsection">
            {block.table.title && <p className="inf-subtitle">{block.table.title}</p>}
            <div className="theme-table-shell overflow-x-auto rounded-xl">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    {block.table.columns.map((column) => (
                      <th key={column.key || column} className="px-3 py-2">
                        {column.label || column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.table.rows.map((row, rowIndex) => (
                    <tr key={`part-row-${rowIndex}`} className="border-t border-slate-100 text-slate-700">
                      {block.table.columns.map((column) => {
                        const key = column.key || column
                        return (
                          <td key={`${rowIndex}-${key}`} className="px-3 py-2 align-top">
                            {row[key]}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {Array.isArray(block.formulas) && block.formulas.length > 0 && (
          <div className="inf-subsection">
            <p className="inf-subtitle">Formulas</p>
            <div className="space-y-3">
              {block.formulas.map((formula, formulaIndex) => (
                <FormulaCardBlock key={`formula-${formulaIndex}`} block={formula} />
              ))}
            </div>
          </div>
        )}

        {Array.isArray(block.hints) && block.hints.length > 0 && (
          <div className="inf-subsection">
            <p className="inf-subtitle">Hints</p>
            <ul className="ml-5 list-disc space-y-2 text-sm text-slate-700">
              {block.hints.map((hint, hintIndex) => (
                <li key={`hint-${hintIndex}`}>{hint}</li>
              ))}
            </ul>
          </div>
        )}

        {block.summaryTemplate && (
          <div className="inf-summary-template">{block.summaryTemplate}</div>
        )}
      </div>
    </details>
  )
}

function QuoteBlock({ block }) {
  return (
    <section className="section-shell space-y-3">
      <BlockTitle title={block.title} />
      <blockquote className="inf-summary-template">{block.text}</blockquote>
    </section>
  )
}

function DividerBlock() {
  return <hr className="border-t border-slate-200/80" />
}

function renderBlock(block, index) {
  if (!block || !block.type) return null

  switch (block.type) {
    case 'hero':
      return <HeroBlock key={`block-${index}`} block={block} />
    case 'key_value_grid':
      return <KeyValueGridBlock key={`block-${index}`} block={block} />
    case 'callout':
      return <CalloutBlock key={`block-${index}`} block={block} />
    case 'checklist':
      return <ChecklistBlock key={`block-${index}`} block={block} />
    case 'bullet_list':
      return <ListBlock key={`block-${index}`} block={block} />
    case 'ordered_list':
      return <ListBlock key={`block-${index}`} block={block} ordered />
    case 'table':
      return <GenericTableBlock key={`block-${index}`} block={block} />
    case 'csv_table':
      return <CsvTableBlock key={`block-${index}`} block={block} />
    case 'formula_card':
      return <FormulaCardBlock key={`block-${index}`} block={block} />
    case 'part_block':
      return <PartBlock key={`block-${index}`} block={block} />
    case 'quote':
      return <QuoteBlock key={`block-${index}`} block={block} />
    case 'divider':
      return <DividerBlock key={`block-${index}`} />
    default:
      return null
  }
}

export default function InfographicView({ payload }) {
  const blocks = useMemo(() => payload?.blocks || [], [payload])

  if (!blocks.length) return null

  return <div className="space-y-4">{blocks.map((block, index) => renderBlock(block, index))}</div>
}
