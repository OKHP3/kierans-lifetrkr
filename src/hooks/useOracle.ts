import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { getMoonPhase, getAstroSeason, getMercuryStatus } from '../lib/celestial'
import { fetchTarotCard, fetchHoroscope, generateOracleMessage, clearOracleCache } from '../lib/oracle'
import type { OracleReading } from '../types'

function getTodayISO(timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

export function useOracle() {
  const { state, dispatch } = useApp()
  const { oracle, isLoadingOracle, settings } = state
  const [generation, setGeneration] = useState(0)

  const shouldFetch =
    settings.oracleEnabled &&
    !isLoadingOracle &&
    (!oracle || oracle.date !== getTodayISO(settings.timezone))

  useEffect(() => {
    if (!shouldFetch) return

    let cancelled = false

    async function loadOracle() {
      dispatch({ type: 'SET_LOADING_ORACLE', payload: true })
      try {
        const [tarotCard, moon, season, mercury] = await Promise.all([
          fetchTarotCard(settings.timezone),
          Promise.resolve(getMoonPhase()),
          Promise.resolve(getAstroSeason()),
          Promise.resolve(getMercuryStatus()),
        ])

        const horoscope = settings.birthSign
           ? (await fetchHoroscope(settings.birthSign, settings.timezone)) ?? undefined
          : undefined

        const message = await generateOracleMessage(
          tarotCard,
          moon,
          season,
          mercury,
          settings.birthSign,
          settings.timezone,
        )

        if (cancelled) return

        const reading: OracleReading = {
          date: getTodayISO(settings.timezone),
          tarotCard,
          moonPhase: moon,
          astroSeason: season,
          message,
          horoscope,
        }
        dispatch({ type: 'SET_ORACLE', payload: reading })
      } catch {
        dispatch({ type: 'SET_LOADING_ORACLE', payload: false })
      }
    }

    loadOracle()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.oracleEnabled, settings.birthSign, settings.timezone, generation])

  function regenerate() {
    clearOracleCache(settings.timezone)
    dispatch({ type: 'CLEAR_ORACLE' })
    setGeneration(value => value + 1)
  }

  return { oracle, isLoadingOracle, regenerate }
}
