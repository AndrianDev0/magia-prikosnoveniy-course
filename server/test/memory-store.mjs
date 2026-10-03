import { HttpError } from '../security.mjs';
export function memoryStore(){
  const leads=new Map(),sessions=new Map(),limits=new Map();
  return {
    leads,sessions,audit:[],
    async health(){},async close(){},async migrate(){},async cleanup(){},
    async limit(key,max){const count=(limits.get(key)||0)+1;limits.set(key,count);return count<=max},
    async createLead(lead,key,inputHash,amount){
      if(leads.has(key)){const old=leads.get(key);if(old.input_hash!==inputHash)throw new HttpError(409,'Conflict');return old}
      const row={id:lead.id,name:lead.name,email:lead.email,plan_id:lead.planId,amount_rub:amount,status:'pending',version:1,created_at:lead.createdAt,input_hash:inputHash,acknowledgments:lead.acknowledgments,evidence_mode:'server-received'};
      leads.set(key,row);return row;
    },
    async newSession(key,credentials){sessions.set(key,credentials)},
    async session(key,credentials){return sessions.get(key)===credentials},async logout(key){sessions.delete(key)},
    async list({status='all',search='',page=1}){const rows=[...leads.values()].filter(row=>(status==='all'||row.status===status)&&(!search||`${row.name} ${row.email}`.includes(search)));return {leads:rows.slice((page-1)*25,page*25),total:rows.length,page}},
    async update(id,status,version,note,actor){const row=[...leads.values()].find(row=>row.id===id);if(!row)throw new HttpError(404,'Not found');if(row.version!==version)throw new HttpError(409,'Conflict');this.audit.push({id,old:row.status,status,note,actor});row.status=status;row.version++},
  };
}
