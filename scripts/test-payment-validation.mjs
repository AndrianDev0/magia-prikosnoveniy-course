import assert from 'node:assert/strict';
import {validatePaymentField as validate,storePaymentLead} from '../pages/payment.js';

const cases = [
  ['name','Анна',true],['name','Jean-Luc O’Neill',true],['name','  Эмиль  ',true],
  ['name','',false],['name','1',false],['name','<script>alert(1)</script>',false],['name','Анна\nМария',false],['name','А'.repeat(81),false],
  ['email','anna+course@example.com',true],['email','NAME@EXAMPLE.CO.UK',true],
  ['email','',false],['email','anna',false],['email','anna@example',false],['email','anna@-example.com',false],['email','a..b@example.com',false],['email','.anna@example.com',false],['email','a@b..com',false],['email','a@example.com\r\nBcc:x@example.com',false],['email','a'.repeat(65)+'@example.com',false],
  ['phone','+7 (900) 123-45-67',true],['phone','8 900 123 45 67',true],['phone','+44 20 7946 0958',true],
  ['phone','123',false],['phone','+7 abc 1234567890',false],['phone','+79001234567<script>',false],['phone','+00000000000',false],['phone','++79001234567',false],['phone','1234567890123456',false],
  ['consent',true,true],['consent',false,false]
];
for (const [field,input,valid] of cases) assert.equal(validate(field,input)==='',valid,`${field}: ${JSON.stringify(input)}`);
console.log(`Payment validation: ${cases.length} checks passed.`);

const now = Date.now();
const lead = {email:'qa@example.com',phone:'+7 900 123-45-67',planId:'standard',status:'pending',createdAt:new Date(now).toISOString()};
function memory(initial = null) {
  let value = initial;
  return {getItem:()=>value,setItem:(_key,next)=>{value=next;}};
}
const storage = memory();
assert.equal(storePaymentLead(lead,storage,now),'saved');
assert.equal(JSON.parse(storage.getItem()).length,1);
assert.equal(storePaymentLead({...lead,email:'QA@example.com',phone:'+79001234567'},storage,now),'duplicate');
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
