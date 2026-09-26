'use strict';
(() => {
  const safeGet = key => {try {return sessionStorage.getItem(key);}catch{return null;}};
  const safeSet = (key,value) => {try {sessionStorage.setItem(key,value);}catch{}};
  const shuffle = (items,key) => {
    const out=[...items];
    for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
    const signature=a=>a.map(x=>x.id).join(',');
    if(out.length>1&&signature(out)===safeGet(key))out.push(out.shift());
    safeSet(key,signature(out)); return out;
  };
  const toc=document.querySelector('.toc');
  if(toc&&matchMedia('(max-width:700px)').matches)toc.open=false;
  let size=1.17;
  document.querySelectorAll('[data-font]').forEach(b=>b.addEventListener('click',()=>{
    size=Math.min(1.65,Math.max(1.0,size+Number(b.dataset.font)));
    document.documentElement.style.setProperty('--text-size',size+'rem');
  }));
  document.querySelector('[data-print]')?.addEventListener('click',()=>window.print());
  const offline=document.querySelector('[data-offline]');
  const offlineMessage=text=>{if(offline)offline.textContent=text;};
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(()=>navigator.serviceWorker.ready).then(()=>{
      offlineMessage(navigator.onLine?'Percorso disponibile anche offline su questo dispositivo.':'Sei offline: lezioni, mappe e test restano disponibili.');
    }).catch(()=>offlineMessage('Lettura disponibile; la copia offline non è ancora pronta.'));
  } else offlineMessage('La lettura funziona; questo browser non supporta la copia offline.');
  window.addEventListener('offline',()=>offlineMessage('Sei offline. I collegamenti agli altri percorsi richiedono una connessione.'));
  window.addEventListener('online',()=>offlineMessage('Connessione ripristinata.'));
  let installPrompt;
  const install=document.querySelector('[data-install]');
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;if(install)install.hidden=false;});
  install?.addEventListener('click',async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;install.hidden=true;}});
  const form=document.querySelector('#quiz-form');
  if(!form)return;
  const bank=JSON.parse(document.getElementById('question-bank').textContent);
  const mode=document.getElementById('quiz-mode');
  const host=document.getElementById('questions');
  const results=document.getElementById('results');
  let current=[];
  const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
  function start(){
    host.replaceChildren();results.replaceChildren();
    current=shuffle(bank.filter(q=>mode.value==='tutto'||q.group===mode.value),'schopenhauer-order-'+mode.value);
    current.forEach((q,i)=>{
      const field=el('fieldset');field.dataset.id=q.id;
      const legend=el('legend',`${i+1}. ${q.question}`);field.append(legend);
      shuffle(q.answers,'schopenhauer-answers-'+q.id).forEach(a=>{
        const label=el('label');const input=el('input');input.type='radio';input.name=q.id;input.value=a.id;
        label.append(input,el('span',a.text));field.append(label);
      });host.append(field);
    });
    document.getElementById('quiz-count').textContent=`${current.length} domande. Le risposte non vengono inviate né conservate.`;
    document.getElementById('correct').disabled=false;
  }
  mode.addEventListener('change',start);
  document.getElementById('restart').addEventListener('click',()=>{start();document.getElementById('quiz-heading').focus();});
  form.addEventListener('submit',e=>{
    e.preventDefault();let score=0,missing=0;const review=new Map();
    current.forEach(q=>{
      const field=host.querySelector(`[data-id="${q.id}"]`);
      const chosen=field.querySelector('input:checked');
      const correct=chosen?.value===q.correct;
      if(correct)score++;else {review.set(q.page,q.title);if(!chosen)missing++;}
      field.querySelector('.feedback')?.remove();
      field.querySelectorAll('label').forEach(l=>{l.classList.remove('right','wrong');const r=l.querySelector('input');r.disabled=true;if(r.value===q.correct)l.classList.add('right');else if(r.checked)l.classList.add('wrong');});
      const box=el('div',null,'feedback');
      box.append(el('p',correct?'Risposta corretta.':chosen?'Risposta da rivedere.':'Risposta non data.'));
      if(!correct)box.append(el('p','Risposta corretta: '+q.answers.find(a=>a.id===q.correct).text));
      box.append(el('p',q.feedback));const a=el('a','Ripassa: '+q.title);a.href=q.page;box.append(a);field.append(box);
    });
    results.replaceChildren(el('p',`${score} risposte corrette su ${current.length} · ${Math.round(score/current.length*100)}% · voto indicativo ${(score/current.length*10).toFixed(1).replace('.',',')}/10.${missing?' Non risposte: '+missing+'.':''}`));
    if(review.size){results.append(el('p','Per recuperare, riprendi questi nuclei e poi genera un nuovo test:'));const ul=el('ul');review.forEach((title,url)=>{const li=el('li');const a=el('a',title);a.href=url;li.append(a);ul.append(li);});results.append(ul);}else results.append(el('p','Passa all’attività argomentativa del confronto finale per mettere in relazione gli autori.'));
    document.getElementById('correct').disabled=true;results.focus();results.scrollIntoView({block:'start'});
  });start();
})();
