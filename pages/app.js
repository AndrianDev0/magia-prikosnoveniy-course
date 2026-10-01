const documents=document.querySelector('#documents');
const plan=document.querySelector('#plan-modal');
const checks=[...document.querySelectorAll('.consent input')];
const continueButton=document.querySelector('.documents-continue');
const accepted='magic-touch-documents-pages-v2';
if(!localStorage.getItem(accepted)){documents?.showModal();documents?.focus()}
checks.forEach(check=>check.addEventListener('change',()=>{continueButton.disabled=!checks.every(item=>item.checked)}));
continueButton?.addEventListener('click',()=>{if(checks.every(item=>item.checked)){localStorage.setItem(accepted,'yes');documents.close()}});
document.querySelectorAll('[data-plan-open]').forEach(button=>button.addEventListener('click',()=>plan?.showModal()));
document.querySelector('.plan-close')?.addEventListener('click',()=>plan?.close());

const carousel=document.querySelector('.mobile-carousel');
let index=1,start=null;
function select(next){index=Math.max(0,Math.min(2,next));carousel.dataset.index=String(index);document.querySelectorAll('.slide').forEach((el,i)=>el.classList.toggle('active',i===index));document.querySelectorAll('[data-dot]').forEach((el,i)=>el.classList.toggle('active',i===index));}
document.querySelector('[data-prev]')?.addEventListener('click',()=>select(index-1));
document.querySelector('[data-next]')?.addEventListener('click',()=>select(index+1));
document.querySelectorAll('[data-dot]').forEach((dot,i)=>dot.addEventListener('click',()=>select(i)));
carousel?.addEventListener('touchstart',event=>{start=event.touches[0]?.clientX??null},{passive:true});
carousel?.addEventListener('touchend',event=>{const end=event.changedTouches[0]?.clientX;if(start===null||end===undefined||Math.abs(end-start)<35)return;select(index+(end<start?1:-1));start=null},{passive:true});
