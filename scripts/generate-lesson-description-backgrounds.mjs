import { readFileSync, writeFileSync } from "node:fs";

for (const [name, width, top, height] of [["desktop", 1920, 1840, 250], ["mobile", 380, 425, 75]]) {
  const source = readFileSync(`public/course/lessons-${name}.svg`, "utf8");
  const background = source.slice(source.indexOf("<rect"), source.indexOf("<path"));
  const defs = source.match(/<defs>([\s\S]*?)<\/defs>/)[1];
  const paints = [...defs.matchAll(/<(filter|radialGradient|linearGradient)\b[\s\S]*?<\/\1>/g)].map((match) => match[0]).join("\n");
  writeFileSync(`public/course/lesson-description-background-${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${top} ${width} ${height}" fill="none">${background}<defs>${paints}</defs></svg>`);
}

for (const [name, width, top, height] of [["desktop", 1920, 3250, 250], ["mobile", 380, 750, 75]]) {
  const source = readFileSync(`public/course/lessons-${name}.svg`, "utf8");
  const background = source.slice(source.indexOf("<rect"), source.indexOf("<path"));
  const defs = source.match(/<defs>([\s\S]*?)<\/defs>/)[1];
  const paints = [...defs.matchAll(/<(filter|radialGradient|linearGradient)\b[\s\S]*?<\/\1>/g)].map((match) => match[0]).join("\n");
  writeFileSync(`public/course/lesson-2-description-background-${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${top} ${width} ${height}" fill="none">${background}<defs>${paints}</defs></svg>`);
}

for (const [name, width, top, height] of [["desktop", 1920, 6070, 250], ["mobile", 380, 1390, 90]]) {
  const source = readFileSync(`public/course/lessons-${name}.svg`, "utf8");
  const background = source.slice(source.indexOf("<rect"), source.indexOf("<path"));
  const defs = source.match(/<defs>([\s\S]*?)<\/defs>/)[1];
  const paints = [...defs.matchAll(/<(filter|radialGradient|linearGradient)\b[\s\S]*?<\/\1>/g)].map((match) => match[0]).join("\n");
  writeFileSync(`public/course/lesson-4-description-background-${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${top} ${width} ${height}" fill="none">${background}<defs>${paints}</defs></svg>`);
}

for (const [kind, name, width, top, height] of [
  ["title", "desktop", 1920, 6390, 240], ["title", "mobile", 380, 1470, 120],
  ["description", "desktop", 1920, 7480, 250], ["description", "mobile", 380, 1730, 100],
]) {
  const source = readFileSync(`public/course/lessons-${name}.svg`, "utf8");
  const background = source.slice(source.indexOf("<rect"), source.indexOf("<path"));
  const defs = source.match(/<defs>([\s\S]*?)<\/defs>/)[1];
  const paints = [...defs.matchAll(/<(filter|radialGradient|linearGradient)\b[\s\S]*?<\/\1>/g)].map((match) => match[0]).join("\n");
  writeFileSync(`public/course/lesson-5-${kind}-background-${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${top} ${width} ${height}" fill="none">${background}<defs>${paints}</defs></svg>`);
}

for (const [kind, name, width, top, height] of [
  ["title", "desktop", 1920, 7800, 240], ["title", "mobile", 380, 1810, 120],
  ["description", "desktop", 1920, 8890, 250], ["description", "mobile", 380, 2045, 100],
]) {
  const source = readFileSync(`public/course/lessons-${name}.svg`, "utf8");
  const background = source.slice(source.indexOf("<rect"), source.indexOf("<path"));
  const defs = source.match(/<defs>([\s\S]*?)<\/defs>/)[1];
  const paints = [...defs.matchAll(/<(filter|radialGradient|linearGradient)\b[\s\S]*?<\/\1>/g)].map((match) => match[0]).join("\n");
  writeFileSync(`public/course/lesson-6-${kind}-background-${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${top} ${width} ${height}" fill="none">${background}<defs>${paints}</defs></svg>`);
}

for (const [kind, name, width, top, height] of [
  ["title", "desktop", 1920, 9110, 240], ["title", "mobile", 380, 2130, 120],
  ["description", "desktop", 1920, 10210, 250], ["description", "mobile", 380, 2330, 100],
]) {
  const source = readFileSync(`public/course/lessons-${name}.svg`, "utf8");
  const background = source.slice(source.indexOf("<rect"), source.indexOf("<path"));
  const defs = source.match(/<defs>([\s\S]*?)<\/defs>/)[1];
  const paints = [...defs.matchAll(/<(filter|radialGradient|linearGradient)\b[\s\S]*?<\/\1>/g)].map((match) => match[0]).join("\n");
  writeFileSync(`public/course/lesson-7-${kind}-background-${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${top} ${width} ${height}" fill="none">${background}<defs>${paints}</defs></svg>`);
}

for (const [kind, name, width, top, height] of [
  ["title", "desktop", 1920, 10540, 240], ["title", "mobile", 380, 2390, 100],
  ["description", "desktop", 1920, 11590, 300], ["description", "mobile", 380, 2630, 125],
]) {
  const source = readFileSync(`public/course/lessons-${name}.svg`, "utf8");
  const background = source.slice(source.indexOf("<rect"), source.indexOf("<path"));
  const defs = source.match(/<defs>([\s\S]*?)<\/defs>/)[1];
  const paints = [...defs.matchAll(/<(filter|radialGradient|linearGradient)\b[\s\S]*?<\/\1>/g)].map((match) => match[0]).join("\n");
  writeFileSync(`public/course/bonus-${kind}-background-${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${top} ${width} ${height}" fill="none">${background}<defs>${paints}</defs></svg>`);
}
