import { randomBytes } from 'node:crypto';
import { hashPassword } from './security.mjs';
const password=randomBytes(24).toString('base64url');
console.log(`New admin password (store privately): ${password}`);
console.log(`Replace ADMIN_PASSWORD_HASH in deploy/.env.production with:\n${await hashPassword(password)}`);
console.log('Recreate the app container to apply. Existing sessions will stop working.');
