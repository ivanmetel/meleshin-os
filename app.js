/* Симуляция: список "Все проекты" + карточка проекта — ТЗ от 18.09.2026 (правки 22.09) + рекомендации от 23.09.2026. */

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

/* Рекомендации 23.09, раздел 5: словарь статусов задач */
const TASK_STATUSES = [
  { id: "new", label: "Новая" },
  { id: "working", label: "В работе" },
  { id: "review", label: "На проверке" },
  { id: "fix", label: "Требует правки" },
  { id: "done", label: "Выполнена" },
  { id: "canceled", label: "Отменена" },
];
const taskStatusLabel = (id) => ((TASK_STATUSES.find((s) => s.id === id) || {}).label) || id;
const TASK_CLOSED = ["done", "canceled"];
const isOverdue = (t) => {
  if (!t.deadline || TASK_CLOSED.includes(t.status)) return false;
  const d = new Date(t.deadline + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return d < now;
};

/* Рекомендации 23.09, раздел 6: направление документа — отдельный признак */
const DOC_DIRS = [
  { id: "in", label: "Входящие" },
  { id: "out", label: "Исходящие" },
  { id: "int", label: "Внутренние" },
];
const dirNoun = { in: "Входящий", out: "Исходящий", int: "Внутренний" };
const DOC_STATUSES = {
  received: { label: "Получен", cls: "chip-doc-received" },
  processing: { label: "В обработке", cls: "chip-doc-processing" },
  processed: { label: "Обработан", cls: "chip-doc-processed" },
  draft: { label: "Черновик", cls: "chip-doc-draft" },
  ready: { label: "Готов к отправке", cls: "chip-doc-ready" },
  sent: { label: "Отправлен", cls: "chip-doc-sent" },
  approved: { label: "Утверждён", cls: "chip-doc-approved" },
};

/* Рекомендации 23.09, раздел 1: внутри "Финансов" — Сводный → Внутренний бюджет → Бюджет клиента → Фактический труд по табелям → Финансовые операции */
const FIN_VIEWS = [
  { id: "svodny", label: "Сводный" },
  { id: "b-int", label: "Внутренний бюджет" },
  { id: "b-cli", label: "Бюджет клиента" },
  { id: "labor", label: "Фактический труд по табелям" },
  { id: "ops", label: "Финансовые операции" },
];

/* состояние видов и фильтров — в памяти страницы */
let filterStage = "all";
let historyOpen = false;
let docDir = "all";
let taskFilter = { status: "all", assignee: "all", overdue: false };
let finView = "svodny";
let budgetVer = "work";
let compEditing = null; // черновик состава работ: [{id, room, work, unit, qty}]

const fmtM2 = (v) => (v == null ? "—" : new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + " €");
const fmtQty = (v) => (v == null ? "—" : new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(v));
const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
};
const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ТЗ 2.1 п.5-8: участник — "Имя Фамилия | Телефон | Telegram" */
const fmtPerson = (pp) => (!pp ? null : [pp.name, pp.phone, pp.tg].filter(Boolean).map(esc).join(" | "));

const stageChip = (st) => `<span class="chip chip-stage" title="Этап — ТЗ 2.1 п.3">${esc(stageLabel(st))}</span>`;
const stateChip = (st) => `<span class="chip chip-${esc(st)}" title="Состояние — ТЗ 2.1 п.4">${esc(stateLabel(st))}</span>`;
const taskChip = (s) => `<span class="chip chip-t-${esc(s)}">${esc(taskStatusLabel(s))}</span>`;

/* ---------------- панель кнопок таба ---------------- */

/* ТЗ 2.2.1 п.2: История — открывает/скрывает логи; реквизиты шапки — "Редактировать" в шапке (рекомендации 23.09, раздел 10 п.1) */
function tabTools(tabId) {
  if (tabId !== "osnovnoe") return "";
  return `<div class="tab-tools">
      <button class="btn-ghost" id="btn-history" type="button">${historyOpen ? "Скрыть историю" : "История"}</button>
    </div>`;
}

/* ---------------- История (ТЗ 2.2.1 п.2) ---------------- */

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

const isoDay = (iso) => (iso ? String(iso).slice(0, 10) : "");
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

/* ТЗ 2.2.1.1: "Редактировать" — всплывающее окно с реквизитами шапки */
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

/* ---------------- "Добавить проект" (ТЗ 1) ---------------- */

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
      <div class="note">Демо: проект добавляется в данные страницы, до перезагрузки. Участники и поля карточки — через "Редактировать" в шапке.</div>
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
      client: null, pm: null, foreman: null, client_rep: null,
      tg_team: null, tg_client: null,
      vid_rabot: "", zametki: "",
      works: [], budget_fixed: null,
      docs: [], tasks: [], timesheets: [], ops: [],
      history: [],
    });
    closeAnyModal();
    location.hash = `#/${url}/${DEFAULT_TAB}`;
    if (parseHash().page !== "card") render();
  });
  document.getElementById("np-name").focus();
}

/* ---------------- расчёты: единый источник состава (рекомендации 23.09, разделы 2-4, 7) ---------------- */

const workCost = (qty, price) => (qty == null || price == null ? null : Math.round(qty * price * 100) / 100);
const vatOf = (sum) => Math.round(sum * 0.19 * 100) / 100;

function snap(p, kind) {
  const f = p.budget_fixed || {};
  return kind === "int" ? f.internal || null : f.client || null;
}

function sumRows(rows, priceKey) {
  const t = { sum: 0, cnt: 0, unev: 0 };
  rows.forEach((r) => {
    const c = workCost(r.qty, r[priceKey]);
    if (c == null) t.unev += 1;
    else { t.sum = Math.round((t.sum + c) * 100) / 100; t.cnt += 1; }
  });
  return t;
}

/* признак "изменено относительно согласованного" (рекомендации 23.09, раздел 4) */
function clientDelta(p) {
  const s = snap(p, "client");
  if (!s) return null;
  const works = p.works || [];
  const flags = new Map();
  works.forEach((w) => {
    const sr = s.rows.find((r) => r.wid === w.id);
    if (!sr) flags.set(w.id, "added");
    else if (sr.qty !== w.qty || sr.price !== w.price_cli) flags.set(w.id, "changed");
  });
  const excluded = s.rows.filter((sr) => !works.some((w) => w.id === sr.wid));
  const fixedSum = s.rows.reduce((acc, r) => acc + (r.qty * r.price || 0), 0);
  const workSum = works.reduce((acc, w) => acc + (w.qty != null && w.price_cli != null ? w.qty * w.price_cli : 0), 0);
  return { flags, excluded, delta: Math.round((workSum - fixedSum) * 100) / 100 };
}

function finTotals(p) {
  const t = {};
  t.int = sumRows(p.works || [], "price_int");
  t.cli = sumRows(p.works || [], "price_cli");
  t.hoursAppr = 0; t.costAppr = 0; t.hoursUnappr = 0; t.unapprCnt = 0; t.hoursNoRate = 0;
  (p.timesheets || []).forEach((r) => {
    if (r.status === "approved") {
      t.hoursAppr += r.hours;
      if (r.rate == null) t.hoursNoRate += r.hours;
      else t.costAppr = Math.round((t.costAppr + r.hours * r.rate) * 100) / 100;
    } else { t.hoursUnappr += r.hours; t.unapprCnt += 1; }
  });
  t.income = 0; t.expense = 0; t.unconf = 0; t.unconfCnt = 0;
  (p.ops || []).forEach((o) => {
    if (o.status === "confirmed") {
      if (o.dir === "in") t.income += o.amount; else t.expense += o.amount;
    } else { t.unconf += o.amount; t.unconfCnt += 1; }
  });
  t.invoices = (p.docs || []).filter((d) => d.type === "Счёт" && d.status === "sent").reduce((s, d) => s + (d.amount || 0), 0);
  t.toPayNow = Math.max(0, t.invoices - t.income);
  t.unpaidBudget = Math.round((t.cli.sum - t.income) * 100) / 100;
  return t;
}

/* ---------------- Основное: состав работ и конструктор (рекомендации 23.09, раздел 2) ---------------- */

const ROOM_ANY = "Весь объект";

function roomsOf(rows) {
  const set = new Set(rows.map((r) => r.room).filter(Boolean));
  set.add(ROOM_ANY);
  return [...set];
}

function compView(p) {
  const rows = p.works || [];
  const body = rows.map((w, i) => `
    <tr data-srch="${esc(((w.room || "") + " " + (w.work || "")).toLowerCase())}">
      <td>${i + 1}</td><td>${esc(w.room)}</td><td>${esc(w.work)}</td><td>${esc(w.unit)}</td><td class="num">${fmtQty(w.qty)}</td>
    </tr>`).join("");
  return `
    <div class="sect-head">
      <div class="sect-title">Состав работ</div>
      <div class="sect-head-tools">
        <input id="comp-search" class="search-inp" type="text" placeholder="Поиск: помещение или работа">
        <button class="btn-ghost" id="btn-comp-edit" type="button">Редактировать состав</button>
      </div>
    </div>
    ${rows.length
      ? `<div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>#</th><th>Помещение</th><th>Работа</th><th>Ед.</th><th class="num">Кол&#8209;во</th></tr></thead>
          <tbody>${body}</tbody>
        </table></div>`
      : `<div class="empty">Состав работ не задан</div>`}
    <div class="note">После сохранения состав попадает в рабочие редакции обоих бюджетов ("Финансы"); несохранённые изменения в бюджеты не попадают. "${ROOM_ANY}" — значение для общих работ. У позиции есть постоянный внутренний идентификатор: видимый "#" — только порядок строк.</div>`;
}

function compEdit() {
  const draft = compEditing;
  const rows = draft.map((w, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><input data-i="${i}" data-f="room" type="text" list="rooms-dl" value="${esc(w.room)}"></td>
      <td><input data-i="${i}" data-f="work" type="text" value="${esc(w.work)}"></td>
      <td><input data-i="${i}" data-f="unit" type="text" class="inp-unit" value="${esc(w.unit)}"></td>
      <td><input data-i="${i}" data-f="qty" type="number" min="0" step="any" class="inp-num" value="${w.qty == null ? "" : w.qty}"></td>
      <td class="row-acts">
        <button class="row-btn" data-act="up" data-i="${i}" type="button" title="Переместить выше">↑</button>
        <button class="row-btn" data-act="down" data-i="${i}" type="button" title="Переместить ниже">↓</button>
        <button class="row-btn" data-act="del" data-i="${i}" type="button" title="Исключить строку">✕</button>
      </td>
    </tr>`).join("");
  return `
    <datalist id="rooms-dl">${roomsOf(draft).map((r) => `<option value="${esc(r)}">`).join("")}</datalist>
    <div class="sect-head">
      <div class="sect-title">Состав работ — редактирование</div>
      <div class="svod-src">черновик; в бюджеты не попадает до сохранения</div>
    </div>
    <div class="tbl-wrap"><table class="tbl comp-edit">
      <thead><tr><th>#</th><th>Помещение</th><th>Работа</th><th>Ед.</th><th class="num">Кол&#8209;во</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <div class="comp-foot">
      <button class="btn-ghost" id="comp-add" type="button">Добавить строку</button>
      <span class="spacer"></span>
      <button class="btn-ghost" id="comp-cancel" type="button">Отменить</button>
      <button class="btn-primary" id="comp-save" type="button">Сохранить</button>
    </div>`;
}

function compSave(p) {
  const old = p.works || [];
  const kept = compEditing.filter((r) => (r.work || "").trim() || (r.room || "").trim());
  let maxId = old.reduce((m, w) => Math.max(m, w.id || 0), 0);
  const next = kept.map((r) => {
    if (!r.id) {
      maxId += 1;
      return { id: maxId, room: r.room, work: r.work, unit: r.unit, qty: r.qty, price_int: null, price_cli: null };
    }
    const prev = old.find((w) => w.id === r.id) || {};
    return { ...prev, room: r.room, work: r.work, unit: r.unit, qty: r.qty };
  });

  const nm = (r) => `${r.room || "—"} / ${r.work || "—"}`;
  const ch = [];
  next.forEach((r) => {
    if (!old.some((w) => w.id === r.id)) ch.push(`добавлена позиция "${nm(r)}"`);
  });
  old.forEach((w) => {
    if (!next.some((r) => r.id === w.id)) ch.push(`исключена позиция "${nm(w)}"`);
  });
  next.forEach((r) => {
    const w = old.find((x) => x.id === r.id);
    if (!w) return;
    const fl = (label, a, b) => {
      if ((a == null ? "" : String(a)) !== (b == null ? "" : String(b))) ch.push(`"${nm(r)}": ${label} ${a ?? "—"} → ${b ?? "—"}`);
    };
    fl("помещение", w.room, r.room);
    fl("работа", w.work, r.work);
    fl("ед.", w.unit, r.unit);
    fl("кол-во", w.qty, r.qty);
  });
  const sameOrder = old.length === next.length && old.every((w, i) => next[i] && next[i].id === w.id);
  if (!sameOrder && !ch.length) ch.push("изменён порядок строк");

  p.works = next;
  compEditing = null;
  if (ch.length) logChange(p, "Состав работ: " + ch.join("; "));
  render();
}

/* ТЗ 2.2.1: в табе не дублируется шапка — видны "Вид работ" (п.13), "Заметки" (п.14) и состав работ */
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
    ${compEditing ? compEdit() : compView(p)}
    ${historyBlock(p)}`;
}

/* ---------------- Задачи (рекомендации 23.09, раздел 5) ---------------- */

function rTasks(p) {
  const list = p.tasks || [];
  const assignees = [...new Set(list.map((t) => t.assignee).filter(Boolean))];
  const f = taskFilter;
  const visible = list.filter((t) =>
    (f.status === "all" || t.status === f.status)
    && (f.assignee === "all" || t.assignee === f.assignee)
    && (!f.overdue || isOverdue(t)));
  const body = visible.map((t, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(t.title)}</td>
      <td>${esc(t.author)}</td>
      <td class="muted">${fmtDate(t.created)}</td>
      <td>${fmtDate(t.deadline)}${isOverdue(t) ? ` <span class="chip chip-overdue">просрочена</span>` : ""}</td>
      <td>${esc(t.assignee)}</td>
      <td>${taskChip(t.status)}</td>
    </tr>`).join("");
  return `
    <div class="subchips">
      <button class="fchip${f.status === "all" ? " active" : ""}" data-tf-status="all" type="button">Все</button>
      ${TASK_STATUSES.map((s) => `<button class="fchip${f.status === s.id ? " active" : ""}" data-tf-status="${s.id}" type="button">${esc(s.label)}</button>`).join("")}
      <select class="flt-sel" id="tf-assignee">
        <option value="all">Ответственный: все</option>
        ${assignees.map((a) => `<option value="${esc(a)}"${f.assignee === a ? " selected" : ""}>${esc(a)}</option>`).join("")}
      </select>
      <button class="fchip${f.overdue ? " active" : ""}" id="tf-overdue" type="button">Просроченные</button>
    </div>
    ${visible.length
      ? `<div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>#</th><th>Задача</th><th>Автор</th><th>Дата создания</th><th>Дедлайн</th><th>Ответственный</th><th>Статус</th></tr></thead>
          <tbody>${body}</tbody>
        </table></div>`
      : `<div class="empty">Задач по выбранным фильтрам нет</div>`}
    <div class="note">Вкладка показывает задачи этого проекта из общего раздела "Задачи" — второй модели задач внутри проекта нет. Дата создания назначается системой; просрочка вычисляется из дедлайна и незавершённого состояния. "#" нумерует строки таблицы; постоянный номер задачи живёт в её карточке.</div>`;
}

/* ---------------- Документы: один реестр, направление и состояние (рекомендации 23.09, раздел 6) ---------------- */

function rDocs(p) {
  const list = (p.docs || []).filter((d) => docDir === "all" || d.dir === docDir);
  const body = list.map((d, i) => {
    const st = DOC_STATUSES[d.status] || { label: d.status, cls: "" };
    return `<tr>
      <td>${i + 1}</td>
      ${docDir === "all" ? `<td class="muted">${dirNoun[d.dir]}</td>` : ""}
      <td>${esc(d.name)}</td>
      <td>${esc(d.type)}</td>
      <td>${esc(d.party)}</td>
      <td class="muted">${fmtDate(d.date)}</td>
      <td><span class="chip ${st.cls}">${esc(st.label)}</span></td>
      <td class="muted">${esc(d.version || "—")}</td>
    </tr>`;
  }).join("");
  return `
    <div class="subchips">
      <button class="fchip${docDir === "all" ? " active" : ""}" data-ddir="all" type="button">Все</button>
      ${DOC_DIRS.map((d) => `<button class="fchip${docDir === d.id ? " active" : ""}" data-ddir="${d.id}" type="button">${esc(d.label)}</button>`).join("")}
    </div>
    ${list.length
      ? `<div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>#</th>${docDir === "all" ? "<th>Направление</th>" : ""}<th>Документ</th><th>Тип</th><th>От кого или кому</th><th>Дата получения или отправки</th><th>Статус</th><th>Версия</th></tr></thead>
          <tbody>${body}</tbody>
        </table></div>`
      : `<div class="empty">Документов нет</div>`}
    <div class="note">Все / Входящие / Исходящие / Внутренние — представления одного реестра документов проекта; тип документа, направление и статус — отдельные признаки. Неотправленный исходящий документ: пустая дата отправки, статус "Черновик". Регистрация входящего не означает его принятия; загрузка файла не устанавливает "Отправлен".</div>`;
}

/* ---------------- Финансы ---------------- */

/* Сводный — вычисляемое представление (рекомендации 23.09, раздел 7) */
function rSvodny(p) {
  const t = finTotals(p);
  const cs = snap(p, "client");
  const isInt = snap(p, "int");
  const state = [];
  if (t.int.unev || t.cli.unev) state.push(`позиций без цены: внутренний бюджет ${t.int.unev}, бюджет клиента ${t.cli.unev}`);
  if (t.unapprCnt) state.push(`записей табеля не утверждено: ${t.unapprCnt} (${t.hoursUnappr} ч)`);
  if (t.hoursNoRate) state.push(`труд без ставки: ${t.hoursNoRate} ч`);
  if (t.unconfCnt) state.push(`операций не подтверждено: ${t.unconfCnt} (${fmtM2(t.unconf)})`);
  const row = (i, name, value, src) => `
    <tr><td>${i}</td><td>${name}</td><td class="num"><b>${value}</b></td><td class="svod-src">${src}</td></tr>`;
  return `
    <div class="note fin-note">Версии для расчёта: Внутренний бюджет — рабочая редакция${isInt ? ` (исходный зафиксирован ${fmtDate(isInt.date)})` : ""}; Бюджет клиента — рабочая редакция${cs ? ` (${esc(cs.version)} согласована ${fmtDate(cs.date)})` : ""}. Период факта: весь проект. Цены — без НДС.</div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>#</th><th>Показатель</th><th class="num">Значение</th><th>Источник</th></tr></thead>
      <tbody>
        ${row(1, "Плановая себестоимость", fmtM2(t.int.sum), `итог Внутреннего бюджета · без НДС${t.int.unev ? ` · не оценено: ${t.int.unev} поз.` : ""}`)}
        ${row(2, "Стоимость клиенту", fmtM2(t.cli.sum), `итог Бюджета клиента · без НДС${t.cli.unev ? ` · не оценено: ${t.cli.unev} поз.` : ""}`)}
        ${row(3, "Плановая разница цены и затрат", fmtM2(Math.round((t.cli.sum - t.int.sum) * 100) / 100), "строка 2 − строка 1 · единый состав, объём и налоговая база")}
        ${row(4, "Фактические часы", t.hoursAppr + " ч", `утверждённые записи табелей${t.unapprCnt ? ` · не утверждено: ${t.unapprCnt} зап. (${t.hoursUnappr} ч)` : ""}`)}
        ${row(5, "Стоимость труда по табелям", fmtM2(t.costAppr), `утверждённые часы × ставка даты работы${t.hoursNoRate ? ` · без ставки: ${t.hoursNoRate} ч` : ""}`)}
        ${row(6, "Поступления от клиента", fmtM2(t.income), "подтверждённые операции · весь проект")}
        ${row(7, "Денежные расходы проекта", fmtM2(t.expense), "подтверждённые операции · весь проект")}
        ${row(8, "Денежный баланс проекта", fmtM2(Math.round((t.income - t.expense) * 100) / 100), "поступления − выплаты за тот же период")}
        ${row(9, "К оплате сейчас", fmtM2(t.toPayNow), "выставленные и отправленные счета − подтверждённые поступления")}
        ${row(10, "Не оплачено по бюджету клиента", fmtM2(t.unpaidBudget), "строка 2 − строка 6 · неоплаченная часть договорённостей, не наступивший долг")}
        ${row(11, "Состояние данных", state.length ? state.join("; ") : "неполноты не выявлены", "источники неполноты показателей")}
      </tbody>
    </table></div>
    <div class="note">Сводный — вычисляемое представление: собственных редактируемых итогов у него нет, каждый показатель раскрывается до источника (виды ниже). Разница рассчитана по включённому составу работ и не является "прибылью проекта". Стоимость труда и денежные расходы показываются отдельно: полной фактической себестоимости (материалы, принятые работы подрядчиков) расчёт пока не даёт.</div>`;
}

/* Два бюджета: общий состав, разные цены (рекомендации 23.09, разделы 3-4) */
function rBudget(p, kind) {
  const isInt = kind === "int";
  const s = snap(p, kind);
  const working = budgetVer === "work" || !s;
  const priceKey = isInt ? "price_int" : "price_cli";
  const delta = !isInt ? clientDelta(p) : null;
  const cols =`<th>#</th><th>Помещение</th><th>Работа</th><th>Ед.</th><th class="num">Кол&#8209;во</th><th class="num">Цена за ед., €</th><th class="num">Стоимость, €</th>`;

  let table;
  let summaryRows = "";

  if (working) {
    const rows = (p.works || []).map((w, i) => {
      const cost = workCost(w.qty, w[priceKey]);
      const flag = delta && delta.flags.get(w.id);
      const dchip = flag ? `<span class="delta-chip delta-${flag}">${flag === "added" ? "добавлено" : "изменено"}</span>` : "";
      return `<tr>
        <td>${i + 1}</td><td>${esc(w.room)}</td><td>${esc(w.work)}${dchip}</td><td>${esc(w.unit)}</td><td class="num">${fmtQty(w.qty)}</td>
        <td class="num"><input class="price-inp" data-wid="${w.id}" type="number" min="0" step="any" placeholder="—${isInt ? " (себестоимость)" : ""}" value="${w[priceKey] == null ? "" : w[priceKey]}" title="${isInt ? "Плановая себестоимость единицы" : "Цена продажи единицы"}"></td>
        <td class="num">${cost == null ? `<span class="muted">—</span>` : fmtM2(cost)}</td>
      </tr>`;
    }).join("");
    const tt = sumRows(p.works || [], priceKey);
    summaryRows = `
      <div>Оценено: <b>${fmtM2(tt.sum)}</b> (${tt.cnt} поз.)</div>
      ${tt.unev ? `<div>Не оценено: ${tt.unev} поз. — пустая цена означает "не оценено", нулевая — осознанное значение; полный итог проекта не показывается</div>` : ""}`;
    if (!isInt) {
      summaryRows += `
        <div>НДС 19 %: <b>${fmtM2(vatOf(tt.sum))}</b> · Итого с НДС: <b>${fmtM2(Math.round((tt.sum + vatOf(tt.sum)) * 100) / 100)}</b> (цены — без НДС; ставка сохраняется в версии бюджета)</div>`;
      if (delta) {
        summaryRows += `<div>Изменение к согласованной версии (${esc(s.version)}, ${fmtDate(s.date)}): <b>${delta.delta >= 0 ? "+" : ""}${fmtM2(delta.delta)}</b></div>`;
        if (delta.excluded.length) summaryRows += `<div>Исключено относительно согласованной: ${delta.excluded.map((r) => `"${esc(r.room)} / ${esc(r.work)}"`).join(", ")} — позиция сохранена в зафиксированной версии</div>`;
      }
    }
    table = `
      <div class="note fin-note">${isInt
        ? 'Состав и количества — из вкладки "Основное"; здесь меняется только цена — плановая себестоимость единицы. Клиентская цена хранится независимо и не пересчитывается от внутренней.'
        : 'Состав и количества — из вкладки "Основное"; здесь меняется только цена — цена продажи единицы. Изменение внутренней себестоимости не меняет согласованную цену клиенту.'}</div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr>${cols}</tr></thead>
        <tbody>${rows}</tbody>
      </table></div>`;
  } else {
    const rows = s.rows.map((r, i) => {
      const cost = workCost(r.qty, r.price);
      return `<tr>
        <td>${i + 1}</td><td>${esc(r.room)}</td><td>${esc(r.work)}</td><td>${esc(r.unit)}</td><td class="num">${fmtQty(r.qty)}</td>
        <td class="num">${r.price == null ? `<span class="muted">—</span>` : fmtM2(r.price)}</td>
        <td class="num">${cost == null ? `<span class="muted">—</span>` : fmtM2(cost)}</td>
      </tr>`;
    }).join("");
    const tt = sumRows(s.rows, "price");
    summaryRows = `
      <div>Оценено: <b>${fmtM2(tt.sum)}</b> (${tt.cnt} поз.)</div>
      ${tt.unev ? `<div>Не оценено: ${tt.unev} поз.</div>` : ""}`;
    if (!isInt) summaryRows += `
      <div>НДС 19 %: <b>${fmtM2(vatOf(tt.sum))}</b> · Итого с НДС: <b>${fmtM2(Math.round((tt.sum + vatOf(tt.sum)) * 100) / 100)}</b></div>`;
    table = `
      <div class="fix-cap"><b>${esc(s.label)}${s.version ? " · " + esc(s.version) : ""}</b> — зафиксирован ${fmtDate(s.date)}${s.approved_by ? ` · согласование: ${esc(s.approved_by)}` : ""}</div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr>${cols}</tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <div class="note">Зафиксированная версия: значения названий, единиц, количеств, цен и правил расчёта сохранены в ней самой; редактирование состава и цен рабочей редакции эту версию не изменяет.</div>`;
  }

  const verChips = s ? `
    <div class="subchips">
      <button class="fchip${working ? " active" : ""}" data-bver="work" type="button">Рабочая редакция</button>
      <button class="fchip${!working ? " active" : ""}" data-bver="fixed" type="button">${esc(s.short)} (${fmtDate(s.date)})</button>
    </div>` : `
    <div class="subchips"><span class="fchip active">Рабочая редакция</span></div>`;

  return verChips + table + `<div class="budget-summary">${summaryRows}</div>`;
}

/* Фактический труд по табелям (рекомендации 23.09, раздел 8) */
function rLabor(p) {
  const list = p.timesheets || [];
  const body = list.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="muted">${fmtDate(r.date)}</td>
      <td>${esc(r.person)}</td>
      <td>${esc(r.work)}</td>
      <td class="num">${fmtQty(r.hours)}</td>
      <td class="num">${r.rate == null ? `<span class="muted">—</span>` : fmtM2(r.rate)}</td>
      <td class="num">${r.rate == null ? `<span class="muted">—</span>` : fmtM2(Math.round(r.hours * r.rate * 100) / 100)}</td>
      <td><span class="chip ${r.status === "approved" ? "chip-doc-approved" : "chip-doc-draft"}">${r.status === "approved" ? "Утверждён" : "Черновик"}</span></td>
    </tr>`).join("");
  const t = finTotals(p);
  return `
    ${list.length
      ? `<div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>#</th><th>Дата работы</th><th>Сотрудник</th><th>Работа или назначение</th><th class="num">Часы</th><th class="num">Ставка, €/ч</th><th class="num">Стоимость, €</th><th>Статус табеля</th></tr></thead>
          <tbody>${body}</tbody>
        </table></div>`
      : `<div class="empty">Записей табелей по проекту нет</div>`}
    <div class="budget-summary">
      <div>Утверждено: <b>${fmtQty(t.hoursAppr)} ч</b> · <b>${fmtM2(t.costAppr)}</b>${t.unapprCnt ? ` · Не утверждено: ${t.unapprCnt} зап. (${fmtQty(t.hoursUnappr)} ч)` : ""}${t.hoursNoRate ? ` · Без ставки: ${fmtQty(t.hoursNoRate)} ч — стоимость не показывается, почасовая оценка не выдумывается` : ""}</div>
    </div>
    <div class="note">Часы исправляются в исходном табеле — вкладка показывает записи проекта, одна запись учитывается один раз. Стоимость = утверждённые часы × ставка, действовавшая в дату работы; изменение текущего справочника ставок прошлую оценку не переписывает.</div>`;
}

/* Финансовые операции (рекомендации 23.09, раздел 8) */
function rOps(p) {
  const list = p.ops || [];
  const body = list.map((o, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="muted">${fmtDate(o.date)}</td>
      <td>${o.dir === "in" ? `<span class="dir-in">Приход</span>` : `<span class="dir-out">Расход</span>`}</td>
      <td>${esc(o.purpose)}</td>
      <td>${esc(o.party)}</td>
      <td class="num ${o.dir === "in" ? "pos" : "neg"}">${o.dir === "in" ? "+" : "−"} ${fmtM2(o.amount)}</td>
      <td>${esc(o.method)}</td>
      <td><span class="chip ${o.status === "confirmed" ? "chip-doc-approved" : "chip-doc-ready"}">${o.status === "confirmed" ? "Подтверждена" : "Не подтверждена"}</span></td>
      <td class="muted">${esc(o.doc || "—")}</td>
    </tr>`).join("");
  const t = finTotals(p);
  return `
    ${list.length
      ? `<div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>#</th><th>Дата</th><th>Приход или расход</th><th>Назначение</th><th>Контрагент или сотрудник</th><th class="num">Сумма, €</th><th>Способ оплаты</th><th>Статус</th><th>Документ</th></tr></thead>
          <tbody>${body}</tbody>
        </table></div>`
      : `<div class="empty">Операций по проекту нет</div>`}
    <div class="budget-summary">
      <div>Подтверждено — приход: <b>${fmtM2(t.income)}</b> · расход: <b>${fmtM2(t.expense)}</b>${t.unconfCnt ? ` · Не подтверждено: ${t.unconfCnt} оп. (${fmtM2(t.unconf)}) — в денежные итоги не входит` : ""}</div>
      <div>Пример без двойного счёта: труд 120 € по табелю и выплата 120 € — это 120 € труда и 120 € денежного расхода, а не 240 € затрат.</div>
    </div>
    <div class="note">Реестр операций общий с разделом "Финансы" — здесь отбор по проекту; создание записи из карточки не создаёт вторую копию. После подтверждения сумма не заменяется незаметно: исправление — исходная операция плюс связанная корректировка.</div>`;
}

function rFinance(p) {
  return `
    <div class="subchips">
      ${FIN_VIEWS.map((v) => `<button class="fchip${finView === v.id ? " active" : ""}" data-fin="${v.id}" type="button">${esc(v.label)}</button>`).join("")}
    </div>
    ${finView === "svodny" ? rSvodny(p)
      : finView === "b-int" ? rBudget(p, "int")
      : finView === "b-cli" ? rBudget(p, "cli")
      : finView === "labor" ? rLabor(p)
      : rOps(p)}`;
}

/* ---------------- заглушка раздела ---------------- */

function rPending(tzRef, extra) {
  return `<div class="pending">
      <div class="mark">[ ]</div>
      <div>Раздел в ТЗ помечен [ ] — наполнение ждёт дополнения ТЗ</div>
      <div class="ref">ТЗ, пункт ${esc(tzRef)}${extra ? ". " + esc(extra) : ""}</div>
    </div>`;
}

/* ---------------- скрытые вкладки (рекомендации 23.09, раздел 1) ---------------- */

/* Код вкладок сохранён: скрыть — не удалить. В TABS они не входят, рендером не показываются. */
function rAvail(items) {
  return `<div class="avail"><b>Данные проекта в CRM (доступны для наполнения раздела):</b>
    <ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul></div>`;
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

const HIDDEN_TABS = [
  { id: "tender", label: "Тендер", render: rTender },
  { id: "foto-video", label: "Фото и видео", render: rMedia },
  { id: "kabinet-klienta", label: "Кабинет клиента", render: rPortal },
];

/* ---------------- определение табов ---------------- */

/* Рекомендации 23.09, раздел 1: Основное, Задачи, Документы, Финансы; "Тендер", "Фото и видео", "Кабинет клиента" скрыты; "График" — место сохранено, содержимое ждёт отдельного ТЗ */
const TABS = [
  { id: "osnovnoe", label: "Основное", render: rMain },
  { id: "zadachi", label: "Задачи", render: rTasks },
  { id: "dokumenty", label: "Документы", render: rDocs },
  { id: "grafik", label: "График", render: () => rPending("2.3.3", "Место вкладки сохранено; содержание — отдельное ТЗ") },
  { id: "finansy", label: "Финансы", render: rFinance },
];

/* ---------------- шапка карточки (ТЗ 2.1) ---------------- */

function headCard(p) {
  // ТЗ 2.1 (п.1 пуст — без кнопки "Назад"): Название (п.2) | Этап (п.3) + Состояние (п.4) + Даты работ (п.11-12) | участники (п.5-8) и каналы (п.9-10)
  // "Редактировать" в шапке — реквизиты и участники (рекомендации 23.09, раздел 10 п.1)
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
        <button class="btn-ghost head-edit" id="btn-edit-head" type="button">Редактировать</button>
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

/* ---------------- обработчики видов ---------------- */

function bindMain(p) {
  const srch = document.getElementById("comp-search");
  if (srch) srch.addEventListener("input", () => {
    const q = srch.value.trim().toLowerCase();
    document.querySelectorAll("[data-srch]").forEach((tr) => {
      tr.style.display = !q || tr.dataset.srch.includes(q) ? "" : "none";
    });
  });
  const editBtn = document.getElementById("btn-comp-edit");
  if (editBtn) editBtn.addEventListener("click", () => {
    compEditing = (p.works || []).map((w) => ({ id: w.id, room: w.room, work: w.work, unit: w.unit, qty: w.qty }));
    render();
  });
  if (compEditing) {
    document.querySelectorAll(".comp-edit input[data-f]").forEach((inp) => inp.addEventListener("input", () => {
      const r = compEditing[+inp.dataset.i];
      const f = inp.dataset.f;
      if (!r) return;
      r[f] = f === "qty" ? (inp.value === "" ? null : parseFloat(inp.value)) : inp.value;
    }));
    document.querySelectorAll(".row-btn").forEach((b) => b.addEventListener("click", () => {
      const i = +b.dataset.i;
      const d = compEditing;
      if (b.dataset.act === "up" && i > 0) { const [x] = d.splice(i, 1); d.splice(i - 1, 0, x); }
      if (b.dataset.act === "down" && i < d.length - 1) { const [x] = d.splice(i, 1); d.splice(i + 1, 0, x); }
      if (b.dataset.act === "del") d.splice(i, 1);
      render();
    }));
    const add = document.getElementById("comp-add");
    if (add) add.addEventListener("click", () => { compEditing.push({ id: null, room: "", work: "", unit: "", qty: null }); render(); });
    const cancel = document.getElementById("comp-cancel");
    if (cancel) cancel.addEventListener("click", () => { compEditing = null; render(); });
    const save = document.getElementById("comp-save");
    if (save) save.addEventListener("click", () => compSave(p));
  }
}

function bindTasks() {
  document.querySelectorAll("[data-tf-status]").forEach((b) =>
    b.addEventListener("click", () => { taskFilter.status = b.dataset.tfStatus; render(); }));
  const sel = document.getElementById("tf-assignee");
  if (sel) sel.addEventListener("change", () => { taskFilter.assignee = sel.value; render(); });
  const ov = document.getElementById("tf-overdue");
  if (ov) ov.addEventListener("click", () => { taskFilter.overdue = !taskFilter.overdue; render(); });
}

function bindDocs() {
  document.querySelectorAll("[data-ddir]").forEach((b) =>
    b.addEventListener("click", () => { docDir = b.dataset.ddir; render(); }));
}

function bindFinance(p) {
  document.querySelectorAll("[data-fin]").forEach((b) =>
    b.addEventListener("click", () => { finView = b.dataset.fin; budgetVer = "work"; render(); }));
  document.querySelectorAll("[data-bver]").forEach((b) =>
    b.addEventListener("click", () => { budgetVer = b.dataset.bver; render(); }));
  document.querySelectorAll(".price-inp").forEach((inp) => inp.addEventListener("change", () => {
    const w = (p.works || []).find((x) => String(x.id) === inp.dataset.wid);
    if (!w) return;
    const key = finView === "b-int" ? "price_int" : "price_cli";
    const v = inp.value === "" ? null : parseFloat(inp.value);
    w[key] = Number.isFinite(v) ? v : null;
    render();
  }));
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

    const editHead = document.getElementById("btn-edit-head");
    if (editHead) editHead.addEventListener("click", () => openEdit(p));
    const histBtn = document.getElementById("btn-history");
    if (histBtn) histBtn.addEventListener("click", () => { historyOpen = !historyOpen; render(); });

    if (r.tab === "osnovnoe") bindMain(p);
    if (r.tab === "zadachi") bindTasks();
    if (r.tab === "dokumenty") bindDocs();
    if (r.tab === "finansy") bindFinance(p);
  } else {
    document.body.classList.remove("on-card");
    side.innerHTML = "";
    wrap.innerHTML = listPage();

    document.getElementById("crumb").textContent = "Проекты";
    document.title = "Все проекты — Meleshin OS";

    const addProjBtn = document.getElementById("btn-add-project");
    if (addProjBtn) addProjBtn.addEventListener("click", openAddProject);

    wrap.querySelectorAll(".fchip").forEach((b) =>
      b.addEventListener("click", () => { filterStage = b.dataset.stage; render(); }));
  }
}

window.addEventListener("hashchange", render);
render();
