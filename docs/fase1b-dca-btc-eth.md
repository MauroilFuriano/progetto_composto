# Fase 1b: spot + DCA su BTC ed ETH

*Aggiornato al 28/09/2026. Questo documento contiene:*
- *backtest fatti da me sui prezzi giornalieri Coin Metrics (BTC dal 2010, ETH dal 2015, dati fino al 23/05/2026, in USD);*
- *una ricerca su repository pubblici e discussioni della community.*

*Codice e risultati:*
- `research/dca_backtest.py`
- `research/btc_sleeve_backtest.py`
- `research/risultati_*.txt`

> Non è consulenza finanziaria. I rendimenti passati di BTC/ETH vengono dalla fase di adozione iniziale e **non si ripeteranno** agli stessi livelli.

## Conclusione

**Il DCA puro su BTC/ETH non fa per te.**
- Nei backtest il conto è sceso del 75% nella mediana delle finestre di 5 anni, e fino all'83% (BTC) e al 94% (ETH).
- Le varianti "smart" (Mayer Multiple, MVRV, take profit) non cambiano questo quadro.

**Ha funzionato BTC come quota fissa del portafoglio:**
- 10-15% del capitale in BTC spot, il resto in liquidità remunerata (monetario o BTP brevi);
- ribilanciamento ogni trimestre;
- versamenti settimanali.

| Quota BTC | IRR mediano (5 anni) | IRR 10° percentile | Drawdown peggiore | Finestre in perdita |
|---|---|---|---|---|
| 10% | 9,3% | 7,6% | **-9,4%** | 0% |
| 15% | 12,6% | 10,0% | **-14,9%** | 0% |
| 20% | 15,7% | 12,2% | -20,4% | 0% |
| 30% | 21,9% | 16,1% | -29,4% | 0% |

*Finestre mobili con partenza ogni mese dal 2016, liquidità al 2,5% annuo, commissioni 0,5%, tasse escluse.*

**È l'unica strategia BTC che nei dati rispetta il tuo limite del 15%.** Anche se BTC andasse a zero, la perdita resta limitata circa alla quota scelta. Il ribilanciamento vende BTC quando sale e lo ricompra quando scende, e questo aggiunge rendimento nel tempo.

**Stima onesta per il futuro:**
- Quegli IRR includono gli anni 2016-2021, irripetibili. Il rendimento di BTC cala da un ciclo all'altro, e dal picco di ottobre 2025 ha fatto circa -50%.
- Con BTC al 10-20% annuo in futuro, la quota al 10-15% dà circa **5-7% lordo, 4-5,5% netto**.
- Con BTC piatto, circa 2-3%.
- Con BTC a zero, circa -10/-15% totale.

## 1. DCA puro: cosa dicono i dati

Versamento di 50 a settimana, commissioni 0,5%.

| Portafoglio | Partenza | Versato | Finale | IRR | Calo massimo del conto |
|---|---|---|---|---|---|
| BTC | gen 2016 | 27.100 | 576.803 | 55% | -83% |
| BTC | picco dic 2017 | 22.000 | 107.204 | 36% | -75% |
| BTC | picco nov 2021 | 11.800 | 21.829 | 28% | -47% (il conto è sceso fino al -52% rispetto al versato) |
| BTC | picco ott 2025 | 1.650 | 1.512 | -25% | -24% |
| ETH | picco nov 2021 | 11.800 | 11.206 | **-2%** | -60% |
| ETH | picco ott 2025 | 1.650 | 1.321 | -53% | -34% |

- **Finestre mobili BTC (5 anni):**
  - nessuna finestra in perdita;
  - IRR mediano 49%;
  - drawdown mediano del conto **-75%**, peggiore -83%.
- **ETH va peggio di BTC:**
  - il rapporto ETH/BTC è sceso in 8 degli ultimi 11 anni [R32];
  - il 9,5% delle finestre di 3 anni finisce in perdita, il peggiore drawdown è -94%.
  - Non consiglio ETH come pilastro.
- **Lump sum** (investire tutto subito) 5.000 al picco di novembre 2021:
  - BTC: 5.886 dopo 4,5 anni, drawdown -76%;
  - ETH: 2.279.

**Varianti "smart DCA"** (dati in `research/risultati_dca.txt`):
- **Mayer Multiple** (prezzo diviso media mobile a 200 giorni: 2x sotto 0,8, 0x sopra 2,4) e **MVRV**:
  - differenza di IRR rispetto al DCA semplice di circa ±1 punto;
  - drawdown identico;
  - in pratica è rumore.
- **Take profit** (vendi il 5% a settimana se Mayer > 2,4):
  - taglia il drawdown peggiore da -83% a -69%, ancora lontanissimo dal 15%;
  - dal 2021 **non è mai scattato**, perché il Mayer non ha più superato 2,4 [R17][R18].

## 2. Cosa dice la community (repo, forum, paper)

### 2.1 I segnali di ciclo hanno smesso di funzionare (evidenza alta, più fonti indipendenti)

- **Picchi del Mayer Multiple:** 6,6 (2013), 3,7 (2017), 2,0 (2021), 1,2 (agosto 2025) [R17].
- **Picchi dell'MVRV:** 5,9 → 4,7 → 4,0 → 2,7 [R19].
- **Al massimo di ottobre 2025** nessuno dei famosi indicatori è scattato: Pi Cycle, MVRV-Z, 2y-MA×5 [R18][R19].
- Le soglie fisse "vendi quando…" trovate su Reddit e TradingView sono tarate sul passato e **decadono**.

### 2.2 "Comprare di più sotto la media a 200 settimane" (evidenza media-bassa)

- A **parità di budget**, circa +20-35% di BTC per ciclo in 3 cicli, con vantaggio calante [R20]. Viene da un venditore del servizio, con una metrica proprietaria.
- Molti confronti "+249% contro +166%" usano **più capitale** della DCA semplice. Non sono confronti validi [R21][R22].
- Due backtest open source con codice trovano che **la DCA semplice vince** [R12][R13].
- Il mio backtest conferma: circa +0-1% di IRR.

### 2.3 Power law e modelli "a orologio" (evidenza bassa per la previsione)

- **Power law (Santostasi):** descrive bene il passato (R² 96%), ma la previsione "210k $ a gennaio 2026" è fallita [R16].
- **Nessun modello di previsione batte il prezzo di oggi:** nessuno studio peer-reviewed ci riesce su orizzonti da 1 a 6 mesi [R15].
- **Molnar, "Bitcoin runs on a clock":** prevede il minimo di ciclo tra ottobre e novembre 2026, ma ammette che il risultato è statisticamente indistinguibile dal caso [R14].

### 2.4 Trasformare BTC in rendita

- **"Regola del 4%" su BTC:** si basa sul power law come ipotesi, quindi è circolare [R24].
- **Covered call su BTC** (Anchorage, backtest 2021-2026) [R23]:
  - vendute sempre: **-0,5% annuo**;
  - con filtri: circa +5%.
  - Deribit non ha licenza MiCA/MiFID per l'UE [R29].
  - Gli ETF USA che distribuiscono (YBTC, MSTY) restituiscono capitale, non reddito [R25].
- **Conclusione:** oggi non esiste una "rendita" affidabile generata da BTC. Il reddito si ottiene vendendo quote, e le tasse sono al 33%. La rendita stabile del portafoglio deve venire dalla parte in liquidità e obbligazioni.

## 3. Repository pubblici: cosa si può copiare

| Repository | Cosa fa | Licenza | Giudizio |
|---|---|---|---|
| [Jorijn/bitcoin-dca](https://github.com/Jorijn/bitcoin-dca) | DCA semplice via Docker su Kraken/Bitvavo, prelievo opzionale verso il proprio wallet | MIT | **Il più adatto come base DCA**. Il prelievo richiede la chiave con permesso di prelievo: meglio non usarlo |
| [bewagner/kraken_api_dca](https://github.com/bewagner/kraken_api_dca) | Ordini periodici su Kraken via cron | GPL-3.0 | Minimale e funziona. Chiavi in un file in chiaro |
| [freqtrade/freqtrade](https://github.com/freqtrade/freqtrade) | Framework per bot di trading; il DCA si fa con `adjust_trade_position` | GPL-3.0 | Ottimo per i backtest, ma pensato per il trading attivo. Bug noti sul DCA nei backtest |
| [Drakkar-Software/OctoBot](https://github.com/Drakkar-Software/OctoBot) | DCA, grid, "AI" | GPL-3.0 | Troppo complesso, spinge verso il cloud a pagamento |
| [Open-Trader/opentrader](https://github.com/Open-Trader/opentrader) | DCA "stile 3Commas" (compra di più sui ribassi per abbassare il prezzo medio) | Apache-2.0 | **Da evitare**: rischio di restare con posizioni in perdita |
| [VanHes1ng/SDCA](https://github.com/VanHes1ng/SDCA) | Segnali in base allo z-score rispetto alla media a 200 settimane | MPL-2.0 | Solo segnali, soglie arbitrarie |
| [zhoudaxia233/WhenShouldUBuyBitcoin](https://github.com/zhoudaxia233/WhenShouldUBuyBitcoin) | Moltiplicatori di acquisto basati su AHR999 e power law | MIT | Utile come analisi, ma dipende dal power law |
| Sable, smart-dca-bot su Hyperliquid | "+50-60% rispetto alla DCA" senza backtest, eseguiti su DeFi o DEX | — | **Da evitare** |

**Valutazione:** nessun repo contiene una strategia con un vantaggio dimostrato da copiare. Il valore sta nel codice di esecuzione, non nella strategia.

**Proposta:** scrivere un bot nostro piccolo, sul modello di `bitcoin-dca`, che faccia DCA e ribilanciamento della quota.

## 4. Truffe e rischi operativi

- **3Commas (2022):** fuga di circa 100k chiavi API, con perdite verificate di almeno 14,8 mln $ [R26].
  - **Mai dare le chiavi a piattaforme di bot di terzi.**
  - Le chiavi vanno create solo con permesso di trading, **senza prelievo**, con whitelist IP.
- **Bot "AI/arbitraggio" con rendimenti garantiti:** sono lo schema tipico delle frodi [R27].
- **CONSOB:** oltre 1.800 siti oscurati, molti di "trading quantitativo" [R28].

## 5. Tasse

- **BTC spot detenuto su un exchange:**
  - plusvalenze al **33%**, senza franchigia;
  - minusvalenze compensabili solo con altre crypto;
  - quadro RW più imposta IVCA dello 0,2%.
- **ETP su BTC in un dossier titoli italiano** (es. Directa, regime amministrato):
  - **26%**, con tasse e bollo gestiti dalla banca [R30];
  - nessun rischio exchange (ETP a replica fisica).
  - ⚠️ Confermare il trattamento col commercialista.
- **Conseguenza pratica:** la quota BTC si può tenere **tramite ETP sullo stesso broker degli ETF**. Così tutto il portafoglio (monetario, ETF e quota BTC) è gestito da un solo bot, con meno tasse sulle vendite di ribilanciamento. In alternativa si usa BTC spot su Kraken con `ccxt`.

## 6. Proposta aggiornata per la fase 2

Unire la fase 1 e questa ricerca in un solo bot:

| Componente | Peso | Strumento |
|---|---|---|
| Liquidità / BTP brevi | 60-70% | XEON, BTP 1-3 anni |
| Azionario globale con filtro di trend a 10 mesi | 15-25% | SWDA/VWCE |
| **BTC** | **10-15%** | ETP BTC (Directa) oppure spot su Kraken |

**Regole:**
- Versamento settimanale o mensile (DCA) diviso secondo i pesi.
- Ribilanciamento trimestrale, solo se uno scostamento supera 3 punti.
- Kill switch quando il portafoglio perde il 13% dal picco.
- Blocco degli acquisti di ribilanciamento su BTC se BTC è sceso più dell'80% dal massimo, per non "mediare verso lo zero".

**Rendimento atteso realistico:** circa 4,5-6,5% lordo, 3,5-5% netto. Il drawdown resta entro il 15% nei backtest.

**Da decidere:**
1. BTC tramite **ETP su Directa** (consigliato: tasse al 26%, un solo broker) oppure **spot su Kraken**?
2. Quota BTC al **10%** (più prudente) o al **15%** (al limite del tuo drawdown)?
3. Includere ETH? Non lo consiglio.

---

## Fonti

- **[R2]-[R11]** Repository GitHub nella tabella della sezione 3.
- **[R12]** https://github.com/erodactyl/backtesting-btc-trading-strategies
- **[R13]** https://github.com/DwcQuocXa/n8n-btc-dca-automate/blob/master/past-test-workflow/4YEAR_EXPERIMENT_REPORT.md
- **[R14]** Molnar, *Bitcoin Runs on a Clock* — https://arxiv.org/abs/2607.26188
- **[R15]** Baquero, rassegna sui modelli di previsione — https://arxiv.org/abs/2606.00071
- **[R16]** Power law peer-reviewed — https://beincrypto.com/bitcoin-power-law-peer-reviewed-study/
- **[R17]** Mayer Multiple storico — https://satoshimacro.com/tools/crypto/cycle-indicators/bitcoin-mayer-multiple/
- **[R18]** Perché gli indicatori di massimo hanno fallito — https://bitcoinmagazine.com/markets/why-bitcoin-price-top-indicators-failed
- **[R19]** Indicatori di massimo silenziosi all'ATH — https://www.prnewswire.com/news-releases/every-famous-bitcoin-top-indicator-went-silent-at-the-all-time-high-new-research-explains-why-302831905.html
- **[R20]** Acquisti sotto la 200WMA — https://hduynam99.substack.com/p/buying-bitcoin-at-the-200-week-moving
- **[R21]** Alphabit, performance — https://alphabitlab.com/performance
- **[R22]** Post Reddit ripubblicato — https://apps.coinsnews.com/anyone-else-who-is-fearlessly-buying-the-dip-using-dca-type-strategy
- **[R23]** Anchorage, covered call su BTC — https://www.anchorage.com/insights/synthetic-yield-on-bitcoin-implementation-discipline-and-performance-boundaries-of-systematic-covered-call-writing
- **[R24]** Tasso di prelievo sicuro su BTC — https://btcpowerlaw.nl/research/bitcoin-swr/
- **[R25]** Roundhill YBTC — https://www.roundhillinvestments.com/etf/ybtc/
- **[R26]** 3Commas — https://decrypt.co/118094/after-repeated-denials-3commas-admits-it-was-source-for-earlier-hacks
- **[R27]** CFTC, truffe AI e arbitraggio — https://crypeto.com/cftc-issues-warning-on-ai-driven-crypto-scams-exploiting-arbitrage-trading-strategies/
- **[R28]** CONSOB, oscuramento siti — https://www.consob.it/web/consob-and-its-activities/w/press-release-of-26-february-2026-black-out-websites
- **[R29]** Deribit e MiCA — https://perpfinder.com/mica/deribit (solo snippet)
- **[R30]** Tassazione ETP bitcoin 2026 — https://centrofiscale.com/tassazione-etf-bitcoin-2026-etp-quadro-rw/
- **[R32]** Storia del rapporto ETH/BTC — https://www.simianx.ai/stories/eth-btc-ratio-history-every-cycle-and-signal-2016-2026
- **Dati di prezzo:** Coin Metrics community data — https://github.com/coinmetrics/data
