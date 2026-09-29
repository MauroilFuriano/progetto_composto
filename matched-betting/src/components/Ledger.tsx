import { eur } from '../lib/calc'
import { operationsCsv, totals, typeLabel, type AppData, type Operation } from '../lib/store'
import { download } from '../lib/download'

interface Props {
  data: AppData
  onChange: (ops: Operation[]) => void
}

export function Ledger({ data, onChange }: Props) {
  const t = totals(data)
  const names = new Map(data.bookmakers.map((b) => [b.id, b.name]))
  const ops = [...data.operations].sort((a, b) => b.date.localeCompare(a.date))

  const settle = (op: Operation) => {
    const raw = prompt('Profitto effettivo (€)', op.expectedProfit.toFixed(2))
    if (raw === null) return
    const v = Number(raw.replace(',', '.'))
    if (Number.isNaN(v)) return
    onChange(data.operations.map((o) => (o.id === op.id ? { ...o, actualProfit: v } : o)))
  }
  const remove = (id: string) => {
    if (confirm('Eliminare questa operazione?')) onChange(data.operations.filter((o) => o.id !== id))
  }

  return (
    <section className="card">
      <div className="row">
        <h2>Registro</h2>
        <button disabled={!ops.length} onClick={() => download('registro-matched-betting.csv', operationsCsv(data), 'text/csv')}>
          Esporta CSV
        </button>
      </div>
      <div className="stats">
        <div><span>Profitto realizzato</span><strong className={t.realized < 0 ? 'neg' : 'pos'}>{eur(t.realized)}</strong></div>
        <div><span>Atteso su aperte ({t.openCount})</span><strong>{eur(t.expectedOpen)}</strong></div>
        <div><span>Bonus completati</span><strong>{t.bonusesDone}</strong></div>
      </div>

      {ops.length === 0 && <p className="empty">Nessuna operazione. Salvale dal calcolatore.</p>}
      <ul className="list">
        {ops.map((o) => (
          <li key={o.id} className="item">
            <div className="row">
              <strong>{names.get(o.bookmakerId) ?? '—'} · {typeLabel(o.type)}</strong>
              <span className="meta">{o.date}</span>
            </div>
            <p>{o.event || 'Evento non indicato'}</p>
            <p className="meta">
              Back {eur(o.backStake)} @ {o.backOdds} · Lay {eur(o.layStake)} @ {o.layOdds} · comm. {(o.commission * 100).toFixed(1)}%
            </p>
            <p>
              Atteso {eur(o.expectedProfit)}
              {o.actualProfit === null ? <em className="meta"> · aperta</em> : <> · effettivo <b className={o.actualProfit < 0 ? 'neg' : 'pos'}>{eur(o.actualProfit)}</b></>}
            </p>
            <div className="actions">
              <button onClick={() => settle(o)}>{o.actualProfit === null ? 'Chiudi' : 'Correggi'}</button>
              <button className="danger" onClick={() => remove(o.id)}>Elimina</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
