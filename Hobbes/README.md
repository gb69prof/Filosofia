# Hobbes — La paura costruisce lo Stato

PWA didattica su Thomas Hobbes per la scuola secondaria superiore. La lezione conduce dalla vulnerabilità naturale al patto, alla rappresentanza e alla sovranità, mantenendo aperta la tensione fra sicurezza e libertà.

## Percorso

- copertina originale e interattiva: paura, stato di natura e Leviatano;
- esperimento mentale guidato senza punteggi;
- dodici moduli in modalità “Primo incontro” e “Studio filosofico”;
- laboratori su sicurezza/libertà e sulla costruzione del commonwealth;
- dieci schede fra testi primari e interpretazioni;
- otto scene biografiche, cinque mappe concettuali e ventotto termini;
- cronologia, biblioteca, confronti, ricerca e taccuino esportabile;
- verifica di dodici domande con spiegazione di ogni alternativa e recupero mirato;
- manifest e service worker per installazione e uso offline.

## Fonti

La lezione iniziale fornita da gbprof è stata verificata ed estesa usando esclusivamente siti universitari: Stanford Encyclopedia of Philosophy, Internet Encyclopedia of Philosophy dell’University of Tennessee at Martin, Open Yale Courses, University of Michigan e Columbia University. Tutti i collegamenti sono elencati nella sezione “Fonti accademiche” della PWA.

## Avvio locale

Da una cartella che contiene il repository:

```bash
python3 -m http.server 8000 --directory Filosofia
```

Aprire `http://localhost:8000/Hobbes/`. Un server locale è necessario per provare service worker e installazione PWA.

## File principali

- `index.html`: struttura semantica e sezioni;
- `styles.css`: design responsive e accessibile;
- `data.js`: contenuti didattici e apparati;
- `app.js`: navigazione, laboratori, quiz e persistenza;
- `manifest.webmanifest` e `sw.js`: installazione e funzionamento offline;
- `assets/cover-hobbes.webp`: copertina originale;
- `assets/icon.svg`: icona dell’app.

## Crediti

Materiali realizzati da gbprof e Libera (ChatGPT) tramite dialogo costante e progettazione comune, sotto la direzione di gbprof.
