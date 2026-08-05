# Rapporto di test

Data: 6 agosto 2026.

## Test eseguiti

| Controllo | Esito |
|---|---|
| Sintassi `js/app.js` e `data/content.js` | superato |
| Presenza dei file essenziali | superato |
| Manifest con `start_url` e `scope` relativi | superato |
| Cinque affermazioni e undici episodi | superato |
| Inventario fonti primarie e secondarie | superato |
| Normalizzazione query nel service worker | superato |
| Fallback offline alla shell | superato |
| Rendering DOM: home e rotte principali | superato |
| Rotta dizionario con query | superato |
| Interazione Scopro | superato |
| Feedback quiz | superato |
| Hotspot della visita | superato |
| `prefers-reduced-motion` e stampa | verificati nel CSS |
| Test Playwright con Chromium reale | non eseguito: browser non presente e download runtime restituito come archivio vuoto |

Comandi:

```bash
node --check js/app.js
node --check data/content.js
npm test
npm run test:dom
```

## Verifiche sui percorsi

Le rotte `scopro`, `studio`, `studio/cinque-vie`, `approfondisco`, `fumetti`, `dizionario`, `atlante`, `confronti`, `laboratorio`, `timeline`, `biblioteca`, `mondo`, `cattedrale` e `fonti` hanno un renderer dedicato. I collegamenti della home corrispondono a rotte implementate.

## PWA e cache

Il service worker usa la cache `san-tommaso-v1.0.0`, elimina cache precedenti all’attivazione e riceve i messaggi `SKIP_WAITING` e `GET_VERSION`. Le navigazioni eliminano query e hash per il lookup offline. La verifica finale su URL GitHub Pages deve essere ripetuta dopo la pubblicazione.

## Limiti rimasti

- audit manuale su iPad portrait/landscape non sostituito da una simulazione;
- vecchi HTML non decodificati a causa della codifica Windows-1252 nel lettore Drive;
- collegamenti esterni richiedono rete e non sono inclusi nella cache, mentre i contenuti essenziali sono locali.
