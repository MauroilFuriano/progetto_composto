import { describe, expect, it } from 'vitest'
import { cover, CoverInputError } from './calc'

const close = (a: number, b: number) => expect(a).toBeCloseTo(b, 2)

describe('cover', () => {
  it('qualifying: pareggia i due esiti con piccola perdita', () => {
    const r = cover({ type: 'qualifying', backStake: 10, backOdds: 2.0, layOdds: 2.1, commission: 0.05 })
    close(r.layStake, 20 / 2.05) // 9.756
    close(r.liability, r.layStake * 1.1)
    close(r.profitIfBackWins, r.profitIfLayWins)
    close(r.profit, -0.73)
    expect(r.profit).toBeLessThan(0)
  })

  it('free bet SNR: trattiene circa il 70-80% con quote alte', () => {
    const r = cover({ type: 'freebet_snr', backStake: 10, backOdds: 6.0, layOdds: 6.4, commission: 0.05 })
    close(r.layStake, 50 / 6.35)
    close(r.profitIfBackWins, r.profitIfLayWins)
    expect(r.ratingPct).toBeGreaterThan(70)
    expect(r.ratingPct).toBeLessThan(80)
  })

  it('free bet SR: stessa lay stake del qualifying, nessuna perdita della puntata', () => {
    const r = cover({ type: 'freebet_sr', backStake: 10, backOdds: 2.0, layOdds: 2.0, commission: 0 })
    close(r.layStake, 10)
    close(r.profitIfBackWins, 10)
    close(r.profitIfLayWins, 10)
  })

  it('senza commissione e quote uguali il qualifying è a costo zero', () => {
    const r = cover({ type: 'qualifying', backStake: 25, backOdds: 3.5, layOdds: 3.5, commission: 0 })
    close(r.profit, 0)
  })

  it('rifiuta input non validi', () => {
    expect(() => cover({ type: 'qualifying', backStake: 0, backOdds: 2, layOdds: 2, commission: 0.05 })).toThrow(CoverInputError)
    expect(() => cover({ type: 'qualifying', backStake: 10, backOdds: 1, layOdds: 2, commission: 0.05 })).toThrow(CoverInputError)
    expect(() => cover({ type: 'qualifying', backStake: 10, backOdds: 2, layOdds: 2, commission: 1 })).toThrow(CoverInputError)
  })
})
