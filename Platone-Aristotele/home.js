const cover=document.querySelector('#cover');
const statusBox=document.querySelector('#status');
const fallback=document.querySelector('#fallback');
const drawer=document.querySelector('#drawer');
const drawerClose=document.querySelector('#drawerClose');
const modal=document.querySelector('#modal');
const modalEye=document.querySelector('#modalEye');
const modalTitle=document.querySelector('#modalTitle');
const modalText=document.querySelector('#modalText');
const modalClose=document.querySelector('#modalClose');
let triedFallback=false,finished=false;
function showCover(){finished=true;cover.classList.add('ready');statusBox.hidden=true;fallback.classList.remove('show')}
function coverError(){if(!triedFallback){triedFallback=true;cover.src=cover.dataset.fallback;return}finished=true;statusBox.hidden=true;fallback.classList.add('show')}
cover.addEventListener('load',showCover);
cover.addEventListener('error',coverError);
if(cover.complete){cover.naturalWidth?showCover():coverError()}
setTimeout(()=>{if(!finished){statusBox.hidden=true;fallback.classList.add('show')}},10000);
document.querySelectorAll('[data-menu]').forEach(button=>button.addEventListener('click',()=>drawer.classList.add('open')));
drawerClose.addEventListener('click',()=>drawer.classList.remove('open'));
drawer.addEventListener('click',event=>{if(event.target===drawer)drawer.classList.remove('open')});
const info={laboratorio:['Strumento','Laboratorio dei problemi','Casi, scelte, dibattiti e costruzione di argomenti.'],tempo:['Strumento','Linea del tempo','Biografie, opere e storia politica.'],biblioteca:['Strumento','Biblioteca delle opere','Dialoghi e trattati organizzati per opera e problema.'],accademia:['Esperienza','Visita l’Accademia','Una passeggiata narrativa nei luoghi della filosofia.']};
document.addEventListener('click',event=>{const key=event.target.closest('[data-section]')?.dataset.section;if(!key)return;drawer.classList.remove('open');if(key==='approfondisco'){location.href='./approfondisco/';return}if(key==='fumetti'){location.href='./fumetti/';return}if(key==='dizionario'){location.href='./dizionario/';return}if(key==='atlante'){location.href='./atlante/';return}if(key==='confronti'){location.href='./confronti/';return}const item=info[key];if(!item)return;modalEye.textContent=item[0];modalTitle.textContent=item[1];modalText.textContent=item[2];modal.showModal()});
modalClose.addEventListener('click',()=>modal.close());
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}));