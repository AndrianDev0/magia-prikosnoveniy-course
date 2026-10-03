import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, basename } from 'node:path';
import { createHmac } from 'node:crypto';
import { createPaymentLead, createLegalSnapshot, paymentPlans } from '../pages/payment.js';
import { HttpError, readJson, sha256, token, verifyPassword, readSessionCookie, sessionCookie, csrfToken, sameToken } from './security.mjs';

const amounts=Object.fromEntries(Object.entries(paymentPlans).map(([id,plan])=>[id,plan.amountRub]));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.otf':'font/otf'};
const statuses=['pending','confirmed','rejected'];
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export async function createHandler(config,store) {
  const packet=JSON.parse(await readFile(resolve(config.root,'public/course/legal-documents.json'),'utf8'));
  const legalSnapshot=await createLegalSnapshot(packet);
  const credentials=sha256(`${config.adminUsername}:${config.passwordHash}`);
  if(config.paymentMode==='manual-qr')for(const file of Object.values(config.qrFiles)){
    const info=await stat(resolve(config.qrDirectory,file));
    if(!info.isFile()||info.size>2*1024*1024)throw new Error('QR file is missing or larger than 2 MB');
  }
  function json(response,status,data){response.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});response.end(JSON.stringify(data))}
  async function limit(request,scope,count,seconds){
    // Trust this header only behind our private Docker network and Caddy,
    // which overwrites it. Never expose the app port when TRUST_PROXY=true.
    const ip=config.trustProxy?request.headers['x-real-ip']:request.socket.remoteAddress;
    const key=createHmac('sha256',config.sessionSecret).update(`${scope}:${ip||'unknown'}`).digest('hex');
    if(!await store.limit(key,count,seconds))throw new HttpError(429,'Слишком много попыток. Повторите позже.');
  }
  async function auth(request,mutation=false){
    const session=readSessionCookie(request);
    if(!session||!await store.session(sha256(session),credentials))throw new HttpError(401,'Войдите в админку.');
    if(mutation&&!sameToken(request.headers['x-csrf-token'],csrfToken(session,config.sessionSecret)))throw new HttpError(403,'Обновите страницу и повторите действие.');
    return session;
  }
  async function serve(response,file,nonce,head=false){
    const extension=extname(file);
    if(!types[extension])throw new HttpError(404,'Страница не найдена.');
    let data;
    try{data=await readFile(file)}catch{throw new HttpError(404,'Страница не найдена.')}
    if(extension==='.html'){
      let html=data.toString().replace(/<script(?![^>]*\bsrc=)([^>]*)>/gi,`<script nonce="${nonce}"$1>`);
      // Static Pages remains a demo; this host uses its own canonical domain.
      html=html.replaceAll('https://andriandev0.github.io/magia-prikosnoveniy-course',config.origin);
      data=Buffer.from(html);
    }
    response.setHeader('Content-Type',types[extension]);
    response.setHeader('Content-Length',data.length);
    if(!['.html','.json','.js'].includes(extension))response.setHeader('Cache-Control','public, max-age=3600');
    response.end(head?undefined:data);
  }
  return async(request,response)=>{
    const nonce=token();
    response.setHeader('Cache-Control','no-store');
    response.setHeader('X-Content-Type-Options','nosniff');
    response.setHeader('Referrer-Policy','same-origin');
    response.setHeader('X-Frame-Options','DENY');
    response.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
    response.setHeader('Content-Security-Policy',`default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`);
    try{
      const url=new URL(request.url,config.origin);
      const path=decodeURIComponent(url.pathname);
      if(!['GET','HEAD','POST','PATCH'].includes(request.method))throw new HttpError(405,'Метод не поддерживается.');
      if(['POST','PATCH'].includes(request.method)&&request.headers.origin!==config.origin)throw new HttpError(403,'Недопустимый источник запроса.');
      if(path==='/healthz'&&request.method==='GET'){await store.health();return json(response,200,{ok:true})}
      if(path==='/site-runtime.js'&&request.method==='GET'){
        response.setHeader('Content-Type','text/javascript; charset=utf-8');
        return response.end(`window.COURSE_RUNTIME=Object.freeze(${JSON.stringify({mode:'server',paymentMode:config.paymentMode,supportEmail:config.supportEmail}).replaceAll('<','\\u003c')});`);
      }
      if(path==='/api/leads'&&request.method==='POST'){
        await limit(request,'leads',10,3600);
        const input=await readJson(request);
        if(!uuid.test(input.idempotencyKey||''))throw new HttpError(400,'Обновите форму заявки.');
        if(input.website)throw new HttpError(400,'Не удалось отправить заявку.');
        if(!Object.keys(legalSnapshot).every(slug=>['sha256','version','revision'].every(key=>input.legalSnapshot?.[slug]?.[key]===legalSnapshot[slug][key])))throw new HttpError(409,'Документы изменились. Закройте и заново откройте форму.');
        let lead;
        try{lead=createPaymentLead(input,input.planId,legalSnapshot)}catch{throw new HttpError(400,'Проверьте имя, почту, тариф и обязательные подтверждения.')}
        const fingerprint=sha256(JSON.stringify([lead.name,lead.email,lead.planId,legalSnapshot]));
        const row=await store.createLead(lead,sha256(input.idempotencyKey),fingerprint,amounts[lead.planId]);
        return json(response,201,{id:row.id,planName:paymentPlans[lead.planId].name,amountRub:row.amount_rub,
          payment:config.paymentMode==='manual-qr'?{mode:'manual-qr',qrUrl:`/api/payments/qr/${lead.planId}`,recipient:config.paymentRecipient}:{mode:'disabled'}});
      }
      if(path.startsWith('/api/payments/qr/')&&request.method==='GET'){
        const plan=path.slice('/api/payments/qr/'.length);
        if(config.paymentMode!=='manual-qr'||!Object.hasOwn(amounts,plan))throw new HttpError(404,'Оплата пока не подключена.');
        return await serve(response,resolve(config.qrDirectory,config.qrFiles[plan]),nonce);
      }
      if(path==='/api/payments/webhook')throw new HttpError(501,'Платёжный провайдер не подключён.');
      if(path==='/api/admin/login'&&request.method==='POST'){
        await limit(request,'login',5,900);
        const input=await readJson(request);
        const valid=await verifyPassword(input.password,config.passwordHash);
        if(!valid||input.username!==config.adminUsername)throw new HttpError(401,'Неверный логин или пароль.');
        const previous=readSessionCookie(request);if(previous)await store.logout(sha256(previous));
        const session=token();await store.newSession(sha256(session),credentials);
        response.setHeader('Set-Cookie',sessionCookie(session,config.secure));
        return json(response,200,{csrfToken:csrfToken(session,config.sessionSecret)});
      }
      if(path.startsWith('/api/admin/')){
        const session=await auth(request,['POST','PATCH'].includes(request.method));
        if(path==='/api/admin/session'&&request.method==='GET')return json(response,200,{csrfToken:csrfToken(session,config.sessionSecret)});
        if(path==='/api/admin/logout'&&request.method==='POST'){
          await store.logout(sha256(session));response.setHeader('Set-Cookie',sessionCookie('',config.secure,0));return json(response,200,{ok:true});
        }
        if(path==='/api/admin/leads'&&request.method==='GET'){
          const search=(url.searchParams.get('search')||'').slice(0,100),status=url.searchParams.get('status')||'all';
          const page=Number(url.searchParams.get('page')||1);
          if(!['all',...statuses].includes(status)||!Number.isInteger(page)||page<1||page>100000)throw new HttpError(400,'Некорректный фильтр.');
          return json(response,200,await store.list({search,status,page}));
        }
        const id=path.slice('/api/admin/leads/'.length);
        if(path.startsWith('/api/admin/leads/')&&uuid.test(id)&&request.method==='PATCH'){
          const input=await readJson(request);
          if(!statuses.includes(input.status)||!Number.isInteger(input.version)||typeof input.note!=='string'||input.note.trim().length<5||input.note.length>500)throw new HttpError(400,'Укажите статус и комментарий от 5 до 500 символов.');
          await store.update(id,input.status,input.version,input.note.trim(),config.adminUsername);
          return json(response,200,{ok:true});
        }
      }
      if(path.startsWith('/api/'))throw new HttpError(404,'Метод API не найден.');
      if(path==='/admin-demo.html')throw new HttpError(404,'На этом сервере используйте /admin.');
      if(!['GET','HEAD'].includes(request.method))throw new HttpError(405,'Метод не поддерживается.');
      if(path.includes('\\')||path.includes('\0')||path.split('/').some(part=>part==='..'||part.startsWith('.')))throw new HttpError(404,'Страница не найдена.');
      let file;
      if(['/admin','/admin/'].includes(path))file=resolve(config.root,'server/admin.html');
      else if(['/admin.js','/admin.css'].includes(path))file=resolve(config.root,`server/${basename(path)}`);
      else if(path.startsWith('/course/'))file=resolve(config.root,'public',path.slice(1));
      else if(path==='/'||/^\/[\w-]+\.(html|js|css|svg)$/.test(path))file=resolve(config.root,'pages',path==='/'?'index.html':path.slice(1));
      else throw new HttpError(404,'Страница не найдена.');
      return await serve(response,file,nonce,request.method==='HEAD');
    }catch(error){
      const status=error instanceof HttpError?error.status:500;
      if(status===500)console.error('Request failed; server-side operation unavailable');
      if(status===429)response.setHeader('Retry-After','900');
      if(!response.headersSent)json(response,status,{error:status===500?'Сервис временно недоступен. Попробуйте позже.':error.message});
      else response.end();
    }
  };
}
