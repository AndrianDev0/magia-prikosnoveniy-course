const login=document.querySelector('#admin-login');
const workspace=document.querySelector('#admin-workspace');
const message=document.querySelector('#admin-message');
const filters=document.querySelector('#admin-filters');
const list=document.querySelector('#admin-leads');
let csrf='',page=1,loading=false;
function notice(text,error=false){message.textContent=text;message.dataset.error=String(error)}
function signedOut(){csrf='';workspace.hidden=true;list.replaceChildren();login.hidden=false}
async function api(path,options={}){
  const response=await fetch(`/api/admin/${path}`,{...options,headers:{'Content-Type':'application/json','X-CSRF-Token':csrf,...options.headers},signal:AbortSignal.timeout(15000)});
  const data=await response.json();
  if(!response.ok){if(response.status===401)signedOut();throw new Error(data.error||'Сервис недоступен.')}
  return data;
}
function text(tag,value){const node=document.createElement(tag);node.textContent=value;return node}
async function load(focusId){
  if(loading)return;
  const sessionAtStart=csrf;
  loading=true;workspace.setAttribute('aria-busy','true');
  const actions=[...document.querySelectorAll('#admin-filters button,#admin-refresh,#admin-prev,#admin-next')];actions.forEach(button=>button.disabled=true);
  try{
    const query=new URLSearchParams({search:filters.elements.search.value,status:filters.elements.status.value,page:String(page)});
    const data=await api(`leads?${query}`);
    if(!csrf||csrf!==sessionAtStart)return;
    list.replaceChildren();
    document.querySelector('#admin-count').textContent=`Найдено: ${data.total}`;
    document.querySelector('#admin-page').textContent=`Страница ${page}`;
    if(!data.leads.length)list.append(text('p','Заявок нет. Измените фильтр или дождитесь новой заявки.'));
    for(const lead of data.leads){
      const card=document.createElement('article');card.className='demo-lead';card.dataset.id=lead.id;
      const names={standard:'Стандарт',vip:'VIP','vip-plus':'VIP+'};
      card.append(text('h2',lead.name),text('p',`${names[lead.plan_id]} · ${lead.amount_rub.toLocaleString('ru-RU')} руб.`));
      const email=text('a',lead.email);email.href=`mailto:${encodeURIComponent(lead.email)}`;card.append(email);
      card.append(text('p',`№ ${lead.id} · ${new Date(lead.created_at).toLocaleString('ru-RU')}`));
      const statusNames={pending:'Ожидает оплаты',confirmed:'Оплата сверена',rejected:'Отклонена',refund_requested:'Возврат на рассмотрении',refunded:'Возврат выполнен'};
      const transitions={pending:['confirmed','rejected'],confirmed:['refund_requested'],refund_requested:['confirmed','refunded'],rejected:[],refunded:[]};
      card.append(text('p',`Статус: ${statusNames[lead.status]||lead.status}`));
      if(lead.bank_reference)card.append(text('p',`Оплата: № ${lead.bank_reference}`));
      if(lead.refund_reference)card.append(text('p',`Возврат: № ${lead.refund_reference}`));
      const form=document.createElement('form');form.className='admin-status-form';
      if(transitions[lead.status]?.length){
        const statusLabel=text('label','Следующее действие'),select=document.createElement('select');select.name='status';
        for(const value of transitions[lead.status]){const option=text('option',statusNames[value]);option.value=value;select.append(option)}
        statusLabel.append(select);
        const referenceLabel=text('label','Номер операции банка'),reference=document.createElement('input');reference.name='reference';reference.maxLength=80;reference.placeholder='Из кабинета банка, не со скриншота клиента';referenceLabel.append(reference);
        const verifiedLabel=text('label','Сверил(а) операцию, сумму и получателя непосредственно в банке'),verified=document.createElement('input');verified.type='checkbox';verified.name='verifiedInBank';verifiedLabel.prepend(verified);
        const noteLabel=text('label','Комментарий для журнала'),note=document.createElement('textarea');note.name='note';note.required=true;note.minLength=5;note.maxLength=500;noteLabel.append(note);
        const save=text('button','Сохранить');save.type='submit';form.append(statusLabel,referenceLabel,verifiedLabel,noteLabel,save);card.append(form);
        const adjust=()=>{const bankAction=['confirmed','refunded'].includes(select.value);referenceLabel.hidden=select.value==='confirmed'&&Boolean(lead.bank_reference)||!bankAction;verifiedLabel.hidden=!bankAction;reference.required=bankAction&&!lead.bank_reference;verified.required=bankAction};
        select.addEventListener('change',adjust);adjust();
        form.addEventListener('submit',async event=>{
          event.preventDefault();save.disabled=true;
          try{await api(`leads/${lead.id}`,{method:'PATCH',body:JSON.stringify({status:select.value,version:lead.version,note:note.value,reference:reference.value,verifiedInBank:verified.checked})});notice('Статус сохранён. Действие записано в журнал.');await load(lead.id)}
          catch(error){notice(error.message,true);message.focus()}finally{save.disabled=false}
        });
      }
      if(lead.bank_reference&&['confirmed','refund_requested'].includes(lead.status)){
        const correction=document.createElement('form');correction.className='admin-status-form';
        const details=document.createElement('details');details.append(text('summary','Исправить ошибочную почту плательщика'));
        details.append(text('p','Сначала лично сверьте плательщика, заявку и операцию в кабинете банка. Не отправляйте доступ на прежний или новый адрес без отдельного подтверждения владения почтой.'));
        const emailLabel=text('label','Верный адрес'),email=document.createElement('input');email.type='email';email.required=true;email.maxLength=254;email.value=lead.email;emailLabel.append(email);
        const bankLabel=text('label','Номер оплаченной операции'),bank=document.createElement('input');bank.required=true;bank.maxLength=80;bankLabel.append(bank);
        const reasonLabel=text('label','Основание исправления (от 20 символов)'),reason=document.createElement('textarea');reason.required=true;reason.minLength=20;reason.maxLength=500;reasonLabel.append(reason);
        const verifiedLabel=text('label','Сверил(а) плательщика с банковской операцией'),verified=document.createElement('input');verified.type='checkbox';verified.required=true;verifiedLabel.prepend(verified);
        const save=text('button','Исправить адрес');save.type='submit';correction.append(emailLabel,bankLabel,reasonLabel,verifiedLabel,save);details.append(correction);card.append(details);
        correction.addEventListener('submit',async event=>{
          event.preventDefault();save.disabled=true;
          try{await api(`leads/${lead.id}/email`,{method:'PATCH',body:JSON.stringify({email:email.value,version:lead.version,bankReference:bank.value,note:reason.value,verifiedPayer:verified.checked})});notice('Адрес исправлен, изменение записано в журнал. Доступ и письмо не выданы автоматически.');await load(lead.id)}
          catch(error){notice(error.message,true);message.focus()}finally{save.disabled=false}
        });
      }
      const details=document.createElement('details');details.append(text('summary','Сохранённые подтверждения'));
      for(const [key,value] of Object.entries(lead.acknowledgments||{}))details.append(text('p',`${key}: ${value.acceptedAt}; редакция ${value.version}; SHA-256 ${value.sha256}`));
      card.append(details);list.append(card);
    }
    actions.forEach(button=>button.disabled=false);
    document.querySelector('#admin-prev').disabled=page===1;
    document.querySelector('#admin-next').disabled=page*25>=data.total;
    if(focusId){const card=[...list.children].find(card=>card.dataset.id===focusId);(card?.querySelector('select')||filters.elements.status).focus()}
  }catch(error){notice(error.message||'Не удалось загрузить заявки.',true);actions.forEach(button=>button.disabled=false)}
  finally{loading=false;workspace.removeAttribute('aria-busy')}
}
login.addEventListener('submit',async event=>{
  event.preventDefault();const button=login.querySelector('button');button.disabled=true;
  try{const result=await api('login',{method:'POST',body:JSON.stringify({username:login.elements.username.value,password:login.elements.password.value})});csrf=result.csrfToken;login.reset();login.hidden=true;workspace.hidden=false;notice('Вход выполнен.');await load()}
  catch(error){notice(error.message||'Сервер недоступен.',true)}finally{button.disabled=false}
});
filters.addEventListener('submit',event=>{event.preventDefault();page=1;void load()});
document.querySelector('#admin-refresh').addEventListener('click',()=>load());
document.querySelector('#admin-prev').addEventListener('click',()=>{if(page>1){page--;void load()}});
document.querySelector('#admin-next').addEventListener('click',()=>{page++;void load()});
document.querySelector('#admin-logout').addEventListener('click',async()=>{try{await api('logout',{method:'POST',body:'{}'});signedOut();notice('Вы вышли.');login.elements.username.focus()}catch(error){notice(error.message,true)}});
try{const result=await api('session');csrf=result.csrfToken;workspace.hidden=false;notice('');await load()}catch{signedOut();notice('Введите логин и пароль администратора.')}
