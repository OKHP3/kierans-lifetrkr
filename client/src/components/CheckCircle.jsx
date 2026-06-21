import React from 'react'

export default function CheckCircle({ checked, onToggle, color = 'sage' }) {
  const cls = color === 'amethyst' ? 'check-circle checked-amethyst' : 'check-circle checked'
  return (
    <button
      className={checked ? cls : 'check-circle'}
      onClick={onToggle}
      style={{ background: 'none', border: checked ? undefined : '1.5px solid #3A2A4A' }}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#0D0B14" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  )
}
