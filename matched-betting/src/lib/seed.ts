/**
 * Elenco iniziale di bonus di benvenuto (ricerca del 28/09/2026 su fonti informative/affiliati).
 * I bonus cambiano spesso: vanno sempre verificati sul sito del bookmaker prima di iniziare.
 */
import { newId, type Bookmaker } from './store'

const VERIFY = 'Da verificare sul sito ufficiale (ricerca 28/09/2026).'

const rows: [string, string, number, number | null, number][] = [
  ['Eurobet', '50% del primo deposito fino a 100€ (deposito ≥20€). Bonus x1 in multiple ≥5 eventi a quota ≥1,50 entro 7 giorni.', 100, 1.5, 1],
  ['Sisal', '50% del primo deposito fino a 100€. Real Bonus x1 in multiple ≥5 eventi, quota totale ≥5.', 100, null, 1],
  ['Goldbet', '50% fino a 50€ con rollover x5 in triple a quota 1,50.', 50, 1.5, 5],
  ['Lottomatica', '100% fino a 50€; bonus in quadrupla a quota totale ≥6. Offerta maggiore fino a 2.000€ con rollover 6x deposito.', 50, 1.5, 6],
  ['bet365.it', '100% fino a 500€ (deposito min 5€). Rollover x10 entro 30 giorni a quota ≥3,00.', 500, 3, 10],
  ['Snai', 'Bonus cash in multiple ≥3 eventi a quota 1,50 entro 3 giorni; lossback 30% prime 4 settimane.', 0, 1.5, 0],
  ['Planetwin365', 'Bonus in 2 tranche; la seconda richiede 6x deposito in triple a quota 1,50, valida 7 giorni.', 0, 1.5, 6],
  ['NetBet', '100% fino a 1.000€, rollover x6 in triple a quota 1,50 entro 30 giorni.', 0, 1.5, 6],
  ['William Hill', '10€ con registrazione SPID + Extra Bet Club (multiple ≥5 eventi, quota ≥5).', 10, null, 0],
  ['Betsson', '10€ senza deposito, rollover x6 in 5 giorni.', 10, null, 6],
  ['AdmiralBet', 'Rollover x6 a quota ≥2,00 entro 15 giorni.', 0, 2, 6],
]

export function seedBookmakers(existing: Bookmaker[]): Bookmaker[] {
  const names = new Set(existing.map((b) => b.name.toLowerCase()))
  const added = rows
    .filter(([name]) => !names.has(name.toLowerCase()))
    .map(([name, bonus, bonusValue, minOdds, rollover]): Bookmaker => ({
      id: newId(), name, bonus, bonusValue, minOdds, rollover, expiry: '', status: 'da_fare', notes: VERIFY,
    }))
  return [...existing, ...added]
}
