import { readdir } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';

const root=resolve(import.meta.dirname,'..');
const publicRoots=['pages','public'];
const protectedExtensions=new Set(['.mp4','.webm','.mov','.m4v','.m3u8','.mpd','.avi','.mkv']);
const found=[];
async function scan(directory){
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const path=resolve(directory,entry.name);
    if(entry.isDirectory())await scan(path);
    else if(entry.isFile()&&protectedExtensions.has(extname(entry.name).toLowerCase()))found.push(relative(root,path));
  }
}
for(const directory of publicRoots)await scan(resolve(root,directory));
if(found.length){
  console.error('Paid video files must never be placed in public Pages/server paths:');
  for(const path of found)console.error(`  ${path}`);
  process.exitCode=1;
}else console.log('Public media guard: no video files in pages/ or public/.');
