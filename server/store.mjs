import pg from 'pg';
import { readFile } from 'node:fs/promises';
import { HttpError } from './security.mjs';

export function postgresStore(connectionString) {
  const pool=new pg.Pool({connectionString,max:5,connectionTimeoutMillis:5000,statement_timeout:10000});
  pool.on('error',()=>console.error('Database connection unavailable'));
  return {
    async migrate(){
      const client=await pool.connect();
      try{
        await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock(18473621)');
        await client.query('CREATE TABLE IF NOT EXISTS course_migrations (version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
        const result=await client.query('SELECT version FROM course_migrations WHERE version=1');
        if(!result.rowCount){await client.query(await readFile(new URL('./migrations/001.sql',import.meta.url),'utf8'));await client.query('INSERT INTO course_migrations(version) VALUES(1)')}
        await client.query('COMMIT');
      }catch(error){await client.query('ROLLBACK');throw error}finally{client.release()}
    },
    async health(){await pool.query('SELECT 1')},
    async limit(key,limit,seconds){
      const {rows}=await pool.query(`INSERT INTO course_rate_limits(key_hash,count,expires_at) VALUES($1,1,now()+$2*interval '1 second')
        ON CONFLICT(key_hash) DO UPDATE SET count=CASE WHEN course_rate_limits.expires_at<now() THEN 1 ELSE course_rate_limits.count+1 END,
        expires_at=CASE WHEN course_rate_limits.expires_at<now() THEN excluded.expires_at ELSE course_rate_limits.expires_at END RETURNING count`,[key,seconds]);
      return rows[0].count<=limit;
    },
    async createLead(lead,keyHash,inputHash,amount){
      const {rows}=await pool.query(`INSERT INTO course_leads(id,idempotency_hash,input_hash,name,email,plan_id,amount_rub,acknowledgments)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(idempotency_hash) DO UPDATE SET idempotency_hash=excluded.idempotency_hash
        RETURNING id,input_hash,plan_id,amount_rub`,[lead.id,keyHash,inputHash,lead.name,lead.email,lead.planId,amount,JSON.stringify(lead.acknowledgments)]);
      if(rows[0].input_hash!==inputHash)throw new HttpError(409,'Эта попытка отправки уже использована. Откройте форму заново.');
      return rows[0];
    },
    async newSession(hash,credentials){await pool.query("INSERT INTO course_admin_sessions(token_hash,credential_hash,expires_at) VALUES($1,$2,now()+interval '8 hours')",[hash,credentials])},
    async session(hash,credentials){const r=await pool.query('SELECT 1 FROM course_admin_sessions WHERE token_hash=$1 AND credential_hash=$2 AND expires_at>now()',[hash,credentials]);return r.rowCount>0},
    async logout(hash){await pool.query('DELETE FROM course_admin_sessions WHERE token_hash=$1',[hash])},
    async list({search='',status='all',page=1}){
      const where="WHERE ($1='all' OR status=$1) AND ($2='' OR strpos(lower(name||' '||email||' '||plan_id),lower($2))>0)";
      const {rows}=await pool.query(`SELECT id,name,email,plan_id,amount_rub,status,version,created_at,acknowledgments,evidence_mode FROM course_leads ${where} ORDER BY created_at DESC,id LIMIT 25 OFFSET $3`,[status,search,(page-1)*25]);
      const count=await pool.query(`SELECT count(*)::integer AS total FROM course_leads ${where}`,[status,search]);
      return {leads:rows,total:count.rows[0].total,page};
    },
    async update(id,status,version,note,actor){
      const client=await pool.connect();
      try{
        await client.query('BEGIN');
        const {rows}=await client.query('SELECT status,version FROM course_leads WHERE id=$1 FOR UPDATE',[id]);
        if(!rows.length)throw new HttpError(404,'Заявка не найдена.');
        if(rows[0].version!==version)throw new HttpError(409,'Заявка уже изменена. Обновите список.');
        await client.query('UPDATE course_leads SET status=$2,version=version+1 WHERE id=$1',[id,status]);
        await client.query('INSERT INTO course_admin_audit(lead_id,actor,old_status,new_status,note) VALUES($1,$2,$3,$4,$5)',[id,actor,rows[0].status,status,note]);
        await client.query('COMMIT');
      }catch(error){await client.query('ROLLBACK');throw error}finally{client.release()}
    },
    async cleanup(){await pool.query('DELETE FROM course_admin_sessions WHERE expires_at<now()');await pool.query('DELETE FROM course_rate_limits WHERE expires_at<now()')},
    async close(){await pool.end()},
  };
}
