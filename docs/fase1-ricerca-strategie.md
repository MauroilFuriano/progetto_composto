# Fase 1: quale strategia automatica fa per Mauro

*Ricerca aggiornata al 28/09/2026. Parametri usati, cioè i valori d'esempio del brief:*
- *capitale 5.000 €;*
- *perdita massima dal picco accettata 15%;*
- *manutenzione 1 ora a settimana;*
- *orizzonte 3-5 anni.*

> Non è consulenza finanziaria né fiscale. I numeri storici non garantiscono i rendimenti futuri. Accanto a ogni dato c'è la fonte, con un codice tra parentesi quadre (es. [E13]) che rimanda all'elenco in fondo. I dati non verificati sono segnalati con ⚠️.

---

## 0. Conclusione

**La strategia migliore per te è un portafoglio difensivo di ETF UCITS.** È composto così:
- una parte stabile in monetario o BTP brevi;
- una quota azionaria globale protetta da un filtro di trend (la media mobile a 10 mesi);
- un po' di oro;
- una dimensione delle posizioni regolata dalla volatilità.

Va eseguito una volta al mese da un bot in Python. È l'unica combinazione con prove accademiche solide che può restare entro un drawdown del 15%. Il suo vantaggio è la *riduzione delle perdite*, non un rendimento extra.

Tre cose da sapere prima di scegliere:

1. **Con il vincolo del 15% il 6-10% netto l'anno non è raggiungibile in modo affidabile.**
   - Nessuna strategia che ho trovato ha dato insieme il 6-10% e un drawdown massimo sotto il 15% in modo verificabile e ripetibile.
   - Le strategie che rendono il 6-10% hanno avuto drawdown storici tra il 20% e il 65%. Quelle che restano sotto il 15% rendono circa il 3-6% lordo.
   - L'obiettivo realistico è **circa il 3,5-5,5% nominale netto**. Con l'inflazione dell'area euro al 3,3% (agosto 2026) il rendimento reale è circa lo 0-2% l'anno [E1][E2].
2. **Nessuna strategia automatica batte in modo affidabile un semplice DCA su ETF, come rendimento.**
   - Il DCA (piano di accumulo) su un ETF azionario globale rende di più nel lungo periodo.
   - Però ha avuto un drawdown di **-55/-65% in euro** nel 2000-2009 [E8][E9], quindi non rispetta il tuo vincolo.
   - Il bot serve a far rispettare il tuo limite di rischio in modo disciplinato, non a guadagnare di più.
3. **Crypto e forex non superano il filtro come strategia principale.**
   - Le strategie "senza esposizione al prezzo" (funding, basis, Ethena) oggi rendono circa quanto un titolo di Stato a breve (3,5-5%). In cambio hanno rischi di coda reali. Ad esempio il 10/10/2025, durante il crollo, gli exchange hanno chiuso d'ufficio le coperture dei trader (auto-deleveraging) [C9][C10].
   - Il grid trading ha valore atteso zero, o negativo dopo le commissioni [C12].
   - Nel forex CFD perde il 74-89% dei conti retail [F1][F2].
   - L'unica idea crypto che resta in piedi è una quota piccola di BTC con volatility targeting, come componente satellite.

---

## 1. Tabella comparativa

Legenda: **Netto** = rendimento annuo realistico dopo costi, prima delle tasse, salvo dove indicato. **DD** = drawdown massimo storico. **Automaz.** = quanto è automatizzabile e con quanta manutenzione.

| Strategia | Netto realistico | DD storico (quando) | Vantaggio sfruttato e persistenza | Rischi di coda | Automaz. | Capitale minimo | Fisco IT | Vincolo 15%? |
|---|---|---|---|---|---|---|---|---|
| **PAC/DCA ETF azionario globale** | ~6% annuo 2000-2025 in EUR, ~11% negli ultimi 10 anni [E7] | **-65%** prezzo in EUR 2000-09 [E8]; -34% 2020; -18% 2022 | Premio al rischio azionario: persistente | Mercati orso lunghi (recupero 2000→2014 [E9]) | Totale, manutenzione ~0 | ~0 (PAC gratuiti) | 26%; minus ETF non compensabili con plus ETF [T7] | ❌ |
| **Bilanciato 60/40 / 40/60 con ribilanciamento** | 7-8% USD su 30 anni (lordo) [E11]; attese 2026 ~5-6% [E12] | 60/40: -30,6% (2008), -20,7% (2022); 40/60: -19,2% / -18,6% [E11] | Premi al rischio azionari e obbligazionari: persistenti, ma nel 2022 azioni e obbligazioni sono scese insieme | Tassi in rialzo (BCE ha alzato i tassi 2 volte nel 2026 [E1]) | Totale, 1-2 operazioni l'anno | ~2-3k | 26% e 12,5% (titoli di Stato) | ❌ di poco |
| **Permanent Portfolio / All Weather** | ~7% USD 30 anni [E11]; attese ~5,4% [E12] | -15,9% / -20,6% (2022) [E11] | Diversificazione tra regimi economici | Obbligazioni lunghe nel 2022 | Totale, ribilanciamento annuale | ~3k | come sopra | ⚠️ al limite |
| **Trend following multi-asset (CTA)** | SG Trend 5,7-5,9% 2000-2026 [F16][E19]; backtest secolare ~11% netto 2/20 [E14] | -20/-23% (2018-19, 2025) [F16][E18] | Momentum nel tempo (Moskowitz-Ooi-Pedersen [E13]): persistente ma ciclico; anni piatti 2011-19 e 2023-25 [E21] | Lunghi periodi piatti, falsi segnali | Media: futures non fattibili con 5k; fondi USA senza KID | >50-100k in futures | 26% | ❌ |
| **Filtro trend 10 mesi (Faber) su ETF** | Simile al buy-and-hold nel lungo periodo; peggio in 6 anni su 8 dopo il 2009 [E22][E23] | Da -46% a <10% nel backtest dal 1973; Faber stesso prevede fino a -20% [E22] | Riduce le perdite nei ribassi lenti (2000-02, 2008) | Crolli rapidi (Covid: -34% in 40 giorni) | Totale, regola mensile | ~3-5k | Ogni uscita realizza plus al 26% | ✅ in combinazione con monetario |
| **Dual momentum (GEM)** | Fuori campione 2014-26: 8,4% contro 13,6% S&P [E25] ⚠️ | -20% [E25]; backtest dell'autore -17,8% [E24] | Momentum relativo e assoluto: fragile ai parametri (9 contro 10 mesi: +43% contro +146% [E26]) | Scelta dei parametri a posteriori | Totale | ~3k | 26% | ❌ |
| **Momentum tra titoli / fattori** | Premio ridotto del 58% dopo la pubblicazione [E27] | Crollo momentum 2009 ⚠️ | Anomalie erose dopo la pubblicazione | Crolli del momentum | Totale via ETF | ~3k | 26% | ❌ |
| **Dividendi** | Nessun rendimento extra ("free dividends fallacy") [E28] | Come l'azionario | Nessun vantaggio: è un bias comportamentale | Come l'azionario | Totale | — | 26% immediato sulle cedole | ❌ |
| **Volatility targeting (su azioni)** | Fuori campione non batte l'originale [E30] | Riduce il DD | Regolazione del rischio, non un vantaggio di rendimento | Instabilità dei parametri | Totale | ~3k | 26% | ✅ come gestione del rischio |
| **Monetario / BTP brevi / conti deposito** | XEON ~2,2-2,4% [E31]; conti deposito 3-3,35% lordo [E34]; BTP 5 anni cedola 3,95% [E4] | ~0% (monetario); BTP brevi pochi punti % | Tasso privo di rischio | Rischio Italia (spread), tassi | Totale | 0 | 12,5% titoli di Stato; 26% ETF monetario; bollo 0,2% | ✅ |
| **BTC/ETH buy-and-hold o DCA** | Molto alto nella storia, ma dominato dal periodo osservato | **-77/-84%** (2018, 2022), -51% nel 2025-26 [C16][C17] | Premio al rischio non garantito | Exchange, regolatorio | Totale | ~0 | **33% dal 2026** [T2][T3] | ❌ |
| **BTC con volatility targeting (10%)** | Sharpe ~0,74-0,79; ~7-8% lordo stimato ⚠️ | **-15/-17%** nel backtest 2017-2025 [C14] | Il merito è dello scaling sulla volatilità, non del segnale di trend | Un solo backtest, campione corto; gap di prezzo | Totale, settimanale | ~1k come componente satellite | 33% spot; 26% se ETP ⚠️ | ⚠️ come componente satellite |
| **Grid trading** | Valore atteso 0, negativo dopo le fee [C12] | ~-50% quando il mercato fa -80% [C13] | Nessuno: vende volatilità "al buio" | Trend e crolli | Totale | ~1k | 33% | ❌ |
| **Funding rate / basis trade** | 2019-24 ~7% [C1]; **2026 ~3,5-5%**, circa quanto un T-bill [C5][C6] | -4,4% nel backtest [C2]; le code reali non ci sono nel backtest | Domanda di leva retail: **in calo** (11% nel 2024, 5% nel 2025, 3,5% nel 2026) | **ADL 10/10/2025** [C9]; FTX 2022; depeg di USDe a 0,65 su Binance [C7]; leva perpetual per il retail UE limitata a **2:1** [T27] | Media-alta, 2 conti | >10-20k | 33% spot; perpetual 26% o 33% ⚠️ [T9][T11] | ❌ netto troppo basso per il rischio |
| **Staking ETH/SOL** | Reale ~1,5-2,5% [C20][C21] | Come il sottostante (-77/-94%) | Emissione del protocollo | Slashing, depeg degli LST | Totale | ~0 | 33% al ricevimento [T5] | ❌ |
| **Market making / arbitraggio tra exchange** | Nessuna prova di profitto per il retail [C23] | — | Assorbito dagli HFT | Controparte ×N exchange | Alta complessità | Alto | 33% | ❌ |
| **Earn / prestito di stablecoin** | ≈ tassi monetari | Perdita totale o congelamento (Celsius, BlockFi, Genesis 2022) [C24] | Nessuno: il premio paga il rischio controparte | Fallimento della piattaforma | Totale | ~0 | 33% | ❌ |
| **Forex / CFD attivo** | **Negativo**: 74-89% dei conti retail in perdita [F1][F2] | Fino a -100% | Nessun vantaggio documentato per il retail [F3][F4][F5] | Leva | Alta | Basso | 26% | ❌ |
| **Carry trade FX** | ~5% lordo 1990-2012, ridotto dagli swap retail [F7][F13] | -31/-35% (2008) [F7]; agosto 2024 [F12] | Premio per il rischio di crollo | Chiusure forzate delle posizioni | Alta | Basso | 26% | ❌ |
| **Vendita put / covered call** | PUT 9,2%, BXM 8,5% [F18][F21] | **-32,7% / -35,8%** (2008) | Premio per il rischio di volatilità: persistente, ma è di fatto rischio azionario | Volmageddon 2018 [F22] | Media | Troppo nozionale per 5k su SPX | 26% | ❌ |
| **P2P lending** | 4-6% prima delle insolvenze [F28] | Perdita della piattaforma (Envestio, Kuetzal) [F23][F24]; Mintos Russia [F26] | Premio di credito e illiquidità | Frode, piattaforma | Bassa (niente API) | ~1k | 26% | ❌ |
| **Bot "AI" / copy trading / venditori di bot** | Nessuna prova; truffe frequenti [F32][F34][F35] | Perdita totale | — | Frode, furto di chiavi API (3Commas [F37]) | — | — | — | ❌ |

---

## 2. Classifica delle 3 strategie migliori per il tuo profilo

### 🥇 1. "Core difensivo": ETF UCITS con filtro trend e volatility targeting (consigliata)

**Perché è la prima:**
- Combina le due tecniche con le prove più solide per *ridurre le perdite*:
  - il filtro di trend a 10 mesi di Faber [E22];
  - il trend following in generale, positivo in 8 delle 10 peggiori crisi del 60/40 [E14].
- Tiene una base ampia in strumenti quasi privi di rischio, che assorbe i crolli rapidi dove il filtro arriva in ritardo. Nel 2020 la parte azionaria è scesa del 34% in 40 giorni.
- Si esegue una volta al mese: poche operazioni, poche commissioni, poche tasse da realizzare. È compatibile con 1 ora a settimana.
- Mercato regolamentato, broker autorizzato, niente rischio exchange crypto.
- Backtest pubblici vicini a questa impostazione:
  - 30/40/30 con managed futures: DD peggiore -14,7% nel 1980-2018 [E35]. ⚠️ La fonte è promozionale e in USD.
  - Invesco: filtro trend che porta il DD da -20,7% a -12,8% [E19].

**Stima onesta:** 4-6% lordo, 3,5-5% netto, DD atteso 10-15%. **Non esiste un backtest verificato in EUR con ETF UCITS.** Lo costruiremo in fase 2 e, se il DD supera il 15% nel 2008, 2020 o 2022, riduco i pesi finché rientra.

**Limiti:**
- Nei mercati laterali il filtro genera falsi segnali, che costano commissioni e tasse.
- Rende meno del buy-and-hold azionario negli anni di forte rialzo.

### 🥈 2. "Barbell statico": monetario/BTP + PAC su ETF globale, ribilanciamento annuale

**Perché è la seconda:**
- È il punto di riferimento onesto, quasi senza bot: circa 70-75% in monetario e BTP brevi, circa 25-30% in ETF azionario globale.
- Il DD massimo stimato è circa 0,28 × 65% ≈ **-18%** nello scenario peggiore 2000-09, e circa -10% nel 2008 e nel 2020.
- Rendimento atteso circa 3,5-4,5% lordo.
- Non dipende da nessun segnale: niente rischio di aver adattato i parametri al passato, tasse realizzate al minimo.
- Se la strategia 1 in fase 2 non batte chiaramente questa, conviene questa.

**Limite:** per restare entro il 15% nel caso peggiore la quota azionaria deve scendere a circa il 20%, e il rendimento si avvicina a quello del monetario.

### 🥉 3. Componente satellite BTC con volatility targeting (massimo 5-10% del capitale)

**Perché è la terza:**
- L'unica strategia crypto con un backtest indipendente che rispetta un DD di circa 15%: vol-target al 10% con Sharpe 0,74-0,79 e DD -15/-17% nel 2017-2025 [C14].
- Gran parte del beneficio viene dallo scaling sulla volatilità [C14], che è una regola semplice e poco adattata ai dati.
- Aggiunge un rendimento poco correlato ai premi azionari.

**Perché solo come componente satellite:**
- Un solo backtest su un campione corto.
- Tasse al 33% sullo spot [T2].
- Rischio exchange (Binance fuori dall'UE dal 1/7/2026 [T26]).
- I gap di prezzo del fine settimana non sono catturati bene dal backtest.
- Il DD si misura sul portafoglio: il 10% del capitale in BTC che perde il 17% costa -1,7% al totale.

**Esclusi dalla classifica anche se "sembrano" ideali:**
- **Funding/basis trade:** oggi rende circa quanto il monetario, con rischio ADL e controparte in più, tasse al 33% e leva retail UE a 2:1 [C5][C9][T27].
- **Grid bot:** valore atteso zero [C12].

---

## 3. Architettura di massima dei bot

Parti comuni a tutte e tre:
- **Python 3.12** con `pandas` e `numpy`.
- Backtest scritto a mano, oppure `vectorbt`.
- Dati giornalieri di chiusura da `yfinance`, Stooq o Borsa Italiana.
- Scheduler `APScheduler` o `cron` su un VPS.
- Log su **SQLite**, uno per ogni ordine, segnale e errore.
- Notifiche **Telegram** per le anomalie.
- Configurazione in YAML.
- **Paper trading di default**: il passaggio al reale richiede un flag esplicito, più una conferma manuale.
- **Interruttori di sicurezza** (kill switch): perdita massima giornaliera, perdita dal picco e numero di ordini al giorno. Se scattano, fermano il bot e ti avvisano.

### 3.1 Core difensivo su ETF (strategia 1)

- **Mercato:** ETF UCITS quotati su Borsa Italiana o Xetra.
- **Strumenti:**
  - ETF azionario globale (es. SWDA/VWCE);
  - monetario (XEON) o ETF su BTP e titoli di Stato a 1-3 anni;
  - un ETC sull'oro.
  - Fiscalmente l'ETC oro è un reddito diverso, quindi i guadagni sull'oro possono assorbire le minus degli ETF (il contrario non vale). ⚠️ Conferma col commercialista.
- **Broker:**
  - **Directa SIM** (regime amministrato: calcola e paga le tasse lei).
    - Ha una **API reale via socket TCP** della piattaforma Darwin [E38][E39].
    - PAC gratuito, circa 5 € per ordine di ETF [E40].
    - ⚠️ Con 5.000 € circa 10 ordini l'anno costano circa 50 €, cioè l'1% del capitale: bisogna scegliere ETF della lista "commissione zero" [E41] e fare pochi ordini.
    - ⚠️ Verificare anche il canone API.
  - Alternativa: **Interactive Brokers Ireland** con `ib_async`.
    - Commissioni minime 1,25 € [E36].
    - Ma è in regime dichiarativo: quadri RT, RM e RW, IVAFE, e il costo del commercialista pesa troppo su 5.000 € [E37].
- **Regole:**
  - Si decide solo l'ultimo giorno di borsa del mese.
  - Pesi base: 45% monetario/BTP brevi, 40% azionario globale, 15% oro.
  - Per l'azionario e l'oro, se la chiusura mensile è sotto la media mobile a 10 mesi, la quota va nel monetario.
  - Il peso di ogni quota rischiosa è moltiplicato per `min(1, vol_target / vol_realizzata_60gg)`, con volatility target di portafoglio circa 6-8%.
  - Si ribilancia solo se un peso si scosta di più di 5 punti, per ridurre ordini e tasse.
- **Gestione del rischio:**
  - Drawdown del portafoglio oltre il 10%: avviso.
  - Oltre il 13%: tutto in monetario e stop, riattivabile solo a mano.
  - Limite sulla dimensione dei singoli ordini.
  - Controllo che il prezzo non si discosti troppo dal NAV/iNAV.
  - Solo ordini limite.
  - Nessuna leva.

### 3.2 Barbell statico (strategia 2)

- **Mercato e broker:** come la strategia 1, idealmente Directa per il PAC gratuito.
- **Regole:**
  - PAC mensile sull'ETF azionario e liquidità su BTP brevi o monetario.
  - Ogni 12 mesi si riporta l'azionario al 25%. Si ribilancia prima solo se si scosta di più di 7 punti.
- **Gestione del rischio:**
  - Il bot controlla soprattutto che i pesi siano quelli giusti.
  - Stessi kill switch di drawdown.
  - Il codice è di fatto un sottoinsieme della strategia 1: la fase 2 può coprire entrambe con un parametro.

### 3.3 Componente satellite BTC con volatility targeting (strategia 3)

- **Mercato:** BTC/EUR spot.
- **Exchange:** un CASP autorizzato MiCA con API, cioè Kraken (Payward Europe, Irlanda), Coinbase (Lussemburgo) o Bitstamp [C28][T24].
- **Librerie:** `ccxt`.
- **Chiavi API:** solo con permesso di trading, **mai di prelievo**, e con whitelist IP.
- **Regole:**
  - Ogni settimana si calcola la volatilità realizzata a 30 giorni.
  - Esposizione = `min(100%, 10% / vol_annua)` della quota satellite; il resto resta in EUR o in EMT euro.
  - Filtro opzionale: esposizione a zero se il prezzo è sotto la media mobile a 200 giorni [C14][C16].
  - Si ribilancia solo se lo scostamento supera 20 punti relativi, perché ogni vendita in utile è tassata al 33%.
- **Gestione del rischio:**
  - Tetto alla quota BTC sul capitale totale (5-10%).
  - Kill switch se l'exchange non risponde o se il prezzo si scosta più del 2% da una fonte di riferimento.
  - Mai leva, mai perpetual.
  - Registro completo delle operazioni (costo LIFO) per il quadro RT e il quadro RW/IC.

---

## 4. Tasse e regole (sintesi)

- **Crypto** [T2][T3][T5]:
  - Plusvalenze al **33% dal 2026**. Restano al 26% gli EMT in euro, cioè le stablecoin in euro autorizzate.
  - Nessuna franchigia dal 2025.
  - Staking tassato al ricevimento.
  - Minus compensabili solo tra crypto.
  - Quadro RW più IC al 2‰ se le crypto sono su un exchange estero.
  - Con **DAC8** gli exchange segnalano all'Agenzia delle Entrate le tue operazioni dal 2026 [T14][T15].
- **ETF UCITS** [T7][T16][T18]:
  - Plusvalenze al 26% come redditi di capitale; minus come redditi diversi, quindi **non compensabili con plus ETF**.
  - Il nuovo TUIR (D.Lgs. 117/2026) non elimina questa asimmetria.
  - Titoli di Stato al 12,5%.
- **Perpetual su crypto:** ⚠️ aliquota incerta, 26% o 33% [T9][T11].
- **Forex/CFD:** 26%.
- **Attività d'impresa:**
  - Un bot che investe i tuoi soldi **non richiede autorizzazioni**: è negoziazione per conto proprio [T27].
  - Un rischio basso ma non nullo di riqualificazione come reddito d'impresa esiste se l'attività è molto frequente [T20][T21].
  - Tieni il conto separato dalla partita IVA.
- **MiCA:**
  - Il periodo transitorio in Italia è finito il 30/6/2026 [T1].
  - Usa solo CASP presenti nel registro ESMA.
  - **Binance non è autorizzata** e ha sospeso i servizi in UE [T26].
- **Venditori di bot e segnali:** CONSOB ha oscurato 1.829 siti abusivi dal 2019 [F35]. Diffida da chi promette rendimenti.

---

## 5. Cosa ti chiedo di scegliere

Per la fase 2 ti propongo la **strategia 1**. Il bot avrà la strategia 2 come modalità alternativa tramite parametro e come benchmark nel backtest, con la 3 come modulo opzionale spento di default.

Rispondi con **1**, **2**, **3**, oppure **"1 con 3"**. Dimmi anche il broker: consiglio **Directa** per non dover fare la dichiarazione dei redditi a mano. Oppure IBKR.

⚠️ Da confermare col commercialista:
- aliquota sui perpetual;
- trattamento fiscale degli scambi crypto→USDT;
- compensazione delle minus ETF con le plus su ETC;
- nessun rischio di riqualificazione come reddito d'impresa.

---

## Fonti

Letture complete o estratti verificati dalle ricerche del 28/09/2026. Alcune pagine (siti di ESMA, BCE, SSRN, AQR, Vanguard) erano bloccate dal proxy e sono state lette tramite estratti di ricerca.

### Crypto [C]
1. BIS WP 1087, Schmeling-Schrimpf-Todorov, *Crypto Carry* — https://www.bis.org/publ/work1087.pdf
2. He et al., arbitraggio sui perpetual — https://arxiv.org/html/2212.06888v6
3. BitMEX, 2025 Q2 Derivatives Report — https://www.bitmex.com/blog/2025q2-derivatives-report
4. Presto Labs, funding fee arbitrage — https://www.prestolabs.io/research/optimizing-funding-fee-arbitrage
5. Coin Metrics, State of the Network #335 — https://coinmetrics.substack.com/p/state-of-the-network-issue-335
6. Aavescan, rendimenti sUSDe — https://aavescan.com/rates/ethena-susde
7. CoinDesk, depeg USDe 11/10/2025 — https://www.coindesk.com/markets/2025/10/11/ethena-s-usde-briefly-loses-peg-during-usd19b-crypto-liquidation-cascade
8. Analisi Ethena — https://tokenintel.org/research/ethena.html
9. ADL del 10/10/2025 — https://arxiv.org/html/2512.01112v2
10. Dati ADL Hyperliquid — https://github.com/ConejoCapital/HyperMultiAssetedADL
11. Odaily/Kaiko, liquidità 10/10/2025 — https://www.odaily.news/en/post/5206861
12. Chen-Chen-Jang, grid trading — https://arxiv.org/pdf/2506.11921
13. Backtest del dynamic grid — https://github.com/kpaulsen97/dynamic-grid-trading
14. Summitward, crypto trend following e vol targeting — https://summitward.com/learn/crypto-trend-following
15. Backtest momentum crypto — https://github.com/IsaacDodds/crypto-momentum-backtest
16. CoinGecko, bear market di BTC — https://www.coingecko.com/research/publications/how-long-do-bitcoin-bear-markets-last
17. Massimo storico di BTC — https://becoin.net/bitcoin-all-time-high
18. Vanguard, cost averaging — https://corporate.vanguard.com/content/dam/corp/research/pdf/cost_averaging_invest_now_or_temporarily_hold_your_cash.pdf
19. Nakamoto Portfolio, DCA contro lump sum su BTC — https://nakamotoportfolio.com/static/docs/DCA_Lumpsum.pdf
20. Rendimento reale dei validatori 2026 — https://hoge.gg/validator-economics-2026-real-yield-across-chains/
21. Staking SOL contro ETH — https://openchainbench.com/answers/is-solana-staking-better-than-ethereum
22. Staking report 2026 — https://streamflow.finance/blog/token-staking-report-2026
23. Makarov-Schoar, *Trading and arbitrage in cryptocurrency markets* (JFE 2020) — http://personal.lse.ac.uk/makarov1/index_files/CryptocurrencyMarkets.pdf
24. Chicago Fed Letter 479 (crisi di Celsius, BlockFi, Genesis) — https://www.chicagofed.org/publications/chicago-fed-letter/2023/479
25. Reuters, rimborsi Gemini Earn — https://www.reuters.com/technology/gemini-customers-get-back-over-2-billion-crypto-genesis-bankruptcy-2024-05-29/
26. Rapporto del perito su Celsius (doc. 1956)
27. CONSOB, fine del periodo transitorio MiCA — https://www.consob.it/web/consob/w/termina-il-periodo-transitorio-del-regolamento-mica-sulle-cripto-attivit%C3%A0-in-italia-9-soggetti-abilitati
28. Exchange con licenza MiCA — https://brokerewards.com/news/2026/07/14/mica-licensed-crypto-exchanges-after-binance-eu-exit/
29. ESMA, statement sui perpetual e le misure CFD — https://www.esma.europa.eu/sites/default/files/2026-02/ESMA35-243228190-8024_-_Public_statement_on_derivatives_in_scope_of_the_CFD_product_intervention_measures.pdf
30. Finance Magnates, perpetual UE da 10x a 2x — https://www.financemagnates.com/forex/10x-down-to-2x-has-europe-killed-crypto-perps-even-before-it-started/
31. Kraken, perpetual UE — https://www.kraken.com/it/pro/perps/crypto-perpetuals

### ETF, azioni, obbligazioni [E]
1. IPSOA, BCE 16/09/2026 — https://www.ipsoa.it/documents/quotidiano/2026/09/12/banca-centrale-europea-16-settembre-2026-innalzamento-tassi-interesse-riferimento
2. Il Giornale d'Italia, rialzo BCE — https://www.ilgiornaleditalia.it/news/economia/820077/bce-tassi-su-di-25-punti-base-depositi-al-2-5-secondo-rialzo-del-2026-inflazione-al-3-2-sopra-il-target-del-2-8.html
3. SoldiOnline, spread BTP-Bund — https://www.soldionline.it/notizie/obbligazioni-italia/spread-btp-bund-risale-a-94-punti-cosa-ce-dietro-il-balzo-dei-rendimenti
4. QuiFinanza, aste BTP — https://quifinanza.it/economia/finanza/spread-btp-bund-25-settembre-2026/1016856/
5. Vanguard, cost averaging — https://corporate.vanguard.com/content/dam/corp/research/pdf/cost_averaging_invest_now_or_temporarily_hold_your_cash.pdf
6. Vanguard UK, cost averaging — https://www.vanguard.co.uk/professional/vanguard-365/financial-planning/financial-well-being/cost-averaging
7. Dati storici MSCI World — https://investingintheweb.com/blog/msci-world-index-historical-data/
8. MSCI, factsheet World EUR (prezzo) — https://www.msci.com/documents/10199/255599/msci-world-index-eur-price.pdf
9. Confronto S&P 500, MSCI World, FTSE All-World — https://quantroutine.com/studies/sp500-vs-msci-world-vs-ftse-all-world/
10. Rolling returns iShares MSCI World EUR — http://www.lazyportfolioetf.com/etf/ishares-core-msci-world-eur-currency-rolling-returns/
11. Lazy Portfolio ETF: 60/40, 40/60, Permanent, All Weather — https://www.lazyportfolioetf.com/allocation/stocks-bonds-60-40/
12. PortfolioLab — https://www.portfoliolab.app/portfolios
13. Moskowitz-Ooi-Pedersen, *Time Series Momentum* (2012) — https://w4.stern.nyu.edu/facdir/lpederse/papers/TimeSeriesMomentum.pdf
14. Hurst-Ooi-Pedersen, *A Century of Evidence on Trend-Following* — https://images.aqr.com/-/media/AQR/Documents/Insights/Journal-Article/AQR-JPM-Fall-2017.pdf ; sintesi Swedroe: https://www.etf.com/sections/index-investor-corner/swedroe-why-trend-following-works
15. Hedgeweek, CTA nel 2022 — https://www.hedgeweek.com/trend-followers-turn-leaders-ctas-deliver-record-returns-2022/
16. Top Traders Unplugged, trend following 2024 — https://www.toptradersunplugged.com/trend-following-performance-report-december-2024/
17. Top Traders Unplugged, trend following 2025 — https://www.toptradersunplugged.com/trend-following-performance-report-december-2025/
18. Bentley Reid, Trend Theme Q4 2025 — https://www.bentleyreid.com/wp-content/uploads/2026/01/Trend-Theme-Update-2025-Q4.pdf
19. Invesco, *Navigating Momentum* — https://www.invesco.com/content/dam/invesco/emea/en/pdf/RRE_2024_Q2_NavigatingMomentum.pdf
20. Aussie Turtles, confronto indici trend — https://www.aussieturtles.com/battle-of-the-trend-following-indexes-december-2025/
21. Man Group, *Honey I shrunk the trend following* — https://www.man.com/insights/honey-i-shrunk-the-trend-following
22. Faber, *A Quantitative Approach to Tactical Asset Allocation* — https://www.cambriainvestments.com/wp-content/uploads/2018/01/A-Quantitative-Approach-to-Tactical-Asset-Allocation.pdf
23. Faber, stesso paper (copia) — https://allocatortraining.com/wp-content/uploads/2023/06/A-Quantitative-Approach-to-Tactical-Asset-Allocation.pdf
24. Antonacci, fragilità del GEM — https://www.optimalmomentum.com/whither-fragility-dual-momentum-gem/
25. Quant4free, dual momentum fuori campione — https://quant4free.com/analysis/dual-momentum/
26. Newfound, *Fragility case study: GEM* — https://blog.thinknewfound.com/2019/01/fragility-case-study-dual-momentum-gem/
27. McLean-Pontiff (2016) — https://gwern.net/doc/economics/2016-mclean.pdf
28. Hartzmark-Solomon, *free dividends fallacy* — https://www.ivey.uwo.ca/media/3778037/hartzmark_2017.pdf
29. Moreira-Muir, *Volatility-Managed Portfolios* — https://www.stern.nyu.edu/sites/default/files/assets/documents/Volatility%20Managed%20Portfolios.pdf
30. Cederburg-O'Doherty-Wang-Yan (JFE 2020) — https://www.lehigh.edu/~xuy219/research/COWY.pdf
31. Occhio al conto, ETF XEON — https://occhioalconto.it/investire/xeon-etf/
32. extraETF, XEON — https://extraetf.com/it/etf-profile/LU0290358497
33. MEF, BTP Valore — https://www.dt.mef.gov.it/it/tema_del_mese/tema_mese0044.html
34. SF Advisor, osservatorio conti deposito — https://www.sfadvisor.it/osservatorio-conti-deposito/
35. Catalyst, *Adding alternatives* (fonte promozionale) — http://catalystmf.com/docs/research/ADDING%20ALTERNATIVES%20-%20Allocating%20to%20Managed%20Futures%20RETAIL.pdf
36. Interactive Brokers Ireland, commissioni — https://www.interactivebrokers.ie/it/pricing/commissions-stocks.php
37. Vivi di rendita, IBKR e fiscalità — https://www.vividirendita.it/risorse/interactive-brokers-italia-fire-fiscalita
38. Directa, API wiki — https://app1.directatrading.com/apiwiki/index.html
39. Directa, pagina API — https://www.directa.it/help-supporto/piattaforme/api
40. Finanzapp, PAC Directa — https://www.finanzapp.io/blog-ita/pac-directa-sim-conviene-analisi
41. Directa, strumenti a commissione zero — https://www.directa.it/prodotti-strumenti-finanziari/strumenti-commissione-zero

### Forex e alternative [F]
1. ESMA, misure di intervento sui CFD — https://www.esma.europa.eu/sites/default/files/library/esma71-98-128_press_release_product_intervention.pdf
2. CNMV, misure ESMA — https://boletininternacionalcnmv.es/en/esma-en/investor-protection-en/esma-agrees-on-product-intervention-measures-in-relation-to-cfds-and-binary-options-offered-to-retail-investors/
3. Chague et al., day trader in Brasile — https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3423101
4. Barber et al., *The Cross-Section of Speculator Skill* — https://faculty.haas.berkeley.edu/odean/papers/day%20traders/The%20Cross-Section%20of%20Speculator%20Skill.pdf
5. Heimer-Simon, Cleveland Fed WP 15-22 — https://www.clevelandfed.org/-/media/project/clevelandfedtenant/clevelandfedsite/publications/working-papers/2015/wp1522.pdf
6. Pan et al., eToro — https://alumni.media.mit.edu/~panwei/pub/socialcom12.pdf
7. Jurek, carry trade e rischio di crollo — https://exa.ai/library/publication/m4sy05j2jqt
8. Brunnermeier-Nagel-Pedersen, *Carry Trades and Currency Crashes* — https://www.nber.org/papers/w14473
9. SEC, liquidazione DBV — https://www.sec.gov/Archives/edgar/data/1354730/000119312523077468/d477628dposam.htm
10. CXO Advisory, ETF sul carry trade — https://www.cxoadvisory.com/equity-premium/are-currency-carry-trade-etfs-working/
11. Declino del carry dopo il 2008 — https://ideas.repec.org/a/eee/intfin/v76y2022ics1042443121001670.html
12. BIS Bulletin 90, agosto 2024 — https://www.bis.org/publ/bisbull90.pdf
13. IG Ireland, costi e oneri — https://a.c-dn.net/c/content/dam/publicsites/1760516551168/igcom/Ireland/2025-09-Cost-and-Charges-IRE.pdf
15. Menkhoff et al., FX momentum — https://www.bayes.citystgeorges.ac.uk/__data/assets/pdf_file/0006/111120/fxmom_final_cepr.pdf
16. Virtus, *The Patience Premium* — https://www.virtus.com/assets/files/95f/the_patience_premium_5028.pdf
18. Neuberger Berman, *Simply Put-Writing* — https://cdn.cboe.com/resources/indices/whitepapers/Neuberger_Berman_Simply_PutWriting.pdf
21. Cboe, factsheet indice BXM — https://prefblog.com/wp-content/uploads/2026/02/CboeGlobalIndices_BXM-Index_Factsheet_251231.pdf
22. ETF.com, chiusura di XIV — https://www.etf.com/sections/news/inverse-vix-etn-shuts-down
23. Alternative Credit Investor, fallimento Envestio e Kuetzal — https://alternativecreditinvestor.com/2020/06/10/envestio-and-kuetzal-declared-bankrupt/
24. Polizia estone, Envestio e Kuetzal — https://www.politsei.ee/en/news/were-envestio-and-kuetzal-a-fraud-1151
26. Mintos, recuperi dalla Russia — https://alternativecreditinvestor.com/2023/03/06/mintos-recovers-e10m-from-russian-lenders/
28. Bondora Go & Grow — https://goandgrow.eu/en/blog/go-grow-just-got-even-simpler/
32. ESMA, avvertenza sull'uso dell'AI — https://www.esma.europa.eu/sites/default/files/2025-03/ESMA_Warning_on_the_use_of_AI_-_EN.pdf
34. CFTC, Mirror Trading International — https://www.cftc.gov/PressRoom/PressReleases/8772-23
35. CONSOB, oscuramento siti abusivi — https://www.consob.it/web/consob/w/occhio-alle-truffe-abusivismo-finanziario-consob-oscura-7-siti-internet-1
37. 3Commas, incidente sulle API — https://3commas.io/blog/api-security-incident-faq

### Fisco e regole [T]
1. CONSOB, fine del periodo transitorio MiCA (30/6/2026) — https://www.consob.it/web/consob/w/termina-il-periodo-transitorio-del-regolamento-mica-sulle-cripto-attivit%C3%A0-in-italia-9-soggetti-abilitati
2. FiscoOggi, Bilancio 2026 e cripto-attività in euro — https://www.fiscooggi.it/portale/-/bilancio-2026-aliquota-pi%C3%B9-leggera-per-le-criptoattivit%C3%A0-in-euro
3. FiscoOggi, Legge di bilancio 2025 e cripto-attività — https://www.fiscooggi.it/portale/-/legge-di-bilancio-2025-3-gli-interventi-sulle-cripto-attivit%C3%A0
4. Agenzia delle Entrate, Circ. 30/E/2023 — https://www.agenziaentrate.gov.it/portale/documents/20143/5589638/Circolare+criptoattivita+del+27+ottobre+2023.pdf/1154a95a-80ea-a6ec-bcc0-731b844db9e6
5. Andersen, commento alla Circ. 30/E — https://it.andersen.com/wp-content/uploads/2023/11/circolare_criptoattivita.pdf
7. Borsa Magazine, compensazione delle minusvalenze — https://www.borsamagazine.it/azioni/compensazione-minusvalenze-strumenti-ammessi/
9. Galaw, derivati su crypto — https://www.galaw.it/wp-content/uploads/2023/02/Boll_Trib_2-2023.pdf
11. MoneyViz, tassazione Phemex — https://www.moneyviz.it/it/phemex-tasse
14. Studio Cerbone, Provv. AdE su DAC8 — https://www.studiocerbone.com/disposizioni-attuative-del-decreto-legislativo-10-dicembre-2025-n-194-modalita-e-termini-di-comunicazione-delle-informazioni-registrazione-dei-soggetti-tenuti-notifica-da-parte-dei-prestatori-di/
15. Edotto, DAC8 — https://www.edotto.com/articolo/cripto-attivita-e-dac-8-nuove-regole-sullo-scambio-automatico-fiscale
16. MoneyViz, tassazione ETF 2026 — https://blog.moneyviz.it/tassazione-etf-2026-plusvalenze-minusvalenze-730-modello-redditi/
18. Testo del D.Lgs. 117/2026 (nuovo TUIR) — https://miolegale.it/norme/tuir-dlgs-117-2026/
20. Cass. 7552/2025 — https://www.doctrine.it/decisions/itcass4caxrolx56khx6
21. Cass. 20065/2022 — https://www.iltributo.it/esercizio-di-attivita-di-impresa-per-le-persone-fisiche-e-necessario-accertare-professionalita-ed-abitualita/
24. Exchange con licenza MiCA dopo l'uscita di Binance — https://brokerewards.com/news/2026/07/14/mica-licensed-crypto-exchanges-after-binance-eu-exit/
26. CASP Tracker, Binance — https://casptracker.eu/it/exchange/binance/
27. ESMA, statement del 24/2/2026 sui perpetual — https://www.esma.europa.eu/sites/default/files/2026-02/ESMA35-243228190-8024_-_Public_statement_on_derivatives_in_scope_of_the_CFD_product_intervention_measures.pdf
