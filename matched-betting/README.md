# Matched Betting

Web app personale per il matched betting sui bookmaker italiani con licenza ADM. È statica e non ha server: i dati restano nel browser.

## Funzioni

| Scheda | Cosa fa |
|---|---|
| **Singola** | Calcola quanto bancare sull'exchange per una scommessa qualificante, una free bet SNR o una free bet SR. Mostra la responsabilità e il profitto in ogni esito, e salva l'operazione nel registro. |
| **Multipla** | Copre una multipla bancando una gamba alla volta, che è il caso tipico dei bonus italiani. Per ogni gamba indica quanto bancare e la responsabilità. |
| **Quote** | Carica da [odds-api.io](https://odds-api.io) le quote 1X2 dei bookmaker italiani. Tu inserisci la quota lay che vedi su Betfair.it o Betflag e la tabella ordina le coperture dalla più conveniente. |
| **Bonus** | Tiene traccia dei bonus per bookmaker (condizioni, rollover, scadenza, stato). Include un elenco iniziale 2026 da verificare. |
| **Registro** | Raccoglie le operazioni, il profitto atteso e quello realizzato, con esportazione CSV per Excel. |
| **Impostazioni** | Commissione di default (Betfair.it 4,5%, Betflag 5%), chiave odds-api.io, backup e ripristino JSON. |

## Avvio

```bash
cd matched-betting
npm install
npm run dev      # sviluppo, http://localhost:5173
npm test         # test dei calcoli
npm run build    # versione statica in dist/, pubblicabile su Netlify/Vercel/GitHub Pages
```

## Perché la quota lay si inserisce a mano

- **Liquidità separata:** l'exchange italiano (Betfair.it, Betflag) ha un mercato diverso da quello internazionale. Le quote lay delle API internazionali non sono quelle su cui puoi davvero bancare.
- **Niente chiamate dal browser:** l'API Betfair non accetta chiamate dal browser (niente CORS).
- **Software di terzi bloccati:** dal 12/11/2025 Betfair ha disattivato in Italia le chiavi dei software di terze parti.
- **Come si potrebbe automatizzare:** con un piccolo server personale che usi la tua chiave API Betfair.it in sola lettura. Va verificato che sia ancora consentito.

## Regole e rischi

- Un solo conto per bookmaker. Niente conti di altri, VPN o account multipli.
- Il bonus massimo per singola giocata è 100€ (determinazione ADM 2024).
- I bookmaker possono limitare i conti di chi fa matched betting. Il saldo resta prelevabile.
- Controlla sempre la liquidità sull'exchange prima di puntare sul bookmaker: una bancata parziale lascia la puntata scoperta.
- Vincite su concessionari ADM: di norma nessuna dichiarazione per il giocatore. Chiedi conferma al commercialista per l'exchange.
- Se ti trovi a scommettere senza copertura, fermati. Telefono Verde gioco d'azzardo (ISS): 800 558 822.
