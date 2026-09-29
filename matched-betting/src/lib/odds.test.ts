import { describe, expect, it } from 'vitest'
import { bestBackOdds, rating, type OddsEvent } from './odds'

// Forma della risposta come da documentazione odds-api.io (/v3/odds).
const events: OddsEvent[] = [{
  id: 1, home: 'Inter', away: 'Milan', date: '2026-10-04T18:45:00Z',
  league: { name: 'Serie A', slug: 'italy-serie-a' },
  bookmakers: {
    'Snai IT': [{ name: 'ML', odds: [{ home: '2.10', draw: '3.40', away: '3.60' }] }],
    'Sisal IT': [
      { name: 'Totals', odds: [{ hdp: 2.5, over: '1.9', under: '1.9' }] },
      { name: 'ML', odds: [{ home: '2.05', draw: '3.50', away: '3.90' }] },
    ],
  },
}]

describe('bestBackOdds', () => {
  it('prende la quota più alta per ogni esito tra i bookmaker scelti', () => {
    const c = bestBackOdds(events, [], 1.01, 100)
    expect(c.map((x) => [x.outcome, x.bookmaker, x.backOdds])).toEqual([
      ['1', 'Snai IT', 2.1],
      ['X', 'Sisal IT', 3.5],
      ['2', 'Sisal IT', 3.9],
    ])
  })

  it('rispetta il filtro bookmaker e il range di quote', () => {
    const c = bestBackOdds(events, ['Snai IT'], 3, 3.5)
    expect(c).toEqual([expect.objectContaining({ outcome: 'X', bookmaker: 'Snai IT', backOdds: 3.4 })])
  })
})

describe('rating', () => {
  it('senza quota lay valida non calcola nulla', () => {
    expect(rating('qualifying', 2, 0, 0.045)).toBeNull()
  })
  it('calcola la perdita % della qualificante', () => {
    expect(rating('qualifying', 2, 2.1, 0.05)).toBeCloseTo(-7.32, 1)
  })
})
