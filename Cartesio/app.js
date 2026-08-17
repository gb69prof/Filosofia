(()=>{
  "use strict";
  const data=window.CARTESIO_DATA;
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const keys={mode:"cartesio-mode-v1",completed:"cartesio-completed-v1",notes:"cartesio-notes-v1",font:"cartesio-font-v1",quiz:"cartesio-quiz-v1"};
  const safeParse=(value,fallback)=>{try{return value?JSON.parse(value):fallback}catch(_){return fallback}};
  const state={
    mode:localStorage.getItem(keys.mode)||"amateur",
    completed:new Set(safeParse(localStorage.getItem(keys.completed),[])),
    discovery:0,
    discoveryAnswer:null,
    doubtIndex:0,
    doubtScore:0,
    doubtAnswered:false,
    methodOrder:[],
    quizAnswers:safeParse(localStorage.getItem(keys.quiz),{}),
    deferredInstall:null,
    map:data&&data.maps.length?data.maps[0].id:null
  };

  function esc(value){return String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]))}
  function toast(message){const node=$("#toast");node.textContent=message;node.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.classList.remove("show"),2400)}
  function showDialog(html){const dialog=$("#contentDialog");$("#dialogContent").innerHTML=html;dialog.showModal();dialog.scrollTop=0;setTimeout(()=>$("#dialogContent h2")?.focus?.(),20)}
  function closeDialog(){const dialog=$("#contentDialog");if(dialog.open)dialog.close()}
  function persistQuiz(){localStorage.setItem(keys.quiz,JSON.stringify(state.quizAnswers))}

  function renderDiscovery(){
    const step=data.discovery[state.discovery];
    const percent=((state.discovery+(state.discoveryAnswer!==null?1:0))/data.discovery.length)*100;
    const choices=step.choices.map((choice,index)=>'<button data-discovery-choice="'+index+'">'+choice.label+'</button>').join("");
    const answer=state.discoveryAnswer===null
      ?'<div class="choice-list">'+choices+'</div>'
      :'<div class="consequence"><strong>'+step.choices[state.discoveryAnswer].title+'</strong><p>'+step.choices[state.discoveryAnswer].text+'</p></div><button class="next-button" data-discovery-next>'+(state.discovery===data.discovery.length-1?"Ricomincia l’esperimento":"Continua →")+'</button>';
    $("#discovery").innerHTML='<div class="discovery-head"><div><span>Esperimento mentale</span><span>'+(state.discovery+1)+' / '+data.discovery.length+'</span></div><div class="discovery-track"><span style="width:'+percent+'%"></span></div></div><div class="discovery-body"><h3>'+step.title+'</h3><p>'+step.prompt+'</p>'+answer+'</div>';
  }
  function chooseDiscovery(index){state.discoveryAnswer=index;renderDiscovery()}
  function nextDiscovery(){state.discovery=state.discovery===data.discovery.length-1?0:state.discovery+1;state.discoveryAnswer=null;renderDiscovery()}

  function moduleContent(module){return state.mode==="student"?module.student:module.amateur}
  function renderModules(){
    $("#moduleGrid").innerHTML=data.modules.map(module=>{
      const copy=moduleContent(module);
      return '<button class="module-card '+(state.completed.has(module.id)?"complete":"")+'" style="--accent:'+module.accent+'" data-module="'+module.id+'"><span class="module-index">'+module.number+' · '+module.kicker+'</span><h3>'+module.title+'</h3><p>'+copy.summary+'</p><footer><span>'+(state.mode==="student"?"Argomento e fonti":"Spiegazione ed esempio")+'</span><span>→</span></footer></button>';
    }).join("");
  }
  function openModule(id){
    const module=data.modules.find(item=>item.id===id);if(!module)return;
    const copy=moduleContent(module);
    const body=state.mode==="student"
      ?'<div class="detail-grid"><div class="detail-box"><h3>Concetti essenziali</h3><ul class="beat-list">'+copy.concepts.map(item=>"<li>"+item+"</li>").join("")+'</ul></div><div class="detail-box"><h3>Movimento dell’argomento</h3><p>'+copy.argument+'</p></div></div><div class="source-note"><strong>Riferimento testuale e accademico</strong><p>'+copy.source+'</p></div><div class="warning-note"><strong>Attenzione al fraintendimento</strong><p>'+copy.warning+'</p></div>'
      :'<p>'+copy.narrative+'</p><div class="detail-grid"><div class="detail-box"><h3>Passaggi</h3><ul class="beat-list">'+copy.beats.map(item=>"<li>"+item+"</li>").join("")+'</ul></div><div class="detail-box"><h3>Esempio</h3><p>'+copy.example+'</p></div></div><div class="checkpoint"><strong>Punto fermo</strong><p>'+copy.checkpoint+'</p></div>';
    const options=module.check.options.map((option,index)=>'<button data-quick="'+index+'" data-correct="'+module.check.correct+'">'+option+'</button>').join("");
    showDialog('<article class="module-detail" data-open-module="'+module.id+'"><p class="kicker">'+module.number+' · '+module.kicker+' · '+(state.mode==="student"?"Studio filosofico":"Primo incontro")+'</p><h2 tabindex="-1">'+module.title+'</h2><p class="module-question">'+module.question+'</p><p>'+copy.summary+'</p>'+body+'<section class="quick-check"><h3>Controllo rapido</h3><p>'+module.check.question+'</p><div class="quick-options">'+options+'</div><p class="quick-feedback" aria-live="polite"></p></section><button class="complete-button" data-complete="'+module.id+'">'+(state.completed.has(module.id)?"Tappa completata ✓":"Segna come completata")+'</button></article>');
  }
  function answerQuick(button){
    const box=button.closest(".quick-check");if(box.dataset.answered)return;box.dataset.answered="true";
    const selected=Number(button.dataset.quick),correct=Number(button.dataset.correct);
    $$("[data-quick]",box).forEach(item=>{item.disabled=true;if(Number(item.dataset.quick)===correct)item.classList.add("correct");else if(item===button)item.classList.add("wrong")});
    const module=data.modules.find(item=>item.id===button.closest("[data-open-module]").dataset.openModule);
    $(".quick-feedback",box).innerHTML=selected===correct?'<strong>Corretto.</strong> '+module.check.feedback:'<strong>Da rivedere.</strong> '+module.check.feedback+'<br><small>'+module.check.recovery+'</small>';
  }
  function completeModule(id){
    state.completed.add(id);localStorage.setItem(keys.completed,JSON.stringify([...state.completed]));renderModules();updateProgress();
    const button=$('[data-complete="'+id+'"]');if(button)button.textContent="Tappa completata ✓";toast("Tappa salvata sul dispositivo");
  }
  function setMode(mode){
    state.mode=mode;localStorage.setItem(keys.mode,mode);
    $$("[data-mode]").forEach(button=>button.classList.toggle("active",button.dataset.mode===mode));
    $("#modeDescription").textContent=mode==="student"?"Argomenti, distinzioni, riferimenti testuali e problemi interpretativi.":"Spiegazioni chiare, esempi concreti e domande per entrare nel problema.";
    renderModules();
  }
  function updateProgress(){
    const percent=Math.round(state.completed.size/data.modules.length*100);
    $("#progressLabel").textContent=state.completed.size+" di "+data.modules.length+" tappe completate";
    $("#progressPercent").textContent=percent+"%";$("#progressBar").style.width=percent+"%";$("#drawerProgress").textContent=percent+"%";
  }

  function renderDoubtLab(){
    const item=data.doubtCases[state.doubtIndex];
    $("#labProgress").textContent="Caso "+(state.doubtIndex+1)+" di "+data.doubtCases.length;
    $("#labScore").textContent=state.doubtScore+" classificazioni corrette";
    const options=item.options.map((option,index)=>'<button data-doubt-answer="'+index+'">'+option+'</button>').join("");
    $("#doubtCase").innerHTML='<article class="lab-case"><p class="eyebrow">Pressione epistemica '+(state.doubtIndex+1)+'</p><h3>'+item.title+'</h3><div class="lab-scene"><div class="lab-symbol" aria-hidden="true">'+item.symbol+'</div><p>'+item.scene+'</p></div><p><strong>'+item.question+'</strong></p><div class="lab-options">'+options+'</div><div id="labFeedback" aria-live="polite"></div></article>';
  }
  function answerDoubt(index){
    if(state.doubtAnswered)return;state.doubtAnswered=true;
    const item=data.doubtCases[state.doubtIndex],correct=index===item.correct;if(correct)state.doubtScore+=1;
    $$("[data-doubt-answer]").forEach((button,i)=>{button.disabled=true;if(i===item.correct)button.classList.add("correct");else if(i===index)button.classList.add("wrong")});
    $("#labScore").textContent=state.doubtScore+" classificazioni corrette";
    $("#labFeedback").innerHTML='<div class="lab-feedback '+(correct?"":"wrong")+'"><strong>'+(correct?"Classificazione corretta":"Qui serve una distinzione in più")+'</strong><p>'+item.explanation+'</p><button class="next-button" data-doubt-next>'+(state.doubtIndex===data.doubtCases.length-1?"Ricomincia":"Caso successivo →")+'</button></div>';
  }
  function nextDoubt(){
    if(state.doubtIndex===data.doubtCases.length-1){state.doubtIndex=0;state.doubtScore=0}else state.doubtIndex+=1;
    state.doubtAnswered=false;renderDoubtLab();
  }
  function renderMethodLab(message){
    const available=data.methodSequence.filter(item=>!state.methodOrder.includes(item.id));
    const ordered=state.methodOrder.map((id,index)=>{const item=data.methodSequence.find(entry=>entry.id===id);return '<button class="placed" data-method-remove="'+id+'"><span>'+(index+1)+'</span><strong>'+item.label+'</strong><small>'+item.short+'</small></button>'}).join("");
    const bank=available.map(item=>'<button class="case-token" data-method-step="'+item.id+'"><strong>'+item.label+'</strong><small>'+item.short+'</small></button>').join("")||"<p>Tutte le regole sono state collocate.</p>";
    $("#methodLab").innerHTML='<div class="lab-instructions"><div><span class="discovery-step">Ordina e applica</span><h3>Qual è la sequenza del metodo?</h3><p>Scegli una regola alla volta. Tocca una regola collocata per rimuoverla, poi controlla l’ordine.</p></div><span class="lab-score">'+state.methodOrder.length+' / '+data.methodSequence.length+'</span></div><div class="case-bank">'+bank+'</div><div class="method-order">'+(ordered||"<p>Nessuna regola collocata.</p>")+'</div><p class="lab-feedback" id="methodFeedback">'+(message||"")+'</p><div class="lab-actions"><button data-method-reset>Ricomincia</button><button class="primary" data-method-check '+(state.methodOrder.length<data.methodSequence.length?"disabled":"")+'>Controlla e applica</button></div>';
  }
  function addMethod(id){if(!state.methodOrder.includes(id))state.methodOrder.push(id);renderMethodLab()}
  function removeMethod(id){state.methodOrder=state.methodOrder.filter(item=>item!==id);renderMethodLab()}
  function checkMethod(){
    const correct=data.methodSequence.every((item,index)=>state.methodOrder[index]===item.id);
    if(!correct){renderMethodLab("L’ordine non è ancora corretto. Prima disciplina l’assenso, poi dividi, ricostruisci e controlla.");return}
    $("#methodLab").innerHTML='<span class="discovery-step">Sequenza corretta</span><h3>Dal problema alla verifica</h3><div class="method-application">'+data.methodSequence.map((item,index)=>'<article><span>0'+(index+1)+'</span><h4>'+item.label+'</h4><p>'+item.application+'</p></article>').join("")+'</div><div class="hypothesis"><strong>Il punto metodico</strong><p>La sequenza non è una macchina universale: rende visibili precipitazione, salti e omissioni. Nelle scienze Cartesio integra inoltre deduzione ed esperimenti per scegliere fra spiegazioni possibili.</p></div><div class="lab-actions"><button class="primary" data-method-reset>Ripeti il laboratorio</button></div>';
  }
  function resetMethod(){state.methodOrder=[];renderMethodLab()}
  function setLab(name){
    $$("[data-lab-tab]").forEach(button=>{const active=button.dataset.labTab===name;button.classList.toggle("active",active);button.setAttribute("aria-selected",String(active))});
    $("#doubtLab").hidden=name!=="doubt";$("#methodLab").hidden=name!=="method";
  }

  function renderSources(){
    $("#sourceGrid").innerHTML=data.sources.map(source=>'<article class="source-card"><span class="kind">'+source.kind+'</span><h3>'+source.title+'</h3><p>'+source.text+'</p><footer>'+source.ref+'</footer></article>').join("");
  }
  function renderComics(){
    $("#comicStrip").innerHTML=data.comics.map((scene,index)=>'<article class="comic-card" data-scene="'+String(index+1).padStart(2,"0")+'"><div class="comic-visual" aria-hidden="true">'+scene.icon+'</div><time>'+scene.year+'</time><h3>'+scene.title+'</h3><p>'+scene.text+'</p><small>'+scene.status+'</small></article>').join("");
  }
  function renderMap(){
    const map=data.maps.find(item=>item.id===state.map)||data.maps[0];
    $("#mapTabs").innerHTML=data.maps.map(item=>'<button role="tab" aria-selected="'+(item.id===state.map)+'" class="'+(item.id===state.map?"active":"")+'" data-map="'+item.id+'">'+item.title+'</button>').join("");
    $("#conceptMap").innerHTML='<p class="eyebrow">Mappa '+(data.maps.indexOf(map)+1)+' di '+data.maps.length+'</p><h3>'+map.title+'</h3><p>'+map.intro+'</p><div class="map-flow">'+map.nodes.map(node=>'<div class="map-node"><strong>'+node.title+'</strong><p>'+node.text+'</p></div>').join("")+'</div>';
  }

  function glossaryHTML(){return '<p class="eyebrow dark">Dizionario filosofico</p><h2 tabindex="-1">Ventotto parole</h2><div class="glossary-grid">'+data.glossary.map(pair=>'<article class="tool-item"><h3>'+pair[0]+'</h3><p>'+pair[1]+'</p></article>').join("")+'</div>'}
  function timelineHTML(){return '<p class="eyebrow dark">Linea del tempo</p><h2 tabindex="-1">1596–1650</h2><div class="tool-list">'+data.timeline.map(pair=>'<article class="tool-item"><h3>'+pair[0]+'</h3><p>'+pair[1]+'</p></article>').join("")+'</div>'}
  function libraryHTML(){return '<p class="eyebrow dark">Biblioteca</p><h2 tabindex="-1">Orientarsi nelle opere</h2><div class="tool-list">'+data.library.map(item=>'<article class="tool-item"><h3><cite>'+item[0]+'</cite></h3><small>'+item[1]+'</small><p>'+item[2]+'</p></article>').join("")+'</div>'}
  function comparisonsHTML(){return '<p class="eyebrow dark">Confronti</p><h2 tabindex="-1">Sette risposte a problemi cartesiani</h2><p>Il confronto segnala trasformazioni e critiche, non una discendenza automatica.</p><div class="comparison cartesio-comparison"><strong>Pensatore</strong><strong>Problema</strong><strong>Mossa</strong><strong>Distanza da Cartesio</strong>'+data.comparisons.map(row=>'<strong>'+row.thinker+'</strong><span>'+row.problem+'</span><span>'+row.move+'</span><span>'+row.limit+'</span>').join("")+'</div>'}
  function academicSourcesHTML(){return '<p class="eyebrow dark">Fonti accademiche</p><h2 tabindex="-1">Solo università consultate</h2><p>Accesso verificato il 17 agosto 2026. Il documento di partenza è stato controllato e la sua bibliografia non universitaria non è stata trasferita.</p><div class="tool-list">'+data.academicSources.map(source=>'<article class="tool-item"><small>'+source.institution+'</small><h3><a href="'+source.url+'" target="_blank" rel="noreferrer">'+source.title+' ↗</a></h3><p>'+source.supports+'</p></article>').join("")+'</div>'}

  function quizQuestionHTML(index){
    const item=data.quiz[index],answer=Object.prototype.hasOwnProperty.call(state.quizAnswers,index)?Number(state.quizAnswers[index]):null;
    const buttons=item.options.map((option,optionIndex)=>{
      const classes=answer===null?"":(optionIndex===item.correct?" correct":optionIndex===answer?" wrong":"");
      return '<button class="quiz-option'+classes+'" data-quiz="'+index+'" data-option="'+optionIndex+'" '+(answer===null?"":"disabled")+'>'+option+'</button>';
    }).join("");
    const feedback=answer===null?"":'<strong>'+(answer===item.correct?"Corretto":"Risposta da rivedere")+'.</strong><ol>'+item.options.map((option,optionIndex)=>'<li><strong>'+(optionIndex===item.correct?"Corretta":"Non corretta")+':</strong> '+item.why[optionIndex]+'</li>').join("")+'</ol>';
    return '<article class="tool-item quiz-question" data-quiz-question="'+index+'"><h3>'+(index+1)+'. '+item.q+'</h3>'+buttons+'<div class="quiz-feedback" aria-live="polite">'+feedback+'</div></article>';
  }
  function quizHTML(indices=data.quiz.map((_,index)=>index)){
    return '<p class="eyebrow dark">Verifica finale</p><h2 tabindex="-1">'+(indices.length===data.quiz.length?"Dodici domande ragionate":"Ripeti gli errori")+'</h2><p>Ogni alternativa riceve una spiegazione. Le risposte restano salvate sul dispositivo finché non azzeri la prova.</p><div id="quizList">'+indices.map(quizQuestionHTML).join("")+'</div><div id="quizSummary"></div>';
  }
  function answerQuiz(questionIndex,choice){
    if(Object.prototype.hasOwnProperty.call(state.quizAnswers,questionIndex))return;
    state.quizAnswers[questionIndex]=choice;persistQuiz();
    const item=data.quiz[questionIndex],article=$('[data-quiz-question="'+questionIndex+'"]');
    $$('[data-quiz="'+questionIndex+'"]',article).forEach(button=>{button.disabled=true;const option=Number(button.dataset.option);if(option===item.correct)button.classList.add("correct");else if(option===choice)button.classList.add("wrong")});
    $(".quiz-feedback",article).innerHTML='<strong>'+(choice===item.correct?"Corretto":"Risposta da rivedere")+'.</strong><ol>'+item.options.map((option,index)=>'<li><strong>'+(index===item.correct?"Corretta":"Non corretta")+':</strong> '+item.why[index]+'</li>').join("")+'</ol>';
    renderQuizSummary();
  }
  function renderQuizSummary(){
    const container=$("#quizSummary");if(!container)return;
    const visible=$$(".quiz-question").map(node=>Number(node.dataset.quizQuestion));
    if(!visible.every(index=>Object.prototype.hasOwnProperty.call(state.quizAnswers,index))){container.innerHTML="";return}
    const wrong=visible.filter(index=>Number(state.quizAnswers[index])!==data.quiz[index].correct);
    const correct=visible.length-wrong.length;
    const fragile=[...new Set(wrong.map(index=>data.quiz[index].module))];
    const acquired=[...new Set(visible.filter(index=>!wrong.includes(index)).map(index=>data.quiz[index].module))];
    const recoveries=fragile.map(id=>{const module=data.modules.find(item=>item.id===id);return '<article class="recovery-card"><h4>Recupero · '+module.title+'</h4><p>'+module.amateur.summary+'</p><p><strong>Nuovo esempio:</strong> '+module.amateur.example+'</p><p><strong>Seconda domanda:</strong> '+module.check.question+'</p><div class="quick-options" data-recovery="'+id+'">'+module.check.options.map((option,index)=>'<button data-recovery-answer="'+index+'" data-correct="'+module.check.correct+'">'+option+'</button>').join("")+'</div><p class="quick-feedback"></p></article>'}).join("");
    container.innerHTML='<div class="quiz-summary"><h3>Esito: '+correct+' / '+visible.length+'</h3><p><strong>Nuclei acquisiti:</strong> '+(acquired.length?acquired.map(id=>data.modules.find(module=>module.id===id).title).join(", "):"da consolidare")+'.</p><p><strong>Nuclei fragili:</strong> '+(fragile.length?fragile.map(id=>data.modules.find(module=>module.id===id).title).join(", "):"nessuno in questa prova")+'.</p></div>'+recoveries+(wrong.length?'<button class="complete-button" data-retry="'+wrong.join(",")+'">Ripeti soltanto le '+wrong.length+' domande sbagliate</button>':'<p class="recovery-card"><strong>Percorso concluso.</strong> Hai ricostruito il movimento dal dubbio ai problemi lasciati aperti.</p>')+'<button class="text-button quiz-reset" data-quiz-reset>Azzera e rifai l’intera verifica</button>';
  }
  function answerRecovery(button){
    const group=button.closest("[data-recovery]");if(group.dataset.answered)return;group.dataset.answered="true";
    const choice=Number(button.dataset.recoveryAnswer),correct=Number(button.dataset.correct);
    $$("[data-recovery-answer]",group).forEach((item,index)=>{item.disabled=true;if(index===correct)item.classList.add("correct");else if(item===button)item.classList.add("wrong")});
    const module=data.modules.find(item=>item.id===group.dataset.recovery);
    group.nextElementSibling.innerHTML=choice===correct?'<strong>Recupero riuscito.</strong> '+module.check.feedback:'<strong>Ancora un passaggio.</strong> '+module.check.recovery;
  }
  function openTool(tool){
    const generators={glossary:glossaryHTML,timeline:timelineHTML,library:libraryHTML,comparisons:comparisonsHTML,sources:academicSourcesHTML,quiz:quizHTML};
    if(!generators[tool])return;showDialog(generators[tool]());if(tool==="quiz")renderQuizSummary();
  }

  function renderDrawer(){
    const links=[["#home","Copertina"],["#scopro","Scopro"],["#studio","Studio"],["#laboratorio","Laboratori"],["#fonti","Approfondisco"],["#fumetti","A fumetti"],["#mappe","Mappe"],["#strumenti","Strumenti"]];
    $("#drawerNav").innerHTML=links.map(item=>'<a href="'+item[0]+'">'+item[1]+'</a>').join("");
  }
  function toggleDrawer(open){$("#drawer").classList.toggle("open",open);$("#drawer").setAttribute("aria-hidden",String(!open));$("#menuButton").setAttribute("aria-expanded",String(open));if(open)$("#drawerClose").focus()}
  function toggleNotes(open){$("#notesPanel").classList.toggle("open",open);$("#notesPanel").setAttribute("aria-hidden",String(!open));if(open)$("#notesArea").focus()}
  function saveNotes(){localStorage.setItem(keys.notes,$("#notesArea").value);$("#notesStatus").textContent="Salvato";setTimeout(()=>$("#notesStatus").textContent="",1200)}
  function exportNotes(){const blob=new Blob(["Taccuino — Cartesio\n\n"+$("#notesArea").value],{type:"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="taccuino-cartesio.txt";link.click();URL.revokeObjectURL(url)}
  function search(query){
    const target=$("#searchResults"),term=query.trim().toLowerCase();if(term.length<2){target.innerHTML="";return}
    const results=[];
    data.modules.forEach(module=>{if(JSON.stringify(module).toLowerCase().includes(term))results.push({type:"module",id:module.id,title:module.title,meta:"Tappa di studio"})});
    data.glossary.forEach(pair=>{if((pair[0]+" "+pair[1]).toLowerCase().includes(term))results.push({type:"glossary",id:pair[0],title:pair[0],meta:pair[1]})});
    data.sources.forEach((source,index)=>{if(JSON.stringify(source).toLowerCase().includes(term))results.push({type:"source",id:index,title:source.title,meta:source.kind})});
    target.innerHTML=results.length?results.slice(0,16).map(result=>'<button class="search-result" data-search-type="'+result.type+'" data-search-id="'+result.id+'"><strong>'+result.title+'</strong><br><small>'+result.meta+'</small></button>').join(""):'<p>Nessun risultato per “'+esc(query)+'”.</p>';
  }

  function bindEvents(){
    document.addEventListener("click",event=>{
      const hotspot=event.target.closest("[data-hotspot]");if(hotspot){const item=data.hotspots[hotspot.dataset.hotspot];showDialog('<p class="eyebrow dark">Copertina interattiva</p><h2 tabindex="-1">'+item.title+'</h2><p>'+item.text+'</p>');return}
      const discoveryChoice=event.target.closest("[data-discovery-choice]");if(discoveryChoice){chooseDiscovery(Number(discoveryChoice.dataset.discoveryChoice));return}
      if(event.target.closest("[data-discovery-next]")){nextDiscovery();return}
      const mode=event.target.closest("[data-mode]");if(mode){setMode(mode.dataset.mode);return}
      const module=event.target.closest("[data-module]");if(module){openModule(module.dataset.module);return}
      const quick=event.target.closest("[data-quick]");if(quick){answerQuick(quick);return}
      const complete=event.target.closest("[data-complete]");if(complete){completeModule(complete.dataset.complete);return}
      const doubt=event.target.closest("[data-doubt-answer]");if(doubt){answerDoubt(Number(doubt.dataset.doubtAnswer));return}
      if(event.target.closest("[data-doubt-next]")){nextDoubt();return}
      const labTab=event.target.closest("[data-lab-tab]");if(labTab){setLab(labTab.dataset.labTab);return}
      const methodStep=event.target.closest("[data-method-step]");if(methodStep){addMethod(methodStep.dataset.methodStep);return}
      const methodRemove=event.target.closest("[data-method-remove]");if(methodRemove){removeMethod(methodRemove.dataset.methodRemove);return}
      if(event.target.closest("[data-method-check]")){checkMethod();return}
      if(event.target.closest("[data-method-reset]")){resetMethod();return}
      const map=event.target.closest("[data-map]");if(map){state.map=map.dataset.map;renderMap();return}
      const tool=event.target.closest("[data-tool]");if(tool){openTool(tool.dataset.tool);return}
      const quiz=event.target.closest("[data-quiz]");if(quiz){answerQuiz(Number(quiz.dataset.quiz),Number(quiz.dataset.option));return}
      const recovery=event.target.closest("[data-recovery-answer]");if(recovery){answerRecovery(recovery);return}
      const retry=event.target.closest("[data-retry]");if(retry){const indices=retry.dataset.retry.split(",").map(Number);indices.forEach(index=>delete state.quizAnswers[index]);persistQuiz();$("#dialogContent").innerHTML=quizHTML(indices);renderQuizSummary();return}
      if(event.target.closest("[data-quiz-reset]")){state.quizAnswers={};persistQuiz();$("#dialogContent").innerHTML=quizHTML();renderQuizSummary();return}
      const result=event.target.closest("[data-search-type]");if(result){$("#searchDialog").close();if(result.dataset.searchType==="module")openModule(result.dataset.searchId);else if(result.dataset.searchType==="glossary")showDialog(glossaryHTML());else{$("#fonti").scrollIntoView();toast("Scheda trovata in Approfondisco")}return}
      if(event.target.closest('[data-close="drawer"]'))toggleDrawer(false);
    });
    $("#menuButton").addEventListener("click",()=>toggleDrawer(true));$("#indexButton").addEventListener("click",()=>toggleDrawer(true));$("#drawerClose").addEventListener("click",()=>toggleDrawer(false));$$('#drawerNav a').forEach(link=>link.addEventListener("click",()=>toggleDrawer(false)));
    $("#fontButton").addEventListener("click",()=>{const large=!document.body.classList.contains("large-text");document.body.classList.toggle("large-text",large);localStorage.setItem(keys.font,large?"large":"normal");toast(large?"Testo ingrandito":"Dimensione standard")});
    $("#notesButton").addEventListener("click",()=>toggleNotes(true));$("#notesClose").addEventListener("click",()=>toggleNotes(false));$("#notesArea").addEventListener("input",()=>{clearTimeout(saveNotes.timer);saveNotes.timer=setTimeout(saveNotes,350)});$("#exportNotes").addEventListener("click",exportNotes);
    $("#searchButton").addEventListener("click",()=>{$("#searchDialog").showModal();setTimeout(()=>$("#searchInput").focus(),30)});$("#searchClose").addEventListener("click",()=>$("#searchDialog").close());$("#searchInput").addEventListener("input",event=>search(event.target.value));$("#dialogClose").addEventListener("click",closeDialog);
    $("#installButton").addEventListener("click",async()=>{if(state.deferredInstall){state.deferredInstall.prompt();await state.deferredInstall.userChoice;state.deferredInstall=null}else toast("Usa “Aggiungi alla schermata Home” dal menu del browser")});
    window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();state.deferredInstall=event});
    document.addEventListener("keydown",event=>{if(event.key==="Escape"){toggleDrawer(false);toggleNotes(false)}})
  }
  function init(){
    if(!data)throw new Error("Dati Cartesio non disponibili");
    $("#notesArea").value=localStorage.getItem(keys.notes)||"";if(localStorage.getItem(keys.font)==="large")document.body.classList.add("large-text");
    renderDiscovery();renderModules();renderDoubtLab();renderMethodLab();renderSources();renderComics();renderMap();renderDrawer();updateProgress();bindEvents();setMode(state.mode);setLab("doubt");
    if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js",{updateViaCache:"none"}).catch(error=>console.warn("Service worker non registrato",error)));
  }
  init();
})();

