import { useState } from 'react'
import { cover, CoverInputError, eur, type BetType } from '../lib/calc'
import { newId, type AppData, type Operation } from '../lib/store'

export interface CalcPrefill {
  backOdds?: number
  layOdds?: number
  event?: string
}

interface Props {
  data: AppData
  prefill: CalcPrefill
  onSave: (op: Operation) => void
}

const num = (s: string) => Number(s.replace(',', '.'))

export function Calculator({ data, prefill, onSave }: Props) {
  const [type, setType] = useState<BetType>('qualifying')
  const [stake, setStake] = useState('10')
  const [backOdds, setBackOdds] = useState(prefill.backOdds?.toString() ?? '2.00')
  const [layOdds, setLayOdds] = useState(prefill.layOdds?.toString() ?? '2.10')
  const [commission, setCommission] = useState((data.settings.commission * 100).toString())
  const [event, setEvent] = useState(prefill.event ?? '')
  const [bookmakerId, setBookmakerId] = useState(data.bookmakers[0]?.id ?? '')
  const [saved, setSaved] = useState(false)

  const input = { type, backStake: num(stake), backOdds: num(backOdds), layOdds: num(layOdds), commission: num(commission) / 100 }
  const result = computeCover(input)

  const save = () => {
    if (!result.ok) return
    onSave({
      id: newId(),
      date: new Date().toISOString().slice(0, 10),
      bookmakerId,
      event,
      type,
      backStake: input.backStake,
      backOdds: input.backOdds,
      layOdds: input.layOdds,
      commission: input.commission,
      layStake: result.ok.layStake,
      expectedProfit: result.ok.profit,
      actualProfit: null,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <section className="card">
      <h2>Calcolatore di copertura</h2>
      <div className="segmented" role="radiogroup" aria-label="Tipo di puntata">
        {([
          ['qualifying', 'Qualificante'],
          ['freebet_snr', 'Free bet SNR'],
          ['freebet_sr', 'Free bet SR'],
        ] as const).map(([k, label]) => (
          <button key={k} role="radio" aria-checked={type === k} className={type === k ? 'on' : ''} onClick={() => setType(k)}>
            {label}
          </button>
        ))}
      </div>
      <p className="hint">
        {type === 'qualifying' && 'Scommessa con soldi veri per sbloccare il bonus: accetti una piccola perdita.'}
        {type === 'freebet_snr' && 'Free bet in cui, se vinci, ricevi solo la vincita netta (il caso più comune). Cerca quote back alte (4-8).'}
        {type === 'freebet_sr' && 'Free bet in cui, se vinci, ricevi anche la puntata (raro).'}
      </p>

      <div className="grid">
        <label>Puntata sul bookmaker (€)<input inputMode="decimal" value={stake} onChange={(e) => setStake(e.target.value)} /></label>
        <label>Quota bookmaker (back)<input inputMode="decimal" value={backOdds} onChange={(e) => setBackOdds(e.target.value)} /></label>
        <label>Quota exchange (lay)<input inputMode="decimal" value={layOdds} onChange={(e) => setLayOdds(e.target.value)} /></label>
        <label>Commissione exchange (%)<input inputMode="decimal" value={commission} onChange={(e) => setCommission(e.target.value)} /></label>
      </div>

      {result.error && <p className="error">{result.error}</p>}
      {result.ok && (
        <div className="result">
          <div className="big">
            <span>Punta in <b>lay</b> sull'exchange</span>
            <strong>{eur(result.ok.layStake)}</strong>
          </div>
          <dl>
            <dt>Responsabilità (serve sul conto exchange)</dt><dd>{eur(result.ok.liability)}</dd>
            <dt>Se vince il bookmaker</dt><dd className={result.ok.profitIfBackWins < 0 ? 'neg' : 'pos'}>{eur(result.ok.profitIfBackWins)}</dd>
            <dt>Se vince l'exchange</dt><dd className={result.ok.profitIfLayWins < 0 ? 'neg' : 'pos'}>{eur(result.ok.profitIfLayWins)}</dd>
            <dt>{type === 'qualifying' ? 'Costo della qualifica' : 'Valore trattenuto'}</dt>
            <dd>{result.ok.ratingPct.toFixed(1)}%</dd>
          </dl>
        </div>
      )}

      <details className="save">
        <summary>Salva nel registro</summary>
        <div className="grid">
          <label>Bookmaker
            <select value={bookmakerId} onChange={(e) => setBookmakerId(e.target.value)}>
              <option value="">—</option>
              {data.bookmakers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </label>
          <label>Evento<input value={event} onChange={(e) => setEvent(e.target.value)} placeholder="Inter - Milan, 1" /></label>
        </div>
        <button className="primary" disabled={!result.ok} onClick={save}>{saved ? 'Salvata ✓' : 'Salva operazione'}</button>
      </details>
    </section>
  )
}

function computeCover(input: Parameters<typeof cover>[0]): { ok?: ReturnType<typeof cover>; error?: string } {
  try {
    return { ok: cover(input) }
  } catch (e) {
    return { error: e instanceof CoverInputError ? e.message : 'Valori non validi' }
  }
}
