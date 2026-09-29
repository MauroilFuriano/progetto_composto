import { useRef, useState } from 'react'
import { download } from '../lib/download'
import { emptyData, parseData, type AppData, type Settings as S } from '../lib/store'

interface Props {
  data: AppData
  onSettings: (s: S) => void
  onReplace: (d: AppData) => void
}

export function Settings({ data, onSettings, onReplace }: Props) {
  const [commission, setCommission] = useState((data.settings.commission * 100).toString())
  const [key, setKey] = useState(data.settings.oddsApiKey)
  const [msg, setMsg] = useState('')
  const file = useRef<HTMLInputElement>(null)

  const save = () => {
    const c = Number(commission.replace(',', '.'))
    if (!(c >= 0 && c < 100)) return setMsg('Commissione non valida')
    onSettings({ commission: c / 100, oddsApiKey: key.trim() })
    setMsg('Salvato ✓')
  }

  const importFile = async (f: File) => {
    try {
      onReplace(parseData(await f.text()))
      setMsg('Backup importato ✓')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Import fallito')
    }
  }

  return (
    <section className="card">
      <h2>Impostazioni</h2>
      <div className="grid">
        <label>Commissione exchange di default (%)<input inputMode="decimal" value={commission} onChange={(e) => setCommission(e.target.value)} /></label>
        <label>Chiave odds-api.io<input type="password" autoComplete="off" value={key} onChange={(e) => setKey(e.target.value)} /></label>
      </div>
      <div className="actions"><button className="primary" onClick={save}>Salva</button></div>
      {msg && <p className="meta">{msg}</p>}

      <h3>Backup</h3>
      <p className="hint">I dati restano solo in questo browser. Esporta un backup ogni tanto, soprattutto prima di cambiare dispositivo.</p>
      <div className="actions">
        <button onClick={() => download(`matched-betting-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ ...data, settings: { ...data.settings, oddsApiKey: '' } }, null, 2), 'application/json')}>
          Esporta backup
        </button>
        <button onClick={() => file.current?.click()}>Importa backup</button>
        <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
        <button className="danger" onClick={() => { if (confirm('Cancellare tutti i dati?')) onReplace(emptyData()) }}>Cancella tutto</button>
      </div>

      <h3>Gioco responsabile</h3>
      <p className="hint">
        Il matched betting funziona solo se ogni puntata è coperta. Se ti trovi a scommettere senza copertura o per "recuperare",
        fermati. Autoesclusione ADM: dall'area personale di qualsiasi bookmaker autorizzato. Telefono Verde Nazionale per le
        problematiche del gioco d'azzardo (ISS): 800 558 822.
      </p>
    </section>
  )
}
