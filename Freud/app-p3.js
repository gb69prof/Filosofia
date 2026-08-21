trong>${state.interpDone.length} casi completati</strong></div><h3>${esc(item.title)}</h3><p class="lab-scene">${esc(item.scene)}</p><p class="lab-note">Classifica ogni frase. Il punto non è “battere Freud”, ma distinguere dato, inferenza e interpretazione e chiedere che cosa potrebbe contare contro un’ipotesi.</p><div class="interpret-grid">${item.claims.map((c,n)=>`<div class="process-card"><strong>Frase ${n+1}</strong><p>${esc(c.text)}</p><select data-interp-answer="${n}"><option value="">Classifica…</option>${interpCats.map(k=>`<option value="${esc(k)}">${esc(k)}</option>`).join('')}</select><div data-interp-feedback="${n}"></div></div>`).join('')}</div><div class="evidence-box"><strong>Domanda di controllo</strong><br>Una spiegazione che interpreta allo stesso modo sia A sia non-A distingue davvero fra possibili stati del mondo?</div><div class="lab-feedback" id="interpSummary" hidden></div><div class="lab-nav"><button class="secondary" data-interp-nav="prev" ${i===0?'disabled':''}>← Caso prima</button><button data-interp-check>Controlla</button><button class="secondary" data-interp-nav="next" ${i===D.interpretationCases.length-1?'disabled':''}>Caso dopo →</button></div>`;
    $('[data-interp-check]',$('#interpretationLab')).addEventListener('click',()=>{let score=0;item.claims.forEach((c,n)=>{const v=$(`[data-interp-answer="${n}"]`,$('#interpretationLab')).value,ok=v===c.category,f=$(`[data-interp-feedback="${n}"]`,$('#interpretationLab'));if(ok)score++;f.innerHTML=`<small>${ok?'✓':'✗'} ${ok?'Classificazione corretta.':`Era: ${esc(c.category)}.`}</small>`;});const s=$('#interpSummary');s.hidden=false;s.classList.toggle('error',score!==item.claims.length);s.textContent=`${score} su ${item.claims.length}. Una buona interpretazione deve dichiarare il salto inferenziale e lasciare aperta la possibilità di essere corretta.`;if(score===item.claims.length){state.interpDone=[...new Set([...state.interpDone,i])];saveState();toast('Caso metodologico completato');}});
    $$('[data-interp-nav]',$('#interpretationLab')).forEach(b=>b.addEventListener('click',()=>{state.interpCase+=b.dataset.interpNav==='next'?1:-1;saveState();renderInterpretationLab();}));
  }
  function setupLabs(){
    renderDreamLab();renderSymptomLab();renderInterpretationLab();
    $$('[data-lab-tab]').forEach(button=>button.addEventListener('click',()=>{
      const tab=button.dataset.labTab;$$('[data-lab-tab]').forEach(b=>{const on=b===button;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));});
      $('#dreamLab').hidden=tab!=='dream';$('#symptomLab').hidden=tab!=='symptom';$('#interpretationLab').hidden=tab!=='interpretation';
      ({dream:'#dreamLab',symptom:'#symptomLab',interpretation:'#interpretationLab'})[tab] && $(({dream:'#dreamLab',symptom:'#symptomLab',interpretation:'#interpretationLab'})[tab])?.focus?.();
    }));
  }

  function renderSources(){
    $('#sourceGrid').innerHTML=D.sources.map((s,i)=>`<article class="source-card" id="source-${i}"><span class="source-kind">${esc(s.kind)}</span><h3>${esc(s.title)}</h3><span class="source-year">${esc(s.year)} · ${esc(s.status)}</span><p><strong>Problema:</strong> ${esc(s.problem)}</p><p><strong>Tesi:</strong> ${esc(s.thesis)}</p><details><summary>Limite o controversia</summary><p>${esc(s.limit)}</p></details><footer><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.source)} ↗</a></footer></article>`).join('');
  }
  function renderComics(){
    $('#comicStrip').innerHTML=D.comics.map(c=>`<article class="comic-card"><span class="comic-year">${esc(c.year)}</span><span class="comic-icon" aria-hidden="true">${esc(c.icon)}</span><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p><span class="comic-status">${esc(c.status)}</span></article>`).join('');
  }
  function renderMaps(){
    $('#mapTabs').innerHTML=D.maps.map(m=>`<button role="tab" data-map="${esc(m.id)}" aria-selected="${m.id===activeMap}">${esc(m.title)}</button>`).join('');
    $$('[data-map]',$('#mapTabs')).forEach(b=>b.addEventListener('click',()=>{activeMap=b.dataset.map;renderMaps();}));
    const m=D.maps.find(x=>x.id===activeMap); const box=$('#conceptMap');
    box.innerHTML=`<h3>${esc(m.title)}</h3><p>${esc(m.intro)}</p><div class="map-nodes">${m.nodes.map(n=>`<div class="map-node"><strong>${esc(n.title)}</strong><span>${esc(n.text)}</span></div>`).join('')}</div><button class="map-expand" id="mapExpand">Ingrandisci la mappa</button>`;
    $$('[data-map]',$('#mapTabs')).forEach(b=>b.classList.toggle('active',b.dataset.map===activeMap));
    $('#mapExpand').addEventListener('click',()=>{const on=box.classList.toggle('expanded');$('#mapExpand').textContent=on?'Riduci la mappa':'Ingrandisci la mappa';if(on)$('#mapExpand').focus();});
  }

  function renderQuiz(){
    const answered=Object.keys(state.quiz).length;
    return `<p class="dialog-kicker">Verifica finale · 12 domande</p><h2 class="dialog-title">Ricostruisci relazioni e limiti</h2><p>Ogni alternativa riceve una spiegazione. Lo stato resta sul dispositivo; puoi riprovare senza perdere il resto del percorso.</p><div id="quizList">${D.quiz.map((q,i)=>`<section class="quiz-question" data-quiz-q="${i}"><h3>${i+1}. ${esc(q.q)}</h3><div class="quiz-options">${q.options.map((o,n)=>`<label><input type="radio" name="quiz-${i}" value="${n}" ${Number(state.quiz[i])===n?'checked':''}> <span>${esc(o.text)}</span></label>`).join('')}</div><div class="quiz-feedback" ${state.quiz[i]===undefined?'hidden':''}></div></section>`).join('')}</div><div class="quiz-summary" id="quizSummary">${answered} di ${D.quiz.length} domande risposte.</div><div class="quiz-actions"><button id="quizEvaluate">Riepiloga e recupera</button><button id="quizRetry">Azzera la verifica</button></div>`;
  }
  function setupQuiz(){
    D.quiz.forEach((q,i)=>$$(`[name="quiz-${i}"]`,$('#contentDialog')).forEach(input=>input.addEventListener('change',()=>{
      const n=Number(input.value),ok=n===q.answer,box=input.closest('.quiz-question'),f=$('.quiz-feedback',box);state.quiz[i]=n;saveState();f.hidden=false;f.classList.toggle('error',!ok);f.textContent=q.options[n].feedback;$('#quizSummary').textContent=`${Object.keys(state.quiz).length} di ${D.quiz.length} domande risposte.`;
    })));
    $('#quizEvaluate')?.addEventListener('click',()=>{let correct=0;const miss=[];D.quiz.forEach((q,i)=>{if(Number(state.quiz[i])===q.answer)correct++;else miss.push(`${i+1}. ${q.recovery}`);});const pct=Math.round(correct/D.quiz.length*100);$('#quizSummary').innerHT