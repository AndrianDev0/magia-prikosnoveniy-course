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
      const form=document.createElement('form');form.className='admin-status-form';
      const statusLabel=text('label','Статус'),select=document.createElement('select');select.name='status';
      for(const [value,label] of [['pending','Ожидает'],['confirmed','Оплата проверена вручную'],['rejected','Отклонена']]){const option=text('option',label);option.value=value;select.append(option)}
      select.value=lead.status;statusLabel.append(select);
      const noteLabel=text('label','Комментарий / номер операции банка'),note=document.createElement('textarea');note.name='note';note.required=true;note.minLength=5;note.maxLength=500;noteLabel.append(note);
      const save=text('button','Сохранить');save.type='submit';form.append(statusLabel,noteLabel,save);card.append(form);
      const details=document.createElement('details');details.append(text('summary','Сохранённые подтверждения'));
      for(const [key,value] of Object.entries(lead.acknowledgments||{}))details.append(text('p',`${key}: ${value.acceptedAt}; редакция ${value.version}; SHA-256 ${value.sha256}`));
      card.append(details);list.append(card);
      form.addEventListener('submit',async event=>{
        event.preventDefault();save.disabled=true;
        try{await api(`leads/${lead.id}`,{method:'PATCH',body:JSON.stringify({status:select.value,version:lead.version,note:note.value})});notice('Статус сохранён. Действие записано в журнал.');await load(lead.id)}
        catch(error){notice(error.message,true);message.focus()}finally{save.disabled=false}
      });
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
