import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { getMoonPhase, getAstroSeason, getMercuryStatus } from '../lib/celestial'
import { getTodayISO } from '../lib/date'
import { fetchTarotCard, fetchHoroscope, generateOracleMessage, clearOracleCache } from '../lib/oracle'
import type { OracleReading } from '../types'

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
          Promise.resolve(getMoonPhase(new Date(), settings.timezone)),
          Promise.resolve(getAstroSeason(new Date(), settings.timezone)),
          Promise.resolve(getMercuryStatus(new Date(), settings.timezone)),
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
