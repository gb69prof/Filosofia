(()=>{
  const root=document.documentElement;
  const toast=document.querySelector('#toast')||document.body.appendChild(Object.assign(document.createElement('div'),{id:'toast',className:'toast'}));
  let timer;
  window.say=(text)=>{clearTimeout(timer);toast.textContent=text;toast.classList.add('show');timer=setTimeout(()=>toast.classList.remove('show'),2600)};
  document.querySelectorAll('[data-font]').forEach(b=>b.addEventListener('click',()=>{document.body.classList.toggle('large');localStorage.setItem('socrate-large',document.body.classList.contains('large')?'1':'0');say(document.body.classList.contains('large')?'Testo ingrandito':'Dimensione normale')}));
  if(localStorage.getItem('socrate-large')==='1')document.body.classList.add('large');
  document.querySelectorAll('[data-focus]').forEach(b=>b.addEventListener('click',()=>{document.body.classList.toggle('focus');say(document.body.classList.contains('focus')?'Concentrazione attiva':'Concentrazione disattivata')}));
  document.querySelectorAll('[data-note]').forEach(area=>{const key='socrate-note-'+area.dataset.note;area.value=localStorage.getItem(key)||'';area.addEventListener('input',()=>localStorage.setItem(key,area.value))});
  document.querySelectorAll('[data-save-note]').forEach(b=>b.addEventListener('click',()=>say('Appunti salvati su questo dispositivo')));
  document.querySelectorAll('[data-modal]').forEach(b=>b.addEventListener('click',()=>document.querySelector('#'+b.dataset.modal)?.classList.add('open')));
  document.querySelectorAll('.modal').forEach(m=>{m.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>m.classList.remove('open')));m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')})});
  addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'))});
  const commonScript=document.currentScript;
  if('serviceWorker'in navigator&&commonScript)addEventListener('load',()=>navigator.serviceWorker.register(new URL('./sw.js',commonScript.src),{updateViaCache:'none'}).catch(()=>{}));
})();
