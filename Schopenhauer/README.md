# Schopenhauer — Filosofia e letteratura

Ambiente statico in italiano, senza dipendenze di rete necessarie alla lettura. Due percorsi: 11 lezioni filosofiche, 4 confronti per problemi e una conclusione comparativa. 16 mappe SVG con alternative testuali, diagrammi simbolici, 24 quesiti con correzione e recupero.

- Entrata: `index.html`.
- Indici: `comprendere.html`, `letteratura.html`.
- Verifica: `verifica.html` (17 quesiti filosofici, 7 comparativi; ordine delle domande e delle opzioni rimescolato a ogni caricamento/generazione).
- Riferimenti: `fonti.html`; riferimenti puntuali in ogni lezione.
- PWA: `manifest.webmanifest`, `sw.js`, icone PNG standard e maskable.
- Risorse comuni: `../pwa-common/gbprof-accessibility.*`, Privacy e Accessibilità del repository.

## Manutenzione

I testi sorgente sono `tools/filosofia.txt` e `tools/letteratura.txt`; le mappe sono definite in `tools/maps.py`, i quesiti in `tools/quiz.py`. Eseguire `python3 tools/build.py` da questa cartella per rigenerare HTML, mappe e service worker. Conservare le icone PNG già presenti. Dopo una modifica aumentare la versione della cache nel modello di `tools/build.py` e rigenerare. Non serve alcun processo di build sul server.

Il service worker conserva soltanto la cache con prefisso `gbprof-schopenhauer-` e precarica le risorse del percorso. Non cancella cache di altre PWA; non sostituisce le pagine esterne mancanti con la home di Schopenhauer. Gli altri percorsi e le fonti online non sono garantiti offline.

## Collegamenti letterari

Le nuove sezioni sono aggiunte alla fine degli articoli esistenti, senza riscriverne il testo: Foscolo/lezioni/immagine-del-mondo.html e alla-sera.html; Leopardi/pagine/natura-islandese.html e ginestra.html. Nei due service worker letterari viene incrementata solo la versione per aggiornare la copia offline.

Verga rimane un nodo futuro esplicitamente indicato: nessuna PWA dedicata o URL di autore inventato. Le relazioni fra gli autori sono interpretative e non affermazioni di influenza documentata.
