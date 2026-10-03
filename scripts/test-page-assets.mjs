import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root=resolve(import.meta.dirname,'..');
for(const name of ['index','course']){
  const html=await readFile(resolve(root,`pages/${name}.html`),'utf8');
  assert.ok(!html.includes('fonts.googleapis.com'),'Fonts must be served locally');
  assert.ok(!/lessons-(mobile|tablet|laptop|desktop).*\.webp/.test(html),'Do not restore the full course raster just for its header');
  if(name==='course'){
    assert.ok(!/[—▶]/u.test(html),'Course controls must not use emoji glyphs or long dashes');
    assert.equal((html.match(/class="course-play"/g)||[]).length,8);
    for(const copy of [
      'Больше чувствительности. Больше доверия. Больше близости через прикосновения.',
      'Подготовка рук к практике. Упражнения для активизации энергетических каналов и разогрева ладоней перед прикосновениями.',
      'Подготовка пространства. Выбор масла и музыки.',
      'Различные типы прикосновений, используемых в Тантрическом массаже.',
      'Очень важный этап перед Тантрическим массажем. Красивый ритуал, помогающий войти в состояние любящего служения божественному телу партнера.',
      'Практика в положении «на животе»',
      'Работа с задней поверхностью тела. Активация энергетических центров и усиление тока энергии в теле. Демонстрация и объяснение движений.',
      'Практика в положении «на спине»',
      'Работа с передней поверхностью тела. Работа с грудью. Запуск и усиление тока энергии во всём теле. Демонстрация и объяснение движений.',
      '7 урок - Завершение',
      'Заключительная фаза массажа. Замедление и совместное расслабление.',
      'Полная версия массажа',
      'Непрерывная последовательность движений без остановок и объяснений. Можно просто повторять все движения за мной. Запоминать ничего не нужно, я веду голосом.',
    ])assert.ok(html.includes(copy),`Approved course copy missing: ${copy}`);
  }
  for(const match of html.matchAll(/\.\/course\/optimized\/([\w.-]+)/g)){
    assert.ok((await stat(resolve(root,'public/course/optimized',match[1]))).size>0,match[1]);
  }
}
for(const name of ['course-layout.css','fonts-course.css']){
  const css=await readFile(resolve(root,'public/course',name),'utf8');
  for(const match of css.matchAll(/\.\/optimized\/([\w.-]+)/g)){
    assert.ok((await stat(resolve(root,'public/course/optimized',match[1]))).size>0,`Missing CSS asset: ${match[1]}`);
  }
}
for(const [name,maxBytes] of [
  ['course-header-mobile.webp',20000],['course-header-desktop.webp',26000],
  ['lesson-poster-640.webp',30000],['lesson-poster-1280.webp',65000],
  ['lesson-poster-1920.webp',105000],['miama-nueva.woff2',65000],
  ['plan-desktop-figma.webp',100000],['plan-modal-mobile-figma.webp',55000],
  ['course-glow-mobile.webp',45000],['montserrat-regular-italic.woff2',45000],
])assert.ok((await stat(resolve(root,'public/course/optimized',name))).size<=maxBytes,`${name} exceeds its transfer budget`);
console.log('Page assets: references, local fonts and image/font size budgets passed.');
