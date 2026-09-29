import { useMemo, useState } from 'react'
import { CoverInputError, eur, type BetType } from '../lib/calc'
import { coverMulti } from '../lib/multi'

const num = (s: string) => Number(s.replace(',', '.'))

interface LegText {
  back: string
  lay: string
}

export function MultiCalculator({ defaultCommission }: { defaultCommission: number }) {
  const [type, setType] = useState<BetType>('qualifying')
  const [stake, setStake] = useState('10')
  const [commission, setCommission] = useState((defaultCommission * 100).toString())
  const [legs, setLegs] = useState<LegText[]>([{ back: '1.60', lay: '1.64' }, { back: '1.55', lay: '1.59' }, { back: '1.70', lay: '1.75' }])

  const result = useMemo(() => {
    try {
      return {
        ok: coverMulti({
          type,
          backStake: num(stake),
          commission: num(commission) / 100,
          legs: legs.map((l) => ({ backOdds: num(l.back), layOdds: num(l.lay) })),
        }),
      }
    } catch (e) {
      return { error: e instanceof CoverInputError ? e.message : 'Valori non validi' }
    }
  }, [type, stake, commission, legs])

  const setLeg = (i: number, patch: Partial<LegText>) => setLegs(legs.map((l, j) => (j === i ? { ...l, ...patch } : l)))

  return (
    <section className="card">
      <h2>Copertura multipla</h2>
      <p className="hint">
        I bonus italiani si sbloccano quasi sempre giocando multiple. Si banca <b>una gamba alla volta</b>, prima che inizi. Se una
        gamba perde sul bookmaker hai finito e il profitto è quello indicato. Se vince, prima della gamba successiva aggiorna le
        quote lay delle gambe rimaste e ricalcola: le puntate lay delle gambe future non dipendono da quelle già giocate.
      </p>
      <div className="segmented" role="radiogroup" aria-label="Tipo di puntata">
        {([
          ['qualifying', 'Soldi veri'],
          ['freebet_snr', 'Bonus SNR'],
          ['freebet_sr', 'Bonus SR'],
        ] as const).map(([k, label]) => (
          <button key={k} role="radio" aria-checked={type === k} className={type === k ? 'on' : ''} onClick={() => setType(k)}>{label}</button>
        ))}
      </div>
      <div className="grid">
        <label>Puntata multipla (€)<input inputMode="decimal" value={stake} onChange={(e) => setStake(e.target.value)} /></label>
        <label>Commissione exchange (%)<input inputMode="decimal" value={commission} onChange={(e) => setCommission(e.target.value)} /></label>
      </div>

      <div className="legs">
        {legs.map((l, i) => (
          <div className="leg" key={i}>
            <span className="leg-n">{i + 1}</span>
            <label>Back<input inputMode="decimal" value={l.back} onChange={(e) => setLeg(i, { back: e.target.value })} /></label>
            <label>Lay<input inputMode="decimal" value={l.lay} onChange={(e) => setLeg(i, { lay: e.target.value })} /></label>
            <div className="leg-out">
              {result.ok ? <>Banca <b>{eur(result.ok.layStakes[i])}</b><span className="meta">resp. {eur(result.ok.liabilities[i])}</span></> : '—'}
            </div>
            <button aria-label={`Rimuovi gamba ${i + 1}`} disabled={legs.length === 1} onClick={() => setLegs(legs.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
        <button onClick={() => setLegs([...legs, { back: '1.50', lay: '1.55' }])}>+ Gamba</button>
      </div>

      {result.error && <p className="error">{result.error}</p>}
      {result.ok && (
        <div className="result">
          <div className="big">
            <span>Profitto garantito</span>
            <strong className={result.ok.profit < 0 ? 'neg' : 'pos'}>{eur(result.ok.profit)}</strong>
          </div>
          <dl>
            <dt>Quota totale multipla</dt><dd>{result.ok.totalBackOdds.toFixed(2)}</dd>
            <dt>{type === 'qualifying' ? 'Costo sulla puntata' : 'Valore trattenuto'}</dt><dd>{result.ok.ratingPct.toFixed(1)}%</dd>
            <dt>Liquidità massima sull'exchange</dt><dd>{eur(result.ok.maxLiability)}</dd>
          </dl>
        </div>
      )}
    </section>
  )
}
