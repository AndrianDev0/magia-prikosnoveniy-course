import { resolve } from 'node:path';

export function loadConfig(env=process.env) {
  const origin=new URL(env.PUBLIC_ORIGIN || 'http://127.0.0.1:4189');
  const production=env.NODE_ENV==='production';
  if(origin.pathname!=='/' || origin.search || origin.hash || origin.username || origin.password)throw new Error('PUBLIC_ORIGIN must be a bare origin');
  if(production && (origin.protocol!=='https:' || /(^|\.)example\.(com|org|net)$|\.(invalid|test|example)$/.test(origin.hostname)))throw new Error('Configure a real HTTPS PUBLIC_ORIGIN');
  if(!['http:','https:'].includes(origin.protocol))throw new Error('Invalid origin protocol');
  if(!/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(env.ADMIN_PASSWORD_HASH || ''))throw new Error('ADMIN_PASSWORD_HASH is required; run server/setup.mjs');
  if(!/^[a-f0-9]{64}$/.test(env.SESSION_SECRET || ''))throw new Error('SESSION_SECRET must contain 64 random hexadecimal characters');
  if(!env.DATABASE_URL)throw new Error('DATABASE_URL is required');
  const paymentMode=env.PAYMENT_MODE || 'disabled';
  if(!['disabled','manual-qr'].includes(paymentMode))throw new Error('Unknown PAYMENT_MODE');
  const qrFiles={standard:env.QR_STANDARD_FILE,vip:env.QR_VIP_FILE,'vip-plus':env.QR_VIP_PLUS_FILE};
  for(const file of Object.values(qrFiles))if(file && !/^[a-zA-Z0-9_-]+\.(png|jpg|webp)$/.test(file))throw new Error('QR files must be simple PNG/JPG/WebP filenames');
  if(paymentMode==='manual-qr' && (!env.PAYMENT_RECIPIENT || !Object.values(qrFiles).every(Boolean)))throw new Error('Manual QR requires recipient and all three tariff QR files');
  const port=Number(env.PORT || 4189);
  if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid PORT');
  return {
    origin:origin.origin,secure:origin.protocol==='https:',production,port,
    host:env.HOST || '127.0.0.1',databaseUrl:env.DATABASE_URL,
    adminUsername:env.ADMIN_USERNAME || 'admin',passwordHash:env.ADMIN_PASSWORD_HASH,
    sessionSecret:env.SESSION_SECRET,trustProxy:env.TRUST_PROXY==='true',
    paymentMode,qrFiles,paymentRecipient:env.PAYMENT_RECIPIENT || '',
    supportEmail:env.SUPPORT_EMAIL || 'emil_ka@list.ru',
    qrDirectory:resolve(env.QR_DIRECTORY || 'deploy/payment-assets'),
    root:resolve(env.SITE_ROOT || '.'),
  };
}
