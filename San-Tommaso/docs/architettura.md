# Architettura

## Decisione

La PWA usa HTML semantico, un foglio CSS, JavaScript modulare e dati locali. Non richiede compilazione, framework o backend. La navigazione interna usa hash route (`#/studio/cinque-vie`): in questo modo un accesso diretto non genera 404 in GitHub Pages e l’intera shell può funzionare offline.

## Moduli

| Modulo | Compito |
|---|---|
| `index.html` | shell accessibile, intestazione, dialoghi, taccuino |
| `css/main.css` | sistema visuale, responsive, temi, stampa, reduced motion |
| `data/content.js` | contenuti didattici e relazioni |
| `js/app.js` | routing, rendering, interazioni e persistenza |
| `sw.js` | precache, runtime cache, fallback offline e versione |
| `data/sources.json` | inventario machine-readable delle fonti |
| `tests/` | controlli strutturali, DOM e browser opzionale |

## Percorsi e stato

Tutti i percorsi sono rotte effettive. Nessun pulsante della home è un segnaposto. `localStorage` conserva soltanto dati sul dispositivo: tema, scala testo, note, evidenziazioni, segnalibri, completamenti e dispute.

## Offline

Il service worker normalizza le richieste di navigazione eliminando query e hash prima del confronto con la cache. Corregge così il difetto osservato nella PWA Platone-Aristotele, dove una rotta come `tappa/?id=p2` poteva non trovare la shell precache. Le risorse statiche seguono cache-first; le navigazioni network-first con fallback alla shell.

## Accessibilità

- lingua e struttura semantica;
- link “salta al contenuto”;
- focus visibile;
- comandi di almeno 44 px;
- dialoghi nativi;
- hotspot con etichette e uso da tastiera;
- nessun contenuto essenziale soltanto in hover;
- supporto `prefers-reduced-motion`;
- testo HTML sovrapposto alle immagini, non incorporato nei bitmap;
- stampa senza elementi di interfaccia.
