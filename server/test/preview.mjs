// Disposable UI fixture. Never used by Docker or the production entry point.
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createHandler } from '../app.mjs';
import { loadConfig } from '../config.mjs';
import { hashPassword } from '../security.mjs';
import { memoryStore } from './memory-store.mjs';
if(process.env.NODE_ENV==='production')throw new Error('Preview is not a production server');
const config=loadConfig({PUBLIC_ORIGIN:'http://127.0.0.1:4189',ADMIN_PASSWORD_HASH:await hashPassword('local-review-only'),SESSION_SECRET:randomBytes(32).toString('hex'),DATABASE_URL:'test-fixture-only',SITE_ROOT:fileURLToPath(new URL('../../',import.meta.url))});
createServer(await createHandler(config,memoryStore())).listen(4189,'127.0.0.1',()=>console.log('Disposable memory preview at http://127.0.0.1:4189. Test login: admin / local-review-only. Not production storage.'));
