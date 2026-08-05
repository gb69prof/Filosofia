import {paths,sources,affirmations,discovery,primaryTexts,glossary,comparisons,labProblems,timeline,works,comics,worldStops,atlasNodes,sourceById} from '../data/content.js';

const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const view=$('#view');
const crumbs=$('#breadcrumbs');
const drawer=$('#drawer');
const searchDialog=$('#searchDialog');
const infoDialog=$('#infoDialog');
const notePanel=$('#notePanel');
const noteText=$('#noteText');
const storageKey='san-tommaso-pwa-v1';
const state=loadState();
let deferredInstall=null;
let currentRoute='home';
let currentLab=labProblems[0].id;

function loadState(){
  try{return {...{theme:'dark',font:0,notes:{},highlights:{},bookmarks:[],completed:[],lab:{}},...JSON.parse(localStorage.getItem(storageKey)||'{}')}}catch{return {theme:'dark',font:0,notes:{},highlights:{},bookmarks:[],completed:[],lab:{}}}
}
function saveState(){localStorage.setItem(storageKey,JSON.stringify(state));updateChrome()}
function esc(value=''){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
function routeParts(){const raw=location.hash.replace(/^#\/?/,'')||'home';return raw.split('?')[0].split('/').filter(Boolean)}
function go(route){location.hash=`#/${route}`}
function sourceLink(id){const s=sourceById(id);return s?`<a href="${s.url}" target="_blank" rel="noopener">${s.author}, <em>${s.work}</em>, ${s.location}</a>`:''}
function pageHead(eye,title,text=''){return `<header class="section-head"><p class="eyebrow">${eye}</p><h1>${title}</h1>${text?`<p>${text}</p>`:''}</header>`}
function picture(base,alt,cls=''){return `<picture class="${cls}"><source srcset="./assets/images/${base}.webp" type="image/webp"><img src="./assets/images/${base}.jpg" alt="${esc(alt)}" loading="${cls==='hero-picture'?'eager':'lazy'}"></picture>`}
function buttonLink(route,label,kind='button'){return `<a class="${kind}" href="#/${route}">${label}</a>`}

function renderHome(){
  return `<section class="hero">
    ${picture('tommaso-hero','Tommaso d’Aquino in abito domenicano scrive accanto a una Summa aperta, tra archi medievali e geometrie dorate','hero-picture')}
    <div class="hero-content"><div class="hero-copy"><p class="eyebrow">Un pensiero in cammino</p><h1 class="display">San Tommaso<br>d’Aquino</h1><p class="lead">Ragione in cammino, fede in luce. Un viaggio nel pensiero che ha unito filosofia e teologia senza confonderle.</p><p class="guide-formula">«Comprendere per credere, credere per comprendere.»<small>Formula-guida del percorso, non citazione letterale di Tommaso.</small></p><div class="hero-actions">${buttonLink('scopro','Inizia dalle domande')} ${buttonLink('cattedrale','Vedi il sistema','button ghost')}</div></div></div>
  </section><div class="home-wrap">
    <section class="path-grid" aria-label="Quattro percorsi">${paths.map((p,i)=>`<a class="path-card ${p.id==='approfondisco'?'avanzato':p.id}" href="#/${p.id}"><span><small>0${i+1} · ${p.subtitle}</small><strong>${p.title}</strong><em>${p.description}</em></span></a>`).join('')}</section>
    <section aria-labelledby="toolsTitle"><div class="section-head" style="margin-top:4rem"><p class="eyebrow">Strumenti trasversali</p><h2 id="toolsTitle">Pensare significa collegare</h2><p>Ogni strumento apre un accesso reale ai contenuti: nessuna card è decorativa.</p></div><div class="tool-grid">${toolCards()}</div></section>
    <a class="world-banner" href="#/mondo">${picture('mondo-tommaso','Chiostro universitario medievale con biblioteca, disputa e studio')}<span><small class="eyebrow">Esplorazione interattiva</small><strong>Visita il mondo di Tommaso</strong><em>Entra nell’università medievale. Esplora, incontra, disputa, scopri.</em></span><span class="button">Inizia la visita →</span></a>
    <p class="keyword-line">FILOSOFIA · TEOLOGIA · RAGIONE · FEDE · ESSERE · VERITÀ · BENE · CONOSCENZA</p>
  </div>`
}

function toolCards(){
  const tools=[['dizionario','⌑','Dizionario filosofico','Definizioni, esempi ed errori frequenti.'],['atlante','⌬','Atlante delle idee','Una rete esplorabile di concetti.'],['confronti','⇄','Confronti continui','Continuità, trasformazioni e opposizioni.'],['laboratorio','◇','Laboratorio dei problemi','Tesi, obiezioni e riscrittura.'],['timeline','⌛','Linea del tempo','Vita, opere, università e fortuna.'],['biblioteca','▥','Biblioteca delle opere','Orientarsi nel corpus tomista.']];
  return tools.map(([id,icon,title,text])=>`<a class="tool-card" href="#/${id}"><span class="tool-icon" aria-hidden="true">${icon}</span><strong>${title}</strong><span>${text}</span></a>`).join('')
}

function renderScopro(){
  return `<article class="page">${pageHead('Percorso 01 · Scopro','Sei domande per entrare','Non cominciamo dalle definizioni, ma da problemi che riguardano il nostro modo di conoscere e scegliere.')}<div class="card-grid">${discovery.map((d,i)=>`<section class="content-card discovery-card"><span class="number">DOMANDA ${i+1}</span><h2>${d.question}</h2><p>${d.hook}</p><button class="button small reveal-discovery" data-discovery="${d.id}" aria-expanded="false">Metti alla prova la risposta</button><div class="discovery-answer" id="answer-${d.id}" hidden><p>${d.answer}</p>${buttonLink(`studio/${d.link}`,'Apri la lezione','button ghost small')}</div></section>`).join('')}</div><section class="complete-row"><div><strong>Hai attraversato le sei domande?</strong><p class="micro">La domanda non viene cancellata dalla risposta: diventa più precisa.</p></div><button class="button mark-complete" data-complete="scopro">Segna come completato</button></section></article>`
}

function affirmationCards(prefix='studio'){
  return affirmations.map(a=>`<a class="content-card affirmation-card" href="#/${prefix}/${a.id}"><span class="roman">${a.roman}</span><span><small class="number">${a.question}</small><h2>${a.title}</h2><p>${a.short}</p><span class="tag-list">${a.keywords.slice(0,4).map(k=>`<span class="tag">${k}</span>`).join('')}</span></span></a>`).join('')
}
function renderStudio(parts){
  const id=parts[1];
  if(!id)return `<article class="page">${pageHead('Percorso 02 · Studio','Le cinque affermazioni','Il cuore del progetto del 2007 è conservato, ma ogni passaggio è stato riesaminato e corretto.')}<div class="card-grid">${affirmationCards()}</div><section class="content-card" style="margin-top:2rem"><h2>Modalità docente e studente</h2><p>Ogni lezione contiene obiettivi, prerequisiti, parole chiave, testo, schema, fonte guidata, domande e verifica. I progressi restano soltanto in questo browser.</p>${buttonLink('cattedrale','Apri la sintesi finale','button ghost')}</section></article>`;
  const a=affirmations.find(x=>x.id===id);if(!a)return renderNotFound();
  const s=sourceById(a.text.source);
  return `<article class="page"><div class="lesson-layout"><div>${pageHead(`Affermazione ${a.roman}`,a.title,a.question)}<div class="tag-list">${a.keywords.map(k=>`<a class="tag" href="#/dizionario?q=${encodeURIComponent(k)}">${k}</a>`).join('')}</div><div class="prose">${a.body}<section class="scheme"><h2>Lo schema essenziale</h2>${a.scheme.map(([k,v])=>`<div class="scheme-row"><strong>${k}</strong><span>${v}</span></div>`).join('')}</section><section class="source-box"><p class="eyebrow">Testo guidato</p><h2>${s.label}</h2><p class="latin" lang="la">${a.text.latin}</p><p>${a.text.translation}</p><p class="source-meta">${sourceLink(a.text.source)} · ${s.edition}</p></section><section><h2>Domande di comprensione</h2><div class="question-list">${a.questions.map((q,i)=>`<div class="question"><strong>${i+1}.</strong> ${q}</div>`).join('')}</div></section>${renderQuiz(a.quiz,a.id)}</div><section class="complete-row"><div><strong>Concludi la lezione</strong><p class="micro">Il completamento aggiorna il progresso locale.</p></div><button class="button mark-complete" data-complete="${a.id}">${state.completed.includes(a.id)?'Completata ✓':'Segna come completata'}</button></section></div><aside class="lesson-aside"><section class="aside-box"><h3>Obiettivi</h3><ul>${a.objectives.map(x=>`<li>${x}</li>`).join('')}</ul></section><section class="aside-box"><h3>Prerequisiti</h3><p class="micro">${a.prerequisites}</p></section><section class="aside-box"><h3>Passa a</h3>${affirmations.map(x=>`<a class="micro" href="#/studio/${x.id}">${x.roman} · ${x.title}</a><br>`).join('')}</section></aside></div></article>`
}
function renderQuiz(items,id){return `<section class="quiz" data-quiz="${id}"><h2>Verifica immediata</h2>${items.map((item,qi)=>`<div class="quiz-item" data-question="${qi}" data-correct="${item.correct}"><h3>${qi+1}. ${item.q}</h3><div class="answers">${item.a.map((answer,ai)=>`<button class="answer" data-answer="${ai}">${answer}</button>`).join('')}</div><p class="feedback" aria-live="polite"></p><template>${item.why}</template></div>`).join('')}<div class="score-card" hidden></div></section>`}

function renderApprofondisco(){
  return `<article class="page">${pageHead('Percorso 03 · Approfondisco','Leggere Tommaso, non soltanto riassumerlo','Estratti brevi verificati, guida alla lettura e problemi interpretativi. Le traduzioni sono redazionali e il latino resta sempre collegato alla fonte.')}<div class="card-grid">${primaryTexts.map(t=>{const s=sourceById(t.source);return `<section class="content-card"><span class="number">${s.work} · ${s.location}</span><h2>${t.title}</h2><p lang="la"><em>${t.latin}</em></p><p>${t.translation}</p><button class="button ghost small primary-open" data-text="${t.id}">Leggi e annota</button></section>`}).join('')}</div><section style="margin-top:4rem">${pageHead('Problemi interpretativi','Cinque cautele decisive')}<div class="card-grid">${[
    ['Non “prove scientifiche”','Le vie sono argomenti metafisici. “Dai sensi” indica il punto di partenza, non il metodo di una scienza sperimentale moderna.'],
    ['Non un universo necessariamente iniziato','Tommaso distingue creazione e inizio temporale: la ragione non dimostra che il mondo abbia avuto un primo istante.'],
    ['Non il trifoglio della Trinità','La Trinità è verità rivelata; un’analogia può chiarire, non dimostrare il mistero.'],
    ['Non Aristotele “ripulito”','Avicenna e Averroè sono interlocutori filosofici reali. Tommaso riceve, critica e trasforma una tradizione mediata.'],
    ['Non un’anima cartesiana','La sussistenza dell’anima non cancella la tesi fondamentale: l’uomo è una sola sostanza di anima e corpo.']
  ].map(([h,p])=>`<section class="content-card"><h2>${h}</h2><p>${p}</p></section>`).join('')}</div></section><section class="complete-row"><div><strong>Continua dalle fonti</strong><p class="micro">La bibliografia distingue testi primari e studi secondari.</p></div>${buttonLink('fonti','Apri fonti e bibliografia')}</section></article>`
}

function renderFumetti(){
  return `<article class="page">${pageHead('Percorso 04 · A fumetti','Una vita attraversata dalle idee','Le immagini e i dialoghi sono ricostruzioni narrative. Ogni episodio dichiara il confine tra dato storico e invenzione plausibile.')}<div class="narrative-note"><strong>Patto di lettura.</strong> Nessuna battuta inventata viene presentata come citazione. Le tradizioni agiografiche sono segnalate e non usate come verbali stenografici.</div><figure class="comic-sheet">${picture('fumetto-01-06','Sei scene: Roccasecca, Montecassino, Napoli, scelta domenicana, contrasto familiare e Alberto Magno')}<figcaption class="sr-only">Primi sei episodi della vita di Tommaso.</figcaption></figure><div class="episode-grid">${comics.slice(0,6).map(episodeCard).join('')}</div><figure class="comic-sheet">${picture('fumetto-07-12','Sei scene: Parigi, incontro con tradizioni arabe ed ebraiche, Summa, disputa, silenzio e Fossanova')}<figcaption class="sr-only">Ultimi cinque episodi e una scena di contesto.</figcaption></figure><div class="episode-grid">${comics.slice(6).map(episodeCard).join('')}</div></article>`
}
function episodeCard(e){return `<button class="episode-card episode-open" data-episode="${e.id}"><span>EPISODIO ${String(e.id).padStart(2,'0')} · ${e.date}</span><h3>${e.title}</h3><p>${e.text}</p></button>`}

function renderDizionario(parts){
  const query=new URLSearchParams((location.hash.split('?')[1]||'')).get('q')||'';
  return `<article class="page">${pageHead('Strumento · Dizionario','Le parole che costruiscono il sistema','Definizione breve, spiegazione, esempio, errore frequente e collegamenti interni.')}<div class="glossary-controls"><input id="glossarySearch" value="${esc(query)}" type="search" placeholder="Filtra le voci…"><div class="alphabet">${'AEFGLMNP R SUV'.replace(/ /g,'').split('').map(l=>`<button data-letter="${l}">${l}</button>`).join('')}</div></div><div id="glossaryGrid" class="glossary-grid">${glossaryCards(query)}</div></article>`
}
function glossaryCards(query=''){const q=query.toLowerCase();return glossary.filter(g=>!q||`${g.term} ${g.brief} ${g.full}`.toLowerCase().includes(q)).map(g=>`<button class="term-card term-open" data-term="${g.term}"><strong>${g.term}</strong><p>${g.brief}</p></button>`).join('')||'<p>Nessuna voce corrisponde alla ricerca.</p>'}

function renderAtlante(){
  const lines=[];atlasNodes.forEach(n=>n.links.forEach(id=>{const b=atlasNodes.find(x=>x.id===id);if(b&&n.id<b.id)lines.push(`<line x1="${n.x}" y1="${n.y}" x2="${b.x}" y2="${b.y}"/>`)}));
  return `<article class="page">${pageHead('Strumento · Atlante','La rete delle idee','Clicca un nodo: nessun concetto vive da solo. Le linee mostrano dipendenze, non semplici somiglianze.')}<div class="atlas"><svg class="atlas-lines" aria-hidden="true">${lines.join('')}</svg>${atlasNodes.map(n=>`<button class="concept-node atlas-open" style="--x:${n.x};--y:${n.y}" data-node="${n.id}">${n.label}</button>`).join('')}</div></article>`
}

function renderConfronti(){
  return `<article class="page">${pageHead('Strumento · Confronti continui','Pensare tra continuità e fratture','Ogni confronto usa le stesse cinque dimensioni, così le differenze restano controllabili.')}<div class="card-grid">${comparisons.map(c=>`<section class="content-card"><span class="number">PROBLEMA COMUNE</span><h2>${c.name}</h2><p>${c.problem}</p><button class="button ghost small comparison-open" data-comparison="${c.id}">Confronta</button></section>`).join('')}</div></article>`
}

function renderLaboratorio(){
  const p=labProblems.find(x=>x.id===currentLab)||labProblems[0];const saved=state.lab[p.id]||{};
  return `<article class="page">${pageHead('Strumento · Laboratorio','La disputa come metodo','Scegli una tesi, argomenta, ricevi un’obiezione, riscrivi e confronta la tua posizione con Tommaso.')}<div class="lab-shell"><nav class="lab-list" aria-label="Problemi">${labProblems.map(x=>`<button class="lab-select ${x.id===p.id?'active':''}" data-lab="${x.id}">${x.title}</button>`).join('')}</nav><section class="lab-workspace" data-lab-workspace="${p.id}"><p class="eyebrow">Quaestio</p><h2>${p.title}</h2><fieldset class="thesis-options"><legend>1 · Scegli una tesi</legend>${p.theses.map((t,i)=>`<label><input type="radio" name="thesis" value="${i}" ${String(saved.thesis)===String(i)?'checked':''}> ${t}</label>`).join('')}</fieldset><label for="firstArgument"><strong>2 · Costruisci l’argomento</strong></label><textarea id="firstArgument" rows="5" placeholder="Premessa, passaggio, conclusione…">${esc(saved.first||'')}</textarea><button class="button small show-objection" style="margin-top:.7rem">Ricevi l’obiezione</button><div class="objection" ${saved.objection?'':'hidden'}><strong>Obiezione:</strong> ${p.objection}</div><div class="revision" ${saved.objection?'':'hidden'}><label for="revision"><strong>3 · Rivedi la risposta</strong></label><textarea id="revision" rows="5" placeholder="Che cosa mantieni? Che cosa distingui?">${esc(saved.revision||'')}</textarea><div class="note-actions"><button class="button small save-lab">Salva il percorso</button><button class="button ghost small compare-aquinas">Confronta con Tommaso</button></div><div class="aquinas-answer" ${saved.compared?'':'hidden'}><p><strong>Posizione tomista:</strong> ${p.aquinas}</p></div></div><p class="micro lab-status" aria-live="polite"></p></section></div></article>`
}

function renderTimeline(){
  return `<article class="page">${pageHead('Strumento · Linea del tempo','Un pensiero dentro le istituzioni','Vita, opere, traduzioni, condanne e fortuna del tomismo. Le date incerte restano dichiarate incerte.')}<div class="timeline">${timeline.map(t=>`<section class="timeline-item"><time>${t.date}</time><h3>${t.title}</h3><p>${t.text}</p><span class="tag">${t.type}</span></section>`).join('')}</div></article>`
}

function renderBiblioteca(){
  return `<article class="page">${pageHead('Strumento · Biblioteca','Le opere e il loro compito','Non tutte le opere dicono la stessa cosa nello stesso modo. Prima di citare, bisogna sapere che testo si sta leggendo.')}<div class="card-grid">${works.map(w=>`<section class="content-card"><span class="number">${w.kind} · ${w.date}</span><h2>${w.title}</h2><p>${w.description}</p><p><strong>Perché leggerla:</strong> ${w.why}</p><a class="button ghost small" href="${w.link}" target="_blank" rel="noopener">Testo nel Corpus Thomisticum ↗</a></section>`).join('')}</div></article>`
}

function renderMondo(){
  return `<article class="page">${pageHead('Esplorazione · Mondo di Tommaso','Entra, incontra, disputa','Quattro luoghi rendono visibile il metodo: biblioteca, aula, viaggio e studio. Gli hotspot funzionano anche da tastiera.')}<div class="world-stage">${picture('mondo-tommaso','Chiostro domenicano del XIII secolo con biblioteca, disputa, porta urbana e studio')}${worldStops.map((s,i)=>`<button class="hotspot world-open" style="--x:${s.x};--y:${s.y}" data-stop="${s.id}" aria-label="${s.title}">${i+1}</button>`).join('')}</div><div id="worldCaption" class="world-caption"><div><strong>Scegli un luogo</strong><p>Ogni tappa apre un contenuto e suggerisce il passo successivo.</p></div>${buttonLink('home','Torna alla copertina','button ghost')}</div></article>`
}

function renderCattedrale(){
  return `<article class="page">${pageHead('Sintesi finale','La cattedrale del pensiero','Cinque affermazioni, un solo sistema: l’essere fonda la conoscibilità; il bene orienta la libertà; grazia e fede non distruggono natura e ragione.')}<div class="card-grid">${affirmationCards()}</div><section class="prose narrow" style="margin-top:4rem"><h2>La chiave di volta</h2><p>Tommaso non costruisce un sistema chiuso partendo da una sola formula. Costruisce connessioni: ciò che una cosa è e il fatto che sia; il modo corporeo del conoscere e l’apertura universale dell’intelletto; il desiderio del bene e l’educazione della libertà; l’autonomia della ragione e un ordine rivelato che la supera senza contraddirla.</p><blockquote>La cattedrale non vale perché elimina le tensioni, ma perché le trasforma in archi portanti.</blockquote>${buttonLink('atlante','Esplora la rete concettuale')} ${buttonLink('laboratorio','Metti alla prova il sistema','button ghost')}</section></article>`
}

function renderFonti(){
  const prim=sources.filter(s=>!s.id.startsWith('sep')&&!['aeterni'].includes(s.id));const sec=sources.filter(s=>s.id.startsWith('sep')||s.id==='aeterni');
  const list=arr=>`<ol>${arr.map(s=>`<li><a href="${s.url}" target="_blank" rel="noopener"><strong>${s.author}</strong>, <em>${s.work}</em>, ${s.location}</a><br><span class="micro">${s.edition}</span></li>`).join('')}</ol>`;
  return `<article class="page narrow">${pageHead('Documentazione','Fonti e bibliografia','Le citazioni rimandano alla collocazione interna dell’opera. Le formule redazionali non vengono trasformate in parole di Tommaso.')}<div class="prose"><h2>Fonti primarie</h2>${list(prim)}<h2>Fonti secondarie e fortuna</h2>${list(sec)}<h2>Criterio editoriale</h2><p>Gli estratti latini sono brevi e verificati sul Corpus Thomisticum. Le traduzioni italiane presenti nella PWA sono redazionali e vengono dichiarate tali. Per un uso accademico o editoriale occorre confrontarle con un’edizione italiana riconosciuta e citarla espressamente.</p></div></article>`
}

function renderNotFound(){return `<article class="page narrow">${pageHead('Errore 404','La quaestio non è stata trovata','Il collegamento non corrisponde a una sezione esistente.')} ${buttonLink('home','Torna alla copertina')}</article>`}

const renderers={home:renderHome,scopro:renderScopro,studio:renderStudio,approfondisco:renderApprofondisco,fumetti:renderFumetti,dizionario:renderDizionario,atlante:renderAtlante,confronti:renderConfronti,laboratorio:renderLaboratorio,timeline:renderTimeline,biblioteca:renderBiblioteca,mondo:renderMondo,cattedrale:renderCattedrale,fonti:renderFonti};

function render(){
  const parts=routeParts();currentRoute=parts.join('/');const renderer=renderers[parts[0]]||renderNotFound;
  view.innerHTML=renderer(parts);renderBreadcrumbs(parts);bindPage();loadCurrentNote();updateChrome();view.focus({preventScroll:true});scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}

function renderBreadcrumbs(parts){
  const labels={home:'Copertina',scopro:'Scopro',studio:'Studio',approfondisco:'Approfondisco',fumetti:'A fumetti',dizionario:'Dizionario',atlante:'Atlante',confronti:'Confronti',laboratorio:'Laboratorio',timeline:'Linea del tempo',biblioteca:'Biblioteca',mondo:'Mondo di Tommaso',cattedrale:'Cattedrale del pensiero',fonti:'Fonti'};
  let html='<a href="#/home">Home</a>';if(parts[0]!=='home'){html+=' <span aria-hidden="true">›</span> '+(parts.length>1?`<a href="#/${parts[0]}">${labels[parts[0]]||parts[0]}</a>`:`<span aria-current="page">${labels[parts[0]]||parts[0]}</span>`)}if(parts[1]){const a=affirmations.find(x=>x.id===parts[1]);html+=` <span aria-hidden="true">›</span> <span aria-current="page">${a?.title||parts[1]}</span>`}crumbs.innerHTML=html;
}

function bindPage(){
  $$('.reveal-discovery').forEach(b=>b.addEventListener('click',()=>{const box=$(`#answer-${b.dataset.discovery}`);box.hidden=!box.hidden;b.setAttribute('aria-expanded',String(!box.hidden))}));
  $$('.mark-complete').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.complete;if(!state.completed.includes(id))state.completed.push(id);saveState();b.textContent='Completata ✓'}));
  $$('.answer').forEach(b=>b.addEventListener('click',handleAnswer));
  const gs=$('#glossarySearch');if(gs){gs.addEventListener('input',()=>$('#glossaryGrid').innerHTML=glossaryCards(gs.value));$$('[data-letter]').forEach(b=>b.addEventListener('click',()=>{gs.value=b.dataset.letter;gs.dispatchEvent(new Event('input'))}))}
  $$('.term-open').forEach(b=>b.addEventListener('click',()=>openTerm(b.dataset.term)));
  $$('.atlas-open').forEach(b=>b.addEventListener('click',()=>openAtlas(b.dataset.node)));
  $$('.comparison-open').forEach(b=>b.addEventListener('click',()=>openComparison(b.dataset.comparison)));
  $$('.primary-open').forEach(b=>b.addEventListener('click',()=>openPrimary(b.dataset.text)));
  $$('.episode-open').forEach(b=>b.addEventListener('click',()=>openEpisode(Number(b.dataset.episode))));
  $$('.world-open').forEach(b=>b.addEventListener('click',()=>openWorld(b.dataset.stop)));
  $$('.lab-select').forEach(b=>b.addEventListener('click',()=>{currentLab=b.dataset.lab;view.innerHTML=renderLaboratorio();bindPage()}));
  $('.show-objection')?.addEventListener('click',showObjection);$('.save-lab')?.addEventListener('click',saveLab);$('.compare-aquinas')?.addEventListener('click',compareAquinas);
}

function handleAnswer(event){
  const b=event.currentTarget,item=b.closest('.quiz-item'),correct=Number(item.dataset.correct),picked=Number(b.dataset.answer);$$('.answer',item).forEach(x=>{x.disabled=true;if(Number(x.dataset.answer)===correct)x.classList.add('correct')});if(picked!==correct)b.classList.add('wrong');$('.feedback',item).textContent=(picked===correct?'Corretto. ':'Da rivedere. ')+$('template',item).content.textContent;const quiz=b.closest('.quiz'),items=$$('.quiz-item',quiz);if(items.every(i=>$$('.answer',i).some(x=>x.disabled))){const score=items.filter(i=>$('.answer.correct',i)&&!$('.answer.wrong',i)).length;const box=$('.score-card',quiz);box.hidden=false;box.textContent=`Risultato: ${score}/${items.length}. ${score===items.length?'Hai distinto correttamente tutti i passaggi.':'Rileggi lo schema e prova a spiegare ad alta voce l’errore.'}`}}

function openDialog(eye,title,body){$('#dialogEyebrow').textContent=eye;$('#dialogTitle').textContent=title;$('#dialogBody').innerHTML=body;infoDialog.showModal()}
function openTerm(term){const g=glossary.find(x=>x.term===term);if(!g)return;openDialog('Dizionario filosofico',g.term,`<p><strong>${g.brief}</strong></p><p>${g.full}</p><h3>Esempio</h3><p>${g.example}</p><h3>Errore frequente</h3><p>${g.error}</p><p class="source-meta">Fonte di orientamento: ${sourceLink(g.source)}</p><p>Collegamenti: ${g.links.map(x=>`<span class="tag">${x}</span>`).join(' ')}</p>`)}
function openAtlas(id){const n=atlasNodes.find(x=>x.id===id);if(!n)return;openDialog('Atlante delle idee',n.label,`<p>${n.text}</p><h3>Relazioni</h3><p>${n.links.map(x=>`<button class="tag atlas-dialog-link" data-node="${x}">${atlasNodes.find(n=>n.id===x)?.label||x}</button>`).join(' ')}</p>`);$$('.atlas-dialog-link',infoDialog).forEach(b=>b.addEventListener('click',()=>openAtlas(b.dataset.node)))}
function openComparison(id){const c=comparisons.find(x=>x.id===id);if(!c)return;openDialog('Confronti continui',c.name,`<p><strong>Problema comune:</strong> ${c.problem}</p><table class="comparison-table"><tr><th>Continuità</th><td>${c.continuity}</td></tr><tr><th>Trasformazione</th><td>${c.transformation}</td></tr><tr><th>Opposizione</th><td>${c.opposition}</td></tr><tr><th>Metodo</th><td>${c.method}</td></tr></table>`)}
function openPrimary(id){const t=primaryTexts.find(x=>x.id===id),s=sourceById(t?.source);if(!t||!s)return;openDialog('Testo originale',t.title,`<blockquote lang="la">${t.latin}</blockquote><p>${t.translation}</p><h3>Guida alla lettura</h3><p>${t.guide}</p><h3>Parole difficili</h3><p>${t.terms.map(x=>`<span class="tag">${x}</span>`).join(' ')}</p><h3>Domande</h3><ol>${t.questions.map(q=>`<li>${q}</li>`).join('')}</ol><p class="source-meta">${sourceLink(t.source)} · ${s.edition}</p>`)}
function openEpisode(id){const e=comics.find(x=>x.id===id);if(!e)return;openDialog(`Episodio ${String(e.id).padStart(2,'0')} · ${e.date}`,e.title,`<p>${e.text}</p><h3>Confine tra storia e racconto</h3><p>${e.note}</p><p class="narrative-note">I dialoghi dell’episodio, quando verranno sviluppati, saranno ricostruzioni dichiarate e non citazioni.</p>`)}
function openWorld(id){const s=worldStops.find(x=>x.id===id);if(!s)return;$('#worldCaption').innerHTML=`<div><strong>${s.title}</strong><p>${s.text}</p></div><div>${s.links.map(r=>buttonLink(r,routeTitle(r),'button ghost small')).join(' ')}</div>`}
function routeTitle(id){return {approfondisco:'Apri le fonti',biblioteca:'Apri la biblioteca',laboratorio:'Entra nella disputa',studio:'Vai alle lezioni',timeline:'Segui i viaggi',fumetti:'Leggi la storia'}[id]||id}

function labSnapshot(){const shell=$('[data-lab-workspace]');if(!shell)return null;return {id:shell.dataset.labWorkspace,thesis:$('input[name="thesis"]:checked',shell)?.value??'',first:$('#firstArgument',shell).value,revision:$('#revision',shell)?.value||'',objection:!$('.objection',shell).hidden,compared:!$('.aquinas-answer',shell).hidden}}
function showObjection(){const s=labSnapshot();state.lab[s.id]={...s,objection:true};$('.objection').hidden=false;$('.revision').hidden=false;saveState()}
function saveLab(){const s=labSnapshot();state.lab[s.id]=s;saveState();$('.lab-status').textContent='Percorso salvato in questo browser.'}
function compareAquinas(){const s=labSnapshot();state.lab[s.id]={...s,compared:true};$('.aquinas-answer').hidden=false;saveState()}

function renderDrawer(){
  const groups=[['Percorsi',paths.map(p=>[p.id,p.title,p.subtitle])],['Strumenti',[['dizionario','Dizionario','Parole e concetti'],['atlante','Atlante','Rete delle idee'],['confronti','Confronti','Nove interlocutori'],['laboratorio','Laboratorio','Otto problemi'],['timeline','Linea del tempo','Vita e fortuna'],['biblioteca','Biblioteca','Opere e fonti']]],['Sintesi',[['mondo','Mondo di Tommaso','Esplorazione con hotspot'],['cattedrale','Cattedrale del pensiero','Mappa finale'],['fonti','Fonti','Bibliografia verificabile']]]];
  $('#drawerNav').innerHTML=groups.map(([title,items])=>`<p class="eyebrow" style="margin-top:1rem">${title}</p>${items.map(([id,label,small])=>`<a href="#/${id}"><strong>${label}</strong><small>${small}</small></a>`).join('')}`).join('');$$('a',$('#drawerNav')).forEach(a=>a.addEventListener('click',closeDrawer))
}
function openDrawer(){drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('#menuClose').focus()}
function closeDrawer(){drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');document.body.style.overflow=''}

function setupChrome(){
  renderDrawer();$('#menuOpen').addEventListener('click',openDrawer);$('#menuClose').addEventListener('click',closeDrawer);drawer.addEventListener('click',e=>{if(e.target===drawer)closeDrawer()});
  $('#searchOpen').addEventListener('click',()=>{searchDialog.showModal();$('#searchInput').focus()});$('#searchInput').addEventListener('input',runSearch);
  $('#themeButton').addEventListener('click',()=>{state.theme=state.theme==='dark'?'light':'dark';saveState();applyPreferences()});$('#fontButton').addEventListener('click',()=>{state.font=(state.font+1)%3;saveState();applyPreferences()});
  $('#bookmarkButton').addEventListener('click',toggleBookmark);$('#noteToggle').addEventListener('click',()=>{notePanel.hidden=!notePanel.hidden;$('#noteToggle').setAttribute('aria-expanded',String(!notePanel.hidden));if(!notePanel.hidden)noteText.focus()});$('#saveNote').addEventListener('click',saveNote);$('#captureSelection').addEventListener('click',captureSelection);$('#exportButton').addEventListener('click',exportNotes);$('#printButton').addEventListener('click',()=>print());
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('#installButton').hidden=false});$('#installButton').addEventListener('click',async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$('#installButton').hidden=true});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer.classList.contains('open'))closeDrawer()});
}
function applyPreferences(){document.documentElement.dataset.theme=state.theme;document.documentElement.style.setProperty('--reader',[1,1.1,1.22][state.font]||1);$('meta[name="theme-color"]').content=state.theme==='dark'?'#06151d':'#eee6d6'}
function updateChrome(){const total=affirmations.length+1,done=state.completed.filter(x=>x==='scopro'||affirmations.some(a=>a.id===x)).length;$('#progressBar').style.width=`${Math.round(done/total*100)}%`;const marked=state.bookmarks.includes(currentRoute);$('#bookmarkButton').textContent=marked?'◆':'◇';$('#bookmarkButton').setAttribute('aria-label',marked?'Rimuovi questa pagina dai segnalibri':'Aggiungi questa pagina ai segnalibri');$('#noteCount').textContent=Object.keys(state.notes).length+Object.values(state.highlights).flat().length}
function toggleBookmark(){const i=state.bookmarks.indexOf(currentRoute);if(i>=0)state.bookmarks.splice(i,1);else state.bookmarks.push(currentRoute);saveState()}
function loadCurrentNote(){noteText.value=state.notes[currentRoute]||'';$('#noteStatus').textContent=''}
function saveNote(){const value=noteText.value.trim();if(value)state.notes[currentRoute]=value;else delete state.notes[currentRoute];saveState();$('#noteStatus').textContent='Nota salvata.'}
function captureSelection(){const text=getSelection()?.toString().trim();if(!text){$('#noteStatus').textContent='Seleziona prima una frase nella pagina.';return}state.highlights[currentRoute]??=[];if(!state.highlights[currentRoute].includes(text))state.highlights[currentRoute].push(text);saveState();$('#noteStatus').textContent='Selezione annotata.'}
function exportNotes(){let md='# Taccuino · San Tommaso d’Aquino\n\n';for(const [route,note] of Object.entries(state.notes))md+=`## ${route}\n\n${note}\n\n`;for(const [route,items] of Object.entries(state.highlights))md+=`## Evidenziazioni · ${route}\n\n${items.map(x=>`> ${x}`).join('\n\n')}\n\n`;md+=`## Sezioni completate\n\n${state.completed.map(x=>`- ${x}`).join('\n')}\n`;const blob=new Blob([md],{type:'text/markdown;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='appunti-san-tommaso.md';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}

function runSearch(){const q=$('#searchInput').value.trim().toLowerCase();const box=$('#searchResults');if(q.length<2){box.innerHTML='<p class="micro">Scrivi almeno due caratteri.</p>';return}const results=[];affirmations.forEach(a=>{if(`${a.title} ${a.question} ${a.short} ${a.keywords.join(' ')} ${a.body.replace(/<[^>]+>/g,' ')}`.toLowerCase().includes(q))results.push({title:a.title,type:'Lezione',route:`studio/${a.id}`,text:a.short})});glossary.forEach(g=>{if(`${g.term} ${g.brief} ${g.full}`.toLowerCase().includes(q))results.push({title:g.term,type:'Dizionario',route:'dizionario',text:g.brief})});works.forEach(w=>{if(`${w.title} ${w.description}`.toLowerCase().includes(q))results.push({title:w.title,type:'Opera',route:'biblioteca',text:w.description})});comparisons.forEach(c=>{if(`${c.name} ${c.problem} ${c.continuity} ${c.opposition}`.toLowerCase().includes(q))results.push({title:c.name,type:'Confronto',route:'confronti',text:c.problem})});comics.forEach(c=>{if(`${c.title} ${c.text}`.toLowerCase().includes(q))results.push({title:c.title,type:'Fumetto',route:'fumetti',text:c.text})});box.innerHTML=results.slice(0,30).map(r=>`<a class="search-result" href="#/${r.route}"><strong>${r.title}</strong><small>${r.type} · ${r.text.slice(0,130)}</small></a>`).join('')||'<p>Nessun risultato. Prova un concetto più ampio.</p>';$$('a',box).forEach(a=>a.addEventListener('click',()=>searchDialog.close()))}

setupChrome();applyPreferences();addEventListener('hashchange',render);render();
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).catch(error=>console.warn('Service worker non registrato',error)));
