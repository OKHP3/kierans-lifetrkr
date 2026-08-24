import React from 'react'
import type { OracleReading } from '../types'

interface OracleCardProps {
  reading: OracleReading | null
  loading: boolean
  onRegenerate?: () => void
}

export function OracleCard({ reading, loading, onRegenerate }: OracleCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-purple-800/40 bg-gradient-to-br from-[#1A1424] to-[#0D0B14] p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🔮</span>
          <span className="font-display text-purple-300 text-sm tracking-wide">Oracle</span>
        </div>
        <div className="h-3 bg-purple-900/40 rounded w-3/4 mb-2" />
        <div className="h-3 bg-purple-900/40 rounded w-1/2" />
      </div>
    )
  }

  if (!reading) return null

  const { tarotCard, moonPhase, astroSeason, message, horoscope } = reading

  return (
    <div className="rounded-2xl border border-purple-800/40 bg-gradient-to-br from-[#1A1424] to-[#0D0B14] p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔮</span>
          <span className="font-display text-purple-300 tracking-widest text-xs uppercase">
            Daily Oracle
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-purple-400/70 font-mono">
          <span>{moonPhase.emoji}</span>
          <span>{moonPhase.name}</span>
        </div>
      </div>

      {/* Tarot card */}
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-14 rounded-lg bg-purple-900/50 border border-purple-700/40 flex items-center justify-center text-xl">
          🃏
        </div>
        <div>
          <p className="text-purple-200 font-display text-sm font-medium">
            {tarotCard.name}
          </p>
          <p className="text-purple-400/80 text-xs mt-0.5 leading-relaxed">
            {tarotCard.meaning_up}
          </p>
        </div>
      </div>

      {/* Oracle message */}
      <p className="text-purple-100/90 text-sm leading-relaxed font-body italic border-l-2 border-purple-700/50 pl-3">
        {message}
      </p>

      {/* Horoscope if available */}
      {horoscope && (
        <div className="text-purple-300/70 text-xs leading-relaxed border border-purple-800/30 rounded-xl p-3 bg-purple-900/10">
          <span className="text-purple-400 font-mono uppercase tracking-wider text-[10px] block mb-1">
            {astroSeason.sign} {astroSeason.emoji}
          </span>
          {horoscope}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-3 pt-1 text-[10px] text-purple-500/60 font-mono tracking-wide uppercase">
        <span>{astroSeason.emoji} {astroSeason.sign} season</span>
        <span>·</span>
        <span>{astroSeason.element}</span>
        <span>·</span>
        <span>{Math.round(moonPhase.illumination * 100)}% lit</span>
      </div>
      {onRegenerate && (
        <button
          onClick={onRegenerate}
          style={{ background: 'none', border: 'none', color: 'var(--accent-amethyst)', cursor: 'pointer', fontSize: 11, padding: 0 }}
        >
          Regenerate today’s reading
        </button>
      )}
    </div>
  )
}
