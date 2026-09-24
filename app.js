/* Симуляция: список "Все проекты" + карточка проекта — ТЗ модуля "Карточка проекта" (tz/project-card/, 24.09.2026). */

const PROJECTS = DATA.projects;
const DEFAULT_PROJECT_URL = "2607-Polis-Apartment"; // прежние ссылки #/<таб> открывают эту карточку
const LIST_ROUTE = "vse-proekty";

/* ТЗ "Карточка проекта", шапка п.3: Этап */
const STAGES = [
  { id: "predproekt", label: "Предпроектные работы" },
  { id: "smr", label: "СМР и отделочные работы" },
  { id: "postproekt", label: "Пост-проектные работы" },
];
const stageLabel = (id) => ((STAGES.find((s) => s.id === id) || {}).label) || "—";

/* ТЗ "Карточка проекта", шапка п.4: Состояние */
const STATES = [
  { id: "initiated", label: "Инициированы" },
  { id: "started", label: "Начаты" },
  { id: "controlled", label: "На контроле" },
  { id: "concluded", label: "Завершены" },
  { id: "closed", label: "Закрыты" },
];
const stateLabel = (id) => ((STATES.find((s) => s.id === id) || {}).label) || "—";

/* ТЗ "Задачи": статусы задач */
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

/* ТЗ "Документы": направление документа — отдельный признак */
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
const DOC_TYPES = ["КП", "Бюджет клиента", "Внутренний бюджет", "Счёт", "Акт", "Отчёт", "Проектная документация", "Письмо", "Запрос согласования", "Референсы", "Служебный расчёт"];
const docStatusByDir = { in: "received", out: "draft", int: "draft" };

/* ТЗ "Финансы": внутри "Финансов" — Сводный → Внутренний бюджет → Бюджет клиента → Фактический труд по табелям → Финансовые операции */
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
let budgetVer = "work"; // "work" | "f<индекс>" — выбранная зафиксированная версия
let svodSel = null; // версии бюджетов для Сводного (ТЗ "Финансы", Сводный); по умолчанию — клиентский: последняя согласованная
let svodProject = null; // при смене проекта выбор версий сбрасывается
let compEditing = null; // черновик состава работ: [{id, room, work, unit, qty}]

const fmtM2 = (v) => (v == null ? "—" : new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + " €");
const fmtQty = (v) => (v == null ? "—" : new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(v));
const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
};
const todayIso = () => {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};
const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ТЗ "Карточка проекта", шапка п.5-8: участник — "Имя Фамилия | Телефон | Telegram" */
const fmtPerson = (pp) => (!pp ? null : [pp.name, pp.phone, pp.tg].filter(Boolean).map(esc).join(" | "));

const stageChip = (st) => `<span class="chip chip-stage" title="Этап — ТЗ "Карточка проекта", шапка п.3">${esc(stageLabel(st))}</span>`;
const stateChip = (st) => `<span class="chip chip-${esc(st)}" title="Состояние — ТЗ "Карточка проекта", шапка п.4">${esc(stateLabel(st))}</span>`;
const taskChip = (s) => `<span class="chip chip-t-${esc(s)}">${esc(taskStatusLabel(s))}</span>`;

/* ---------------- панель кнопок таба (ТЗ "Карточка проекта", табы: у каждого таба свои действия) ---------------- */

function tabTools(tabId) {
  if (tabId === "general") return `<div class="tab-tools">
      <button class="btn-ghost" id="btn-edit" type="button">Редактировать</button>
      <button class="btn-ghost" id="btn-history" type="button">${historyOpen ? "Скрыть историю" : "История"}</button>
    </div>`;
  if (tabId === "tasks") return `<div class="tab-tools">
      <button class="btn-primary" id="btn-add-task" type="button">Добавить задачу</button>
    </div>`;
  if (tabId === "documents") return `<div class="tab-tools">
      <button class="btn-primary" id="btn-add-doc" type="button">Добавить документ</button>
    </div>`;
  return "";
}

/* ---------------- История (ТЗ "Основное", история) ---------------- */

const logStamp = () => {
  const d = new Date();
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })
    + " " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
};

function logChange(p, tab, change) {
  if (!p.history) p.history = [];
  p.history.unshift({ date: logStamp(), tab, change, author: "Демо-пользователь" });
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

/* ТЗ "Основное", окно реквизитов: "Редактировать" (кнопка в табе "Основное") — всплывающее окно с реквизитами */
function openEdit(p) {
  const persons = {};
  ROLE_FIELDS.forEach((r) => { if (p[r.key]) persons[r.key] = { ...p[r.key] }; });
  // ТЗ "Основное", окно реквизитов п.2: YYNN присваивается при создании и не редактируется
  const nm = String(p.name || "").match(/^(\d{4}\.)\s*(.*)$/);
  const namePrefix = nm ? nm[1] : "";
  const nameRest = nm ? nm[2] : String(p.name || "");

  const renderPersons = () => {
    document.getElementById("ed-persons").innerHTML =
      ROLE_FIELDS.filter((r) => persons[r.key]).map((r) => personBlockHtml(r.key, persons[r.key])).join("");
    const sel = document.getElementById("ed-add-role");
    sel.querySelectorAll("option").forEach((o) => { o.disabled = !!persons[o.value]; });
    const free = [...sel.options].find((o) => !o.disabled); // выбранная роль не должна быть занята
    if (free) sel.value = free.value;
  };

  mountModal(`
    <div class="modal">
      <div class="modal-title">Редактировать</div>
      <div class="form-skel">
        <label>Название</label>
        <div class="ed-name-row">
          <input id="ed-name-prefix" type="text" value="${esc(namePrefix)}" disabled title="YYNN присваивается при создании проекта и не редактируется">
          <input id="ed-name-rest" type="text" autocomplete="off" value="${esc(nameRest)}">
        </div>
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
    if (persons[k]) return; // роль уже добавлена — не затираем существующего участника
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
    const nameRestNew = rd("ed-name-rest");
    if (nameRestNew) {
      const newName = (document.getElementById("ed-name-prefix").value + " " + nameRestNew).trim().replace(/\s+/g, " ");
      if (newName !== p.name) { changes.push("Название: " + p.name + " → " + newName); p.name = newName; }
    }

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

    if (changes.length) logChange(p, "Основное", changes.join("; "));
    closeAnyModal();
    render();
  });
}

/* ---------------- "Добавить проект" (ТЗ "Карточка проекта", новый проект) ---------------- */

const TR = { "а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"e","ж":"zh","з":"z","и":"i","й":"y","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"h","ц":"c","ч":"ch","ш":"sh","щ":"sch","ъ":"","ы":"y","ь":"","э":"e","ю":"yu","я":"ya" };
const slugify = (s) => s.toLowerCase().split("").map((ch) => (TR[ch] != null ? TR[ch] : ch)).join("")
  .replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

/* ТЗ "Карточка проекта", новый проект: YYNN в названии задаётся автоматически */
function nextYyNn() {
  const yy = String(new Date().getFullYear()).slice(-2);
  let max = 0;
  PROJECTS.forEach((p) => {
    const m = String(p.name || "").match(new RegExp("^" + yy + "(\\d{2})"));
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return yy + String(max + 1).padStart(2, "0");
}

function openAddProject() {
  mountModal(`
    <div class="modal">
      <div class="modal-title">Добавить проект</div>
      <div class="form-skel">
        <label>Название (YYNN задаётся автоматически)</label>
        <input id="np-name" type="text" placeholder="YYNN. Place Property_type" autocomplete="off" value="${esc(nextYyNn())}. ">
        <label>Клиент (Имя Фамилия)</label>
        <input id="np-client" type="text" autocomplete="off">
        <label>Этап</label>
        <select id="np-stage">${STAGES.map((s) => `<option value="${s.id}">${esc(s.label)}</option>`).join("")}</select>
        <label>Состояние</label>
        <select id="np-state">${STATES.map((s) => `<option value="${s.id}"${s.id === "initiated" ? " selected" : ""}>${esc(s.label)}</option>`).join("")}</select>
        <label>Дата начала</label>
        <input id="np-start" type="date">
        <label>Дата окончания</label>
        <input id="np-end" type="date">
        <label>Вид работ</label>
        <input id="np-vid" type="text" autocomplete="off">
        <label>Заметки</label>
        <textarea id="np-zam" rows="3"></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn-ghost" id="np-cancel" type="button">Отмена</button>
        <button class="btn-primary" id="np-save" type="button">Добавить</button>
      </div>
      <div class="note">Демо: проект добавляется в данные страницы, до перезагрузки. Участники и каналы — через "Редактировать" в табе "Основное".</div>
    </div>`);

  document.getElementById("np-cancel").addEventListener("click", closeAnyModal);
  document.getElementById("np-save").addEventListener("click", () => {
    const nameEl = document.getElementById("np-name");
    const name = nameEl.value.trim();
    if (!name) { nameEl.classList.add("input-err"); nameEl.focus(); return; }
    const rd = (id) => document.getElementById(id).value.trim();
    const clientName = rd("np-client");
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
      client: clientName ? { name: clientName, phone: "", tg: "" } : null, pm: null, foreman: null, client_rep: null,
      tg_team: null, tg_client: null,
      vid_rabot: rd("np-vid"), zametki: rd("np-zam"),
      rooms: [],
      works: [], fix_int: [], fix_cli: [],
      docs: [], tasks: [], timesheets: [], ops: [],
      history: [],
    });
    closeAnyModal();
    location.hash = `#/${url}/${DEFAULT_TAB}`;
    if (parseHash().page !== "card") render();
  });
  document.getElementById("np-name").focus();
}

/* ---------------- расчёты: единый источник состава (ТЗ "Основное", состав; ТЗ "Финансы", бюджеты) ---------------- */

const workCost = (qty, price) => (qty == null || price == null ? null : Math.round(qty * price * 100) / 100);
const vatOf = (sum) => Math.round(sum * 0.19 * 100) / 100;

/* зафиксированные версии (ТЗ "Финансы", версии): массивы, рабочая редакция — всегда p.works + текущие цены */
function fixList(p, kind) { return kind === "int" ? (p.fix_int || []) : (p.fix_cli || []); }
function snap(p, kind) { const l = fixList(p, kind); return l.length ? l[l.length - 1] : null; }

function snapshotRows(p, priceKey) {
  return (p.works || []).map((w) => ({ wid: w.id, room: w.room, work: w.work, unit: w.unit, qty: w.qty, price: w[priceKey] }));
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

/* признак "изменено относительно согласованного" (ТЗ "Финансы", версии) */
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

/* ТЗ "Финансы", операции: типы операций; записи демо-данных старого формата получают тип из направления */
const OP_TYPES = [
  { id: "income", label: "Поступление" },
  { id: "expense", label: "Расход" },
  { id: "refund", label: "Возврат" },
  { id: "transfer", label: "Внутренний перевод" },
];
const opType = (o) => o.type || (o.dir === "in" ? "income" : "expense");

/* счёт — исходящий документ типа "Счёт"; в расчёты с клиентом попадают отправленные */
const normDoc = (s) => String(s || "").replace(/\.pdf$/i, "");
const invoiceDocs = (p) => (p.docs || []).filter((d) => d.type === "Счёт" && d.dir === "out" && d.status === "sent");

/* ТЗ "Финансы", операции: подтверждённое поступление распределяется по счетам (поле "Документ" операции) */
function paidByInvoice(p) {
  const m = new Map();
  (p.ops || []).forEach((o) => {
    if (opType(o) !== "income" || o.status !== "confirmed" || !o.doc) return;
    m.set(normDoc(o.doc), (m.get(normDoc(o.doc)) || 0) + o.amount);
  });
  return m;
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
  // ТЗ "Финансы", операции: возврат связан с исходной операцией и уменьшает её сторону, не создавая новой;
  // внутренний перевод между счетами компании в денежных итогах проекта не участвует
  const ops = p.ops || [];
  t.income = 0; t.expense = 0; t.transfers = 0; t.unconf = 0; t.unconfCnt = 0;
  ops.forEach((o) => {
    if (o.status !== "confirmed") { t.unconf += o.amount; t.unconfCnt += 1; return; }
    const tp = opType(o);
    if (tp === "transfer") { t.transfers = Math.round((t.transfers + o.amount) * 100) / 100; return; }
    if (tp === "refund") {
      const src = ops.find((x) => x !== o && x.status === "confirmed" && opType(x) !== "refund" && o.refund_of && x.purpose === o.refund_of);
      if (!src) return; // возврат без связи с исходной операцией в итогах не учитывается
      if (src.dir === "in") t.income = Math.round((t.income - o.amount) * 100) / 100;
      else t.expense = Math.round((t.expense - o.amount) * 100) / 100;
      return;
    }
    if (o.dir === "in") t.income = Math.round((t.income + o.amount) * 100) / 100;
    else t.expense = Math.round((t.expense + o.amount) * 100) / 100;
  });
  // ТЗ "Финансы", Сводный: распределение поступлений по счетам и аванс клиента
  const inv = invoiceDocs(p);
  t.paidMap = paidByInvoice(p);
  t.unpaidInvoices = inv.reduce((s, d) => s + Math.max(0, Math.round(((d.amount || 0) - (t.paidMap.get(normDoc(d.name)) || 0)) * 100) / 100), 0);
  t.incomeDistributed = inv.reduce((s, d) => s + (t.paidMap.get(normDoc(d.name)) || 0), 0);
  t.advance = Math.max(0, Math.round((t.income - t.incomeDistributed) * 100) / 100);
  t.toPayNow = Math.max(0, Math.round((t.unpaidInvoices - t.advance) * 100) / 100);
  return t;
}

/* ---------------- Основное: состав работ и конструктор (ТЗ "Основное", состав) ---------------- */

const ROOM_ANY = "Весь объект";

/* ТЗ "Объект": перечень помещений — единственный источник; для общих работ — системное значение "Весь объект" */
function roomOptions(p) {
  const list = [...(p.rooms || [])];
  list.push(ROOM_ANY);
  return list;
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
    <div class="note">После сохранения состав попадает в рабочие редакции обоих бюджетов ("Финансы"); несохранённые изменения в бюджеты не попадают. Помещение выбирается из перечня помещений ("Объект"); для общих работ — значение "${ROOM_ANY}". У позиции есть постоянный внутренний идентификатор: видимый "#" — только порядок строк.</div>`;
}

function compEdit(p) {
  const draft = compEditing;
  const rooms = roomOptions(p);
  const roomSel = (cur) => {
    const list = (cur && !rooms.includes(cur)) ? [cur, ...rooms] : rooms; // прежнее помещение, исчезнувшее из перечня, не теряется молча
    return list.map((r) => `<option value="${esc(r)}"${r === (cur || ROOM_ANY) ? " selected" : ""}>${esc(r)}</option>`).join("");
  };
  const rows = draft.map((w, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><select data-i="${i}" data-f="room">${roomSel(w.room)}</select></td>
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
      return { id: maxId, room: r.room || ROOM_ANY, work: r.work, unit: r.unit, qty: r.qty, price_int: null, price_cli: null };
    }
    const prev = old.find((w) => w.id === r.id) || {};
    // ТЗ "Основное", состав событие 4: изменена единица или существенно изменена работа — позиция требует проверки цены
    const rePrice = (prev.unit || "") !== (r.unit || "") || (prev.work || "") !== (r.work || "");
    return { ...prev, room: r.room, work: r.work, unit: r.unit, qty: r.qty, price_check: !!(prev.price_check || rePrice) };
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
  if (ch.length) logChange(p, "Основное", "Состав работ: " + ch.join("; "));
  render();
}

/* ---------------- Объект: единый перечень помещений (ТЗ "Объект") ---------------- */

function pendingInline(title, ref) {
  return `
    <div class="pending-row">
      <div class="pending compact">
        <div class="mark">[ ]</div>
        <div><b>${esc(title)}</b><div class="ref">${esc(ref)}</div></div>
      </div>
    </div>`;
}

function rObject(p) {
  if (!p.rooms) p.rooms = [];
  const works = p.works || [];
  const cnt = (room) => works.filter((w) => w.room === room).length;
  const roomRow = (room, i, sys) => `
    <tr>
      <td>${i + 1}</td>
      <td>${sys ? `<b>${esc(room)}</b>` : esc(room)}</td>
      <td class="muted">${cnt(room) ? `позиций состава: ${cnt(room)}` : "помещение без позиций"}</td>
      <td class="row-acts">${sys ? "" : `
        <button class="row-btn" data-room-act="rename" data-room="${esc(room)}" type="button" title="Переименовать помещение">✎</button>
        <button class="row-btn" data-room-act="del" data-room="${esc(room)}" type="button" title="Исключить помещение">✕</button>`}</td>
    </tr>`;
  const rows = p.rooms.map((room, i) => roomRow(room, i, false)).join("")
    + roomRow(ROOM_ANY, p.rooms.length, true);
  return `
    <div class="sect-head" style="margin-top:0">
      <div class="sect-title">Помещения</div>
      <div class="sect-head-tools"><button class="btn-ghost" id="btn-add-room" type="button">Добавить помещение</button></div>
    </div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>#</th><th>Помещение</th><th>Состав</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <div class="svod-src" style="margin-top:6px">"${ROOM_ANY}" — системное значение для общих работ: существует всегда, не редактируется.</div>
    ${pendingInline("Характеристики помещения", 'ТЗ "Объект", элемент 3 — параметры, из которых следуют объёмы работ (площади, размеры, количества)')}
    ${pendingInline("Объёмы по помещениям", 'ТЗ "Объект", элемент 4 — объёмы работ состава, сгруппированные по помещениям; производное представление перечня и состава')}
    ${pendingInline("Фото и видео", 'ТЗ "Объект", элемент 5 — материалы объекта')}
    <div class="note">Перечень — единственный источник помещений: состав работ ("Основное"), бюджеты ("Финансы"), задачи и табели выбирают помещение из него, ввод текстом в других вкладках не допускается. Добавление помещения не создаёт позиций состава; помещение без позиций показывается пустым.</div>`;
}

/* ТЗ "Объект": добавить / переименовать помещение; переименование переносится на привязанные позиции состава */
function openRoomModal(p, oldName) {
  const isNew = !oldName;
  mountModal(`
    <div class="modal">
      <div class="modal-title">${isNew ? "Добавить помещение" : "Переименовать помещение"}</div>
      <div class="form-skel">
        <label>Помещение</label>
        <input id="rm-name" type="text" autocomplete="off" value="${esc(isNew ? "" : oldName)}">
      </div>
      <div class="modal-actions">
        <button class="btn-ghost" id="rm-cancel" type="button">Отмена</button>
        <button class="btn-primary" id="rm-save" type="button">${isNew ? "Добавить" : "Сохранить"}</button>
      </div>
      <div class="note">${isNew
        ? 'Демо: помещение добавляется в данные страницы, до перезагрузки. Позиции состава добавление не создаёт.'
        : 'Переименование переносится на позиции состава, привязанные к этому помещению.'}</div>
    </div>`);
  document.getElementById("rm-cancel").addEventListener("click", closeAnyModal);
  document.getElementById("rm-save").addEventListener("click", () => {
    const el = document.getElementById("rm-name");
    const name = el.value.trim();
    if (!name || name === ROOM_ANY || p.rooms.includes(name)) { el.classList.add("input-err"); el.focus(); return; }
    if (isNew) {
      p.rooms = [...p.rooms, name];
      logChange(p, "Объект", `добавлено помещение "${name}"`);
    } else {
      p.rooms = p.rooms.map((r) => (r === oldName ? name : r));
      (p.works || []).forEach((w) => { if (w.room === oldName) w.room = name; });
      logChange(p, "Объект", `помещение переименовано: "${oldName}" → "${name}"; привязанные позиции состава перенесены`);
    }
    closeAnyModal();
    render();
  });
  document.getElementById("rm-name").focus();
}

function bindObject(p) {
  const add = document.getElementById("btn-add-room");
  if (add) add.addEventListener("click", () => openRoomModal(p, null));
  document.querySelectorAll("[data-room-act]").forEach((b) => b.addEventListener("click", () => {
    const room = b.dataset.room;
    if (b.dataset.roomAct === "rename") { openRoomModal(p, room); return; }
    const bound = (p.works || []).filter((w) => w.room === room).length;
    if (bound) {
      // ТЗ "Объект": исключение помещения с привязанными позициями состава — [ ]; в демо не выполняется
      mountModal(`
        <div class="modal">
          <div class="modal-title">Исключить помещение</div>
          <div class="empty">К помещению "${esc(room)}" привязано позиций состава: ${bound}. Исключение помещения с привязанными позициями — [ ] в ТЗ ("Объект"); в демо не выполняется.</div>
          <div class="modal-actions"><button class="btn-ghost" id="rm-del-close" type="button">Закрыть</button></div>
        </div>`);
      document.getElementById("rm-del-close").addEventListener("click", closeAnyModal);
      return;
    }
    p.rooms = (p.rooms || []).filter((r) => r !== room);
    logChange(p, "Объект", `исключено помещение "${room}"`);
    render();
  }));
}

/* ТЗ "Основное": в табе не дублируется шапка — видны "Вид работ", "Заметки" и состав работ */
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
    ${compEditing ? compEdit(p) : compView(p)}
    ${historyBlock(p)}`;
}

/* ---------------- Задачи (ТЗ "Задачи") ---------------- */

const nextTaskNum = (p) => (p.tasks || []).reduce((m, t) => Math.max(m, t.num || 0), 0) + 1;
const workName = (w) => `${w.room || "—"} / ${w.work || "—"}`;

function rTasks(p) {
  const list = p.tasks || [];
  const assignees = [...new Set(list.map((t) => t.assignee).filter(Boolean))];
  const f = taskFilter;
  const visible = list.filter((t) =>
    (f.status === "all" || t.status === f.status)
    && (f.assignee === "all" || t.assignee === f.assignee)
    && (!f.overdue || isOverdue(t)));
  const body = visible.map((t, i) => `
    <tr class="row-click" data-task="${t.num}" title="Открыть карточку задачи">
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
    <div class="note">Вкладка показывает задачи этого проекта из общего раздела "Задачи" — второй модели задач внутри проекта нет. Дата создания назначается системой; просрочка вычисляется из дедлайна и незавершённого состояния. "#" нумерует строки таблицы; постоянный номер задачи — в её карточке. Связь с работой состава необязательна: задача может касаться всего проекта.</div>`;
}

/* ТЗ "Задачи": "Добавить задачу" — карточка задачи; редактирование — кликом по строке */
function openTaskCard(p, t) {
  const isNew = !t;
  const num = isNew ? nextTaskNum(p) : t.num;
  const works = p.works || [];
  const tasks = p.tasks || [];
  mountModal(`
    <div class="modal">
      <div class="modal-title">${isNew ? "Добавить задачу" : "Задача №" + num}</div>
      <div class="form-skel">
        ${isNew ? "" : `<div class="svod-src">Дата создания: ${fmtDate(t.created)} · назначается системой</div>`}
        <label>Задача</label>
        <input id="tk-title" type="text" autocomplete="off" value="${esc(isNew ? "" : t.title)}">
        <label>Описание</label>
        <textarea id="tk-desc" rows="3">${esc(isNew ? "" : (t.desc || ""))}</textarea>
        <label>Автор</label>
        <input id="tk-author" type="text" autocomplete="off" value="${esc(isNew ? "" : t.author)}">
        <label>Ответственный</label>
        <input id="tk-assignee" type="text" autocomplete="off" value="${esc(isNew ? "" : t.assignee)}">
        <label>Дедлайн</label>
        <input id="tk-deadline" type="date" value="${isoDay(isNew ? null : t.deadline)}">
        <label>Статус</label>
        <select id="tk-status">${TASK_STATUSES.map((s) => `<option value="${s.id}"${!isNew && t.status === s.id ? " selected" : ""}>${esc(s.label)}</option>`).join("")}</select>
        <label>Связь с работой состава</label>
        <select id="tk-work">
          <option value="">— без связи (весь проект)</option>
          ${works.map((w) => `<option value="${w.id}"${!isNew && t.work_id === w.id ? " selected" : ""}>${esc(workName(w))}</option>`).join("")}
        </select>
      </div>
      <div class="modal-actions">
        <button class="btn-ghost" id="tk-cancel" type="button">Отмена</button>
        <button class="btn-primary" id="tk-save" type="button">${isNew ? "Добавить" : "Сохранить"}</button>
      </div>
      ${isNew ? `<div class="note">Демо: задача добавляется в данные страницы, до перезагрузки. Перенос дедлайна — отдельное изменение с записью в историю.</div>` : `<div class="note">Перенос дедлайна — отдельное изменение с записью в историю.</div>`}
    </div>`);

  document.getElementById("tk-cancel").addEventListener("click", closeAnyModal);
  document.getElementById("tk-save").addEventListener("click", () => {
    const titleEl = document.getElementById("tk-title");
    const title = titleEl.value.trim();
    if (!title) { titleEl.classList.add("input-err"); titleEl.focus(); return; }
    const rd = (id) => document.getElementById(id).value.trim();
    const rec = {
      num,
      title,
      desc: rd("tk-desc"),
      author: rd("tk-author"),
      assignee: rd("tk-assignee"),
      deadline: rd("tk-deadline") || null,
      status: document.getElementById("tk-status").value,
      work_id: rd("tk-work") ? parseInt(rd("tk-work"), 10) : null,
    };
    if (isNew) {
      rec.created = todayIso();
      p.tasks = [...(p.tasks || []), rec];
      logChange(p, "Задачи", `добавлена задача №${num} "${title}"`);
    } else {
      rec.created = t.created;
      const idx = p.tasks.findIndex((x) => x.num === num);
      p.tasks[idx] = rec;
      const ch = [`задача №${num} "${title}": изменена`];
      if ((t.deadline || "") !== (rec.deadline || "")) ch.push(`дедлайн: ${fmtDate(t.deadline)} → ${fmtDate(rec.deadline)} (отдельное изменение)`);
      logChange(p, "Задачи", ch.join("; "));
    }
    closeAnyModal();
    render();
  });
  document.getElementById("tk-title").focus();
}

/* ---------------- Документы: один реестр, вкладки управления (ТЗ "Документы") ---------------- */

function rDocs(p) {
  const all = p.docs || [];
  const list = all.filter((d) => docDir === "all" || d.dir === docDir);
  // ТЗ "Документы": вкладка направления задаёт контекст управления, а не фильтр строк —
  // свой набор столбцов и своё событие даты
  const CTX = {
    all: { party: "Корреспондент", date: "Дата", ver: true, dir: true },
    in: { party: "От кого", date: "Дата получения", ver: false, dir: false },
    out: { party: "Кому", date: "Дата отправки", ver: true, dir: false },
    int: { party: "Автор", date: "Дата документа", ver: true, dir: false },
  }[docDir];
  const body = list.map((d, i) => {
    const st = DOC_STATUSES[d.status] || { label: d.status, cls: "" };
    return `<tr class="row-click" data-doc="${all.indexOf(d)}" title="Открыть карточку документа">
      <td>${i + 1}</td>
      ${CTX.dir ? `<td class="muted">${dirNoun[d.dir]}</td>` : ""}
      <td>${esc(d.name)}${d.kp ? ` <span class="delta-chip delta-added">КП</span>` : ""}</td>
      <td>${esc(d.type)}</td>
      <td>${esc(d.party)}</td>
      <td class="muted">${fmtDate(d.date)}</td>
      ${CTX.ver ? `<td class="muted">${esc(d.version || "—")}</td>` : ""}
      <td><span class="chip ${st.cls}">${esc(st.label)}</span></td>
    </tr>`;
  }).join("");
  return `
    <div class="dtabs">
      <button class="dtab${docDir === "all" ? " active" : ""}" data-ddir="all" type="button">Все</button>
      ${DOC_DIRS.map((d) => `<button class="dtab${docDir === d.id ? " active" : ""}" data-ddir="${d.id}" type="button">${esc(d.label)}</button>`).join("")}
    </div>
    ${list.length
      ? `<div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>#</th>${CTX.dir ? "<th>Направление</th>" : ""}<th>Документ</th><th>Тип</th><th>${CTX.party}</th><th>${CTX.date}</th>${CTX.ver ? "<th>Версия</th>" : ""}<th>Статус</th></tr></thead>
          <tbody>${body}</tbody>
        </table></div>`
      : `<div class="empty">Документов нет</div>`}
    <div class="note">Вкладка направления — контекст управления: свои столбцы, своё событие даты и свой жизненный цикл. Входящие — полученное: дата получения, статусы "Получен → В обработке → Обработан"; регистрация не означает принятия. Исходящие — составленное компанией: дата отправки заполняется событием отправки, пустая дата — не отправлен. Внутренние — служебные: утверждение, отправки нет. Версия — номер редакции, составленной компанией (КП v1 → v2); входящие версий не имеют — новая редакция от контрагента регистрируется новым документом. КП и зафиксированные версии бюджетов — здесь с выгрузкой, со ссылкой на источник.</div>`;
}

/* карточка документа: клик по строке реестра */
function openDocCard(p, d) {
  const st = DOC_STATUSES[d.status] || { label: d.status, cls: "" };
  const frow = (label, valueHtml) => `<tr><td class="fld">${label}</td><td>${valueHtml}</td></tr>`;
  const plain = (v) => (v ? esc(v) : `<span class="muted">—</span>`);
  // ТЗ "Документы": названия полей следуют направлению; версия — только у исходящих и внутренних
  const partyLabel = { in: "От кого", out: "Кому", int: "Автор" }[d.dir] || "Корреспондент";
  const dateLabel = d.dir === "in" ? "Дата получения" : "Дата отправки";
  const hasVersion = d.dir !== "in";
  // ТЗ "Финансы", основание состава работ: у счёта оплатенность вычисляется из распределённых поступлений
  const isInvoice = d.type === "Счёт" && d.dir === "out";
  let invRows = "";
  if (isInvoice) {
    const paid = finTotals(p).paidMap.get(normDoc(d.name)) || 0;
    const amount = d.amount || 0;
    const payState = paid <= 0 ? "не оплачен" : (paid + 0.001 < amount ? "оплачен частично" : "оплачен");
    const payCls = paid <= 0 ? "chip-doc-draft" : (paid + 0.001 < amount ? "chip-doc-processing" : "chip-doc-approved");
    invRows = frow("Сумма", amount ? fmtM2(amount) : `<span class="muted">—</span>`)
      + frow("Распределённые поступления", fmtM2(paid))
      + frow("Оплаченность", `<span class="chip ${payCls}">${payState}</span>`);
  }
  const cycle = {
    in: "Получен → В обработке → Обработан. Регистрация входящего не означает принятия обязательства или согласия с содержанием.",
    out: "Черновик → Готов к отправке → Отправлен. Загрузка файла не устанавливает \"Отправлен\"; дата отправки заполняется событием отправки.",
    int: "Черновик → Утверждён, если виду документа требуется утверждение.",
  }[d.dir] || "";
  let kpBlock = "";
  if (d.kp || d.budget) {
    const rowsSrc = d.kp ? d.kp.rows : d.budget.rows;
    const isKp = !!d.kp;
    const withVat = isKp || d.budget.kind === "cli";
    const rows = rowsSrc.map((r, i) => `
      <tr>
        <td>${i + 1}</td><td>${esc(r.room)}</td><td>${esc(r.work)}</td><td>${esc(r.unit)}</td><td class="num">${fmtQty(r.qty)}</td>
        <td class="num">${r.price == null ? `<span class="muted">—</span>` : fmtM2(r.price)}</td>
        <td class="num">${workCost(r.qty, r.price) == null ? `<span class="muted">—</span>` : fmtM2(workCost(r.qty, r.price))}</td>
      </tr>`).join("");
    const tt = sumRows(rowsSrc, "price");
    kpBlock = `
      <div class="sect-title">${isKp ? "Позиции КП" : "Позиции зафиксированной версии"}</div>
      ${isKp && d.kp.extra ? `<div class="svod-src" style="margin-bottom:8px">Дополнительный состав — позиции вне согласованного Бюджета клиента</div>` : ""}
      ${!isKp ? `<div class="svod-src" style="margin-bottom:8px">${esc(d.budget.label)} · источник — "Финансы", вид бюджета</div>` : ""}
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>#</th><th>Помещение</th><th>Работа</th><th>Ед.</th><th class="num">Кол&#8209;во</th><th class="num">Цена за ед., €</th><th class="num">Стоимость, €</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <div class="budget-summary">
        <div>Оценено: <b>${fmtM2(tt.sum)}</b> (${tt.cnt} поз.)${tt.unev ? ` · не оценено: ${tt.unev}` : ""}</div>
        ${withVat ? `<div>НДС 19 %: <b>${fmtM2(vatOf(tt.sum))}</b> · Итого с НДС: <b>${fmtM2(Math.round((tt.sum + vatOf(tt.sum)) * 100) / 100)}</b></div>` : `<div>Цены — плановая себестоимость без НДС</div>`}
      </div>
      <div class="modal-actions">
        <button class="btn-primary" id="${isKp ? "kp-export" : "bud-export"}" type="button">Выгрузить PDF</button>
      </div>`;
  }
  mountModal(`
    <div class="modal${(d.kp || d.budget) ? " wide" : ""}">
      <div class="modal-title">Карточка документа</div>
      <div class="tbl-wrap"><table class="tbl tbl-fields">
        <tbody>
          ${frow("Название", esc(d.name))}
          ${frow("Тип", esc(d.type))}
          ${frow("Направление", dirNoun[d.dir] || "—")}
          ${frow(partyLabel, plain(d.party))}
          ${frow("Дата документа", plain(d.date_doc ? fmtDate(d.date_doc) : null))}
          ${d.dir !== "int" ? frow(dateLabel, plain(d.date ? fmtDate(d.date) : null)) : ""}
          ${frow("Статус", `<span class="chip ${st.cls}">${esc(st.label)}</span>`)}
          ${hasVersion ? frow("Версия", plain(d.version)) : ""}
          ${d.file ? frow("Вложение", esc(d.file)) : ""}
          ${d.uploaded_by ? frow("Загрузил сотрудник", esc(d.uploaded_by)) : ""}
          ${d.link_work ? frow("Связь с работой состава", esc(d.link_work)) : ""}
          ${d.link_task ? frow("Связь с задачей", esc(d.link_task)) : ""}
          ${d.link_op ? frow("Связь с операцией", esc(d.link_op)) : ""}
          ${invRows}
        </tbody>
      </table></div>
      ${kpBlock}
      <div class="note">Жизненный цикл (${dirNoun[d.dir] || "—"}): ${cycle}${isInvoice ? " Оплаченность вычисляется из распределения подтверждённых поступлений (\"Финансовые операции\") и вручную не устанавливается." : ""}</div>
    </div>`);
  const ex = document.getElementById("kp-export");
  if (ex) ex.addEventListener("click", () => exportPdf(kpHtml(p, d)));
  const bex = document.getElementById("bud-export");
  if (bex) bex.addEventListener("click", () => exportPdf(budgetHtml(p, d)));
}

/* ТЗ "Документы": "Добавить документ" — карточка документа; вкладка задаёт направление по умолчанию,
   названия полей и события следуют направлению */
function openAddDoc(p) {
  const works = p.works || [];
  const tasks = p.tasks || [];
  const defDir = docDir !== "all" ? docDir : "in";
  mountModal(`
    <div class="modal">
      <div class="modal-title">Добавить документ</div>
      <div class="form-skel">
        <label>Название</label>
        <input id="dc-name" type="text" autocomplete="off" placeholder="Счёт №3.pdf">
        <label>Тип</label>
        <select id="dc-type">${DOC_TYPES.map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join("")}</select>
        <label>Направление</label>
        <select id="dc-dir">${DOC_DIRS.map((d) => `<option value="${d.id}"${d.id === defDir ? " selected" : ""}>${esc(d.label)}</option>`).join("")}</select>
        <label id="lb-party">От кого</label>
        <input id="dc-party" type="text" autocomplete="off">
        <label>Дата документа</label>
        <input id="dc-date-doc" type="date">
        <label id="lb-date">Дата получения</label>
        <input id="dc-date" type="date">
        <div id="dc-date-hint" class="svod-src" style="margin-top:4px"></div>
        <label id="lb-version">Версия</label>
        <input id="dc-version" type="text" autocomplete="off" value="v1">
        <label>Вложение (имя файла)</label>
        <input id="dc-file" type="text" autocomplete="off" placeholder="document.pdf">
        <label>Загрузил сотрудник (у входящего — не отправитель)</label>
        <input id="dc-uploaded" type="text" autocomplete="off">
        <label>Связь с работой состава</label>
        <select id="dc-work"><option value="">— без связи</option>${works.map((w) => `<option value="${esc(workName(w))}">${esc(workName(w))}</option>`).join("")}</select>
        <label>Связь с задачей</label>
        <select id="dc-task"><option value="">— без связи</option>${tasks.map((t) => `<option value="${esc("№" + t.num + " " + t.title)}">${esc("№" + t.num + " " + t.title)}</option>`).join("")}</select>
        <label>Связь с операцией</label>
        <select id="dc-op"><option value="">— без связи</option>${(p.ops || []).map((o) => `<option value="${esc(fmtDate(o.date) + " · " + o.purpose)}">${esc(fmtDate(o.date) + " · " + o.purpose)}</option>`).join("")}</select>
        <label>Сумма, € (для типа "Счёт" — учёт "К оплате сейчас")</label>
        <input id="dc-amount" type="number" min="0" step="any">
      </div>
      <div class="modal-actions">
        <button class="btn-ghost" id="dc-cancel" type="button">Отмена</button>
        <button class="btn-primary" id="dc-save" type="button">Добавить</button>
      </div>
      <div class="note">Демо: документ добавляется в данные страницы, до перезагрузки. Направление задаёт стартовый статус: входящий — "Получен", исходящий и внутренний — "Черновик". Версия — номер редакции, составленной компанией: есть у исходящих и внутренних; входящие версий не имеют — новая редакция от контрагента регистрируется новым документом.</div>
    </div>`);

  // названия полей следуют выбранному направлению (ТЗ "Документы")
  const relabel = () => {
    const dir = document.getElementById("dc-dir").value;
    const partyLb = { in: "От кого", out: "Кому", int: "Автор" }[dir] || "Корреспондент";
    const dateLb = { in: "Дата получения", out: "Дата отправки" }[dir];
    document.getElementById("lb-party").textContent = partyLb;
    const dateRow = document.getElementById("lb-date");
    const dateInp = document.getElementById("dc-date");
    const hint = document.getElementById("dc-date-hint");
    dateRow.style.display = dateLb ? "" : "none";
    dateInp.style.display = dateLb ? "" : "none";
    hint.style.display = dateLb ? "" : "none";
    if (dateLb) {
      dateRow.textContent = dateLb;
      hint.textContent = dir === "in" ? "Заполняется при регистрации получения" : "Заполняется событием отправки; пустая — не отправлен";
    }
    const verRow = document.getElementById("lb-version");
    const verInp = document.getElementById("dc-version");
    const showVer = dir !== "in";
    verRow.style.display = showVer ? "" : "none";
    verInp.style.display = showVer ? "" : "none";
  };
  document.getElementById("dc-dir").addEventListener("change", relabel);
  relabel();

  document.getElementById("dc-cancel").addEventListener("click", closeAnyModal);
  document.getElementById("dc-save").addEventListener("click", () => {
    const nameEl = document.getElementById("dc-name");
    const name = nameEl.value.trim();
    if (!name) { nameEl.classList.add("input-err"); nameEl.focus(); return; }
    const rd = (id) => document.getElementById(id).value.trim();
    const dir = document.getElementById("dc-dir").value;
    const amount = parseFloat(rd("dc-amount"));
    const doc = {
      name,
      type: document.getElementById("dc-type").value,
      dir,
      party: rd("dc-party"),
      date_doc: rd("dc-date-doc") || null,
      // ТЗ "Документы": дата получения или отправки — отдельное событие; у исходящего без отправки пустая дата
      date: dir === "out" ? (rd("dc-date") || null) : (rd("dc-date") || rd("dc-date-doc") || null),
      status: docStatusByDir[dir] || "draft",
      version: rd("dc-version") || "v1",
      file: rd("dc-file") || null,
      uploaded_by: rd("dc-uploaded") || null,
      link_work: rd("dc-work") || null,
      link_task: rd("dc-task") || null,
      link_op: rd("dc-op") || null,
    };
    if (Number.isFinite(amount)) doc.amount = amount;
    p.docs = [...(p.docs || []), doc];
    logChange(p, "Документы", `добавлен документ "${name}" (${dirNoun[dir]}, ${doc.type})`);
    docDir = dir;
    closeAnyModal();
    render();
  });
  document.getElementById("dc-name").focus();
}

/* ---------------- выгрузка PDF (ТЗ "Финансы", КП) ---------------- */

function exportPdf(html) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

const printCss = `
  body { font-family: Inter, -apple-system, "Segoe UI", system-ui, sans-serif; color: #1e293b; margin: 36px; font-size: 13px; }
  .brand { font-weight: 700; letter-spacing: .12em; font-size: 13px; color: #334155; }
  h1 { font-size: 20px; margin: 10px 0 4px; }
  .meta { color: #64748b; font-size: 12px; margin-bottom: 18px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: .04em; color: #64748b; border-bottom: 1px solid #cbd5e1; padding: 6px 8px; }
  td { border-bottom: 1px solid #e2e8f0; padding: 7px 8px; vertical-align: top; }
  .num { text-align: right; white-space: nowrap; }
  .totals { margin-top: 14px; font-size: 13px; }
  .totals div { margin: 3px 0; }
  .ft { margin-top: 26px; color: #94a3b8; font-size: 11px; }
  @media print { body { margin: 12mm; } }
`;

function printRows(rows) {
  return rows.map((r, i) => `
    <tr>
      <td>${i + 1}</td><td>${esc(r.room)}</td><td>${esc(r.work)}</td><td>${esc(r.unit)}</td>
      <td class="num">${fmtQty(r.qty)}</td>
      <td class="num">${r.price == null ? "—" : fmtM2(r.price)}</td>
      <td class="num">${workCost(r.qty, r.price) == null ? "—" : fmtM2(workCost(r.qty, r.price))}</td>
    </tr>`).join("");
}
function printTotals(rows) {
  const tt = sumRows(rows, "price");
  return `
    <div class="totals">
      <div>Итого (без НДС): <b>${fmtM2(tt.sum)}</b>${tt.unev ? ` · не оценено позиций: ${tt.unev}` : ""}</div>
      <div>НДС 19 %: <b>${fmtM2(vatOf(tt.sum))}</b></div>
      <div>Итого с НДС: <b>${fmtM2(Math.round((tt.sum + vatOf(tt.sum)) * 100) / 100)}</b></div>
    </div>`;
}
const printTable = (rows) => `
  <table>
    <thead><tr><th>#</th><th>Помещение</th><th>Работа</th><th>Ед.</th><th class="num">Кол&#8209;во</th><th class="num">Цена за ед., €</th><th class="num">Стоимость, €</th></thead>
    <tbody>${printRows(rows)}</tbody>
  </table>`;

/* КП — исходящий документ типа "КП" (ТЗ "Финансы", КП); внутренние цены и ставки в выгрузку не попадают */
function kpHtml(p, d) {
  const client = p.client ? p.client.name : "—";
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>${esc(d.name)}</title><style>${printCss}</style></head>
<body>
  <div class="brand">MELESHIN GROUP</div>
  <h1>Коммерческое предложение</h1>
  <div class="meta">Проект: ${esc(p.name)} · Клиент: ${esc(client)} · Версия ${esc(d.version)} · от ${fmtDate(d.date_doc || d.date)}${d.kp && d.kp.extra ? " · дополнительный состав" : ""}</div>
  ${printTable(d.kp ? d.kp.rows : [])}
  ${printTotals(d.kp ? d.kp.rows : [])}
  <div class="ft">Выгрузка из симуляции карточки проекта. Внутренние цены и ставки сотрудников в КП не попадают.</div>
  <script>window.addEventListener("load", function () { window.print(); });</` + `script>
</body></html>`;
}

/* выгрузка зафиксированного Бюджета клиента из вида с зафиксированной версией */
function bcliHtml(p, v) {
  const client = p.client ? p.client.name : "—";
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>Бюджет клиента — ${esc(p.name)}</title><style>${printCss}</style></head>
<body>
  <div class="brand">MELESHIN GROUP</div>
  <h1>Бюджет клиента</h1>
  <div class="meta">Проект: ${esc(p.name)} · Клиент: ${esc(client)} · Версия ${esc(v.version)} · зафиксирован ${fmtDate(v.date)}${v.approved_by ? " · согласование: " + esc(v.approved_by) : ""}</div>
  ${printTable(v.rows)}
  ${printTotals(v.rows)}
  <div class="ft">Зафиксированная версия: значения названий, единиц, количеств, цен и правил расчёта сохранены в самой версии. Выгрузка из симуляции карточки проекта.</div>
  <script>window.addEventListener("load", function () { window.print(); });</` + `script>
</body></html>`;
}

/* выгрузка зафиксированной версии бюджета из карточки документа (ТЗ "Документы", ТЗ "Финансы", версии) */
function budgetHtml(p, d) {
  const b = d.budget;
  const isInt = b.kind === "int";
  const client = p.client ? p.client.name : "—";
  const tt = sumRows(b.rows, "price");
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>${esc(d.name)}</title><style>${printCss}</style></head>
<body>
  <div class="brand">MELESHIN GROUP</div>
  <h1>${isInt ? "Внутренний бюджет" : "Бюджет клиента"}</h1>
  <div class="meta">Проект: ${esc(p.name)}${isInt ? "" : " · Клиент: " + esc(client)} · Версия ${esc(d.version)} · зафиксирован ${fmtDate(d.date_doc || d.date)}${b.approved_by ? " · согласование: " + esc(b.approved_by) : ""}</div>
  ${printTable(b.rows)}
  <div class="totals">
    <div>Итого (без НДС): <b>${fmtM2(tt.sum)}</b>${tt.unev ? ` · не оценено позиций: ${tt.unev}` : ""}</div>
    ${isInt
      ? `<div>Цены — плановая себестоимость без НДС; ставка НДС сохраняется в версии бюджета</div>`
      : `<div>НДС 19 %: <b>${fmtM2(vatOf(tt.sum))}</b></div>
         <div>Итого с НДС: <b>${fmtM2(Math.round((tt.sum + vatOf(tt.sum)) * 100) / 100)}</b></div>`}
  </div>
  <div class="ft">Зафиксированная версия: значения названий, единиц, количеств, цен и правил расчёта сохранены в самой версии. ${isInt ? "Внутренний документ — вне клиентского документооборота." : ""} Выгрузка из симуляции карточки проекта.</div>
  <script>window.addEventListener("load", function () { window.print(); });</` + `script>
</body></html>`;
}

/* ---------------- Финансы (ТЗ "Финансы") ---------------- */

/* Сводный — вычисляемое представление (ТЗ "Финансы", Сводный: 13 показателей) */
function rSvodny(p) {
  if (svodProject !== p) {
    svodProject = p;
    const cliLen = fixList(p, "cli").length;
    svodSel = { int: "work", cli: cliLen ? "f" + (cliLen - 1) : "work" }; // по умолчанию клиентский — последняя согласованная
  }
  const t = finTotals(p);
  // над сводкой — выбранные версии бюджетов и период факта (ТЗ "Финансы", Сводный)
  const selVer = (kind) => (svodSel[kind] === "work" ? null : (fixList(p, kind)[+svodSel[kind].slice(1)] || null));
  const selRows = (kind) => {
    const s = selVer(kind);
    if (s) return s.rows;
    return snapshotRows(p, kind === "int" ? "price_int" : "price_cli");
  };
  const intT = sumRows(selRows("int"), "price");
  const cliT = sumRows(selRows("cli"), "price");
  const verName = (kind, def) => {
    const s = selVer(kind);
    return s ? `${esc(s.short)} ${esc(s.version)} (${fmtDate(s.date)})` : def;
  };
  // разница показывается только на одинаковом составе выбранных версий (ТЗ "Финансы", Сводный п.3)
  const wids = (rows) => rows.map((r) => r.wid).sort((a, b) => a - b).join(",");
  const comparable = wids(selRows("int")) === wids(selRows("cli"));
  const lastCli = snap(p, "client");
  const unpaidBudget = lastCli ? Math.round((sumRows(lastCli.rows, "price").sum - t.income) * 100) / 100 : null;
  const verOpts = (kind) => `<option value="work"${svodSel[kind] === "work" ? " selected" : ""}>рабочая редакция</option>`
    + fixList(p, kind).map((v, i) => `<option value="f${i}"${svodSel[kind] === "f" + i ? " selected" : ""}>${esc(v.short)} ${esc(v.version)} (${fmtDate(v.date)})</option>`).join("");
  const state = [];
  if (intT.unev || cliT.unev) state.push(`позиций без цены: внутренний бюджет ${intT.unev}, бюджет клиента ${cliT.unev}`);
  if (t.unapprCnt) state.push(`записей табеля не утверждено: ${t.unapprCnt} (${t.hoursUnappr} ч)`);
  if (t.hoursNoRate) state.push(`труд без ставки: ${t.hoursNoRate} ч`);
  if (t.unconfCnt) state.push(`операций не подтверждено: ${t.unconfCnt} (${fmtM2(t.unconf)})`);
  const row = (i, name, value, src) => `
    <tr><td>${i}</td><td>${name}</td><td class="num"><b>${value}</b></td><td class="svod-src">${src}</td></tr>`;
  return `
    <div class="note fin-note">
      Внутренний бюджет: <select class="flt-sel" id="svod-int">${verOpts("int")}</select>
      · Бюджет клиента: <select class="flt-sel" id="svod-cli">${verOpts("cli")}</select>
      · Период факта: весь проект · Цены — без НДС
    </div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>#</th><th>Показатель</th><th class="num">Значение</th><th>Источник</th></tr></thead>
      <tbody>
        ${row(1, "Плановая себестоимость", fmtM2(intT.sum), `итог выбранной версии Внутреннего бюджета · ${verName("int", "рабочая редакция")} · без НДС${intT.unev ? ` · не оценено: ${intT.unev} поз.` : ""}`)}
        ${row(2, "Стоимость клиенту", fmtM2(cliT.sum), `итог выбранной версии Бюджета клиента · ${verName("cli", "рабочая редакция")} · по умолчанию — последняя согласованная${cliT.unev ? ` · не оценено: ${cliT.unev} поз.` : ""}`)}
        ${comparable
          ? row(3, "Плановая разница цены и затрат", fmtM2(Math.round((cliT.sum - intT.sum) * 100) / 100), "строка 2 − строка 1 · одинаковый состав, объём и налоговая база")
          : row(3, "Плановая разница цены и затрат", `<span class="muted">—</span>`, "выбранные версии несопоставимы: разные составы позиций")}
        ${row(4, "Фактические часы", t.hoursAppr + " ч", `утверждённые записи табелей${t.unapprCnt ? ` · не утверждено: ${t.unapprCnt} зап. (${t.hoursUnappr} ч)` : ""}`)}
        ${row(5, "Стоимость труда по табелям", fmtM2(t.costAppr), `утверждённые часы × ставка даты работы${t.hoursNoRate ? ` · без ставки: ${t.hoursNoRate} ч` : ""}`)}
        ${row(6, "Поступления от клиента", fmtM2(t.income), "подтверждённые поступления за период с учётом возвратов клиенту")}
        ${row(7, "Денежные расходы проекта", fmtM2(t.expense), `подтверждённые расходы за период с учётом возвратов от контрагентов${t.transfers ? ` · внутренние переводы (${fmtM2(t.transfers)}) не учтены` : " · внутренние переводы не учитываются"}`)}
        ${row(8, "Денежный баланс проекта", fmtM2(Math.round((t.income - t.expense) * 100) / 100), "строка 6 − строка 7 за один период")}
        ${row(9, "Не оплачено по счетам", fmtM2(t.unpaidInvoices), "выставленные и отправленные счета − распределённые по ним подтверждённые поступления")}
        ${row(10, "Аванс клиента", fmtM2(t.advance), "подтверждённые поступления, не распределённые по счетам, за вычетом возвратов клиенту")}
        ${row(11, "К оплате сейчас", fmtM2(t.toPayNow), "строка 9 − строка 10, не меньше нуля; излишек аванса остаётся в строке 10")}
        ${row(12, "Не оплачено по бюджету клиента",
          unpaidBudget == null ? `<span class="muted">—</span>` : fmtM2(unpaidBudget),
          lastCli
            ? `последняя согласованная версия (${esc(lastCli.short)} ${esc(lastCli.version)}, ${fmtDate(lastCli.date)}) − строка 6 · неоплаченная часть договорённостей, не наступивший долг`
            : "нет согласованной версии Бюджета клиента — показатель не считается")}
        ${row(13, "Состояние данных", state.length ? state.join("; ") : "неполноты не выявлены", "источники неполноты показателей")}
      </tbody>
    </table></div>
    <div class="note">Сводный — вычисляемое представление: каждый показатель раскрывается до источника (виды ниже). Показатели расчётов с клиентом ("Не оплачено по счетам", "К оплате сейчас", "Аванс клиента") денежными потоками не являются: первые два — требования по выставленным счетам, третий — полученные деньги, не закрытые счетами. Разница рассчитана по включённому составу работ и не является "прибылью проекта". Стоимость труда и денежные расходы показываются отдельно: полной фактической себестоимости (материалы, принятые работы подрядчиков) расчёт пока не даёт.</div>`;
}

/* ТЗ "Финансы", версии: фиксация внутреннего бюджета действием "Зафиксировать" */
function fixInternal(p) {
  const fl = fixList(p, "int");
  const v = {
    version: "v" + (fl.length + 1),
    label: "Внутренний бюджет",
    short: "Внутренний",
    date: todayIso(),
    vat: 0.19,
    rows: snapshotRows(p, "price_int"),
  };
  p.fix_int = [...fl, v];
  budgetVer = "f" + (p.fix_int.length - 1);
  // зафиксированная версия — внутренний документ с выгрузкой (ТЗ "Документы", ТЗ "Финансы", версии)
  p.docs = [...(p.docs || []), {
    name: "Внутренний бюджет " + v.version + ".pdf",
    type: "Внутренний бюджет",
    dir: "int",
    party: p.pm ? p.pm.name : "",
    date: v.date,
    date_doc: v.date,
    status: "approved",
    version: v.version,
    budget: { kind: "int", rows: v.rows, label: v.label },
  }];
  logChange(p, "Финансы", `Внутренний бюджет зафиксирован: ${v.version} (${fmtDate(v.date)}); предыдущие версии сохранены; версия добавлена в "Документы" (внутренний)`);
  render();
}

/* ТЗ "Финансы", версии: согласование Бюджета клиента регистрируется событием */
function openAgree(p) {
  mountModal(`
    <div class="modal">
      <div class="modal-title">Согласование Бюджета клиента</div>
      <div class="form-skel">
        <label>Кто согласовал</label>
        <input id="ag-who" type="text" autocomplete="off" value="${esc(p.client ? p.client.name : "")}">
        <label>Когда</label>
        <input id="ag-when" type="date" value="${todayIso()}">
        <label>Где подтверждение</label>
        <input id="ag-where" type="text" autocomplete="off" placeholder="электронная почта, встреча, мессенджер">
      </div>
      <div class="modal-actions">
        <button class="btn-ghost" id="ag-cancel" type="button">Отмена</button>
        <button class="btn-primary" id="ag-save" type="button">Зарегистрировать согласование</button>
      </div>
      <div class="note">Зафиксируется новая версия Бюджета клиента: текущий состав, количества и клиентские цены рабочей редакции. Предыдущие версии не изменяются; после согласования изменения копятся в рабочей редакции с признаком "изменено относительно согласованного".</div>
    </div>`);
  document.getElementById("ag-cancel").addEventListener("click", closeAnyModal);
  document.getElementById("ag-save").addEventListener("click", () => {
    const whoEl = document.getElementById("ag-who");
    const who = whoEl.value.trim();
    if (!who) { whoEl.classList.add("input-err"); whoEl.focus(); return; }
    const when = document.getElementById("ag-when").value || todayIso();
    const where = document.getElementById("ag-where").value.trim();
    const fl = fixList(p, "cli");
    const v = {
      version: "v" + (fl.length + 1),
      label: "Согласованный Бюджет клиента",
      short: "Согласованный",
      date: when,
      approved_by: who + (where ? ", " + where : ""),
      vat: 0.19,
      rows: snapshotRows(p, "price_cli"),
    };
    p.fix_cli = [...fl, v];
    budgetVer = "f" + (p.fix_cli.length - 1);
    // согласованная версия — исходящий документ типа "Бюджет клиента" (ТЗ "Документы");
    // согласование ≠ отправка: пустая дата отправки, статус "Черновик"
    p.docs = [...(p.docs || []), {
      name: "Бюджет клиента " + v.version + ".pdf",
      type: "Бюджет клиента",
      dir: "out",
      party: p.client ? p.client.name : "",
      date: null,
      date_doc: v.date,
      status: "draft",
      version: v.version,
      budget: { kind: "cli", rows: v.rows, label: v.label, approved_by: v.approved_by },
    }];
    logChange(p, "Финансы", `Согласование Бюджета клиента зарегистрировано: ${v.version} — ${who}, ${fmtDate(when)}${where ? " (" + where + ")" : ""}; версия добавлена в "Документы" (исходящий, черновик)`);
    closeAnyModal();
    render();
  });
  document.getElementById("ag-who").focus();
}

/* ТЗ "Финансы", КП: "Сформировать КП" — отбор позиций рабочей редакции */
function openKpForm(p, mode) {
  const m = mode || "all";
  const delta = clientDelta(p);
  const evaluated = (p.works || []).filter((w) => w.price_cli != null);
  const addedIds = delta ? [...delta.flags.entries()].filter(([, v]) => v === "added").map(([k]) => k) : [];
  const defChecked = (w) => (m === "extra" ? addedIds.includes(w.id) : true);

  const rowsHtml = evaluated.map((w) => `
    <label class="chk-row">
      <input type="checkbox" data-wid="${w.id}"${defChecked(w) ? " checked" : ""}>
      <span class="chk-name">${esc(workName(w))}</span>
      <span class="muted">${esc(w.unit)}</span>
      <span class="num">${fmtQty(w.qty)}</span>
      <span class="num">${fmtM2(w.price_cli)}</span>
      <span class="num chk-cost"><b>${fmtM2(workCost(w.qty, w.price_cli))}</b></span>
    </label>`).join("");

  mountModal(`
    <div class="modal wide">
      <div class="modal-title">Сформировать КП</div>
      <div class="subchips">
        <button class="fchip${m === "all" ? " active" : ""}" id="kp-mode-all" type="button"${evaluated.length ? "" : " disabled"}>Все оценённые позиции</button>
        <button class="fchip${m === "extra" ? " active" : ""}" id="kp-mode-extra" type="button"${addedIds.length ? "" : " disabled"}>Дополнительный состав (${addedIds.length})</button>
      </div>
      ${evaluated.length
        ? `<div class="chk-list">${rowsHtml}</div>
           <div class="kp-total" id="kp-total"></div>`
        : `<div class="empty">Оценённых позиций в рабочей редакции нет — задайте клиентские цены в Бюджете клиента</div>`}
      <div class="modal-actions">
        <button class="btn-ghost" id="kp-cancel" type="button">Отмена</button>
        <button class="btn-primary" id="kp-create" type="button"${evaluated.length ? "" : " disabled"}>Создать КП</button>
      </div>
      <div class="note">КП формируется из Бюджета клиента по клиентским ценам. По умолчанию выбраны все оценённые позиции рабочей редакции; "Дополнительный состав" — позиции вне согласованного Бюджета клиента (признак "добавлено"). Созданному КП назначается версия и жизненный цикл исходящего (Черновик → Готов к отправке → Отправлен); внутренние цены и ставки сотрудников в выгрузку не попадают.</div>
    </div>`);

  const recount = () => {
    const sel = [...document.querySelectorAll(".chk-list input[data-wid]:checked")].map((c) => c.dataset.wid);
    const rows = evaluated.filter((w) => sel.includes(String(w.id)));
    const tt = sumRows(rows.map((w) => ({ qty: w.qty, price: w.price_cli })), "price");
    const el = document.getElementById("kp-total");
    if (el) el.innerHTML = `
      <div>Выбрано позиций: <b>${rows.length}</b> из ${evaluated.length}</div>
      <div>Итого (без НДС): <b>${fmtM2(tt.sum)}</b> · НДС 19 %: <b>${fmtM2(vatOf(tt.sum))}</b> · Итого с НДС: <b>${fmtM2(Math.round((tt.sum + vatOf(tt.sum)) * 100) / 100)}</b></div>`;
  };
  document.querySelectorAll(".chk-list input[data-wid]").forEach((c) => c.addEventListener("change", recount));
  recount();

  document.getElementById("kp-cancel").addEventListener("click", closeAnyModal);
  document.getElementById("kp-mode-all").addEventListener("click", () => openKpForm(p, "all"));
  document.getElementById("kp-mode-extra").addEventListener("click", () => openKpForm(p, "extra"));
  document.getElementById("kp-create").addEventListener("click", () => {
    const sel = [...document.querySelectorAll(".chk-list input[data-wid]:checked")].map((c) => c.dataset.wid);
    const chosen = evaluated.filter((w) => sel.includes(String(w.id)));
    if (!chosen.length) return;
    const rows = chosen.map((w) => ({ wid: w.id, room: w.room, work: w.work, unit: w.unit, qty: w.qty, price: w.price_cli }));
    const version = "v" + ((p.docs || []).filter((d) => d.type === "КП").length + 1);
    const doc = {
      name: "КП " + version + " — " + p.name,
      type: "КП",
      dir: "out",
      party: p.client ? p.client.name : "",
      date_doc: todayIso(),
      date: null,
      status: "draft",
      version,
      kp: { rows, extra: m === "extra" },
    };
    p.docs = [...(p.docs || []), doc];
    const tt = sumRows(rows, "price");
    logChange(p, "Финансы", `сформировано КП ${version}${m === "extra" ? " (дополнительный состав)" : ""}: ${rows.length} поз., ${fmtM2(tt.sum)} без НДС`);
    closeAnyModal();
    openDocCard(p, doc);
  });
}

/* Два бюджета: общий состав, разные цены (ТЗ "Финансы", бюджеты — ТЗ "Финансы", версии) */
function rBudget(p, kind) {
  const isInt = kind === "int";
  const fl = fixList(p, kind);
  const fixedIdx = budgetVer.startsWith("f") ? parseInt(budgetVer.slice(1), 10) : -1;
  const s = fixedIdx >= 0 && fixedIdx < fl.length ? fl[fixedIdx] : null;
  const working = !s;
  const priceKey = isInt ? "price_int" : "price_cli";
  const delta = !isInt ? clientDelta(p) : null;
  const cols = `<th>#</th><th>Помещение</th><th>Работа</th><th>Ед.</th><th class="num">Кол&#8209;во</th><th class="num">Цена за ед., €</th><th class="num">Стоимость, €</th>`;

  let table;
  let summaryRows = "";
  let actions = "";

  if (working) {
    const rows = (p.works || []).map((w, i) => {
      const cost = workCost(w.qty, w[priceKey]);
      const flag = delta && delta.flags.get(w.id);
      const dchip = flag ? `<span class="delta-chip delta-${flag}">${flag === "added" ? "добавлено" : "изменено"}</span>` : "";
      // ТЗ "Основное", состав: постоянный признак "требует проверки цены" — до ввода цены в этом бюджете
      const checkChip = w.price_check ? `<span class="delta-chip delta-check">требует проверки цены</span>` : "";
      return `<tr>
        <td>${i + 1}</td><td>${esc(w.room)}</td><td>${esc(w.work)}${dchip}${checkChip}</td><td>${esc(w.unit)}</td><td class="num">${fmtQty(w.qty)}</td>
        <td class="num"><input class="price-inp" data-wid="${w.id}" type="number" min="0" step="any" placeholder="—${isInt ? " (себестоимость)" : ""}" value="${w[priceKey] == null ? "" : w[priceKey]}" title="${isInt ? "Плановая себестоимость единицы" : "Цена продажи единицы"}"></td>
        <td class="num">${cost == null ? `<span class="muted">—</span>` : fmtM2(cost)}</td>
      </tr>`;
    }).join("");
    const tt = sumRows(p.works || [], priceKey);
    summaryRows = `
      <div>Оценено: <b>${fmtM2(tt.sum)}</b> (${tt.cnt} поз.)</div>
      ${tt.unev ? `<div>Не оценено: ${tt.unev} поз. — пустая цена означает "не оценено", нулевая — осознанное значение; полный итог проекта не показывается</div>` : ""}`;
    if (isInt) {
      summaryRows += `
        <div>Цены — плановая себестоимость без НДС; ставка НДС сохраняется в версии бюджета</div>`;
    } else {
      summaryRows += `
        <div>НДС 19 %: <b>${fmtM2(vatOf(tt.sum))}</b> · Итого с НДС: <b>${fmtM2(Math.round((tt.sum + vatOf(tt.sum)) * 100) / 100)}</b> (цены — без НДС; ставка сохраняется в версии бюджета)</div>`;
      if (delta) {
        const cliSnap = snap(p, "client");
        summaryRows += `<div>Изменение к согласованной версии (${esc(cliSnap.version)}, ${fmtDate(cliSnap.date)}): <b>${delta.delta >= 0 ? "+" : ""}${fmtM2(delta.delta)}</b></div>`;
        if (delta.excluded.length) summaryRows += `<div>Исключено относительно согласованной: ${delta.excluded.map((r) => `"${esc(r.room)} / ${esc(r.work)}"`).join(", ")} — позиция сохранена в зафиксированной версии</div>`;
      }
    }
    actions = `<div class="budget-actions">
        ${isInt
          ? `<button class="btn-ghost" id="btn-fix-int" type="button">Зафиксировать</button>`
          : `<button class="btn-ghost" id="btn-agree-cli" type="button">Согласовать</button>
             <button class="btn-primary" id="btn-make-kp" type="button">Сформировать КП</button>`}
      </div>`;
    table = `
      <div class="note fin-note">${isInt
        ? 'Состав и количества — из вкладки "Основное"; здесь меняется только цена — плановая себестоимость единицы. Клиентская цена хранится независимо и не пересчитывается от внутренней. Действие "Зафиксировать" создаёт новую неизменяемую версию.'
        : 'Состав и количества — из вкладки "Основное"; здесь меняется только цена — цена продажи единицы. Изменение внутренней себестоимости не меняет согласованную цену клиенту. Согласование регистрируется событием; "Сформировать КП" открывает отбор позиций.'}</div>
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
    actions = !isInt ? `<div class="budget-actions"><button class="btn-ghost" id="btn-export-bcli" data-ver="${fixedIdx}" type="button">Выгрузить PDF</button></div>` : "";
    table = `
      <div class="fix-cap"><b>${esc(s.label)} · ${esc(s.version)}</b> — зафиксирован ${fmtDate(s.date)}${s.approved_by ? ` · согласование: ${esc(s.approved_by)}` : ""}</div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr>${cols}</tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <div class="note">Зафиксированная версия неизменяема: значения названий, единиц, количеств, цен и правил расчёта сохранены в ней самой; редактирование состава и цен рабочей редакции эту версию не изменяет. Новая фиксация — новая версия; история версий доступна переключателями выше.</div>`;
  }

  const verChips = fl.length ? `
    <div class="subchips">
      <button class="fchip${working ? " active" : ""}" data-bver="work" type="button">Рабочая редакция</button>
      ${fl.map((v, i) => `<button class="fchip${!working && i === fixedIdx ? " active" : ""}" data-bver="f${i}" type="button">${esc(v.short)} ${esc(v.version)} (${fmtDate(v.date)})</button>`).join("")}
    </div>` : `
    <div class="subchips"><span class="fchip active">Рабочая редакция</span></div>`;

  return verChips + actions + table + `<div class="budget-summary">${summaryRows}</div>`;
}

/* Фактический труд по табелям (ТЗ "Финансы", табели) */
function rLabor(p) {
  const list = p.timesheets || [];
  const works = p.works || [];
  const linked = (r) => (r.work_id ? works.find((w) => w.id === r.work_id) : null);
  const body = list.map((r, i) => {
    const w = linked(r);
    return `
    <tr>
      <td>${i + 1}</td>
      <td class="muted">${fmtDate(r.date)}</td>
      <td>${esc(r.person)}</td>
      <td>${esc(r.work)}${w
        ? `<div class="svod-src">в составе работ: ${esc(workName(w))}</div>`
        : ` <span class="delta-chip delta-muted">Не распределено по работам</span>`}</td>
      <td class="num">${fmtQty(r.hours)}</td>
      <td class="num">${r.rate == null ? `<span class="muted">—</span>` : fmtM2(r.rate)}</td>
      <td class="num">${r.rate == null ? `<span class="muted">—</span>` : fmtM2(Math.round(r.hours * r.rate * 100) / 100)}</td>
      <td><span class="chip ${r.status === "approved" ? "chip-doc-approved" : "chip-doc-draft"}">${r.status === "approved" ? "Утверждён" : "Черновик"}</span></td>
    </tr>`;
  }).join("");
  const t = finTotals(p);
  const unlinked = list.filter((r) => r.status === "approved" && !linked(r)).reduce((s, r) => s + r.hours, 0);
  return `
    ${list.length
      ? `<div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>#</th><th>Дата работы</th><th>Сотрудник</th><th>Работа или назначение</th><th class="num">Часы</th><th class="num">Ставка, €/ч</th><th class="num">Стоимость, €</th><th>Статус табеля</th></tr></thead>
          <tbody>${body}</tbody>
        </table></div>`
      : `<div class="empty">Записей табелей по проекту нет</div>`}
    <div class="budget-summary">
      <div>Утверждено: <b>${fmtQty(t.hoursAppr)} ч</b> · <b>${fmtM2(t.costAppr)}</b>${t.unapprCnt ? ` · Не утверждено: ${t.unapprCnt} зап. (${fmtQty(t.hoursUnappr)} ч)` : ""}${t.hoursNoRate ? ` · Без ставки: ${fmtQty(t.hoursNoRate)} ч — стоимость не показывается, почасовая оценка не выдумывается` : ""}</div>
      ${unlinked ? `<div>Не распределено по работам: <b>${fmtQty(unlinked)} ч</b> утверждённых — труд по проекту вне позиций состава</div>` : ""}
    </div>
    <div class="note">Часы исправляются в исходном табеле — вкладка показывает записи проекта, одна запись учитывается один раз. Стоимость = утверждённые часы × ставка, действовавшая в дату работы; изменение текущего справочника ставок прошлую оценку не переписывает. Распределение по работам состава — признак записи табеля; часы без связи относятся к проекту в целом.</div>`;
}

/* Финансовые операции (ТЗ "Финансы", операции: колонки # / Дата / Тип / Назначение / Контрагент или сотрудник / Сумма / Способ оплаты / Статус / Документ) */
const typeInfo = (o) => {
  const tp = opType(o);
  if (tp === "income") return { label: "Поступление", cls: "dir-in", sign: "+", num: "pos" };
  if (tp === "expense") return { label: "Расход", cls: "dir-out", sign: "−", num: "neg" };
  if (tp === "refund") return o.dir === "in"
    ? { label: "Возврат от контрагента", cls: "dir-in", sign: "+", num: "pos" }
    : { label: "Возврат клиенту", cls: "dir-out", sign: "−", num: "neg" };
  return { label: "Внутренний перевод", cls: "muted", sign: "", num: "muted" };
};

function rOps(p) {
  const list = p.ops || [];
  const body = list.map((o, i) => {
    const ti = typeInfo(o);
    return `
    <tr class="row-click" data-op="${i}" title="Открыть карточку операции">
      <td>${i + 1}</td>
      <td class="muted">${fmtDate(o.date)}</td>
      <td><span class="${ti.cls}">${ti.label}</span></td>
      <td>${esc(o.purpose)}${o.refund_of ? `<div class="svod-src">возврат к операции: ${esc(o.refund_of)}</div>` : ""}</td>
      <td>${esc(o.party)}</td>
      <td class="num ${ti.num}">${ti.sign ? ti.sign + " " : ""}${fmtM2(o.amount)}</td>
      <td>${esc(o.method)}</td>
      <td><span class="chip ${o.status === "confirmed" ? "chip-doc-approved" : "chip-doc-ready"}">${o.status === "confirmed" ? "Подтверждена" : "Не подтверждена"}</span></td>
      <td class="muted">${esc(o.doc || "—")}</td>
    </tr>`;
  }).join("");
  const t = finTotals(p);
  return `
    <div class="budget-actions"><button class="btn-primary" id="btn-add-op" type="button">Добавить операцию</button></div>
    ${list.length
      ? `<div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>#</th><th>Дата</th><th>Тип</th><th>Назначение</th><th>Контрагент или сотрудник</th><th class="num">Сумма, €</th><th>Способ оплаты</th><th>Статус</th><th>Документ</th></tr></thead>
          <tbody>${body}</tbody>
        </table></div>`
      : `<div class="empty">Операций по проекту нет</div>`}
    <div class="budget-summary">
      <div>Подтверждено — поступления: <b>${fmtM2(t.income)}</b> · расходы: <b>${fmtM2(t.expense)}</b> — обе стороны с учётом возвратов${t.transfers ? ` · внутренние переводы: <b>${fmtM2(t.transfers)}</b> — в денежных итогах не участвуют` : ""}${t.unconfCnt ? ` · Не подтверждено: ${t.unconfCnt} оп. (${fmtM2(t.unconf)}) — в денежные итоги не входит` : ""}</div>
      <div>Распределено по счетам клиента: <b>${fmtM2(t.incomeDistributed)}</b> · аванс клиента (нераспределённый остаток): <b>${fmtM2(t.advance)}</b></div>
      <div>Пример без двойного счёта: труд 120 € по табелю и выплата 120 € — это 120 € труда и 120 € денежного расхода, а не 240 € затрат.</div>
    </div>
    <div class="note">Реестр операций общий с разделом "Финансы" — здесь отбор по проекту; создание записи из карточки не создаёт вторую копию. Типы операций: поступление, расход, возврат, внутренний перевод. Возврат связывается с исходной операцией и в итогах уменьшает её сторону — поступления или расходы, — не создавая новой; внутренний перевод между счетами компании в денежных итогах проекта не участвует. Подтверждённое поступление распределяется по счетам клиента — одним поступлением закрываются несколько счетов; нераспределённый остаток — аванс клиента. Новая запись — "Не подтверждена" и в денежные итоги не входит. После подтверждения сумма не заменяется незаметно: исправление — исходная операция плюс связанная корректировка.</div>`;
}

/* ТЗ "Финансы", операции: карточка операции — создание и просмотр; тип задаёт модель, направление выводится из типа */
function openOpCard(p, o) {
  const isNew = !o;
  const METHODS = ["Банковский перевод", "Карта", "Внутренний перевод", "Наличные"];
  // исходные операции для возврата: подтверждённые поступления и расходы
  const sources = (p.ops || []).filter((x) => x.status === "confirmed" && (opType(x) === "income" || opType(x) === "expense"));
  const curType = isNew ? "expense" : opType(o);
  mountModal(`
    <div class="modal">
      <div class="modal-title">${isNew ? "Добавить операцию" : "Карточка операции"}</div>
      <div class="form-skel">
        <label>Дата</label>
        <input id="op-date" type="date" value="${isNew ? todayIso() : isoDay(o.date)}">
        <label>Тип операции</label>
        <select id="op-type">${OP_TYPES.map((t) => `<option value="${t.id}"${curType === t.id ? " selected" : ""}${t.id === "refund" && !sources.length ? " disabled" : ""}>${esc(t.label)}</option>`).join("")}</select>
        <div id="op-refund-row" style="display:none">
          <label>Исходная операция</label>
          <select id="op-refund">${sources.map((x) => `<option value="${esc(x.purpose)}"${!isNew && o.refund_of === x.purpose ? " selected" : ""}>${esc(fmtDate(x.date) + " · " + x.purpose + " · " + fmtM2(x.amount))}</option>`).join("")}</select>
          <div class="svod-src" style="margin-top:4px">Возврат уменьшает сторону исходной операции — поступления или расходы, — не создавая новой</div>
        </div>
        <div id="op-transfer-row" style="display:none">
          <div class="svod-src" style="margin-top:14px">Внутренний перевод между счетами компании: в денежных итогах проекта не участвует — деньги компании при нём не меняются</div>
        </div>
        <label>Назначение</label>
        <input id="op-purpose" type="text" autocomplete="off" value="${esc(isNew ? "" : o.purpose)}">
        <label>Контрагент или сотрудник</label>
        <input id="op-party" type="text" autocomplete="off" value="${esc(isNew ? "" : o.party)}">
        <label>Сумма, €</label>
        <input id="op-amount" type="number" min="0" step="any" value="${isNew ? "" : o.amount}">
        <label>Способ оплаты</label>
        <select id="op-method">${METHODS.map((m) => `<option${!isNew && o.method === m ? " selected" : ""}>${esc(m)}</option>`).join("")}</select>
        ${!isNew && o.doc ? `<div class="svod-src" style="margin-top:14px">Распределение по счетам: "${esc(o.doc)}" — задаётся в счёте, а не в операции</div>` : ""}
        ${!isNew && o.status !== "confirmed" ? `<div class="svod-src" style="margin-top:14px">Статус: не подтверждена — в денежные итоги не входит</div>` : ""}
      </div>
      <div class="modal-actions">
        ${!isNew && o.status !== "confirmed" ? `<button class="btn-ghost" id="op-confirm" type="button">Подтвердить</button>` : ""}
        <span class="spacer" style="flex:1"></span>
        <button class="btn-ghost" id="op-cancel" type="button">Отмена</button>
        <button class="btn-primary" id="op-save" type="button">${isNew ? "Добавить" : "Сохранить"}</button>
      </div>
      <div class="note">Демо: операция добавляется в данные страницы, до перезагрузки. Направление следует из типа: поступление — приход, расход — выплата, возврат — исходная операция. Новая запись — "Не подтверждена"; подтверждение — отдельное действие. После подтверждения исправление — исходная операция плюс связанная корректировка.</div>
    </div>`);

  const relayout = () => {
    const tp = document.getElementById("op-type").value;
    document.getElementById("op-refund-row").style.display = tp === "refund" ? "" : "none";
    document.getElementById("op-transfer-row").style.display = tp === "transfer" ? "" : "none";
  };
  document.getElementById("op-type").addEventListener("change", relayout);
  relayout();

  document.getElementById("op-cancel").addEventListener("click", closeAnyModal);
  const confirmBtn = document.getElementById("op-confirm");
  if (confirmBtn) confirmBtn.addEventListener("click", () => {
    o.status = "confirmed";
    logChange(p, "Финансы", `операция подтверждена: ${fmtDate(o.date)} ${o.purpose}, ${fmtM2(o.amount)}`);
    closeAnyModal();
    render();
  });
  document.getElementById("op-save").addEventListener("click", () => {
    const purposeEl = document.getElementById("op-purpose");
    const purpose = purposeEl.value.trim();
    if (!purpose) { purposeEl.classList.add("input-err"); purposeEl.focus(); return; }
    const amountEl = document.getElementById("op-amount");
    const amount = parseFloat(amountEl.value);
    if (!Number.isFinite(amount)) { amountEl.classList.add("input-err"); amountEl.focus(); return; }
    const rd = (id) => document.getElementById(id).value.trim();
    const tp = document.getElementById("op-type").value;
    let dir = tp === "income" ? "in" : tp === "expense" ? "out" : null;
    const rec = {
      date: rd("op-date") || todayIso(),
      type: tp,
      dir,
      purpose,
      party: rd("op-party"),
      amount,
      method: document.getElementById("op-method").value,
    };
    if (tp === "refund") {
      const refundEl = document.getElementById("op-refund");
      if (!refundEl.value) { refundEl.classList.add("input-err"); refundEl.focus(); return; }
      rec.refund_of = refundEl.value;
      const src = sources.find((x) => x.purpose === rec.refund_of);
      rec.dir = src && src.dir === "in" ? "out" : "in"; // возврат клиенту — выплата, возврат от контрагента — приход
    }
    if (isNew) {
      rec.status = "unconfirmed";
      p.ops = [...(p.ops || []), rec];
      logChange(p, "Финансы", `добавлена операция (${typeInfo(rec).label.toLowerCase()}): ${rec.purpose}, ${fmtM2(rec.amount)} — не подтверждена`);
    } else {
      Object.assign(o, rec);
      logChange(p, "Финансы", `операция изменена: ${o.purpose}, ${fmtM2(o.amount)}`);
    }
    closeAnyModal();
    render();
  });
  document.getElementById("op-purpose").focus();
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

/* ---------------- заглушка раздела (ТЗ "Карточка проекта", табы: неописанный таб показывается с состоянием [ ]) ---------------- */

function rPending(specName, extra) {
  return `<div class="pending">
      <div class="mark">[ ]</div>
      <div>Раздел в ТЗ помечен [ ] — наполнение ждёт дополнения ТЗ</div>
      <div class="ref">ТЗ "${esc(specName)}"${extra ? ". " + esc(extra) : ""}</div>
    </div>`;
}

/* ---------------- определение табов (ТЗ "Карточка проекта", табы: все восемь) ----------------
   Идентификатор таба = слаг раздела из реестра ТЗ (tz/registry.md) */

const TABS = [
  { id: "general", label: "Основное", render: rMain },
  { id: "facility", label: "Объект", render: rObject },
  { id: "tasks", label: "Задачи", render: rTasks },
  { id: "documents", label: "Документы", render: rDocs },
  { id: "schedule", label: "График", render: () => rPending("Карточка проекта — График", "Место вкладки сохранено; содержание — отдельное ТЗ") },
  { id: "finance", label: "Финансы", render: rFinance },
  { id: "tender", label: "Тендер", render: () => rPending("Карточка проекта — Тендер") },
  { id: "client-portal", label: "Кабинет клиента", render: () => rPending("Карточка проекта — Кабинет клиента") },
];

/* прежние идентификаторы табов (транслитерации) — перенаправляются на слаги реестра */
const TAB_ALIASES = {
  osnovnoe: "general",
  obekt: "facility",
  "foto-video": "facility",
  zadachi: "tasks",
  dokumenty: "documents",
  grafik: "schedule",
  finansy: "finance",
  "kabinet-klienta": "client-portal",
};
const canonTab = (id) => (TABS.some((t) => t.id === id) ? id : (TAB_ALIASES[id] || null));

/* ---------------- шапка карточки (ТЗ "Карточка проекта", шапка) ---------------- */

function headCard(p) {
  // ТЗ "Карточка проекта", шапка: Название (п.2) | Этап (п.3) + Состояние (п.4) + Даты работ (п.11-12) | участники (п.5-8) и каналы (п.9-10)
  // Реквизиты шапки редактируются кнопкой "Редактировать" в табе "Основное" (ТЗ "Основное", окно реквизитов)
  const personRow = (label, pp) => (pp ? `<tr><td class="lbl">${label}:</td><td>${esc(pp.name)}</td><td>${esc(pp.phone || "")}</td><td>${esc(pp.tg || "")}</td></tr>` : "");
  const channelRow = (label, v) => (v ? `<tr><td class="lbl">${label}:</td><td colspan="3">${esc(v)}</td></tr>` : "");
  const dates = [
    p.start_date ? `<span class="pg-dates">Дата начала: ${fmtDate(p.start_date)}</span>` : "",
    p.end_date ? `<span class="pg-dates">Дата окончания: ${fmtDate(p.end_date)}</span>` : "",
  ].filter(Boolean).join("");
  return `
    <div class="pg-head">
      <div class="pg-head-top">
        <div class="pg-title">${esc(p.name)}
          ${stageChip(p.stage)}
          ${stateChip(p.state)}
          ${dates}
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

/* ---------------- страница "Все проекты" (ТЗ "Карточка проекта", переход) ---------------- */

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
      <div class="list-foot">Этап — справочник шапки карточки (ТЗ "Карточка проекта", шапка). Демо-данные: вымышленные проекты.</div>
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
    document.querySelectorAll(".comp-edit [data-f]").forEach((inp) => inp.addEventListener("input", () => {
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
    if (add) add.addEventListener("click", () => { compEditing.push({ id: null, room: ROOM_ANY, work: "", unit: "", qty: null }); render(); });
    const cancel = document.getElementById("comp-cancel");
    if (cancel) cancel.addEventListener("click", () => { compEditing = null; render(); });
    const save = document.getElementById("comp-save");
    if (save) save.addEventListener("click", () => compSave(p));
  }
}

function bindTasks(p) {
  document.querySelectorAll("[data-tf-status]").forEach((b) =>
    b.addEventListener("click", () => { taskFilter.status = b.dataset.tfStatus; render(); }));
  const sel = document.getElementById("tf-assignee");
  if (sel) sel.addEventListener("change", () => { taskFilter.assignee = sel.value; render(); });
  const ov = document.getElementById("tf-overdue");
  if (ov) ov.addEventListener("click", () => { taskFilter.overdue = !taskFilter.overdue; render(); });
  document.querySelectorAll("tr[data-task]").forEach((tr) =>
    tr.addEventListener("click", () => {
      const t = (p.tasks || []).find((x) => String(x.num) === tr.dataset.task);
      if (t) openTaskCard(p, t);
    }));
}

function bindDocs(p) {
  document.querySelectorAll("[data-ddir]").forEach((b) =>
    b.addEventListener("click", () => { docDir = b.dataset.ddir; render(); }));
  document.querySelectorAll("tr[data-doc]").forEach((tr) =>
    tr.addEventListener("click", () => {
      const d = (p.docs || [])[+tr.dataset.doc];
      if (d) openDocCard(p, d);
    }));
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
    const next = Number.isFinite(v) ? v : null;
    if (w[key] !== next) {
      logChange(p, "Финансы", `"${workName(w)}": цена (${key === "price_int" ? "внутренняя" : "клиентская"}) ${w[key] == null ? "не оценена" : fmtM2(w[key])} → ${next == null ? "не оценена" : fmtM2(next)}`);
      w[key] = next;
      if (w.price_check) w.price_check = false; // цена введена заново — проверка выполнена (ТЗ "Основное", состав)
    }
    render();
  }));
  const fixInt = document.getElementById("btn-fix-int");
  if (fixInt) fixInt.addEventListener("click", () => fixInternal(p));
  const agree = document.getElementById("btn-agree-cli");
  if (agree) agree.addEventListener("click", () => openAgree(p));
  const makeKp = document.getElementById("btn-make-kp");
  if (makeKp) makeKp.addEventListener("click", () => openKpForm(p, "all"));
  const exportBcli = document.getElementById("btn-export-bcli");
  if (exportBcli) exportBcli.addEventListener("click", () => {
    const v = fixList(p, "cli")[+exportBcli.dataset.ver];
    if (v) exportPdf(bcliHtml(p, v));
  });
  const addOp = document.getElementById("btn-add-op");
  if (addOp) addOp.addEventListener("click", () => openOpCard(p, null));
  document.querySelectorAll("tr[data-op]").forEach((tr) =>
    tr.addEventListener("click", () => {
      const o = (p.ops || [])[+tr.dataset.op];
      if (o) openOpCard(p, o);
    }));
  const svodInt = document.getElementById("svod-int");
  if (svodInt) svodInt.addEventListener("change", () => { svodSel.int = svodInt.value; render(); });
  const svodCli = document.getElementById("svod-cli");
  if (svodCli) svodCli.addEventListener("change", () => { svodSel.cli = svodCli.value; render(); });
}

/* ---------------- каркас и маршрутизация ---------------- */

const DEFAULT_TAB = "general"; // ТЗ "Карточка проекта", переход: по умолчанию открыт таб "Основное"

function parseHash() {
  const m = location.hash.match(/^#\/([A-Za-z0-9-]+)(?:\/([a-z-]+))?/);
  if (!m) return { page: "list" };
  if (m[1].toLowerCase() === LIST_ROUTE) return { page: "list" };
  const proj = PROJECTS.find((p) => p.url.toLowerCase() === m[1].toLowerCase());
  if (proj) {
    const tab = (m[2] && canonTab(m[2])) || DEFAULT_TAB;
    return { page: "card", project: proj, tab };
  }
  // прежний формат #/<таб> — карточка проекта по умолчанию
  const legacy = canonTab(m[1].toLowerCase());
  if (legacy) {
    return { page: "card", project: PROJECTS.find((p) => p.url === DEFAULT_PROJECT_URL), tab: legacy };
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

    const editBtn = document.getElementById("btn-edit");
    if (editBtn) editBtn.addEventListener("click", () => openEdit(p));
    const histBtn = document.getElementById("btn-history");
    if (histBtn) histBtn.addEventListener("click", () => { historyOpen = !historyOpen; render(); });
    const addTaskBtn = document.getElementById("btn-add-task");
    if (addTaskBtn) addTaskBtn.addEventListener("click", () => openTaskCard(p, null));
    const addDocBtn = document.getElementById("btn-add-doc");
    if (addDocBtn) addDocBtn.addEventListener("click", () => openAddDoc(p));

    if (r.tab === "general") bindMain(p);
    if (r.tab === "facility") bindObject(p);
    if (r.tab === "tasks") bindTasks(p);
    if (r.tab === "documents") bindDocs(p);
    if (r.tab === "finance") bindFinance(p);
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
