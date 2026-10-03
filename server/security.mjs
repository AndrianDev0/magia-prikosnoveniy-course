import { randomBytes, scrypt, timingSafeEqual, createHash, createHmac } from 'node:crypto';
import { promisify } from 'node:util';
const derive=promisify(scrypt);
export const sha256=value=>createHash('sha256').update(value).digest('hex');
export const token=()=>randomBytes(32).toString('hex');
export async function hashPassword(password,salt=randomBytes(16).toString('hex')) {
  const hash=await derive(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});
  return `${salt}:${hash.toString('hex')}`;
}
export async function verifyPassword(password,stored) {
  if(typeof password!=='string'||password.length>256)return false;
  const actual=await hashPassword(password,stored.split(':')[0]);
  return timingSafeEqual(Buffer.from(actual),Buffer.from(stored));
}
export const csrfToken=(session,secret)=>createHmac('sha256',secret).update(`csrf:${session}`).digest('hex');
export function sameToken(a,b) {
  return typeof a==='string'&&typeof b==='string'&&/^[a-f0-9]{64}$/.test(a)&&/^[a-f0-9]{64}$/.test(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
}
export function sessionCookie(value,secure,maxAge=28800) {
  return `course_admin=${value}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure?'; Secure':''}`;
}
export function readSessionCookie(request) {
  return /(?:^|;\s*)course_admin=([a-f0-9]{64})(?:;|$)/.exec(request.headers.cookie || '')?.[1];
}
export class HttpError extends Error {
  constructor(status,message){super(message);this.status=status}
}
export async function readJson(request) {
  if(!/^application\/json(?:;|$)/i.test(request.headers['content-type'] || ''))throw new HttpError(415,'Ожидается JSON.');
  let size=0;const chunks=[];
  for await(const chunk of request){size+=chunk.length;if(size>16384)throw new HttpError(413,'Запрос слишком большой.');chunks.push(chunk)}
  try{const value=JSON.parse(Buffer.concat(chunks).toString());if(!value||typeof value!=='object'||Array.isArray(value))throw Error();return value}catch{throw new HttpError(400,'Некорректный запрос.')}
}
