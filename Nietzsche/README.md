# Nietzsche — Dopo la morte di Dio

PWA didattica su Friedrich Nietzsche per la scuola secondaria superiore. Il percorso muove dalla crisi dei fondamenti e conduce attraverso genealogia, nichilismo, volontà di potenza, oltreuomo ed eterno ritorno, mantenendo aperta la domanda sulla creazione dei valori.

## Percorso

- copertina originale e interattiva: abisso, ponte e cerchio;
- esperimento iniziale sul crollo di una certezza;
- dodici moduli in modalità “Primo incontro” e “Studio filosofico”;
- officina genealogica e prova dell’eterno ritorno;
- dodici schede fra opere pubblicate, frammenti postumi e interpretazioni;
- otto scene biografiche, cinque mappe concettuali e trenta termini;
- cronologia, biblioteca, confronti, ricerca e taccuino esportabile;
- verifica di dodici domande con spiegazione delle alternative e recupero mirato;
- manifest e service worker per installazione e uso offline.

## Criterio delle fonti

La lezione iniziale fornita da gbprof è stata verificata ed estesa usando esclusivamente siti universitari, enciclopedie gestite da università, repository accademici e university press. Le fonti principali sono la Stanford Encyclopedia of Philosophy, l’Internet Encyclopedia of Philosophy dell’University of Tennessee at Martin, Cambridge University Press, Princeton University Press e il repository della Louisiana State University. Gli URL controllati sono elencati nella PWA.

## Avvio locale

Da una cartella che contiene il repository:

```bash
python3 -m http.server 8000 --directory Filosofia
```

Aprire `http://localhost:8000/Nietzsche/`. Un server locale è necessario per provare service worker e installazione.

## File principali

- `index.html`: struttura semantica;
- `styles.css`: design responsive e accessibile;
- `data.js`: contenuti didattici e apparati;
- `app.js`: navigazione, laboratori, quiz e persistenza;
- `manifest.webmanifest` e `sw.js`: installazione e offline;
- `assets/cover-nietzsche.webp`: copertina originale;
- `assets/icon.svg`: icona dell’app.

## Crediti

Materiali realizzati da gbprof e Libera (ChatGPT) tramite dialogo costante e progettazione comune, sotto la direzione di gbprof.
