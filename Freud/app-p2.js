ion module-check" data-module-check="${m.id}"><h3>Controllo rapido</h3><p>${esc(check.q)}</p><div class="quiz-options">${check.options.map((o,n)=>`<label><input type="radio" name="check-${m.id}" value="${n}"> <span>${esc(o)}</span></label>`).join('')}</div><div class="quiz-explanation" hidden></div><div class="recovery-box" hidden></div></div>`,`[name="check-${m.id}"]`);
    $$(`[name="check-${m.id}"]`,$('#contentDialog')).forEach(input=>input.addEventListener('change',()=>{
      const n=Number(input.value),ok=n===check.answer,box=input.closest('.module-check'),feedback=$('.quiz-explanation',box),recovery=$('.recovery-box',box);
      feedback.hidden=false; feedback.textContent=(ok?'Esatto. ':'Non ancora. ')+check.why;
      recovery.hidden=ok; recovery.innerHTML=`<strong>Recupero mirato</strong><br>${esc(check.recovery)}`;
      if(ok){toggleComplete(m.id,true);renderModules();toast('Tappa completata');}
    }));
  }

  const dreamProcesses=['condensazione','spostamento','raffigurabilità','elaborazione secondaria'];
  function renderDreamLab(){
    const i=Math.max(0,Math.min(state.dreamCase,D.dreamCases.length-1)),item=D.dreamCases[i];
    $('#dreamLab').innerHTML=`<div class="lab-meter"><span>Caso ${i+1} di ${D.dreamCases.length}</span><strong>${state.dreamDone.length} casi completati</strong></div><h3>${esc(item.title)}</h3><p class="lab-scene">${esc(item.dream)}</p><p class="lab-note">Classifica i quattro indizi applicando il lessico freudiano. Stai esercitando un modello su materiale inventato: non stai scoprendo il significato oggettivo di un sogno.</p><div class="process-grid">${item.items.map((x,n)=>`<div class="process-card"><strong>Indizio ${n+1}</strong><p>${esc(x.clue)}</p><label><span class="sr-only">Processo per indizio ${n+1}</span><select data-dream-answer="${n}"><option value="">Scegli il processo…</option>${dreamProcesses.map(p=>`<option value="${esc(p)}">${esc(p)}</option>`).join('')}</select></label><div data-dream-feedback="${n}"></div></div>`).join('')}</div><div class="lab-feedback" id="dreamSummary" hidden></div><div class="lab-nav"><button class="secondary" data-dream-nav="prev" ${i===0?'disabled':''}>← Caso prima</button><button data-dream-check>Controlla</button><button class="secondary" data-dream-nav="next" ${i===D.dreamCases.length-1?'disabled':''}>Caso dopo →</button></div>`;
    $('[data-dream-check]',$('#dreamLab')).addEventListener('click',()=>{
      let score=0; item.items.forEach((x,n)=>{const v=$(`[data-dream-answer="${n}"]`,$('#dreamLab')).value,ok=v===x.process,f=$(`[data-dream-feedback="${n}"]`,$('#dreamLab'));if(ok)score++;f.innerHTML=`<small>${ok?'✓':'✗'} ${esc(x.why)}</small>`;});
      const summary=$('#dreamSummary'); summary.hidden=false; summary.textContent=`${score} su ${item.items.length}. I processi sono categorie del lavoro onirico freudiano, non misure neurofisiologiche.`;
      if(score===item.items.length){state.dreamDone=[...new Set([...state.dreamDone,i])];saveState();toast('Caso del sogno completato');}
    });
    $$('[data-dream-nav]',$('#dreamLab')).forEach(b=>b.addEventListener('click',()=>{state.dreamCase+=b.dataset.dreamNav==='next'?1:-1;saveState();renderDreamLab();}));
  }

  function shuffledSteps(item,index){
    const orders=[[2,0,4,1,3],[3,1,0,4,2]]; return (orders[index%orders.length]||[4,2,0,3,1]).map(n=>item.steps[n]);
  }
  function renderSymptomLab(){
    const i=Math.max(0,Math.min(state.symptomCase,D.symptomCases.length-1)),item=D.symptomCases[i],bank=shuffledSteps(item,i); symptomSequence=[];
    $('#symptomLab').innerHTML=`<div class="lab-meter"><span>Caso ${i+1} di ${D.symptomCases.length}</span><strong>${state.symptomDone.length} casi completati</strong></div><h3>${esc(item.title)}</h3><p class="lab-scene">${esc(item.scene)}</p><p class="lab-note">Ricostruisci la logica del modello: desiderio/impulso → divieto → rimozione → ritorno deformato → formazione di compromesso. Il caso è fittizio e non autorizza diagnosi.</p><div class="sequence-bank">${bank.map((s,n)=>`<button class="sequence-token" data-seq-token="${n}" data-label="${esc(s.label)}">${esc(s.text)}</button>`).join('')}</div><div class="sequence-output" id="sequenceOutput" aria-label="Sequenza scelta"></div><div class="lab-feedback" id="symptomFeedback" hidden></div><div class="lab-nav"><button class="secondary" data-symptom-nav="prev" ${i===0?'disabled':''}>← Caso prima</button><button class="secondary" data-seq-reset>Reset</button><button data-seq-check>Controlla sequenza</button><button class="secondary" data-symptom-nav="next" ${i===D.symptomCases.length-1?'disabled':''}>Caso dopo →</button></div>`;
    const draw=()=>$('#sequenceOutput').innerHTML=symptomSequence.map((x,n)=>`<span class="sequence-chip">${n+1}. ${esc(x.label)}</span>`).join('');
    $$('[data-seq-token]',$('#symptomLab')).forEach(b=>b.addEventListener('click',()=>{if(b.classList.contains('selected'))return;const step=bank[Number(b.dataset.seqToken)];symptomSequence.push(step);b.classList.add('selected');draw();}));
    $('[data-seq-reset]',$('#symptomLab')).addEventListener('click',()=>{symptomSequence=[];$$('[data-seq-token]',$('#symptomLab')).forEach(b=>b.classList.remove('selected'));draw();$('#symptomFeedback').hidden=true;});
    $('[data-seq-check]',$('#symptomLab')).addEventListener('click',()=>{const expected=['desiderio','divieto','rimozione','ritorno','compromesso'],got=symptomSequence.map(x=>x.label),ok=expected.every((x,n)=>got[n]===x),f=$('#symptomFeedback');f.hidden=false;f.classList.toggle('error',!ok);f.textContent=ok?'Sequenza coerente con il modello freudiano. Ricorda: aver ricostruito la logica non dimostra che essa descriva una persona reale.':'La sequenza non ricostruisce ancora il modello. Parti dalla tendenza, poi dal divieto e dalla difesa; il compromesso viene alla fine.';if(ok){state.symptomDone=[...new Set([...state.symptomDone,i])];saveState();toast('Caso di compromesso completato');}});
    $$('[data-symptom-nav]',$('#symptomLab')).forEach(b=>b.addEventListener('click',()=>{state.symptomCase+=b.dataset.symptomNav==='next'?1:-1;saveState();renderSymptomLab();}));
  }

  const interpCats=['osservazione','inferenza','interpretazione','prova contraria','non falsificabile'];
  function renderInterpretationLab(){
    const i=Math.max(0,Math.min(state.interpCase,D.interpretationCases.length-1)),item=D.interpretationCases[i];
    $('#interpretationLab').innerHTML=`<div class="lab-meter"><span>Caso ${i+1} di ${D.interpretationCases.length}</span><s