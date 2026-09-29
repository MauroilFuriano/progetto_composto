/**
 * Copertura di una multipla con bancata sequenziale gamba per gamba.
 *
 * Si banca la prima gamba prima che inizi. Se perde sul bookmaker (vince il lay) la multipla è
 * chiusa e il profitto è già garantito. Se vince, si banca la gamba successiva, e così via.
 *
 * Le puntate lay si calcolano all'indietro dall'ultima gamba:
 *   W(n+1) = incasso della multipla se vince tutte le gambe
 *   L(k)   = W(k+1) / (lay_k - c)
 *   W(k)   = L(k) * (1 - c)
 * La puntata lay di una gamba dipende solo dalle gambe successive: quando una gamba è vinta,
 * basta aggiornare le quote lay delle rimanenti e ricalcolare.
 */
import { CoverInputError, type BetType } from './calc'

export interface Leg {
  backOdds: number
  layOdds: number
}

export interface MultiInput {
  type: BetType
  backStake: number
  legs: Leg[]
  commission: number
}

export interface MultiResult {
  totalBackOdds: number
  layStakes: number[]
  liabilities: number[]
  /** Liquidità massima richiesta sull'exchange (la responsabilità più alta, bancando una gamba alla volta). */
  maxLiability: number
  /** Profitto in ogni esito: indice k = la multipla cade alla gamba k; ultimo = tutte vinte. */
  outcomes: number[]
  profit: number
  ratingPct: number
}

export function coverMulti(input: MultiInput): MultiResult {
  const { type, backStake: s, legs, commission: c } = input
  if (!(s > 0)) throw new CoverInputError('La puntata deve essere maggiore di zero')
  if (legs.length < 1) throw new CoverInputError('Aggiungi almeno una gamba')
  if (!(c >= 0 && c < 1)) throw new CoverInputError('La commissione deve essere tra 0% e 99%')
  legs.forEach((l, i) => {
    if (!(l.backOdds > 1) || !(l.layOdds > 1)) throw new CoverInputError(`Gamba ${i + 1}: quote maggiori di 1`)
    if (l.layOdds - c <= 0) throw new CoverInputError(`Gamba ${i + 1}: quota lay troppo bassa`)
  })

  const totalBackOdds = legs.reduce((p, l) => p * l.backOdds, 1)
  const backReturn = type === 'freebet_snr' ? s * (totalBackOdds - 1) : s * totalBackOdds
  const cost = type === 'qualifying' ? s : 0

  const layStakes = new Array<number>(legs.length)
  let w = backReturn
  for (let k = legs.length - 1; k >= 0; k--) {
    layStakes[k] = w / (legs[k].layOdds - c)
    w = layStakes[k] * (1 - c)
  }
  const liabilities = layStakes.map((st, k) => st * (legs[k].layOdds - 1))

  // Simula ogni esito per esporre i profitti (e verificare che siano uguali).
  const outcomes: number[] = []
  let paidLiabilities = 0
  for (let k = 0; k < legs.length; k++) {
    outcomes.push(-cost - paidLiabilities + layStakes[k] * (1 - c))
    paidLiabilities += liabilities[k]
  }
  outcomes.push(-cost - paidLiabilities + backReturn)

  const profit = Math.min(...outcomes)
  return {
    totalBackOdds,
    layStakes,
    liabilities,
    maxLiability: Math.max(...liabilities),
    outcomes,
    profit,
    ratingPct: (profit / s) * 100,
  }
}
