/* Симуляция: список "Все проекты" + карточка проекта — ТЗ 18.09.2026, раздел 2. */

const PROJECTS = DATA.projects;
const DEFAULT_PROJECT_URL = "2607-Polis-Apartment"; // прежние ссылки #/<таб> открывают эту карточку
const LIST_ROUTE = "vse-proekty";

/* ТЗ 2.2 п.3: Этап */
const STAGES = [
  { id: "predproekt", label: "Предпроектные работы" },
  { id: "smr", label: "СМР и отделочные работы" },
  { id: "postproekt", label: "Пост-проектные работы" },
];
const stageLabel = (id) => ((STAGES.find((s) => s.id === id) || {}).label) || "—";

const STATUS_LABEL = { active: "Активный", pending: "Ожидание", done: "Завершён", paused: "Пауза" };

let filterStage = "all"; // "all" | id этапа

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
const stageChip = (st) => `<span class="chip chip-stage" title="Этап — ТЗ 2.2 п.3">${esc(stageLabel(st))}</span>`;

const noSim = (what) => `title="${esc(what)} — вне рамок симуляции" onclick="return false"`;

/* ---------------- рендереры табов (принимают проект p) ---------------- */

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

function rDocs(p) {
  const files = p.files || [];
  const rows = files.map((f) => `
    <tr>
      <td>${esc(f.original_name)}</td>
      <td class="muted">${esc(f.uploaded_by_name)}</td>
      <td class="muted">${fmtDate(f.created_at)}</td>
      <td class="num muted">${(f.size_bytes / 1048576).toFixed(1)} МБ</td>
    </tr>`).join("");
  return `
    <div class="sect-title">Проектная документация</div>
    ${files.length
      ? `<div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>Файл</th><th>Загрузил</th><th>Дата</th><th style="text-align:right">Размер</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>`
      : `<div class="empty">Файлов нет</div>`}
    <div class="sect-title">Исходящие документы</div>
    <div class="empty">Исходящих документов нет</div>`;
}

function rFinance(p) {
  return `
    <div class="tiles">
      <div class="tile"><div class="t-label">Смета в учёте</div><div class="t-value">${fmtMoney(p.project_estimate_total)}</div></div>
      <div class="tile"><div class="t-label">Поступило</div><div class="t-value pos">${fmtMoney(p.project_income_total)}</div></div>
      <div class="tile"><div class="t-label">Расходы</div><div class="t-value neg">${fmtMoney(p.project_expense_total)}</div></div>
      <div class="tile"><div class="t-label">Баланс</div><div class="t-value">${fmtMoney(p.project_balance)}</div></div>
      <div class="tile"><div class="t-label">К оплате клиенту</div><div class="t-value">${fmtMoney(p.project_client_due)}</div></div>
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
    render: (p) => rPending("2.3.1") + rAvail([
      "Этап: " + stageLabel(p.stage) + " · Статус: " + (STATUS_LABEL[p.status] || p.status),
      "Клиент: " + p.client + (p.foreman_name ? " · Ответственный прораб: " + p.foreman_name : ""),
      "Даты: " + fmtDate(p.start_date) + " — " + fmtDate(p.end_date),
      "Telegram-топик: " + p.telegram_topic_name,
      "Итоги: смета " + fmtMoney(p.project_estimate_total) + ", поступило " + fmtMoney(p.project_income_total),
    ]) },
  { id: "dokumenty", label: "Документы", tz: "2.3.2", render: rDocs },
  { id: "grafik", label: "График", tz: "2.3.3", render: () => rPending("2.3.3") },
  { id: "finansy", label: "Финансы", tz: "2.3.4", render: rFinance },
  { id: "tender", label: "Тендер", tz: "2.3.5", render: rTender },
  { id: "foto-video", label: "Фото и видео", tz: "2.3.6", render: rMedia },
  { id: "zadachi", label: "Задачи", tz: "2.3.7", render: rTasks },
  { id: "kabinet-klienta", label: "Кабинет клиента", tz: "2.3.8", render: rPortal },
];

/* ---------------- шапка карточки ---------------- */

function headCard(p) {
  // ТЗ 2.2: Назад | Редактировать | Название | Этап и статус рядом с названием | Telegram | Клиент | Прораб
  return `
    <div class="pg-head">
      <div class="pg-head-top">
        <a class="btn-ghost" href="#/${LIST_ROUTE}" title="Возврат к списку проектов">← Назад</a>
        <div class="pg-title">${esc(p.name)}
          ${stageChip(p.stage)}
          ${statusChip(p.status)}
          <span class="chip chip-undef" title="Форма статуса: .. / .. — ждёт решения по ТЗ">.. / ..</span>
        </div>
        <button class="btn-pale head-edit" ${noSim("Поля объекта")}>Редактировать</button>
      </div>
      <div class="pg-meta">
        <a class="meta-pill" href="#" onclick="return false" title="Ссылка на топик проекта — демо">✈️ Открыть Telegram</a>
        <span class="meta-pill"><span class="lbl">Клиент:</span> ${esc(p.client)}</span>
        ${p.foreman_name ? `<span class="meta-pill"><span class="lbl">👷 Ответственный прораб:</span> ${esc(p.foreman_name)}</span>` : ""}
      </div>
    </div>`;
}

/* ---------------- страница "Все проекты" ---------------- */

function projCard(p) {
  return `
    <a class="proj-card" href="#/${p.url}/${DEFAULT_TAB}">
      <div class="pc-title">${esc(p.name)}</div>
      <div class="pc-chips">${stageChip(p.stage)}${statusChip(p.status)}</div>
      <div class="pc-meta">
        <span><span class="lbl">Клиент:</span> ${esc(p.client)}</span>
        ${p.foreman_name ? `<span><span class="lbl">Прораб:</span> ${esc(p.foreman_name)}</span>` : ""}
        <span><span class="lbl">Даты:</span> ${fmtDate(p.start_date)} — ${fmtDate(p.end_date)}</span>
      </div>
    </a>`;
}

function listPage() {
  const items = PROJECTS.filter((p) => filterStage === "all" || p.stage === filterStage);
  return `
    <div class="card">
      <div class="pg-head">
        <div class="pg-title">Все проекты</div>
        <div class="filter-bar" id="filter-bar">
          <button class="fchip${filterStage === "all" ? " active" : ""}" data-stage="all" type="button">Все</button>
          ${STAGES.map((s) => `<button class="fchip${filterStage === s.id ? " active" : ""}" data-stage="${s.id}" type="button">${esc(s.label)}</button>`).join("")}
        </div>
      </div>
      ${items.length
        ? `<div class="proj-grid">${items.map(projCard).join("")}</div>`
        : `<div class="tab-body"><div class="empty">Проектов на этом этапе нет</div></div>`}
      <div class="list-foot">Этап — по ТЗ 2.2 п.3. Демо-данные: три вымышленных проекта.</div>
    </div>`;
}

/* ---------------- левая панель на карточках ---------------- */

function sideRail() {
  return `<div class="side-inner"><a class="btn-all" href="#/${LIST_ROUTE}">Все проекты</a></div>`;
}

/* ---------------- каркас и маршрутизация ---------------- */

const DEFAULT_TAB = "osnovnoe"; // ТЗ 2.1: по умолчанию открыт таб "Основное"

function parseHash() {
  const m = location.hash.match(/^#\/([A-Za-z0-9-]+)(?:\/([a-z-]+))?/);
  if (!m) return { page: "list" };
  if (m[1].toLowerCase() === LIST_ROUTE) return { page: "list" };
  const proj = PROJECTS.find((p) => p.url.toLowerCase() === m[1].toLowerCase());
  if (proj) {
    const tab = (m[2] && TABS.some((t) => t.id === m[2])) ? m[2] : DEFAULT_TAB;
    return { page: "card", project: proj, tab };
  }
  // прежний формат #/<таб> — карточка проекта по умолчанию
  if (TABS.some((t) => t.id === m[1])) {
    return { page: "card", project: PROJECTS.find((p) => p.url === DEFAULT_PROJECT_URL), tab: m[1] };
  }
  return { page: "list" };
}

function render() {
  const r = parseHash();
  const side = document.getElementById("side");
  const wrap = document.getElementById("wrap");

  if (r.page === "card" && r.project) {
    const p = r.project;
    document.body.classList.add("on-card");
    side.innerHTML = sideRail();
    wrap.innerHTML = `
      <div class="card">
        ${headCard(p)}
        <nav class="tabs">
          ${TABS.map((t) => `<button class="tab${t.id === r.tab ? " active" : ""}" data-tab="${t.id}" type="button">${t.label}</button>`).join("")}
        </nav>
        <div class="tab-body">${TABS.find((t) => t.id === r.tab).render(p)}</div>
      </div>`;

    document.getElementById("crumb").innerHTML = `Проекты / <b>${esc(p.name)}</b>`;
    document.title = p.url + " — Карточка проекта";

    wrap.querySelectorAll(".tab").forEach((b) =>
      b.addEventListener("click", () => { location.hash = `#/${p.url}/${b.dataset.tab}`; }));
  } else {
    document.body.classList.remove("on-card");
    side.innerHTML = "";
    wrap.innerHTML = listPage();

    document.getElementById("crumb").textContent = "Проекты";
    document.title = "Все проекты — Meleshin OS";

    wrap.querySelectorAll(".fchip").forEach((b) =>
      b.addEventListener("click", () => { filterStage = b.dataset.stage; render(); }));
  }
}

window.addEventListener("hashchange", render);
render();
