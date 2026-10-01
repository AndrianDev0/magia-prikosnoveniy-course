import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, ".tools", "legal-texts");
const target = path.join(root, "public", "course", "legal-documents.json");

const definitions = [
  ["offer", "01_Публичная_оферта_редакция_2.0.txt"],
  ["privacy", "02_Политика_ПД_редакция_2.0.txt"],
  ["consent", "03_Согласие_ПД_редакция_2.0.txt"],
  ["user-agreement", "04_Пользовательское_соглашение_редакция_2.0.txt"],
  ["rules-18", "05_Правила_18_плюс_редакция_2.0.txt"],
  ["refunds", "06_Правила_возврата_редакция_2.0.txt"],
  ["testimonial-consent", "07_Согласие_отзыв_распространение_ПД_редакция_2.0.txt"],
];

const documents = {};
for (const [slug, filename] of definitions) {
  const raw = (await readFile(path.join(source, filename), "utf8")).replace(/\r\n/g, "\n").trim();
  const blocks = raw.split(/\n{2,}/).map((value) => value.trim()).filter(Boolean);
  documents[slug] = { slug, title: blocks[0], blocks: blocks.slice(1) };
}

await writeFile(target, `${JSON.stringify({ version: "2.0", revision: "01 октября 2026 года", documents }, null, 2)}\n`, "utf8");
