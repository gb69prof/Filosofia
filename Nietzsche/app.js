(() => {
  'use strict';
  const D = window.NIETZSCHE_DATA;
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const STORAGE = 'nietzsche-pwa-state-v1';
  const defaultState = {mode:'amateur',completed:[],notes:'',font:1,discovery:0,genealogy:0,recurrence:0,reflections:{},quiz:{}};
  let state = loadState();
  let deferredInstall = null;
  let activeMap = D.maps[0].id;
  let lastFocus = null;

  function loadState(){
    try { return {...defaultState,...JSON.parse(localStorage.getItem(STORAGE) || '{}')}; }
    catch (_) { return {...defaultState}; }
  }
  function saveState(){
    try { localStorage.setItem(STORAGE, JSON.stringify(state)); } catch (_) {}
  }
  function toast(message){
    const node = $('#toast'); node.textContent = message; node.classList.add('show');
    clearTimeout(toast.timer); toast.timer = setTimeout(() => node.classList.remove('show'), 2300);
  }
  function showDialog(html, focusSelector){
    const dialog = $('#contentDialog'); $('#dialogContent').innerHTML = html;
    lastFocus = document.activeElement;
    if (dialog.open) dialog.close();
    dialog.showModal();
    requestAnimationFrame(() => (focusSelector ? $(focusSelector,dialog) : $('#dialogClose'))?.focus());
  }
  function closeDialog(dialog=$('#contentDialog')){
    if (dialog.open) dialog.close();
    lastFocus?.focus?.();
  }

  function renderModules(){
    const grid = $('#moduleGrid');
    grid.innerHTML = D.modules.map(module => {
      const content = module[state.mode];
      const done = state.completed.includes(module.id);
      return `<article class="module-card" style="--module-color:${module.color}">
        <span class="module-number">${module.num} · ${esc(module.phase)}</span>
        <h3>${esc(module.title)}</h3>
        <p class="question">${esc(module.question)}</p>
        <p class="preview">${esc(content.lead)}</p>
        <div class="module-actions">
          <button data-open-module="${module.id}">Apri la tappa</button>
          <label class="complete-toggle"><input type="checkbox" data-complete="${module.id}" ${done?'checked':''}> Completata</label>
        </div>
      </article>`;
    }).join('');
    $$('[data-open-module]',grid).forEach(button => button.addEventListener('click',() => openModule(button.dataset.openModule)));
    $$('[data-complete]',grid).forEach(input => input.addEventListener('change',() => toggleComplete(input.dataset.complete,input.checked)));
    updateProgress();
  }

  function openModule(id){
    const module = D.modules.find(item => item.id === id); if (!module) return;
    const content = module[state.mode];
    const details = state.mode === 'amateur'
      ? `<div class="dialog-section"><h3>Il passaggio</h3>${content.body.map(p=>`<p>${esc(p)}</p>`).join('')}</div>
         <div class="dialog-section"><h3>Nuclei da trattenere</h3><ul>${content.points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul></div>
         <div class="dialog-section"><h3>Un esempio</h3><p>${esc(content.example)}</p><p><strong>Verso la tappa seguente:</strong> ${esc(content.bridge)}</p></div>`
      : `<div class="dialog-section"><h3>Analisi</h3>${content.body.map(p=>`<p>${esc(p)}</p>`).join('')}</div>
         <div class="dialog-section"><h3>Lessico</h3><p>${content.terms.map(t=>`<span class="source-kind">${esc(t)}</span>`).join(' ')}</p></div>
         <div class="dialog-section"><h3>Riferimenti</h3><p>${esc(content.reference)}</p><p><strong>Avvertenza:</strong> ${esc(content.caution)}</p></div>`;
    const check = module.check;
    showDialog(`<p class="dialog-kicker">Tappa ${module.num} · ${esc(module.phase)} · ${state.mode==='amateur'?'Primo incontro':'Studio filosofico'}</p>
      <h2 class="dialog-title">${esc(module.title)}</h2><p class="dialog-lead">${esc(module.question)}</p><p>${esc(content.lead)}</p>${details}
      <div class="dialog-section module-check" data-module-check="${module.id}"><h3>Controllo rapido</h3><p>${esc(check.q)}</p>
        <div class="quiz-options">${check.options.map((option,index)=>`<label><input type="radio" name="module-${module.id}" value="${index}"> ${esc(option)}</label>`).join('')}</div>
        <p class="quiz-explanation" hidden></p></div>`, `[name="module-${module.id}"]`);
    $$(`[name="module-${module.id}"]`,$('#contentDialog')).forEach(input => input.addEventListener('change',() => {
      const box = input.closest('.module-check'); const result = $('.quiz-explanation',box); const correct = Number(input.value)===check.answer;
      result.hidden=false; result.textContent=(correct?'Esatto. ':'Non ancora. ')+check.why;
      if (correct && !state.completed.includes(module.id)) { toggleComplete(module.id,true); renderModules(); toast('Tappa segnata come completata'); }
    }));
  }

  function toggleComplete(id,done){
    state.completed = done ? [...new Set([...state.completed,id])] : state.completed.filter(item=>item!==id);
    saveState(); updateProgress();
  }
  function updateProgress(){
    const percent = Math.round((state.completed.length/D.modules.length)*100);
    $('#progressLabel').textContent=`${state.completed.length} di ${D.modules.length} tappe completate`;
    $('#progressPercent').textContent=`${percent}%`; $('#progressBar').style.width=`${percent}%`; $('#drawerProgress').textContent=`${percent}%`;
  }

  function renderDiscovery(){
    const item=D.discovery[state.discovery];
    $('#discovery').innerHTML=`<div class="discovery-head"><span class="discovery-kicker">Passaggio ${state.discovery+1} di ${D.discovery.length}</span><h3>${esc(item.title)}</h3><p>${esc(item.scene)}</p><strong>${esc(item.question)}</strong></div>
      <div class="choice-list">${item.choices.map((choice,index)=>`<button data-discovery-choice="${index}">${esc(choice.label)}</button>`).join('')}</div>
      <div class="discovery-result" hidden></div>
      <div class="discovery-nav"><button data-discovery-nav="prev" ${state.discovery===0?'disabled':''}>← Prima</button><button data-discovery-nav="next" ${state.discovery===D.discovery.length-1?'disabled':''}>Dopo →</button></div>`;
    $$('[data-discovery-choice]',$('#discovery')).forEach(button=>button.addEventListener('click',()=>{
      const result=$('.discovery-result',$('#discovery')); result.hidden=false; result.textContent=item.choices[Number(button.dataset.discoveryChoice)].result;
      $$('[data-discovery-choice]',$('#discovery')).forEach(b=>b.disabled=true);
    }));
    $$('[data-discovery-nav]',$('#discovery')).forEach(button=>button.addEventListener('click',()=>{
      state.discovery += button.dataset.discoveryNav==='next'?1:-1; saveState(); renderDiscovery();
    }));
  }

  function renderGenealogy(){
    const index=Math.min(state.genealogy,D.genealogyCases.length-1), item=D.genealogyCases[index];
    $('#genealogyLab').innerHTML=`<div class="lab-meter"><span>Caso ${index+1} di ${D.genealogyCases.length}</span><strong>Origine ≠ verdetto</strong></div>
      <h3>${esc(item.title)}</h3><p class="lab-scene">${esc(item.scene)}</p><p>Quali lenti useresti prima di giudicare? Selezionane almeno due.</p>
      <div class="genealogy-grid">${item.lenses.map((lens,i)=>`<button data-lens="${i}">${esc(lens)}</button>`).join('')}</div>
      <p class="lab-reveal" hidden>${esc(item.reveal)}</p>
      <div class="discovery-nav"><button data-genealogy="prev" ${index===0?'disabled':''}>← Caso prima</button><button data-genealogy="reveal">Ricostruisci</button><button data-genealogy="next" ${index===D.genealogyCases.length-1?'disabled':''}>Caso dopo →</button></div>`;
    $$('[data-lens]',$('#genealogyLab')).forEach(button=>button.addEventListener('click',()=>button.classList.toggle('selected')));
    $$('[data-genealogy]',$('#genealogyLab')).forEach(button=>button.addEventListener('click',()=>{
      const action=button.dataset.genealogy;
      if(action==='reveal'){
        if($$('.selected',$('#genealogyLab')).length<2){toast('Scegli almeno due lenti genealogiche');return;}
        $('.lab-reveal',$('#genealogyLab')).hidden=false;
      } else { state.genealogy += action==='next'?1:-1; saveState(); renderGenealogy(); }
    }));
  }

  function renderRecurrence(){
    const index=Math.min(state.recurrence,D.recurrenceCases.length-1),item=D.recurrenceCases[index],saved=state.reflections[index]||'';
    $('#recurrenceLab').innerHTML=`<div class="lab-meter"><span>Esperimento ${index+1} di ${D.recurrenceCases.length}</span><strong>Nessun punteggio</strong></div>
      <h3>${esc(item.title)}</h3><p class="lab-scene">${esc(item.scene)}</p><p><strong>${esc(item.prompt)}</strong></p>
      <div class="recurrence-options"><button data-reaction="peso">Lo sento come peso</button><button data-reaction="prova">Lo assumo come prova</button><button data-reaction="resisto">Resisto alla domanda</button></div>
      <textarea class="reflection-box" aria-label="Riflessione sull’eterno ritorno" placeholder="Argomenta: che cosa includerebbe davvero il tuo sì?">${esc(saved)}</textarea>
      <p class="lab-reveal" hidden>La reazione non è una diagnosi del tuo carattere. Serve a mostrare quale parte della vita tendi a espellere dalla valutazione: passato, conseguenze, dolore o quotidiano.</p>
      <div class="discovery-nav"><button data-recurrence="prev" ${index===0?'disabled':''}>← Prima</button><button data-recurrence="save">Salva riflessione</button><button data-recurrence="next" ${index===D.recurrenceCases.length-1?'disabled':''}>Dopo →</button></div>`;
    $$('[data-reaction]',$('#recurrenceLab')).forEach(button=>button.addEventListener('click',()=>{$('.lab-reveal',$('#recurrenceLab')).hidden=false;$$('[data-reaction]',$('#recurrenceLab')).forEach(b=>b.classList.toggle('selected',b===button));}));
    $$('[data-recurrence]',$('#recurrenceLab')).forEach(button=>button.addEventListener('click',()=>{
      const action=button.dataset.recurrence, value=$('.reflection-box',$('#recurrenceLab')).value;
      state.reflections[index]=value;
      if(action==='save'){saveState();toast('Riflessione salvata sul dispositivo');return;}
      state.recurrence += action==='next'?1:-1; saveState(); renderRecurrence();
    }));
  }

  function setupLabs(){
    renderGenealogy();renderRecurrence();
    $$('[data-lab-tab]').forEach(button=>button.addEventListener('click',()=>{
      $$('[data-lab-tab]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});
      $('#genealogyLab').hidden=button.dataset.labTab!=='genealogy'; $('#recurrenceLab').hidden=button.dataset.labTab!=='recurrence';
    }));
  }

  function renderSources(){
    $('#sourceGrid').innerHTML=D.sources.map(source=>`<article class="source-card"><span class="source-kind">${esc(source.kind)}</span><h3>${esc(source.title)}</h3><p>${esc(source.text)}</p><p class="source-ref">${esc(source.ref)}</p></article>`).join('');
  }
  function renderComics(){
    $('#comicStrip').innerHTML=D.comics.map(scene=>`<article class="comic-card"><span class="comic-year">${esc(scene.year)}</span><span class="comic-icon" aria-hidden="true">${esc(scene.icon)}</span><h3>${esc(scene.title)}</h3><p>${esc(scene.text)}</p><span class="comic-status">${esc(scene.status)}</span></article>`).join('');
  }
  function renderMaps(){
    $('#mapTabs').innerHTML=D.maps.map(map=>`<button role="tab" data-map="${map.id}" aria-selected="${map.id===activeMap}">${esc(map.title)}</button>`).join('');
    $$('[data-map]',$('#mapTabs')).forEach(button=>button.addEventListener('click',()=>{activeMap=button.dataset.map;renderMaps();}));
    const map=D.maps.find(item=>item.id===activeMap);
    $('#conceptMap').innerHTML=`<h3>${esc(map.title)}</h3><p>${esc(map.intro)}</p><div class="map-nodes">${map.nodes.map(node=>`<div class="map-node"><strong>${esc(node.title)}</strong><span>${esc(node.text)}</span></div>`).join('')}</div>`;
    $$('[data-map]',$('#mapTabs')).forEach(button=>button.classList.toggle('active',button.dataset.map===activeMap));
  }

  function openTool(tool){
    const renderers={
      glossary:()=>`<p class="dialog-kicker">Dizionario · ${D.glossary.length} termini</p><h2 class="dialog-title">Parole da non ridurre a slogan</h2>${D.glossary.map(([term,text])=>`<div class="term-row"><strong>${esc(term)}</strong><span>${esc(text)}</span></div>`).join('')}`,
      timeline:()=>`<p class="dialog-kicker">Linea del tempo</p><h2 class="dialog-title">Vita, opere, fratture</h2>${D.timeline.map(([year,text])=>`<div class="timeline-row"><strong>${esc(year)}</strong><span>${esc(text)}</span></div>`).join('')}`,
      library:()=>`<p class="dialog-kicker">Biblioteca ragionata</p><h2 class="dialog-title">Le opere e il loro statuto</h2>${D.library.map(([year,title,text])=>`<div class="library-row"><strong>${esc(year)}</strong><span><b>${esc(title)}</b><br>${esc(text)}</span></div>`).join('')}`,
      comparisons:()=>`<p class="dialog-kicker">Confronti</p><h2 class="dialog-title">Interlocutori e trasformazioni</h2>${D.comparisons.map(([name,text])=>`<div class="compare-row"><strong>${esc(name)}</strong><span>${esc(text)}</span></div>`).join('')}`,
      academics:()=>`<p class="dialog-kicker">Fonti accademiche</p><h2 class="dialog-title">Università e university press</h2><p>Sono state aperte e controllate per verificare la lezione. Le opere di Nietzsche sono indicate con titolo e sezione nelle singole tappe.</p>${D.academics.map(item=>`<div class="academic-row"><a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.title)} ↗</a><span><b>${esc(item.institution)}</b><br>${esc(item.use)}</span></div>`).join('')}`,
      quiz:()=>renderQuiz()
    };
    if(renderers[tool]){showDialog(renderers[tool]()); if(tool==='quiz') setupQuiz();}
  }

  function renderQuiz(){
    return `<p class="dialog-kicker">Verifica finale · 12 domande</p><h2 class="dialog-title">Ricostruisci i passaggi</h2><p>Ogni alternativa riceve una spiegazione. Gli errori generano un percorso di recupero, non un’etichetta.</p>
      <form id="quizForm">${D.quiz.map((item,q)=>`<fieldset class="quiz-question"><legend><strong>${q+1}. ${esc(item.q)}</strong></legend><div class="quiz-options">${item.options.map((option,i)=>`<label><input type="radio" name="q${q}" value="${i}" ${String(state.quiz[q])===String(i)?'checked':''}> ${esc(option)}</label>`).join('')}</div><div class="quiz-explanation" data-quiz-explain="${q}" hidden></div></fieldset>`).join('')}
      <button class="primary-button" type="submit">Correggi e costruisci il recupero</button><div id="quizResult"></div></form>`;
  }
  function setupQuiz(){
    const form=$('#quizForm'); if(!form)return;
    form.addEventListener('change',event=>{if(event.target.matches('input[type="radio"]')){const q=Number(event.target.name.slice(1));state.quiz[q]=Number(event.target.value);saveState();}});
    form.addEventListener('submit',event=>{
      event.preventDefault();let score=0;const recovery=[];
      D.quiz.forEach((item,q)=>{
        const selected=Number(state.quiz[q]);const box=$(`[data-quiz-explain="${q}"]`,form);box.hidden=false;
        if(Number.isInteger(selected)){box.textContent=item.explain[selected];if(selected===item.answer)score++;else recovery.push(item.module);}else{box.textContent='Risposta non selezionata: torna alla domanda e prova a ricostruire il passaggio.';recovery.push(item.module);}
      });
      const unique=[...new Set(recovery)],titles=unique.map(id=>D.modules.find(m=>m.id===id)?.title).filter(Boolean);
      $('#quizResult').innerHTML=`<div class="quiz-result"><h3>${score} risposte corrette su ${D.quiz.length}</h3>${titles.length?`<p><strong>Recupero mirato:</strong> riapri ${titles.map(esc).join(', ')}. Non limitarti alla risposta: ricostruisci il nesso indicato dalla spiegazione.</p>`:'<p>Hai ricostruito tutti i passaggi. Prova ora a formulare un’obiezione alla conclusione della PWA.</p>'}</div>`;
      $('#quizResult').scrollIntoView({behavior:'smooth',block:'center'});
    });
  }

  function buildSearchIndex(){
    const items=[];
    D.modules.forEach(m=>items.push({kind:'Tappa',title:m.title,text:[m.question,m.amateur.lead,...m.amateur.body,m.student.lead,...m.student.body,m.student.terms.join(' ')].join(' '),action:()=>openModule(m.id)}));
    D.glossary.forEach(([title,text])=>items.push({kind:'Dizionario',title,text,action:()=>openTool('glossary')}));
    D.sources.forEach(s=>items.push({kind:s.kind,title:s.title,text:s.text+' '+s.ref,action:()=>document.querySelector('#fonti').scrollIntoView()}));
    return items;
  }
  const searchIndex=buildSearchIndex();
  function runSearch(query){
    const target=$('#searchResults');const term=query.trim().toLocaleLowerCase('it');
    if(term.length<2){target.innerHTML='<p>Scrivi almeno due caratteri.</p>';return;}
    const results=searchIndex.filter(item=>(item.title+' '+item.text).toLocaleLowerCase('it').includes(term)).slice(0,20);
    target.innerHTML=results.length?results.map((item,i)=>`<article class="search-result"><small>${esc(item.kind)}</small><br><button data-search-result="${i}">${esc(item.title)}</button><p>${esc(item.text.slice(0,180))}${item.text.length>180?'…':''}</p></article>`).join(''):'<p>Nessun risultato. Prova una parola più generale.</p>';
    $$('[data-search-result]',target).forEach((button,i)=>button.addEventListener('click',()=>{const result=results[i];$('#searchDialog').close();result.action();}));
  }

  function setupPanels(){
    const drawer=$('#drawer'),notes=$('#notesPanel');
    const nav=[['Copertina','#home'],['Scopro','#scopro'],['Studio','#studio'],['Laboratori','#laboratorio'],['Approfondisco','#fonti'],['A fumetti','#fumetti'],['Mappe','#mappe'],['Strumenti','#strumenti']];
    $('#drawerNav').innerHTML=nav.map(([label,href])=>`<a href="${href}">${label}</a>`).join('');
    const openDrawer=()=>{drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');document.body.classList.add('panel-open');$('#menuButton').setAttribute('aria-expanded','true');$('#drawerClose').focus();};
    const closeDrawer=()=>{drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');document.body.classList.remove('panel-open');$('#menuButton').setAttribute('aria-expanded','false');};
    $('#menuButton').addEventListener('click',openDrawer);$('#indexButton').addEventListener('click',openDrawer);$('#drawerClose').addEventListener('click',closeDrawer);$('[data-close="drawer"]').addEventListener('click',closeDrawer);$$('#drawerNav a').forEach(a=>a.addEventListener('click',closeDrawer));
    $('#notesArea').value=state.notes;let noteTimer;
    $('#notesArea').addEventListener('input',event=>{clearTimeout(noteTimer);$('#notesStatus').textContent='Modifiche non salvate';noteTimer=setTimeout(()=>{state.notes=event.target.value;saveState();$('#notesStatus').textContent='Salvato sul dispositivo';},500);});
    $('#notesButton').addEventListener('click',()=>{notes.classList.add('open');notes.setAttribute('aria-hidden','false');document.body.classList.add('panel-open');$('#notesArea').focus();});
    $('#notesClose').addEventListener('click',()=>{notes.classList.remove('open');notes.setAttribute('aria-hidden','true');document.body.classList.remove('panel-open');$('#notesButton').focus();});
    $('#exportNotes').addEventListener('click',()=>{state.notes=$('#notesArea').value;saveState();const blob=new Blob([`Taccuino — Nietzsche\n\n${state.notes}`],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='taccuino-nietzsche.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);toast('Taccuino esportato');});
  }

  function setupSearch(){
    const dialog=$('#searchDialog'),input=$('#searchInput');
    $('#searchButton').addEventListener('click',()=>{dialog.showModal();input.value='';$('#searchResults').innerHTML='<p>Cerca opere, concetti, persone o problemi.</p>';setTimeout(()=>input.focus(),0);});
    $('#searchClose').addEventListener('click',()=>dialog.close());input.addEventListener('input',()=>runSearch(input.value));
  }

  function setupControls(){
    $$('[data-mode]').forEach(button=>button.addEventListener('click',()=>{state.mode=button.dataset.mode;saveState();$$('[data-mode]').forEach(b=>b.classList.toggle('active',b===button));$('#modeDescription').textContent=state.mode==='amateur'?'Spiegazioni chiare, esempi concreti e domande per entrare nel problema.':'Lessico specifico, testi, controversie e avvertenze contro i fraintendimenti.';renderModules();}));
    $$('[data-mode]').forEach(button=>button.classList.toggle('active',button.dataset.mode===state.mode));
    $('#modeDescription').textContent=state.mode==='amateur'?'Spiegazioni chiare, esempi concreti e domande per entrare nel problema.':'Lessico specifico, testi, controversie e avvertenze contro i fraintendimenti.';
    document.documentElement.style.setProperty('--font-scale',state.font);
    $('#fontButton').addEventListener('click',()=>{state.font=state.font>=1.18?0.94:Number((state.font+.08).toFixed(2));document.documentElement.style.setProperty('--font-scale',state.font);saveState();toast(`Dimensione testo ${Math.round(state.font*100)}%`);});
    $$('[data-hotspot]').forEach(button=>button.addEventListener('click',()=>{const item=D.hotspots[button.dataset.hotspot];showDialog(`<p class="dialog-kicker">${esc(item.kicker)}</p><h2 class="dialog-title">${esc(item.title)}</h2><p class="dialog-lead">${esc(item.text)}</p>`);}));
    $$('[data-tool]').forEach(button=>button.addEventListener('click',()=>openTool(button.dataset.tool)));
    $('#dialogClose').addEventListener('click',()=>closeDialog());
    document.addEventListener('keydown',event=>{if(event.key==='Escape'){if($('#drawer').classList.contains('open'))$('#drawerClose').click();if($('#notesPanel').classList.contains('open'))$('#notesClose').click();}});
  }

  function setupInstall(){
    window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstall=event;});
    $('#installButton').addEventListener('click',async()=>{if(!deferredInstall){toast('Usa “Aggiungi a Home” o “Installa app” dal menu del browser');return;}deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;});
    if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>toast('Modalità offline non disponibile in questo contesto')));
  }

  renderDiscovery();renderModules();setupLabs();renderSources();renderComics();renderMaps();setupPanels();setupSearch();setupControls();setupInstall();
})();
