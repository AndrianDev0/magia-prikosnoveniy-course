import { HttpError } from './security.mjs';

export const paymentStatuses=['pending','confirmed','rejected','refund_requested','refunded'];
const transitions={
  pending:['confirmed','rejected'],
  confirmed:['refund_requested'],
  refund_requested:['confirmed','refunded'],
  rejected:[],
  refunded:[],
};

export function assertPaymentTransition(current,next,bankReference,reference){
  if(!transitions[current]?.includes(next))throw new HttpError(409,'Этот переход статуса недоступен. Обновите список.');
  if(next==='confirmed'&&!bankReference&&!reference)throw new HttpError(400,'Укажите проверенный номер операции банка.');
  if(next==='refunded'&&!reference)throw new HttpError(400,'Укажите номер операции возврата из банка.');
}

export function validBankReference(value){
  return typeof value==='string'&&/^[\p{L}\p{N}][\p{L}\p{N} ./_-]{5,79}$/u.test(normalizeBankReference(value));
}

export const normalizeBankReference=value=>value.trim().replace(/\s+/g,' ').toUpperCase();
