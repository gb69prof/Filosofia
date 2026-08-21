ML=`<strong>${correct}/${D.quiz.length} · ${pct}%</strong><br>${miss.length?`Recupero mirato:<br>${miss.map(x=>`• ${esc(x)}`).join('<br>')}`:'Tutte le relazioni fondamentali sono state ricostruite correttamente.'}`;});
    $('#quizRetry')?.addEventListener('click',()=>{state.quiz={};saveState();openTool('quiz');});
    D.quiz.forEach((q,i)=>{if(state.quiz[i]!==undefined){const n=Number(state.quiz[i]),f=$('.quiz-feedback',$(`[data-quiz-q="${i}"]`,$('#contentDialog')));f.hidden=false;f.classList.toggle('error',n!==q.answer);f.textContent=q.options[n].feedback;}});
  }

  function openTool(tool){
    const renderers={
      glossary:()=>`<p class="dialog-kicker">Glossario · ${D.glossary.length} termini</p><h2 class="dialog-title">Parole da tenere distinte</h2>${D.glossary.map(([a,b])=>`<div class="term-row"><strong>${esc(a)}</strong><span>${esc(b)}</span></div>`).join('')}`,
      timeline:()=>`<p class="dialog-kicker">Cronologia</p><h2 class="dialog-title">Vita, opere, revisioni</h2>${D.timeline.map(([a,b])=>`<div class="timeline-row"><strong>${esc(a)}</strong><span>${esc(b)}</span></div>`).join('')}`,
      library:()=>`<p class="dialog-kicker">Biblioteca ragionata</p><h2 class="dialog-title">Le opere nel movimento della teoria</h2>${D.library.map(([y,t,x])=>`<div class="library-row"><strong>${esc(y)}</strong><span><b>${esc(t)}</b><br>${esc(x)}</span></div>`).join('')}`,
      comparisons:()=>`<p class="dialog-kicker">Confronti</p><h2 class="dialog-title">Il soggetto dopo la trasparenza</h2>${D.comparisons.map(([n,x])=>`<div class="compare-row"><strong>${esc(n)}</strong><span>${esc(x)}</span></div>`).join('')}`,
      academics:()=>`<p class="dialog-kicker">Fonti accademiche e istituzionali</p><h2 class="dialog-title">Controlla le fonti</h2><p>Ogni collegamento qui sotto è stato usato per costruire o verificare il percorso. Le fonti primarie, le ricostruzioni storiche e le valutazioni contemporanee restano distinte.</p>${D.academics.map(s=>`<div class="academic-row"><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a><span><b>${esc(s.institution)}</b><br>${esc(s.use)}</span></div>`).join('')}`,
      quiz:()=>renderQuiz()
    }; if(!renderers[tool])return; showDialog(renderers[tool]()); if(tool==='quiz')setupQuiz();
  }

  function setupPanels(){
    const drawer=$('#drawer'),notes=$('#notesPanel');
    const openDrawer=()=>{drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');document.body.classList.add('panel-open');$('#menuButton').setAttribute('aria-expanded','true');setTimeout(()=>$('#drawerClose').focus(),0);};
    const closeDrawer=()=>{drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');document.body.classList.remove('panel-open');$('#menuButton').setAttribute('aria-expanded','false');$('#menuButton').focus();};
    $('#menuButton').addEventListener('click',openDrawer);$('#indexButton').addEventListener('click',openDrawer);$('#drawerClose').addEventListener('click',closeDrawer);$('[data-close="drawer"]').addEventListener('click',closeDrawer);
    const nav=[['Copertina','#home'],['Scopro','#scopro'],['Studio','#studio'],['Laboratori','#laboratorio'],['Approfondisco','#fonti'],['A fumetti','#fumetti'],['Mappe','#mappe'],['Strumenti','#strumenti']];
    $('#drawerNav').innerHTML=nav.map(([a,b])=>`<a href="${b}"><span>${a}</span><span>→</span></a>`).join('');$$('a',$('#drawerNav')).forEach(a=>a.addEventListener('click',closeDrawer));
    const openNotes=()=>{notes.classList.add('open');notes.setAttribute('aria-hidden','false');document.body.classList.add('panel-open');$('#notesArea').value=state.notes;setTimeout(()=>$('#notesArea').focus(),0);};
    $('#notesButton').addEventListener('click',openNotes);$('#notesClose').addEventListener('click',()=>{state.notes=$('#notesArea').value;saveState();notes.classList.remove('open');notes.setAttribute('aria-hidden','true');document.body.classList.remove('panel-open');$('#notesButton').focus();});
    let noteTimer;$('#notesArea').addEventListener('input',()=>{clearTimeout(noteTimer);$('#notesStatus').textContent='Salvataggio…';noteTimer=setTimeout(()=>{state.notes=$('#notesArea').value;saveState();$('#notesStatus').textContent='Salvato sul dispositivo';},350);});
    $('#exportNotes').addEventListener('click',()=>{state.notes=$('#notesArea').value;saveState();const blob=new Blob([`Taccuino — Freud\n\n${state.notes}`],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='taccuino-freud.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);toast('Taccuino esportato');});
  }

  function searchEntries(){
    const e=[];D.modules.forEach(m=>e.push({type:'Tappa',title:m.title,text:[m.question,m.amateur.lead,...m.amateur.body,m.student.lead,m.student.reference,m.misconception,m.work].join(' '),action:['module',m.id]}));
    D.sources.forEach((s,i)=>e.push({type:'Opera',title:s.title,text:[s.problem,s.thesis,s.limit].join(' '),action:['source',i]}));
    D.glossary.forEach(([t,x])=>e.push({type:'Glossario',title:t,text:x,action:['tool','glossary']}));D.comparisons.forEach(([t,x])=>e.push({type:'Confronto',title:t,text:x,action:['tool','comparisons']}));return e;
  }
  const entries=searchEntries();
  function runSearch(q){
    const root=$('#searchResults'),term=q.trim().toLocaleLowerCase('it');if(term.length<2){root.innerHTML='<p>Scrivi almeno due caratteri.</p>';return;}
    const hits=entries.filter(x=>(x.title+' '+x.text).toLocaleLowerCase('it').includes(term)).slice(0,24);
    root.innerHTML=hits.length?hits.map((x,i)=>`<div class="search-result"><strong>${esc(x.type)} · ${esc(x.title)}</strong><span>${esc(x.text.slice(0,180))}${x.text.length>180?'…':''}</span><button data-search-hit="${i}">Apri</button></div>`).join(''):'<p>Nessun risultato. Prova un termine più generale.</p>';
    $$('[data-search-hit]',root).forEach(b=>b.addEventListener('click',()=>{const x=hits[Number(b.dataset.searchHit)];$('#searchDialog').close();if(x.action[0]==='module')openModule(x.action[1]);else if(x.action[0]==='tool')openTool(x.action[1]);else {document.getElementById(`source-${x.action[1]}`)?.scrollIntoView({behavior:'smooth',block:'center'});}}));
  }
  function setupSearch(){const d=$('#searchDialog'),input=$('#searchInput');$('#searchButton').addEventListener('click',()=>{d.showModal();input.value='';$('#searchResults').innerHTML='<p>Cerca opere, concetti, persone o problemi.</p>';setTimeout(()=>input.focus(),0);});$