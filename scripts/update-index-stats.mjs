// scripts/update-index-stats.mjs
// Пересчитывает количество файлов и дату последнего добавления
// в content/events, content/meta, content/scripts,
// и подставляет их в content/index.md между маркерами
// <!-- SECTION-STATS:START --> ... <!-- SECTION-STATS:END -->
//
// Запуск: node scripts/update-index-stats.mjs
// Ничего не ломает, если маркеров в index.md ещё нет — просто скажет об этом.

import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join } from "path";

const SECTIONS = [
  { key: "events", dir: "content/events", label: "задокументированные события" },
  { key: "meta", dir: "content/meta", label: "методологические заметки" },
  { key: "scripts", dir: "content/scripts", label: "разбор эго-сценариев (джиннские сюжеты)" },
];

const INDEX_PATH = "content/index.md";
const START_MARKER = "<!-- SECTION-STATS:START -->";
const END_MARKER = "<!-- SECTION-STATS:END -->";

function isContentFile(name) {
  if (!name.endsWith(".md")) return false;
  if (name.startsWith("_")) return false; // шаблоны вроде _template.md
  if (name.toLowerCase() === "index.md") return false;
  return true;
}

function extractFrontmatterDate(fullPath) {
  const text = readFileSync(fullPath, "utf-8");
  const fmMatch = text.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) {
    const dateLine = fmMatch[1].match(/^date:\s*["']?([0-9]{4}-[0-9]{2}(-[0-9]{2})?)["']?/m);
    if (dateLine) {
      const raw = dateLine[1].length === 7 ? `${dateLine[1]}-01` : dateLine[1];
      const d = new Date(raw);
      if (!isNaN(d.getTime())) return d;
    }
  }
  // fallback — дата изменения файла на диске
  return statSync(fullPath).mtime;
}

function formatDate(d) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function statsForSection(dir) {
  let files;
  try {
    files = readdirSync(dir).filter(isContentFile);
  } catch {
    return { count: 0, lastDate: null };
  }
  if (files.length === 0) return { count: 0, lastDate: null };

  let lastDate = null;
  for (const f of files) {
    const d = extractFrontmatterDate(join(dir, f));
    if (!lastDate || d > lastDate) lastDate = d;
  }
  return { count: files.length, lastDate };
}

function buildBlock() {
  const lines = [START_MARKER];
  for (const s of SECTIONS) {
    const { count, lastDate } = statsForSection(s.dir);
    const dateStr = lastDate ? formatDate(lastDate) : "—";
    lines.push(`- [[${s.key}]] — ${s.label} · ${count} ${pluralize(count)} · последнее: ${dateStr}`);
  }
  lines.push(END_MARKER);
  return lines.join("\n");
}

function pluralize(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return "записей";
  if (mod10 === 1) return "запись";
  if (mod10 >= 2 && mod10 <= 4) return "записи";
  return "записей";
}

function main() {
  let text;
  try {
    text = readFileSync(INDEX_PATH, "utf-8");
  } catch {
    console.error(`Не найден файл ${INDEX_PATH} — пропускаю.`);
    return;
  }

  const startIdx = text.indexOf(START_MARKER);
  const endIdx = text.indexOf(END_MARKER);

  if (startIdx === -1 || endIdx === -1) {
    console.error(
      `В ${INDEX_PATH} не найдены маркеры ${START_MARKER} / ${END_MARKER}. ` +
      `Добавь их вокруг блока со ссылками на разделы, тогда скрипт сможет обновлять статистику.`
    );
    return;
  }

  const before = text.slice(0, startIdx);
  const after = text.slice(endIdx + END_MARKER.length);
  const newBlock = buildBlock();

  const newText = before + newBlock + after;
  writeFileSync(INDEX_PATH, newText, "utf-8");
  console.log("content/index.md обновлён:");
  console.log(newBlock);
}

main();
