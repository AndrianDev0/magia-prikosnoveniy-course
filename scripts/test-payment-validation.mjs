import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validatePaymentField as validate,storePaymentLead,createLegalSnapshot,createPaymentLead,paymentPlans} from '../pages/payment.js';

const cases = [
  ['name','Анна',true],['name','Jean-Luc O’Neill',true],['name','  Эмиль  ',true],
  ['name','',false],['name','1',false],['name','<script>alert(1)</script>',false],['name','Анна\nМария',false],['name','А'.repeat(81),false],
  ['email','anna+course@example.com',true],['email','NAME@EXAMPLE.CO.UK',true],
  ['email','',false],['email','anna',false],['email','anna@example',false],['email','anna@-example.com',false],['email','a..b@example.com',false],['email','.anna@example.com',false],['email','a@b..com',false],['email','a@example.com\r\nBcc:x@example.com',false],['email','a'.repeat(65)+'@example.com',false],
  ['consent',true,true],['consent',false,false],['consent','true',false],
  ['offer',true,true],['offer',false,false],['adult',true,true],['adult',false,false],['adult','true',false]
];
for (const [field,input,valid] of cases) assert.equal(validate(field,input)==='',valid,`${field}: ${JSON.stringify(input)}`);
console.log(`Payment validation: ${cases.length} checks passed.`);

const now = Date.now();
const packet = JSON.parse(await readFile(new URL('../public/course/legal-documents.json',import.meta.url),'utf8'));
const snapshot = await createLegalSnapshot(packet);
const values = {name:'  Тестовая Анна  ',email:'QA@example.com',offer:true,consent:true,adult:true};
const lead = createPaymentLead(values,'standard',snapshot,new Date(now));
assert.equal(lead.email,'qa@example.com');
assert.equal(lead.name,'Тестовая Анна');
assert.equal(Object.hasOwn(lead,'phone'),false);
assert.equal(lead.evidenceMode,'browser-demo');
assert.equal(lead.acknowledgments.adult.accepted,true);
for (const entry of Object.values(lead.acknowledgments)) {
  assert.equal(entry.version,packet.version);
  assert.equal(entry.revision,packet.revision);
  assert.equal(entry.acceptedAt,lead.createdAt);
  assert.match(entry.sha256,/^[a-f0-9]{64}$/);
}
for(const field of ['offer','consent','adult'])assert.throws(()=>createPaymentLead({...values,[field]:false},'standard',snapshot));
assert.throws(()=>createPaymentLead(values,'constructor',snapshot));
assert.throws(()=>createPaymentLead(values,'standard',{}));
await assert.rejects(createLegalSnapshot({...packet,documents:{}}));
const changedPacket=structuredClone(packet);changedPacket.documents.offer.blocks[0].text+=' changed';
const changedSnapshot=await createLegalSnapshot(changedPacket);
assert.notEqual(snapshot.offer.sha256,changedSnapshot.offer.sha256);
assert.equal(snapshot.consent.sha256,changedSnapshot.consent.sha256);
assert.equal(paymentPlans['vip-plus'].benefits.length,3);
assert.match(paymentPlans['vip-plus'].benefits[2],/Одно очное занятие в течение года/);
console.log('Legal acknowledgments: versions, timestamps, document hashes, required choices and tariff checks passed.');
function memory(initial = null) {
  let value = initial;
  return {getItem:()=>value,setItem:(_key,next)=>{value=next;}};
}
const storage = memory();
assert.equal(storePaymentLead(lead,storage,now),'saved');
assert.equal(JSON.parse(storage.getItem()).length,1);
assert.equal(storePaymentLead({...lead,email:'QA@example.com'},storage,now),'duplicate');
assert.equal(JSON.parse(storage.getItem()).length,1);
assert.equal(storePaymentLead(lead,storage,now+300001),'saved');
assert.equal(JSON.parse(storage.getItem()).length,2);
for (const value of ['broken','{}','[null]','[{"phone":42}]']) {
  const invalid = memory(value);
  assert.throws(()=>storePaymentLead(lead,invalid,now));
  assert.equal(invalid.getItem(),value,'Malformed stored data must not be overwritten.');
}
assert.throws(()=>storePaymentLead(lead,{getItem:()=>null,setItem:()=>{throw new Error('quota');}},now));
assert.throws(()=>storePaymentLead(lead,{getItem:()=>{throw new Error('blocked');}},now));
const full = memory(JSON.stringify(Array.from({length:100},()=>({...lead,email:'old@example.com'}))));
assert.equal(storePaymentLead(lead,full,now),'full');
assert.equal(JSON.parse(full.getItem()).length,100);
console.log('Payment storage: save, duplicate, expiry, malformed data, denied storage and capacity checks passed.');
const legacy = memory(JSON.stringify([{...lead,phone:'+7 900 123-45-67',acknowledgments:undefined,evidenceMode:undefined,email:'legacy@example.com'}]));
assert.equal(storePaymentLead(lead,legacy,now),'saved');
assert.equal(JSON.parse(legacy.getItem())[1].phone,'+7 900 123-45-67');
assert.equal(Object.hasOwn(JSON.parse(legacy.getItem())[1],'acknowledgments'),false);
