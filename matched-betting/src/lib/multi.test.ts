import { describe, expect, it } from 'vitest'
import { cover } from './calc'
import { coverMulti } from './multi'

describe('coverMulti', () => {
  it('con una sola gamba coincide con la copertura singola', () => {
    for (const type of ['qualifying', 'freebet_snr', 'freebet_sr'] as const) {
      const single = cover({ type, backStake: 10, backOdds: 2.4, layOdds: 2.5, commission: 0.045 })
      const multi = coverMulti({ type, backStake: 10, legs: [{ backOdds: 2.4, layOdds: 2.5 }], commission: 0.045 })
      expect(multi.layStakes[0]).toBeCloseTo(single.layStake, 6)
      expect(multi.profit).toBeCloseTo(single.profit, 6)
    }
  })

  it('pareggia tutti gli esiti di una quadrupla', () => {
    const r = coverMulti({
      type: 'qualifying', backStake: 20, commission: 0.045,
      legs: [{ backOdds: 1.6, layOdds: 1.65 }, { backOdds: 1.55, layOdds: 1.6 }, { backOdds: 1.7, layOdds: 1.74 }, { backOdds: 1.5, layOdds: 1.53 }],
    })
    expect(r.outcomes).toHaveLength(5)
    for (const o of r.outcomes) expect(o).toBeCloseTo(r.outcomes[0], 6)
    expect(r.totalBackOdds).toBeCloseTo(1.6 * 1.55 * 1.7 * 1.5, 6)
    expect(r.profit).toBeLessThan(0)
    // La prima gamba ha la puntata lay più piccola, l'ultima la più grande.
    expect(r.layStakes[0]).toBeLessThan(r.layStakes[3])
  })

  it('bonus in multipla: trattiene gran parte del valore con quota totale alta', () => {
    const r = coverMulti({
      type: 'freebet_snr', backStake: 50, commission: 0.045,
      legs: Array.from({ length: 5 }, () => ({ backOdds: 1.6, layOdds: 1.64 })),
    })
    for (const o of r.outcomes) expect(o).toBeCloseTo(r.profit, 6)
    expect(r.ratingPct).toBeGreaterThan(70)
  })
})
