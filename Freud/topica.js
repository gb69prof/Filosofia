(()=>{
  'use strict';
  const cases=[
    {scene:'Marco deve studiare per un esame, ma sente un forte impulso a uscire con gli amici e dimenticare tutto per una sera.',q:'Quale istanza descrive meglio la spinta alla soddisfazione immediata?',a:'es',why:'Nel modello della seconda topica l’Es rappresenta il polo pulsionale e la richiesta di soddisfazione, non un “personaggio cattivo”.'},
    {scene:'Marta ha consegnato un lavoro buono, ma continua a ripetersi: “Non è abbastanza. Avrei dovuto fare tutto perfettamente”.',q:'Quale funzione è più vicina alla pressione critica e ideale descritta qui?',a:'superio',why:'Il Super-io è legato a divieti, ideali e funzioni critiche interiorizzate. Non coincide semplicemente con la morale cosciente.'},
    {scene:'Luca vorrebbe rispondere impulsivamente a un messaggio offensivo, ma valuta le conseguenze, rimanda la risposta e cerca una soluzione praticabile.',q:'Quale funzione è rappresentata dalla mediazione fra impulso, realtà e vincoli?',a:'io',why:'L’Io media fra richieste pulsionali, realtà e Super-io. Importante: l’Io non è interamente cosciente.'},
    {scene:'Una persona desidera qualcosa, teme la propria autocritica e sceglie un compromesso che non soddisfa completamente nessuna delle due pressioni.',q:'Che cosa mostra meglio questa situazione?',a:'conflitto',why:'La seconda topica è soprattutto un modello dinamico del conflitto. Es, Io e Super-io non sono tre organi separati né tre voci letterali nella testa.'}
  ];
  let i=0;
  const root=document.getElementById('topicaLab');
  if(!root)return;
  const labels={es:'Es',io:'Io',superio:'Super-io',conflitto:'Conflitto fra istanze'};
  function render(){
    const c=cases[i];
    root.innerHTML=`<div class="topica-lab-head"><div><span class="rail-label">Caso ${i+1} di ${cases.length}</span><h3>Chi sta facendo pressione?</h3></div><strong>${i+1}/${cases.length}</strong></div><div class="topica-case"><p>${c.scene}</p><strong>${c.q}</strong></div><div class="topica-options">${['es','io','superio','conflitto'].filter(x=>x==='conflitto'?i===3:true).map(x=>`<button type="button" data-topica-answer="${x}">${labels[x]}</button>`).join('')}</div><div class="topica-feedback" id="topicaFeedback" aria-live="polite">Scegli una risposta: il laboratorio applica il modello freudiano a situazioni inventate, non diagnostica persone.</div><div class="topica-nav"><button type="button" data-topica-nav="prev" ${i===0?'disabled':''}>← Prima</button><button type="button" data-topica-nav="next" ${i===cases.length-1?'disabled':''}>Dopo →</button></div>`;
    root.querySelectorAll('[data-topica-answer]').forEach(b=>b.addEventListener('click',()=>{
      root.querySelectorAll('[data-topica-answer]').forEach(x=>x.classList.remove('correct','wrong'));
      const ok=b.dataset.topicaAnswer===c.a;b.classList.add(ok?'correct':'wrong');
      root.querySelector('#topicaFeedback').textContent=(ok?'Esatto. ':'Non ancora. ')+c.why;
      try{localStorage.setItem('freud-topica-case',String(i));}catch(_){}
    }));
    root.querySelectorAll('[data-topica-nav]').forEach(b=>b.addEventListener('click',()=>{i+=b.dataset.topicaNav==='next'?1:-1;render();}));
  }
  try{i=Math.min(Number(localStorage.getItem('freud-topica-case')||0),cases.length-1);}catch(_){}
  render();
})();
