(()=>{
  const data=window.KANT_DATA;
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const storageKey="kant-pwa-v1";
  const notesKey="kant-pwa-notes-v1";
  const saved=JSON.parse(localStorage.getItem(storageKey)||"{}");
  const state={mode:saved.mode||"amateur",completed:new Set(saved.completed||[]),map:saved.map||"scuole"};
  let toastTimer;

  function persist(){
    localStorage.setItem(storageKey,JSON.stringify({mode:state.mode,completed:[...state.completed],map:state.map}));
  }
  function escapeHTML(value){return String(value).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]))}
  function showToast(message){
    const toast=$("#toast");toast.textContent=message;toast.classList.add("show");
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),2400);
  }
  function openDialog(html){
    $("#dialogContent").innerHTML=html;
    const dialog=$("#contentDialog");
    if(!dialog.open)dialog.showModal();
  }
  function setMode(mode,scroll=false){
    state.mode=mode;persist();
    $$('[data-mode]').forEach(button=>button.classList.toggle("active",button.dataset.mode===mode));
    $("#modeDescription").textContent=mode==="amateur"?"Spiegazioni chiare, esempi concreti e domande per entrare nel problema.":"Terminologia rigorosa, argomenti, testi, distinzioni ed errori da evitare.";
    renderModules();renderMap();updateProgress();
    if(scroll)$("#percorso").scrollIntoView({behavior:"smooth"});
    showToast(mode==="amateur"?"Percorso Primo incontro attivo":"Percorso Studio filosofico attivo");
  }
  function updateProgress(){
    const count=data.modules.filter(module=>state.completed.has(module.id)).length;
    const percent=Math.round(count/data.modules.length*100);
    $("#progressLabel").textContent=`${count} di ${data.modules.length} tappe completate`;
    $("#progressPercent").textContent=`${percent}%`;
    $("#progressBar").style.width=`${percent}%`;
    $("#drawerProgress").textContent=`${percent}%`;
  }
  function renderModules(){
    $("#moduleGrid").innerHTML=data.modules.map(module=>{
      const copy=module[state.mode];
      return `<article class="module-card ${state.completed.has(module.id)?"complete":""}" style="--accent:${module.accent}">
        <span class="module-index">${module.number} · ${module.kicker}</span>
        <h3>${module.title}</h3>
        <p>${copy.summary}</p>
        <footer><span>${state.mode==="amateur"?"Primo incontro":"Studio filosofico"}</span><button data-open-module="${module.id}" aria-label="Apri ${module.title}">→</button></footer>
      </article>`;
    }).join("");
  }
  function openModule(id){
    const module=data.modules.find(item=>item.id===id);if(!module)return;
    const copy=module[state.mode];
    const body=state.mode==="amateur"?`
      <p class="dialog-question">${module.question}</p>
      <p>${copy.summary}</p>
      <h3>Il movimento dell’idea</h3><ol>${copy.beats.map(beat=>`<li>${beat}</li>`).join("")}</ol>
      <h3>Un esempio per pensare</h3><p class="dialog-example">${copy.example}</p>
      <h3>Ciò che deve restare</h3><p class="source-card">${copy.checkpoint}</p>`:`
      <p class="dialog-question">${module.question}</p>
      <p>${copy.summary}</p>
      <h3>Nuclei concettuali</h3><ul>${copy.concepts.map(concept=>`<li>${concept}</li>`).join("")}</ul>
      <h3>Argomento</h3><p class="dialog-example">${copy.argument}</p>
      <h3>Orientamento testuale</h3><p class="source-card">${copy.source}</p>
      <h3>Errore da evitare</h3><p class="dialog-warning">${copy.warning}</p>`;
    openDialog(`<p class="eyebrow">Tappa ${module.number} · ${module.kicker}</p><h2>${module.title}</h2>${body}
      <div class="lesson-actions"><button data-toggle-complete="${module.id}" class="${state.completed.has(module.id)?"complete":""}">${state.completed.has(module.id)?"✓ Tappa completata":"Segna come completata"}</button><button data-open-map="${mapForModule(module.id)}">Apri la mappa collegata</button></div>`);
  }
  function mapForModule(id){return({prima:"scuole",rivoluzione:"copernicana",giudizi:"tipi-giudizio",conoscenza:"ragion-pura",limiti:"fenomeno-noumeno",morale:"imperativo",liberta:"autonomia",giudizio:"bello-sublime",sistema:"sistema"})[id]||"sistema"}

  function renderMapTabs(){
    $("#mapTabs").innerHTML=data.maps.map(map=>`<button data-map="${map.id}" class="${map.id===state.map?"active":""}"><span>Mappa ${map.number}</span>${map.title}</button>`).join("");
  }
  function renderMap(){
    const map=data.maps.find(item=>item.id===state.map)||data.maps[0];
    $("#mapKicker").textContent=`Mappa ${map.number} · ${state.mode==="amateur"?"Primo incontro":"Studio filosofico"}`;
    $("#mapTitle").textContent=map.title;$("#mapIntro").textContent=map.intro;
    $("#mapFlow").innerHTML=map.nodes.map((node,index)=>`<button class="map-node" data-node="${index}"><span>${node.tag}</span><strong>${node.label}</strong><small>${node.short}</small></button>`).join("");
    $("#mapDetail").innerHTML="<p>Scegli un nodo per aprirne il significato.</p>";
    renderMapTabs();
  }
  function selectMap(id,scroll=true){
    if(!data.maps.some(map=>map.id===id))return;state.map=id;persist();renderMap();
    if(scroll)$("#mappe").scrollIntoView({behavior:"smooth",block:"start"});
  }
  function openMapNode(index){
    const map=data.maps.find(item=>item.id===state.map);const node=map?.nodes[index];if(!node)return;
    $$(".map-node").forEach((button,i)=>button.classList.toggle("active",i===index));
    $("#mapDetail").innerHTML=`<h4>${node.label}</h4><p>${node[state.mode]}</p><p class="map-example"><strong>Funzione nella mappa:</strong> ${node.short}.</p>`;
  }

  function renderDrawer(){
    $("#drawerNav").innerHTML=`<a href="#home"><span>⌂</span><strong>Copertina<small>La domanda generatrice</small></strong></a>`+data.modules.map(module=>`<a href="#percorso" data-drawer-module="${module.id}"><span>${module.number}</span><strong>${module.title}<small>${module.kicker}</small></strong></a>`).join("")+`<a href="#mappe"><span>◎</span><strong>Mappe concettuali<small>Quindici percorsi visivi</small></strong></a><a href="#strumenti"><span>✦</span><strong>Strumenti<small>Glossario, laboratorio e verifica</small></strong></a>`;
  }
  function toggleDrawer(open){
    const drawer=$("#drawer");drawer.classList.toggle("open",open);drawer.setAttribute("aria-hidden",String(!open));$("#menuButton").setAttribute("aria-expanded",String(open));
    if(open)setTimeout(()=>$(".drawer-panel .close-button").focus(),30);
  }

  function glossaryHTML(letter="T"){
    const letters=[...new Set(data.glossary.map(([term])=>term[0]))].sort();
    const items=data.glossary.filter(([term])=>term.startsWith(letter));
    return `<p class="eyebrow">Dizionario filosofico</p><h2>Le parole di Kant</h2><p>Una parola difficile diventa utile quando permette una distinzione che prima non vedevamo.</p>
      <div class="glossary-filter">${letters.map(l=>`<button data-letter="${l}" class="${l===letter?"active":""}">${l}</button>`).join("")}</div>
      <div class="tool-content-list">${items.map(([term,definition])=>`<article class="tool-item"><h3>${term}</h3><p>${definition}</p><button class="secondary-button" data-save-term="${escapeHTML(term)}">Salva nel taccuino</button></article>`).join("")}</div>`;
  }
  function comparisonsHTML(){return `<p class="eyebrow">Confronti continui</p><h2>Kant in dialogo</h2><div class="tool-content-list">${data.comparisons.map(item=>`<article class="tool-item"><h3>${item.name}</h3><p><strong>Problema ereditato:</strong> ${item.before}</p><p><strong>Risposta kantiana:</strong> ${item.kant}</p><p><strong>Effetto:</strong> ${item.after}</p></article>`).join("")}</div>`}
  function timelineHTML(){return `<p class="eyebrow">Linea del tempo</p><h2>Una vita nella ragione</h2><div class="tool-content-list timeline">${data.timeline.map(([year,text])=>`<article class="tool-item"><h3>${year}</h3><p>${text}</p></article>`).join("")}</div>`}
  function libraryHTML(){return `<p class="eyebrow">Biblioteca delle opere</p><h2>Orientarsi nei testi</h2><div class="tool-content-list">${data.library.map(book=>`<article class="tool-item"><p class="eyebrow">${book.year} · ${book.role}</p><h3>${book.title}</h3><p>${book.desc}</p></article>`).join("")}</div>`}
  function labHTML(){return `<p class="eyebrow">Laboratorio morale</p><h2>Metti alla prova la massima</h2><p>Non cercare la risposta più simpatica: cerca il principio che potrebbe valere per ogni persona.</p><div class="tool-content-list">${data.lab.map((item,index)=>`<article class="tool-item"><h3>${index+1}. ${item.title}</h3><p>${item.case}</p><div class="case-options">${item.options.map((option,i)=>`<button data-case="${index}" data-option="${i}">${option}</button>`).join("")}</div><p class="feedback" id="caseFeedback${index}"></p></article>`).join("")}</div>`}
  function quizHTML(){return `<p class="eyebrow">Verifica finale</p><h2>Dodici domande</h2><p>Ogni risposta apre una spiegazione. Il punteggio misura l’attenzione, non il valore della persona — Kant approverebbe la distinzione.</p><div class="tool-content-list" id="quizList">${data.quiz.map((item,index)=>`<article class="tool-item"><h3>${index+1}. ${item.q}</h3><div class="quiz-options">${item.options.map((option,i)=>`<button data-quiz="${index}" data-option="${i}">${option}</button>`).join("")}</div><p class="feedback" id="quizFeedback${index}"></p></article>`).join("")}</div><div class="source-card" id="quizScore">Risposte corrette: 0 / ${data.quiz.length}</div>`}
  function openTool(tool){
    const html=tool==="glossary"?glossaryHTML():tool==="comparisons"?comparisonsHTML():tool==="timeline"?timelineHTML():tool==="library"?libraryHTML():tool==="lab"?labHTML():quizHTML();openDialog(html);
  }

  function runSearch(query){
    const q=query.trim().toLocaleLowerCase("it");if(q.length<2){$("#searchResults").innerHTML="<p>Scrivi almeno due lettere.</p>";return}
    const results=[];
    data.modules.forEach(module=>{const hay=JSON.stringify(module).toLocaleLowerCase("it");if(hay.includes(q))results.push({type:"module",id:module.id,title:module.title,meta:module.question})});
    data.maps.forEach(map=>{const hay=JSON.stringify(map).toLocaleLowerCase("it");if(hay.includes(q))results.push({type:"map",id:map.id,title:map.title,meta:"Mappa concettuale"})});
    data.glossary.forEach(([term,definition])=>{if((term+" "+definition).toLocaleLowerCase("it").includes(q))results.push({type:"term",id:term,title:term,meta:definition})});
    $("#searchResults").innerHTML=results.length?results.slice(0,18).map(result=>`<button data-search-type="${result.type}" data-search-id="${escapeHTML(result.id)}"><strong>${result.title}</strong><small>${result.meta}</small></button>`).join(""):"<p>Nessun risultato. Prova con una parola più generale.</p>";
  }
  function saveTerm(term){
    const area=$("#notesArea");const entry=`\n• ${term}: ${data.glossary.find(item=>item[0]===term)?.[1]||""}`;area.value+=entry;saveNotes();showToast(`${term} salvato nel taccuino`);
  }
  function saveNotes(){localStorage.setItem(notesKey,$("#notesArea").value);$("#notesStatus").textContent="Salvato";setTimeout(()=>$("#notesStatus").textContent="",1200)}
  function toggleNotes(open){$("#notesPanel").classList.toggle("open",open);$("#notesPanel").setAttribute("aria-hidden",String(!open));if(open)setTimeout(()=>$("#notesArea").focus(),150)}
  function exportNotes(){
    const blob=new Blob([`Taccuino Kant\n\n${$("#notesArea").value}`],{type:"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download="taccuino-kant.txt";link.click();URL.revokeObjectURL(url);showToast("Taccuino esportato");
  }

  function bindEvents(){
    document.addEventListener("click",event=>{
      const mode=event.target.closest("[data-mode]");if(mode){setMode(mode.dataset.mode,mode.closest(".path-chooser")!==null);return}
      const moduleButton=event.target.closest("[data-open-module]");if(moduleButton){openModule(moduleButton.dataset.openModule);return}
      const mapButton=event.target.closest("[data-map]");if(mapButton){selectMap(mapButton.dataset.map);return}
      const openMap=event.target.closest("[data-open-map]");if(openMap){$("#contentDialog").close();selectMap(openMap.dataset.openMap);return}
      const mapNode=event.target.closest("[data-node]");if(mapNode){openMapNode(Number(mapNode.dataset.node));return}
      const complete=event.target.closest("[data-toggle-complete]");if(complete){const id=complete.dataset.toggleComplete;state.completed.has(id)?state.completed.delete(id):state.completed.add(id);persist();renderModules();updateProgress();openModule(id);showToast(state.completed.has(id)?"Tappa completata":"Tappa riaperta");return}
      const tool=event.target.closest("[data-tool]");if(tool){openTool(tool.dataset.tool);return}
      const letter=event.target.closest("[data-letter]");if(letter){$("#dialogContent").innerHTML=glossaryHTML(letter.dataset.letter);return}
      const save=event.target.closest("[data-save-term]");if(save){saveTerm(save.dataset.saveTerm);return}
      const hotspot=event.target.closest("[data-hotspot]");if(hotspot){const item=data.hotspots[hotspot.dataset.hotspot];openDialog(`<p class="eyebrow">Copertina interattiva</p><h2>${item.title}</h2><p class="dialog-question">${item.text}</p>`);return}
      const drawerModule=event.target.closest("[data-drawer-module]");if(drawerModule){event.preventDefault();toggleDrawer(false);openModule(drawerModule.dataset.drawerModule);return}
      const close=event.target.closest('[data-close="drawer"]');if(close){toggleDrawer(false);return}
      const caseAnswer=event.target.closest("[data-case]");if(caseAnswer){const index=Number(caseAnswer.dataset.case),choice=Number(caseAnswer.dataset.option),item=data.lab[index];$$(`[data-case="${index}"]`).forEach(button=>{button.disabled=true;button.classList.add(Number(button.dataset.option)===item.correct?"correct":Number(button.dataset.option)===choice?"wrong":"")});$(`#caseFeedback${index}`).textContent=item.feedback;return}
      const quizAnswer=event.target.closest("[data-quiz]");if(quizAnswer){const index=Number(quizAnswer.dataset.quiz),choice=Number(quizAnswer.dataset.option),item=data.quiz[index];$$(`[data-quiz="${index}"]`).forEach(button=>{button.disabled=true;button.classList.add(Number(button.dataset.option)===item.correct?"correct":Number(button.dataset.option)===choice?"wrong":"")});if(choice===item.correct)quizAnswer.closest(".tool-item").dataset.correct="true";$(`#quizFeedback${index}`).textContent=item.why;const correct=$$("#quizList .tool-item[data-correct='true']").length;$("#quizScore").textContent=`Risposte corrette: ${correct} / ${data.quiz.length}`;return}
      const searchResult=event.target.closest("[data-search-type]");if(searchResult){$("#searchDialog").close();if(searchResult.dataset.searchType==="module")openModule(searchResult.dataset.searchId);else if(searchResult.dataset.searchType==="map")selectMap(searchResult.dataset.searchId);else{openTool("glossary");setTimeout(()=>{const letter=searchResult.dataset.searchId[0];$("#dialogContent").innerHTML=glossaryHTML(letter)},20)}return}
      const question=event.target.closest("[data-module]");if(question){const ids=question.dataset.module==="conoscenza"?["conoscenza","limiti"]:question.dataset.module==="morale"?["morale","liberta"]:["giudizio","sistema"];openModule(ids[0]);return}
    });
    $("#menuButton").addEventListener("click",()=>toggleDrawer(true));$("#indexButton").addEventListener("click",()=>toggleDrawer(true));
    $("#searchButton").addEventListener("click",()=>{$("#searchDialog").showModal();setTimeout(()=>$("#searchInput").focus(),30)});
    $("#searchInput").addEventListener("input",event=>runSearch(event.target.value));
    $("#notesButton").addEventListener("click",()=>toggleNotes(true));$("#notesClose").addEventListener("click",()=>toggleNotes(false));
    $("#notesArea").addEventListener("input",()=>{clearTimeout(window.__noteTimer);window.__noteTimer=setTimeout(saveNotes,350)});$("#exportNotes").addEventListener("click",exportNotes);
    document.addEventListener("keydown",event=>{if(event.key==="Escape"){toggleDrawer(false);toggleNotes(false)}});
  }
  function init(){
    $("#notesArea").value=localStorage.getItem(notesKey)||"";renderModules();renderMap();renderDrawer();updateProgress();bindEvents();setMode(state.mode);
    if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("./sw.js",{updateViaCache:"none"}).catch(()=>{}));
  }
  init();
})();
