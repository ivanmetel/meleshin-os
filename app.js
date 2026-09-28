/* Симуляция: список "Все проекты" + карточка проекта — ТЗ модуля "Карточка проекта" (tz/project-card/; правки Объект/Основное/Финансы/График — 26.09.2026). */

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

/* ТЗ "Основное", раскрытие строки п.4: стадия работы — код и название из перечня 1–19 (регистр норм) */
const WORK_STAGES = [
  { id: 1, label: "Организация быта и устройство защитных укрытий" },
  { id: 2, label: "Демонтаж и уборка" },
  { id: 3, label: "Монтаж перегородок (кирпич/блоки)" },
  { id: 4, label: "Монтаж черновой сантехники" },
  { id: 5, label: "Монтаж черновой электрики и СКС" },
  { id: 6, label: "Монтаж вентиляции и кондиционеров (черновой)" },
  { id: 7, label: "Устройство основания пола" },
  { id: 8, label: "Монтаж ГКЛ (потолок)" },
  { id: 9, label: "Монтаж ГКЛ (стены) и металлоконструкций" },
  { id: 10, label: "Штукатурные работы" },
  { id: 11, label: "Малярные предчистовые работы" },
  { id: 12, label: "Плиточные работы" },
  { id: 13, label: "Устройство чистовых полов (паркет/ламинат)" },
  { id: 14, label: "Устройство стен: декор/обои/плинтуса" },
  { id: 15, label: "Чистовой монтаж сантехники" },
  { id: 16, label: "Установка встроенной мебели и дверей" },
  { id: 17, label: "Чистовая электрика и СКС" },
  { id: 18, label: "Покрасочные финишные работы" },
  { id: 19, label: "Приёмка, уборка" },
];
const workStageLabel = (id) => ((WORK_STAGES.find((s) => s.id === id) || {}).label) || "—";
const stageCell = (id) => `<span class="muted">${id == null ? "—" : id}</span> · ${esc(workStageLabel(id))}`;

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

/* ТЗ "Карточка проекта" 2.5: словарь состояний документов; состояние = последнее зарегистрированное событие */
const DOC_EVENTS = {
  created: { label: "Черновик", cls: "chip-doc-draft" },
  fixed: { label: "Зафиксирован", cls: "chip-doc-fixed" },
  sent: { label: "Отправлен", cls: "chip-doc-sent" },
  received: { label: "Получен", cls: "chip-doc-received" },
  agreed: { label: "Согласован с клиентом", cls: "chip-doc-agreed" },
  approved: { label: "Утверждён внутри компании", cls: "chip-doc-approved" },
};
const docEvents = (d) => d.events || [];
const docState = (d) => {
  const evs = docEvents(d);
  const last = evs[evs.length - 1];
  return (last && DOC_EVENTS[last.kind]) || DOC_EVENTS.created;
};
const docHasEvent = (d, kind) => docEvents(d).some((e) => e.kind === kind);

/* ТЗ "Документы" §1: типы единого реестра */
const DOC_TYPES = ["Смета", "КП", "Договор", "Счёт", "Акт выполненных работ", "Отчёт", "Письмо", "Проектная документация", "sheets-register", "design-data", "card", "Референсы", "Календарный план", "Запрос цены", "Предложение поставщика"];

/* ТЗ "Карточка проекта" 2.6: состояние работы состава; открытие работы строку не закрывает */
const WSTATES = [
  { id: "planned", label: "Запланирована", cls: "chip-stage" },
  { id: "inwork", label: "В работе", cls: "chip-doc-processing" },
  { id: "done", label: "Выполнена", cls: "chip-doc-approved" },
  { id: "excluded", label: "Исключена", cls: "chip-doc-draft" },
];
const wstateOf = (w) => WSTATES.find((s) => s.id === (w.wstate || "planned")) || WSTATES[0];
const wstateChip = (w) => `<span class="chip ${wstateOf(w).cls}">${wstateOf(w).label}</span>`;
const openWorks = (p) => (p.works || []).filter((w) => ["planned", "inwork"].includes(w.wstate || "planned"));

/* ТЗ "Финансы" §: внутри "Финансов" — Сводный → Сметы → Фактический труд по табелям → Финансовые операции */
const FIN_VIEWS = [
  { id: "svodny", label: "Сводный" },
  { id: "est", label: "Сметы" },
  { id: "labor", label: "Фактический труд по табелям" },
  { id: "ops", label: "Финансовые операции" },
];

/* состояние видов и фильтров — в памяти страницы */
let filterStage = "all";
let historyOpen = false;
let taskFilter = { status: "all", assignee: "all", overdue: false };
let finView = "svodny";
let estSel = "work"; // Сметы: "work" | индекс редакции в p.est
let estProject = null; // при смене проекта выбор редакции сбрасывается
let planVer = "work"; // График: "work" | "f<индекс>" — выбранная зафиксированная версия плана
let planProject = null; // при смене проекта выбор версии плана сбрасывается
let svodSel = "auto"; // Сводный: "auto" (цепочка по умолчанию) | "work" | "e<индекс>"
let svodProject = null; // при смене проекта выбор сбрасывается
let compEditing = null; // черновик состава работ: [{id, stage, room, element, work, unit, qty}]

/* ТЗ "Финансы" 2.4/2.8: денежные значения — два знака после запятой; € — только в заголовках столбцов */
const fmtM2 = (v) => (v == null ? "—" : new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v));
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
      works: [], materials: [], others: [], coef2: { added: false }, est: [],
      plan_start: null, fix_plan: [],
      docs: [], tasks: [], timesheets: [], ops: [],
      history: [],
    });
    closeAnyModal();
    location.hash = `#/${url}/${DEFAULT_TAB}`;
    if (parseHash().page !== "card") render();
  });
  document.getElementById("np-name").focus();
}

/* ---------------- расчёты: единый источник состава (ТЗ "Основное", состав; ТЗ "Финансы", Сметы) ---------------- */

const vatOf = (sum) => Math.round(sum * 0.19 * 100) / 100;

/* ТЗ "Финансы" 2.4, формулы строки: Себестоимость = ROUND(Q × C; 2); Цена за ед. = ROUND(C × K1 × K2; 1) —
   Коэф. 2 входит в произведение до округления; Стоимость = ROUND(Q × Цена за ед.; 2).
   Коэф. 2 применяется только к строкам СМР и отделочных работ; для материалов и прочих K2 = 1 */
const r2 = (v) => Math.round(v * 100) / 100;
const r1 = (v) => Math.round(v * 10) / 10;
const c2added = (p) => !!(p.coef2 && p.coef2.added);
const rowK2 = (r, added, isWork) => (added && isWork && r.k2 != null ? r.k2 : 1);
const salePriceOf = (r, added, isWork) => (r.price_buy == null || r.k1 == null ? null : r1(r.price_buy * r.k1 * rowK2(r, added, isWork)));
const rowSebOf = (r) => (r.qty == null || r.price_buy == null ? null : r2(r.qty * r.price_buy));
const rowCostOf = (r, added, isWork) => {
  const price = salePriceOf(r, added, isWork);
  if (r.qty == null || price == null) return null;
  return r2(r.qty * price);
};
/* ТЗ "Финансы" 2.5: вознаграждение дизайнера — прирост стоимости строки от Коэф. 2:
   стоимость по 2.4 − ROUND(Q × ROUND(C × K1; 1); 2); не добавляется к цене клиента второй раз */
const k2GainOf = (r, added, isWork) => {
  if (!added || !isWork) return 0;
  const withK2 = rowCostOf(r, added, isWork);
  const basePrice = r.price_buy == null || r.k1 == null ? null : r1(r.price_buy * r.k1);
  if (withK2 == null || basePrice == null || r.qty == null) return 0;
  return r2(withK2 - r2(r.qty * basePrice));
};

/* итоги трёх таблиц: {works, materials, others} → закупочная сторона, продажная сторона (диапазоном при
   диапазонных строках материалов, ТЗ "Финансы" 2.2–2.3), прирост Коэф. 2; пропуски сторон считаются отдельно */
function calcTotals(groups, added) {
  const t = { buy: { sum: 0, cnt: 0, unev: 0 }, sale: { lo: 0, hi: 0, cnt: 0, unev: 0, range: false }, gain: 0 };
  const kinds = [true, false, false]; // СМР / материалы / прочие — Коэф. 2 только у СМР
  groups.forEach((rows, gi) => rows.forEach((r) => {
    const isWork = kinds[gi];
    const s = rowSebOf(r);
    if (s == null) t.buy.unev += 1; else { t.buy.sum = r2(t.buy.sum + s); t.buy.cnt += 1; }
    if (r.range) {
      // оценка материалов границами: обе границы — значения строки (ТЗ "Финансы" 2.2)
      t.sale.lo = r2(t.sale.lo + (r.range.lo || 0));
      t.sale.hi = r2(t.sale.hi + (r.range.hi || 0));
      t.sale.cnt += 1;
      t.sale.range = true;
    } else {
      const c = rowCostOf(r, added, isWork);
      if (c == null) t.sale.unev += 1;
      else { t.sale.lo = r2(t.sale.lo + c); t.sale.hi = r2(t.sale.hi + c); t.sale.cnt += 1; }
    }
    t.gain = r2(t.gain + k2GainOf(r, added, isWork));
  }));
  return t;
}
const calcGroups = (src) => [src.works || [], src.materials || [], src.others || []];
const fmtSale = (sale) => (sale.range ? `${fmtM2(sale.lo)}–${fmtM2(sale.hi)}` : fmtM2(sale.lo));

/* редакции сметы (ТЗ "Финансы" 2.6): рабочая — единственное место изменения цен и коэффициентов;
   сохранённая — зафиксированный набор, значения не пересчитываются */
const estList = (p) => p.est || [];
const estById = (p, id) => estList(p).find((v) => v.id === id) || null;
const estLastAgreed = (p) => [...estList(p)].reverse().find((v) => v.state === "agreed" && !v.viaKp) || null;
/* последняя согласованная редакция любого носителя — смета или КП (ТЗ "Финансы" 2.6: признак "изменено относительно согласованного") */
const estLastAgreedAny = (p) => [...estList(p)].reverse().find((v) => v.state === "agreed") || null;
const estStateLabel = (v) => ((DOC_EVENTS[{ fixed: "fixed", agreed: "agreed" }[v.state]] || DOC_EVENTS.created).label);
/* продажи сохранённой редакции: значения сохранены в самой редакции; диапазон — границами */
function estSaleOf(v) {
  const rows = [...(v.works || []), ...(v.materials || []), ...(v.others || [])];
  let lo = 0, hi = 0, range = false;
  rows.forEach((r) => {
    if (r.range) { lo = r2(lo + (r.range.lo || 0)); hi = r2(hi + (r.range.hi || 0)); range = true; }
    else if (r.cost != null) { lo = r2(lo + r.cost); hi = r2(hi + r.cost); }
  });
  return { lo, hi, range };
}
const estSebOf = (v) => (v.totals && v.totals.seb != null ? v.totals.seb
  : r2([...(v.works || []), ...(v.materials || []), ...(v.others || [])].reduce((a, r) => a + (r.seb != null ? r.seb : 0), 0)));
const estGainOf = (v) => {
  if (!(v.coef2 && v.coef2.added)) return 0;
  return r2((v.works || []).reduce((a, r) => {
    const basePrice = r.price_buy == null || r.k1 == null ? null : r1(r.price_buy * r.k1);
    if (r.cost == null || basePrice == null || r.qty == null) return a;
    return a + r2(r.cost - r2(r.qty * basePrice));
  }, 0));
};

/* строка КП без сохранённой стоимости: стоимость = ROUND(Q × Цена за ед.; 2) */
const kpRowCost = (r) => (r.cost != null ? r.cost : (r.qty == null || r.price == null ? null : r2(r.qty * r.price)));

/* признак "изменено относительно согласованного" (ТЗ "Финансы" 2.6): сравнение с последней согласованной редакцией */
function clientDelta(p) {
  const s = estLastAgreedAny(p);
  if (!s) return null;
  const added = c2added(p);
  const works = p.works || [];
  const flags = new Map();
  works.forEach((w) => {
    const sr = (s.works || []).find((r) => r.wid === w.id);
    if (!sr) flags.set(w.id, "added");
    else if (sr.qty !== w.qty
      || r1(sr.price) !== r1(salePriceOf(w, added, true) ?? -1)
      || (sr.cost != null && sr.cost !== rowCostOf(w, added, true))) flags.set(w.id, "changed");
  });
  const excluded = (s.works || []).filter((sr) => !works.some((w) => w.id === sr.wid));
  const fixedSale = estSaleOf(s);
  const workSale = calcTotals(calcGroups(p), added).sale;
  return { flags, excluded, base: s, delta: r2(workSale.lo - fixedSale.lo) };
}

/* ТЗ "Финансы", операции: типы операций; записи демо-данных старого формата получают тип из направления */
const OP_TYPES = [
  { id: "income", label: "Поступление" },
  { id: "expense", label: "Расход" },
  { id: "refund", label: "Возврат" },
  { id: "transfer", label: "Внутренний перевод" },
];
const opType = (o) => o.type || (o.dir === "in" ? "income" : "expense");

/* ТЗ "Документы" §3: в расчёт требований входят фактически выставленные и отправленные клиентские счета —
   без столбца направления клиентские счета отличает получатель; факт отправки сохраняется после последующих событий */
const normDoc = (s) => String(s || "").replace(/\.pdf$/i, "");
const invoiceDocs = (p) => (p.docs || []).filter((d) => d.type === "Счёт"
  && p.client && d.party === p.client.name && docHasEvent(d, "sent"));

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
      if (opType(src) === "income") t.income = Math.round((t.income - o.amount) * 100) / 100;
      else t.expense = Math.round((t.expense - o.amount) * 100) / 100;
      return;
    }
    if (tp === "income") t.income = Math.round((t.income + o.amount) * 100) / 100;
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
const roomNames = (p) => (p.rooms || []).map((r) => r.name);
function roomOptions(p) {
  return [...roomNames(p), ROOM_ANY];
}
const roomElements = (p, roomName) => {
  const room = (p.rooms || []).find((r) => r.name === roomName);
  return room ? (room.elements || []) : [];
};

function compView(p) {
  const rows = p.works || [];
  const body = rows.map((w, i) => `
    <tr class="row-click" data-work="${w.id}" title="Открыть позицию состава" data-srch="${esc(((w.room || "") + " " + (w.work || "")).toLowerCase())}">
      <td>${i + 1}</td><td>${stageCell(w.stage)}</td><td>${esc(w.room)}</td><td>${esc(w.work)}</td><td>${esc(w.unit)}</td><td class="num">${fmtQty(w.qty)}</td>
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
          <thead><tr><th>#</th><th>Стадия</th><th>Помещение</th><th>Работа</th><th>Ед.</th><th class="num">Кол&#8209;во</th></tr></thead>
          <tbody>${body}</tbody>
        </table></div>`
      : `<div class="empty">Состав работ не задан</div>`}
    <div class="note">Состав, стадии, помещения, работы, единицы и количества — источник для "Финансов" ("Сметы") и "Графика"; копии позиций там нет. Клик по строке открывает позицию с её сведениями. Помещение выбирается из перечня помещений ("Объект"); для общих работ — значение "${ROOM_ANY}". У позиции есть постоянный внутренний идентификатор: видимый "#" — только порядок строк.</div>`;
}

function compEdit(p) {
  const draft = compEditing;
  const rooms = roomOptions(p);
  const roomSel = (cur) => {
    const list = (cur && !rooms.includes(cur)) ? [cur, ...rooms] : rooms; // прежнее помещение, исчезнувшее из перечня, не теряется молча
    return list.map((r) => `<option value="${esc(r)}"${r === (cur || ROOM_ANY) ? " selected" : ""}>${esc(r)}</option>`).join("");
  };
  // элемент или изделие — из данных помещения ("Объект"); у общих работ не выбирается
  const elemSel = (w, i) => {
    if (!w.room || w.room === ROOM_ANY) return `<span class="muted">—</span>`;
    const els = roomElements(p, w.room).map((e) => e.name);
    const list = (w.element && !els.includes(w.element)) ? [w.element, ...els] : els;
    return `<select data-i="${i}" data-f="element"><option value="">—</option>${list.map((e) => `<option value="${esc(e)}"${e === w.element ? " selected" : ""}>${esc(e)}</option>`).join("")}</select>`;
  };
  const rows = draft.map((w, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><select data-i="${i}" data-f="stage">${WORK_STAGES.map((s) => `<option value="${s.id}"${(w.stage || 1) === s.id ? " selected" : ""}>${s.id}. ${esc(s.label)}</option>`).join("")}</select></td>
      <td><select data-i="${i}" data-f="room">${roomSel(w.room)}</select></td>
      <td>${elemSel(w, i)}</td>
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
      <div class="svod-src">черновик; в расчёт не попадает до сохранения</div>
    </div>
    <div class="tbl-wrap"><table class="tbl comp-edit">
      <thead><tr><th>#</th><th>Стадия</th><th>Помещение</th><th>Элемент</th><th>Работа</th><th>Ед.</th><th class="num">Кол&#8209;во</th><th></th></tr></thead>
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
      // ТЗ "Основное", состав событие 1: добавленная работа появляется в расчёте с пустой закупочной ценой
      return { id: maxId, stage: r.stage || 1, room: r.room || ROOM_ANY, element: r.element || null, work: r.work, unit: r.unit, qty: r.qty, scope: null, origin: null, rel: [], price_buy: null, k1: null, k2: 1, wstate: "planned" };
    }
    const prev = old.find((w) => w.id === r.id) || {};
    // ТЗ "Основное", состав событие 4: изменена единица или существенно изменена работа — позиция требует проверки цены
    const rePrice = (prev.unit || "") !== (r.unit || "") || (prev.work || "") !== (r.work || "");
    return { ...prev, stage: r.stage || 1, room: r.room, element: r.element || null, work: r.work, unit: r.unit, qty: r.qty, price_check: !!(prev.price_check || rePrice) };
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
    fl("стадия", workStageLabel(w.stage), workStageLabel(r.stage));
    fl("помещение", w.room, r.room);
    fl("элемент", w.element, r.element);
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

/* ТЗ "Основное", раскрытие строки: позиция — 10 сведений; карточка открывается кликом по строке состава */
function openWorkCard(p, w) {
  const works = p.works || [];
  const relNames = (w.rel || []).map((id) => {
    const x = works.find((y) => y.id === id);
    return x ? workName(x) : "#" + id;
  });
  const frow = (label, valueHtml) => `<tr><td class="fld">${label}</td><td>${valueHtml}</td></tr>`;
  const plain = (v) => (v ? esc(v) : `<span class="muted">—</span>`);
  mountModal(`
    <div class="modal">
      <div class="modal-title">Позиция состава · ${esc(workName(w))}</div>
      <div class="tbl-wrap"><table class="tbl tbl-fields"><tbody>
        ${frow("Идентификатор", `<span class="muted">#${w.id}</span> — постоянный; связывает позицию с расчётом, графиком и КП`)}
        ${frow("Стадия", stageCell(w.stage))}
        ${frow("Помещение", esc(w.room) + ` — ссылка на "Объект"`)}
        ${frow("Элемент, часть или изделие", plain(w.element))}
        ${frow("Работа", esc(w.work))}
        ${frow("Единица и количество", `${esc(w.unit || "—")} · ${fmtQty(w.qty)} — неизвестное значение "[ ]", не ноль`)}
        ${frow("Подсчёт объёма", `<textarea id="wc-scope" rows="2" placeholder="формула и использованные данные Объекта либо ручное значение с основанием">${esc(w.scope || "")}</textarea>`)}
        ${frow("Основание", `<textarea id="wc-origin" rows="2" placeholder="файл/редакция ПД и лист, запись design-data или источник ручного ввода">${esc(w.origin || "")}</textarea>`)}
        ${frow("Связанные работы", relNames.length ? relNames.map(esc).join("; ") + ` — технологические предшественники` : `<span class="muted">нет; последователи определяются обратной связью</span>`)}
        ${frow("Норма", (() => { const n = normOf(w); return n
          ? `${n.key} · ${esc(n.title)} — файл норм, версия ${esc(DATA.norms.version)}${w.norm === undefined ? "; подобрана по составу и единице" : "; назначена явным решением"}`
          : `<span class="muted">[ ]</span> — не назначена; подбор нормы и расчёт длительности — в "Графике"`; })())}
        ${frow("Состояние работы", `
          <select id="wc-wstate">${WSTATES.map((s) => `<option value="${s.id}"${(w.wstate || "planned") === s.id ? " selected" : ""}>${s.label}</option>`).join("")}</select>
          <input id="wc-why" type="text" style="margin-top:6px" value="${esc(w.why || "")}" placeholder="основание выполнения или исключения — документ и дата">
          <div class="svod-src" style="margin-top:4px">Для "Выполнена" и "Исключена" сохраняется основание (ТЗ "Карточка проекта", 2.6); удаление строки из отображения работу не закрывает</div>`)}
      </tbody></table></div>
      <div class="modal-actions">
        <button class="btn-ghost" id="wc-cancel" type="button">Закрыть</button>
        <button class="btn-primary" id="wc-save" type="button">Сохранить</button>
      </div>
      <div class="note">Стадия, помещение, элемент, работа, единица и количество меняются конструктором "Редактировать состав"; здесь — происхождение объёма и состояние работы. Позиция без ПД — задание на словах: сохраняются содержание, источник и дата; фиктивная ссылка на чертёж не создаётся.</div>
    </div>`);
  document.getElementById("wc-cancel").addEventListener("click", closeAnyModal);
  document.getElementById("wc-save").addEventListener("click", () => {
    const scope = document.getElementById("wc-scope").value.trim();
    const origin = document.getElementById("wc-origin").value.trim();
    const wstate = document.getElementById("wc-wstate").value;
    const why = document.getElementById("wc-why").value.trim();
    const ch = [];
    if ((w.scope || "") !== scope) ch.push("подсчёт объёма");
    if ((w.origin || "") !== origin) ch.push("основание");
    if ((w.wstate || "planned") !== wstate || (w.why || "") !== why) {
      ch.push(`состояние работы: ${wstateOf(w).label} → ${WSTATES.find((s) => s.id === wstate).label}${why ? ` (${why})` : ""}`);
      w.wstate = wstate;
      w.why = why || null;
    }
    w.scope = scope || null;
    w.origin = origin || null;
    if (ch.length) logChange(p, "Основное", `"${workName(w)}": ${ch.join(", ")} — изменены`);
    closeAnyModal();
    render();
  });
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
  p.rooms.forEach((r) => { if (!r.elements) r.elements = []; });
  const works = p.works || [];
  const cnt = (name) => works.filter((w) => w.room === name).length;
  const roomRow = (room, i, sys) => `
    <tr class="row-click" data-room-open="${esc(room.name)}" title="Раскрыть помещение">
      <td>${i + 1}</td>
      <td>${sys ? `<b>${esc(room.name)}</b>` : esc(room.name)}</td>
      <td class="muted">${sys ? "системное значение" : ((room.elements || []).length ? `элементов и изделий: ${(room.elements || []).length}` : "элементов нет")}</td>
      <td class="muted">${cnt(room.name) ? `позиций состава: ${cnt(room.name)}` : "помещение без позиций"}</td>
      <td class="row-acts">${sys ? "" : `
        <button class="row-btn" data-room-act="rename" data-room="${esc(room.name)}" type="button" title="Переименовать помещение">✎</button>
        <button class="row-btn" data-room-act="del" data-room="${esc(room.name)}" type="button" title="Исключить помещение">✕</button>`}</td>
    </tr>`;
  const rows = p.rooms.map((room, i) => roomRow(room, i, false)).join("")
    + roomRow({ name: ROOM_ANY, elements: [] }, p.rooms.length, true);
  return `
    <div class="sect-head" style="margin-top:0">
      <div class="sect-title">Помещения</div>
      <div class="sect-head-tools"><button class="btn-ghost" id="btn-add-room" type="button">Добавить помещение</button></div>
    </div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>#</th><th>Помещение</th><th>Элементов и изделий</th><th>Состав</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <div class="svod-src" style="margin-top:6px">"${ROOM_ANY}" — системное значение для общих работ: существует всегда, не редактируется. Клик по строке — раскрытие помещения: элементы и их части, изделия и измерения.</div>
    ${pendingInline("Объёмы по помещениям", 'ТЗ "Объект", элемент 4 — объёмы работ состава, сгруппированные по помещениям; производное представление перечня и состава')}
    ${pendingInline("Фото и видео", 'ТЗ "Объект", элемент 5 — материалы объекта')}
    <div class="note">Перечень — единственный источник помещений: состав работ ("Основное"), расчёт и бюджеты ("Финансы"), задачи и табели выбирают помещение из него, ввод текстом в других вкладках не допускается. Добавление помещения не создаёт позиций состава; помещение без позиций показывается пустым. Размеры хранятся в "Объекте"; в расчёт передаётся результат подсчёта объёма работы ("Основное").</div>`;
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
    if (!name || name === ROOM_ANY || roomNames(p).includes(name)) { el.classList.add("input-err"); el.focus(); return; }
    if (isNew) {
      p.rooms = [...p.rooms, { name, elements: [] }];
      logChange(p, "Объект", `добавлено помещение "${name}"`);
    } else {
      const room = p.rooms.find((r) => r.name === oldName);
      if (room) room.name = name;
      (p.works || []).forEach((w) => { if (w.room === oldName) w.room = name; });
      logChange(p, "Объект", `помещение переименовано: "${oldName}" → "${name}"; привязанные позиции состава перенесены`);
    }
    closeAnyModal();
    render();
  });
  document.getElementById("rm-name").focus();
}

/* ТЗ "Объект", раскрытие помещения: элементы и их части, изделия и измерения — с происхождением каждого значения */
function openRoomCard(p, roomName) {
  const room = (p.rooms || []).find((r) => r.name === roomName);
  if (!room) return;
  room.elements = room.elements || [];
  const rows = room.elements.map((e, ei) => {
    const mrows = (e.measures || []).map((m, mi) => `
      <tr>
        <td>${ei + 1}.${mi + 1}</td>
        <td class="muted">${esc(e.name)}</td>
        <td>${esc(m.label)}</td>
        <td class="num">${fmtQty(m.value)} ${esc(m.unit || "")}</td>
        <td class="muted">${esc(m.source || "—")}</td>
      </tr>`).join("");
    return mrows || `<tr><td>${ei + 1}</td><td>${esc(e.name)}</td><td class="muted" colspan="3">измерений нет</td></tr>`;
  }).join("");
  mountModal(`
    <div class="modal wide">
      <div class="modal-title">Помещение · ${esc(roomName)}</div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>#</th><th>Элемент или изделие</th><th>Измерение</th><th class="num">Значение</th><th>Источник</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="5" class="muted">Элементов нет</td></tr>`}</tbody>
      </table></div>
      <div class="modal-actions">
        <button class="btn-ghost" id="rc-add-el" type="button">Добавить элемент или изделие</button>
        <button class="btn-ghost" id="rc-measure" type="button"${room.elements.length ? "" : " disabled"}>Ввести или уточнить измерение</button>
        <span class="spacer" style="flex:1"></span>
        <button class="btn-primary" id="rc-close" type="button">Закрыть</button>
      </div>
      <div class="note">Происхождение каждого значения: лист ПД, запись design-data или ручной ввод с основанием. Ручное уточнение сохраняется при обновлении ПД: повторное распознавание предлагает изменения и показывает расхождение, не стирая уточнение. Применить данные из ПД (design-data) — демонстрационной цепочкой не собрано. Две стороны перегородки — две поверхности соответствующих помещений.</div>
    </div>`);
  document.getElementById("rc-close").addEventListener("click", closeAnyModal);
  document.getElementById("rc-add-el").addEventListener("click", () => openElementModal(p, room));
  document.getElementById("rc-measure").addEventListener("click", () => openMeasureModal(p, room));
}

/* ТЗ "Объект": добавить элемент или изделие в помещение */
function openElementModal(p, room) {
  mountModal(`
    <div class="modal">
      <div class="modal-title">Добавить элемент или изделие</div>
      <div class="form-skel">
        <label>Помещение</label>
        <div class="svod-src">${esc(room.name)}</div>
        <label>Элемент или изделие</label>
        <input id="el-name" type="text" autocomplete="off" placeholder="Стены, Пол, Дверь…">
      </div>
      <div class="modal-actions">
        <button class="btn-ghost" id="el-cancel" type="button">Отмена</button>
        <button class="btn-primary" id="el-save" type="button">Добавить</button>
      </div>
      <div class="note">Элемент — то, к чему относится работа: потолок, поверхность перегородки, участок пола, дверь, светильник. Изделие в описании объекта само по себе не означает закупку Meleshin.</div>
    </div>`);
  document.getElementById("el-cancel").addEventListener("click", closeAnyModal);
  document.getElementById("el-save").addEventListener("click", () => {
    const elx = document.getElementById("el-name");
    const name = elx.value.trim();
    if (!name) { elx.classList.add("input-err"); elx.focus(); return; }
    room.elements = [...(room.elements || []), { name, kind: "element", measures: [] }];
    logChange(p, "Объект", `помещение "${room.name}": добавлен элемент или изделие "${name}"`);
    openRoomCard(p, room.name);
  });
  document.getElementById("el-name").focus();
}

/* ТЗ "Объект": ввести или уточнить измерение вручную — с основанием */
function openMeasureModal(p, room) {
  const els = room.elements || [];
  mountModal(`
    <div class="modal">
      <div class="modal-title">Ввести или уточнить измерение</div>
      <div class="form-skel">
        <label>Элемент или изделие</label>
        <select id="ms-el">${els.map((e, i) => `<option value="${i}">${esc(e.name)}</option>`).join("")}</select>
        <label>Измерение</label>
        <input id="ms-label" type="text" autocomplete="off" placeholder="Площадь стен, Периметр…">
        <label>Значение</label>
        <input id="ms-value" type="number" step="any">
        <label>Единица</label>
        <input id="ms-unit" type="text" autocomplete="off" value="м²">
        <label>Источник (основание)</label>
        <input id="ms-source" type="text" autocomplete="off" placeholder="ПД: файл, лист · design-data, запись · ручной ввод — кем и когда">
      </div>
      <div class="modal-actions">
        <button class="btn-ghost" id="ms-cancel" type="button">Отмена</button>
        <button class="btn-primary" id="ms-save" type="button">Сохранить</button>
      </div>
      <div class="note">Ручное уточнение сохраняет своё основание; обновление ПД показывает расхождение, не стирая уточнение.</div>
    </div>`);
  document.getElementById("ms-cancel").addEventListener("click", closeAnyModal);
  document.getElementById("ms-save").addEventListener("click", () => {
    const lbl = document.getElementById("ms-label");
    const label = lbl.value.trim();
    const valEl = document.getElementById("ms-value");
    const value = parseFloat(valEl.value);
    if (!label) { lbl.classList.add("input-err"); lbl.focus(); return; }
    if (!Number.isFinite(value)) { valEl.classList.add("input-err"); valEl.focus(); return; }
    const e = els[+document.getElementById("ms-el").value];
    e.measures = [...(e.measures || []), {
      label,
      value,
      unit: document.getElementById("ms-unit").value.trim(),
      source: document.getElementById("ms-source").value.trim() || "Ручной ввод (демо)",
    }];
    logChange(p, "Объект", `помещение "${room.name}", "${e.name}": измерение "${label}" = ${fmtQty(value)} ${document.getElementById("ms-unit").value.trim()}`);
    openRoomCard(p, room.name);
  });
  document.getElementById("ms-label").focus();
}

function bindObject(p) {
  const add = document.getElementById("btn-add-room");
  if (add) add.addEventListener("click", () => openRoomModal(p, null));
  document.querySelectorAll("tr[data-room-open]").forEach((tr) =>
    tr.addEventListener("click", () => {
      if (tr.dataset.roomOpen === ROOM_ANY) return; // "Весь объект" — системное значение, раскрытия не имеет
      openRoomCard(p, tr.dataset.roomOpen);
    }));
  document.querySelectorAll("[data-room-act]").forEach((b) => b.addEventListener("click", (e) => {
    e.stopPropagation(); // клик по кнопке строки не раскрывает помещение
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
    p.rooms = (p.rooms || []).filter((r) => r.name !== room);
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

/* ---------------- Документы: единый реестр (ТЗ "Документы" §1) ---------------- */

function rDocs(p) {
  const all = p.docs || [];
  const body = all.map((d, i) => {
    const st = docState(d);
    return `<tr class="row-click" data-doc="${i}" title="Открыть карточку документа">
      <td>${i + 1}</td>
      <td>${esc(d.name)}</td>
      <td>${esc(d.type)}</td>
      <td class="muted">${fmtDate(d.date)}</td>
      <td><span class="chip ${st.cls}">${esc(st.label)}</span></td>
    </tr>`;
  }).join("");
  return `
    ${all.length
      ? `<div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>#</th><th>Документ</th><th>Тип</th><th>Дата</th><th>Статус</th></tr></thead>
          <tbody>${body}</tbody>
        </table></div>`
      : `<div class="empty">Документов нет</div>`}
    <div class="note">Единый реестр: направление и редакция отдельными столбцами не показываются. Статус — последнее зарегистрированное событие из словаря состояний документов ("Карточка проекта", 2.5); события не стирают друг друга — у согласованного документа остаются даты фиксации и отправки. Дата в реестре — дата документа. Согласие клиента не выводится из этапа проекта: состояние меняет только зарегистрированное событие в карточке документа.</div>`;
}

/* позиции КП в карточке документа (ТЗ "Финансы" 2.7): рассчитанные продажные цены, диапазон материалов — границами */
function kpDocBlock(p, d) {
  const rows = (d.kp && d.kp.rows) || [];
  if (!rows.length) return "";
  const body = rows.map((r, i) => {
    const name = r.kind === "work" ? r.work : r.name;
    const priceCell = r.range ? `от ${fmtM2(r.range.lo)} до ${fmtM2(r.range.hi)}` : (r.price == null ? `<span class="muted">—</span>` : fmtM2(r.price));
    const costCell = r.range ? `<span class="muted">диапазон</span>` : (kpRowCost(r) == null ? `<span class="muted">—</span>` : fmtM2(kpRowCost(r)));
    return `<tr>
      <td>${i + 1}</td><td class="muted">${esc(r.room || "—")}</td>
      <td>${esc(name)}${r.merged ? ` <span class="delta-chip delta-muted">объединённая строка</span>` : ""}${r.kind === "material" ? ` <span class="delta-chip delta-muted">предварительная оценка</span>` : ""}</td>
      <td>${esc(r.unit)}</td><td class="num">${fmtQty(r.qty)}</td>
      <td class="num">${priceCell}</td><td class="num">${costCell}</td>
    </tr>`;
  }).join("");
  const exact = r2(rows.filter((r) => !r.range).reduce((a, r) => a + (kpRowCost(r) || 0), 0));
  const ranges = rows.filter((r) => r.range);
  const totals = `<div>Оценено точно: <b>${fmtM2(exact)}</b>${ranges.length ? ` · материалы — предварительно, границами: ${ranges.map((r) => `${fmtM2(r.range.lo)}–${fmtM2(r.range.hi)}`).join("; ")}` : ""}</div>
    <div>НДС 19 %: <b>${fmtM2(vatOf(exact))}</b> · Итого с НДС (без диапазона): <b>${fmtM2(r2(exact + vatOf(exact)))}</b></div>`;
  return `
    <div class="sect-title" style="margin-top:14px">Позиции КП</div>
    ${d.kp.extra ? `<div class="svod-src" style="margin-bottom:8px">Дополнительный состав — позиции вне согласованной редакции сметы</div>` : ""}
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>#</th><th>Помещение</th><th>Наименование</th><th>Ед.</th><th class="num">Кол&#8209;во</th><th class="num">Цена за ед., €</th><th class="num">Стоимость, €</th></tr></thead>
      <tbody>${body}</tbody>
    </table></div>
    <div class="budget-summary">${totals}</div>`;
}

/* таблицы сохранённой редакции сметы в карточке документа (ТЗ "Финансы" 2.6): значения сохранены в самой редакции и не пересчитываются */
function estDocBlock(p, d) {
  const v = estById(p, d.est);
  if (!v) return "";
  const rowHtml = (r, i, nameKey, withStage) => `
    <tr>
      <td>${i + 1}</td>${withStage ? `<td class="muted">${esc(workStageLabel(r.stage))}</td>` : ""}<td>${esc(r.room || r.name)}</td><td>${esc(r[nameKey] || r.name)}</td><td>${esc(r.unit)}</td><td class="num">${fmtQty(r.qty)}</td>
      <td class="num">${r.price_buy == null ? `<span class="muted">—</span>` : fmtM2(r.price_buy)}</td>
      <td class="num">${r.seb == null ? `<span class="muted">—</span>` : fmtM2(r.seb)}</td>
      <td class="num">${r.k1 == null ? `<span class="muted">—</span>` : fmtQty(r.k1)}</td>
      <td class="num">${r.price == null ? `<span class="muted">—</span>` : fmtM2(r.price)}</td>
      <td class="num">${r.cost == null ? `<span class="muted">—</span>` : fmtM2(r.cost)}</td>
    </tr>`;
  const tbl = (rows, title, nameKey, withStage) => rows.length ? `
    <div class="sect-title" style="margin-top:14px">${esc(title)}</div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>#</th>${withStage ? "<th>Стадия</th>" : ""}<th>${withStage ? "Помещение" : "Наименование"}</th><th>${withStage ? "Работа" : "Описание"}</th><th>Ед.</th><th class="num">Кол&#8209;во</th><th class="num">Вн. цена за ед., €</th><th class="num">Себестоимость, €</th><th class="num">Коэф. 1</th><th class="num">Цена за ед., €</th><th class="num">Стоимость, €</th></tr></thead>
      <tbody>${rows.map((r, i) => rowHtml(r, i, nameKey, withStage)).join("")}</tbody>
    </table></div>` : "";
  const sale = estSaleOf(v);
  const gain = estGainOf(v);
  return `
    <div class="sect-title" style="margin-top:14px">Редакция сметы · ${esc(v.id)}</div>
    <div class="svod-src" style="margin-bottom:8px">${esc(v.label)} · ${fmtDate(v.date)} · состояние: ${esc(estStateLabel(v))}${v.agree ? ` — ${esc(v.agree.who)}, ${fmtDate(v.agree.date)}${v.agree.note ? ` (${esc(v.agree.note)})` : ""}` : ""} · значения сохранены на момент фиксации и не пересчитываются</div>
    ${tbl(v.works || [], "СМР и отделочные работы", "work", true)}
    ${tbl(v.materials || [], "Материалы", "name", false)}
    ${tbl(v.others || [], "Проектные, сопутствующие и повременные работы", "name", false)}
    <div class="budget-summary">
      <div>Себестоимость: <b>${fmtM2(estSebOf(v))}</b> · Стоимость: <b>${fmtSale(sale)}</b></div>
      ${v.coef2 && v.coef2.added ? `<div>Вознаграждение дизайнера (${esc(v.coef2.purpose || "Коэф. 2")}): <b>${fmtM2(gain)}</b> — плановый расход</div>` : ""}
    </div>`;
}

/* ТЗ "Карточка проекта" 2.4: переходы этапа по согласованиям; повторная отметка повторного перехода не создаёт */
function applyAgreement(p, d) {
  if (d.type === "КП" && p.stage === "predproekt") {
    p.stage = "smr";
    logChange(p, "Документы", `этап проекта: Предпроектные работы → СМР и отделочные работы — согласовано КП "${d.name}". Переход фиксирует принятие предложения, а не окончательность объёмов и цен; договор и предоплата — отдельные события`);
    return;
  }
  if (d.type === "Акт выполненных работ") {
    // охваченные актом позиции получают состояние "Выполнена" с основанием (ТЗ "Карточка проекта", 2.2)
    ((d.act && d.act.wids) || []).forEach((id) => {
      const w = (p.works || []).find((x) => x.id === id);
      if (w && w.wstate !== "done") { w.wstate = "done"; w.why = `${d.name}, ${fmtDate(d.date)}`; }
    });
    if (p.stage === "smr") {
      if (!openWorks(p).length) {
        p.stage = "postproekt";
        logChange(p, "Документы", `этап проекта: СМР и отделочные работы → Пост-проектные работы — согласован "${d.name}", открытых работ не осталось`);
      } else {
        logChange(p, "Документы", `согласован "${d.name}"; открытых работ осталось: ${openWorks(p).length} — этап "СМР и отделочные работы" сохранён`);
      }
    }
  }
}

/* карточка документа (ТЗ "Документы" §2–3): события с собственными датами; действия зависят от назначения */
function openDocCard(p, d) {
  const st = docState(d);
  const frow = (label, valueHtml) => `<tr><td class="fld">${label}</td><td>${valueHtml}</td></tr>`;
  const plain = (v) => (v ? esc(v) : `<span class="muted">—</span>`);
  // ТЗ "Финансы", операции: оплачивенность счёта вычисляется из распределённых поступлений
  const isInvoice = d.type === "Счёт" && p.client && d.party === p.client.name;
  let invRows = "";
  if (isInvoice) {
    const paid = finTotals(p).paidMap.get(normDoc(d.name)) || 0;
    const amount = d.amount || 0;
    const payState = paid <= 0 ? "не оплачен" : (paid + 0.001 < amount ? "оплачен частично" : "оплачен");
    const payCls = paid <= 0 ? "chip-doc-draft" : (paid + 0.001 < amount ? "chip-doc-processing" : "chip-doc-approved");
    invRows = frow("Сумма", amount ? fmtM2(amount) : `<span class="muted">—</span>`)
      + frow("Распределённые поступления", fmtM2(paid))
      + frow("Оплачивенность", `<span class="chip ${payCls}">${payState}</span>`);
  }
  // события: каждое с собственной датой и подтверждением; события не стирают друг друга
  const evRows = docEvents(d).map((e) => {
    const ev = DOC_EVENTS[e.kind] || { label: e.kind, cls: "" };
    return `<tr><td><span class="chip ${ev.cls}">${esc(ev.label)}</span></td><td class="muted">${fmtDate(e.date)}</td><td>${esc(e.who || "—")}</td><td class="muted">${esc(e.note || "—")}</td></tr>`;
  }).join("");
  const estV = d.est ? estById(p, d.est) : null;
  let actBlock = "";
  if (d.act) {
    const rowsHtml = (d.act.wids || []).map((id, i) => {
      const w = (p.works || []).find((x) => x.id === id);
      return `<tr>
        <td>${i + 1}</td>
        <td>${w ? esc(workName(w)) : `<span class="muted">#${id} — исключена из состава</span>`}</td>
        <td>${wstateChip(w || { wstate: "excluded" })}${w && w.why ? `<div class="svod-src">${esc(w.why)}</div>` : ""}</td>
      </tr>`;
    }).join("");
    actBlock = `
      <div class="sect-title" style="margin-top:14px">Охваченные работы</div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>#</th><th>Работа состава</th><th>Состояние</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table></div>`;
  }
  let planBlock = "";
  if (d.plan) {
    const v = (p.fix_plan || []).find((x) => x.version === d.plan);
    if (v) planBlock = `
      <div class="sect-title" style="margin-top:14px">Позиции зафиксированного плана</div>
      <div class="svod-src" style="margin-bottom:8px">${esc(v.label || "Календарный план")} ${esc(v.version || "")} · предпосылка ${esc(v.premise || "—")} · календарь: ${esc(v.calendar || "—")}${v.start ? ` · начальная дата ${fmtDate(v.start)}` : ""} · файл норм, версия ${esc(v.norms || DATA.norms.version)} · снимок плана входит в зафиксированный набор</div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>#</th><th>Стадия</th><th>Помещение</th><th>Работа</th><th>Старт</th><th>Финиш</th><th>Состояние работы</th></tr></thead>
        <tbody>${v.rows.map((r, i) => {
          const w = (p.works || []).find((x) => x.id === r.wid);
          return `<tr>
            <td>${i + 1}</td><td>${stageCell(r.stage)}</td><td>${esc(r.room)}</td><td>${esc(r.work)}</td>
            <td class="muted">${r.start ? fmtDate(r.start) : "[ ]"}</td><td class="muted">${r.finish ? fmtDate(r.finish) : "[ ]"}</td>
            <td>${w ? wstateChip(w) : `<span class="chip chip-doc-draft">Исключена</span>`}</td>
          </tr>`;
        }).join("")}</tbody>
      </table></div>`;
  }
  // действия (ТЗ "Документы" §2): отправка и получение — взаимоисключающие; согласование — после отправки или получения
  const hasMove = docHasEvent(d, "sent") || docHasEvent(d, "received");
  const canAgree = ["КП", "Смета", "Акт выполненных работ"].includes(d.type) && !docHasEvent(d, "agreed") && hasMove;
  const canApprove = ["Смета", "Календарный план"].includes(d.type) && !docHasEvent(d, "approved");
  mountModal(`
    <div class="modal${(d.kp || estV || d.act || d.plan) ? " wide" : ""}">
      <div class="modal-title">Карточка документа</div>
      <div class="tbl-wrap"><table class="tbl tbl-fields">
        <tbody>
          ${frow("Название", esc(d.name))}
          ${frow("Тип", esc(d.type))}
          ${frow("Дата документа", plain(fmtDate(d.date)))}
          ${frow("Корреспондент", plain(d.party))}
          ${d.version ? frow("Версия", plain(d.version)) : ""}
          ${frow("Состояние", `<span class="chip ${st.cls}">${esc(st.label)}</span>`)}
          ${d.file ? frow("Вложение", esc(d.file)) : ""}
          ${d.link_work ? frow("Связь с работой состава", esc(d.link_work)) : ""}
          ${d.link_task ? frow("Связь с задачей", esc(d.link_task)) : ""}
          ${d.link_op ? frow("Связь с операцией", esc(d.link_op)) : ""}
          ${invRows}
        </tbody>
      </table></div>
      <div class="sect-title" style="margin-top:14px">События</div>
      ${evRows
        ? `<div class="tbl-wrap"><table class="tbl">
            <thead><tr><th>Событие</th><th>Дата</th><th>Кто</th><th>Подтверждение</th></tr></thead>
            <tbody>${evRows}</tbody>
          </table></div>`
        : `<div class="empty">Событий нет — документ в состоянии "Черновик"</div>`}
      ${d.kp ? kpDocBlock(p, d) : ""}
      ${estV ? estDocBlock(p, d) : ""}
      ${actBlock}
      ${planBlock}
      <div class="modal-actions">
        ${!hasMove ? `<button class="btn-ghost" id="dcs-send" type="button">Зарегистрировать отправку</button>
        <button class="btn-ghost" id="dcs-receive" type="button">Зарегистрировать получение</button>` : ""}
        ${canAgree ? `<button class="btn-primary" id="dcs-agree" type="button">Отметить согласование</button>` : ""}
        ${canApprove ? `<button class="btn-ghost" id="dcs-approve" type="button">Утвердить внутри компании</button>` : ""}
        ${estV ? `<button class="btn-ghost" id="dcs-export" type="button">Выгрузить PDF</button>` : ""}
      </div>
      <div class="note">Состояние — последнее зарегистрированное событие; события не стирают друг друга: у согласованного документа остаются даты фиксации и отправки. Согласование с клиентом доступно для КП, сметы и акта выполненных работ после отправки или получения; согласие не выводится из этапа проекта. Согласование КП переводит проект из предпроектных работ в СМР и отделочные работы, согласование акта закрывает охваченные работы и при отсутствии открытых работ переводит проект в пост-проектные работы; повторная отметка повторного перехода не создаёт.</div>
    </div>`);
  const bindEv = (id, kind) => {
    const b = document.getElementById(id);
    if (b) b.addEventListener("click", () => openDocEvent(p, d, kind));
  };
  bindEv("dcs-send", "sent");
  bindEv("dcs-receive", "received");
  bindEv("dcs-agree", "agreed");
  bindEv("dcs-approve", "approved");
  const ex = document.getElementById("dcs-export");
  if (ex) ex.addEventListener("click", () => exportPdf(estHtml(p, d)));
}

/* регистрация события документа (ТЗ "Документы" §2): отправка, получение, согласование, внутреннее утверждение */
function openDocEvent(p, d, kind) {
  const F = {
    sent: { title: "Зарегистрировать отправку", who: "Кто отправил", whoDef: "Демо-пользователь", note: "Подтверждение отправки", notePh: "электронная почта, мессенджер" },
    received: { title: "Зарегистрировать получение", who: "Отправитель", whoDef: "", note: "Подтверждение получения", notePh: "входящее письмо, передача" },
    agreed: { title: "Отметить согласование с клиентом", who: "Кто согласовал", whoDef: p.client ? p.client.name : "", note: "Где подтверждение", notePh: "электронная почта, встреча, мессенджер" },
    approved: { title: "Утвердить внутри компании", who: "Утвердивший сотрудник", whoDef: p.pm ? p.pm.name : "", note: "Решение (основание)", notePh: "" },
  }[kind];
  mountModal(`
    <div class="modal">
      <div class="modal-title">${esc(F.title)} — ${esc(d.name)}</div>
      <div class="form-skel">
        <label>${esc(F.who)}</label>
        <input id="de-who" type="text" autocomplete="off" value="${esc(F.whoDef)}">
        <label>Когда</label>
        <input id="de-date" type="date" value="${todayIso()}">
        <label>${esc(F.note)}</label>
        <input id="de-note" type="text" autocomplete="off" placeholder="${esc(F.notePh)}">
      </div>
      <div class="modal-actions">
        <button class="btn-ghost" id="de-cancel" type="button">Отмена</button>
        <button class="btn-primary" id="de-save" type="button">Зарегистрировать</button>
      </div>
      ${kind === "agreed" ? `<div class="note">Согласование — событие документа, не этапа проекта. Для КП переход в СМР обозначает принятие предложения, а не окончательность объёмов и цен; для акта закрываются охваченные работы. События не стирают друг друга: после согласования остаются даты фиксации и отправки.</div>` : `<div class="note">Событие получает собственную дату и подтверждение; состояние документа — последнее событие.</div>`}
    </div>`);
  document.getElementById("de-cancel").addEventListener("click", closeAnyModal);
  document.getElementById("de-save").addEventListener("click", () => {
    const whoEl = document.getElementById("de-who");
    const who = whoEl.value.trim();
    if (!who) { whoEl.classList.add("input-err"); whoEl.focus(); return; }
    const date = document.getElementById("de-date").value || todayIso();
    const note = document.getElementById("de-note").value.trim() || null;
    d.events = [...docEvents(d), { kind, date, who, note }];
    if (kind === "agreed") {
      const v = d.est ? estById(p, d.est) : null;
      if (v && v.state !== "agreed") {
        v.state = "agreed";
        v.agree = { who, date, note };
        // согласование КП — принятие ориентировочного предложения, не окончательной сметы (ТЗ "Финансы" 2.7);
        // КП на дополнительный состав фиксирует новую согласованную редакцию целиком
        if (d.type === "КП" && !(d.kp && d.kp.extra)) v.viaKp = true;
      }
      applyAgreement(p, d);
      logChange(p, "Документы", `"${d.name}": согласование с клиентом — ${who}, ${fmtDate(date)}${note ? ` (${note})` : ""}`);
    } else {
      const labels = { sent: "зарегистрирована отправка", received: "зарегистрировано получение", approved: "утверждение внутри компании" };
      logChange(p, "Документы", `"${d.name}": ${labels[kind] || kind} — ${who}, ${fmtDate(date)}`);
    }
    closeAnyModal();
    render();
  });
  document.getElementById("de-who").focus();
}

/* ТЗ "Документы" §2: "Добавить документ" — единая форма без направления;
   отправка и получение регистрируются событиями, а не выводятся из типа */
function openAddDoc(p) {
  const works = p.works || [];
  const tasks = p.tasks || [];
  mountModal(`
    <div class="modal">
      <div class="modal-title">Добавить документ</div>
      <div class="form-skel">
        <label>Название</label>
        <input id="dc-name" type="text" autocomplete="off" placeholder="Счёт №3">
        <label>Тип</label>
        <select id="dc-type">${DOC_TYPES.map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join("")}</select>
        <label>Дата документа</label>
        <input id="dc-date" type="date" value="${todayIso()}">
        <label>Корреспондент</label>
        <input id="dc-party" type="text" autocomplete="off" placeholder="клиент, контрагент или сотрудник">
        <label>Сумма, € (для типа "Счёт")</label>
        <input id="dc-amount" type="number" min="0" step="any">
        <label>Связь с работой состава</label>
        <select id="dc-work"><option value="">— без связи</option>${works.map((w) => `<option value="${esc(workName(w))}">${esc(workName(w))}</option>`).join("")}</select>
        <label>Связь с задачей</label>
        <select id="dc-task"><option value="">— без связи</option>${tasks.map((t) => `<option value="${esc("№" + t.num + " " + t.title)}">${esc("№" + t.num + " " + t.title)}</option>`).join("")}</select>
        <label>Связь с операцией</label>
        <select id="dc-op"><option value="">— без связи</option>${(p.ops || []).map((o) => `<option value="${esc(fmtDate(o.date) + " · " + o.purpose)}">${esc(fmtDate(o.date) + " · " + o.purpose)}</option>`).join("")}</select>
      </div>
      <div class="modal-actions">
        <button class="btn-ghost" id="dc-cancel" type="button">Отмена</button>
        <button class="btn-primary" id="dc-save" type="button">Добавить</button>
      </div>
      <div class="note">Демо: документ добавляется в данные страницы, до перезагрузки. Новый документ получает состояние "Черновик"; фиксация, отправка, получение, согласование и внутреннее утверждение регистрируются событиями в карточке документа — получение и отправка не выводятся из типа. Счёт с получателем-клиентом учитывается в расчёте требований после регистрации отправки.</div>
    </div>`);
  document.getElementById("dc-cancel").addEventListener("click", closeAnyModal);
  document.getElementById("dc-save").addEventListener("click", () => {
    const nameEl = document.getElementById("dc-name");
    const name = nameEl.value.trim();
    if (!name) { nameEl.classList.add("input-err"); nameEl.focus(); return; }
    const rd = (id) => document.getElementById(id).value.trim();
    const doc = {
      name,
      type: document.getElementById("dc-type").value,
      date: rd("dc-date") || todayIso(),
      party: rd("dc-party"),
      events: [],
      file: null,
      link_work: rd("dc-work") || null,
      link_task: rd("dc-task") || null,
      link_op: rd("dc-op") || null,
    };
    const amount = parseFloat(rd("dc-amount"));
    if (Number.isFinite(amount)) doc.amount = amount;
    p.docs = [...(p.docs || []), doc];
    logChange(p, "Документы", `добавлен документ "${name}" (${doc.type}) — черновик`);
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
  h2 { font-size: 14px; margin: 18px 0 6px; color: #334155; }
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

/* печатная таблица клиентской стороны (ТЗ "Финансы" 2.8): рассчитанные цены, сохранённые в документе;
   диапазонные материалы — границами, как в интерфейсе */
function printRows(rows, title) {
  const body = rows.map((r, i) => {
    const name = r.kind === "work" ? r.work : r.name;
    const price = r.range ? `от ${fmtM2(r.range.lo)} до ${fmtM2(r.range.hi)}` : (r.price == null ? "—" : fmtM2(r.price));
    const cost = r.range ? "предварительно" : (kpRowCost(r) == null ? "—" : fmtM2(kpRowCost(r)));
    return `
    <tr>
      <td>${i + 1}</td><td>${esc(r.room || "—")}</td><td>${esc(name)}${r.merged ? " (объединённая строка)" : ""}${r.kind === "material" ? " (предварительная оценка)" : ""}</td><td>${esc(r.unit)}</td>
      <td class="num">${fmtQty(r.qty)}</td>
      <td class="num">${price}</td>
      <td class="num">${cost}</td>
    </tr>`;
  }).join("");
  return `<h2>${esc(title)}</h2><table>
    <thead><tr><th>#</th><th>Помещение</th><th>Наименование</th><th>Ед.</th><th class="num">Кол&#8209;во</th><th class="num">Цена за ед., €</th><th class="num">Стоимость, €</th></thead>
    <tbody>${body}</tbody></table>`;
}

/* КП — документ типа "КП" (ТЗ "Финансы" 2.7): внутренние цены, коэффициенты и вознаграждение дизайнера
   в выгрузку не попадают; YYNN — внутренний номер, в клиентской выгрузке названия проекта нет */
function kpHtml(p, d) {
  const client = p.client ? p.client.name : "—";
  const rows = (d.kp && d.kp.rows) || [];
  const exact = r2(rows.filter((r) => !r.range).reduce((a, r) => a + (kpRowCost(r) || 0), 0));
  const ranges = rows.filter((r) => r.range);
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>${esc(d.name)}</title><style>${printCss}</style></head>
<body>
  <div class="brand">MELESHIN GROUP</div>
  <h1>Коммерческое предложение</h1>
  <div class="meta">Клиент: ${esc(client)} · Версия ${esc(d.version || "")} · от ${fmtDate(d.date)}${d.kp && d.kp.extra ? " · дополнительный состав" : ""}</div>
  ${printRows(rows, "Состав работ")}
  <div class="totals">
    <div>Оценено точно: <b>${fmtM2(exact)}</b>${ranges.length ? `; материалы — предварительная оценка границами: ${ranges.map((r) => `${fmtM2(r.range.lo)}–${fmtM2(r.range.hi)}`).join("; ")}` : ""}</div>
    <div>НДС 19 %: <b>${fmtM2(vatOf(exact))}</b></div>
    <div>Итого с НДС (без диапазона): <b>${fmtM2(r2(exact + vatOf(exact)))}</b></div>
  </div>
  <div class="ft">Выгрузка из симуляции карточки проекта. Внутренние цены, коэффициенты и вознаграждение дизайнера в КП не попадают.</div>
  <script>window.addEventListener("load", function () { window.print(); });</` + `script>
</body></html>`;
}

/* выгрузка сметы из карточки документа (ТЗ "Финансы" 2.6/2.8): клиентская сторона сохранённой редакции;
   значения сохранены на момент фиксации и не пересчитываются */
function estHtml(p, d) {
  const v = estById(p, d.est);
  if (!v) return "";
  const client = p.client ? p.client.name : "—";
  const wrows = (v.works || []).map((r) => ({ kind: "work", room: r.room, work: r.work, unit: r.unit, qty: r.qty, price: r.price }));
  const mrows = (v.materials || []).map((r) => ({ kind: "material", name: r.name, unit: r.unit, qty: r.qty, price: r.price, range: r.range }));
  const orows = (v.others || []).map((r) => ({ kind: "other", name: r.name, unit: r.unit, qty: r.qty, price: r.price }));
  const sale = estSaleOf(v);
  const agreeLine = v.agree ? ` · согласовано: ${esc(v.agree.who)}, ${fmtDate(v.agree.date)}` : "";
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>${esc(d.name)}</title><style>${printCss}</style></head>
<body>
  <div class="brand">MELESHIN GROUP</div>
  <h1>Смета</h1>
  <div class="meta">Клиент: ${esc(client)} · Редакция ${esc(v.id)} · от ${fmtDate(v.date)}${agreeLine}</div>
  ${wrows.length ? printRows(wrows, "СМР и отделочные работы") : ""}
  ${mrows.length ? printRows(mrows, "Материалы — предварительная оценка") : ""}
  ${orows.length ? printRows(orows, "Проектные, сопутствующие и повременные работы") : ""}
  <div class="totals">
    <div>Стоимость: <b>${fmtSale(sale)}</b>${sale.range ? " — диапазон предварительной оценки материалов" : ""}</div>
    ${sale.range
      ? `<div>НДС 19 %: от <b>${fmtM2(vatOf(sale.lo))}</b> до <b>${fmtM2(vatOf(sale.hi))}</b></div>
         <div>Итого с НДС: от <b>${fmtM2(r2(sale.lo + vatOf(sale.lo)))}</b> до <b>${fmtM2(r2(sale.hi + vatOf(sale.hi)))}</b></div>`
      : `<div>НДС 19 %: <b>${fmtM2(vatOf(sale.lo))}</b></div>
         <div>Итого с НДС: <b>${fmtM2(r2(sale.lo + vatOf(sale.lo)))}</b></div>`}
  </div>
  <div class="ft">Зафиксированная редакция: значения названий, единиц, количеств и цен сохранены в самой редакции. Выгрузка из симуляции карточки проекта.</div>
  <script>window.addEventListener("load", function () { window.print(); });</` + `script>
</body></html>`;
}

/* ---------------- Финансы (ТЗ "Финансы") ---------------- */

/* ТЗ "Финансы" 2.1–2.6: Сметы — единая страница; рабочая редакция — единственное место
   изменения цен и коэффициентов; сохранённые редакции не пересчитываются */
function rEst(p) {
  if (estProject !== p) { estProject = p; estSel = "work"; }
  if (!p.coef2) p.coef2 = { added: false };
  if (!p.materials) p.materials = [];
  if (!p.others) p.others = [];
  if (!p.est) p.est = [];
  const list = estList(p);
  const chips = `
    <div class="subchips">
      <button class="fchip${estSel === "work" ? " active" : ""}" data-ever="work" type="button">Рабочая редакция</button>
      ${list.map((v, i) => `<button class="fchip${estSel === "e" + i ? " active" : ""}" data-ever="e${i}" type="button">${esc(v.label)} · ${esc(estStateLabel(v))} · ${fmtDate(v.date)}</button>`).join("")}
    </div>`;
  const idx = estSel.startsWith("e") ? +estSel.slice(1) : -1;
  const v = idx >= 0 && idx < list.length ? list[idx] : null;
  if (v) return chips + estFixedView(p, v);
  return chips + rEstWorking(p);
}

/* рабочая редакция: три таблицы, ввод закупочных цен и коэффициентов; продажа пересчитывается, не вводится */
function rEstWorking(p) {
  const added = c2added(p);
  const delta = clientDelta(p);
  const numInp = (r, key, field, cls) => `<td class="num"><input class="${cls}" data-${key}="${r.id}" data-k="${field}" type="number" min="0" step="any" placeholder="—" value="${r[field] == null ? "" : r[field]}"></td>`;
  const calcCells = (r, key, isWork) => `
      ${numInp(r, key, "price_buy", "price-inp")}
      <td class="num">${rowSebOf(r) == null ? `<span class="muted">—</span>` : fmtM2(rowSebOf(r))}</td>
      ${numInp(r, key, "k1", "k-inp")}
      <td class="num" title="ROUND(Вн. цена за ед. × Коэф. 1 × Коэф. 2; 1) — Коэф. 2 в произведении до округления">${salePriceOf(r, added, isWork) == null ? `<span class="muted">—</span>` : fmtM2(salePriceOf(r, added, isWork))}</td>
      <td class="num">${rowCostOf(r, added, isWork) == null ? `<span class="muted">—</span>` : fmtM2(rowCostOf(r, added, isWork))}</td>`;

  const wrows = (p.works || []).map((w, i) => {
    const flag = delta && delta.flags.get(w.id);
    const checkChip = w.price_check ? ` <span class="delta-chip delta-check">требует проверки цены</span>` : "";
    return `
    <tr class="row-click" data-cwork="${w.id}" title="Открыть строку: формула и Коэф. 2">
      <td>${i + 1}</td><td>${stageCell(w.stage)}</td><td>${esc(w.room)}</td><td>${esc(w.work)}${flag ? ` <span class="delta-chip delta-${flag}">${flag === "added" ? "добавлено" : "изменено"}</span>` : ""}${checkChip}</td><td>${esc(w.unit)}</td><td class="num">${fmtQty(w.qty)}</td>
      ${calcCells(w, "cw", true)}
      <td class="muted">${esc(w.comment || "—")}</td>
    </tr>`;
  }).join("");
  const mrows = (p.materials || []).map((m, i) => `
    <tr>
      <td>${i + 1}</td><td>${esc(m.name)} <span class="delta-chip delta-muted">предварительная оценка</span></td><td>${esc(m.unit)}</td><td class="num">${fmtQty(m.qty)}</td>
      ${m.range
        ? `<td colspan="5" class="num">границы: <input class="price-inp" data-mr="${m.id}" data-k="lo" type="number" min="0" step="any" style="width:92px" value="${m.range.lo == null ? "" : m.range.lo}"> — <input class="price-inp" data-mr="${m.id}" data-k="hi" type="number" min="0" step="any" style="width:92px" value="${m.range.hi == null ? "" : m.range.hi}"></td>`
        : calcCells(m, "cm", false)}
      <td><input class="cmt-inp" data-cm="${m.id}" data-k="comment" type="text" value="${esc(m.comment || "")}"></td>
      <td class="row-acts"><button class="row-btn" data-mdel="${m.id}" type="button" title="Исключить строку">✕</button></td>
    </tr>`).join("");
  const orows = (p.others || []).map((o, i) => `
    <tr>
      <td>${i + 1}</td><td>${esc(o.name)}</td><td>${esc(o.unit)}</td><td class="num">${fmtQty(o.qty)}</td>
      ${calcCells(o, "co", false)}
      <td><input class="cmt-inp" data-co="${o.id}" data-k="comment" type="text" value="${esc(o.comment || "")}"></td>
      <td class="row-acts"><button class="row-btn" data-odel="${o.id}" type="button" title="Исключить строку">✕</button></td>
    </tr>`).join("");

  const tt = calcTotals(calcGroups(p), added);
  return `
    <div class="budget-actions">
      <button class="btn-ghost" id="btn-fix-est" type="button">Зафиксировать</button>
      <button class="btn-primary" id="btn-make-kp" type="button">Сформировать КП</button>
    </div>
    <div class="note fin-note">
      <label class="chk-row" style="margin:0">
        <input type="checkbox" id="calc-c2"${added ? " checked" : ""}>
        <span class="chk-name">Коэф. 2 добавлен в расчёт проекта</span>
      </label>
      ${added ? `
      <label style="margin-top:10px">Назначение наценки Коэф. 2</label>
      <input id="calc-c2p" type="text" autocomplete="off" value="${esc(p.coef2.purpose || "Вознаграждение дизайнера")}">` : ""}
    </div>
    <div class="sect-head" style="margin-top:12px"><div class="sect-title">1. Строительно-монтажные и отделочные работы</div></div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>#</th><th>Стадия</th><th>Помещение</th><th>Работа</th><th>Ед.</th><th class="num">Кол&#8209;во</th><th class="num">Вн. цена за ед., €</th><th class="num">Себестоимость, €</th><th class="num">Коэф. 1</th><th class="num">Цена за ед., €</th><th class="num">Стоимость, €</th><th>Комментарий</th></tr></thead>
      <tbody>${wrows || `<tr><td colspan="12" class="muted">Состав не задан — добавьте строку или задайте позиции в "Основном"</td></tr>`}</tbody>
    </table></div>
    <div class="comp-foot"><button class="btn-ghost" id="work-add" type="button">Добавить строку</button><span class="svod-src">позиция создаётся в общем составе — появляется и в "Основном"</span></div>
    <div class="sect-head"><div class="sect-title">2. Материалы</div><div class="svod-src">общая предварительная оценка — точными ценами или границами; закупки и отчётность по факту начинаются при выполнении работ</div></div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>#</th><th>Материал</th><th>Ед.</th><th class="num">Кол&#8209;во</th><th class="num">Вн. цена за ед., €</th><th class="num">Себестоимость, €</th><th class="num">Коэф. 1</th><th class="num">Цена за ед., €</th><th class="num">Стоимость, €</th><th>Комментарий</th><th></th></tr></thead>
      <tbody>${mrows || `<tr><td colspan="11" class="muted">Строк нет</td></tr>`}</tbody>
    </table></div>
    <div class="comp-foot"><button class="btn-ghost" id="mat-add" type="button">Добавить строку</button></div>
    <div class="sect-head"><div class="sect-title">3. Проектные, сопутствующие и работы по повременной оценке</div></div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>#</th><th>Работа</th><th>Ед.</th><th class="num">Кол&#8209;во</th><th class="num">Вн. цена за ед., €</th><th class="num">Себестоимость, €</th><th class="num">Коэф. 1</th><th class="num">Цена за ед., €</th><th class="num">Стоимость, €</th><th>Комментарий</th><th></th></tr></thead>
      <tbody>${orows || `<tr><td colspan="11" class="muted">Строк нет</td></tr>`}</tbody>
    </table></div>
    <div class="comp-foot"><button class="btn-ghost" id="oth-add" type="button">Добавить строку</button></div>
    <div class="budget-summary">
      <div>Себестоимость (закупочная сторона): <b>${fmtM2(tt.buy.sum)}</b> (${tt.buy.cnt} поз. оценено)${tt.buy.unev ? ` · не оценено: ${tt.buy.unev} — пустая цена, коэффициент или количество означают неполный расчёт; диапазонные материалы закупочной стороны не имеют` : ""}</div>
      <div>Стоимость (продажная сторона): <b>${fmtSale(tt.sale)}</b> (${tt.sale.cnt} поз. оценено)${tt.sale.unev ? ` · не оценено: ${tt.sale.unev}` : ""}${tt.sale.range ? " · диапазон — предварительная оценка материалов" : ""}</div>
      ${added
        ? `<div>Вознаграждение дизайнера (${esc(p.coef2.purpose || "Коэф. 2")}): <b>${fmtM2(tt.gain)}</b> — плановый расход; в цену клиенту второй раз не добавляется</div>`
        : `<div>Коэф. 2 не добавлен — вознаграждение дизайнера не возникает</div>`}
      ${delta
        ? `<div>Изменение к согласованной редакции (${esc(delta.base.id)}, ${fmtDate(delta.base.date)}): <b>${delta.delta >= 0 ? "+" : ""}${fmtM2(delta.delta)}</b>${delta.excluded.length ? ` · исключено относительно согласованной: ${delta.excluded.map((r) => `"${esc(r.room)} / ${esc(r.work)}"`).join(", ")} — позиция сохранена в согласованной редакции` : ""}</div>`
        : ""}
    </div>
    <div class="note">Формулы строки: Себестоимость = ROUND(Кол-во × Вн. цена за ед.; 2); Цена за ед. = ROUND(Вн. цена за ед. × Коэф. 1 × Коэф. 2; 1) — Коэф. 2 входит в произведение до округления и применяется только к строкам СМР и отделочных работ; Стоимость = ROUND(Кол-во × Цена за ед.; 2). Итоги — суммы округлённых строк; диапазонные материалы входят в Итого границами. Цена продажи вручную не заменяется: коммерческое решение выражается изменением коэффициентов. Состав и количества — из "Основного"; строка добавляется здесь или в "Основном" в один и тот же состав, копии не создаётся. "Зафиксировать" сохраняет редакцию и план в набор; "Сформировать КП" фиксирует набор и выпускает КП по выбранным позициям.</div>`;
}

/* сохранённая редакция (ТЗ "Финансы" 2.6): значения сохранены на момент фиксации и не пересчитываются */
function estFixedView(p, v) {
  const doc = (p.docs || []).find((x) => x.est === v.id) || null;
  const working = calcTotals(calcGroups(p), c2added(p));
  const sale = estSaleOf(v);
  const dl = r2(working.sale.lo - sale.lo);
  const canAgree = doc && ["КП", "Смета", "Акт выполненных работ"].includes(doc.type)
    && !docHasEvent(doc, "agreed") && (docHasEvent(doc, "sent") || docHasEvent(doc, "received"));
  return `
    <div class="fix-cap"><b>${esc(v.label)} · ${esc(v.id)}</b> — зафиксирована ${fmtDate(v.date)}; значения сохранены в самой редакции и не пересчитываются</div>
    ${estDocBlock(p, { est: v.id })}
    <div class="budget-actions">
      ${canAgree ? `<button class="btn-primary" id="btn-agree-est" type="button">Отметить согласование</button>` : ""}
      ${doc ? `<button class="btn-ghost" id="btn-export-est" type="button">Выгрузить PDF</button>` : ""}
    </div>
    <div class="budget-summary">
      <div>Рабочая редакция отличается по итогу стоимости: <b>${dl >= 0 ? "+" : ""}${fmtM2(dl)}</b> — изменения копятся в рабочей редакции с признаком "изменено"</div>
      <div>Согласование регистрируется событием в карточке документа "${esc(doc ? doc.name : v.id)}"; события не стирают друг друга</div>
    </div>`;
}

/* строка рабочей редакции: формула строки и значение Коэф. 2 (ТЗ "Финансы" 2.4–2.5) */
function openEstRow(p, w) {
  const added = c2added(p);
  const k2 = rowK2(w, added, true);
  const price = salePriceOf(w, added, true);
  mountModal(`
    <div class="modal">
      <div class="modal-title">Строка сметы · ${esc(workName(w))}</div>
      <div class="tbl-wrap"><table class="tbl tbl-fields"><tbody>
        <tr><td class="fld">Формула</td><td>Себестоимость = ROUND(${fmtQty(w.qty)} × ${fmtM2(w.price_buy)}; 2) = <b>${fmtM2(rowSebOf(w))}</b><br>
          Цена за ед. = ROUND(${fmtM2(w.price_buy)} × ${fmtQty(w.k1)} × ${fmtQty(k2)}; 1) = <b>${fmtM2(price)}</b><br>
          Стоимость = ROUND(${fmtQty(w.qty)} × ${fmtM2(price)}; 2) = <b>${fmtM2(rowCostOf(w, added, true))}</b></td></tr>
        <tr><td class="fld">Коэф. 2 строки</td><td>
          <input id="er-k2" type="number" min="0" step="any" value="${w.k2 == null ? "" : w.k2}"${added ? "" : " disabled"}>
          <div class="svod-src" style="margin-top:4px">${added ? "Значение строки входит в произведение до округления; действует только для строк СМР и отделочных работ" : "Коэф. 2 не добавлен в расчёт проекта — значение строки не действует"}</div>
        </td></tr>
      </tbody></table></div>
      <div class="modal-actions">
        <button class="btn-ghost" id="er-cancel" type="button">Закрыть</button>
        <button class="btn-primary" id="er-save" type="button"${added ? "" : " disabled"}>Сохранить</button>
      </div>
      <div class="note">Цена продажи вручную не заменяется: значение Коэф. 2 строки — часть коммерческого решения, как и Коэф. 1. Вознаграждение дизайнера — прирост стоимости строки от Коэф. 2, плановый расход.</div>
    </div>`);
  document.getElementById("er-cancel").addEventListener("click", closeAnyModal);
  document.getElementById("er-save").addEventListener("click", () => {
    const raw = document.getElementById("er-k2").value;
    const next = raw === "" ? null : parseFloat(raw);
    if ((w.k2 == null ? "" : w.k2) !== (next == null ? "" : next)) {
      w.k2 = next;
      logChange(p, "Финансы", `"${workName(w)}": Коэф. 2 строки — ${next == null ? "не задано" : next}`);
    }
    closeAnyModal();
    render();
  });
}

/* Сводный — вычисляемое представление (ТЗ "Финансы", Сводный: 14 показателей) */
function rSvodny(p) {
  if (svodProject !== p) { svodProject = p; svodSel = "auto"; }
  const t = finTotals(p);
  const added = c2added(p);
  const list = estList(p);
  const auto = svodSource(p);
  let src = auto;
  if (svodSel === "work") src = { kind: "work", note: "рабочая редакция — черновик" };
  else if (svodSel.startsWith("e")) {
    const v = list[+svodSel.slice(1)];
    if (v) src = { kind: "est", v, note: `${v.label} ${v.id} · ${fmtDate(v.date)} · ${estStateLabel(v).toLowerCase()}` };
  }
  let sale; let buy; let gain; let unevBuy = 0; let unevSale = 0;
  if (src.kind === "est") {
    sale = estSaleOf(src.v);
    buy = estSebOf(src.v);
    gain = (src.v.coef2 && src.v.coef2.added) ? estGainOf(src.v) : null;
    [ ...(src.v.works || []), ...(src.v.materials || []), ...(src.v.others || []) ].forEach((r) => {
      if (r.range) return;
      if (r.seb == null) unevBuy += 1;
      if (r.cost == null) unevSale += 1;
    });
  } else if (src.kind === "kp") {
    sale = src.sale;
    buy = null;
    gain = null;
  } else {
    const tt = calcTotals(calcGroups(p), added);
    sale = tt.sale; buy = tt.buy.sum; gain = added ? tt.gain : null;
    unevBuy = tt.buy.unev; unevSale = tt.sale.unev;
  }
  const lastEst = estLastAgreed(p);
  // предъявлена более поздняя несогласованная редакция — цепочка по умолчанию остаётся на согласованной
  const laterDraft = auto.kind === "est" && list.slice(list.indexOf(auto.v) + 1).some((x) => x.state !== "agreed");
  const state = [];
  if (unevBuy || unevSale) state.push(`позиций без цены, коэффициента или количества: закупочная сторона ${unevBuy}, продажная ${unevSale}`);
  if (added && !(p.coef2 && p.coef2.purpose)) state.push("назначение Коэф. 2 не задано — вознаграждение дизайнера не определено");
  if (t.unapprCnt) state.push(`записей табеля не утверждено: ${t.unapprCnt} (${t.hoursUnappr} ч)`);
  if (t.hoursNoRate) state.push(`труд без ставки: ${t.hoursNoRate} ч`);
  if (t.unconfCnt) state.push(`операций не подтверждено: ${t.unconfCnt} (${fmtM2(t.unconf)})`);
  const row = (i, name, value, srcNote) => `
    <tr><td>${i}</td><td>${name}</td><td class="num"><b>${value}</b></td><td class="svod-src">${srcNote}</td></tr>`;
  const opts = `<option value="auto"${svodSel === "auto" ? " selected" : ""}>цепочка по умолчанию — ${auto.kind === "est" ? "согласованная смета" : auto.kind === "kp" ? "согласованное КП (ориентировочно)" : "рабочая редакция (черновик)"}</option>
    <option value="work"${svodSel === "work" ? " selected" : ""}>рабочая редакция (черновик)</option>
    ${list.map((v, i) => `<option value="e${i}"${svodSel === "e" + i ? " selected" : ""}>${esc(v.label)} ${esc(v.id)} — ${esc(estStateLabel(v))} (${fmtDate(v.date)})</option>`).join("")}`;
  return `
    <div class="note fin-note">
      Редакция: <select class="flt-sel" id="svod-est">${opts}</select>
      · Период факта: весь проект · Цены — без НДС
    </div>
    ${laterDraft ? `<div class="note fin-note">Предъявлена более поздняя несогласованная редакция — цепочка по умолчанию остаётся на согласованной, пока согласование не зарегистрировано.</div>` : ""}
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>#</th><th>Показатель</th><th class="num">Значение</th><th>Источник</th></tr></thead>
      <tbody>
        ${row(1, "Продажная оценка", fmtSale(sale), `${src.note}${sale.range ? " · диапазон — предварительная оценка материалов" : ""}${unevSale ? ` · не оценено: ${unevSale} поз.` : ""}`)}
        ${row(2, "Закупочная оценка", buy == null ? `<span class="muted">—</span>` : fmtM2(buy), buy == null ? "согласованное КП закупочной стороны не содержит — показатель не считается" : `${src.note}${unevBuy ? ` · не оценено: ${unevBuy} поз.` : ""}`)}
        ${row(3, "Вознаграждение дизайнера",
          gain == null ? `<span class="muted">—</span>` : fmtM2(gain),
          gain == null ? "Коэф. 2 не добавлен или источник не содержит данных — расход не возникает или не считается" : `прирост от Коэф. 2 по строкам СМР и отделочных работ · ${src.note} · плановый расход, не денежный поток`)}
        ${buy == null
          ? row(4, "Плановая разница продажи и затрат", `<span class="muted">—</span>`, "закупочная оценка недоступна — разница не показывается")
          : row(4, "Плановая разница продажи и затрат", fmtM2(r2(sale.lo - r2(buy + (gain || 0)))), "строка 1 − (строка 2 + строка 3) · одна редакция — сопоставимый состав · ожидаемая величина, а не фактическая прибыль")}
        ${row(5, "Фактические часы", t.hoursAppr + " ч", `утверждённые записи табелей${t.unapprCnt ? ` · не утверждено: ${t.unapprCnt} зап. (${t.hoursUnappr} ч)` : ""}`)}
        ${row(6, "Стоимость труда по табелям", fmtM2(t.costAppr), `утверждённые часы × ставка даты работы${t.hoursNoRate ? ` · без ставки: ${t.hoursNoRate} ч` : ""}`)}
        ${row(7, "Поступления от клиента", fmtM2(t.income), "подтверждённые поступления за период с учётом возвратов клиенту")}
        ${row(8, "Денежные расходы проекта", fmtM2(t.expense), `подтверждённые расходы за период с учётом возвратов от контрагентов${t.transfers ? ` · внутренние переводы (${fmtM2(t.transfers)}) не учтены` : " · внутренние переводы не учитываются"}`)}
        ${row(9, "Денежный баланс проекта", fmtM2(r2(t.income - t.expense)), "строка 7 − строка 8 за один период")}
        ${row(10, "Не оплачено по счетам", fmtM2(t.unpaidInvoices), "выставленные и отправленные счета − распределённые по ним подтверждённые поступления")}
        ${row(11, "Аванс клиента", fmtM2(t.advance), "подтверждённые поступления, не распределённые по счетам, за вычетом возвратов клиенту")}
        ${row(12, "К оплате сейчас", fmtM2(t.toPayNow), "строка 10 − строка 11, не меньше нуля; излишек аванса остаётся в строке 11")}
        ${row(13, "Остаток по смете",
          lastEst ? fmtM2(r2(estSaleOf(lastEst).lo - t.income)) : `<span class="muted">—</span>`,
          lastEst
            ? `согласованная смета ${lastEst.id} (${fmtSale(estSaleOf(lastEst))}) − строка 7 · неоплаченная часть договорённостей, не наступивший долг`
            : "нет согласованной сметы — оценка по согласованному КП ориентировочная и долгов не создаёт")}
        ${row(14, "Состояние данных", state.length ? state.join("; ") : "неполноты не выявлены", "источники неполноты показателей")}
      </tbody>
    </table></div>
    <div class="note">Сводный — вычисляемое представление: собственных редактируемых итогов нет, каждый показатель раскрывается до источника. Цепочка по умолчанию: последняя согласованная смета; при её отсутствии — согласованное КП (ориентировочно, без закупочной стороны); при отсутствии и его — рабочая редакция (черновик). Показатели расчётов с клиентом ("Не оплачено по счетам", "К оплате сейчас", "Аванс клиента") денежными потоками не являются: первые два — требования по выставленным счетам, третий — полученные деньги, не закрытые счетами. Стоимость труда и денежные расходы показываются отдельно: полной фактической себестоимости (материалы, принятые работы подрядчиков) расчёт пока не даёт.</div>`;
}

/* цепочка по умолчанию для Сводного (ТЗ "Финансы", Сводный) */
function svodSource(p) {
  const est = estLastAgreed(p);
  if (est) return { kind: "est", v: est, note: `согласованная смета ${est.id} · ${fmtDate(est.date)}` };
  const kp = [...(p.docs || [])].reverse().find((d) => d.type === "КП" && docHasEvent(d, "agreed") && d.kp);
  if (kp) {
    const rows = kp.kp.rows || [];
    const exact = r2(rows.filter((r) => !r.range).reduce((a, r) => a + (kpRowCost(r) || 0), 0));
    const spread = r2(rows.filter((r) => r.range).reduce((a, r) => a + ((r.range.hi || 0) - (r.range.lo || 0)), 0));
    return { kind: "kp", d: kp, sale: { lo: exact, hi: r2(exact + spread), range: spread > 0 }, note: `согласованное КП ${kp.version || ""} · ${fmtDate(kp.date)} · ориентировочно` };
  }
  return { kind: "work", note: "рабочая редакция — черновик" };
}

/* снимок рабочей редакции плана (ТЗ "График" 5): входит в зафиксированный набор сметы и КП */
function snapshotPlan(p) {
  const src = schedRows(p, p.plan_start);
  if (!src.rows.length) return null;
  const rows = src.rows.map((r) => ({
    wid: r.w.id, stage: r.w.stage, room: r.w.room, element: r.w.element || null, work: r.w.work, unit: r.w.unit, qty: r.w.qty,
    norm: r.src === "norm" ? normOf(r.w).key : (r.w.norm || null),
    dur: r.dur, start: r.start ? dISO(r.start) : null, finish: r.finish ? dISO(r.finish) : null,
  }));
  return {
    version: "v" + ((p.fix_plan || []).length + 1),
    label: "Календарный план",
    short: "План",
    date: todayIso(),
    norms: DATA.norms.version,
    start: p.plan_start || null,
    premise: PLAN_PREMISE,
    calendar: PLAN_CALENDAR,
    rows,
  };
}

/* ТЗ "Финансы" 2.6: фиксация — сохранённая редакция сметы и документ; выпуск КП фиксирует набор
   (редакция сметы + снимок плана + КП) одним действием */
function fixEst(p, opts) {
  const o = opts || {};
  const added = c2added(p);
  const works = (p.works || []).map((w) => ({
    wid: w.id, stage: w.stage, room: w.room, work: w.work, unit: w.unit, qty: w.qty, comment: w.comment || null,
    price_buy: w.price_buy, k1: w.k1, k2: rowK2(w, added, true),
    seb: rowSebOf(w), price: salePriceOf(w, added, true), cost: rowCostOf(w, added, true),
  }));
  const materials = (p.materials || []).map((m) => (m.range
    ? { id: m.id, name: m.name, unit: m.unit, qty: m.qty, comment: m.comment || null, range: { lo: m.range.lo, hi: m.range.hi } }
    : { id: m.id, name: m.name, unit: m.unit, qty: m.qty, comment: m.comment || null, price_buy: m.price_buy, k1: m.k1, seb: rowSebOf(m), price: salePriceOf(m, added, false), cost: rowCostOf(m, added, false) }));
  const others = (p.others || []).map((x) => ({ id: x.id, name: x.name, unit: x.unit, qty: x.qty, comment: x.comment || null, price_buy: x.price_buy, k1: x.k1, seb: rowSebOf(x), price: salePriceOf(x, added, false), cost: rowCostOf(x, added, false) }));
  const tt = calcTotals(calcGroups(p), added);
  const v = {
    id: "v" + (estList(p).length + 1),
    label: o.kp ? "Редакция для КП" : "Зафиксированная редакция",
    date: todayIso(),
    state: "fixed",
    coef2: { ...(p.coef2 || { added: false }) },
    works, materials, others,
    totals: { seb: tt.buy.sum, sale: tt.sale.lo },
  };
  p.est = [...estList(p), v];
  const plan = snapshotPlan(p);
  if (plan) p.fix_plan = [...(p.fix_plan || []), plan];
  const doc = {
    name: (o.kp ? "КП " : "Смета ") + v.id + " — " + String(p.name || "").replace(/^\d{4}\.\s*/, ""),
    type: o.kp ? "КП" : "Смета",
    party: p.client ? p.client.name : "",
    date: v.date,
    version: v.id,
    events: [{ kind: "fixed", date: v.date, who: "Демо-пользователь", note: o.kp ? "КП сформировано — набор зафиксирован" : "редакция зафиксирована" }],
    est: v.id,
    plan: plan ? plan.version : null,
  };
  if (o.kp) doc.kp = { rows: o.kpRows || [], extra: !!o.extra };
  p.docs = [...(p.docs || []), doc];
  estSel = "e" + (p.est.length - 1);
  logChange(p, "Финансы", `${o.kp ? "КП сформировано" : "редакция сметы зафиксирована"}: ${v.id} — стоимость ${fmtSale(tt.sale)}; набор включает снимок плана${plan ? ` (${plan.version})` : ", план пуст"}; документ добавлен в "Документы"`);
  return doc;
}

/* ТЗ "Финансы" 2.7: "Сформировать КП" — отбор позиций по продажным ценам, объединение совместимых строк */
function openKpForm(p, mode) {
  const m = mode || "all";
  const added = c2added(p);
  const delta = clientDelta(p);
  const works = (p.works || []).filter((w) => salePriceOf(w, added, true) != null);
  const mats = (p.materials || []).filter((x) => x.range || salePriceOf(x, added, false) != null);
  const oths = (p.others || []).filter((x) => salePriceOf(x, added, false) != null);
  // дополнительный состав: позиции вне согласованной редакции и изменившиеся относительно неё (ТЗ "Финансы" 2.7)
  const extraIds = delta ? [...delta.flags.entries()].filter(([, fl]) => fl === "added" || fl === "changed").map(([k]) => k) : [];
  const extraMode = m === "extra";
  const defW = (w) => (extraMode ? extraIds.includes(w.id) : true);
  let mergeOn = true; // объединение совместимых строк — по умолчанию включено

  // объединяются работы с одинаковой работой, единицей и рассчитанной ценой; количество — сумма строк
  const mergePreview = (selWorks) => {
    const map = new Map();
    selWorks.forEach((w) => {
      const price = salePriceOf(w, added, true);
      const key = w.work + "||" + w.unit + "||" + price;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(w);
    });
    const rows = [];
    let mergedCnt = 0;
    map.forEach((list, key) => {
      const [work, unit, priceStr] = key.split("||");
      const price = parseFloat(priceStr);
      if (!mergeOn || list.length === 1) {
        list.forEach((w) => rows.push({ kind: "work", wid: w.id, room: w.room, work: w.work, unit: w.unit, qty: w.qty, price }));
        return;
      }
      mergedCnt += 1;
      rows.push({ kind: "work", merged: true, wids: list.map((w) => w.id), room: "—", work, unit, qty: r2(list.reduce((a, w) => a + (w.qty || 0), 0)), price });
    });
    return { rows, mergedCnt };
  };

  const matRow = (x) => x.range
    ? { kind: "material", id: x.id, name: x.name, unit: x.unit, qty: x.qty, range: { lo: x.range.lo, hi: x.range.hi } }
    : { kind: "material", id: x.id, name: x.name, unit: x.unit, qty: x.qty, price: salePriceOf(x, added, false) };
  const matPriceLabel = (x) => (x.range ? `от ${fmtM2(x.range.lo)} до ${fmtM2(x.range.hi)}` : fmtM2(salePriceOf(x, added, false)));
  const matCostLabel = (x) => (x.range ? `<span class="muted">диапазон</span>` : fmtM2(rowCostOf(x, added, false)));

  const wRowsHtml = works.map((w) => `
      <label class="chk-row">
        <input type="checkbox" data-wid="${w.id}"${defW(w) ? " checked" : ""}>
        <span class="chk-name">${esc(workName(w))}</span>
        <span class="muted">${esc(w.unit)}</span>
        <span class="num">${fmtQty(w.qty)}</span>
        <span class="num">${fmtM2(salePriceOf(w, added, true))}</span>
        <span class="num chk-cost"><b>${fmtM2(rowCostOf(w, added, true))}</b></span>
      </label>`).join("");
  const xRow = (x, kind) => `
      <label class="chk-row">
        <input type="checkbox" data-xid="${kind}-${x.id}"${extraMode ? "" : " checked"}>
        <span class="chk-name">${esc(x.name)}${kind === "mat" ? ` <span class="delta-chip delta-muted">предварительная оценка</span>` : ""}</span>
        <span class="muted">${esc(x.unit)}</span>
        <span class="num">${fmtQty(x.qty)}</span>
        <span class="num">${matPriceLabel(kind === "mat" ? x : x)}</span>
        <span class="num chk-cost"><b>${matCostLabel(kind === "mat" ? x : x)}</b></span>
      </label>`;
  const hasAny = works.length || mats.length || oths.length;

  mountModal(`
    <div class="modal wide">
      <div class="modal-title">Сформировать КП</div>
      <div class="subchips">
        <button class="fchip${m === "all" ? " active" : ""}" id="kp-mode-all" type="button"${hasAny ? "" : " disabled"}>Все оценённые позиции</button>
        <button class="fchip${extraMode ? " active" : ""}" id="kp-mode-extra" type="button"${extraIds.length ? "" : " disabled"}>Дополнительный состав (${extraIds.length})</button>
      </div>
      ${hasAny
        ? `<div class="chk-list">${wRowsHtml}${mats.map((x) => xRow(x, "mat")).join("")}${oths.map((x) => xRow(x, "oth")).join("")}</div>
           <div class="kp-total" id="kp-total"></div>`
        : `<div class="empty">Оценённых позиций в рабочей редакции нет — задайте закупочные цены и коэффициенты в "Сметах"</div>`}
      <div class="modal-actions">
        <button class="btn-ghost" id="kp-merge" type="button">Объединение совместимых строк: включено</button>
        <span class="spacer" style="flex:1"></span>
        <button class="btn-ghost" id="kp-cancel" type="button">Отмена</button>
        <button class="btn-primary" id="kp-create" type="button"${hasAny ? "" : " disabled"}>Создать КП</button>
      </div>
      <div class="note">Выпуск КП фиксирует набор: редакция сметы, снимок плана и документ КП создаются одним действием. КП формируется по продажным ценам рабочей редакции; объединяются совместимые работы с одинаковой единицей и одинаковой рассчитанной ценой — при разных ценах строки остаются раздельными, усреднённая цена не появляется. Количество объединённой строки — сумма количеств; строка хранит ссылки на исходные позиции, расшифровка объединений клиенту автоматически не передаётся. Диапазонные материалы попадают в КП границами. Внутренние цены, коэффициенты и вознаграждение дизайнера в КП не попадают.</div>
    </div>`);

  const selWorks = () => [...document.querySelectorAll(".chk-list input[data-wid]:checked")]
    .map((c) => works.find((w) => String(w.id) === c.dataset.wid)).filter(Boolean);
  const selX = (kind) => [...document.querySelectorAll(".chk-list input[data-xid]")]
    .filter((c) => c.dataset.xid.startsWith(kind + "-") && c.checked)
    .map((c) => (kind === "mat" ? mats : oths).find((x) => String(x.id) === c.dataset.xid.slice(4)))
    .filter(Boolean);

  const recount = () => {
    const sw = selWorks();
    const sm = selX("mat");
    const so = selX("oth");
    const prev = mergePreview(sw);
    const rows = [...prev.rows, ...sm.map(matRow), ...so.map((x) => ({ kind: "other", id: x.id, name: x.name, unit: x.unit, qty: x.qty, price: salePriceOf(x, added, false) }))];
    const exact = r2(rows.filter((r) => !r.range).reduce((a, r) => a + (kpRowCost(r) || 0), 0));
    const ranges = rows.filter((r) => r.range);
    const el = document.getElementById("kp-total");
    if (el) el.innerHTML = `
      <div>Выбрано: работ ${sw.length}, материалов ${sm.length}, прочих ${so.length}${prev.mergedCnt ? ` · объединённых строк: ${prev.mergedCnt}` : ""}</div>
      <div>Оценено точно: <b>${fmtM2(exact)}</b> · НДС 19 %: <b>${fmtM2(vatOf(exact))}</b> · Итого с НДС (без диапазона): <b>${fmtM2(r2(exact + vatOf(exact)))}</b>${ranges.length ? ` · материалы предварительно, границами: ${ranges.map((r) => `${fmtM2(r.range.lo)}–${fmtM2(r.range.hi)}`).join("; ")}` : ""}</div>`;
  };
  document.querySelectorAll(".chk-list input").forEach((c) => c.addEventListener("change", recount));
  document.getElementById("kp-cancel").addEventListener("click", closeAnyModal);
  document.getElementById("kp-mode-all").addEventListener("click", () => openKpForm(p, "all"));
  document.getElementById("kp-mode-extra").addEventListener("click", () => openKpForm(p, "extra"));
  document.getElementById("kp-merge").addEventListener("click", (e) => {
    mergeOn = !mergeOn;
    e.currentTarget.textContent = "Объединение совместимых строк: " + (mergeOn ? "включено" : "выключено");
    recount();
  });
  document.getElementById("kp-create").addEventListener("click", () => {
    const sw = selWorks();
    const sm = selX("mat");
    const so = selX("oth");
    if (!sw.length && !sm.length && !so.length) return;
    const prev = mergePreview(sw);
    const rows = [
      ...prev.rows,
      ...sm.map(matRow),
      ...so.map((x) => ({ kind: "other", id: x.id, name: x.name, unit: x.unit, qty: x.qty, price: salePriceOf(x, added, false) })),
    ];
    const doc = fixEst(p, { kp: true, kpRows: rows, extra: extraMode });
    closeAnyModal();
    openDocCard(p, doc);
  });
  recount();
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
const typeInfo = (p, o) => {
  const tp = opType(o);
  if (tp === "income") return { label: "Поступление", cls: "dir-in", sign: "+", num: "pos" };
  if (tp === "expense") return { label: "Расход", cls: "dir-out", sign: "−", num: "neg" };
  if (tp === "refund") {
    // сторона возврата определяется исходной операцией по связи refund_of, а не полем записи
    const src = (p.ops || []).find((x) => x !== o && x.status === "confirmed" && opType(x) !== "refund" && o.refund_of && x.purpose === o.refund_of);
    if (src && opType(src) === "expense") return { label: "Возврат от контрагента", cls: "dir-in", sign: "+", num: "pos" };
    if (src && opType(src) === "income") return { label: "Возврат клиенту", cls: "dir-out", sign: "−", num: "neg" };
    return { label: "Возврат", cls: "muted", sign: "", num: "muted" };
  }
  return { label: "Внутренний перевод", cls: "muted", sign: "", num: "muted" };
};

function rOps(p) {
  const list = p.ops || [];
  const body = list.map((o, i) => {
    const ti = typeInfo(p, o);
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
    const rec = {
      date: rd("op-date") || todayIso(),
      type: tp,
      purpose,
      party: rd("op-party"),
      amount,
      method: document.getElementById("op-method").value,
    };
    if (tp === "refund") {
      const refundEl = document.getElementById("op-refund");
      if (!refundEl.value) { refundEl.classList.add("input-err"); refundEl.focus(); return; }
      rec.refund_of = refundEl.value;
    }
    if (isNew) {
      rec.status = "unconfirmed";
      p.ops = [...(p.ops || []), rec];
      logChange(p, "Финансы", `добавлена операция (${typeInfo(p, rec).label.toLowerCase()}): ${rec.purpose}, ${fmtM2(rec.amount)} — не подтверждена`);
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
      : finView === "est" ? rEst(p)
      : finView === "labor" ? rLabor(p)
      : rOps(p)}`;
}

/* ТЗ "Финансы", расчёт: добавление позиции состава из расчёта — тот же носитель, что и в "Основном" */
function openWorkAdd(p) {
  const rooms = roomOptions(p);
  const elemSel = (roomName) => {
    const els = roomName && roomName !== ROOM_ANY ? roomElements(p, roomName).map((e) => e.name) : [];
    return `<select id="wa-el"><option value="">—</option>${els.map((e) => `<option value="${esc(e)}">${esc(e)}</option>`).join("")}</select>`;
  };
  mountModal(`
    <div class="modal">
      <div class="modal-title">Добавить позицию состава</div>
      <div class="form-skel">
        <label>Стадия</label>
        <select id="wa-stage">${WORK_STAGES.map((s) => `<option value="${s.id}"${s.id === 1 ? " selected" : ""}>${s.id}. ${esc(s.label)}</option>`).join("")}</select>
        <label>Помещение</label>
        <select id="wa-room">${rooms.map((r) => `<option value="${esc(r)}"${r === ROOM_ANY ? " selected" : ""}>${esc(r)}</option>`).join("")}</select>
        <label>Элемент, часть или изделие</label>
        <div id="wa-el-wrap">${elemSel(ROOM_ANY)}</div>
        <label>Работа</label>
        <input id="wa-work" type="text" autocomplete="off">
        <label>Ед.</label>
        <input id="wa-unit" type="text" autocomplete="off">
        <label>Кол&#8209;во</label>
        <input id="wa-qty" type="number" min="0" step="any">
      </div>
      <div class="modal-actions">
        <button class="btn-ghost" id="wa-cancel" type="button">Отмена</button>
        <button class="btn-primary" id="wa-save" type="button">Добавить</button>
      </div>
      <div class="note">Позиция создаётся в том же составе, что и в "Основном": появляется в обоих представлениях, копии не создаётся. Закупочная цена и коэффициенты — пустые: новая позиция в расчёте не оценена до их ввода.</div>
    </div>`);
  document.getElementById("wa-room").addEventListener("change", (e) => {
    document.getElementById("wa-el-wrap").innerHTML = elemSel(e.target.value);
  });
  document.getElementById("wa-cancel").addEventListener("click", closeAnyModal);
  document.getElementById("wa-save").addEventListener("click", () => {
    const workEl = document.getElementById("wa-work");
    const work = workEl.value.trim();
    if (!work) { workEl.classList.add("input-err"); workEl.focus(); return; }
    const room = document.getElementById("wa-room").value;
    const qv = document.getElementById("wa-qty").value;
    const maxId = (p.works || []).reduce((m, w) => Math.max(m, w.id || 0), 0);
    p.works = [...(p.works || []), {
      id: maxId + 1,
      stage: parseInt(document.getElementById("wa-stage").value, 10) || 1,
      room,
      element: room === ROOM_ANY ? null : (document.getElementById("wa-el").value || null),
      work,
      unit: document.getElementById("wa-unit").value.trim(),
      qty: qv === "" ? null : parseFloat(qv),
      scope: null, origin: null, rel: [],
      price_buy: null, k1: null, k2: 1,
      wstate: "planned",
    }];
    logChange(p, "Финансы", `Сметы: добавлена позиция состава "${room} / ${work}" — появляется и в "Основном"`);
    closeAnyModal();
    render();
  });
  document.getElementById("wa-work").focus();
}

/* ТЗ "Финансы" 2.2: добавление строки материалов — точными ценами или границами оценки */
function openCalcRow(p, kind) {
  const isMat = kind === "mat";
  let byRange = false;
  const renderFields = () => {
    const priceFields = `
        <label>Вн. цена за ед., €</label>
        <input id="cx-buy" type="number" min="0" step="any">
        <label>Коэф. 1</label>
        <input id="cx-k1" type="number" min="0" step="any">`;
    const rangeFields = `
        <label>Граница "от", €</label>
        <input id="cx-lo" type="number" min="0" step="any">
        <label>Граница "до", €</label>
        <input id="cx-hi" type="number" min="0" step="any">`;
    document.getElementById("cx-price-wrap").innerHTML = byRange ? rangeFields : priceFields;
  };
  mountModal(`
    <div class="modal">
      <div class="modal-title">${isMat ? "Добавить материал" : "Добавить работу"}</div>
      <div class="form-skel">
        <label>${isMat ? "Материал" : "Работа"}</label>
        <input id="cx-name" type="text" autocomplete="off">
        <label>Ед.</label>
        <input id="cx-unit" type="text" autocomplete="off" value="${isMat ? "компл" : "мес"}">
        <label>Кол&#8209;во</label>
        <input id="cx-qty" type="number" min="0" step="any">
        ${isMat ? `<label class="chk-row" style="margin:0"><input type="checkbox" id="cx-range"><span class="chk-name">Оценка границами (диапазон)</span></label>` : ""}
        <div id="cx-price-wrap"></div>
      </div>
      <div class="modal-actions">
        <button class="btn-ghost" id="cx-cancel" type="button">Отмена</button>
        <button class="btn-primary" id="cx-save" type="button">Добавить</button>
      </div>
      <div class="note">${isMat
        ? "Материалы — общая предварительная оценка. Границами — когда точная цена неизвестна: обе границы становятся значениями строки и входят в Итого диапазоном, закупочная сторона при этом не оценивается."
        : "Проектные, сопутствующие и повременные работы; месяцы и приведённые значения — не обязательный признак каждого заказа."}</div>
    </div>`);
  const cb = document.getElementById("cx-range");
  if (cb) cb.addEventListener("change", () => { byRange = cb.checked; renderFields(); });
  renderFields();
  document.getElementById("cx-cancel").addEventListener("click", closeAnyModal);
  document.getElementById("cx-save").addEventListener("click", () => {
    const nameEl = document.getElementById("cx-name");
    const name = nameEl.value.trim();
    if (!name) { nameEl.classList.add("input-err"); nameEl.focus(); return; }
    const rd = (id) => document.getElementById(id).value.trim();
    const num = (v) => (v === "" || v == null ? null : parseFloat(v));
    const list = isMat ? (p.materials = p.materials || []) : (p.others = p.others || []);
    const id = list.reduce((mx, x) => Math.max(mx, x.id || 0), 0) + 1;
    let rec;
    if (isMat && byRange) {
      const lo = num(rd("cx-lo"));
      const hi = num(rd("cx-hi"));
      if (lo == null || hi == null) {
        const bad = document.getElementById("cx-lo");
        bad.classList.add("input-err");
        bad.focus();
        return;
      }
      rec = { id, name, unit: rd("cx-unit"), qty: num(rd("cx-qty")), range: { lo, hi }, comment: "Предварительная оценка" };
    } else {
      rec = { id, name, unit: rd("cx-unit"), qty: num(rd("cx-qty")), price_buy: num(rd("cx-buy")), k1: num(rd("cx-k1")), k2: 1, comment: "" };
    }
    list.push(rec);
    logChange(p, "Финансы", `Сметы: добавлена строка ${isMat ? "материалов" : "прочих работ"} "${name}"${rec.range ? " — оценкой границами" : ""}`);
    closeAnyModal();
    render();
  });
  document.getElementById("cx-name").focus();
}

/* ---------------- График: исходный календарный план (ТЗ "Карточка проекта — График") ---------------- */

const PLAN_PREMISE = "2 чел. × 8 ч"; // 16 чел.-ч на смену — расчётная предпосылка источника, не назначенные сотрудники
const PLAN_CALENDAR = "пн–сб; воскресенье — выходной; паузы — в календарных днях";

/* ТЗ "График", данные нормы: строка файла норм — постоянный ключ, состав и применимость, единица, чел.-ч/ед., паузы */
const normRow = (key) => ((DATA.norms || { rows: [] }).rows.find((n) => n.key === key) || null);

/* подбор по составу и единице: единица совпадает и все ключевые слова применимости входят в название работы */
function autoNorm(w) {
  const nm = String(w.work || "").toLowerCase();
  const fits = (DATA.norms ? DATA.norms.rows : []).filter((n) => n.unit === w.unit && (n.keys || []).every((k) => nm.includes(k)));
  if (!fits.length) return null;
  /* самая конкретная норма: больше ключей состава; при равенстве — порядок реестра */
  return fits.reduce((best, n) => ((n.keys || []).length > (best.keys || []).length ? n : best), fits[0]);
}

/* норма строки: "" — явное "без нормы"; ключ — явное решение; не задано — подбор по составу и единице */
function normOf(w) {
  if (w.norm !== undefined) return w.norm === "" ? null : normRow(w.norm);
  return autoNorm(w);
}

/* идеальный расчёт: Трудоёмкость = Кол-во × Норма; CEIL считается в целых сантичасах —
   округление до смены не зависит от накопления ошибки числа с плавающей точкой */
function normHoursOf(w) {
  const n = normOf(w);
  if (!n || n.unit !== w.unit || w.qty == null) return null;
  const centi = Math.round(w.qty * n.hours * 100);
  return { n, centi, hours: centi / 100 };
}
function durOf(w) {
  if (w.dur && w.dur.days != null) return { days: w.dur.days, src: "manual", why: w.dur.why || "", hours: null };
  const h = normHoursOf(w);
  if (!h) return null;
  return { days: Math.max(1, Math.ceil(h.centi / 1600)), src: "norm", hours: h.hours };
}

/* календарь пн–сб: воскресенье — выходной; паузы — в календарных днях */
const dISO = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const dParse = (iso) => new Date(iso + "T00:00:00");
const rollToWork = (d) => { const x = new Date(d); while (x.getDay() === 0) x.setDate(x.getDate() + 1); return x; };
const addCal = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const firstWorkOnOrAfter = (iso) => rollToWork(dParse(iso));

/* строки графика: топологический обход состава; зависимая работа — после финиша предшественника
   и паузы его нормы (минимум один день); независимые последовательности идут параллельно */
function schedRows(p, startIso) {
  const works = p.works || [];
  const byId = new Map(works.map((w) => [w.id, w]));
  const memo = new Map();
  const visit = (w, depth) => {
    if (memo.has(w.id)) return memo.get(w.id);
    const n = normOf(w);
    const d = durOf(w);
    const row = { w, hours: d && d.src === "norm" ? d.hours : null, dur: d ? d.days : null, src: d ? d.src : null,
      start: null, finish: null, pause: (n && n.pause) || 0 };
    memo.set(w.id, row);
    if (d && startIso && depth < 100) {
      let earliest = firstWorkOnOrAfter(startIso);
      (w.rel || []).forEach((pid) => {
        const pred = byId.get(pid);
        const pr = pred ? visit(pred, depth + 1) : null;
        if (!pr || !pr.finish) return; // предшественник без длительности или даты — связь старт не сдвигает
        const cand = rollToWork(addCal(pr.finish, Math.max(pr.pause, 1)));
        if (cand > earliest) earliest = cand;
      });
      row.start = earliest;
      let f = new Date(earliest);
      for (let i = 1; i < d.days; i++) f = rollToWork(addCal(f, 1));
      row.finish = f;
    }
    return row;
  };
  const rows = works.map((w) => visit(w, 0));
  const t = { cnt: rows.length, byNorm: 0, manual: 0, none: 0, hours: 0, finish: null };
  rows.forEach((r) => {
    if (r.src === "norm") { t.byNorm += 1; t.hours = r2(t.hours + r.hours); }
    else if (r.src === "manual") t.manual += 1;
    else t.none += 1;
    if (r.finish && (!t.finish || r.finish > t.finish)) t.finish = r.finish;
  });
  return { rows, totals: t };
}

/* зафиксированные версии плана — переключатели, как у бюджетов (ТЗ "График", два состояния) */
function fixedPlan(p) {
  const fl = p.fix_plan || [];
  const i = planVer.startsWith("f") ? parseInt(planVer.slice(1), 10) : -1;
  return i >= 0 && i < fl.length ? fl[i] : null;
}
function planChips(p) {
  const fl = p.fix_plan || [];
  const s = fixedPlan(p);
  return fl.length ? `
    <div class="subchips">
      <button class="fchip${s ? "" : " active"}" data-pver="work" type="button">Рабочая редакция</button>
      ${fl.map((v, i) => `<button class="fchip${v === s ? " active" : ""}" data-pver="f${i}" type="button">${esc(v.short)} ${esc(v.version)} (${fmtDate(v.date)})</button>`).join("")}
    </div>` : `
    <div class="subchips"><span class="fchip active">Рабочая редакция</span></div>`;
}

/* раскрытие строки рабочей редакции: элемент, количество, норма и расчёт длительности (ТЗ "График", представление) */
function openPlanRow(p, w) {
  const auto = autoNorm(w);
  const explicit = w.norm !== undefined;
  const cur = explicit ? (w.norm || "") : (auto && auto.unit === w.unit ? auto.key : "");
  const normOpt = (n) => {
    const ok = n.unit === w.unit;
    return `<option value="${n.key}"${cur === n.key ? " selected" : ""}${ok ? "" : " disabled"}>${n.key} · ${esc(n.title)} — ${esc(n.applies)} (${esc(n.unit)}, ${n.hours} чел.-ч/ед.)${n.pause ? `, пауза ${n.pause} к.д.` : ""}${ok ? "" : " — единица не совпадает"}</option>`;
  };
  const calcLine = (key) => {
    if (w.dur && w.dur.days != null) return `Длительность задана вручную: <b>${w.dur.days} смен</b>${w.dur.why ? ` — ${esc(w.dur.why)}` : ""}; расчёт по норме её не подменяет`;
    const n = key ? normRow(key) : null;
    if (!n || n.unit !== w.unit || w.qty == null) return `Длительность: <span class="muted">[ ]</span> — подходящей нормы нет или единица не совпала; автоматическая "одна смена" не подставляется`;
    const centi = Math.round(w.qty * n.hours * 100);
    const h = centi / 100;
    const d = Math.max(1, Math.ceil(centi / 1600));
    return `Трудоёмкость = ${fmtQty(w.qty)} × ${n.hours} = ${fmtQty(h)} чел.-ч · Длительность = MAX(1, CEIL(${fmtQty(h)} ÷ 16)) = <b>${d} смен</b> — округление каждой строки до целой смены`;
  };
  const preds = (w.rel || []).map((id) => (p.works || []).find((x) => x.id === id)).filter(Boolean);
  mountModal(`
    <div class="modal">
      <div class="modal-title">Строка графика · ${esc(workName(w))}</div>
      <div class="tbl-wrap"><table class="tbl tbl-fields"><tbody>
        <tr><td class="fld">Стадия</td><td>${stageCell(w.stage)}</td></tr>
        <tr><td class="fld">Помещение</td><td>${esc(w.room)}</td></tr>
        <tr><td class="fld">Элемент, часть или изделие</td><td>${w.element ? esc(w.element) : `<span class="muted">—</span>`}</td></tr>
        <tr><td class="fld">Работа</td><td>${esc(w.work)}</td></tr>
        <tr><td class="fld">Единица и количество</td><td>${esc(w.unit || "—")} · ${fmtQty(w.qty)}</td></tr>
        <tr><td class="fld">Норма</td><td>
          <select id="pr-norm">
            <option value=""${!cur ? " selected" : ""}>— без нормы (длительность [ ])</option>
            ${DATA.norms.rows.map(normOpt).join("")}
          </select>
          <div class="svod-src" style="margin-top:4px">${explicit ? "Назначено явным решением" : (cur ? "Подобрано по составу и единице; выбор фиксирует явное решение у строки" : "Подходящей нормы нет")} · файл норм: ${esc(DATA.norms.name)}, версия ${esc(DATA.norms.version)}</div>
        </td></tr>
        <tr><td class="fld">Расчёт длительности</td><td id="pr-calc">${calcLine(cur)}</td></tr>
        <tr><td class="fld">Ручная длительность, смен</td><td>
          <input id="pr-dur" type="number" min="1" step="1" value="${w.dur && w.dur.days != null ? w.dur.days : ""}" placeholder="—">
          <input id="pr-why" type="text" style="margin-top:6px" value="${esc(w.dur ? w.dur.why || "" : "")}" placeholder="основание: источник, опыт объекта, решение">
          <div class="svod-src" style="margin-top:4px">Обоснованный ручной ввод при отсутствии нормы или отклонении от неё; перекрывает расчёт по норме</div>
        </td></tr>
        <tr><td class="fld">Последовательность</td><td>${preds.length
          ? preds.map((x) => { const n = normOf(x); return `"${esc(workName(x))}"${n && n.pause ? ` (пауза ${n.pause} к.д.)` : ""}`; }).join("; ") + " — технологические предшественники"
          : `<span class="muted">нет — от начальной даты, параллельно с независимыми последовательностями</span>`}</td></tr>
        <tr><td class="fld">Состояние работы</td><td>${wstateChip(w)}${w.why ? `<div class="svod-src">${esc(w.why)}</div>` : ""}<div class="svod-src" style="margin-top:4px">Строка графика показывает состояние работы позиции ("Карточка проекта", 2.6)</div></td></tr>
      </tbody></table></div>
      <div class="modal-actions">
        <button class="btn-ghost" id="pr-cancel" type="button">Закрыть</button>
        <button class="btn-primary" id="pr-save" type="button">Сохранить</button>
      </div>
      <div class="note">Норма сопоставляется по составу и единице: норма с включённой подготовкой не применяется к строке отдельной операции без явного решения; одна операция не нормируется дважды. Пауза берётся из нормы предшественника; отсутствующая в файле норм пауза задаётся обоснованием графика.</div>
    </div>`);
  document.getElementById("pr-norm").addEventListener("change", (e) => {
    document.getElementById("pr-calc").innerHTML = calcLine(e.target.value);
  });
  document.getElementById("pr-cancel").addEventListener("click", closeAnyModal);
  document.getElementById("pr-save").addEventListener("click", () => {
    const selVal = document.getElementById("pr-norm").value;
    const ch = [];
    if (selVal !== cur) {
      w.norm = selVal; // "" — явное "без нормы"
      ch.push(selVal ? `норма ${selVal} назначена явным решением` : "норма не назначена — длительность [ ] или ручной ввод");
    }
    const daysRaw = document.getElementById("pr-dur").value;
    const why = document.getElementById("pr-why").value.trim();
    const newDur = daysRaw === "" ? null : { days: parseInt(daysRaw, 10), why };
    if (JSON.stringify(w.dur || null) !== JSON.stringify(newDur)) {
      w.dur = newDur;
      ch.push(newDur ? `длительность вручную: ${newDur.days} смен${newDur.why ? ` — ${newDur.why}` : ""}` : "ручная длительность снята — действует расчёт по норме или [ ]");
    }
    if (ch.length) logChange(p, "График", `"${workName(w)}": ${ch.join("; ")}`);
    closeAnyModal();
    render();
  });
}

/* раскрытие строки зафиксированной версии: значения сохранены в самой версии */
function openPlanRowFixed(p, v, r) {
  const n = r.norm ? normRow(r.norm) : null;
  let calc;
  if (r.dur == null) calc = `<span class="muted">[ ]</span> — длительность не была рассчитана`;
  else if (n && n.unit === r.unit && r.qty != null) {
    const centi = Math.round(r.qty * n.hours * 100);
    calc = `Трудоёмкость = ${fmtQty(r.qty)} × ${n.hours} = ${fmtQty(centi / 100)} чел.-ч · Длительность = MAX(1, CEIL(${fmtQty(centi / 100)} ÷ 16)) = <b>${r.dur} смен</b>`;
  } else calc = `Длительность: <b>${r.dur} смен</b> — ручной ввод с основанием`;
  const w = (p.works || []).find((x) => x.id === r.wid);
  mountModal(`
    <div class="modal">
      <div class="modal-title">Строка зафиксированного плана · ${esc(v.version)}</div>
      <div class="tbl-wrap"><table class="tbl tbl-fields"><tbody>
        <tr><td class="fld">Стадия</td><td>${stageCell(r.stage)}</td></tr>
        <tr><td class="fld">Помещение</td><td>${esc(r.room)}</td></tr>
        <tr><td class="fld">Работа</td><td>${esc(r.work)}</td></tr>
        <tr><td class="fld">Единица и количество</td><td>${esc(r.unit || "—")} · ${fmtQty(r.qty)}</td></tr>
        <tr><td class="fld">Норма</td><td>${n ? `${n.key} · ${esc(n.title)} — ${esc(n.applies)} (${esc(n.unit)}, ${n.hours} чел.-ч/ед.)` : `<span class="muted">[ ]</span>`} · файл норм, версия ${esc(v.norms || DATA.norms.version)}</td></tr>
        <tr><td class="fld">Расчёт длительности</td><td>${calc}</td></tr>
        <tr><td class="fld">Даты</td><td>${r.start ? `${fmtDate(r.start)} — ${fmtDate(r.finish)}` : `<span class="muted">—</span>`}</td></tr>
        <tr><td class="fld">Позиция состава</td><td>${w ? `#${r.wid} — в текущем составе` : `<span class="muted">#${r.wid} — исключена из состава после фиксации</span>`}</td></tr>
        <tr><td class="fld">Состояние работы</td><td>${w ? wstateChip(w) : `<span class="muted">исключена из состава</span>`}${w && w.why ? `<div class="svod-src">${esc(w.why)}</div>` : ""}</td></tr>
      </tbody></table></div>
      <div class="modal-actions"><button class="btn-ghost" id="pf-close" type="button">Закрыть</button></div>
      <div class="note">Зафиксированная версия неизменяема: состав, нормы, длительности, даты и параметры календаря сохранены в самой версии; загрузка нового файла норм план не переписывает.</div>
    </div>`);
  document.getElementById("pf-close").addEventListener("click", closeAnyModal);
}

/* зафиксированная версия плана: таблица версии + сравнение с рабочей редакцией */
function fixedPlanView(p, v) {
  const works = p.works || [];
  const inFix = new Map(v.rows.map((r) => [r.wid, r]));
  const cur = schedRows(p, p.plan_start);
  const curDur = new Map(cur.rows.map((r) => [r.w.id, r.dur]));
  const curById = new Map(works.map((w) => [w.id, w]));
  const added = works.filter((w) => !inFix.has(w.id));
  const excluded = v.rows.filter((r) => !curById.has(r.wid));
  const changed = v.rows.filter((r) => curById.has(r.wid) && curDur.get(r.wid) !== r.dur);
  const cmp = [];
  if (added.length) cmp.push(`добавлено: ${added.map((w) => `"${esc(workName(w))}"`).join(", ")}`);
  if (excluded.length) cmp.push(`исключено: ${excluded.map((r) => `"${esc(r.room)} / ${esc(r.work)}"`).join(", ")}`);
  if (changed.length) cmp.push(`длительность изменена: ${changed.map((r) => `"${esc(r.work)}" (${r.dur} → ${curDur.get(r.wid) == null ? "[ ]" : curDur.get(r.wid) + " смен"})`).join(", ")}`);
  const rows = v.rows.map((r, i) => `
    <tr class="row-click" data-fprow="${r.wid}" title="Раскрыть строку зафиксированной версии">
      <td>${i + 1}</td><td>${stageCell(r.stage)}</td><td>${esc(r.room)}</td><td>${esc(r.work)}</td>
      <td class="muted">${r.start ? fmtDate(r.start) : `[ ]`}</td>
      <td class="muted">${r.finish ? fmtDate(r.finish) : `[ ]`}</td>
      <td>${curById.get(r.wid) ? wstateChip(curById.get(r.wid)) : `<span class="chip chip-doc-draft">Исключена</span>`}</td>
    </tr>`).join("");
  return `
    <div class="fix-cap"><b>${esc(v.label)} · ${esc(v.version)}</b> — зафиксирован ${fmtDate(v.date)} · предпосылка ${esc(v.premise)} · календарь: ${esc(v.calendar)}${v.start ? ` · начальная дата ${fmtDate(v.start)}` : " · без начальной даты"} · файл норм, версия ${esc(v.norms || DATA.norms.version)}</div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>#</th><th>Стадия</th><th>Помещение</th><th>Работа</th><th>Старт</th><th>Финиш</th><th>Состояние работы</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <div class="budget-summary"><div>${cmp.length ? "К рабочей редакции: " + cmp.join("; ") : "Рабочая редакция совпадает с версией по составу и длительностям"}</div></div>
    <div class="note">Зафиксированная версия неизменяема; новая фиксация — новая версия. Исходный календарный план — внутренний документ с выгрузкой в "Документах". Пересчёт меняет рабочую редакцию; зафиксированный план служит для сравнения.</div>`;
}

/* ТЗ "График", фиксация: "Зафиксировать план" — снимок рабочей редакции; документ получает событие фиксации */
function fixPlan(p) {
  const v = snapshotPlan(p);
  if (!v) return; // строк плана нет — фиксировать нечего
  p.fix_plan = [...(p.fix_plan || []), v];
  planVer = "f" + (p.fix_plan.length - 1);
  p.docs = [...(p.docs || []), {
    name: "Календарный план " + v.version + ".pdf",
    type: "Календарный план",
    party: p.pm ? p.pm.name : "",
    date: v.date,
    version: v.version,
    events: [{ kind: "fixed", date: v.date, who: "Демо-пользователь", note: "план зафиксирован" }],
    plan: v.version,
  }];
  logChange(p, "График", `план зафиксирован: ${v.version} (${fmtDate(v.date)}) — ${v.rows.length} позиций, предпосылка ${PLAN_PREMISE}${p.plan_start ? `, старт ${fmtDate(p.plan_start)}` : ", без начальной даты"}; документ добавлен в "Документы"`);
  render();
}

/* вкладка График: рабочая редакция или зафиксированная версия */
function rSchedule(p) {
  if (planProject !== p) { planProject = p; planVer = "work"; }
  if (!p.fix_plan) p.fix_plan = [];
  const v = fixedPlan(p);
  if (v) return planChips(p) + fixedPlanView(p, v);
  const src = schedRows(p, p.plan_start);
  const t = src.totals;
  const rows = src.rows.map((r, i) => `
    <tr class="row-click" data-prow="${r.w.id}" title="Раскрыть строку: элемент, количество, норма и расчёт длительности">
      <td>${i + 1}</td><td>${stageCell(r.w.stage)}</td><td>${esc(r.w.room)}</td><td>${esc(r.w.work)}</td>
      <td class="muted">${r.start ? fmtDate(r.start) : (r.dur == null ? `<span class="muted">[ ]</span>` : "—")}</td>
      <td class="muted">${r.finish ? fmtDate(r.finish) : (r.dur == null ? `<span class="muted">[ ]</span>` : "—")}</td>
      <td>${wstateChip(r.w)}</td>
    </tr>`).join("");
  return `
    ${planChips(p)}
    <div class="budget-actions"><button class="btn-ghost" id="btn-fix-plan" type="button">Зафиксировать план</button></div>
    <div class="note fin-note">
      Расчёт длительности: предпосылка ${PLAN_PREMISE} (16 чел.-ч на смену) — расчётная предпосылка источника, не назначенные сотрудники; сохраняется в версии. Календарь: ${PLAN_CALENDAR}. Каждая строка округляется до целой смены: MAX(1, CEIL(Трудоёмкость ÷ 16)).
      <div style="margin-top:8px">Начальная дата: <input type="date" id="sch-start" value="${esc(p.plan_start || "")}">${p.plan_start ? "" : ` <span class="muted">— не задана: показываются трудоёмкость, длительности и последовательность, календарные даты не подставляются</span>`}</div>
    </div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>#</th><th>Стадия</th><th>Помещение</th><th>Работа</th><th>Старт</th><th>Финиш</th><th>Состояние работы</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="7" class="muted">Состав не задан</td></tr>`}</tbody>
    </table></div>
    <div class="budget-summary">
      <div>Позиций: <b>${t.cnt}</b> · по норме: ${t.byNorm} · ручная длительность: ${t.manual} · длительность [ ]: ${t.none}</div>
      <div>Трудоёмкость по нормам: <b>${fmtQty(t.hours)} чел.-ч</b>${t.finish ? ` · финиш проекта: <b>${fmtDate(t.finish)}</b>` : ""} · открытых работ: <b>${openWorks(p).length}</b></div>
    </div>
    <div class="note">Строки — подробные позиции состава ("Основное"); объединённый КП строк графика не порождает. Общая оценка материалов и месяцы проектных, сопутствующих и повременных работ строительными операциями не становятся. Зависимая работа начинается после завершения предшественника и паузы его нормы (минимум один день); независимые последовательности идут параллельно. Деление площади на несколько строк сохраняет суммарные чел.-ч, календарная длительность может измениться из-за округления каждой строки до смены — это видно в расчёте строки.</div>`;
}

function bindSchedule(p) {
  document.querySelectorAll("[data-pver]").forEach((b) =>
    b.addEventListener("click", () => { planVer = b.dataset.pver; render(); }));
  const st = document.getElementById("sch-start");
  if (st) st.addEventListener("change", () => {
    const now = st.value || null;
    if ((p.plan_start || null) !== now) {
      p.plan_start = now;
      logChange(p, "График", now ? `начальная дата плана: ${fmtDate(now)}` : "начальная дата плана снята — календарные даты не показываются");
    }
    render();
  });
  document.querySelectorAll("tr[data-prow]").forEach((tr) =>
    tr.addEventListener("click", () => {
      const w = (p.works || []).find((x) => String(x.id) === tr.dataset.prow);
      if (w) openPlanRow(p, w);
    }));
  const v = fixedPlan(p);
  document.querySelectorAll("tr[data-fprow]").forEach((tr) =>
    tr.addEventListener("click", () => {
      const row = v && v.rows.find((r) => String(r.wid) === tr.dataset.fprow);
      if (v && row) openPlanRowFixed(p, v, row);
    }));
  const fx = document.getElementById("btn-fix-plan");
  if (fx) fx.addEventListener("click", () => fixPlan(p));
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
  { id: "schedule", label: "График", render: rSchedule },
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

/* ---------------- полоса потока (ТЗ "Карточка проекта", 2.3.1) ----------------
   Состояние шага вычисляется из данных проекта и вручную не назначается */
function flowSteps(p) {
  const docs = p.docs || [];
  const works = p.works || [];
  const t = finTotals(p);
  const lastDoc = (type) => [...docs].reverse().find((d) => d.type === type) || null;
  const pdGot = docs.some((d) => d.type === "Проектная документация" && docHasEvent(d, "received"));
  const estOk = works.filter((w) => w.price_buy != null && w.k1 != null);
  const sched = schedRows(p, p.plan_start);
  const schedDur = sched.rows.length > 0 && sched.rows.every((r) => r.dur != null);
  const finishes = sched.rows.map((r) => r.finish).filter(Boolean).sort();
  const kp = lastDoc("КП");
  const dog = lastDoc("Договор");
  const invSent = docs.some((d) => d.type === "Счёт" && docHasEvent(d, "sent"));
  const akt = lastDoc("Акт выполненных работ");
  const openCnt = openWorks(p).length;
  const st = (key, label, done, detail, tab, doc) => ({ key, label, done: !!done, detail, tab, doc: doc || null });
  const steps = [
    st("obj", "Объект и ПД", (p.rooms || []).length > 0 && pdGot, `${(p.rooms || []).length} пом.`, "facility"),
    st("sostav", "Состав", works.length > 0, `${works.length} поз.`, "general"),
    st("est", "Смета", works.length > 0 && estOk.length === works.length, works.length ? `оценено ${estOk.length} из ${works.length}` : "позиций нет", "finance"),
    st("sched", "График", schedDur, !sched.rows.length ? "строк нет" : (p.plan_start && finishes.length ? `финиш ${fmtDate(finishes[finishes.length - 1])}` : "без начальной даты"), "schedule"),
    st("kp", "КП", kp && docHasEvent(kp, "agreed"), kp ? docState(kp).label : "не выпущено", "documents", kp),
    st("dog", "Договор и предоплата", dog && docHasEvent(dog, "agreed") && invSent && t.income > 0, dog ? docState(dog).label : "документ не заведён", "documents", dog),
    st("smr", "СМР", p.stage === "smr" || p.stage === "postproekt", openCnt ? `открытых работ: ${openCnt}` : "открытых нет", "schedule"),
    st("akt", "Акт", akt && docHasEvent(akt, "agreed"), akt ? docState(akt).label : "не зарегистрирован", "documents", akt),
    st("post", "Пост-проектные", p.stage === "postproekt", p.stage === "postproekt" ? "этап достигнут" : "впереди", "general"),
  ];
  // "текущий" — шаг этапа проекта: предпроектные работы — первый непройденный шаг подготовки
  let current;
  if (p.stage === "smr") current = "smr";
  else if (p.stage === "postproekt") current = "post";
  else current = (steps.slice(0, 6).find((s) => !s.done) || {}).key || null;
  steps.forEach((s) => { s.state = s.key === current ? "current" : s.done ? "done" : s.key === "dog" && !dog ? "none" : "todo"; });
  return steps;
}

function rFlow(p) {
  const mark = { done: "✓", current: "●", todo: "○", none: "[ ]" };
  return `
    <div class="flow-strip" id="flow-strip">
      ${flowSteps(p).map((s) => `
        <button class="flow-step fs-${s.state}" data-fkey="${s.key}" type="button" title="${esc(s.label)} — ${esc(s.detail)}">
          <span class="fs-mark">${mark[s.state]}</span><span class="fs-label">${esc(s.label)}</span><span class="fs-detail">${esc(s.detail)}</span>
        </button>`).join("")}
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
  // клик по строке состава — позиция с её десятью сведениями (ТЗ "Основное", раскрытие строки)
  document.querySelectorAll("tr[data-work]").forEach((tr) =>
    tr.addEventListener("click", () => {
      const w = (p.works || []).find((x) => String(x.id) === tr.dataset.work);
      if (w) openWorkCard(p, w);
    }));
  const editBtn = document.getElementById("btn-comp-edit");
  if (editBtn) editBtn.addEventListener("click", () => {
    compEditing = (p.works || []).map((w) => ({ id: w.id, stage: w.stage || 1, room: w.room, element: w.element || "", work: w.work, unit: w.unit, qty: w.qty }));
    render();
  });
  if (compEditing) {
    document.querySelectorAll(".comp-edit [data-f]").forEach((inp) => {
      const handler = () => {
        const r = compEditing[+inp.dataset.i];
        const f = inp.dataset.f;
        if (!r) return;
        if (f === "qty") r.qty = inp.value === "" ? null : parseFloat(inp.value);
        else if (f === "stage") r.stage = parseInt(inp.value, 10) || 1;
        else r[f] = inp.value;
        // смена помещения обновляет перечень выбираемых элементов — черновик перерисовывается
        if (f === "room") render();
      };
      inp.addEventListener("input", handler);
      inp.addEventListener("change", handler);
    });
    document.querySelectorAll(".row-btn").forEach((b) => b.addEventListener("click", () => {
      const i = +b.dataset.i;
      const d = compEditing;
      if (b.dataset.act === "up" && i > 0) { const [x] = d.splice(i, 1); d.splice(i - 1, 0, x); }
      if (b.dataset.act === "down" && i < d.length - 1) { const [x] = d.splice(i, 1); d.splice(i + 1, 0, x); }
      if (b.dataset.act === "del") d.splice(i, 1);
      render();
    }));
    const add = document.getElementById("comp-add");
    if (add) add.addEventListener("click", () => { compEditing.push({ id: null, stage: 1, room: ROOM_ANY, element: "", work: "", unit: "", qty: null }); render(); });
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
  document.querySelectorAll("tr[data-doc]").forEach((tr) =>
    tr.addEventListener("click", () => {
      const d = (p.docs || [])[+tr.dataset.doc];
      if (d) openDocCard(p, d);
    }));
}

function bindFinance(p) {
  document.querySelectorAll("[data-fin]").forEach((b) =>
    b.addEventListener("click", () => { finView = b.dataset.fin; render(); }));
  document.querySelectorAll("[data-ever]").forEach((b) =>
    b.addEventListener("click", () => { estSel = b.dataset.ever; render(); }));

  /* Сметы, рабочая редакция: закупочные цены и коэффициенты; продажа пересчитывается, не вводится */
  const readNum = (v) => { const x = parseFloat(v); return v === "" || !Number.isFinite(x) ? null : x; };
  const calcInput = (sel, find, label) => {
    document.querySelectorAll(sel).forEach((inp) => inp.addEventListener("change", () => {
      const r = find(inp);
      if (!r) return;
      const k = inp.dataset.k;
      const next = k === "comment" ? inp.value.trim() : readNum(inp.value);
      if ((r[k] == null ? "" : r[k]) !== (next == null ? "" : next)) {
        const what = { price_buy: "вн. цена за ед.", k1: "Коэф. 1", comment: "комментарий" }[k] || k;
        logChange(p, "Финансы", `Сметы: "${label(r)}": ${what} ${r[k] == null || r[k] === "" ? "не задано" : r[k]} → ${next == null || next === "" ? "не задано" : next}`);
        r[k] = next;
        if (k === "price_buy" && r.price_check) r.price_check = false; // цена введена заново — проверка выполнена
      }
      render();
    }));
  };
  calcInput("[data-cw]", (inp) => (p.works || []).find((w) => String(w.id) === inp.dataset.cw), workName);
  calcInput("[data-cm]", (inp) => (p.materials || []).find((x) => String(x.id) === inp.dataset.cm), (x) => x.name);
  calcInput("[data-co]", (inp) => (p.others || []).find((x) => String(x.id) === inp.dataset.co), (x) => x.name);

  // границы диапазонной строки материалов (ТЗ "Финансы" 2.2): обе границы — значения строки
  document.querySelectorAll("[data-mr]").forEach((inp) => inp.addEventListener("change", () => {
    const m = (p.materials || []).find((x) => String(x.id) === inp.dataset.mr);
    if (!m || !m.range) return;
    const side = inp.dataset.k; // lo | hi
    const next = readNum(inp.value);
    if (next == null) return;
    if (m.range[side] !== next) {
      logChange(p, "Финансы", `Сметы: "${m.name}": граница ${side === "lo" ? "от" : "до"} ${fmtM2(m.range[side])} → ${fmtM2(next)}`);
      m.range[side] = next;
    }
    render();
  }));

  // строка СМР открывает формулу строки и Коэф. 2; правка полей кликом по строке не считается
  document.querySelectorAll("tr[data-cwork]").forEach((tr) =>
    tr.addEventListener("click", (e) => {
      if (e.target.closest("input")) return;
      const w = (p.works || []).find((x) => String(x.id) === tr.dataset.cwork);
      if (w) openEstRow(p, w);
    }));

  const c2 = document.getElementById("calc-c2");
  if (c2) c2.addEventListener("change", () => {
    p.coef2 = { ...(p.coef2 || {}), added: c2.checked };
    if (c2.checked && !p.coef2.purpose) p.coef2.purpose = "Вознаграждение дизайнера";
    logChange(p, "Финансы", `Коэф. 2 ${c2.checked ? "добавлен в расчёт проекта" : "исключён из расчёта проекта"}`);
    render();
  });
  const c2p = document.getElementById("calc-c2p");
  if (c2p) c2p.addEventListener("change", () => {
    p.coef2.purpose = c2p.value.trim() || null;
    render();
  });
  const matAdd = document.getElementById("mat-add");
  if (matAdd) matAdd.addEventListener("click", () => openCalcRow(p, "mat"));
  const workAdd = document.getElementById("work-add");
  if (workAdd) workAdd.addEventListener("click", () => openWorkAdd(p));
  const othAdd = document.getElementById("oth-add");
  if (othAdd) othAdd.addEventListener("click", () => openCalcRow(p, "oth"));
  document.querySelectorAll("[data-mdel]").forEach((b) => b.addEventListener("click", () => {
    const x = (p.materials || []).find((mm) => String(mm.id) === b.dataset.mdel);
    p.materials = (p.materials || []).filter((mm) => String(mm.id) !== b.dataset.mdel);
    logChange(p, "Финансы", `Сметы: исключена строка материалов "${x ? x.name : ""}"`);
    render();
  }));
  document.querySelectorAll("[data-odel]").forEach((b) => b.addEventListener("click", () => {
    const x = (p.others || []).find((oo) => String(oo.id) === b.dataset.odel);
    p.others = (p.others || []).filter((oo) => String(oo.id) !== b.dataset.odel);
    logChange(p, "Финансы", `Сметы: исключена строка прочих работ "${x ? x.name : ""}"`);
    render();
  }));

  const fixBtn = document.getElementById("btn-fix-est");
  if (fixBtn) fixBtn.addEventListener("click", () => { fixEst(p); render(); });
  const makeKp = document.getElementById("btn-make-kp");
  if (makeKp) makeKp.addEventListener("click", () => openKpForm(p, "all"));
  const agreeEst = document.getElementById("btn-agree-est");
  if (agreeEst) agreeEst.addEventListener("click", () => {
    const v = estSel.startsWith("e") ? estList(p)[+estSel.slice(1)] : null;
    const doc = v && (p.docs || []).find((x) => x.est === v.id);
    if (doc) openDocEvent(p, doc, "agreed");
  });
  const exportEst = document.getElementById("btn-export-est");
  if (exportEst) exportEst.addEventListener("click", () => {
    const v = estSel.startsWith("e") ? estList(p)[+estSel.slice(1)] : null;
    const doc = v && (p.docs || []).find((x) => x.est === v.id);
    if (doc) exportPdf(estHtml(p, doc));
  });
  const addOp = document.getElementById("btn-add-op");
  if (addOp) addOp.addEventListener("click", () => openOpCard(p, null));
  document.querySelectorAll("tr[data-op]").forEach((tr) =>
    tr.addEventListener("click", () => {
      const o = (p.ops || [])[+tr.dataset.op];
      if (o) openOpCard(p, o);
    }));
  const svodSelEl = document.getElementById("svod-est");
  if (svodSelEl) svodSelEl.addEventListener("change", () => { svodSel = svodSelEl.value; render(); });
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
        ${rFlow(p)}
        <nav class="tabs">
          ${TABS.map((t) => `<button class="tab${t.id === r.tab ? " active" : ""}" data-tab="${t.id}" type="button">${t.label}</button>`).join("")}
        </nav>
        <div class="tab-body">${tabTools(r.tab)}${active.render(p)}</div>
      </div>`;

    document.getElementById("crumb").innerHTML = `Проекты / <b>${esc(p.name)}</b>`;
    document.title = p.url + " — Карточка проекта";

    wrap.querySelectorAll(".tab").forEach((b) =>
      b.addEventListener("click", () => { location.hash = `#/${p.url}/${b.dataset.tab}`; }));

    // полоса потока: шаг с документом открывает его карточку, остальные — свою вкладку (ТЗ 2.3.1)
    wrap.querySelectorAll(".flow-step").forEach((b) =>
      b.addEventListener("click", () => {
        const s = flowSteps(p).find((x) => x.key === b.dataset.fkey);
        if (!s) return;
        if (s.doc) openDocCard(p, s.doc);
        else location.hash = `#/${p.url}/${s.tab}`;
      }));

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
    if (r.tab === "schedule") bindSchedule(p);
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
