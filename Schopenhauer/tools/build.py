from pathlib import Path
from html import escape
import json,re
from maps import MAPS,make_maps,map_text
from quiz import QUESTIONS
ROOT=Path(__file__).resolve().parents[1]
chapters=[]
for group in ['filosofia','letteratura']:
 for block in (ROOT/'tools'/f'{group}.txt').read_text().split('@@@ ')[1:]:
  header,body=block.split('\n',1);slug,title,question,refs=header.split('|')
  chapters.append(dict(slug=slug,title=title,question=question,refs=refs,body=body.strip(),group=group))
by={c['slug']:c for c in chapters}
def inline(s):return re.sub(r'\*([^*]+)\*',r'<em>\1</em>',escape(s))
def slugify(s):return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
def prose(s):
 out=[]
 for line in s.splitlines():
  if not line.strip():continue
  if line.startswith('### '):out.append(f'<h2 id="{slugify(line[4:])}">{inline(line[4:])}</h2>')
  else:out.append('<p>'+inline(line)+'</p>')
 return '\n'.join(out)
def toc(active=''):
 out=['<details class="toc" open><summary>Indice dei percorsi</summary><nav aria-label="Indice delle lezioni">']
 for group,label in [('filosofia','A · Comprendere'),('letteratura','B · Letteratura')]:
  out.append(f'<p class="toc-label">{label}</p><ol>')
  for c in chapters:
   if c['group']==group:out.append(f'<li><a href="{c["slug"]}.html" {"aria-current=\"page\"" if active==c["slug"] else ""}>{escape(c["title"])}</a></li>')
  out.append('</ol>')
 out.append('<a href="verifica.html">Verifica e recupero</a><br><a href="fonti.html">Fonti e metodo</a></nav></details>')
 return ''.join(out)
def page(title,body,active='',wide=False,extra=''):
 content=body if wide else f'<div class="layout">{toc(active)}<main id="main" class="reading" tabindex="-1">{body}</main></div>'
 return f'''<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#264c43"><meta name="description" content="Schopenhauer e la letteratura: un ambiente di lettura, mappe e verifiche per gbprof."><title>{escape(title)} · Schopenhauer · gbprof</title><link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="assets/icon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="assets/icon-192.png"><link rel="stylesheet" href="styles.css{"?v=2" if wide else ""}"><link rel="stylesheet" href="../pwa-common/gbprof-accessibility.css?v=1"><script src="app.js{"?v=2" if wide else ""}" defer></script><script src="../pwa-common/gbprof-accessibility.js?v=1" defer></script>{extra}</head><body><a class="skip" href="#main">Vai al contenuto</a><header class="topbar"><a class="brand" href="index.html">SCHOPENHAUER · gbprof</a><nav aria-label="Navigazione principale"><a href="comprendere.html">Comprendere</a><a href="letteratura.html">Letteratura</a><a href="verifica.html">Verifica</a><a href="../index.html">Filosofia</a></nav></header>{content}<footer>gbprof e Libera · Ambiente di studio · <a href="fonti.html">Fonti e metodo</a><p class="status" data-offline role="status">Preparazione della copia offline…</p></footer></body></html>'''

def symbol(name):
 start=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 330" role="img"><title>{escape(name)}</title><rect width="900" height="330" fill="#e9e9dc"/><g fill="none" stroke="#365a4e" stroke-width="3">'
 if name=='sguardo':
  shapes='<circle cx="195" cy="165" r="85"/><path d="M95 250L190 90L280 250"/><rect x="377" y="45" width="145" height="240" fill="#f8f4e9"/>'+''.join(f'<path d="M{x} 45V285" stroke="#a49064"/>' for x in range(395,520,25))+'<ellipse cx="720" cy="165" rx="102" ry="75"/><path d="M620 240L730 85L805 260"/><path d="M290 165H360M540 165H600"/>'
 elif name=='corpo':
  shapes='<ellipse cx="450" cy="170" rx="95" ry="122"/><path d="M450 48V292" stroke-dasharray="8 8"/><path d="M315 165H130M585 165H770"/><circle cx="195" cy="165" r="45"/><path d="M675 165q25-70 50 0t50 0" stroke="#a17a40" stroke-width="6"/>'
 elif name=='flusso':
  shapes=''.join(f'<path d="M30 {70+j*35} C220 {220+j*5},300 {10+j*30},450 {140+j*20} S700 {320-j*22},870 {70+j*35}" stroke="{["#365a4e","#a17a40"][j%2]}"/>' for j in range(6))+'<circle cx="235" cy="150" r="40"/><path d="M440 230L485 105L535 230M670 120v120m-45-75 45 30 45-30"/>'
 elif name=='ciclo':
  shapes='<path d="M300 165C300 35 600 35 600 165S300 295 300 165" stroke-width="5"/><path d="M420 67l25-10-15 28M490 263l-25 10 15-28" stroke="#a17a40" stroke-width="5"/><circle cx="300" cy="165" r="22" fill="#365a4e"/><circle cx="600" cy="165" r="22" fill="#e9e9dc"/><path d="M115 165H265M635 165H785"/>'
 elif name=='tregua':
  shapes=''.join(f'<path d="M20 {85+i*30}Q200 {220-i*15} 335 {85+i*30} M565 {85+i*30}Q735 {220-i*15} 880 {85+i*30}"/>' for i in range(6))+'<rect x="365" y="45" width="170" height="240" fill="#fffaf0" stroke="#a17a40"/><circle cx="450" cy="165" r="49"/>'
 elif name=='incontro':
  shapes='<circle cx="295" cy="92" r="31"/><circle cx="605" cy="92" r="31"/><path d="M245 260v-72q50-90 100 0v72M555 260v-72q50-90 100 0v72M330 175l120 60 120-60"/><path d="M165 290Q450 240 735 290" stroke="#a17a40" stroke-width="7"/>'
 elif name=='distacco':
  shapes=''.join(f'<circle cx="{180+i*145}" cy="165" r="{75-i*12}" stroke-width="{5-i}" stroke-dasharray="{["none","140 25","65 25","20 30"][i]}"/>' for i in range(4))+'<path d="M740 165H855" stroke="#a17a40"/>'
 else:
  shapes='<path d="M100 270L300 75L490 270M240 270L480 40L715 270"/><path d="M620 270q60-130 90 0m-42-55q-45-25-40-55m54 45q45-35 55-15" stroke="#a17a40"/><circle cx="715" cy="160" r="12" fill="#a17a40"/>'
 return start+shapes+'</g></svg>'
SYMBOL={
'problema':('sguardo','Una stessa figura attraversa una griglia e appare trasformata: il disegno rende visibile la domanda sulle condizioni del conoscere.'),
'rappresentazione':('sguardo','La griglia simboleggia le forme dell’esperienza; non è una barriera materiale nascosta fra noi e le cose.'),
'corpo':('corpo','Un solo corpo, due accessi: forma osservata e tensione vissuta, senza immaginare due sostanze separate.'),
'volonta':('flusso','Linee continue attraversano forme differenti: l’immagine allude a un tendere impersonale, non a un fluido fisico.'),
'individuazione':('flusso','Forme distinte condividono un medesimo intreccio: unità metafisica e pluralità fenomenica non garantiscono armonia.'),
'desiderio':('ciclo','La traiettoria ritorna al punto di partenza: la soddisfazione di un bisogno lascia aperta la possibilità di desiderare.'),
'pessimismo':('ciclo','Il movimento riprende: la sofferenza è interpretata come struttura dell’esistenza, oltre il singolo episodio.'),
'arte':('tregua','Uno spazio quieto dentro il movimento: la contemplazione sospende l’interesse individuale senza fermare il mondo.'),
'compassione':('incontro','Due figure mantengono la propria distinzione e condividono una base: riconoscere l’altro non significa cancellarlo.'),
'ascesi':('distacco','Il cerchio si apre progressivamente: simbolo del distacco dal volere, non della distruzione del corpo.'),
'conclusione':('distacco','La figura invita a distinguere il movimento del volere e la possibilità di un diverso rapporto con esso.'),
'mondo-uomo':('paesaggio','Il fiore davanti alla montagna rappresenta la sproporzione fra vita individuale e potenza della natura.'),
'motore-uomo':('flusso','Un intreccio attraversa figure distinte: la domanda sul desiderio resta comune, le spiegazioni degli autori divergono.'),
'sofferenza':('paesaggio','La fragilità del fiore non è una colpa: il limite naturale precede il giudizio morale.'),
'salvezza':('incontro','Una relazione costruita fra esseri distinti: il significato dell’aiuto cambia secondo la prospettiva filosofica.'),
'confronto-finale':('paesaggio','Abitare un mondo che non offre garanzie: l’immagine lascia aperta la domanda sulle risposte umane.')}
for n in set(x[0] for x in SYMBOL.values()):(ROOT/'assets'/f'simbolo-{n}.svg').write_text(symbol(n))
(ROOT/'assets/icon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#264c43"/><circle cx="256" cy="256" r="158" fill="none" stroke="#d9c59e" stroke-width="8"/><path d="M310 157C170 105 144 240 256 256S352 405 192 355" fill="none" stroke="#fffaf0" stroke-width="32" stroke-linecap="round"/></svg>')
make_maps(ROOT)
L='/IV-anno/Letteratura/'
LINKS={
'problema':[('../Kant/','Kant: il percorso già disponibile'),('rappresentazione.html','Come funziona la rappresentazione')],
'rappresentazione':[('corpo.html','Il corpo: dall’oggetto al vissuto')],
'corpo':[('volonta.html','Dal volere individuale alla Volontà')],
'volonta':[('mondo-uomo.html#schopenhauer-un-fondamento-che-non-la-materia','Confronto: Volontà e Natura'),(L+'Leopardi/pagine/macchina-anima.html','Leopardi: la Natura-macchina e la personificazione')],
'individuazione':[('compassione.html','Oltre l’egoismo: la compassione')],
'desiderio':[('motore-uomo.html','Il desiderio in filosofia e letteratura'),('sofferenza.html','Perché l’uomo soffre: spiegazioni a confronto')],
'pessimismo':[('mondo-uomo.html','Il mondo non è fatto per noi')],
'arte':[(L+'Foscolo/lezioni/alla-sera.html','Alla sera: una pace momentanea'),('salvezza.html','Le risposte al dolore, senza equivalenze')],
'compassione':[(L+'Leopardi/pagine/ginestra.html','La ginestra: leggere la social catena'),('salvezza.html#leopardi-conoscere-il-vero-e-costruire-la-social-catena','Compassione e solidarietà: la differenza')],
'ascesi':[('salvezza.html','Negazione del volere e risposte letterarie')],
'conclusione':[('letteratura.html','Entra nel confronto per problemi'),('verifica.html','Verifica il percorso filosofico')],
'mondo-uomo':[(L+'Foscolo/lezioni/immagine-del-mondo.html','Foscolo: materia e religione delle illusioni'),(L+'Leopardi/pagine/natura-islandese.html','La lezione sul Dialogo della Natura e di un Islandese'),(L+'Leopardi-testi/#/reader/operette-morali/dialogo-della-natura-e-di-un-islandese','Il testo integrale del Dialogo'),(L+"natura-macchina/L'universo%20come%20una%20macchina.html",'Natura-macchina: esplorazione visiva online'),('volonta.html','Ritorna al concetto di Volontà')],
'motore-uomo':[(L+'Leopardi/pagine/filosofia-base.html','Leopardi: la teoria del piacere'),(L+'Leopardi/pagine/infinito.html','L’infinito: limite e immaginazione'),(L+'Foscolo/lezioni/ortis-parini.html','Ortis e Parini: passioni e storia'),('desiderio.html','Desiderio, dolore e noia')],
'sofferenza':[(L+'Foscolo/lezioni/alla-sera.html','Alla sera: il sonetto e la lezione'),(L+'Leopardi/pagine/immagine-mondo.html','Leopardi: l’immagine del mondo'),('pessimismo.html','Schopenhauer: i livelli del pessimismo')],
'salvezza':[(L+'Foscolo-testi/#testo/sepolcri/vv1-50','Dei Sepolcri, versi 1–50: l’illusione degli affetti'),(L+'Foscolo/lezioni/immagine-del-mondo.html','Foscolo: il valore umano delle illusioni'),(L+'Leopardi-testi/#/reader/canti/xxxiv-la-ginestra-o-il-fiore-del-deserto','La ginestra: il testo integrale'),(L+'Leopardi/pagine/ginestra.html','La ginestra: la lezione'),('ascesi.html','Schopenhauer: che cosa significa negare il volere')],
'confronto-finale':[('verifica.html','Mettiti alla prova sui confronti'),('fonti.html','Controlla fonti e metodo')]
}
activities={q[0]:(q[1],q[2][0]+' '+q[3]) for q in QUESTIONS}
for c in chapters:
 slug=c['slug'];group=c['group'];n=[x for x in chapters if x['group']==group].index(c)+1; seq=[x for x in chapters if x['group']==group];sym,cap=SYMBOL[slug]
 body=f'<article id="{slug}"><p class="eyebrow">{"A · Comprendere Schopenhauer" if group=="filosofia" else "B · Schopenhauer e la letteratura"} · {n:02d}</p><h1>{escape(c["title"])}</h1><p class="question">{escape(c["question"])}</p><p class="meta">Lettura: circa {max(3,round(len(c["body"].split())/180))} minuti · Domanda, argomento, immagine, mappa, confronto</p><div class="tools"><span>Lettura</span><button data-font="-0.1" aria-label="Riduci la dimensione del testo">A−</button><button data-font="0.1" aria-label="Aumenta la dimensione del testo">A+</button><button data-print>Stampa la lezione</button></div>{prose(c["body"])}<figure class="symbol"><img src="assets/simbolo-{sym}.svg" width="900" height="330" alt="{escape(cap)}"><figcaption>{escape(cap)} Diagramma simbolico originale.</figcaption></figure><section class="map" aria-labelledby="mappa"><p class="eyebrow">Dopo la lettura</p><h2 id="mappa">Mappa di sintesi</h2><figure><img src="assets/mappa-{slug}.svg" alt="{escape(MAPS[slug][0])}: relazioni descritte nella versione testuale successiva." loading="lazy"><figcaption>Su schermi piccoli scorri la mappa orizzontalmente. <a href="assets/mappa-{slug}.svg">Apri l’immagine da ingrandire</a>.</figcaption></figure><details><summary>Leggi la mappa in forma testuale</summary>{map_text(slug)}</details></section>'
 q,a=activities[slug];body+=f'<section><h2>Fermati sul problema</h2><p>{escape(q)}</p><details class="activity"><summary>Confronta il tuo ragionamento</summary><p>{escape(a)}</p></details></section>'
 body+='<aside class="links"><h2>Continua il confronto</h2><ul>'+''.join(f'<li><a href="{escape(url,quote=True)}">{escape(label)}</a></li>' for url,label in LINKS[slug])+'</ul><p>I percorsi esterni a Schopenhauer richiedono la rete se non sono già disponibili sul dispositivo.</p></aside>'
 body+=f'<p class="meta">Riferimenti: {escape(c["refs"])}. <a href="fonti.html">Edizioni, fonti e criteri del confronto</a>.</p><nav class="chapter-nav" aria-label="Lezioni precedente e successiva">'
 prev=seq[n-2] if n>1 else None; nxt=seq[n] if n<len(seq) else None
 body+=f'<a href="{prev["slug"]+".html" if prev else "comprendere.html" if group=="filosofia" else "letteratura.html"}">← {escape(prev["title"]) if prev else "Indice del percorso"}</a>'
 body+=f'<a href="{nxt["slug"]+".html" if nxt else "letteratura.html" if group=="filosofia" else "verifica.html"}">{escape(nxt["title"]) if nxt else "Vai al confronto letterario" if group=="filosofia" else "Verifica e recupero"} →</a></nav></article>'
 (ROOT/f'{slug}.html').write_text(page(c['title'],body,slug))
for group,file,title,question,intro in [('filosofia','comprendere','Comprendere Schopenhauer','Il mondo è davvero come ci appare?','Undici lezioni seguono il movimento del ragionamento: dalla conoscenza al corpo, dalla Volontà alla sofferenza, fino alle diverse forme di liberazione. Ogni lezione contiene una spiegazione estesa, un diagramma simbolico, una mappa e una domanda di comprensione.'),('letteratura','letteratura','Schopenhauer e la letteratura','Un problema comune può condurre a risposte opposte?','Il confronto procede per problemi e conserva le differenze fra Foscolo, Schopenhauer e Leopardi. La crisi di un universo provvidenziale è una chiave di lettura, non la prova che gli autori condividano un sistema o dipendano l’uno dall’altro.')]:
 body=f'<p class="eyebrow">{"Percorso A" if group=="filosofia" else "Percorso B"}</p><h1>{title}</h1><p class="question">{question}</p><p>{intro}</p><ol class="index-list">'
 for c in chapters:
  if c['group']==group:body+=f'<li><a href="{c["slug"]}.html">{escape(c["title"])}</a><p>{escape(c["question"])}</p></li>'
 body+='</ol>'
 if group=='letteratura':body+='<aside class="future"><strong>Verga · percorso futuro.</strong> Sono predisposti i nodi bisogno, desiderio, roba, ascesa, lotta, sconfitta e ideale dell’ostrica. Non è stata creata una PWA su Verga e non compare un collegamento d’autore ancora inesistente.</aside>'
 (ROOT/f'{file}.html').write_text(page(title,body))
home='''<main class="home" id="main" tabindex="-1"><div class="hero-grid"><div><p class="eyebrow">Filosofia e letteratura · gbprof</p><h1>Schopenhauer</h1><p class="lead">Se il mondo non è ordinato per la felicità dell’uomo, come si può vivere?</p><p>Un ambiente di studio per seguire un pensiero e poi metterlo in dialogo con la letteratura, senza perdere le differenze.</p></div><figure class="hero-media"><div class="hero-video" data-hero-video><button class="hero-play" type="button" data-play-video aria-label="Riproduci il video su Schopenhauer"><img src="assets/schopenhauer-ritratto.png" width="783" height="1388" alt="Ritratto di Arthur Schopenhauer"><span class="hero-play-label" aria-hidden="true">▶ Guarda il video</span></button></div><figcaption><a href="https://www.youtube.com/shorts/UgtPIRq3RF8" target="_blank" rel="noopener noreferrer">Apri su YouTube</a> · Richiede una connessione</figcaption></figure></div><div class="entrances"><section><p class="eyebrow">Percorso A · Undici lezioni</p><h2>Comprendere<br>Schopenhauer</h2><p>Dall’apparire delle cose all’esperienza del corpo, dal desiderio alla domanda sulla liberazione.</p><a class="entry-link" href="comprendere.html">Entra nel percorso filosofico →</a></section><section><p class="eyebrow">Percorso B · Quattro problemi e una sintesi</p><h2>Schopenhauer<br>e la letteratura</h2><p>Foscolo e Leopardi davanti alle stesse domande. Un confronto futuro con Verga già predisposto.</p><a class="entry-link" href="letteratura.html">Entra nel confronto letterario →</a></section></div><section class="guide"><h2>Prima leggere, poi ricostruire</h2><p>Le domande precedono le spiegazioni e le mappe arrivano alla fine. Leggi il testo, ricostruisci le relazioni e confronta il tuo ragionamento con il riscontro proposto. La verifica finale rimescola domande e risposte e indica che cosa ripassare.</p><p><a href="verifica.html">Verifica e recupero</a> · <a href="fonti.html">Fonti e metodo</a></p><h2>Porta il percorso con te</h2><p>Dopo il primo caricamento completo, lezioni, mappe e verifiche sono disponibili anche senza rete. I collegamenti a Foscolo, Leopardi e alle fonti esterne richiedono una connessione. Su iPad puoi usare Condividi → Aggiungi alla schermata Home; negli altri browser compatibili usa il comando di installazione.</p><button data-install hidden>Installa Schopenhauer</button><noscript><p>Le lezioni e le mappe sono leggibili senza JavaScript. Installazione, copia offline e test automatici richiedono JavaScript.</p></noscript></section></main>'''
(ROOT/'index.html').write_text(page('Un mondo senza garanzie',home,wide=True))
(ROOT/'assets/copertina.svg').write_text('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 570"><title>La soglia del visibile</title><rect width="480" height="570" rx="180" fill="#e3e4d7"/><path d="M120 515V185a120 120 0 0 1 240 0v330" fill="#264c43"/><path d="M240 515V70" stroke="#d3bb8b" stroke-width="2"/><g fill="none" stroke="#c2ac7e" stroke-width="2"><path d="M30 350Q120 240 240 350T450 350M30 375Q120 265 240 375T450 375M30 400Q120 290 240 400T450 400M30 425Q120 315 240 425T450 425M30 450Q120 340 240 450T450 450"/></g><circle cx="240" cy="215" r="60" fill="none" stroke="#eee7d5" stroke-width="3"/><path d="M240 155A60 60 0 0 1 240 275Z" fill="#eee7d5"/><text x="240" y="548" font-family="Georgia,serif" font-size="16" fill="#365a4e" text-anchor="middle">Una realtà · Due prospettive</text></svg>''')
bank=[]
for i,(slug,q,answers,feedback) in enumerate(QUESTIONS):
 bank.append(dict(id=f'q{i+1}',group=by[slug]['group'],question=q,answers=[dict(id=str(j),text=a) for j,a in enumerate(answers)],correct='0',feedback=feedback,page=slug+'.html',title=by[slug]['title']))
body='''<p class="eyebrow">Comprensione e relazioni</p><h1 id="quiz-heading" tabindex="-1">Verifica e recupero</h1><p>Non basta riconoscere una parola: scegli la risposta che conserva i passaggi del ragionamento. Dopo la correzione trovi la spiegazione e il collegamento al nucleo da ripassare. Il voto è un’indicazione di autovalutazione.</p><div class="quiz"><label for="quiz-mode">Scegli il percorso</label> <select id="quiz-mode"><option value="filosofia">Comprendere Schopenhauer</option><option value="letteratura">Il confronto letterario</option><option value="tutto">Entrambi i percorsi</option></select><p id="quiz-count" class="meta"></p><div id="results" role="status" tabindex="-1" aria-live="polite"></div><form id="quiz-form"><div id="questions"></div><div class="actions"><button id="correct" type="submit">Correggi e mostra il recupero</button><button id="restart" type="button">Genera un nuovo test</button></div></form></div><noscript><p>Per la correzione automatica attiva JavaScript. In ogni lezione trovi comunque una domanda con riscontro consultabile.</p></noscript><aside class="links"><h2>Oltre la risposta chiusa</h2><p><a href="confronto-finale.html#una-prova-finale-di-comprensione">Svolgi l’attività argomentativa finale</a>: problema comune, due autori, due passi testuali e una differenza motivata.</p></aside>'''
body+='<script type="application/json" id="question-bank">'+json.dumps(bank,ensure_ascii=False).replace('<','\\u003c')+'</script>'
(ROOT/'verifica.html').write_text(page('Verifica e recupero',body))
source='''<p class="eyebrow">Leggere e verificare</p><h1>Fonti e metodo</h1><p>I testi di questo ambiente sono esposizioni didattiche originali. Le analogie fra autori sono dichiarate come confronti interpretativi: non vengono presentate come influenze storiche dimostrate. Ogni lezione indica i passi pertinenti; le mappe sintetizzano l’argomento e non sostituiscono le opere.</p><h2>Schopenhauer: le opere</h2><ul class="sources"><li><strong>Il mondo come volontà e rappresentazione</strong>, volume I: libro I, §§ 1–7 (rappresentazione); libro II, §§ 18–29 (corpo, Volontà, oggettivazione); libro III, §§ 30–52 (Idee, arti e musica); libro IV, §§ 56–59 (sofferenza), 63–67 (etica), 68–71 (ascesi, suicidio e conclusione). La prima edizione uscì nel dicembre 1818 con data 1819. <a href="https://www.gutenberg.org/files/38427/38427-h/38427-h.html">Testo integrale in inglese, traduzione storica Haldane e Kemp, Project Gutenberg</a>. In questa traduzione «Idea» nel titolo rende Vorstellung, qui chiamata «rappresentazione»; le Idee platoniche sono un concetto distinto.</li><li><strong>Sulla quadruplice radice del principio di ragion sufficiente</strong>, edizione riveduta del 1847: §§ 16–23, 29–34, 35–46. Riferimento per le quattro classi di rappresentazioni e le forme del fondamento.</li><li><strong>Il fondamento della morale</strong>, §§ 16–19: la compassione, la giustizia e l’amore disinteressato. Questi riferimenti consentono il riscontro in un’edizione italiana senza dipendere da una numerazione di pagine particolare.</li></ul><h2>Controllo accademico</h2><p>Robert Wicks, <a href="https://plato.stanford.edu/entries/schopenhauer/">Arthur Schopenhauer, Stanford Encyclopedia of Philosophy</a>, revisione del 9 settembre 2021. Consultata per controllare la cronologia e i punti teorici delicati, in particolare la relazione fra Volontà e rappresentazione e i limiti dell’accesso alla cosa in sé. La fonte principale dell’esposizione resta l’opera del filosofo.</p><h2>Foscolo e Leopardi: testi e percorsi interni</h2><p>Sono stati letti i materiali effettivamente presenti nei percorsi Foscolo, Foscolo-testi, Leopardi, Leopardi-testi e Natura-macchina del repository IV-anno, nella versione esaminata il 26 settembre 2026. Le nuove pagine conservano il loro orientamento didattico e precisano le distinzioni necessarie al confronto.</p><ul class="sources"><li><a href="/IV-anno/Letteratura/Foscolo-testi/#testo/sepolcri/vv1-50">Foscolo, Dei Sepolcri, vv. 1–50</a>, con gli altri nuclei nel lettore di testi. <a href="/IV-anno/Letteratura/Foscolo/lezioni/immagine-del-mondo.html">La religione delle illusioni</a> e <a href="/IV-anno/Letteratura/Foscolo/lezioni/alla-sera.html">Alla sera</a>.</li><li><a href="/IV-anno/Letteratura/Leopardi-testi/#/reader/operette-morali/dialogo-della-natura-e-di-un-islandese">Leopardi, Dialogo della Natura e di un Islandese</a>: testo completo, compresi i due finali.</li><li><a href="/IV-anno/Letteratura/Leopardi-testi/#/reader/canti/xxxiv-la-ginestra-o-il-fiore-del-deserto">Leopardi, La ginestra</a>, in particolare vv. 111–157 per nobiltà, aiuto reciproco e social catena.</li><li>Leopardi, <em>Zibaldone</em>, pp. 165–172 del manoscritto (luglio 1820), teoria del piacere; <a href="/IV-anno/Letteratura/Leopardi/pagine/filosofia-base.html">percorso didattico sul contesto e sul desiderio</a>.</li><li><a href="/IV-anno/Letteratura/Leopardi/pagine/macchina-anima.html">Natura-macchina e personificazione</a>: approfondimento interno, assunto come lettura interpretativa e non come attribuzione di una coscienza alla Natura.</li></ul><h2>Il posto di Verga</h2><p>Il percorso Natura-macchina contiene già cenni e materiali preparatori relativi a Verga. Non esisteva però, alla ricognizione, una PWA d’autore dedicata nella posizione prevista. Qui sono predisposte soltanto domande e connessioni tematiche; nessuna pagina di Verga è stata inventata, e nessuna influenza diretta di Schopenhauer viene affermata.</p><h2>Immagini e uso offline</h2><p>Le immagini sono diagrammi vettoriali originali: simboli esplicativi e mappe con relazioni nominate, corredate di alternative testuali. Non sono documenti storici né ricostruzioni fotografiche. L’ambiente non utilizza font remoti, servizi di tracciamento o account. Le risposte ai test rimangono nella pagina; la sessione conserva soltanto gli ordini di rimescolamento per evitare una ripetizione identica immediata.</p>'''
(ROOT/'fonti.html').write_text(page('Fonti e metodo',source))
manifest={'id':'./','name':'Schopenhauer — Filosofia e letteratura','short_name':'Schopenhauer','lang':'it','description':'Due percorsi di lettura, mappe e verifiche.','start_url':'./index.html','scope':'./','display':'standalone','background_color':'#f7f3eb','theme_color':'#264c43','icons':[{'src':'assets/icon-192.png','sizes':'192x192','type':'image/png','purpose':'any'},{'src':'assets/icon-512.png','sizes':'512x512','type':'image/png','purpose':'any'},{'src':'assets/icon-maskable-512.png','sizes':'512x512','type':'image/png','purpose':'maskable'}]}
(ROOT/'manifest.webmanifest').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
files=['./','./index.html','../pwa-common/gbprof-accessibility.css?v=1','../pwa-common/gbprof-accessibility.js?v=1','../privacy.html','../accessibilita.html']
files+=['./'+p.relative_to(ROOT).as_posix() for p in sorted(ROOT.rglob('*')) if p.is_file() and 'tools' not in p.relative_to(ROOT).parts and p.suffix in ['.html','.css','.svg','.png','.webmanifest'] and p.name!='index.html']
files+=['./app.js','./app.js?v=2','./styles.css?v=2']
worker='''const PREFIX='gbprof-schopenhauer-';
const CACHE=PREFIX+'v3';
const CORE=__CORE__;
const BASE=new URL('./',self.location.href);
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==BASE.origin)return;
 const known=CORE.some(p=>new URL(p,BASE).href===url.href);
 if(!url.pathname.startsWith(BASE.pathname)&&!known)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  if(event.request.mode==='navigate'){
   try{const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response;}
   catch{const hit=await cache.match(event.request,{ignoreSearch:true});return hit||new Response('Pagina non disponibile offline. Torna all’indice di Schopenhauer.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}
  }
  const hit=await cache.match(event.request);if(hit)return hit;
  const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response;
 })());
});
'''
(ROOT/'sw.js').write_text(worker.replace('__CORE__',json.dumps(list(dict.fromkeys(files)),ensure_ascii=False,indent=2)))
print(f'Built {len(chapters)} chapters, {len(bank)} questions, {len(MAPS)} maps.')
