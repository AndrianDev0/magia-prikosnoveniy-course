// Client-side checks improve the demo UX; a real payment API must repeat them
// server-side and add rate limits, verified contacts and payment verification.
export function validatePaymentField(field, raw) {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (field === 'consent') return raw === true ? '' : 'Подтвердите согласие на обработку данных.';
  if (!value) return {name:'Введите ваше имя.',email:'Введите электронную почту.',phone:'Введите номер телефона.'}[field] || '';
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
  if (field === 'phone') {
    const digits = value.replace(/\D/g, '');
    if (value.length > 32 || !/^\+?[\d ()-]+$/.test(value) || digits.length < 10 || digits.length > 15 || /^(\d)\1+$/.test(digits)) return 'Введите номер из 10–15 цифр, например +7 900 123-45-67.';
  }
  return '';
}

export function storePaymentLead(lead, storage, now = Date.now()) {
  const key = 'magic-touch-payment-leads-v1';
  const leads = JSON.parse(storage.getItem(key) || '[]');
  if (!Array.isArray(leads) || !leads.every(item => item && typeof item === 'object' && typeof item.email === 'string' && typeof item.phone === 'string')) throw new Error('invalid-storage');
  const duplicate = leads.some(item => item.planId === lead.planId && item.status === 'pending' && item.email.toLowerCase() === lead.email.toLowerCase() && item.phone.replace(/\D/g,'') === lead.phone.replace(/\D/g,'') && now - Date.parse(item.createdAt) < 300000);
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
    const plans = {standard:{name:'Стандарт',price:'25 000 руб.'},vip:{name:'VIP',price:'35 000 руб.'},'vip-plus':{name:'VIP+',price:'50 000 руб.'}};
    const fields = ['name','email','phone','consent'];
    const summary = form.querySelector('.payment-form-error');
    const submit = form.querySelector('.payment-submit');
    const touched = new Set();
    let selectedPlan = 'vip';
    let busy = false;
    let completed = false;
    function showError(field) {
      const input = form.elements.namedItem(field);
      const message = validatePaymentField(field, field === 'consent' ? input.checked : input.value);
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
    function open(plan) {
      selectedPlan = Object.hasOwn(plans, plan) ? plan : 'vip';
      form.reset(); touched.clear(); clearSummary(); completed = false;
      fields.forEach(field => {
        form.elements.namedItem(field).removeAttribute('aria-invalid');
        document.querySelector(`#payment-${field}-error`).hidden = true;
      });
      form.querySelectorAll('.payment-copy,.payment-fields').forEach(item => item.hidden = false);
      form.querySelector('.payment-success').hidden = true;
      modal.querySelector('[data-payment-name]').textContent = plans[selectedPlan].name;
      modal.querySelector('[data-payment-price]').textContent = plans[selectedPlan].price;
      modal.querySelector('.payment-qr').open = false;
      modal.showModal(); modal.scrollTop = 0;
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
      input.addEventListener(field === 'consent' ? 'change' : 'input', () => {
        clearSummary();
        if (touched.has(field)) showError(field);
      });
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (busy || completed) return;
      clearSummary();
      const errors = fields.map(field => { touched.add(field); return {field,message:showError(field)}; }).filter(item => item.message);
      if (errors.length) {
        const title = document.createElement('p'); title.textContent = 'Проверьте поля перед отправкой:';
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
      const lead = {id:globalThis.crypto?.randomUUID?.() || String(Date.now()),createdAt:new Date().toISOString(),name:String(data.get('name')).trim().replace(/ +/g,' '),email:String(data.get('email')).trim().toLowerCase(),phone:String(data.get('phone')).trim(),planId:selectedPlan,planName:plans[selectedPlan].name,price:plans[selectedPlan].price,status:'pending'};
      try {
        // Treat browser storage as untrusted. Never render contacts as HTML.
        const result = storePaymentLead(lead, localStorage);
        if (result === 'duplicate') { formError('Такая заявка уже сохранена. Посмотрите её в демо-админке или подождите 5 минут перед повторной отправкой.'); return; }
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
