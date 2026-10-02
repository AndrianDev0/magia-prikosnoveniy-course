// Client-side checks improve the demo UX; a real payment API must repeat them
// server-side and add rate limits, verified contacts and payment verification.
export function validatePaymentField(field, raw) {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (field === 'consent') return raw === true ? '' : 'Подтвердите согласие на обработку данных.';
  if (field === 'offer') return raw === true ? '' : 'Примите оферту и пользовательское соглашение.';
  if (field === 'adult') return raw === true ? '' : 'Курс доступен только совершеннолетним. Подтвердите, что вам исполнилось 18 лет.';
  if (!value) return {name:'Введите ваше имя.',email:'Введите электронную почту.'}[field] || '';
  if (field === 'name') {
    if (value.length < 2 || value.length > 80) return 'Имя должно содержать от 2 до 80 символов.';
    if (!/^[\p{L}\p{M} '\u2019\u002d]+$/u.test(value) || (value.match(/\p{L}/gu) || []).length < 2) return 'В имени используйте буквы, пробел, дефис или апостроф.';
  }
  if (field === 'email') {
    const parts = value.split('@');
    if (value.length > 254 || parts.length !== 2) return 'Проверьте почту: например, name@example.com.';
    const [local, domain] = parts;
    if (!local || local.length > 64 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local) || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return 'Проверьте часть адреса перед @.';
    const labels = domain.split('.');
    if (domain.length > 253 || labels.length < 2 || !labels.every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label)) || !/^(?:[a-z]{2,63}|xn--[a-z0-9-]{2,59})$/i.test(labels.at(-1))) return 'Укажите домен полностью: например, example.com.';
  }
  return '';
}

const requiredDocuments = ['offer','consent','privacy','user-agreement','rules-18'];
export async function createLegalSnapshot(packet) {
  if (!packet || typeof packet.version !== 'string' || packet.version.length > 20 || typeof packet.revision !== 'string' || packet.revision.length > 128) throw new Error('invalid-legal-packet');
  const snapshot = {};
  for (const slug of requiredDocuments) {
    const doc = packet.documents?.[slug];
    if (!doc || doc.slug !== slug || typeof doc.title !== 'string' || !Array.isArray(doc.blocks) || !doc.blocks.length) throw new Error('missing-legal-document');
    const bytes = new TextEncoder().encode(JSON.stringify(doc));
    const hash = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    snapshot[slug] = {slug,version:packet.version,revision:packet.revision,sha256:Array.from(new Uint8Array(hash),byte=>byte.toString(16).padStart(2,'0')).join('')};
  }
  return snapshot;
}

export function createPaymentLead(values, planId, snapshot, now = new Date()) {
  if (!Object.hasOwn(paymentPlans,planId)) throw new Error('invalid-plan');
  for (const field of ['name','email','offer','consent','adult']) {
    if (validatePaymentField(field,values[field])) throw new Error('invalid-fields');
  }
  if (!requiredDocuments.every(slug=>snapshot?.[slug]?.slug === slug && typeof snapshot[slug].version === 'string' && snapshot[slug].version.length <= 20 && typeof snapshot[slug].revision === 'string' && snapshot[slug].revision.length <= 128 && /^[a-f0-9]{64}$/.test(snapshot[slug].sha256))) throw new Error('invalid-legal-snapshot');
  const acceptedAt = now.toISOString();
  const acknowledgment = slug=>({accepted:true,acceptedAt,slug,version:snapshot[slug].version,revision:snapshot[slug].revision,sha256:snapshot[slug].sha256});
  return {
    id:globalThis.crypto.randomUUID(),createdAt:acceptedAt,
    name:values.name.trim().replace(/ +/g,' '),email:values.email.trim().toLowerCase(),
    planId,planName:paymentPlans[planId].name,price:paymentPlans[planId].price,status:'pending',
    acknowledgments:{offer:acknowledgment('offer'),consent:acknowledgment('consent'),privacy:acknowledgment('privacy'),userAgreement:acknowledgment('user-agreement'),adult:acknowledgment('rules-18')},
    evidenceMode:'browser-demo'
  };
}

export const paymentPlans = {
  standard:{name:'Стандарт',price:'25 000 руб.',benefits:['7 видеоуроков','Доступ к видеокурсу — 12 месяцев']},
  vip:{name:'VIP',price:'35 000 руб.',benefits:['7 видеоуроков без ограничения срока доступа','2 видеоконсультации по 1 часу']},
  'vip-plus':{name:'VIP+',price:'50 000 руб.',benefits:['7 видеоуроков без ограничения срока доступа','4 видеоконсультации по 1 часу','Одно очное занятие в течение года с даты покупки, при наличии занятия и предварительном согласовании']}
};

export function storePaymentLead(lead, storage, now = Date.now()) {
  const key = 'magic-touch-payment-leads-v1';
  const leads = JSON.parse(storage.getItem(key) || '[]');
  if (!Array.isArray(leads) || !leads.every(item => item && typeof item === 'object' && typeof item.email === 'string' && (item.phone === undefined || typeof item.phone === 'string'))) throw new Error('invalid-storage');
  const duplicate = leads.some(item => item.planId === lead.planId && item.status === 'pending' && item.email.toLowerCase() === lead.email.toLowerCase() && now - Date.parse(item.createdAt) < 300000);
  if (duplicate) return 'duplicate';
  if (leads.length >= 100) return 'full';
  // A failed write throws; callers must not display a success state.
  storage.setItem(key, JSON.stringify([lead,...leads]));
  return 'saved';
}

if (typeof document !== 'undefined') {
  const modal = document.querySelector('#payment-modal');
  const form = document.querySelector('#payment-form');
  if (modal && form) {
    const plans = paymentPlans;
    const fields = ['name','email','offer','consent','adult'];
    const checkboxFields = new Set(['offer','consent','adult']);
    const summary = form.querySelector('.payment-form-error');
    const submit = form.querySelector('.payment-submit');
    const touched = new Set();
    let selectedPlan = 'vip';
    let busy = false;
    let completed = false;
    let legalSnapshot = null;
    let legalLoading = false;
    const legalStatus = form.querySelector('.payment-legal-status');
    const legalRetry = form.querySelector('.payment-legal-retry');
    const planChoices = Array.from(form.querySelectorAll('[data-payment-choice]'));
    const planChangeNote = form.querySelector('.payment-plan-change-note');
    async function loadLegalDocuments() {
      if (legalLoading || legalSnapshot) return;
      legalLoading = true; submit.disabled = true; legalRetry.hidden = true;
      legalStatus.textContent = 'Проверяем редакцию документов…';
      try {
        const response = await fetch('./course/legal-documents.json',{cache:'no-store'});
        if (!response.ok) throw new Error('legal-fetch-failed');
        const packet = await response.json();
        legalSnapshot = await createLegalSnapshot(packet);
        legalStatus.textContent = `Документы: редакция ${packet.version} от ${packet.revision}. Подтверждения сохраняются только в этом браузере (демо).`;
      } catch {
        legalStatus.textContent = 'Документы не загрузились. Заявка недоступна, пока не проверена их редакция.';
        legalRetry.hidden = false;
      } finally {
        legalLoading = false; submit.disabled = !legalSnapshot;
      }
    }
    legalRetry.addEventListener('click', loadLegalDocuments);
    function showError(field) {
      const input = form.elements.namedItem(field);
      const message = validatePaymentField(field, checkboxFields.has(field) ? input.checked : input.value);
      const error = document.querySelector(`#payment-${field}-error`);
      input.setAttribute('aria-invalid', String(Boolean(message)));
      error.textContent = message;
      error.hidden = !message;
      return message;
    }
    function clearSummary() { summary.hidden = true; summary.replaceChildren(); }
    function formError(message) {
      summary.replaceChildren();
      summary.textContent = message;
      summary.hidden = false;
      summary.focus();
    }
    function selectPlan(plan) {
      selectedPlan = Object.hasOwn(plans, plan) ? plan : 'vip';
      const selected = plans[selectedPlan];
      planChoices.forEach(input => { input.checked = input.value === selectedPlan; });
      modal.querySelector('[data-payment-name]').textContent = selected.name;
      modal.querySelector('[data-payment-price]').textContent = selected.price;
      const benefits = modal.querySelector('.payment-benefits'); benefits.replaceChildren();
      selected.benefits.forEach(text=>{const item=document.createElement('li');item.textContent=text;benefits.append(item);});
      modal.querySelector('.payment-qr').open = false;
    }
    planChoices.forEach(input => input.addEventListener('change', () => {
      if (!input.checked || busy || completed || input.value === selectedPlan || !Object.hasOwn(plans,input.value)) return;
      selectPlan(input.value);
      // Contact details and general consents remain; tariff terms need a new choice.
      const offer = form.elements.namedItem('offer');
      offer.checked = false; offer.removeAttribute('aria-invalid');
      touched.delete('offer'); document.querySelector('#payment-offer-error').hidden = true;
      clearSummary();
      planChangeNote.textContent = `Тариф ${plans[selectedPlan].name}: ${plans[selectedPlan].price} Подтвердите его условия.`;
      planChangeNote.hidden = false;
    }));
    function open(plan) {
      form.reset(); touched.clear(); clearSummary(); completed = false;
      planChangeNote.hidden = true;
      legalSnapshot = null;
      fields.forEach(field => {
        form.elements.namedItem(field).removeAttribute('aria-invalid');
        document.querySelector(`#payment-${field}-error`).hidden = true;
      });
      form.querySelectorAll('.payment-copy,.payment-fields').forEach(item => item.hidden = false);
      form.querySelector('.payment-success').hidden = true;
      selectPlan(plan);
      modal.showModal(); modal.scrollTop = 0;
      void loadLegalDocuments();
    }
    document.querySelectorAll('[data-payment-plan]').forEach(button => button.addEventListener('click', event => { event.preventDefault(); open(button.dataset.paymentPlan); }));
    modal.querySelector('.payment-close').addEventListener('click', () => modal.close());
    modal.querySelector('[data-payment-done]').addEventListener('click', () => modal.close());
    modal.addEventListener('click', event => { if (event.target === modal) modal.close(); });
    fields.forEach(field => {
      const input = form.elements.namedItem(field);
      input.addEventListener('blur', event => {
        touched.add(field);
        // A newly inserted error must not move the submit button underneath
        // the pointer between mousedown and click. Submit validates all fields.
        if (event.relatedTarget !== submit) showError(field);
      });
      input.addEventListener(checkboxFields.has(field) ? 'change' : 'input', () => {
        clearSummary();
        if (field === 'offer' && input.checked) planChangeNote.hidden = true;
        if (touched.has(field)) showError(field);
      });
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (busy || completed) return;
      clearSummary();
      if (!legalSnapshot) { formError('Сначала дождитесь загрузки юридических документов или повторите её.'); return; }
      const errors = fields.map(field => { touched.add(field); return {field,message:showError(field)}; }).filter(item => item.message);
      if (errors.length) {
        const title = document.createElement('p'); title.textContent = 'Проверьте поля перед сохранением:';
        const list = document.createElement('ul');
        errors.forEach(({field,message}) => {
          const item = document.createElement('li'); const link = document.createElement('a');
          link.href = `#payment-${field}`; link.textContent = message;
          link.addEventListener('click', event => { event.preventDefault(); form.elements.namedItem(field).focus(); });
          item.append(link); list.append(item);
        });
        summary.append(title,list); summary.hidden = false; summary.focus(); return;
      }
      busy = true; submit.disabled = true; form.setAttribute('aria-busy','true');
      const data = new FormData(form);
      try {
        const lead = createPaymentLead({name:String(data.get('name')),email:String(data.get('email')),offer:data.get('offer') === 'on',consent:data.get('consent') === 'on',adult:data.get('adult') === 'on'},selectedPlan,legalSnapshot);
        // Treat browser storage as untrusted. Never render contacts as HTML.
        const result = storePaymentLead(lead, localStorage);
        if (result === 'duplicate') { formError('Такая заявка уже сохранена. Посмотрите её в демо-админке или подождите 5 минут перед повторным сохранением.'); return; }
        if (result === 'full') { formError('В демо уже сохранено 100 заявок. Новая заявка не записана; старые данные сохранены.'); return; }
        completed = true;
        form.querySelectorAll('.payment-copy,.payment-fields').forEach(item => item.hidden = true);
        const success = form.querySelector('.payment-success'); success.hidden = false;
        success.setAttribute('tabindex','-1'); success.focus(); modal.scrollTop = 0;
      } catch {
        formError('Не удалось сохранить заявку в браузере. Проверьте разрешение на хранение данных или попробуйте другой браузер. Ваши поля не сброшены.');
      } finally {
        busy = false; submit.disabled = false; form.removeAttribute('aria-busy');
      }
    });
  }
}
