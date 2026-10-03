import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root=resolve(import.meta.dirname,'..');
for(const name of ['index','course']){
  const html=await readFile(resolve(root,`pages/${name}.html`),'utf8');
  assert.ok(!html.includes('fonts.googleapis.com'),'Fonts must be served locally');
  assert.ok(!/lessons-(mobile|tablet|laptop|desktop).*\.webp/.test(html),'Do not restore the full course raster just for its header');
  for(const match of html.matchAll(/\.\/course\/optimized\/([\w.-]+)/g)){
    assert.ok((await stat(resolve(root,'public/course/optimized',match[1]))).size>0,match[1]);
  }
}
for(const [name,maxBytes] of [
  ['course-header-mobile.webp',20000],['course-header-desktop.webp',26000],
  ['lesson-poster-640.webp',30000],['lesson-poster-1280.webp',65000],
  ['lesson-poster-1920.webp',105000],['miama-nueva.woff2',65000],
  ['plan-desktop-figma.webp',100000],['plan-modal-mobile-figma.webp',55000],
])assert.ok((await stat(resolve(root,'public/course/optimized',name))).size<=maxBytes,`${name} exceeds its transfer budget`);
console.log('Page assets: references, local fonts and image/font size budgets passed.');
