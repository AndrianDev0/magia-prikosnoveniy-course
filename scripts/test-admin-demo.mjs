import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../pages/admin-demo.js',import.meta.url),'utf8');
const lead={id:'test',name:'Тест',email:'test@example.com',planId:'vip',planName:'VIP',price:'35 000 руб.',createdAt:'2026-10-02T00:00:00Z',status:'pending'};

function fixture(){
  const selectors=new Map();
  let status;
  class Element{
    constructor(){this.hidden=true;this.value='';this.children=[];this.nodes=new Map()}
    querySelector(selector){if(!this.nodes.has(selector))this.nodes.set(selector,new Element());const element=this.nodes.get(selector);if(selector==='[data-status]')status=element;return element}
    cloneNode(){return new Element()}
    replaceChildren(){this.children=[]}
    append(...elements){this.children.push(...elements)}
    remove(){}
    removeAttribute(){}
    addEventListener(event,callback){this[event]=callback}
  }
  const document={querySelector(selector){if(!selectors.has(selector))selectors.set(selector,new Element());return selectors.get(selector)},createElement(){return new Element()}};
  document.querySelector('#lead-template').content={firstElementChild:new Element()};
  let persisted=JSON.stringify([lead]);
  let failure;
  const localStorage={getItem(){return persisted},setItem(key,value){assert.equal(key,'magic-touch-payment-leads-v1');if(failure)throw failure;persisted=value}};
  vm.runInNewContext(source,{document,localStorage,Intl,Date});
  return {
    document,
    change(value){status.value=value;status.change()},
    search(value){const input=document.querySelector('[data-search]');input.value=value;input.input()},
    filter(value){const input=document.querySelector('[data-filter]');input.value=value;input.change()},
    status:()=>status.value,
    persisted:()=>JSON.parse(persisted),
    fail(error){failure=error}
  };
}

for(const name of ['QuotaExceededError','SecurityError']){
  const app=fixture();
  app.fail(Object.assign(new Error(name),{name}));
  app.change('confirmed');
  assert.equal(app.status(),'pending',`${name}: restore displayed status`);
  assert.equal(app.persisted()[0].status,'pending',`${name}: preserve stored status`);
  assert.equal(app.document.querySelector('[data-pending]').textContent,'1');
  assert.equal(app.document.querySelector('[data-confirmed]').textContent,'0');
  assert.equal(app.document.querySelector('[data-storage-error]').hidden,false);
  assert.match(app.document.querySelector('[data-storage-error]').textContent,/Не удалось сохранить/);
  app.fail(undefined);
  app.change('confirmed');
  assert.equal(app.status(),'confirmed');
  assert.equal(app.persisted()[0].status,'confirmed');
  assert.equal(app.document.querySelector('[data-confirmed]').textContent,'1');
  assert.equal(app.document.querySelector('[data-storage-error]').hidden,true);
}
const invalid=fixture();
invalid.change('unknown');
assert.equal(invalid.status(),'pending');
assert.equal(invalid.persisted()[0].status,'pending');
const listing=fixture();
assert.equal(listing.document.querySelector('[data-visible-count]').textContent,'Показано: 1');
listing.search('nothing');
assert.equal(listing.document.querySelector('[data-visible-count]').textContent,'Показано: 0');
assert.match(listing.document.querySelector('.demo-admin-list').children[0].textContent,/По этому запросу/);
listing.search('test@example.com');
listing.filter('confirmed');
assert.equal(listing.document.querySelector('[data-visible-count]').textContent,'Показано: 0');
listing.filter('pending');
assert.equal(listing.document.querySelector('[data-visible-count]').textContent,'Показано: 1');
console.log('Admin demo: status persistence, storage failure, search and filters passed.');
