/**
 * Trovatore di quote.
 *
 * Quote back: odds-api.io (https://odds-api.io), che copre i bookmaker italiani (es. "Snai IT").
 * Il piano gratuito include 2 bookmaker a scelta e niente exchange.
 *
 * Quote lay: inserite a mano dall'utente guardando Betfair.it o Betflag. Il mercato exchange
 * italiano ha liquidità separata da quello internazionale, e Betfair non permette chiamate
 * dal browser (niente CORS): leggerle in automatico richiederebbe un piccolo server.
 */
import { cover, type BetType } from './calc'

export interface OddsEvent {
  id: number
  home: string
  away: string
  date: string
  league?: { name: string; slug: string }
  bookmakers: Record<string, { name: string; odds: Record<string, string | number>[] }[]>
}

export type Outcome = '1' | 'X' | '2'

export interface Candidate {
  key: string
  eventId: number
  event: string
  league: string
  date: string
  outcome: Outcome
  bookmaker: string
  backOdds: number
}

const FIELD: Record<Outcome, string> = { '1': 'home', X: 'draw', '2': 'away' }
const RESULT_MARKETS = ['ML', 'Moneyline', '1X2']

/** Per ogni evento ed esito (1/X/2) prende la quota back più alta tra i bookmaker scelti. */
export function bestBackOdds(events: OddsEvent[], bookmakers: string[], min: number, max: number): Candidate[] {
  const out: Candidate[] = []
  for (const ev of events) {
    for (const outcome of ['1', 'X', '2'] as Outcome[]) {
      let best: { bookmaker: string; price: number } | null = null
      for (const [bk, markets] of Object.entries(ev.bookmakers ?? {})) {
        if (bookmakers.length && !bookmakers.includes(bk)) continue
        const ml = markets.find((m) => RESULT_MARKETS.includes(m.name))
        const price = Number(ml?.odds?.[0]?.[FIELD[outcome]])
        if (price > 1 && (!best || price > best.price)) best = { bookmaker: bk, price }
      }
      if (best && best.price >= min && best.price <= max) {
        out.push({
          key: `${ev.id}-${outcome}`,
          eventId: ev.id,
          event: `${ev.home} - ${ev.away}`,
          league: ev.league?.name ?? '',
          date: ev.date,
          outcome,
          bookmaker: best.bookmaker,
          backOdds: best.price,
        })
      }
    }
  }
  return out
}

export function rating(type: BetType, backOdds: number, layOdds: number, commission: number): number | null {
  if (!(layOdds > 1) || layOdds - commission <= 0) return null
  return cover({ type, backStake: 10, backOdds, layOdds, commission }).ratingPct
}

const API = 'https://api.odds-api.io/v3'

async function get<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(API + path)
  for (const [k, v] of Object.entries(params)) if (v) url.searchParams.set(k, v)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`odds-api.io ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return res.json() as Promise<T>
}

export interface League {
  name: string
  slug: string
}

export const fetchLeagues = (apiKey: string, sport: string) => get<League[]>('/leagues', { apiKey, sport })

export interface EventSummary {
  id: number
  home: string
  away: string
  date: string
  status?: string
}

export async function fetchEventOdds(apiKey: string, sport: string, league: string, bookmakers: string[], maxEvents: number): Promise<OddsEvent[]> {
  const events = await get<EventSummary[]>('/events', { apiKey, sport, league })
  const upcoming = events
    .filter((e) => !e.status || e.status === 'pending')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, maxEvents)
  const out: OddsEvent[] = []
  // /odds/multi accetta fino a 10 eventi e conta come una sola richiesta.
  for (let i = 0; i < upcoming.length; i += 10) {
    const ids = upcoming.slice(i, i + 10).map((e) => e.id).join(',')
    out.push(...(await get<OddsEvent[]>('/odds/multi', { apiKey, eventIds: ids, bookmakers: bookmakers.join(',') })))
  }
  return out
}
