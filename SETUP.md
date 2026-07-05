# QCL — Questscaled.life — развёртывание

## Что уже готово в этом архиве
- `content/events/motik-i-shchedrost.md` — первая тестовая запись (кейс с мотиком)
- `content/events/_template.md` — шаблон для новых событий (копируй и заполняй)
- `content/campaigns/` — папка для активных кампаний (та же структура, статус "активно")

## Шаги для запуска у себя (10-15 минут)

### 1. Установи Node.js (если ещё нет)
```bash
node --version   # нужна версия 18+
```
Если нет — скачай с https://nodejs.org

### 2. Склонируй Quartz
```bash
git clone https://github.com/jackyzha0/quartz.git questcalled-life
cd questcalled-life
npm install
```

### 3. Перенеси контент
Скопируй содержимое папки `content/` из этого архива в `questcalled-life/content/`
(замени дефолтный контент Quartz).

### 4. Локальный просмотр
```bash
npx quartz build --serve
```
Открой http://localhost:8080 — увидишь сайт с графом связей.

### 5. Настрой конфиг
В файле `quartz.config.ts` укажи:
```ts
baseUrl: "questcalled.life"
```

### 6. Публикация на GitHub Pages
```bash
git remote add origin <твой-репозиторий-на-GitHub>
git add -A
git commit -m "Первая запись: мотик и щедрость"
git push -u origin v4
npx quartz sync
```

### 7. Привязка домена
В настройках GitHub Pages репозитория указать custom domain `questcalled.life`,
и в DNS-настройках домена (там, где покупал) добавить CNAME-запись на `<твой-username>.github.io`.

## Дальше
Пиши новые события, копируя `_template.md`. Когда наберётся 5-10 записей —
структура полей проверится на практике, и тогда есть смысл писать формальное ТЗ
для интеграции с QLM (RAG будет читать эти же markdown-файлы напрямую).
