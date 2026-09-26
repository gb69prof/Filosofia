# Verifica del 26 settembre 2026

Pubblicato su https://gbprof.it/Filosofia/Schopenhauer/ e collegato dall’indice generale.

## Contenuti e integrazione

- 21 pagine di studio e servizio: ingresso, due indici, 11 lezioni filosofiche, quattro problemi comparativi, conclusione comparativa, verifica e fonti.
- 16 mappe concettuali SVG con relazioni nominate e versione testuale; immagini simboliche vettoriali originali.
- 24 quesiti: 17 filosofici e 7 comparativi, con correzione, spiegazione e recupero.
- Collegamenti bidirezionali nelle lezioni Foscolo/immagine-del-mondo e alla-sera, Leopardi/natura-islandese e ginestra. Nei due articoli leopardiani i rimandi precedono gli apparati che il sito estrae e nasconde automaticamente.
- Verga è predisposto come confronto futuro: nessuna PWA dedicata o destinazione inesistente.

## Prove eseguite

- Controllo statico di 794 riferimenti locali nelle 21 pagine: nessun file o frammento mancante; XML dei 26 SVG valido.
- Controllo sintattico JavaScript e audit PWA del repository: zero errori e zero avvisi.
- Browser Chrome sul sito pubblicato: apertura dall’indice generale, entrambi gli ingressi, navigazione fra lezioni, menu, ingrandimento del testo, immagini e mappe.
- Test: caso misto con risposte corrette, errate e omesse; prova comparativa 7/7; nuova generazione con ordine delle domande e delle opzioni cambiato. Feedback e rimandi di recupero presenti.
- Reflow reale in iframe a 390, 768 e 1366 pixel: nessun debordamento della pagina nei campioni controllati (ingresso, lezione, verifica). Le mappe ampie scorrono nel proprio contenitore. Superficie ripetibile: `tools/preview.html`.
- Collegamenti dal vivo verso Foscolo e Leopardi e ritorno al confronto; rimandi di Leopardi visibili dopo la correzione del loro posizionamento. Il collegamento profondo ai Sepolcri apre il lettore sui vv. 1–50.
- Manifest, icone, ambito e registrazione del service worker controllati. Il browser segnala la disponibilità offline.
- Simulazione del service worker con rete interrotta: 58 risorse precache, documenti e immagini restituiti dalla cache; cache di altre PWA preservate; navigazione esterna non intercettata; pagina assente offline restituita con stato 503. Script: `node Schopenhauer/tools/test-sw.cjs` dalla radice di Filosofia.
- Nessun errore applicativo rilevato nelle sessioni controllate; i log del browser contengono errori dell’estensione di automazione estranei al sito.

## Limiti del collaudo

Non è stata eseguita una prova su hardware iPad/Safari, né l’installazione dalla schermata Home di un dispositivo fisico. La prova offline automatizzata simula la rete interrotta; non equivale a un collaudo completo in modalità aereo sul dispositivo. I percorsi letterari esterni e le fonti online richiedono la rete se non sono già disponibili nelle rispettive cache.
