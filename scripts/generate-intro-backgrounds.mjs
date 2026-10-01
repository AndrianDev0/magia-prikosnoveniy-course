import { readFileSync, writeFileSync } from "node:fs";

// Reuse the Figma background vectors without the outlined text or photos.
for (const [name, width, top, height] of [["desktop", 1920, 1700, 850], ["mobile", 380, 400, 255]]) {
  const source = readFileSync(`public/course/home-${name}.svg`, "utf8");
  const start = source.indexOf("<rect");
  const background = source.slice(start, source.indexOf("<path"));
  const defs = source.match(/<defs>([\s\S]*?)<\/defs>/)[1];
  const paints = [...defs.matchAll(/<(filter|radialGradient|linearGradient)\b[\s\S]*?<\/\1>/g)].map(match => match[0]).join("\n");
  writeFileSync(`public/course/intro-background-${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${top} ${width} ${height}" fill="none">${background}<defs>${paints}</defs></svg>`);
}
