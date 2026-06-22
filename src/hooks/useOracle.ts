import { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { getMoonPhase, getAstroSeason, getMercuryStatus } from '../lib/celestial'
import { fetchTarotCard, fetchHoroscope, generateOracleMessage } from '../lib/oracle'
import type { OracleReading } from '../types'

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function useOracle() {
  const { state, dispatch } = useApp()
  const { oracle, isLoadingOracle, settings } = state

  const shouldFetch =
    settings.oracleEnabled &&
    !isLoadingOracle &&
    (!oracle || oracle.date !== getTodayISO())

  useEffect(() => {
    if (!shouldFetch) return

    let cancelled = false

    async function loadOracle() {
      dispatch({ type: 'SET_LOADING_ORACLE', payload: true })
      try {
        const [tarotCard, moon, season, mercury] = await Promise.all([
          fetchTarotCard(),
          Promise.resolve(getMoonPhase()),
          Promise.resolve(getAstroSeason()),
          Promise.resolve(getMercuryStatus()),
        ])

        const horoscope = settings.birthSign
          ? (await fetchHoroscope(settings.birthSign)) ?? undefined
          : undefined

        const message = await generateOracleMessage(
          tarotCard,
          moon,
          season,
          mercury,
          settings.birthSign,
        )

        if (cancelled) return

        const reading: OracleReading = {
          date: getTodayISO(),
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
  }, [settings.oracleEnabled, settings.birthSign])

  return { oracle, isLoadingOracle }
}
