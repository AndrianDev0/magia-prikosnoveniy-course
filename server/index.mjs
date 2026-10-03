import { createServer } from 'node:http';
import { loadConfig } from './config.mjs';
import { postgresStore } from './store.mjs';
import { createHandler } from './app.mjs';

const config=loadConfig();
const store=postgresStore(config.databaseUrl);
await store.migrate();
const server=createServer(await createHandler(config,store));
server.requestTimeout=15000;server.headersTimeout=10000;server.keepAliveTimeout=5000;
server.listen(config.port,config.host,()=>console.log(`Course server listening on port ${config.port}; payment mode: ${config.paymentMode}`));
const cleanup=setInterval(()=>store.cleanup().catch(()=>console.error('Expired-session cleanup failed')),3600000);cleanup.unref();
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{
  clearInterval(cleanup);
  server.close(()=>{store.close().then(()=>process.exit(0)).catch(()=>process.exit(1))});
  setTimeout(()=>process.exit(1),10000).unref();
});
