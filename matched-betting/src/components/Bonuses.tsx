import { useState } from 'react'
import { eur } from '../lib/calc'
import { seedBookmakers } from '../lib/seed'
import { newId, type Bookmaker, type BonusStatus } from '../lib/store'

const STATUS: Record<BonusStatus, string> = {
  da_fare: 'Da fare',
  in_corso: 'In corso',
  fatto: 'Fatto',
  limitato: 'Conto limitato',
}

const blank = (): Bookmaker => ({
  id: newId(), name: '', bonus: '', bonusValue: 0, minOdds: null, rollover: 0, expiry: '', status: 'da_fare', notes: '',
})

interface Props {
  bookmakers: Bookmaker[]
  onChange: (list: Bookmaker[]) => void
}

export function Bonuses({ bookmakers, onChange }: Props) {
  const [edit, setEdit] = useState<Bookmaker | null>(null)

  const upsert = (b: Bookmaker) => {
    const exists = bookmakers.some((x) => x.id === b.id)
    onChange(exists ? bookmakers.map((x) => (x.id === b.id ? b : x)) : [...bookmakers, b])
    setEdit(null)
  }
  const remove = (id: string) => {
    if (confirm('Eliminare questo bookmaker?')) onChange(bookmakers.filter((b) => b.id !== id))
  }
  const setStatus = (b: Bookmaker, status: BonusStatus) => onChange(bookmakers.map((x) => (x.id === b.id ? { ...b, status } : x)))

  const pending = bookmakers.filter((b) => b.status === 'da_fare' || b.status === 'in_corso')
  const potential = pending.reduce((s, b) => s + b.bonusValue, 0)

  return (
    <section className="card">
      <div className="row">
        <h2>Bonus</h2>
        <div className="actions">
          <button onClick={() => onChange(seedBookmakers(bookmakers))}>Carica elenco 2026</button>
          <button className="primary" onClick={() => setEdit(blank())}>+ Aggiungi</button>
        </div>
      </div>
      <p className="hint">
        {pending.length} bonus da completare, valore nominale {eur(potential)}.
        Con le free bet SNR ne trasformi di solito il 70-80% in soldi veri.
      </p>
      <p className="hint">
        Regole ADM: un solo conto per bookmaker, bonus massimo 100€ per singola giocata. Mai conti a nome di altri, VPN o più
        account: è il modo più rapido per farsi chiudere il conto e perdere il saldo.
      </p>

      {edit && <BookmakerForm value={edit} onSave={upsert} onCancel={() => setEdit(null)} />}

      {bookmakers.length === 0 && !edit && <p className="empty">Nessun bookmaker. Aggiungi il primo bonus da seguire.</p>}
      <ul className="list">
        {bookmakers.map((b) => (
          <li key={b.id} className={`item status-${b.status}`}>
            <div className="row">
              <strong>{b.name}</strong>
              <select aria-label={`Stato ${b.name}`} value={b.status} onChange={(e) => setStatus(b, e.target.value as BonusStatus)}>
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <p>{b.bonus || '—'}</p>
            <p className="meta">
              Valore {eur(b.bonusValue)}
              {b.minOdds ? ` · quota min ${b.minOdds}` : ''}
              {b.rollover ? ` · rollover ${b.rollover}x` : ''}
              {b.expiry ? ` · scade ${b.expiry}` : ''}
            </p>
            {b.notes && <p className="meta">{b.notes}</p>}
            <div className="actions">
              <button onClick={() => setEdit(b)}>Modifica</button>
              <button className="danger" onClick={() => remove(b.id)}>Elimina</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function BookmakerForm({ value, onSave, onCancel }: { value: Bookmaker; onSave: (b: Bookmaker) => void; onCancel: () => void }) {
  const [b, setB] = useState(value)
  const set = <K extends keyof Bookmaker>(k: K, v: Bookmaker[K]) => setB({ ...b, [k]: v })
  const n = (s: string) => Number(s.replace(',', '.')) || 0
  return (
    <form className="form" onSubmit={(e) => { e.preventDefault(); if (b.name.trim()) onSave(b) }}>
      <div className="grid">
        <label>Nome<input required value={b.name} onChange={(e) => set('name', e.target.value)} /></label>
        <label>Valore bonus (€)<input inputMode="decimal" value={b.bonusValue || ''} onChange={(e) => set('bonusValue', n(e.target.value))} /></label>
        <label>Quota minima<input inputMode="decimal" value={b.minOdds ?? ''} onChange={(e) => set('minOdds', e.target.value ? n(e.target.value) : null)} /></label>
        <label>Rollover (x)<input inputMode="decimal" value={b.rollover || ''} onChange={(e) => set('rollover', n(e.target.value))} /></label>
        <label>Scadenza<input type="date" value={b.expiry} onChange={(e) => set('expiry', e.target.value)} /></label>
      </div>
      <label>Descrizione bonus<textarea rows={2} value={b.bonus} onChange={(e) => set('bonus', e.target.value)} /></label>
      <label>Note<textarea rows={2} value={b.notes} onChange={(e) => set('notes', e.target.value)} /></label>
      <div className="actions">
        <button type="submit" className="primary">Salva</button>
        <button type="button" onClick={onCancel}>Annulla</button>
      </div>
    </form>
  )
}
