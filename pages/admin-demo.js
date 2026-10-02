if(typeof document!=='undefined'){
  const key='magic-touch-payment-leads-v1';
  const list=document.querySelector('.demo-admin-list');
  const template=document.querySelector('#lead-template');
  let leads=[];
  try{
    const stored=JSON.parse(localStorage.getItem(key)||'[]');
    if(Array.isArray(stored))leads=stored.filter(item=>item&&typeof item==='object'&&['id','name','email','phone','planId','planName','price','createdAt'].every(field=>typeof item[field]==='string'&&item[field].length<=254)&&['pending','confirmed','rejected'].includes(item.status)&&Number.isFinite(Date.parse(item.createdAt)));
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
      const phone=card.querySelector('[data-phone]');phone.textContent=lead.phone;if(/^\+?[\d ()-]{10,32}$/.test(lead.phone))phone.href=`tel:${lead.phone.replace(/[^+\d]/g,'')}`;else phone.removeAttribute('href');
      const date=card.querySelector('[data-date]');date.dateTime=lead.createdAt;date.textContent=new Intl.DateTimeFormat('ru-RU',{dateStyle:'medium',timeStyle:'short'}).format(new Date(lead.createdAt));
      const status=card.querySelector('[data-status]');status.value=lead.status;status.addEventListener('change',()=>{lead.status=status.value;save();render()});
      list.append(card);
    });
  }
  render();
}
