#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const ignored = new Set([".git", "node_modules", "dist"]);
function walk(dir, out = []) { for (const entry of fs.readdirSync(dir,{withFileTypes:true})) { if (ignored.has(entry.name)) continue; const file=path.join(dir,entry.name); entry.isDirectory()?walk(file,out):out.push(file); } return out; }
const files=walk(root), html=files.filter(f=>f.endsWith(".html")), failures=[], warnings=[];
for (const file of html) {
  const rel=path.relative(root,file), s=fs.readFileSync(file,"utf8");
  if (!/<html\b[^>]*\blang=["']it(?:-[A-Z]+)?["']/i.test(s)) failures.push(`${rel}: lingua pagina assente o diversa da it`);
  if (!/<title>\s*[^<]+\s*<\/title>/i.test(s)) failures.push(`${rel}: title assente`);
  if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1/i.test(s)) failures.push(`${rel}: zoom bloccato`);
  for (const m of s.matchAll(/<img\b[^>]*>/gi)) if (!/\balt\s*=/.test(m[0])) failures.push(`${rel}: immagine senza alt`);
  for (const m of s.matchAll(/<iframe\b[^>]*>/gi)) { if (!/\btitle\s*=/.test(m[0])) failures.push(`${rel}: iframe senza title`); if (/(?:^|\s)src=["']https?:\/\//i.test(m[0])) failures.push(`${rel}: iframe remoto caricato automaticamente`); }
  if (!/<h1\b/i.test(s) && !/id=["'](?:app|root)["']/.test(s)) warnings.push(`${rel}: H1 non rilevato staticamente`);
}
const manifests=files.filter(f=>/manifest.*\.(?:json|webmanifest)$/i.test(f));
for (const file of manifests) { const rel=path.relative(root,file); let m; try{m=JSON.parse(fs.readFileSync(file,"utf8"));}catch(e){failures.push(`${rel}: JSON non valido (${e.message})`);continue;} for(const k of ["name","short_name","start_url","display"]) if(!m[k]) failures.push(`${rel}: proprietà ${k} assente`); if(!Array.isArray(m.icons)||!m.icons.length) failures.push(`${rel}: icone assenti`); }
const tracker=/google-analytics|googletagmanager|\bgtag\s*\(|\bfbq\s*\(|facebook\.net|matomo|plausible|hotjar|document\.cookie/i;
for(const file of files.filter(f=>/\.(?:html|js|mjs|ts|tsx)$/i.test(f)&&!f.includes(`${path.sep}tools${path.sep}`))) if(tracker.test(fs.readFileSync(file,"utf8"))) failures.push(`${path.relative(root,file)}: possibile tracker/cookie`);
const lines=["# Audit automatico PWA","",`HTML: ${html.length} · manifest: ${manifests.length}`,`Errori automatici: ${failures.length} · avvisi: ${warnings.length}`,"","## Errori rilevati",...(failures.length?failures.map(x=>`- ${x}`):["- Nessun errore rilevato dai controlli automatici."]),"","## Avvisi",...(warnings.length?warnings.map(x=>`- ${x}`):["- Nessun avviso."]),"","_Questo audit automatico non sostituisce la verifica manuale con tastiera, screen reader e dispositivi reali._",""];
fs.writeFileSync(path.join(root,"AUDIT-PWA.md"),lines.join("\n"));
console.log(`Audit scritto: ${failures.length} errori, ${warnings.length} avvisi.`);
