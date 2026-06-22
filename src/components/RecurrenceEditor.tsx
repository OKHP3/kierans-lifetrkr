import type { RecurrenceRule, DayOfWeek, RecurrenceFrequency } from '../types'

interface Props {
  value: RecurrenceRule
  onChange: (rule: RecurrenceRule) => void
}

const FREQ_OPTIONS: { value: RecurrenceFrequency; label: string }[] = [
  { value: 'none',    label: 'Does not repeat' },
  { value: 'daily',   label: 'Daily'           },
  { value: 'weekly',  label: 'Weekly'          },
  { value: 'monthly', label: 'Monthly'         },
  { value: 'custom',  label: 'Custom'          },
]

const WEEKDAYS: { value: DayOfWeek; label: string }[] = [
  { value: 'monday',    label: 'Mo' },
  { value: 'tuesday',   label: 'Tu' },
  { value: 'wednesday', label: 'We' },
  { value: 'thursday',  label: 'Th' },
  { value: 'friday',    label: 'Fr' },
  { value: 'saturday',  label: 'Sa' },
  { value: 'sunday',    label: 'Su' },
]

const inputClass =
  'w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-textPrimary ' +
  'placeholder-textMuted focus:outline-none focus:border-accentAmethyst transition-colors'

const labelClass = 'block text-xs font-mono text-textSecondary mb-1'

export default function RecurrenceEditor({ value, onChange }: Props) {
  const { frequency, interval, daysOfWeek = [], end } = value

  function set(patch: Partial<RecurrenceRule>) {
    onChange({ ...value, ...patch })
  }

  function toggleDay(day: DayOfWeek) {
    const current = daysOfWeek ?? []
    const next = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day]
    set({ daysOfWeek: next })
  }

  const showDays   = frequency === 'weekly' || frequency === 'custom'
  const showEvery  = frequency !== 'none'
  const unitLabel  = frequency === 'daily'   ? 'day'
                   : frequency === 'weekly'  ? 'week'
                   : frequency === 'monthly' ? 'month'
                   : frequency === 'yearly'  ? 'year'
                   : 'period'

  return (
    <div className="space-y-3">
      {/* Repeats */}
      <div>
        <label className={labelClass}>Repeats</label>
        <select
          value={frequency}
          onChange={e => set({ frequency: e.target.value as RecurrenceFrequency })}
          className={inputClass}
        >
          {FREQ_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Every N */}
      {showEvery && (
        <div>
          <label className={labelClass}>Every</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={99}
              value={interval}
              onChange={e => set({ interval: Math.max(1, parseInt(e.target.value) || 1) })}
              className={`${inputClass} w-20`}
            />
            <span className="text-sm text-textSecondary">{unitLabel}{interval !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {/* On (weekday picker) */}
      {showDays && (
        <div>
          <label className={labelClass}>On</label>
          <div className="flex gap-1 flex-wrap">
            {WEEKDAYS.map(day => {
              const active = daysOfWeek.includes(day.value)
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={
                    `w-9 h-9 rounded-full text-xs font-mono transition-colors ` +
                    (active
                      ? 'bg-accentAmethyst text-bg font-bold'
                      : 'bg-surfaceRaised text-textSecondary hover:bg-border')
                  }
                >
                  {day.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Ends */}
      {showEvery && (
        <div>
          <label className={labelClass}>Ends</label>
          <div className="space-y-2">
            {/* Never */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="recurrence-end"
                checked={end.mode === 'never'}
                onChange={() => set({ end: { mode: 'never' } })}
                className="accent-accentAmethyst"
              />
              <span className="text-sm text-textPrimary">Never</span>
            </label>

            {/* On date */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="recurrence-end"
                checked={end.mode === 'onDate'}
                onChange={() => set({ end: { mode: 'onDate', date: '' } })}
                className="accent-accentAmethyst"
              />
              <span className="text-sm text-textPrimary">On date</span>
              {end.mode === 'onDate' && (
                <input
                  type="date"
                  value={end.date}
                  onChange={e => set({ end: { mode: 'onDate', date: e.target.value } })}
                  className={`${inputClass} flex-1`}
                />
              )}
            </label>

            {/* After N */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="recurrence-end"
                checked={end.mode === 'afterCount'}
                onChange={() => set({ end: { mode: 'afterCount', count: 12 } })}
                className="accent-accentAmethyst"
              />
              <span className="text-sm text-textPrimary">After</span>
              {end.mode === 'afterCount' && (
                <>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={end.count}
                    onChange={e => set({ end: { mode: 'afterCount', count: Math.max(1, parseInt(e.target.value) || 1) } })}
                    className={`${inputClass} w-20`}
                  />
                  <span className="text-sm text-textSecondary">times</span>
                </>
              )}
              {end.mode !== 'afterCount' && (
                <span className="text-sm text-textSecondary">N times</span>
              )}
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
