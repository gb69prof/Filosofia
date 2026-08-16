(()=>{
  const data=window.BACON_DATA;
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const stateKey="bacone-pwa-v1",notesKey="bacone-notes-v1";
  const saved=safeJSON(localStorage.getItem(stateKey),{});
  const state={mode:saved.mode||"amateur",completed:new Set(saved.completed||[]),map:saved.map||data.maps[0].id,font:saved.font||"normal",discovery:0,tablePlacements:{},selectedCase:null,idolIndex:0,idolScore:0};
  let toastTimer,installPrompt;

  function safeJSON(value,fallback){try{return value?JSON.parse(value):fallback}catch(_){return fallback}}
  function escapeHTML(value){return String(value).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]))}
  function persist(){localStorage.setItem(stateKey,JSON.stringify({mode:state.mode,completed:[...state.completed],map:state.map,font:state.font}))}
  function say(message){const toast=$("#toast");clearTimeout(toastTimer);toast.textContent=message;toast.classList.add("show");toastTimer=setTimeout(()=>toast.classList.remove("show"),2600)}
  function openDialog(html){$("#dialogContent").innerHTML=html;const dialog=$("#contentDialog");if(!dialog.open)dialog.showModal();setTimeout(()=>$("#dialogContent h2")?.focus?.(),20)}
  function closeDialog(dialog){if(dialog?.open)dialog.close()}

  function renderDiscovery(){
    const host=$("#discovery");
    if(state.discovery>=data.discovery.length){host.innerHTML=`<span class="discovery-step">Esito · La mente sotto osservazione</span><h3>Hai fatto il primo gesto baconiano</h3><div class="discovery-result"><strong>Non fidarti della spontaneità del giudizio.</strong><p>Gli idoli non scompaiono perché li conosciamo. Servono procedure: definire le parole, cercare casi contrari, confrontare condizioni e lasciare che l’evidenza modifichi l’ipotesi.</p></div><div class="lab-actions"><button class="primary" data-discovery-reset>Ricomincia</button><a class="secondary-button" href="#studio">Vai al percorso</a></div>`;return}
    const step=data.discovery[state.discovery];
    host.innerHTML=`<span class="discovery-step">Passaggio ${state.discovery+1} di ${data.discovery.length}</span><h3>${step.title}</h3><p>${step.text}</p><div class="choice-grid">${step.choices.map((choice,index)=>`<button data-discovery-choice="${index}">${choice.label}</button>`).join("")}</div>`;
  }
  function chooseDiscovery(index){
    const step=data.discovery[state.discovery],choice=step.choices[index];if(!choice)return;
    $("#discovery").innerHTML=`<span class="discovery-step">${choice.idol?`Idolo del ${choice.idol}`:"Mossa metodica"}</span><h3>${choice.idol?"La mente è entrata nella prova":"Hai trasformato l’affermazione in un problema"}</h3><div class="discovery-result"><strong>${choice.idol?`Diagnosi: ${choice.idol}`:"Controllo attivato"}</strong><p>${choice.feedback}</p></div><div class="lab-actions"><button class="primary" data-discovery-next>${state.discovery===data.discovery.length-1?"Vedi ciò che resta":"Continua"}</button></div>`;
  }

  function setMode(mode,scroll=false){
    state.mode=mode;persist();$$('[data-mode]').forEach(button=>button.classList.toggle("active",button.dataset.mode===mode));
    $("#modeDescription").textContent=mode==="amateur"?"Spiegazioni chiare, esempi concreti e domande per entrare nel problema.":"Terminologia rigorosa, argomenti, orientamento testuale e cautele storiografiche.";
    renderModules();renderMap();if(scroll)$("#studio").scrollIntoView({behavior:"smooth"});say(mode==="amateur"?"Primo incontro attivo":"Studio filosofico attivo");
  }
  function updateProgress(){const count=data.modules.filter(module=>state.completed.has(module.id)).length,percent=Math.round(count/data.modules.length*100);$("#progressLabel").textContent=`${count} di ${data.modules.length} tappe completate`;$("#progressPercent").textContent=`${percent}%`;$("#progressBar").style.width=`${percent}%`;$("#drawerProgress").textContent=`${percent}%`}
  function renderModules(){
    $("#moduleGrid").innerHTML=data.modules.map(module=>{const copy=module[state.mode];return `<article class="module-card ${state.completed.has(module.id)?"complete":""}" id="module-${module.id}" style="--accent:${module.accent}"><span class="module-index">${module.number} · ${module.kicker}</span><h3>${module.title}</h3><p>${copy.summary}</p><footer><span>${state.mode==="amateur"?"Primo incontro":"Studio filosofico"}</span><button data-open-module="${module.id}" aria-label="Apri ${module.title}">→</button></footer></article>`}).join("");updateProgress()
  }
  function openModule(id){
    const module=data.modules.find(item=>item.id===id);if(!module)return;const copy=module[state.mode];
    const body=state.mode==="amateur"?`<p class="dialog-question">${module.question}</p><p>${copy.narrative}</p><h3>Il movimento dell’idea</h3><ol>${copy.beats.map(beat=>`<li>${beat}</li>`).join("")}</ol><h3>Un esempio per pensare</h3><p class="dialog-example">${copy.example}</p><h3>Ciò che deve restare</h3><p class="source-note">${copy.checkpoint}</p>`:`<p class="dialog-question">${module.question}</p><p>${copy.summary}</p><h3>Nuclei concettuali</h3><ul>${copy.concepts.map(concept=>`<li>${concept}</li>`).join("")}</ul><h3>Argomento</h3><p class="dialog-example">${copy.argument}</p><h3>Orientamento testuale</h3><p class="source-note">${copy.source}</p><h3>Errore da evitare</h3><p class="dialog-warning">${copy.warning}</p>`;
    openDialog(`<p class="eyebrow dark">Tappa ${module.number} · ${module.kicker}</p><h2 tabindex="-1">${module.title}</h2>${body}<div class="lesson-actions"><button data-toggle-complete="${module.id}" class="${state.completed.has(module.id)?"complete":""}">${state.completed.has(module.id)?"✓ Tappa completata":"Segna come completata"}</button><button data-note-module="${module.id}">Porta la domanda nel taccuino</button></div>`)
  }
  function toggleComplete(id){state.completed.has(id)?state.completed.delete(id):state.completed.add(id);persist();renderModules();const button=$(`[data-toggle-complete="${id}"]`);if(button){button.classList.toggle("complete",state.completed.has(id));button.textContent=state.completed.has(id)?"✓ Tappa completata":"Segna come completata"}say(state.completed.has(id)?"Tappa completata":"Tappa riaperta")}

  function renderTablesLab(){
    const placedIds=Object.keys(state.tablePlacements),unplaced=data.tableCases.filter(item=>!placedIds.includes(item.id));
    $("#tablesLab").innerHTML=`<div class="lab-instructions"><div><span class="discovery-step">Fase 1 · Classifica i casi</span><h3>Quale confronto rende utile ogni osservazione?</h3><p>Seleziona un caso, poi scegli la tavola. Puoi spostarlo finché non chiedi il controllo.</p></div><span class="lab-score">${placedIds.length} / ${data.tableCases.length} collocati</span></div><div class="case-bank">${unplaced.map(item=>`<button class="case-token ${state.selectedCase===item.id?"selected":""}" data-case-select="${item.id}">${item.label}</button>`).join("")||"<p>Tutti i casi sono collocati.</p>"}</div><div class="table-columns">${[["presence","Tavola della presenza","Il calore compare"],["absence","Assenza in prossimità","Caso simile senza calore"],["degrees","Tavola dei gradi","Il calore varia"]].map(([id,title,desc])=>`<button class="table-column" data-table-place="${id}"><h4>${title}</h4><p>${desc}</p>${data.tableCases.filter(item=>state.tablePlacements[item.id]===id).map(item=>`<span class="placed">${item.label}</span>`).join("")}</button>`).join("")}</div><p class="lab-feedback" id="tableFeedback">${state.selectedCase?"Ora scegli una tavola.":""}</p><div class="lab-actions"><button data-table-reset>Ricomincia</button><button class="primary" data-table-check ${placedIds.length<data.tableCases.length?"disabled":""}>Controlla ed escludi</button></div>`
  }
  function placeCase(table){if(!state.selectedCase){say("Seleziona prima un caso");return}state.tablePlacements[state.selectedCase]=table;state.selectedCase=null;renderTablesLab()}
  function checkTables(){
    const wrong=data.tableCases.filter(item=>state.tablePlacements[item.id]!==item.table);
    if(wrong.length){$("#tableFeedback").innerHTML=`Rivedi ${wrong.length===1?"questo caso":"questi casi"}: <strong>${wrong.map(item=>item.label).join(", ")}</strong>. Chiediti se il fenomeno compare, manca in un caso vicino oppure varia per intensità.`;return}
    $("#tablesLab").innerHTML=`<span class="discovery-step">Fase 2 · Esclusione</span><h3>La luce non può essere la forma del calore</h3><p>La luce compare nei raggi lunari senza produrre il calore dei raggi solari; il calore compare inoltre nell’acqua e nello sfregamento senza dipendere sempre da una luce visibile. L’ipotesi “calore = luce” va esclusa.</p><div class="hypothesis"><span class="dialog-tag">Prima vendemmia</span><h4>Il calore appare legato a una specie di movimento delle parti.</h4><p>Non è il raccolto definitivo. Questa ipotesi deve ora guidare casi più penetranti: pressione, sfregamento, espansione, combustione e variazioni controllate.</p></div><div class="lab-actions"><button data-table-reset>Ripeti il laboratorio</button><button class="primary" data-open-module="vendemmia">Studia la prima vendemmia</button></div>`;say("Classificazione corretta: ora l’ipotesi può essere messa alla prova")
  }
  function resetTables(){state.tablePlacements={};state.selectedCase=null;renderTablesLab()}

  function renderIdolsLab(){
    const item=data.idolCases[state.idolIndex];
    if(!item){$("#idolsLab").innerHTML=`<span class="discovery-step">Esito</span><h3>${state.idolScore} casi letti correttamente su ${data.idolCases.length}</h3><p>${state.idolScore===data.idolCases.length?"Hai distinto bene le quattro famiglie.":"Il nome dell’idolo serve soltanto se chiarisce il meccanismo dell’errore. Riprova guardando la provenienza della distorsione."}</p><div class="hypothesis"><strong>Avvertenza storica</strong><p>Bias di conferma, algoritmi e disinformazione sono applicazioni contemporanee. Aiutano a pensare con Bacone, ma non sono concetti che il filosofo secentesco abbia formulato nei termini attuali.</p></div><div class="lab-actions"><button class="primary" data-idol-reset>Ricomincia</button></div>`;return}
    $("#idolsLab").innerHTML=`<div class="idol-round"><div><span class="discovery-step">Caso ${state.idolIndex+1} di ${data.idolCases.length}</span><h3>Da dove nasce la distorsione?</h3><p class="idol-case">${item.text}</p><p class="lab-feedback" id="idolFeedback"></p></div><div class="idol-options">${["Tribù","Caverna","Mercato","Teatro"].map(name=>`<button data-idol-answer="${name}">${name}</button>`).join("")}</div></div>`
  }
  function answerIdol(answer){const item=data.idolCases[state.idolIndex],correct=answer===item.answer;if(correct)state.idolScore++;$("#idolFeedback").innerHTML=`<strong>${correct?"Corretto":"Non ancora"}: ${item.answer}</strong><br>${item.why}<br><button class="secondary-button" data-idol-next>Continua</button>`;$$('[data-idol-answer]').forEach(button=>button.disabled=true)}
  function resetIdols(){state.idolIndex=0;state.idolScore=0;renderIdolsLab()}
  function setLab(name){$$('[data-lab-tab]').forEach(button=>{const active=button.dataset.labTab===name;button.classList.toggle("active",active);button.setAttribute("aria-selected",String(active))});$("#tablesLab").hidden=name!=="tables";$("#idolsLab").hidden=name!=="idols"}

  function renderSources(){$("#sourceGrid").innerHTML=data.sources.map((item,index)=>`<article class="source-card"><span class="source-type">${item.type}</span><h3>${item.title}</h3><blockquote>${item.quote}</blockquote><p><strong>${item.ref}</strong></p><button data-source="${index}">Apri il contesto</button></article>`).join("")}
  function openSource(index){const item=data.sources[index];if(!item)return;openDialog(`<span class="dialog-tag">${item.type}</span><h2 tabindex="-1">${item.title}</h2><p class="dialog-question">${item.quote}</p><h3>Riferimento</h3><p>${item.ref}</p><h3>Perché è importante</h3><p>${item.note}</p><p class="dialog-warning">Le traduzioni brevi sono adattamenti didattici. Per lo studio testuale usa le edizioni accademiche indicate nella sezione Fonti.</p>`)}
  function renderComics(){$("#comicStrip").innerHTML=data.comics.map((item,index)=>`<article class="comic-panel" data-symbol="${item.symbol}" style="--panel-bg:${index%2?"linear-gradient(145deg,#123c3e,#061719)":"linear-gradient(145deg,#3b2d22,#071719)"};--panel-glow:${index%3?"#c9954244":"#7fabb644"}"><span class="scene">Scena ${index+1} · ${item.year}</span><h3>${item.title}</h3><p>${item.text}</p><button data-comic="${index}" aria-label="Apri scena ${index+1}: ${item.title}">Apri</button></article>`).join("")}
  function openComic(index){const item=data.comics[index];if(!item)return;openDialog(`<p class="eyebrow dark">Scena ${index+1} · ${item.year}</p><h2 tabindex="-1">${item.title}</h2><p class="dialog-question">${item.text}</p><p>${item.detail}</p><p class="source-note">La scena distingue fatti documentati e interpretazione didattica; non attribuisce alla biografia il valore di una dimostrazione filosofica.</p>`)}

  function renderMapTabs(){$("#mapTabs").innerHTML=data.maps.map(map=>`<button data-map="${map.id}" class="${map.id===state.map?"active":""}"><span>Mappa ${map.number}</span>${map.title}</button>`).join("")}
  function renderMap(){const map=data.maps.find(item=>item.id===state.map)||data.maps[0];$("#conceptMap").innerHTML=`<p class="eyebrow">Mappa ${map.number} · ${state.mode==="amateur"?"Primo incontro":"Studio filosofico"}</p><h3>${map.title}</h3><p class="map-intro">${map.intro}</p><div class="map-flow">${map.nodes.map((node,index)=>`<button class="map-node" data-map-node="${index}"><span>${node.tag}</span><strong>${node.label}</strong><small>${node.short}</small></button>`).join("")}</div><div class="map-detail" id="mapDetail"><p>Scegli un nodo per aprirne il significato.</p></div>`;renderMapTabs()}
  function selectMap(id){if(!data.maps.some(map=>map.id===id))return;state.map=id;persist();renderMap()}
  function openMapNode(index){const map=data.maps.find(item=>item.id===state.map),node=map?.nodes[index];if(!node)return;$$('.map-node').forEach((button,i)=>button.classList.toggle("active",i===index));$("#mapDetail").innerHTML=`<h4>${node.label}</h4><p>${node[state.mode]}</p><p><strong>Funzione:</strong> ${node.short}.</p>`}

  function glossaryHTML(letter){const letters=[...new Set(data.glossary.map(([term])=>term[0]))].sort((a,b)=>a.localeCompare(b,"it")),active=letter||letters[0],items=data.glossary.filter(([term])=>term.startsWith(active));return `<p class="eyebrow dark">Dizionario filosofico</p><h2 tabindex="-1">Le parole di Bacone</h2><p>Una parola è utile quando rende possibile una distinzione che prima non vedevamo.</p><div class="glossary-filter">${letters.map(l=>`<button data-letter="${l}" class="${l===active?"active":""}">${l}</button>`).join("")}</div><div class="tool-content-list">${items.map(([term,definition])=>`<article class="tool-item"><h3>${term}</h3><p>${definition}</p><button class="secondary-button" data-save-term="${escapeHTML(term)}">Salva nel taccuino</button></article>`).join("")}</div>`}
  function timelineHTML(){return `<p class="eyebrow dark">Linea del tempo</p><h2 tabindex="-1">Una vita nel cantiere della modernità</h2><div class="tool-content-list">${data.timeline.map(([year,text])=>`<article class="tool-item"><h3>${year}</h3><p>${text}</p></article>`).join("")}</div>`}
  function libraryHTML(){return `<p class="eyebrow dark">Biblioteca delle opere</p><h2 tabindex="-1">Un progetto, molti cantieri</h2><div class="tool-content-list">${data.library.map(book=>`<article class="tool-item"><span class="dialog-tag">${book.year} · ${book.role}</span><h3>${book.title}</h3><p>${book.desc}</p></article>`).join("")}</div>`}
  function comparisonsHTML(){return `<p class="eyebrow dark">Confronti</p><h2 tabindex="-1">Bacone non pensa da solo</h2><div class="comparison-grid">${data.comparisons.map(item=>`<article class="tool-item"><h3>${item.name}</h3><p><strong>Il terreno:</strong> ${item.before}</p><p><strong>La mossa baconiana:</strong> ${item.bacon}</p><p><strong>La distinzione:</strong> ${item.after}</p></article>`).join("")}</div>`}
  function sourcesHTML(){return `<p class="eyebrow dark">Fonti verificate</p><h2 tabindex="-1">Università e archivi accademici</h2><p>I contenuti sono stati verificati sulle fonti effettivamente elencate qui sotto. Il documento di partenza è stato usato come traccia, non come autorità bibliografica.</p><div class="tool-content-list">${data.academicSources.map(source=>`<article class="tool-item"><span class="dialog-tag">${source.institution}</span><h3>${source.title}</h3><p>${source.use}</p><a href="${source.url}" target="_blank" rel="noopener">Apri la fonte universitaria ↗</a></article>`).join("")}</div>`}
  function quizHTML(){return `<p class="eyebrow dark">Verifica finale</p><h2 tabindex="-1">Dodici domande per ricostruire il metodo</h2><p>Ogni risposta apre una spiegazione. Il recupero finale indica le tappe da riaprire.</p><div class="tool-content-list" id="quizList">${data.quiz.map((item,index)=>`<article class="tool-item" data-quiz-item="${index}"><h3>${index+1}. ${item.q}</h3><div class="quiz-options">${item.options.map((option,i)=>`<button data-quiz="${index}" data-option="${i}">${option}</button>`).join("")}</div><p class="feedback" id="quizFeedback${index}"></p></article>`).join("")}</div><div class="quiz-score" id="quizScore">Risposte date: 0 / ${data.quiz.length}</div>`}
  function openTool(tool){const html=tool==="glossary"?glossaryHTML():tool==="timeline"?timelineHTML():tool==="library"?libraryHTML():tool==="comparisons"?comparisonsHTML():tool==="sources"?sourcesHTML():quizHTML();openDialog(html)}

  const quizState={answers:new Map()};
  function answerQuiz(questionIndex,optionIndex){if(quizState.answers.has(questionIndex))return;const item=data.quiz[questionIndex],correct=optionIndex===item.answer;quizState.answers.set(questionIndex,{correct,module:item.module});const article=$(`[data-quiz-item="${questionIndex}"]`);$$('[data-quiz]',article).forEach((button,index)=>{button.disabled=true;if(index===item.answer)button.classList.add("correct");else if(index===optionIndex)button.classList.add("wrong")});$(`#quizFeedback${questionIndex}`).innerHTML=`<strong>${correct?"Corretto":"Da rivedere"}.</strong> ${item.explain}`;updateQuizScore()}
  function updateQuizScore(){const count=quizState.answers.size,correct=[...quizState.answers.values()].filter(item=>item.correct).length,host=$("#quizScore");if(count<data.quiz.length){host.textContent=`Risposte date: ${count} / ${data.quiz.length} · Corrette: ${correct}`;return}const missed=[...new Set([...quizState.answers.values()].filter(item=>!item.correct).map(item=>item.module))];host.innerHTML=`<strong>Risultato: ${correct} / ${data.quiz.length}</strong>${missed.length?`<p>Recupero consigliato:</p><div class="recovery-list">${missed.map(id=>{const module=data.modules.find(item=>item.id===id);return `<a href="#module-${id}" data-quiz-review="${id}">Tappa ${module.number} · ${module.title}</a>`}).join("")}</div>`:"<p>Hai ricostruito con precisione l’intero percorso.</p>"}<button class="secondary-button" data-quiz-reset>Ripeti la verifica</button>`}
  function resetQuiz(){quizState.answers.clear();$("#dialogContent").innerHTML=quizHTML()}

  function renderDrawer(){$("#drawerNav").innerHTML=`<a href="#scopro"><strong>01 · Scopro</strong><small>La notizia che volevi vera</small></a><a href="#studio"><strong>02 · Studio</strong><small>Dodici tappe a due livelli</small></a><a href="#laboratorio"><strong>03 · Laboratorio</strong><small>Tavole e idoli</small></a><a href="#fonti"><strong>04 · Approfondisco</strong><small>Testi e interpretazioni</small></a><a href="#fumetti"><strong>05 · A fumetti</strong><small>Otto scene biografiche</small></a><a href="#mappe"><strong>06 · Mappe</strong><small>Quattro movimenti concettuali</small></a><a href="#strumenti"><strong>07 · Strumenti</strong><small>Dizionario, confronti e verifica</small></a>`}
  function toggleDrawer(open){const drawer=$("#drawer");drawer.classList.toggle("open",open);drawer.setAttribute("aria-hidden",String(!open));$("#menuButton").setAttribute("aria-expanded",String(open));if(open)setTimeout(()=>$("#drawerClose").focus(),30)}
  function toggleNotes(open){const panel=$("#notesPanel");panel.classList.toggle("open",open);panel.setAttribute("aria-hidden",String(!open));if(open)setTimeout(()=>$("#notesArea").focus(),150)}
  function saveNotes(){localStorage.setItem(notesKey,$("#notesArea").value);$("#notesStatus").textContent="Salvato";setTimeout(()=>$("#notesStatus").textContent="",1000)}
  function addNote(text){const area=$("#notesArea");area.value+=(area.value.trim()?"\n\n":"")+text;saveNotes();say("Aggiunto al taccuino")}
  function exportNotes(){const content=`Taccuino — Francesco Bacone\n\n${$("#notesArea").value}`,blob=new Blob([content],{type:"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="taccuino-bacone.txt";link.click();URL.revokeObjectURL(url);say("Taccuino esportato")}

  function openSearch(){const dialog=$("#searchDialog");if(!dialog.open)dialog.showModal();setTimeout(()=>$("#searchInput").focus(),30)}
  function runSearch(query){const q=query.trim().toLocaleLowerCase("it");if(q.length<2){$("#searchResults").innerHTML="<p>Scrivi almeno due lettere.</p>";return}const results=[];data.modules.forEach(module=>{if(JSON.stringify(module).toLocaleLowerCase("it").includes(q))results.push({type:"module",id:module.id,title:module.title,meta:module.question})});data.glossary.forEach(([term,definition])=>{if((term+" "+definition).toLocaleLowerCase("it").includes(q))results.push({type:"term",id:term[0],title:term,meta:definition})});data.library.forEach(book=>{if(JSON.stringify(book).toLocaleLowerCase("it").includes(q))results.push({type:"library",id:"library",title:book.title,meta:book.desc})});$("#searchResults").innerHTML=results.length?results.slice(0,18).map(result=>`<button data-search-type="${result.type}" data-search-id="${escapeHTML(result.id)}"><strong>${result.title}</strong><small>${result.meta}</small></button>`).join(""):"<p>Nessun risultato. Prova una parola più generale.</p>"}

  function hotspot(name){const content={book:["Il vecchio sapere","Una biblioteca può custodire secoli di ricerca; diventa un ostacolo soltanto quando decide in anticipo che cosa la natura deve mostrare."],bee:["L’ape","Non accumula come la formica e non tesse da sé come il ragno: raccoglie il materiale e lo trasforma."],light:["L’esperienza costruita","La nuova luce non è intuizione improvvisa. Nasce da strumenti, tavole, esclusioni e prove capaci di correggere la mente."]}[name];if(content)openDialog(`<p class="eyebrow dark">Copertina interattiva</p><h2 tabindex="-1">${content[0]}</h2><p class="dialog-question">${content[1]}</p>`)}
  function setFont(){state.font=state.font==="large"?"normal":"large";document.body.classList.toggle("large-text",state.font==="large");persist();say(state.font==="large"?"Testo ingrandito":"Dimensione normale")}

  function bindEvents(){
    document.addEventListener("click",event=>{
      const target=event.target.closest("button,a");if(!target)return;
      if(target.matches('[data-mode]'))setMode(target.dataset.mode);
      else if(target.matches('[data-open-module]'))openModule(target.dataset.openModule);
      else if(target.matches('[data-toggle-complete]'))toggleComplete(target.dataset.toggleComplete);
      else if(target.matches('[data-note-module]')){const module=data.modules.find(item=>item.id===target.dataset.noteModule);addNote(`Tappa ${module.number} — ${module.question}`)}
      else if(target.matches('[data-discovery-choice]'))chooseDiscovery(Number(target.dataset.discoveryChoice));
      else if(target.matches('[data-discovery-next]')){state.discovery++;renderDiscovery()}
      else if(target.matches('[data-discovery-reset]')){state.discovery=0;renderDiscovery()}
      else if(target.matches('[data-lab-tab]'))setLab(target.dataset.labTab);
      else if(target.matches('[data-case-select]')){state.selectedCase=target.dataset.caseSelect;renderTablesLab()}
      else if(target.matches('[data-table-place]'))placeCase(target.dataset.tablePlace);
      else if(target.matches('[data-table-check]'))checkTables();
      else if(target.matches('[data-table-reset]'))resetTables();
      else if(target.matches('[data-idol-answer]'))answerIdol(target.dataset.idolAnswer);
      else if(target.matches('[data-idol-next]')){state.idolIndex++;renderIdolsLab()}
      else if(target.matches('[data-idol-reset]'))resetIdols();
      else if(target.matches('[data-source]'))openSource(Number(target.dataset.source));
      else if(target.matches('[data-comic]'))openComic(Number(target.dataset.comic));
      else if(target.matches('[data-map]'))selectMap(target.dataset.map);
      else if(target.matches('[data-map-node]'))openMapNode(Number(target.dataset.mapNode));
      else if(target.matches('[data-tool]'))openTool(target.dataset.tool);
      else if(target.matches('[data-letter]'))$("#dialogContent").innerHTML=glossaryHTML(target.dataset.letter);
      else if(target.matches('[data-save-term]')){const item=data.glossary.find(([term])=>term===target.dataset.saveTerm);if(item)addNote(`• ${item[0]}: ${item[1]}`)}
      else if(target.matches('[data-quiz]'))answerQuiz(Number(target.dataset.quiz),Number(target.dataset.option));
      else if(target.matches('[data-quiz-reset]'))resetQuiz();
      else if(target.matches('[data-quiz-review]')){event.preventDefault();closeDialog($("#contentDialog"));setTimeout(()=>openModule(target.dataset.quizReview),80)}
      else if(target.matches('[data-search-type]')){const type=target.dataset.searchType,id=target.dataset.searchId;closeDialog($("#searchDialog"));if(type==="module")openModule(id);else if(type==="term")openTool("glossary");else openTool("library")}
      else if(target.matches('[data-hotspot]'))hotspot(target.dataset.hotspot);
      if(target.closest('#drawerNav'))toggleDrawer(false);
    });
    $("#menuButton").addEventListener("click",()=>toggleDrawer(true));$("#indexButton").addEventListener("click",()=>toggleDrawer(true));$("#drawerClose").addEventListener("click",()=>toggleDrawer(false));$("#drawer").addEventListener("click",event=>{if(event.target===$("#drawer"))toggleDrawer(false)});
    $("#notesButton").addEventListener("click",()=>toggleNotes(true));$("#notesClose").addEventListener("click",()=>toggleNotes(false));$("#notesArea").addEventListener("input",saveNotes);$("#exportNotes").addEventListener("click",exportNotes);
    $("#fontButton").addEventListener("click",setFont);$("#searchButton").addEventListener("click",openSearch);$("#searchInput").addEventListener("input",event=>runSearch(event.target.value));$("#searchClose").addEventListener("click",()=>closeDialog($("#searchDialog")));$("#dialogClose").addEventListener("click",()=>closeDialog($("#contentDialog")));
    $("#contentDialog").addEventListener("click",event=>{if(event.target===$("#contentDialog"))closeDialog(event.target)});$("#searchDialog").addEventListener("click",event=>{if(event.target===$("#searchDialog"))closeDialog(event.target)});
    addEventListener("keydown",event=>{if(event.key==="Escape"){toggleDrawer(false);toggleNotes(false)}});
    addEventListener("beforeinstallprompt",event=>{event.preventDefault();installPrompt=event});$("#installButton").addEventListener("click",async()=>{if(!installPrompt){say("Usa il comando ‘Aggiungi alla schermata Home’ del browser");return}installPrompt.prompt();await installPrompt.userChoice;installPrompt=null});addEventListener("appinstalled",()=>say("Bacone è stato installato"));
  }

  function init(){
    if(state.font==="large")document.body.classList.add("large-text");$("#notesArea").value=localStorage.getItem(notesKey)||"";
    renderDiscovery();renderModules();renderTablesLab();renderIdolsLab();renderSources();renderComics();renderMap();renderDrawer();bindEvents();
    if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
  }
  init();
})();
