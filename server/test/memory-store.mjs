import { HttpError } from '../security.mjs';
import { assertPaymentTransition } from '../payment-policy.mjs';
export function memoryStore(){
  const leads=new Map(),sessions=new Map(),limits=new Map();
  return {
    leads,sessions,audit:[],
    async health(){},async close(){},async migrate(){},async cleanup(){},
    async limit(key,max){const count=(limits.get(key)||0)+1;limits.set(key,count);return count<=max},
    async createLead(lead,key,inputHash,amount){
      if(leads.has(key)){const old=leads.get(key);if(old.input_hash!==inputHash)throw new HttpError(409,'Conflict');return old}
      const row={id:lead.id,name:lead.name,email:lead.email,plan_id:lead.planId,amount_rub:amount,status:'pending',version:1,created_at:lead.createdAt,input_hash:inputHash,acknowledgments:lead.acknowledgments,evidence_mode:'server-received',bank_reference:null,refund_reference:null};
      leads.set(key,row);return row;
    },
    async newSession(key,credentials){sessions.set(key,credentials)},
    async session(key,credentials){return sessions.get(key)===credentials},async logout(key){sessions.delete(key)},
    async list({status='all',search='',page=1}){const rows=[...leads.values()].filter(row=>(status==='all'||row.status===status)&&(!search||`${row.name} ${row.email}`.includes(search)));return {leads:rows.slice((page-1)*25,page*25),total:rows.length,page}},
    async update(id,status,version,note,actor,reference=''){
      const row=[...leads.values()].find(row=>row.id===id);if(!row)throw new HttpError(404,'Not found');if(row.version!==version)throw new HttpError(409,'Conflict');
      assertPaymentTransition(row.status,status,row.bank_reference,reference);
      if(status==='confirmed'&&!row.bank_reference){if([...leads.values()].some(other=>other.bank_reference===reference))throw new HttpError(409,'Duplicate bank operation');row.bank_reference=reference;row.confirmed_at=new Date().toISOString()}
      if(status==='refunded'){if([...leads.values()].some(other=>other.refund_reference===reference))throw new HttpError(409,'Duplicate refund operation');row.refund_reference=reference;row.refunded_at=new Date().toISOString()}
      this.audit.push({id,old:row.status,status,note,actor});row.status=status;row.version++
    },
    async correctEmail(id,email,version,note,actor,bankReference){
      const row=[...leads.values()].find(row=>row.id===id);if(!row)throw new HttpError(404,'Not found');if(row.version!==version)throw new HttpError(409,'Conflict');
      if(!row.bank_reference||row.bank_reference!==bankReference||!['confirmed','refund_requested'].includes(row.status))throw new HttpError(403,'Bank reference not verified');
      if(row.email===email)throw new HttpError(400,'Same email');
      this.audit.push({id,oldEmail:row.email,newEmail:email,note,actor});row.email=email;row.version++;
    },
  };
}
