#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const ignored = new Set([".git", "node_modules", "dist", ".cache"]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(absolute, out);
    else if (entry.name.toLowerCase().endsWith(".html")) out.push(absolute);
  }
  return out;
}

function relativeRoot(file) {
  const value = path.relative(path.dirname(file), root).replaceAll(path.sep, "/");
  return value || ".";
}

function removeZoomBlocks(source) {
  return source
    .replace(/,?\s*user-scalable\s*=\s*no/gi, "")
    .replace(/,?\s*maximum-scale\s*=\s*1(?:\.0)?/gi, "")
    .replace(/content=(['"])([^'"]*?),\s*\1/gi, "content=$1$2$1");
}

function deferStaticYouTube(source) {
  return source.replace(
    /<iframe\b([^>]*?)\bsrc=(['"])(https:\/\/www\.youtube(?:-nocookie)?\.com\/embed\/[^'"]+)\2([^>]*)>/gi,
    (whole, before, quote, url, after) => {
      if (/\bdata-gbprof-src\s*=/.test(whole)) return whole;
      const safeUrl = url.replace("www.youtube.com", "www.youtube-nocookie.com");
      return `<iframe${before}data-gbprof-src=${quote}${safeUrl}${quote}${after}>`;
    }
  );
}

function addStandardAssets(source, file) {
  if (/pwa-common\/gbprof-accessibility\.css/.test(source)) return source;
  const prefix = relativeRoot(file);
  const link = `  <link rel="stylesheet" href="${prefix}/pwa-common/gbprof-accessibility.css?v=1">\n`;
  const script = `  <script src="${prefix}/pwa-common/gbprof-accessibility.js?v=1"></script>\n`;
  if (/<\/head>/i.test(source)) source = source.replace(/<\/head>/i, `${link}</head>`);
  if (/<\/body>/i.test(source)) source = source.replace(/<\/body>/i, `${script}</body>`);
  return source;
}

let changed = 0;
for (const file of walk(root)) {
  const original = fs.readFileSync(file, "utf8");
  let source = removeZoomBlocks(original);
  source = deferStaticYouTube(source);
  source = addStandardAssets(source, file);
  if (source !== original) {
    fs.writeFileSync(file, source);
    changed += 1;
  }
}
console.log(`Standard gbprof applicato a ${changed} file HTML.`);
