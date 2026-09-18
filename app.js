/* Симуляция новой карточки проекта — ТЗ 18.09.2026, раздел 2. */

const P = DATA.project;

// ТЗ 2.2 п.3: YYNN. Place Property_type (Postfix); машинная форма YYNN-Place-Property_type-Postfix
const NAME_TZ = "2607. Polis Apartment";
const NAME_URL = "2607-Polis-Apartment";

const STATUS_LABEL = { active: "Активный", pending: "Ожидание", done: "Завершён", paused: "Пауза" };

const fmtMoney = (v) => {
  const n = parseFloat(v || 0);
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(n) + " €";
};
const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
};
const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const statusChip = (s) => `<span class="chip chip-${esc(s)}">${esc(STATUS_LABEL[s] || s)}</span>`;

const noSim = (what) => `title="${esc(what)} — вне рамок симуляции" onclick="return false"`;

/* ---------------- рендереры табов ---------------- */

function rPending(tzRef) {
  return `<div class="pending">
      <div class="mark">[ ]</div>
      <div>Раздел в ТЗ помечен [ ] — наполнение ждёт дополнения ТЗ</div>
      <div class="ref">ТЗ, пункт ${esc(tzRef)}</div>
    </div>`;
}

function rAvail(items) {
  return `<div class="avail"><b>Данные проекта в CRM (доступны для наполнения раздела):</b>
    <ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul></div>`;
}

function rDocs() {
  const rows = DATA.files.map((f) => `
    <tr>
      <td>${esc(f.original_name)}</td>
      <td class="muted">${esc(f.uploaded_by_name)}</td>
      <td class="muted">${fmtDate(f.created_at)}</td>
      <td class="num muted">${(f.size_bytes / 1048576).toFixed(1)} МБ</td>
    </tr>`).join("");
  return `
    <div class="sect-title">Проектная документация</div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Файл</th><th>Загрузил</th><th>Дата</th><th style="text-align:right">Размер</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <div class="sect-title">Исходящие документы</div>
    <div class="empty">Исходящих документов нет</div>`;
}

function rFinance() {
  return `
    <div class="tiles">
      <div class="tile"><div class="t-label">Смета в учёте</div><div class="t-value">${fmtMoney(P.project_estimate_total)}</div></div>
      <div class="tile"><div class="t-label">Поступило</div><div class="t-value pos">${fmtMoney(P.project_income_total)}</div></div>
      <div class="tile"><div class="t-label">Расходы</div><div class="t-value neg">${fmtMoney(P.project_expense_total)}</div></div>
      <div class="tile"><div class="t-label">Баланс</div><div class="t-value">${fmtMoney(P.project_balance)}</div></div>
      <div class="tile"><div class="t-label">К оплате клиенту</div><div class="t-value">${fmtMoney(P.project_client_due)}</div></div>
    </div>
    <div class="note">Демо-данные. Наполнение раздела (операции, отчёты) — ждёт ТЗ 2.3.4.</div>`;
}

function rTender() {
  return rPending("2.3.5") + rAvail([
    "Подрядчики проекта: ElecPro (Электрик) — роль: Электромонтаж",
    "КП подрядчика от 15.09.2026 (демо-данные)",
  ]);
}

function rMedia() {
  return rPending("2.3.6") + rAvail([
    "Фото и видео объекта, группировка по дням",
    "Флаг подбора для маркетинга",
  ]);
}

function rTasks() {
  return `
    <div class="empty">Задач по проекту нет</div>
    <div class="note">Задач по проекту нет. Наполнение раздела — ждёт ТЗ 2.3.7.</div>`;
}

function rPortal() {
  return `
    <div class="form-skel">
      <label>Пароль кабинета</label>
      <input type="password" value="********" disabled>
      <label>Приветственный текст (виден клиенту)</label>
      <textarea rows="3" disabled>— не задан —</textarea>
      <label>Внутренняя заметка (видна команде, не клиенту)</label>
      <textarea rows="2" disabled>— не задана —</textarea>
    </div>
    <div class="note">Схема раздела: пароль, видимость разделов, приветственный текст, внутренняя заметка. Наполнение — ждёт ТЗ 2.3.8.</div>`;
}

/* ---------------- определение табов ---------------- */

const TABS = [
  { id: "osnovnoe", label: "Основное", tz: "2.3.1",
    render: () => rPending("2.3.1") + rAvail([
      "Клиент: " + P.client + " · Ответственный прораб: " + P.foreman_name,
      "Даты: 05.06.2026 — 10.09.2026 · Статус: Активный",
      "Telegram-топик: " + P.telegram_topic_name,
      "Итоги: смета " + fmtMoney(P.project_estimate_total) + ", поступило " + fmtMoney(P.project_income_total),
    ]) },
  { id: "dokumenty", label: "Документы", tz: "2.3.2", render: rDocs },
  { id: "grafik", label: "График", tz: "2.3.3", render: () => rPending("2.3.3") },
  { id: "finansy", label: "Финансы", tz: "2.3.4", render: rFinance },
  { id: "tender", label: "Тендер", tz: "2.3.5", render: rTender },
  { id: "foto-video", label: "Фото и видео", tz: "2.3.6", render: rMedia },
  { id: "zadachi", label: "Задачи", tz: "2.3.7", render: rTasks },
  { id: "kabinet-klienta", label: "Кабинет клиента", tz: "2.3.8", render: rPortal },
];

/* ---------------- шапка ---------------- */

function headCard() {
  // ТЗ 2.2: Назад | Редактировать | Название | Статус рядом с названием | Telegram | Клиент | Прораб
  return `
    <div class="pg-head">
      <div class="pg-head-top">
        <button class="btn-ghost" ${noSim("Возврат к списку проектов")}>← Назад</button>
        <button class="btn-primary" ${noSim("Поля объекта")}>Редактировать</button>
        <div class="pg-title">${esc(NAME_TZ)}
          ${statusChip(P.status)}
          <span class="chip chip-undef" title="Форма статуса: .. / .. — ждёт решения по ТЗ">.. / ..</span>
        </div>
      </div>
      <div class="pg-meta">
        <a class="meta-pill" href="#" onclick="return false" title="Ссылка на топик проекта — демо">✈️ Открыть Telegram</a>
        <span class="meta-pill"><span class="lbl">Клиент:</span> ${esc(P.client)}</span>
        <span class="meta-pill"><span class="lbl">👷 Ответственный прораб:</span> ${esc(P.foreman_name)}</span>
      </div>
    </div>`;
}

/* ---------------- каркас ---------------- */

const DEFAULT_TAB = "osnovnoe"; // ТЗ 2.1: по умолчанию открыт таб "Основное"

function parseHash() {
  const m = location.hash.match(/^#\/([a-z-]+)/);
  if (!m) return DEFAULT_TAB;
  return TABS.some((t) => t.id === m[1]) ? m[1] : DEFAULT_TAB;
}

function render() {
  const tab = parseHash();
  const card = document.getElementById("card");

  card.innerHTML = headCard() + `
    <nav class="tabs">
      ${TABS.map((t) => `<button class="tab${t.id === tab ? " active" : ""}" data-tab="${t.id}" type="button">${t.label}</button>`).join("")}
    </nav>
    <div class="tab-body">${TABS.find((t) => t.id === tab).render()}</div>`;

  document.getElementById("crumb-name").textContent = NAME_TZ;
  document.title = NAME_URL + " — Карточка проекта";

  card.querySelectorAll(".tab").forEach((b) =>
    b.addEventListener("click", () => { location.hash = `#/${b.dataset.tab}`; }));
}

window.addEventListener("hashchange", render);
render();
