import { randomBytes } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { hashPassword } from './security.mjs';

const [domain,email]=process.argv.slice(2);
if(!domain||!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)||!email||!/^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,63}$/i.test(email))throw new Error('Usage: node server/setup.mjs your-domain.ru owner@example.com');
const password=randomBytes(24).toString('base64url');
const settings=`DOMAIN=${domain}\nTLS_EMAIL=${email}\nDB_PASSWORD=${randomBytes(32).toString('hex')}\nADMIN_USERNAME=admin\nADMIN_PASSWORD_HASH=${await hashPassword(password)}\nSESSION_SECRET=${randomBytes(32).toString('hex')}\nSUPPORT_EMAIL=emil_ka@list.ru\nPAYMENT_MODE=disabled\nPAYMENT_RECIPIENT=\nQR_STANDARD_FILE=\nQR_VIP_FILE=\nQR_VIP_PLUS_FILE=\n`;
await mkdir(resolve('deploy/payment-assets'),{recursive:true});
await writeFile(resolve('deploy/.env.production'),settings,{flag:'wx',mode:0o600});
console.log('Created deploy/.env.production. Existing settings are never overwritten.');
console.log(`Admin username: admin\nAdmin password (store in a password manager; shown once): ${password}`);
