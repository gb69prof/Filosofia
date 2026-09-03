#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const ignored = new Set([".git", "node_modules", "dist", "tools"]);
const names = new Set(["sw.js", "service-worker.js"]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(absolute, out);
    else if (names.has(entry.name.toLowerCase())) out.push(absolute);
  }
  return out;
}

function relativeRoot(file) {
  const value = path.relative(path.dirname(file), root).replaceAll(path.sep, "/");
  return value || ".";
}

function addCommonAssets(source, file) {
  const prefix = relativeRoot(file);
  const required = [
    `${prefix}/pwa-common/gbprof-accessibility.css?v=1`,
    `${prefix}/pwa-common/gbprof-accessibility.js?v=1`,
    `${prefix}/privacy.html`,
    `${prefix}/accessibilita.html`
  ];
  const arrayPattern = /(const\s+(?:LOCAL_ASSETS|CORE_ASSETS|APP_SHELL|CORE|ASSETS|FILES|PRECACHE_URLS)\s*=\s*\[)/;
  if (!arrayPattern.test(source)) return source;
  const missing = required.filter(asset => !source.includes(asset));
  if (!missing.length) return source;
  return source.replace(arrayPattern, `$1\n${missing.map(asset => `  ${JSON.stringify(asset)},`).join("\n")}`);
}

function isolateCacheDeletion(source) {
  const pattern = /((?:keys|cacheNames)\.filter\(\s*)([A-Za-z_$][\w$]*)\s*=>\s*\2\s*!==?\s*([A-Za-z_$][\w$]*)(\s*\))/g;
  return source.replace(pattern, (whole, start, item, cacheVar, end) => {
    const own = `String(${cacheVar}).includes("-v") ? String(${cacheVar}).replace(/-v.*$/i, "-") : String(${cacheVar})`;
    return `${start}${item} => ${item} !== ${cacheVar} && ${item}.startsWith(${own})${end}`;
  });
}

let changed = 0;
for (const file of walk(root)) {
  const original = fs.readFileSync(file, "utf8");
  let source = isolateCacheDeletion(original);
  source = addCommonAssets(source, file);
  if (source !== original) {
    fs.writeFileSync(file, source);
    changed += 1;
  }
}
console.log(`Service worker adeguati: ${changed}.`);
