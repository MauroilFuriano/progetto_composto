import { useState } from 'react'
import { Bonuses } from './components/Bonuses'
import { Calculator, type CalcPrefill } from './components/Calculator'
import { Ledger } from './components/Ledger'
import { MultiCalculator } from './components/MultiCalculator'
import { OddsFinder } from './components/OddsFinder'
import { Settings } from './components/Settings'
import { loadData, saveData, type AppData } from './lib/store'

type Tab = 'calc' | 'multi' | 'bonus' | 'ledger' | 'odds' | 'settings'

const TABS: [Tab, string][] = [
  ['calc', 'Singola'],
  ['multi', 'Multipla'],
  ['odds', 'Quote'],
  ['bonus', 'Bonus'],
  ['ledger', 'Registro'],
  ['settings', 'Impostazioni'],
]

export default function App() {
  const [data, setData] = useState<AppData>(loadData)
  const [tab, setTab] = useState<Tab>('calc')
  const [prefill, setPrefill] = useState<CalcPrefill>({})
  const [calcKey, setCalcKey] = useState(0)
  const [saveFailed, setSaveFailed] = useState(false)

  const update = (d: AppData) => {
    setData(d)
    setSaveFailed(!saveData(d))
  }

  const useOdds = (p: CalcPrefill) => {
    setPrefill(p)
    setCalcKey((k) => k + 1)
    setTab('calc')
  }

  return (
    <div className="app">
      <header>
        <h1>Matched Betting</h1>
        <nav>
          {TABS.map(([k, label]) => (
            <button key={k} className={tab === k ? 'on' : ''} aria-current={tab === k} onClick={() => setTab(k)}>{label}</button>
          ))}
        </nav>
      </header>
      {saveFailed && <p className="error">Impossibile salvare nel browser (modalità privata?). Esporta un backup.</p>}
      <main>
        {tab === 'calc' && <Calculator key={calcKey} data={data} prefill={prefill} onSave={(op) => update({ ...data, operations: [...data.operations, op] })} />}
        {tab === 'multi' && <MultiCalculator defaultCommission={data.settings.commission} />}
        {tab === 'odds' && <OddsFinder apiKey={data.settings.oddsApiKey} commission={data.settings.commission} onUse={useOdds} />}
        {tab === 'bonus' && <Bonuses bookmakers={data.bookmakers} onChange={(bookmakers) => update({ ...data, bookmakers })} />}
        {tab === 'ledger' && <Ledger data={data} onChange={(operations) => update({ ...data, operations })} />}
        {tab === 'settings' && <Settings data={data} onSettings={(settings) => update({ ...data, settings })} onReplace={update} />}
      </main>
    </div>
  )
}
