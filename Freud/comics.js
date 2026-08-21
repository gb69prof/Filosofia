(()=>{
  'use strict';
  const images=['comic-01-fisiologia.webp','comic-02-charcot.webp','comic-03-breuer.webp','comic-04-sogni.webp','comic-05-mercoledi.webp','comic-06-jung.webp','comic-07-esilio.webp','comic-08-londra.webp'];
  const srcFor=i=>(window.FREUD_COMIC_IMAGES&&window.FREUD_COMIC_IMAGES[i])||('./assets/comics/'+images[i]);
  const esc=v=>String(v??'').replace(/[&<>'\"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  function render(){
    const D=window.FREUD_DATA,root=document.getElementById('comicStrip');
    if(!D||!root||!Array.isArray(D.comics))return false;
    root.innerHTML=D.comics.map((c,i)=>`<article class="comic-card"><img src="${srcFor(i)}" loading="lazy" decoding="async" alt="Tavola illustrata: ${esc(c.title)}"><div class="comic-card-body"><span class="comic-year">${esc(c.year)}</span><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p><span class="comic-status">${esc(c.status)}</span></div></article>`).join('')+`<aside class="comic-concept" aria-label="Es, Io e Super-io: tre funzioni teoriche"><div class="es"><strong>Es</strong><small>Spinte pulsionali e richieste di soddisfazione. Non è il “male” dentro di noi.</small></div><div class="io"><strong>Io</strong><small>Media fra realtà, Es e Super-io. Non coincide interamente con la coscienza.</small></div><div class="superio"><strong>Super-io</strong><small>Divieti, ideali e autocritica interiorizzati. Non è semplicemente “la morale”.</small></div></aside>`;
    return true;
  }
  const boot=()=>{if(render())return;let tries=0;const id=setInterval(()=>{if(render()||++tries>80)clearInterval(id)},100)};
  if(window.FREUD_DATA_READY)window.FREUD_DATA_READY.then(boot).catch(()=>{});else window.addEventListener('load',boot);
})();
