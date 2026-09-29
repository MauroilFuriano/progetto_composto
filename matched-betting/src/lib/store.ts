/** Modello dati e salvataggio locale (solo nel browser: nessun server, nessun dato inviato). */
import type { BetType } from './calc'

export type BonusStatus = 'da_fare' | 'in_corso' | 'fatto' | 'limitato'

export interface Bookmaker {
  id: string
  name: string
  /** Descrizione libera del bonus, es. "Free bet 10€ dopo scommessa 10€ a quota min 1.50". */
  bonus: string
  bonusValue: number
  minOdds: number | null
  /** Volte da rigiocare il bonus prima di prelevarlo (0 = nessun rollover). */
  rollover: number
  expiry: string
  status: BonusStatus
  notes: string
}

export interface Operation {
  id: string
  date: string
  bookmakerId: string
  event: string
  type: BetType
  backStake: number
  backOdds: number
  layOdds: number
  commission: number
  layStake: number
  expectedProfit: number
  /** Profitto effettivo registrato a evento concluso (null = ancora aperta). */
  actualProfit: number | null
}

export interface Settings {
  /** Commissione exchange di default, come frazione (Betfair.it 4,5%, Betflag 5%). */
  commission: number
  oddsApiKey: string
}

export interface AppData {
  version: 1
  bookmakers: Bookmaker[]
  operations: Operation[]
  settings: Settings
}

const KEY = 'matched-betting:v1'

export const emptyData = (): AppData => ({
  version: 1,
  bookmakers: [],
  operations: [],
  settings: { commission: 0.045, oddsApiKey: '' },
})

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyData()
    return parseData(raw)
  } catch {
    return emptyData()
  }
}

export function saveData(data: AppData): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

/** Valida un backup JSON importato; lancia un errore se non è compatibile. */
export function parseData(raw: string): AppData {
  const d = JSON.parse(raw)
  if (d?.version !== 1 || !Array.isArray(d.bookmakers) || !Array.isArray(d.operations)) {
    throw new Error('File di backup non valido')
  }
  return { ...emptyData(), ...d, settings: { ...emptyData().settings, ...d.settings } }
}

export const newId = () => crypto.randomUUID()

export interface Totals {
  realized: number
  expectedOpen: number
  openCount: number
  bonusesDone: number
}

export function totals(data: AppData): Totals {
  let realized = 0
  let expectedOpen = 0
  let openCount = 0
  for (const op of data.operations) {
    if (op.actualProfit === null) {
      expectedOpen += op.expectedProfit
      openCount++
    } else {
      realized += op.actualProfit
    }
  }
  return {
    realized,
    expectedOpen,
    openCount,
    bonusesDone: data.bookmakers.filter((b) => b.status === 'fatto').length,
  }
}

const TYPE_LABEL: Record<BetType, string> = {
  qualifying: 'Qualificante',
  freebet_snr: 'Free bet SNR',
  freebet_sr: 'Free bet SR',
}

export const typeLabel = (t: BetType) => TYPE_LABEL[t]

/** Registro operazioni in CSV (separatore ; e virgola decimale, per Excel italiano). */
export function operationsCsv(data: AppData): string {
  const names = new Map(data.bookmakers.map((b) => [b.id, b.name]))
  const num = (n: number | null) => (n === null ? '' : n.toFixed(2).replace('.', ','))
  const esc = (s: string) => `"${s.replaceAll('"', '""')}"`
  const header = ['Data', 'Bookmaker', 'Evento', 'Tipo', 'Puntata back', 'Quota back', 'Quota lay',
    'Commissione %', 'Puntata lay', 'Profitto atteso', 'Profitto effettivo']
  const rows = data.operations.map((o) => [
    o.date, esc(names.get(o.bookmakerId) ?? ''), esc(o.event), TYPE_LABEL[o.type],
    num(o.backStake), num(o.backOdds), num(o.layOdds), num(o.commission * 100),
    num(o.layStake), num(o.expectedProfit), num(o.actualProfit),
  ])
  return [header, ...rows].map((r) => r.join(';')).join('\n')
}
