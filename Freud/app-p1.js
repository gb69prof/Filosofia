(() => {
  'use strict';
  const D = window.FREUD_DATA;
  if (!D) throw new Error('FREUD_DATA non disponibile');
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const STORAGE = 'freud-pwa-state-v1';
  const defaults = {mode:'amateur',completed:[],notes:'',font:1,discovery:0,dreamCase:0,symptomCase:0,interpCase:0,dreamDone:[],symptomDone:[],interpDone:[],quiz:{}};
  let state = loadState();
  let activeMap = D.maps[0].id;
  let deferredInstall = null;
  let lastFocus = null;
  let symptomSequence = [];

  function loadState(){
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE) || '{}');
      return {...defaults,...parsed,quiz:{...defaults.quiz,...(parsed.quiz||{})}};
    } catch (_) { return {...defaults}; }
  }
  function saveState(){ try { localStorage.setItem(STORAGE, JSON.stringify(state)); } catch (_) {} }
  function toast(message){
    const node=$('#toast'); node.textContent=message; node.classList.add('show');
    clearTimeout(toast.timer); toast.timer=setTimeout(()=>node.classList.remove('show'),2200);
  }
  function showDialog(html, focusSelector){
    const dialog=$('#contentDialog'); $('#dialogContent').innerHTML=html; lastFocus=document.activeElement;
    if(dialog.open) dialog.close(); dialog.showModal();
    requestAnimationFrame(()=> (focusSelector ? $(focusSelector,dialog) : $('#dialogClose'))?.focus());
  }
  function closeDialog(dialog=$('#contentDialog')){ if(dialog.open) dialog.close(); lastFocus?.focus?.(); }

  function renderDiscovery(){
    const i=Math.max(0,Math.min(state.discovery,D.discovery.length-1)),item=D.discovery[i];
    $('#discovery').innerHTML=`
      <div class="discovery-head"><span class="discovery-kicker">Passaggio ${i+1} di ${D.discovery.length}</span><h3>${esc(item.title)}</h3><p>${esc(item.scene)}</p></div>
      <div class="observation-grid">
        <div class="observation-card"><strong>Comportamento osservabile</strong>${esc(item.behavior)}</div>
        <div class="observation-card"><strong>Spiegazione dichiarata</strong>${esc(item.declared)}</div>
        <div class="observation-card"><strong>Elemento che resiste</strong>${esc(item.resistance)}</div>
        <div class="observation-card"><strong>Domanda</strong>${esc(item.question)}</div>
      </div>
      <div class="choice-list">${item.choices.map((c,n)=>`<button data-discovery-choice="${n}">${esc(c.label)}</button>`).join('')}</div>
      <div class="discovery-result" hidden></div>
      <div class="discovery-nav"><button data-discovery-nav="prev" ${i===0?'disabled':''}>← Prima</button><button data-discovery-nav="next" ${i===D.discovery.length-1?'disabled':''}>Dopo →</button></div>`;
    $$('[data-discovery-choice]',$('#discovery')).forEach(button=>button.addEventListener('click',()=>{
      const n=Number(button.dataset.discoveryChoice),result=$('.discovery-result',$('#discovery'));
      $$('[data-discovery-choice]',$('#discovery')).forEach(b=>b.classList.toggle('selected',b===button));
      result.hidden=false; result.textContent=item.choices[n].result;
    }));
    $$('[data-discovery-nav]',$('#discovery')).forEach(button=>button.addEventListener('click',()=>{
      state.discovery += button.dataset.discoveryNav==='next'?1:-1; saveState(); renderDiscovery();
    }));
  }

  function renderModules(){
    const grid=$('#moduleGrid');
    grid.innerHTML=D.modules.map(m=>{
      const c=m[state.mode],done=state.completed.includes(m.id);
      return `<article class="module-card ${done?'complete':''}" style="--module-color:${esc(m.color)}">
        <span class="module-number">${esc(m.num)} · ${esc(m.phase)}</span><h3>${esc(m.title)}</h3>
        <p class="question">${esc(m.question)}</p><p class="preview">${esc(c.lead)}</p>
        <div class="module-actions"><button data-open-module="${esc(m.id)}">Apri la tappa</button><label class="complete-toggle"><input type="checkbox" data-complete="${esc(m.id)}" ${done?'checked':''}> Completata</label></div>
      </article>`;
    }).join('');
    $$('[data-open-module]',grid).forEach(b=>b.addEventListener('click',()=>openModule(b.dataset.openModule)));
    $$('[data-complete]',grid).forEach(input=>input.addEventListener('change',()=>toggleComplete(input.dataset.complete,input.checked)));
    updateProgress();
  }
  function toggleComplete(id,done){
    state.completed=done?[...new Set([...state.completed,id])]:state.completed.filter(x=>x!==id); saveState(); updateProgress();
    const card=$(`[data-complete="${id}"]`)?.closest('.module-card'); card?.classList.toggle('complete',done);
  }
  function updateProgress(){
    const n=state.completed.filter(id=>D.modules.some(m=>m.id===id)).length,p=Math.round(n/D.modules.length*100);
    $('#progressLabel').textContent=`${n} di ${D.modules.length} tappe completate`; $('#progressPercent').textContent=`${p}%`; $('#progressBar').style.width=`${p}%`; $('#drawerProgress').textContent=`${p}%`;
  }
  function openModule(id){
    const m=D.modules.find(x=>x.id===id); if(!m)return; const c=m[state.mode],amateur=state.mode==='amateur';
    const core=amateur
      ? `<div class="dialog-section"><h3>Il passaggio</h3>${c.body.map(p=>`<p>${esc(p)}</p>`).join('')}</div><div class="dialog-section"><h3>Concetti essenziali</h3><ul>${c.points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul></div><div class="dialog-section"><h3>Esempio / esperimento mentale</h3><p>${esc(c.example)}</p><p><strong>Verso la tappa seguente:</strong> ${esc(c.bridge)}</p></div>`
      : `<div class="dialog-section"><h3>Analisi</h3>${c.body.map(p=>`<p>${esc(p)}</p>`).join('')}</div><div class="dialog-section"><h3>Lessico</h3><p>${c.terms.map(t=>`<span class="source-kind">${esc(t)}</span>`).join(' ')}</p></div><div class="dialog-section"><h3>Riferimento</h3><p>${esc(c.reference)}</p><p><strong>Avvertenza:</strong> ${esc(c.caution)}</p></div>`;
    const check=m.check;
    showDialog(`<p class="dialog-kicker">Tappa ${esc(m.num)} · ${esc(m.phase)} · ${amateur?'Primo incontro':'Studio filosofico'}</p><h2 class="dialog-title">${esc(m.title)}</h2><p class="dialog-lead">${esc(m.question)}</p><p>${esc(c.lead)}</p>${core}<div class="caution-box"><strong>Equivoco da evitare</strong><br>${esc(m.misconception)}</div><div class="work-box"><strong>Opera / confronto</strong><br>${esc(m.work)}</div><div class="dialog-sect