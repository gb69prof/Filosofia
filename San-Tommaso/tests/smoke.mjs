import {readFile,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const required=['index.html','manifest.webmanifest','sw.js','css/main.css','js/app.js','data/content.js','data/sources.json','assets/icons/icon.svg','assets/images/tommaso-hero.webp','assets/images/tommaso-hero.jpg','assets/images/mondo-tommaso.webp','assets/images/mondo-tommaso.jpg','assets/images/fumetto-01-06.webp','assets/images/fumetto-01-06.jpg','assets/images/fumetto-07-12.webp','assets/images/fumetto-07-12.jpg'];
for(const file of required)await access(resolve(root,file));
const index=await readFile(resolve(root,'index.html'),'utf8');
const sw=await readFile(resolve(root,'sw.js'),'utf8');
const content=await readFile(resolve(root,'data/content.js'),'utf8');
const manifest=JSON.parse(await readFile(resolve(root,'manifest.webmanifest'),'utf8'));
const sources=JSON.parse(await readFile(resolve(root,'data/sources.json'),'utf8'));

const checks=[
  ['lingua italiana',index.includes('<html lang="it"')],
  ['manifest relativo',manifest.start_url==='.'||manifest.start_url==='./'],
  ['scope relativo',manifest.scope==='./'],
  ['titolo HTML reale',index.includes("San Tommaso d’Aquino")],
  ['dialog accessibili',index.includes('aria-labelledby="drawerTitle"')],
  ['service worker ignora query nelle navigazioni',sw.includes("url.search=''")],
  ['fallback offline',sw.includes("caches.match('./index.html')")],
  ['cinque affermazioni',([...content.matchAll(/roman:'[IV]+'/g)]).length===5],
  ['undici episodi',content.includes("['Il viaggio verso Lione'")],
  ['fonti primarie',sources.primary.length>=4],
  ['fonti secondarie',sources.secondary.length>=5]
];
const failed=checks.filter(([,ok])=>!ok);
for(const [name,ok] of checks)console.log(`${ok?'✓':'✗'} ${name}`);
if(failed.length){console.error(`\n${failed.length} controlli falliti.`);process.exit(1)}
console.log(`\n${checks.length} controlli superati.`);
