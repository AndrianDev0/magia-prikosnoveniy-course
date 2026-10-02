if(typeof document!=='undefined'){
  const key='magic-touch-payment-leads-v1';
  const list=document.querySelector('.demo-admin-list');
  const template=document.querySelector('#lead-template');
  let leads=[];
  try{
    const stored=JSON.parse(localStorage.getItem(key)||'[]');
    if(Array.isArray(stored))leads=stored.filter(item=>item&&typeof item==='object'&&['id','name','email','planId','planName','price','createdAt'].every(field=>typeof item[field]==='string'&&item[field].length<=254)&&(item.phone===undefined||typeof item.phone==='string')&&['pending','confirmed','rejected'].includes(item.status)&&Number.isFinite(Date.parse(item.createdAt)));
  }catch{}
  function save(){try{localStorage.setItem(key,JSON.stringify(leads))}catch{}}
  function render(){
    list.replaceChildren();
    document.querySelector('[data-total]').textContent=String(leads.length);
    document.querySelector('[data-pending]').textContent=String(leads.filter(item=>item.status==='pending').length);
    document.querySelector('[data-confirmed]').textContent=String(leads.filter(item=>item.status==='confirmed').length);
    if(!leads.length){const empty=document.createElement('p');empty.className='demo-admin-empty';empty.textContent='Заявок пока нет. Откройте любой тариф на главной странице и заполните форму.';list.append(empty);return}
    leads.forEach(lead=>{
      const card=template.content.firstElementChild.cloneNode(true);
      card.querySelector('[data-name]').textContent=lead.name;
      card.querySelector('[data-plan]').textContent=`${lead.planName} · ${lead.price}`;
      const email=card.querySelector('[data-email]');email.textContent=lead.email;if(/^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,63}$/i.test(lead.email))email.href=`mailto:${encodeURIComponent(lead.email)}`;else email.removeAttribute('href');
      const phone=card.querySelector('[data-phone]');if(typeof lead.phone==='string'){phone.textContent=lead.phone;if(/^\+?[\d ()-]{10,32}$/.test(lead.phone))phone.href=`tel:${lead.phone.replace(/[^+\d]/g,'')}`;else phone.removeAttribute('href')}else phone.remove();
      const date=card.querySelector('[data-date]');date.dateTime=lead.createdAt;date.textContent=new Intl.DateTimeFormat('ru-RU',{dateStyle:'medium',timeStyle:'short'}).format(new Date(lead.createdAt));
      const status=card.querySelector('[data-status]');status.value=lead.status;status.addEventListener('change',()=>{lead.status=status.value;save();render()});
      const acknowledgments=document.createElement('details');acknowledgments.className='demo-lead-consents';
      const heading=document.createElement('summary');heading.textContent='Подтверждения и редакции документов (демо)';acknowledgments.append(heading);
      const items=[['offer','Оферта','offer'],['consent','Обработка данных','consent'],['privacy','Ознакомление с политикой','privacy'],['userAgreement','Пользовательское соглашение','user-agreement'],['adult','Подтверждение 18+ и правил безопасности','rules-18']];
      const complete=lead.evidenceMode==='browser-demo'&&items.every(([field,,slug])=>{const entry=lead.acknowledgments?.[field];return entry&&entry.accepted===true&&entry.slug===slug&&typeof entry.version==='string'&&entry.version.length<=20&&typeof entry.revision==='string'&&entry.revision.length<=128&&Number.isFinite(Date.parse(entry.acceptedAt))&&/^[a-f0-9]{64}$/.test(entry.sha256)});
      const note=document.createElement('p');
      note.textContent=complete?'Сохранено только в браузере. Это не защищённый серверный журнал и не подтверждение оплаты.':'Подтверждения не зафиксированы или имеют неполный формат. Старой демо-заявке согласия автоматически не приписываются.';
      acknowledgments.append(note);
      if(complete){const entries=document.createElement('ul');items.forEach(([field,label])=>{const record=lead.acknowledgments[field];const item=document.createElement('li');const text=document.createElement('p');text.textContent=`${label}: подтверждено ${new Intl.DateTimeFormat('ru-RU',{dateStyle:'medium',timeStyle:'short'}).format(new Date(record.acceptedAt))}; редакция ${record.version} от ${record.revision}.`;const hash=document.createElement('p');hash.textContent=`SHA-256: ${record.sha256}`;item.append(text,hash);entries.append(item)});acknowledgments.append(entries)}
      card.append(acknowledgments);
      list.append(card);
    });
  }
  render();
}
