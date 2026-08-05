import {readFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {Window} from 'happy-dom';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=await readFile(resolve(root,'index.html'),'utf8');
const window=new Window({url:'http://127.0.0.1:4173/#/home'});
window.document.write(html);
window.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});
window.scrollTo=()=>{};
Object.defineProperties(globalThis,{
  window:{value:window,configurable:true},document:{value:window.document,configurable:true},
  location:{value:window.location,configurable:true},navigator:{value:window.navigator,configurable:true},
  localStorage:{value:window.localStorage,configurable:true},matchMedia:{value:window.matchMedia,configurable:true},
  scrollTo:{value:window.scrollTo,configurable:true},addEventListener:{value:window.addEventListener.bind(window),configurable:true},
  getSelection:{value:window.getSelection.bind(window),configurable:true},Blob:{value:window.Blob,configurable:true},URL:{value:window.URL,configurable:true}
});

await import(pathToFileURL(resolve(root,'js/app.js')));
if(!document.querySelector('#view h1')?.textContent.includes('San Tommaso'))throw new Error('Home non renderizzata');

for(const [route,expected] of [['scopro','Sei domande'],['studio','Le cinque affermazioni'],['studio/cinque-vie','Dagli effetti'],['dizionario?q=anima','Le parole'],['mondo','Entra, incontra']]){
  location.hash=`#/${route}`;
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  await window.happyDOM.whenAsyncComplete();
  const heading=document.querySelector('#view h1')?.textContent||'';
  if(!heading.includes(expected))throw new Error(`${route}: titolo inatteso “${heading}”`);
  console.log(`✓ ${route}: ${heading.trim()}`);
}

location.hash='#/scopro';window.dispatchEvent(new window.HashChangeEvent('hashchange'));
document.querySelector('.reveal-discovery').click();
if(document.querySelector('.discovery-answer').hidden)throw new Error('Risposta Scopro non aperta');
console.log('✓ interazione Scopro');

location.hash='#/studio/cinque-vie';window.dispatchEvent(new window.HashChangeEvent('hashchange'));
document.querySelector('.answer').click();
if(!document.querySelector('.feedback').textContent.trim())throw new Error('Feedback quiz assente');
console.log('✓ feedback quiz');

location.hash='#/mondo';window.dispatchEvent(new window.HashChangeEvent('hashchange'));
document.querySelector('.hotspot').click();
if(document.querySelector('#worldCaption strong').textContent==='Scegli un luogo')throw new Error('Hotspot non attivo');
console.log('✓ hotspot esplorazione');
