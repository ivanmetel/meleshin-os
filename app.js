/* Симуляция: список "Все проекты" + карточка проекта — ТЗ от 18.09.2026 (правки 22.09). */

const PROJECTS = DATA.projects;
const DEFAULT_PROJECT_URL = "2607-Polis-Apartment"; // прежние ссылки #/<таб> открывают эту карточку
const LIST_ROUTE = "vse-proekty";

/* ТЗ 2.1 п.3: Этап */
const STAGES = [
  { id: "predproekt", label: "Предпроектные работы" },
  { id: "smr", label: "СМР и отделочные работы" },
  { id: "postproekt", label: "Пост-проектные работы" },
];
const stageLabel = (id) => ((STAGES.find((s) => s.id === id) || {}).label) || "—";

/* ТЗ 2.1 п.4: Состояние */
const STATES = [
  { id: "initiated", label: "Инициированы" },
  { id: "started", label: "Начаты" },
  { id: "controlled", label: "На контроле" },
  { id: "concluded", label: "Завершены" },
  { id: "closed", label: "Закрыты" },
];
const stateLabel = (id) => ((STATES.find((s) => s.id === id) || {}).label) || "—";

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

/* ТЗ 2.1 п.5-8: участник — «Имя Фамилия | Телефон | Telegram» */
const fmtPerson = (pp) => (!pp ? null : [pp.name, pp.phone, pp.tg].filter(Boolean).map(esc).join(" | "));

const stageChip = (st) => `<span class="chip chip-stage" title="Этап — ТЗ 2.1 п.3">${esc(stageLabel(st))}</span>`;
const stateChip = (st) => `<span class="chip chip-${esc(st)}" title="Состояние — ТЗ 2.1 п.4">${esc(stateLabel(st))}</span>`;

/* ---------------- панель кнопок таба ---------------- */

/* ТЗ 2.2: «Редактировать» в каждом табе; ТЗ 2.2.1 п.1-2: Редактировать, История */
let historyOpen = false;

function tabTools(tabId) {
  return `<div class="tab-tools">
      ${tabId === "osnovnoe" ? `<button class="btn-ghost" id="btn-history" type="button">${historyOpen ? "Скрыть историю" : "История"}</button>` : ""}
      <button class="btn-pale btn-edit" type="button">Редактировать</button>
    </div>`;
}

/* ---------------- История (ТЗ 2.2.1 п.2: открывает/скрывает логи по проекту) ---------------- */

const logStamp = () => {
  const d = new Date();
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })
    + " " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
};

function logChange(p, change) {
  if (!p.history) p.history = [];
  p.history.unshift({ date: logStamp(), tab: "Основное", change, author: "Демо-пользователь" });
}

function historyBlock(p) {
  if (!historyOpen) return "";
  const rows = (p.history || []).map((h, i) => `
    <tr><td>${i + 1}</td><td>${esc(h.date)}</td><td>${esc(h.tab)}</td><td>${esc(h.change)}</td><td>${esc(h.author)}</td></tr>`).join("");
  return `
    <div class="sect-title">История</div>
    ${rows
      ? `<div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>#</th><th>Дата</th><th>Таб</th><th>Изменение</th><th>Автор</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>`
      : `<div class="empty">Записей нет</div>`}`;
}

/* ---------------- модалки ---------------- */

const ROLE_FIELDS = [
  { key: "client", label: "Клиент" },
  { key: "pm", label: "Руководитель проекта" },
  { key: "foreman", label: "Прораб" },
  { key: "client_rep", label: "Представитель клиента" },
];
const roleLabel = (k) => ((ROLE_FIELDS.find((r) => r.key === k) || {}).label) || k;

const isoDay = (iso) => (iso ? iso.slice(0, 10) : "");
const dayToIso = (d) => (d ? new Date(d + "T00:00:00.000Z").toISOString() : null);

let escHandler = null;
function closeAnyModal() {
  const m = document.querySelector(".modal-overlay");
  if (m) m.remove();
  if (escHandler) { document.removeEventListener("keydown", escHandler); escHandler = null; }
}
function mountModal(inner) {
  closeAnyModal();
  document.body.insertAdjacentHTML("beforeend", `<div class="modal-overlay">${inner}</div>`);
  document.querySelector(".modal-overlay").addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) closeAnyModal();
  });
  escHandler = (e) => { if (e.key === "Escape") closeAnyModal(); };
  document.addEventListener("keydown", escHandler);
}

function personBlockHtml(key, v) {
  return `
    <div class="person-blk" data-role="${key}">
      <div class="pb-title">${esc(roleLabel(key))}</div>
      <label>Имя Фамилия</label>
      <input class="pb-name" type="text" autocomplete="off" value="${esc(v.name || "")}">
      <label>Телефон</label>
      <input class="pb-phone" type="text" autocomplete="off" value="${esc(v.phone || "")}">
      <label>Telegram</label>
      <input class="pb-tg" type="text" autocomplete="off" value="${esc(v.tg || "")}">
    </div>`;
}

/* ТЗ 2.2.1.1: «Редактировать» — всплывающее окно; участники не отображаются, пока не добавлены */
function openEdit(p) {
  const persons = {};
  ROLE_FIELDS.forEach((r) => { if (p[r.key]) persons[r.key] = { ...p[r.key] }; });

  const renderPersons = () => {
    document.getElementById("ed-persons").innerHTML =
      ROLE_FIELDS.filter((r) => persons[r.key]).map((r) => personBlockHtml(r.key, persons[r.key])).join("");
    document.querySelectorAll("#ed-add-role option").forEach((o) => { o.disabled = !!persons[o.value]; });
  };

  mountModal(`
    <div class="modal">
      <div class="modal-title">Редактировать</div>
      <div class="form-skel">
        <label>Этап</label>
        <select id="ed-stage">${STAGES.map((s) => `<option value="${s.id}"${p.stage === s.id ? " selected" : ""}>${esc(s.label)}</option>`).join("")}</select>
        <label>Состояние</label>
        <select id="ed-state">${STATES.map((s) => `<option value="${s.id}"${p.state === s.id ? " selected" : ""}>${esc(s.label)}</option>`).join("")}</select>
        <div id="ed-persons"></div>
        <div class="ed-add-row">
          <select id="ed-add-role">${ROLE_FIELDS.map((r) => `<option value="${r.key}">${esc(r.label)}</option>`).join("")}</select>
          <button class="btn-ghost" id="ed-add-btn" type="button">Добавить участника</button>
        </div>
        <label>Telegram-канал команды</label>
        <input id="ed-tg-team" type="text" autocomplete="off" value="${esc(p.tg_team || "")}">
        <label>Telegram-канал клиента</label>
        <input id="ed-tg-client" type="text" autocomplete="off" value="${esc(p.tg_client || "")}">
        <label>Дата начала</label>
        <input id="ed-start" type="date" value="${isoDay(p.start_date)}">
        <label>Дата окончания</label>
        <input id="ed-end" type="date" value="${isoDay(p.end_date)}">
        <label>Вид работ</label>
        <input id="ed-vid" type="text" autocomplete="off" value="${esc(p.vid_rabot || "")}">
        <label>Заметки</label>
        <textarea id="ed-zam" rows="3">${esc(p.zametki || "")}</textarea>
      </div>
      <div class="modal-actions">
        <button class="btn-ghost" id="ed-cancel" type="button">Отмена</button>
        <button class="btn-primary" id="ed-save" type="button">Сохранить</button>
      </div>
    </div>`);

  renderPersons();
  document.getElementById("ed-add-btn").addEventListener("click", () => {
    const k = document.getElementById("ed-add-role").value;
    persons[k] = { name: "", phone: "", tg: "" };
    renderPersons();
    const blk = document.querySelector(`.person-blk[data-role="${k}"] .pb-name`);
    if (blk) blk.focus();
  });
  document.getElementById("ed-cancel").addEventListener("click", closeAnyModal);

  document.getElementById("ed-save").addEventListener("click", () => {
    const rd = (id) => document.getElementById(id).value.trim();
    const changes = [];
    const diff = (label, was, now, fmt) => {
      if ((was || "") !== (now || "")) {
        const f = (v) => (v ? (fmt ? fmt(v) : v) : "—");
        changes.push(label + ": " + f(was) + " → " + f(now));
      }
    };

    const newStage = rd("ed-stage");
    if (newStage !== p.stage) changes.push("Этап: " + stageLabel(p.stage) + " → " + stageLabel(newStage));
    const newState = rd("ed-state");
    if (newState !== p.state) changes.push("Состояние: " + stateLabel(p.state) + " → " + stateLabel(newState));

    ROLE_FIELDS.forEach((r) => {
      const was = p[r.key];
      const blk = document.querySelector(`.person-blk[data-role="${r.key}"]`);
      if (!blk) return;
      const now = {
        name: blk.querySelector(".pb-name").value.trim(),
        phone: blk.querySelector(".pb-phone").value.trim(),
        tg: blk.querySelector(".pb-tg").value.trim(),
      };
      if (!was) changes.push(("Добавлен участник: " + r.label + " " + now.name).trim());
      else if (["name", "phone", "tg"].some((f) => (was[f] || "") !== now[f])) changes.push(r.label + ": изменён");
      p[r.key] = now.name ? now : null;
    });

    diff("Telegram-канал команды", p.tg_team, rd("ed-tg-team"));
    diff("Telegram-канал клиента", p.tg_client, rd("ed-tg-client"));
    diff("Дата начала", isoDay(p.start_date), rd("ed-start"), fmtDate);
    diff("Дата окончания", isoDay(p.end_date), rd("ed-end"), fmtDate);
    diff("Вид работ", p.vid_rabot, rd("ed-vid"));
    diff("Заметки", p.zametki, rd("ed-zam"));

    p.stage = newStage;
    p.state = newState;
    p.tg_team = rd("ed-tg-team") || null;
    p.tg_client = rd("ed-tg-client") || null;
    p.start_date = dayToIso(rd("ed-start"));
    p.end_date = dayToIso(rd("ed-end"));
    p.vid_rabot = rd("ed-vid");
    p.zametki = rd("ed-zam");

    if (changes.length) logChange(p, changes.join("; "));
    closeAnyModal();
    render();
  });
}

/* ---------------- «Добавить проект» (ТЗ 1: кнопка на вкладке «Проекты») ---------------- */

const TR = { "а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"e","ж":"zh","з":"z","и":"i","й":"y","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"h","ц":"c","ч":"ch","ш":"sh","щ":"sch","ъ":"","ы":"y","ь":"","э":"e","ю":"yu","я":"ya" };
const slugify = (s) => s.toLowerCase().split("").map((ch) => (TR[ch] != null ? TR[ch] : ch)).join("")
  .replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

function openAddProject() {
  mountModal(`
    <div class="modal">
      <div class="modal-title">Добавить проект</div>
      <div class="form-skel">
        <label>Название</label>
        <input id="np-name" type="text" placeholder="YYNN. Place Property_type" autocomplete="off">
        <label>Этап</label>
        <select id="np-stage">${STAGES.map((s) => `<option value="${s.id}">${esc(s.label)}</option>`).join("")}</select>
        <label>Состояние</label>
        <select id="np-state">${STATES.map((s) => `<option value="${s.id}"${s.id === "initiated" ? " selected" : ""}>${esc(s.label)}</option>`).join("")}</select>
        <label>Дата начала</label>
        <input id="np-start" type="date">
        <label>Дата окончания</label>
        <input id="np-end" type="date">
      </div>
      <div class="modal-actions">
        <button class="btn-ghost" id="np-cancel" type="button">Отмена</button>
        <button class="btn-primary" id="np-save" type="button">Добавить</button>
      </div>
      <div class="note">Демо: проект добавляется в данные страницы, до перезагрузки. Участники и поля карточки — через «Редактировать».</div>
    </div>`);

  document.getElementById("np-cancel").addEventListener("click", closeAnyModal);
  document.getElementById("np-save").addEventListener("click", () => {
    const nameEl = document.getElementById("np-name");
    const name = nameEl.value.trim();
    if (!name) { nameEl.classList.add("input-err"); nameEl.focus(); return; }
    const rd = (id) => document.getElementById(id).value.trim();
    let url = slugify(name) || "project";
    if (PROJECTS.some((x) => x.url === url)) url += "-" + (PROJECTS.length + 1);
    PROJECTS.push({
      id: Date.now(),
      name,
      url,
      stage: rd("np-stage"),
      state: rd("np-state"),
      start_date: dayToIso(rd("np-start")),
      end_date: dayToIso(rd("np-end")),
      telegram_topic_name: null,
      client: null, pm: null, foreman: null, client_rep: null,
      tg_team: null, tg_client: null,
      vid_rabot: "", zametki: "",
      project_estimate_total: "0", project_income_total: "0", project_expense_total: "0",
      project_balance: "0", project_client_due: "0",
      files: [], tasks: [], history: [],
    });
    closeAnyModal();
    location.hash = `#/${url}/${DEFAULT_TAB}`;
    if (parseHash().page !== "card") render();
  });
  document.getElementById("np-name").focus();
}

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

/* ТЗ 2.2.1: информация шапки в табе не дублируется — видны «Вид работ» (п.13) и «Заметки» (п.14), редактирование — по кнопке */
function rMain(p) {
  const frow = (label, valueHtml) => `<tr><td class="fld">${label}</td><td>${valueHtml}</td></tr>`;
  const plainCell = (v) => (v ? esc(v) : `<span class="muted">—</span>`);
  return `
    <div class="tbl-wrap"><table class="tbl tbl-fields">
      <tbody>
        ${frow("Вид работ", plainCell(p.vid_rabot))}
        ${frow("Заметки", plainCell(p.zametki))}
      </tbody>
    </table></div>
    ${historyBlock(p)}`;
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

/* порядок табов — ТЗ 2.2 (Задачи — второй) */
const TABS = [
  { id: "osnovnoe", label: "Основное", tz: "2.2.1", render: rMain },
  { id: "zadachi", label: "Задачи", tz: "2.3.7", render: rTasks },
  { id: "dokumenty", label: "Документы", tz: "2.3.2", render: rDocs },
  { id: "grafik", label: "График", tz: "2.3.3", render: () => rPending("2.3.3") },
  { id: "finansy", label: "Финансы", tz: "2.3.4", render: rFinance },
  { id: "tender", label: "Тендер", tz: "2.3.5", render: rTender },
  { id: "foto-video", label: "Фото и видео", tz: "2.3.6", render: rMedia },
  { id: "kabinet-klienta", label: "Кабинет клиента", tz: "2.3.8", render: rPortal },
];

/* ---------------- шапка карточки (ТЗ 2.1) ---------------- */

function headCard(p) {
  // ТЗ 2.1 (п.1 пуст — без кнопки «Назад»): Название (п.2) | Этап (п.3) + Состояние (п.4) + Даты работ (п.11-12) | участники (п.5-8) и каналы (п.9-10)
  const personRow = (label, pp) => (pp ? `<tr><td class="lbl">${label}:</td><td>${esc(pp.name)}</td><td>${esc(pp.phone || "")}</td><td>${esc(pp.tg || "")}</td></tr>` : "");
  const channelRow = (label, v) => (v ? `<tr><td class="lbl">${label}:</td><td colspan="3">${esc(v)}</td></tr>` : "");
  const dates = !p.start_date ? "" : (p.end_date ? `${fmtDate(p.start_date)} — ${fmtDate(p.end_date)}` : fmtDate(p.start_date));
  return `
    <div class="pg-head">
      <div class="pg-head-top">
        <div class="pg-title">${esc(p.name)}
          ${stageChip(p.stage)}
          ${stateChip(p.state)}
          ${dates ? `<span class="pg-dates">Даты работ: ${dates}</span>` : ""}
        </div>
      </div>
      <table class="head-tbl">
        ${personRow("Клиент", p.client)}
        ${personRow("Руководитель проекта", p.pm)}
        ${personRow("Прораб", p.foreman)}
        ${personRow("Представитель клиента", p.client_rep)}
        ${channelRow("Telegram-канал команды", p.tg_team)}
        ${channelRow("Telegram-канал клиента", p.tg_client)}
      </table>
    </div>`;
}

/* ---------------- страница "Все проекты" ---------------- */

function projCard(p) {
  return `
    <a class="proj-card" href="#/${p.url}/${DEFAULT_TAB}">
      <div class="pc-title">${esc(p.name)}</div>
      <div class="pc-chips">${stageChip(p.stage)}${stateChip(p.state)}</div>
      <div class="pc-meta">
        <span><span class="lbl">Клиент:</span> ${esc(p.client ? p.client.name : "—")}</span>
        ${p.foreman ? `<span><span class="lbl">Прораб:</span> ${esc(p.foreman.name)}</span>` : ""}
        <span><span class="lbl">Даты:</span> ${fmtDate(p.start_date)} — ${fmtDate(p.end_date)}</span>
      </div>
    </a>`;
}

function listPage() {
  const items = PROJECTS.filter((p) => filterStage === "all" || p.stage === filterStage);
  return `
    <div class="card">
      <div class="pg-head">
        <div class="pg-head-top">
          <div class="pg-title">Все проекты</div>
          <button class="btn-primary head-add" id="btn-add-project" type="button">Добавить проект</button>
        </div>
        <div class="filter-bar" id="filter-bar">
          <button class="fchip${filterStage === "all" ? " active" : ""}" data-stage="all" type="button">Все</button>
          ${STAGES.map((s) => `<button class="fchip${filterStage === s.id ? " active" : ""}" data-stage="${s.id}" type="button">${esc(s.label)}</button>`).join("")}
        </div>
      </div>
      ${items.length
        ? `<div class="proj-grid">${items.map(projCard).join("")}</div>`
        : `<div class="tab-body"><div class="empty">Проектов на этом этапе нет</div></div>`}
      <div class="list-foot">Этап — по ТЗ 2.1 п.3. Демо-данные: три вымышленных проекта.</div>
    </div>`;
}

/* ---------------- левая панель на карточках ---------------- */

function sideRail() {
  return `<div class="side-inner"><a class="btn-all" href="#/${LIST_ROUTE}">Все проекты</a></div>`;
}

/* ---------------- каркас и маршрутизация ---------------- */

const DEFAULT_TAB = "osnovnoe"; // ТЗ 1: по умолчанию открыт таб "Основное"

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
    const active = TABS.find((t) => t.id === r.tab);
    document.body.classList.add("on-card");
    side.innerHTML = sideRail();
    wrap.innerHTML = `
      <div class="card">
        ${headCard(p)}
        <nav class="tabs">
          ${TABS.map((t) => `<button class="tab${t.id === r.tab ? " active" : ""}" data-tab="${t.id}" type="button">${t.label}</button>`).join("")}
        </nav>
        <div class="tab-body">${tabTools(r.tab)}${active.render(p)}</div>
      </div>`;

    document.getElementById("crumb").innerHTML = `Проекты / <b>${esc(p.name)}</b>`;
    document.title = p.url + " — Карточка проекта";

    wrap.querySelectorAll(".tab").forEach((b) =>
      b.addEventListener("click", () => { location.hash = `#/${p.url}/${b.dataset.tab}`; }));

    const editBtn = wrap.querySelector(".btn-edit");
    if (editBtn) editBtn.addEventListener("click", () => openEdit(p));
    const histBtn = wrap.querySelector("#btn-history");
    if (histBtn) histBtn.addEventListener("click", () => { historyOpen = !historyOpen; render(); });
  } else {
    document.body.classList.remove("on-card");
    side.innerHTML = "";
    wrap.innerHTML = listPage();

    document.getElementById("crumb").textContent = "Проекты";
    document.title = "Все проекты — Meleshin OS";

    const addProjBtn = wrap.querySelector("#btn-add-project");
    if (addProjBtn) addProjBtn.addEventListener("click", openAddProject);

    wrap.querySelectorAll(".fchip").forEach((b) =>
      b.addEventListener("click", () => { filterStage = b.dataset.stage; render(); }));
  }
}

window.addEventListener("hashchange", render);
render();
