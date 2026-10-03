import { spawn } from 'node:child_process';
import { mkdir, chmod } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { resolve } from 'node:path';

const directory=resolve('deploy/backups');
await mkdir(directory,{recursive:true,mode:0o700});
const file=resolve(directory,`course-${new Date().toISOString().replaceAll(':','-')}.dump`);
const child=spawn('docker',['compose','--env-file','deploy/.env.production','-f','deploy/compose.yaml','exec','-T','db','pg_dump','-U','course','-d','course','-Fc'],{stdio:['ignore','pipe','inherit']});
const completion=new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',code=>code===0?resolve():reject(new Error(`pg_dump failed (${code}); do not use the partial backup`)))});
await Promise.all([pipeline(child.stdout,createWriteStream(file,{flags:'wx',mode:0o600})),completion]);
await chmod(file,0o600);
console.log(`Backup saved: ${file}. Keep an encrypted off-server copy and test restoration.`);
