const sequence=window.ACADEMY_STAGES;
const params=new URLSearchParams(location.search);
const requested=params.get('id')||'p1';
const stage=sequence.find(item=>item.id===requested)||sequence[0];
const stageIndex=sequence.indexOf(stage);
const storageKey='pa-visit-progress-v2';
const legacy=JSON.parse(localStorage.getItem('pa-visit-progress')||'{}');
const progress=JSON.parse(localStorage.getItem(storageKey)||'{}');
if(legacy.p1&&!progress.p1){progress.p1=true;localStorage.setItem(storageKey,JSON.stringify(progress))}

const viewport=document.querySelector('#sceneViewport');
const scene=document.querySelector('#sceneStage');
const cardDialog=document.querySelector('#cardDialog');
const helpDialog=document.querySelector('#helpDialog');
const toast=document.querySelector('#toast');
let scale=1;
let toastTimer;

function stageUrl(id){return `./?id=${encodeURIComponent(id)}`}
function isUnlocked(index){return index===0||Boolean(progress[sequence[index-1].id])}
function say(text){clearTimeout(toastTimer);toast.textContent=text;toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),2700)}
function setScale(next){scale=Math.max(.45,Math.min(1.35,next));scene.style.transform=`scale(${scale})`;scene.style.marginBottom=`${1024*(scale-1)}px`;scene.style.marginRight=`${1536*(scale-1)}px`}
function fit(){const next=Math.min(viewport.clientWidth/1536,(viewport.clientHeight||900)/1024,1);setScale(Math.max(.45,next));viewport.scrollTo({left:0,top:0,behavior:'smooth'})}

function openCard(index){
 const card=stage.hotspots[index];
 if(!card)return;
 document.querySelector('#cardEye').textContent=card.kind;
 document.querySelector('#cardTitle').textContent=card.title;
 document.querySelector('#cardText').textContent=card.text;
 document.querySelector('#cardLinks').innerHTML=(card.links||[]).map(([label,url])=>`<a href="${url}"><span>${label}</span><span aria-hidden="true">→</span></a>`).join('');
 cardDialog.showModal();
}

function renderProgress(){
 const wrap=document.querySelector('#stageProgress');
 wrap.innerHTML=sequence.map((item,index)=>{
  const current=item.id===stage.id;
  const done=Boolean(progress[item.id]);
  const unlocked=isUnlocked(index);
  return `<a href="${stageUrl(item.id)}" class="${current?'current ':''}${done?'done ':''}${unlocked?'':'locked'}" data-index="${index}" aria-label="${item.branch==='platone'?'Platone':'Aristotele'} ${item.n}: ${item.title}" ${unlocked?'':'aria-disabled="true"'}>${item.branch==='platone'?'P':'A'}${item.n}</a>`
 }).join('');
 wrap.querySelectorAll('a.locked').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();say('Completa prima la tappa precedente.')}));
}

function render(){
 document.title=`${stage.title} · Visita all’Accademia`;
 document.querySelector('#stageTitle').textContent=`${stage.branch==='platone'?'P':'A'}${stage.n} · ${stage.title}`;
 document.querySelector('#stageSubtitle').textContent=stage.subtitle;
 document.querySelector('#stageBranch').textContent=stage.branch==='platone'?'L’Accademia di Platone':'Il Liceo di Aristotele';
 document.querySelector('#stageHeading').textContent=stage.title;
 document.querySelector('#stageLead').textContent=stage.subtitle;
 document.querySelector('#takeaway').textContent=stage.takeaway;
 const image=document.querySelector('#stageImage');
 image.src=`../assets/scenes/${stage.image}?v=30`;
 image.alt=stage.alt;
 const layer=document.querySelector('#hotspotLayer');
 layer.innerHTML=stage.hotspots.map((item,index)=>`<button class="hotMarker" style="--x:${item.x}%;--y:${item.y}%" data-card="${index}" aria-label="Esplora: ${item.label}"><span class="hotLabel">${item.label}</span></button>`).join('');
 layer.querySelectorAll('[data-card]').forEach(button=>button.addEventListener('click',()=>openCard(Number(button.dataset.card))));
 const mobile=document.querySelector('#mobileCardList');
 mobile.innerHTML=stage.hotspots.map((item,index)=>`<button data-card="${index}">${item.label}</button>`).join('');
 mobile.querySelectorAll('[data-card]').forEach(button=>button.addEventListener('click',()=>openCard(Number(button.dataset.card))));
 const complete=document.querySelector('#completeStop');
 if(progress[stage.id]){complete.textContent='Tappa completata ✓';complete.classList.add('done');document.querySelector('#completionText').textContent='Questa tappa è già illuminata. Puoi rivederla o proseguire.'}
 const prev=document.querySelector('#prevStage');
 const next=document.querySelector('#nextStage');
 if(stageIndex===0)prev.hidden=true;else{prev.href=stageUrl(sequence[stageIndex-1].id);prev.textContent=`← ${sequence[stageIndex-1].title}`}
 if(stageIndex===sequence.length-1){next.href='../';next.textContent='Torna alla mappa →'}else{next.href=stageUrl(sequence[stageIndex+1].id);next.textContent=`${sequence[stageIndex+1].title} →`;if(!progress[stage.id]){next.classList.add('locked');next.setAttribute('aria-disabled','true');next.addEventListener('click',event=>{event.preventDefault();say('Completa questa tappa per aprire la successiva.')})}}
 renderProgress();
}

document.querySelector('#zoomIn').addEventListener('click',()=>setScale(scale+.1));
document.querySelector('#zoomOut').addEventListener('click',()=>setScale(scale-.1));
document.querySelector('#fitScene').addEventListener('click',fit);
document.querySelector('#exploreHelp').addEventListener('click',()=>helpDialog.showModal());
document.querySelectorAll('.dialogClose').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
document.querySelector('#completeStop').addEventListener('click',()=>{
 progress[stage.id]=true;
 localStorage.setItem(storageKey,JSON.stringify(progress));
 const last=stageIndex===sequence.length-1;
 say(last?'Hai completato l’intero viaggio.':'Tappa completata: il sentiero prosegue.');
 setTimeout(()=>{if(last)location.href='../';else location.href=stageUrl(sequence[stageIndex+1].id)},900);
});
const image=document.querySelector('#stageImage');
image.addEventListener('load',()=>setTimeout(fit,40),{once:true});
image.addEventListener('error',()=>say('La scena non è stata caricata. Ricarica la pagina una volta.'),{once:true});
addEventListener('resize',()=>{if(innerWidth<900)fit()});
render();
if(image.complete&&image.naturalWidth)setTimeout(fit,40);
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('../../sw.js',{updateViaCache:'none'}));
