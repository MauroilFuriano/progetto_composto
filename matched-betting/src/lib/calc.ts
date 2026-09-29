/**
 * Calcoli di copertura per il matched betting (back sul bookmaker, lay sull'exchange).
 *
 * Tipi di puntata sul bookmaker:
 * - qualifying: soldi veri, serve a sbloccare il bonus. Si accetta una piccola perdita.
 * - freebet_snr: free bet "stake not returned": se vince incassi solo la vincita netta.
 * - freebet_sr: free bet "stake returned": se vince incassi anche la puntata.
 *
 * La lay stake è scelta in modo che il profitto sia identico qualunque sia l'esito.
 */

export type BetType = 'qualifying' | 'freebet_snr' | 'freebet_sr'

export interface CoverInput {
  type: BetType
  backStake: number
  backOdds: number
  layOdds: number
  /** Commissione dell'exchange come frazione (0.05 = 5%). */
  commission: number
}

export interface CoverResult {
  layStake: number
  /** Quanto rischi sull'exchange: deve essere disponibile sul conto exchange. */
  liability: number
  profitIfBackWins: number
  profitIfLayWins: number
  /** Profitto garantito (il minore dei due esiti). */
  profit: number
  /**
   * qualifying: perdita o guadagno in % della puntata.
   * free bet: % del valore della free bet trasformata in soldi veri (retention).
   */
  ratingPct: number
}

export class CoverInputError extends Error {}

export function validate(input: CoverInput): void {
  const { backStake, backOdds, layOdds, commission } = input
  if (!(backStake > 0)) throw new CoverInputError('La puntata deve essere maggiore di zero')
  if (!(backOdds > 1)) throw new CoverInputError('La quota del bookmaker deve essere maggiore di 1')
  if (!(layOdds > 1)) throw new CoverInputError("La quota lay dell'exchange deve essere maggiore di 1")
  if (!(commission >= 0 && commission < 1)) throw new CoverInputError('La commissione deve essere tra 0% e 99%')
  if (layOdds - commission <= 0) throw new CoverInputError('Quota lay troppo bassa per la commissione')
}

export function cover(input: CoverInput): CoverResult {
  validate(input)
  const { type, backStake: s, backOdds: b, layOdds: l, commission: c } = input

  // Importo che il back incassa (oltre alla puntata, se era di soldi veri) quando vince.
  const backReturn = type === 'freebet_snr' ? s * (b - 1) : s * b
  const layStake = backReturn / (l - c)
  const liability = layStake * (l - 1)

  const profitIfBackWins = type === 'freebet_sr' ? s * b - liability : s * (b - 1) - liability
  const profitIfLayWins = layStake * (1 - c) - (type === 'qualifying' ? s : 0)
  const profit = Math.min(profitIfBackWins, profitIfLayWins)

  return {
    layStake,
    liability,
    profitIfBackWins,
    profitIfLayWins,
    profit,
    ratingPct: (profit / s) * 100,
  }
}

/** Arrotonda al centesimo per la visualizzazione. */
export function eur(n: number): string {
  return n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
}
