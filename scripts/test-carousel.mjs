import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Exercise the carousel initializer and the real handlers without a browser.
class Element {
  attributes=new Map();
  listeners=new Map();
  classList={toggle:()=>{}};
  dataset={};
  controls=[{tabIndex:0},{tabIndex:0}];
  querySelectorAll(){return this.controls}
  setAttribute(key,value){this.attributes.set(key,value)}
  removeAttribute(key){this.attributes.delete(key)}
  addEventListener(event,handler,options){this.listeners.set(event,{handler,options})}
}
const carousel=new Element();
const slides=Array.from({length:3},()=>new Element());
const dots=Array.from({length:3},()=>new Element());
const prev=new Element(),next=new Element();
carousel.querySelectorAll=()=>slides;
const document={
  querySelector:selector=>({'.mobile-carousel':carousel,'[data-prev]':prev,'[data-next]':next}[selector]),
  querySelectorAll:selector=>selector==='[data-dot]'?dots:[],
};
const source=fs.readFileSync(new URL('../pages/app.js',import.meta.url),'utf8');
vm.runInNewContext(source.slice(source.indexOf('const carousel='),source.lastIndexOf('}')),{document});
function verify(active){
  assert.equal(carousel.dataset.index,String(active));
  slides.forEach((slide,i)=>{
    assert.equal(slide.attributes.get('aria-hidden'),String(i!==active));
    assert.deepEqual(slide.controls.map(button=>button.tabIndex),i===active?[0,0]:[-1,-1]);
  });
}
verify(1);
next.listeners.get('click').handler();verify(2);
next.listeners.get('click').handler();verify(2);
prev.listeners.get('click').handler();verify(1);
const click=carousel.listeners.get('click');
assert.equal(click.options.capture,true,'Select the side preview before its purchase handler');
click.handler({target:{closest:()=>slides[0]}});verify(0);
dots[2].listeners.get('click').handler();verify(2);
console.log('Carousel: initial state, arrows, dots, off-screen Tab order and side preview activation passed.');
