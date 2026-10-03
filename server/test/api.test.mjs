import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../config.mjs';
import { hashPassword } from '../security.mjs';
import { createHandler } from '../app.mjs';
import { createLegalSnapshot } from '../../pages/payment.js';
import { memoryStore } from './memory-store.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const password='test-only-password-not-for-production';
const passwordHash=await hashPassword(password);
const snapshot=await createLegalSnapshot(JSON.parse(await readFile(new URL('../../public/course/legal-documents.json',import.meta.url),'utf8')));
const env={ADMIN_PASSWORD_HASH:passwordHash,SESSION_SECRET:'1'.repeat(64),DATABASE_URL:'postgresql://test',SITE_ROOT:root};
const valid=()=>({name:'Анна',email:'anna@example.com',offer:true,consent:true,adult:true,planId:'vip',legalSnapshot:snapshot,idempotencyKey:randomUUID()});
async function fixture(t,overrides={}){
  const config=loadConfig({...env,...overrides}),store=memoryStore();
  const server=createServer(await createHandler(config,store));
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  config.origin=`http://127.0.0.1:${server.address().port}`;
  t.after(()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections()}));
  const request=(path,method='GET',body,headers={})=>fetch(config.origin+path,{method,headers:{Origin:config.origin,'Content-Type':'application/json',...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});
  return {config,store,request};
}
test('production fails closed without real origin, credentials and payment settings',()=>{
  assert.throws(()=>loadConfig({}),/ADMIN_PASSWORD_HASH/);
  assert.throws(()=>loadConfig({...env,NODE_ENV:'production'}),/HTTPS/);
  assert.throws(()=>loadConfig({...env,NODE_ENV:'production',PUBLIC_ORIGIN:'https://example.com'}),/real HTTPS/);
  assert.throws(()=>loadConfig({...env,PAYMENT_MODE:'manual-qr'}),/recipient/);
  assert.throws(()=>loadConfig({...env,QR_STANDARD_FILE:'../../.env'}),/filenames/);
});
test('server validates contact, consent, tariff and document versions',async t=>{
  const {request,store}=await fixture(t);
  for(const change of [{email:'maa190186@@gmail.co'},{name:'<script>'},{offer:false},{consent:false},{adult:false},{planId:'constructor'},{legalSnapshot:{}},{idempotencyKey:'123'}]){
    const response=await request('/api/leads','POST',{...valid(),...change});assert.ok([400,409].includes(response.status));
  }
  assert.equal(store.leads.size,0);
});
test('server owns amount and receipt; retries do not duplicate data',async t=>{
  const {request,store}=await fixture(t),input={...valid(),price:1,amountRub:1,status:'confirmed'};
  const a=await request('/api/leads','POST',input),first=await a.json();assert.equal(a.status,201);assert.equal(first.amountRub,35000);assert.equal(first.payment.mode,'disabled');
  const retry=await request('/api/leads','POST',input);assert.equal((await retry.json()).id,first.id);assert.equal(store.leads.size,1);
  const row=[...store.leads.values()][0];assert.equal(row.status,'pending');assert.equal(row.evidence_mode,'server-received');assert.equal(row.acknowledgments.offer.sha256,snapshot.offer.sha256);
  assert.equal((await request('/api/leads','POST',{...input,planId:'standard'})).status,409);
  assert.equal((await request('/api/payments/qr/vip')).status,404);
  assert.equal((await request('/api/payments/webhook','POST',{})).status,501);
});
test('admin requires credentials, session, CSRF and fresh record version',async t=>{
  const {request,store}=await fixture(t);
  assert.equal((await request('/api/admin/leads')).status,401);
  assert.equal((await request('/api/admin/login','POST',{username:'admin',password:'wrong'})).status,401);
  const login=await request('/api/admin/login','POST',{username:'admin',password});assert.equal(login.status,200);
  const cookie=login.headers.get('set-cookie');assert.match(cookie,/HttpOnly/);assert.match(cookie,/SameSite=Strict/);assert.match(cookie,/Path=\/api\/admin/);
  const {csrfToken}=await login.json();const headers={Cookie:cookie.split(';')[0],'X-CSRF-Token':csrfToken};
  const lead=await (await request('/api/leads','POST',valid())).json();
  const listing=await (await request('/api/admin/leads','GET',undefined,headers)).json();assert.equal(listing.total,1);
  const update={status:'confirmed',version:1,note:'Тестовая сверка операции банка'};
  assert.equal((await request(`/api/admin/leads/${lead.id}`,'PATCH',update,{Cookie:headers.Cookie})).status,403);
  assert.equal((await request(`/api/admin/leads/${lead.id}`,'PATCH',update,{...headers,Origin:'https://attacker.invalid'})).status,403);
  assert.equal((await request(`/api/admin/leads/${lead.id}`,'PATCH',update,headers)).status,200);assert.equal(store.audit.length,1);
  assert.equal((await request(`/api/admin/leads/${lead.id}`,'PATCH',update,headers)).status,409);
  assert.equal((await request('/api/admin/logout','POST',{},headers)).status,200);
  assert.equal((await request('/api/admin/leads','GET',undefined,headers)).status,401);
});
test('rate limiting and errors do not expose contact records',async t=>{
  const {request,store}=await fixture(t);
  for(let i=0;i<10;i++)await request('/api/leads','POST',{...valid(),email:'invalid'});
  assert.equal((await request('/api/leads','POST',valid())).status,429);
  store.health=async()=>{throw Error('private database password')};
  const response=await request('/healthz');assert.equal(response.status,500);assert.doesNotMatch(await response.text(),/password/);
});
test('static host exposes only public files and server runtime, with CSP',async t=>{
  const {request}=await fixture(t);
  for(const path of ['/server/config.mjs','/.env','/deploy/settings.example','/course/%2e%2e%2f.env','/admin-demo.html'])assert.equal((await request(path)).status,404,path);
  const page=await request('/');assert.equal(page.status,200);assert.match(page.headers.get('content-security-policy'),/frame-ancestors 'none'/);
  assert.match(await (await request('/site-runtime.js')).text(),/"mode":"server"/);
  const doc=await request('/document.html?doc=offer');assert.match(await doc.text(),/<script nonce="[a-f0-9]+"/);
  assert.equal((await request('/api/leads','POST',valid(),{Origin:'https://other.invalid'})).status,403);
  assert.equal((await request('/api/leads','POST',valid(),{'Content-Type':'text/plain'})).status,415);
});
test('manual QR is tariff-specific; recipient is never client-supplied',async t=>{
  const directory=await mkdtemp(join(tmpdir(),'course-qr-test-'));
  t.after(()=>rm(directory,{recursive:true,force:true}));
  const files={standard:'standard.png',vip:'vip.png','vip-plus':'vip-plus.png'};
  for(const [id,file] of Object.entries(files))await writeFile(join(directory,file),`fixture:${id}`);
  const {request}=await fixture(t,{PAYMENT_MODE:'manual-qr',PAYMENT_RECIPIENT:'Тестовый получатель',QR_DIRECTORY:directory,QR_STANDARD_FILE:files.standard,QR_VIP_FILE:files.vip,QR_VIP_PLUS_FILE:files['vip-plus']});
  for(const planId of Object.keys(files)){
    const response=await request('/api/leads','POST',{...valid(),planId,paymentRecipient:'attacker'});
    const data=await response.json();assert.equal(response.status,201);
    assert.equal(data.payment.recipient,'Тестовый получатель');assert.equal(data.payment.qrUrl,`/api/payments/qr/${planId}`);
    const qr=await request(data.payment.qrUrl);assert.equal(qr.status,200);assert.equal(await qr.text(),`fixture:${planId}`);
  }
  assert.equal((await request('/api/payments/qr/constructor')).status,404);
});
