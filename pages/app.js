if(typeof document!=="undefined"){
const documents=document.querySelector('#documents');
const plan=document.querySelector('#plan-modal');
const checks=[...document.querySelectorAll('.consent input')];
const continueButton=document.querySelector('.documents-continue');
const reopenButton=document.querySelector('.documents-reopen');
const page=document.querySelector('main');
let lastFocused=null;
const accepted='magic-touch-documents-pages-v3';
function showDocuments(){lastFocused=document.activeElement;documents.hidden=false;if(page)page.inert=true;document.body.style.overflow='hidden';documents.querySelector('.documents-modal')?.focus()}
function hideDocuments(){documents.hidden=true;if(page)page.inert=false;document.body.style.overflow='';if(lastFocused instanceof HTMLElement&&lastFocused!==document.body)lastFocused.focus()}
if(!localStorage.getItem(accepted)) showDocuments();
reopenButton?.addEventListener('click',showDocuments);
checks.forEach(check=>check.addEventListener('change',()=>{continueButton.disabled=!checks.every(item=>item.checked)}));
continueButton?.addEventListener('click',()=>{if(checks.every(item=>item.checked)){localStorage.setItem(accepted,'yes');hideDocuments()}});
documents?.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();return}
  if(event.key!=='Tab')return;
  const modal=documents.querySelector('.documents-modal');
  const focusable=[...documents.querySelectorAll('a[href],input:not([disabled]),button:not([disabled])')].filter(item=>item instanceof HTMLElement&&item.offsetParent!==null);
  if(!focusable.length){event.preventDefault();return}
  const first=focusable[0],last=focusable[focusable.length-1];
  if(event.shiftKey&&(document.activeElement===first||document.activeElement===modal)){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===modal)){event.preventDefault();first.focus()}
});
document.querySelectorAll('[data-plan-open]').forEach(button=>button.addEventListener('click',()=>plan?.showModal()));
document.querySelector('.plan-close')?.addEventListener('click',()=>plan?.close());

const carousel=document.querySelector('.mobile-carousel');
let index=1,start=null;
function select(next){index=Math.max(0,Math.min(2,next));carousel.dataset.index=String(index);document.querySelectorAll('.slide').forEach((el,i)=>el.classList.toggle('active',i===index));document.querySelectorAll('[data-dot]').forEach((el,i)=>{el.classList.toggle('active',i===index);if(i===index)el.setAttribute('aria-current','true');else el.removeAttribute('aria-current')});}
document.querySelector('[data-prev]')?.addEventListener('click',()=>select(index-1));
document.querySelector('[data-next]')?.addEventListener('click',()=>select(index+1));
document.querySelectorAll('[data-dot]').forEach((dot,i)=>dot.addEventListener('click',()=>select(i)));
carousel?.addEventListener('touchstart',event=>{start=event.touches[0]?.clientX??null},{passive:true});
carousel?.addEventListener('touchend',event=>{const end=event.changedTouches[0]?.clientX;if(start===null||end===undefined||Math.abs(end-start)<35)return;select(index+(end<start?1:-1));start=null},{passive:true});
}
