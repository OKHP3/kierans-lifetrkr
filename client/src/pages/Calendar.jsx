import React, { useState } from 'react'

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_LABELS = ['S','M','T','W','T','F','S']

export default function Calendar() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(today.getDate())
  const [connected, setConnected] = useState(false)

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const todayY = today.getFullYear()
  const todayM = today.getMonth()
  const todayD = today.getDate()

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const isToday = (d) => d && year === todayY && month === todayM && d === todayD
  const isSelected = (d) => d === selectedDay

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, fontWeight: 500, color: '#EAE0F8' }}>Calendar</h1>
        {!connected && (
          <button
            onClick={() => setConnected(true)}
            style={{ fontSize: 11, color: '#C4A0E8', background: '#251B30', border: '0.5px solid #C4A0E8', borderRadius: 20, padding: '4px 10px', cursor: 'pointer' }}
          >
            Connect Google
          </button>
        )}
      </div>

      {/* Month nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: '#9B8AB0', cursor: 'pointer', padding: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 500, color: '#EAE0F8' }}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: '#9B8AB0', cursor: 'pointer', padding: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      {/* Day labels */}
      <div className="cal-grid" style={{ marginBottom: 4 }}>
        {DAY_LABELS.map((l, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 11, color: '#4A3560', padding: '4px 0' }}>{l}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="cal-grid" style={{ marginBottom: 20 }}>
        {cells.map((d, i) => (
          <div
            key={i}
            className={`cal-day ${isToday(d) && !isSelected(d) ? 'today' : ''} ${d && isSelected(d) ? 'selected' : ''} ${!d ? '' : ''}`}
            style={{ color: !d ? 'transparent' : undefined }}
            onClick={() => d && setSelectedDay(d)}
          >
            {d || '.'}
          </div>
        ))}
      </div>

      {/* Selected day events */}
      <div style={{ fontSize: 13, fontWeight: 500, color: '#9B8AB0', marginBottom: 12 }}>
        {MONTH_NAMES[month]} {selectedDay}
      </div>

      {!connected ? (
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', padding: '12px 0' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4A3560" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <div style={{ fontSize: 13, color: '#7B6A8C', textAlign: 'center', lineHeight: 1.5 }}>
              Connect Google Calendar to see your events here.
            </div>
            <button
              onClick={() => setConnected(true)}
              style={{ marginTop: 8, background: '#C4A0E8', color: '#0D0B14', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              Connect Google Calendar
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div style={{ fontSize: 12, color: '#7B6A8C', textAlign: 'center', padding: '8px 0' }}>
            <div style={{ marginBottom: 4 }}>✓ Connected</div>
            <div style={{ fontSize: 11, color: '#4A3560' }}>
              No events on this day. Your Google Calendar events will appear here once the backend API is configured.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
