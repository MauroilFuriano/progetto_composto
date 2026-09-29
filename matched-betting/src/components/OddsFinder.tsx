import { useState } from 'react'
import { bestBackOdds, fetchEventOdds, fetchLeagues, rating, type League, type OddsEvent } from '../lib/odds'
import type { CalcPrefill } from './Calculator'

interface Props {
  apiKey: string
  commission: number
  onUse: (p: CalcPrefill) => void
}

const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)
const num = (s: string) => Number(s.replace(',', '.'))

export function OddsFinder({ apiKey, commission, onUse }: Props) {
  const [sport, setSport] = useState('football')
  const [leagues, setLeagues] = useState<League[]>([])
  const [league, setLeague] = useState('italy-serie-a')
  const [books, setBooks] = useState('Snai IT')
  const [minOdds, setMinOdds] = useState('1.5')
  const [maxOdds, setMaxOdds] = useState('8')
  const [maxEvents, setMaxEvents] = useState('20')
  const [events, setEvents] = useState<OddsEvent[] | null>(null)
  const [lay, setLay] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!apiKey) {
    return (
      <section className="card">
        <h2>Trovatore di quote</h2>
        <p>
          Serve una chiave gratuita di <a href="https://odds-api.io" target="_blank" rel="noreferrer">odds-api.io</a> (100
          richieste l'ora, 2 bookmaker a scelta nel piano gratuito). Inseriscila in <b>Impostazioni</b>: resta salvata solo in
          questo browser.
        </p>
      </section>
    )
  }

  const run = async (fn: () => Promise<void>) => {
    setLoading(true)
    setError('')
    try {
      await fn()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  const candidates = events ? bestBackOdds(events, list(books), num(minOdds) || 1.01, num(maxOdds) || 1000) : []
  const rows = candidates
    .map((c) => {
      const l = num(lay[c.key] ?? '')
      return { ...c, qual: rating('qualifying', c.backOdds, l, commission), snr: rating('freebet_snr', c.backOdds, l, commission) }
    })
    .sort((a, b) => (b.qual ?? -Infinity) - (a.qual ?? -Infinity) || a.date.localeCompare(b.date))

  return (
    <section className="card">
      <h2>Trovatore di quote</h2>
      <p className="hint">
        1) Carica le quote dei bookmaker. 2) Per gli eventi interessanti scrivi la quota <b>lay</b> che vedi su Betfair.it o Betflag.
        La tabella calcola subito il costo della qualificante e il valore trattenuto delle free bet, e mette in cima le migliori.
      </p>
      <div className="grid">
        <label>Sport<input value={sport} onChange={(e) => setSport(e.target.value)} /></label>
        <label>Campionato
          <div className="inline">
            {leagues.length ? (
              <select value={league} onChange={(e) => setLeague(e.target.value)}>
                {leagues.map((l) => <option key={l.slug} value={l.slug}>{l.name}</option>)}
              </select>
            ) : (
              <input value={league} onChange={(e) => setLeague(e.target.value)} />
            )}
            <button type="button" onClick={() => run(async () => setLeagues(await fetchLeagues(apiKey, sport)))}>Elenco</button>
          </div>
        </label>
        <label>Bookmaker (nomi odds-api.io)<input value={books} onChange={(e) => setBooks(e.target.value)} /></label>
        <label>Quota back min<input inputMode="decimal" value={minOdds} onChange={(e) => setMinOdds(e.target.value)} /></label>
        <label>Quota back max<input inputMode="decimal" value={maxOdds} onChange={(e) => setMaxOdds(e.target.value)} /></label>
        <label>Eventi massimi<input inputMode="numeric" value={maxEvents} onChange={(e) => setMaxEvents(e.target.value)} /></label>
      </div>
      <div className="actions">
        <button className="primary" disabled={loading} onClick={() => run(async () => {
          setEvents(await fetchEventOdds(apiKey, sport, league, list(books), Math.max(1, Math.min(100, num(maxEvents) || 20))))
        })}>
          {loading ? 'Carico…' : 'Carica quote'}
        </button>
      </div>
      {error && <p className="error">{error}</p>}

      {events && rows.length === 0 && <p className="empty">Nessuna quota trovata. Controlla i nomi dei bookmaker e i filtri.</p>}
      {rows.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Evento</th><th>Esito</th><th>Bookmaker</th><th>Back</th><th>Lay</th><th>Qualif.</th><th>SNR</th><th /></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key}>
                  <td>{r.event}<br /><span className="meta">{new Date(r.date).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' })}</span></td>
                  <td>{r.outcome}</td>
                  <td>{r.bookmaker}</td>
                  <td>{r.backOdds.toFixed(2)}</td>
                  <td>
                    <input className="lay" inputMode="decimal" aria-label={`Quota lay ${r.event} ${r.outcome}`} value={lay[r.key] ?? ''}
                      onChange={(e) => setLay({ ...lay, [r.key]: e.target.value })} />
                  </td>
                  <td className={r.qual === null ? '' : r.qual < 0 ? 'neg' : 'pos'}>{r.qual === null ? '—' : `${r.qual.toFixed(1)}%`}</td>
                  <td>{r.snr === null ? '—' : `${r.snr.toFixed(0)}%`}</td>
                  <td>
                    <button disabled={r.qual === null} onClick={() => onUse({ backOdds: r.backOdds, layOdds: num(lay[r.key] ?? ''), event: `${r.event}, ${r.outcome}` })}>
                      Usa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
