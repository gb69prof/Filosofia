# San Tommaso d’Aquino

PWA didattica statica dedicata alla filosofia di Tommaso d’Aquino, rinascita del progetto gbprof del 2007.

## Avvio

Non esiste una fase di build. Dalla cartella `San-Tommaso/`:

```bash
npm run serve
```

Aprire `http://localhost:4173`. In GitHub Pages la PWA è progettata per il sottopercorso `/Filosofia/San-Tommaso/`; tutte le risorse usano URL relativi.

## Contenuto

- quattro percorsi: Scopro, Studio, Approfondisco, A fumetti;
- cinque affermazioni con lezione, schema, fonte, domande e quiz;
- dizionario, atlante, confronti, laboratorio, linea del tempo e biblioteca;
- visita al mondo di Tommaso con hotspot;
- ricerca globale, note, evidenziazioni, segnalibri, esportazione Markdown e progresso;
- tema chiaro/scuro, scala testo, stampa e navigazione da tastiera;
- installazione e funzionamento offline senza backend.

## Dati locali

Note, risposte di laboratorio, segnalibri e avanzamento sono salvati in `localStorage` con la chiave `san-tommaso-pwa-v1`. Nessun dato personale lascia il browser.

## Test

```bash
npm test
npm run test:dom
```

Il primo comando controlla file, manifest, struttura, fonti e strategia offline. Il secondo esegue il rendering delle rotte e prova Scopro, quiz e hotspot in un DOM simulato.

## Metodo editoriale

Le traduzioni italiane brevi sono redazionali e dichiarate. Le fonti sono collegate al Corpus Thomisticum con opera, parte, questione e articolo. La frase «Comprendere per credere, credere per comprendere» è esplicitamente presentata come formula-guida, non come citazione letterale di Tommaso.

La documentazione completa si trova in `docs/`.
