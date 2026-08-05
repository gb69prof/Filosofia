# Inventario del progetto 2007

## Provenienza

Cartella Google Drive: `15SAnF6q5SQQc3A8U5CEHgWKDYSH6XP2F`.

Il deposito conserva un sito Microsoft FrontPage modificato principalmente tra luglio e ottobre 2007. La struttura a frame è riconoscibile da `index.htm`, `frm/su.htm`, `frm/sx.htm`, `frm/sx1.htm` e `frm/centro.htm`. Le cartelle `_vti_*`, `_derived`, `_themes`, `_borders` e `_fpclass` sono infrastruttura editoriale storica, non contenuto didattico.

## Albero concettuale verificato

| Area | Materiali individuati |
|---|---|
| `lezione/` | cinque cartelle `1°_affermazione` … `5°_affermazione` |
| Prima affermazione | `1.htm`, sottocartella `testi/fede_ragione.htm`, immagini e pulsanti |
| Seconda affermazione | `2.htm`; testi `0_esistenza_Dio.htm`, `1_movimento.htm`, `2_causa.htm`, `3_necessario.htm`, `4_perfezione.htm`, `5_fine.htm` |
| Terza affermazione | `3.htm`; testi `essere.htm`, `essenza.htm`, `Dio_essere.htm` |
| Quarta affermazione | `4.htm`, `app_frm_nn_essnz.htm`, testi e numerose immagini/pulsanti |
| Quinta affermazione | `5_1.htm`, immagini e pulsanti |
| `testi/` | nuclei Dio, essenza, essere, fede, forma, materia e sostanza; inoltre anima non materiale, sussistenza, immortalità e intelletto unico |
| `schemi/Dio` | prove, movimento, causa, contingente, perfezione, finalità |
| `schemi/metafisica` | materia, forma, sostanza, essenza, essere |
| `schemi/conoscenza` | intelletto umano/divino, giudizio, verità |
| `schemi/uomo_angelo` | uomo, angelo, immortalità |
| `schemi/morale` | due sequenze grafiche e HTML |
| `indici/generale.htm` | indice generale del sito |
| `images/` | immagini d’apertura, frecce e schemi |
| `video/` | cartella presente nell’archivio |

## Matrice conservata

La nuova PWA conserva:

1. organizzazione per affermazioni e problemi;
2. progressione fede/ragione → Dio → metafisica → uomo/conoscenza → morale;
3. collegamento fra spiegazione, schema e testo;
4. formula didattica «lo constatiamo con i sensi»;
5. immagini come strumenti di orientamento;
6. voce dell’insegnante che interpella lo studente.

## Limite tecnico documentato

I file HTML sono archiviati in una codifica occidentale precedente a UTF‑8. Il contenuto raw viene consegnato da Drive, ma il lettore testuale del connettore genera, per esempio su `lezione/1°_affermazione/1.htm`, `UnicodeDecodeError` sul byte `0xE8` (la “è” in Windows-1252/ISO-8859-1). Sono stati verificati struttura, nomi, date, dimensioni e revisioni; non sono state importate come citazioni righe non decodificate. La roadmap conserva l’attività di conversione filologica quando il download raw sarà materializzabile localmente.

Questa limitazione è deliberatamente dichiarata: il progetto nuovo non spaccia una ricostruzione per trascrizione del 2007.
