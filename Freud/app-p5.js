('#searchClose').addEventListener('click',()=>d.close());input.addEventListener('input',()=>runSearch(input.value));}

  function setupControls(){
    $$('[data-mode]').forEach(b=>b.addEventListener('click',()=>{state.mode=b.dataset.mode;saveState();$$('[data-mode]').forEach(x=>x.classList.toggle('active',x===b));$('#modeDescription').textContent=state.mode==='amateur'?'Una narrazione chiara, esempi fittizi e concetti essenziali per entrare nel problema.':'Lessico specifico, riferimenti, trasformazioni teoriche e avvertenze metodologiche.';renderModules();}));
    $$('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.mode));$('#modeDescription').textContent=state.mode==='amateur'?'Una narrazione chiara, esempi fittizi e concetti essenziali per entrare nel problema.':'Lessico specifico, riferimenti, trasformazioni teoriche e avvertenze metodologiche.';
    document.documentElement.style.setProperty('--font-scale',state.font);$('#fontButton').addEventListener('click',()=>{state.font=state.font>=1.18?.94:Number((state.font+.08).toFixed(2));document.documentElement.style.setProperty('--font-scale',state.font);saveState();toast(`Dimensione testo ${Math.round(state.font*100)}%`);});
    $$('[data-hotspot]').forEach(b=>b.addEventListener('click',()=>{const x=D.hotspots[b.dataset.hotspot];showDialog(`<p class="dialog-kicker">${esc(x.kicker)}</p><h2 class="dialog-title">${esc(x.title)}</h2><p class="dialog-lead">${esc(x.text)}</p>`);}));
    $$('[data-tool]').forEach(b=>b.addEventListener('click',()=>openTool(b.dataset.tool)));$('#dialogClose').addEventListener('click',()=>closeDialog());
    $('#contentDialog').addEventListener('close',()=>lastFocus?.focus?.());
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('#drawer').classList.contains('open'))$('#drawerClose').click();if($('#notesPanel').classList.contains('open'))$('#notesClose').click();if($('#conceptMap').classList.contains('expanded')){$('#conceptMap').classList.remove('expanded');$('#mapExpand').textContent='Ingrandisci la mappa';}}});
  }
  function setupInstall(){
    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;});
    $('#installButton').addEventListener('click',async()=>{if(!deferredInstall){toast('Su iPad usa Condividi → Aggiungi alla schermata Home');return;}deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;});
    if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>toast('Modalità offline non disponibile in questo contesto')));
  }

  renderDiscovery();renderModules();setupLabs();renderSources();renderComics();renderMaps();setupPanels();setupSearch();setupControls();setupInstall();
})();
