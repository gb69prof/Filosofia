# Checklist PWA didattiche gbprof

Questa checklist vale per materiali didattici pubblici su gbprof.it, senza account studenti, profilazione o raccolta volontaria di dati personali.

## Accessibilità
- [ ] `lang="it"`, titolo significativo e struttura semantica coerente.
- [ ] Navigazione completa da tastiera e focus sempre visibile.
- [ ] Nessun blocco allo zoom; reflow e uso su smartphone, tablet e desktop.
- [ ] Immagini informative con testo alternativo; decorative escluse dalla lettura assistiva.
- [ ] Iframe con `title`; mappe e contenuti complessi con alternativa testuale quando essenziali.
- [ ] Contrasto, dimensioni touch e riduzione dei movimenti verificati.
- [ ] Quiz, modali e messaggi dinamici utilizzabili con tecnologie assistive.

## Privacy
- [ ] Nessun account o dato personale richiesto agli studenti.
- [ ] Nessun analytics, advertising, fingerprinting o profilazione.
- [ ] Appunti, progressi e preferenze restano locali sul dispositivo.
- [ ] Servizi esterni caricati soltanto quando necessari e, per i video incorporati, preferibilmente dopo scelta dell’utente.
- [ ] Privacy e Accessibilità facilmente raggiungibili.

## PWA e sicurezza
- [ ] Manifest valido e icone presenti.
- [ ] Service worker limitato alle proprie cache: non deve cancellare cache di altre PWA del dominio.
- [ ] HTTPS, nessun mixed content.
- [ ] Link `_blank` protetti con `noopener noreferrer`.
- [ ] Input utente non inserito in HTML senza escaping/sanitizzazione.
- [ ] Funzionamento offline e aggiornamento cache verificati.

## Verifica finale
- [ ] Test manuale tastiera.
- [ ] Test zoom almeno 200%.
- [ ] Test iPad/smartphone/desktop.
- [ ] Controllo con screen reader su pagine e funzioni principali.
- [ ] Controllo console e rete per tracker o richieste esterne inattese.
