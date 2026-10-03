import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { postgresStore } from '../store.mjs';

test('PostgreSQL migrations, concurrent retries, status audit and session expiry',{skip:!process.env.TEST_DATABASE_URL},async()=>{
  const schema=`qa_${randomUUID().replaceAll('-','')}`;
  const admin=new pg.Pool({connectionString:process.env.TEST_DATABASE_URL});
  await admin.query(`CREATE SCHEMA ${schema}`);
  const url=new URL(process.env.TEST_DATABASE_URL);url.searchParams.set('options',`-c search_path=${schema}`);
  const store=postgresStore(url.toString());
  try{
    await store.migrate();await store.migrate();
    const lead={id:randomUUID(),name:'Тест',email:'qa@example.com',planId:'vip',acknowledgments:{}};
    const rows=await Promise.all([store.createLead(lead,'key','input',35000),store.createLead({...lead,id:randomUUID()},'key','input',35000)]);
    assert.equal(rows[0].id,rows[1].id);
    await assert.rejects(store.createLead({...lead,id:randomUUID()},'key','different',35000),error=>error.status===409);
    assert.equal((await store.list({})).total,1);
    await store.update(lead.id,'confirmed',1,'Проверено тестом','admin','BANK-TEST-POSTGRES');
    await assert.rejects(store.update(lead.id,'rejected',1,'Stale update','admin'),error=>error.status===409);
    await store.correctEmail(lead.id,'correct@example.com',2,'Покупатель и операция сверены вручную','admin','BANK-TEST-POSTGRES');
    await store.update(lead.id,'refund_requested',3,'Получено обращение о возврате','admin');
    await store.update(lead.id,'refunded',4,'Возврат сверен по банковской операции','admin','REFUND-TEST-POSTGRES');
    const saved=await store.list({});assert.equal(saved.leads[0].email,'correct@example.com');assert.equal(saved.leads[0].status,'refunded');
    await assert.rejects(store.update(lead.id,'confirmed',5,'Нельзя вернуть доступ','admin'),error=>error.status===409);
    const audit=await admin.query(`SELECT * FROM ${schema}.course_admin_audit ORDER BY id`);assert.equal(audit.rowCount,3);assert.equal(audit.rows[0].old_status,'pending');assert.equal(audit.rows[0].bank_reference,'BANK-TEST-POSTGRES');
    const contactAudit=await admin.query(`SELECT * FROM ${schema}.course_contact_audit`);assert.equal(contactAudit.rowCount,1);
    await store.newSession('token','credential');assert.equal(await store.session('token','credential'),true);assert.equal(await store.session('token','rotated'),false);
    await admin.query(`UPDATE ${schema}.course_admin_sessions SET expires_at=now()-interval '1 second'`);assert.equal(await store.session('token','credential'),false);
    assert.equal(await store.limit('rate',1,60),true);assert.equal(await store.limit('rate',1,60),false);
    await store.cleanup();
  }finally{await store.close();await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin.end()}
});
