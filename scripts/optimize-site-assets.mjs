// Rebuild the public derivatives from the approved artwork, without changing layout.
// Requires sharp (SHARP_MODULE can point to an installed runtime copy).
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const {default:sharp}=await import(process.env.SHARP_MODULE?pathToFileURL(process.env.SHARP_MODULE).href:'sharp');
const course=resolve(import.meta.dirname,'../public/course');
const out=resolve(course,'optimized');
await mkdir(out,{recursive:true});
async function save(pipeline,name,options={quality:88,effort:6}){
  const info=await pipeline.webp(options).toFile(resolve(out,name));
  console.log(`${name}: ${info.width}x${info.height}, ${info.size} bytes`);
}
for(const [source,name,ratio] of [
  ['lessons-mobile-responsive.webp','course-header-mobile.webp',.155],
  ['lessons-tablet-figma.webp','course-header-tablet.webp',.101],
  ['lessons-laptop-figma.webp','course-header-laptop.webp',.101],
  ['lessons-desktop-figma.webp','course-header-desktop.webp',.101],
]){
  const input=sharp(resolve(course,source));
  const {width}=await input.metadata();
  // Lossless keeps the original header lettering and border pixel-identical.
  await save(input.extract({left:0,top:0,width,height:Math.ceil(width*ratio)}),name,{lossless:true,effort:6});
}
for(const width of [640,1280,1920])await save(sharp(resolve(course,'lesson-poster.jpg')).resize({width}),`lesson-poster-${width}.webp`,{quality:82,effort:6});
for(const name of ['plan-standard','plan-vip','plan-vip-plus','plan-desktop-figma','plan-modal-mobile-figma']){
  await save(sharp(resolve(course,`${name}.png`)),`${name}.webp`,{quality:90,effort:6});
}
// The glow has no fine detail. Render once at its native width instead of
// making mobile browsers repaint eleven large SVG Gaussian blur filters.
await save(sharp(resolve(course,'lessons-background-mobile.svg')),'course-glow-mobile.webp',{quality:90,effort:6});
