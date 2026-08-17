# Cartesio — Il punto fermo nel dubbio

PWA didattica su René Descartes, progettata per la scuola secondaria superiore a partire dalla lezione **“Cartesio: Filosofia e Metodo”**.

## Percorso

- copertina interattiva con tre punti di accesso: dubbio, cogito e metodo;
- scoperta guidata in sei passaggi;
- dodici moduli di studio in due livelli di lettura;
- laboratori sul dubbio metodico e sulle quattro regole del metodo;
- fonti filosofiche, fumetti, mappe concettuali e strumenti di ripasso;
- glossario, cronologia, opere, confronti, appunti ed esportazione;
- verifica finale di dodici domande con spiegazioni, recupero mirato e salvataggio locale dei progressi.

## Fonti

La ricostruzione è stata verificata esclusivamente attraverso fonti universitarie: Stanford Encyclopedia of Philosophy, Internet Encyclopedia of Philosophy dell’University of Tennessee at Martin, Wright State University, Boston University e Università Bocconi. I collegamenti completi sono disponibili nella sezione **Fonti universitarie** della PWA.

## Avvio locale

Da una cartella che contiene il repository:

```bash
python3 -m http.server 8000 --directory Filosofia
```

Aprire quindi `http://localhost:8000/Cartesio/`. L’uso tramite server locale è necessario per provare service worker e installazione PWA.

## File principali

- `index.html`: struttura semantica e sezioni;
- `styles.css`: design responsive e accessibile;
- `data.js`: contenuti didattici e apparati;
- `app.js`: navigazione, laboratori, quiz e persistenza;
- `manifest.webmanifest` e `sw.js`: installazione e funzionamento offline;
- `assets/cover-cartesio.webp`: copertina originale;
- `assets/icon.svg`: icona dell’app.

## Crediti

Materiali realizzati da gbprof e Libera (ChatGPT) tramite dialogo costante e progettazione comune, sotto la direzione di gbprof.
