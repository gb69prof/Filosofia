const sequence=window.ACADEMY_STAGES;
const storageKey='pa-visit-progress-v2';
const legacy=JSON.parse(localStorage.getItem('pa-visit-progress')||'{}');
const progress=JSON.parse(localStorage.getItem(storageKey)||'{}');
if(legacy.p1&&!progress.p1){progress.p1=true;localStorage.setItem(storageKey,JSON.stringify(progress))}
const viewport=document.querySelector('#mapViewport');
const stage=document.querySelector('#mapStage');
const dialog=document.querySelector('#infoDialog');
const toast=document.querySelector('#toast');
let scale=1;
let timer;

function url(id){return `./tappa/?id=${encodeURIComponent(id)}`}
function isUnlocked(index){return index===0||Boolean(progress[sequence[index-1].id])}
function say(text){clearTimeout(timer);toast.textContent=text;toast.classList.add('show');timer=setTimeout(()=>toast.classList.remove('show'),2700)}
function setScale(next){scale=Math.max(.45,Math.min(1.3,next));stage.style.transform=`scale(${scale})`;stage.style.marginBottom=`${1024*(scale-1)}px`;stage.style.marginRight=`${1536*(scale-1)}px`}
function fit(){const next=Math.min(viewport.clientWidth/1536,(viewport.clientHeight||900)/1024,1);setScale(Math.max(.45,next));viewport.scrollTo({left:0,top:0,behavior:'smooth'})}
function openDialog(eye,title,text,items=[]){
 document.querySelector('#dialogEye').textContent=eye;
 document.querySelector('#dialogTitle').textContent=title;
 document.querySelector('#dialogText').textContent=text;
 document.querySelector('#dialogList').innerHTML=items.map(item=>item.url?`<a href="${item.url}"><strong>${item.title}</strong>${item.note?`<small>${item.note}</small>`:''}</a>`:`<div><strong>${item.title}</strong>${item.note?`<small>${item.note}</small>`:''}</div>`).join('');
 dialog.showModal();
}
function mapComplete(){openDialog('Mappa completa','Tutte le tappe','Qui puoi entrare direttamente in qualunque ambiente. Il percorso consigliato resta progressivo, ma la mappa completa è utile per il ripasso e per il lavoro in classe.',sequence.map(item=>({title:`${item.branch==='platone'?'P':'A'}${item.n} · ${item.title}`,note:item.subtitle,url:url(item.id)})))}
function progressDialog(){
 const done=sequence.filter(item=>progress[item.id]);
 const next=sequence.find((item,index)=>!progress[item.id]&&isUnlocked(index));
 const items=done.map(item=>({title:`✓ ${item.title}`,note:item.branch==='platone'?'Accademia':'Liceo',url:url(item.id)}));
 if(next)items.push({title:`Continua: ${next.title}`,note:next.subtitle,url:url(next.id)});
 openDialog('Le mie tappe',done.length?`${done.length} tappe illuminate`:'Il cammino deve ancora iniziare',done.length?'Puoi rivedere una tappa completata oppure riprendere dalla prima ancora aperta.':'Inizia dal Giardino di Socrate. Ogni completamento apre la tappa successiva.',items);
}
function help(){openDialog('Come funziona','Un luogo, non un indice','Ogni tappa apre una scena esplorabile. I punti luminosi su personaggi, oggetti e azioni conducono alle spiegazioni e alle sezioni della PWA. Completa una tappa per illuminare il sentiero.',[
 {title:'Osserva',note:'Prima guarda la scena nel suo insieme.'},{title:'Esplora',note:'Tocca i punti luminosi.'},{title:'Approfondisci',note:'Apri Studio, Biblioteca, Atlante e Laboratorio.'},{title:'Completa',note:'Salva il cammino e prosegui.'}
 ])}
function resume(){const index=sequence.findIndex(item=>!progress[item.id]);location.href=url(index<0?sequence[sequence.length-1].id:sequence[index].id)}

function render(){
 const completed=sequence.filter(item=>progress[item.id]).length;
 document.querySelector('#summaryValue').textContent=`${completed} / ${sequence.length}`;
 document.querySelectorAll('[data-stage]').forEach(button=>{
  const index=sequence.findIndex(item=>item.id===button.dataset.stage);
  button.classList.remove('completed','unlocked','locked');
  if(progress[button.dataset.stage])button.classList.add('completed');else if(isUnlocked(index))button.classList.add('unlocked');else button.classList.add('locked');
  button.addEventListener('click',()=>{if(isUnlocked(index)||progress[button.dataset.stage])location.href=url(button.dataset.stage);else say(`Completa prima “${sequence[index-1].title}”.`)})
 });
 for(const branch of ['platone','aristotele']){
  const target=document.querySelector(branch==='platone'?'#routePlatone':'#routeAristotele');
  target.innerHTML=sequence.filter(item=>item.branch===branch).map(item=>{
   const index=sequence.indexOf(item);const done=Boolean(progress[item.id]);const unlocked=isUnlocked(index);
   return `<button class="routeCard ${done?'done':unlocked?'open':'locked'}" data-route="${item.id}"><b>${item.n}</b><span><strong>${item.title}</strong><small>${item.subtitle}</small></span><em>${done?'Completata':unlocked?'Apri':'Bloccata'}</em></button>`
  }).join('');
 }
 document.querySelectorAll('[data-route]').forEach(button=>button.addEventListener('click',()=>{const index=sequence.findIndex(item=>item.id===button.dataset.route);if(isUnlocked(index)||progress[button.dataset.route])location.href=url(button.dataset.route);else say(`Completa prima “${sequence[index-1].title}”.`)}));
}

document.querySelector('#zoomIn').addEventListener('click',()=>setScale(scale+.1));
document.querySelector('#zoomOut').addEventListener('click',()=>setScale(scale-.1));
document.querySelector('#fitMap').addEventListener('click',fit);
document.querySelector('#helpBtn').addEventListener('click',help);
document.querySelector('#progressBtn').addEventListener('click',progressDialog);
document.querySelector('#allBtn').addEventListener('click',mapComplete);
document.querySelectorAll('[data-map-action]').forEach(button=>button.addEventListener('click',()=>({help,progress:progressDialog,all:mapComplete,resume}[button.dataset.mapAction]||(()=>{}))()));
document.querySelectorAll('[data-info]').forEach(button=>button.addEventListener('click',()=>{
 if(button.dataset.info==='neo')openDialog('La via della contemplazione','Il platonismo continua','Non è una linea immobile: l’eredità platonica cambia linguaggio, problemi e rapporto con la religione.',[
  {title:'Speusippo',note:'Il primo successore nell’Accademia.'},{title:'Senocrate',note:'Principi, anima e ordine del cosmo.'},{title:'Accademia media e nuova',note:'La svolta scettica.'},{title:'Medioplatonismo',note:'Il ritorno alle dottrine di Platone.'},{title:'Plotino',note:'L’Uno e il ritorno dell’anima.'},{title:'Porfirio e Proclo',note:'Sistema, commento e trasmissione.'},{title:'Agostino',note:'Il platonismo incontra il cristianesimo.'}
 ]);else openDialog('E oggi?','Le domande arrivano fino a noi','Le filosofie antiche non forniscono risposte automatiche, ma rendono più precise le domande del presente.',[
  {title:'Intelligenza artificiale',note:'Può una macchina giudicare?',url:'../laboratorio/#ai-giudica'},{title:'Democrazia e potere',note:'Esperti o maggioranza?',url:'../laboratorio/#esperti-maggioranza'},{title:'Scienza e ambiente',note:'Che cosa intendiamo per natura?',url:'../confronti/#natura'},{title:'Tecnologia e umanità',note:'Un seme e una macchina.',url:'../laboratorio/#seme-macchina'},{title:'Etica e responsabilità',note:'Una regola ingiusta va rispettata?',url:'../laboratorio/#legge-ingiusta'},{title:'Linguaggio e comunicazione',note:'Convincere senza avere ragione.',url:'../laboratorio/#parola-che-convince'}
 ])
}));
document.querySelector('.dialogClose').addEventListener('click',()=>dialog.close());
const mapImage=stage.querySelector('img');
mapImage.addEventListener('load',()=>setTimeout(fit,40),{once:true});
mapImage.addEventListener('error',()=>say('La mappa non è stata caricata. Ricarica la pagina una volta.'),{once:true});
addEventListener('resize',()=>{if(innerWidth<820)fit()});
render();
if(mapImage.complete&&mapImage.naturalWidth)setTimeout(fit,40);
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('../sw.js',{updateViaCache:'none'}));
