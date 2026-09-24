/* Демо-данные. Все проекты, персоны, организации и суммы вымышлены. */
const DATA = {
 "demo": true,
 "projects": [
  {
   "id": 8,
   "name": "2608. Peyia Villa",
   "url": "2608-Peyia-Villa",
   "stage": "predproekt",
   "state": "initiated",
   "start_date": "2026-09-15",
   "end_date": null,
   "client": { "name": "Марина Лебедева", "phone": "+357 99 223 344", "tg": "@mlebedeva_demo" },
   "pm": { "name": "Анна Соколова", "phone": "+357 99 445 566", "tg": "@asokolova_demo" },
   "foreman": null,
   "client_rep": null,
   "tg_team": null,
   "tg_client": null,
   "vid_rabot": "Ремонт виллы",
   "zametki": "",
   "works": [
    { "id": 1, "room": "Весь объект", "work": "Демонтажные работы", "unit": "м²", "qty": 210, "price_int": null, "price_cli": null },
    { "id": 2, "room": "Кухня", "work": "Подготовка стен", "unit": "м²", "qty": 24, "price_int": null, "price_cli": null },
    { "id": 3, "room": "Санузел", "work": "Укладка плитки", "unit": "м²", "qty": 30, "price_int": null, "price_cli": null }
   ],
   "fix_int": [],
   "fix_cli": [],
   "docs": [
    { "name": "Обмерный план.pdf", "type": "Проектная документация", "dir": "in", "party": "Марина Лебедева", "date": "2026-09-16", "status": "received" },
    { "name": "Референсы. Подборка.pdf", "type": "Референсы", "dir": "in", "party": "Марина Лебедева", "date": "2026-09-17", "status": "processing" },
    { "name": "Коммерческое предложение.pdf", "type": "КП", "dir": "out", "party": "Марина Лебедева", "date": null, "status": "draft", "version": "v1" }
   ],
   "tasks": [
    { "num": 1, "title": "Уточнить объём подготовки стен в кухне", "author": "Анна Соколова", "created": "2026-09-23", "deadline": "2026-09-25", "assignee": "Анна Соколова", "status": "new" },
    { "num": 2, "title": "Собрать референсы для планировки", "author": "Анна Соколова", "created": "2026-09-16", "deadline": "2026-09-20", "assignee": "Анна Соколова", "status": "done" }
   ],
   "timesheets": [],
   "ops": [],
   "history": []
  },
  {
   "id": 7,
   "name": "2607. Polis Apartment",
   "url": "2607-Polis-Apartment",
   "stage": "smr",
   "state": "controlled",
   "start_date": "2026-06-05",
   "end_date": "2026-09-10",
   "client": { "name": "Александр Ветров", "phone": "+357 99 112 233", "tg": "@avetrov_demo" },
   "pm": { "name": "Анна Соколова", "phone": "+357 99 445 566", "tg": "@asokolova_demo" },
   "foreman": { "name": "Сергей Кравцов", "phone": "+357 99 778 899", "tg": "@skravtsov_demo" },
   "client_rep": null,
   "tg_team": "@meleshin_2607",
   "tg_client": "@meleshin_2607_client",
   "vid_rabot": "Ремонт квартиры под ключ",
   "zametki": "Парковка во дворе по разрешению; ключи у прораба.",
   "works": [
    { "id": 1, "room": "Кухня", "work": "Подготовка стен", "unit": "м²", "qty": 25, "price_int": 8, "price_cli": 12 },
    { "id": 2, "room": "Коридор", "work": "Установка розеток", "unit": "шт", "qty": 6, "price_int": 15, "price_cli": 25 },
    { "id": 3, "room": "Весь объект", "work": "Демонтажные работы", "unit": "м²", "qty": 68, "price_int": 7, "price_cli": 11 },
    { "id": 4, "room": "Весь объект", "work": "Электромонтажные работы", "unit": "шт", "qty": 96, "price_int": 24, "price_cli": 38 },
    { "id": 5, "room": "Весь объект", "work": "Штукатурка стен", "unit": "м²", "qty": 186, "price_int": 12, "price_cli": 18 },
    { "id": 6, "room": "Весь объект", "work": "Шпатлёвка и покраска", "unit": "м²", "qty": 254, "price_int": 9, "price_cli": 14 },
    { "id": 7, "room": "Весь объект", "work": "Стяжка пола", "unit": "м²", "qty": 62, "price_int": 14, "price_cli": 21 },
    { "id": 8, "room": "Весь объект", "work": "Укладка ламината", "unit": "м²", "qty": 46, "price_int": 13, "price_cli": 20 },
    { "id": 9, "room": "Санузел", "work": "Гидроизоляция", "unit": "м²", "qty": 9, "price_int": 16, "price_cli": 26 },
    { "id": 10, "room": "Санузел", "work": "Укладка плитки", "unit": "м²", "qty": 26, "price_int": 26, "price_cli": 42 },
    { "id": 11, "room": "Кухня", "work": "Укладка плитки", "unit": "м²", "qty": 12, "price_int": 26, "price_cli": 42 },
    { "id": 12, "room": "Весь объект", "work": "Сантехнические работы", "unit": "шт", "qty": 14, "price_int": 85, "price_cli": 135 },
    { "id": 13, "room": "Весь объект", "work": "Установка дверей", "unit": "шт", "qty": 5, "price_int": 120, "price_cli": 190 },
    { "id": 14, "room": "Весь объект", "work": "Монтаж гипсокартонных конструкций", "unit": "м²", "qty": 48, "price_int": 32, "price_cli": 48 }
   ],
   "fix_int": [
    {
     "label": "Исходный внутренний бюджет",
     "short": "Исходный",
     "version": "v1",
     "date": "2026-06-03",
     "vat": 0.19,
     "rows": [
      { "wid": 1, "room": "Кухня", "work": "Подготовка стен", "unit": "м²", "qty": 20, "price": 8 },
      { "wid": 2, "room": "Коридор", "work": "Установка розеток", "unit": "шт", "qty": 6, "price": 15 },
      { "wid": 3, "room": "Весь объект", "work": "Демонтажные работы", "unit": "м²", "qty": 68, "price": 7 },
      { "wid": 4, "room": "Весь объект", "work": "Электромонтажные работы", "unit": "шт", "qty": 96, "price": 24 },
      { "wid": 5, "room": "Весь объект", "work": "Штукатурка стен", "unit": "м²", "qty": 186, "price": 12 },
      { "wid": 6, "room": "Весь объект", "work": "Шпатлёвка и покраска", "unit": "м²", "qty": 254, "price": 9 },
      { "wid": 7, "room": "Весь объект", "work": "Стяжка пола", "unit": "м²", "qty": 62, "price": 14 },
      { "wid": 8, "room": "Весь объект", "work": "Укладка ламината", "unit": "м²", "qty": 46, "price": 13 },
      { "wid": 9, "room": "Санузел", "work": "Гидроизоляция", "unit": "м²", "qty": 9, "price": 16 },
      { "wid": 10, "room": "Санузел", "work": "Укладка плитки", "unit": "м²", "qty": 26, "price": 26 },
      { "wid": 11, "room": "Кухня", "work": "Укладка плитки", "unit": "м²", "qty": 12, "price": 26 },
      { "wid": 12, "room": "Весь объект", "work": "Сантехнические работы", "unit": "шт", "qty": 14, "price": 85 },
      { "wid": 13, "room": "Весь объект", "work": "Установка дверей", "unit": "шт", "qty": 5, "price": 120 }
     ]
    }
   ],
   "fix_cli": [
    {
     "label": "Согласованный Бюджет клиента",
     "short": "Согласованный",
     "version": "v2",
     "date": "2026-06-15",
     "vat": 0.19,
     "approved_by": "Александр Ветров, по электронной почте",
     "rows": [
      { "wid": 1, "room": "Кухня", "work": "Подготовка стен", "unit": "м²", "qty": 20, "price": 12 },
      { "wid": 2, "room": "Коридор", "work": "Установка розеток", "unit": "шт", "qty": 6, "price": 25 },
      { "wid": 3, "room": "Весь объект", "work": "Демонтажные работы", "unit": "м²", "qty": 68, "price": 11 },
      { "wid": 4, "room": "Весь объект", "work": "Электромонтажные работы", "unit": "шт", "qty": 96, "price": 38 },
      { "wid": 5, "room": "Весь объект", "work": "Штукатурка стен", "unit": "м²", "qty": 186, "price": 18 },
      { "wid": 6, "room": "Весь объект", "work": "Шпатлёвка и покраска", "unit": "м²", "qty": 254, "price": 14 },
      { "wid": 7, "room": "Весь объект", "work": "Стяжка пола", "unit": "м²", "qty": 62, "price": 21 },
      { "wid": 8, "room": "Весь объект", "work": "Укладка ламината", "unit": "м²", "qty": 46, "price": 20 },
      { "wid": 9, "room": "Санузел", "work": "Гидроизоляция", "unit": "м²", "qty": 9, "price": 26 },
      { "wid": 10, "room": "Санузел", "work": "Укладка плитки", "unit": "м²", "qty": 26, "price": 42 },
      { "wid": 11, "room": "Кухня", "work": "Укладка плитки", "unit": "м²", "qty": 12, "price": 42 },
      { "wid": 12, "room": "Весь объект", "work": "Сантехнические работы", "unit": "шт", "qty": 14, "price": 135 },
      { "wid": 13, "room": "Весь объект", "work": "Установка дверей", "unit": "шт", "qty": 5, "price": 190 },
      { "wid": 14, "room": "Весь объект", "work": "Монтаж гипсокартонных конструкций", "unit": "м²", "qty": 48, "price": 48 }
     ]
    }
   ],
   "docs": [
    { "name": "План помещения.pdf", "type": "Проектная документация", "dir": "in", "party": "Александр Ветров", "date": "2026-06-05", "status": "processed" },
    { "name": "Электрика. Схема.pdf", "type": "Проектная документация", "dir": "in", "party": "Александр Ветров", "date": "2026-06-11", "status": "processed" },
    { "name": "КП v1 — 2607. Polis Apartment", "type": "КП", "dir": "out", "party": "Александр Ветров", "date": "2026-06-10", "date_doc": "2026-06-09", "status": "sent", "version": "v1",
      "kp": { "extra": false, "rows": [
        { "wid": 3, "room": "Весь объект", "work": "Демонтажные работы", "unit": "м²", "qty": 68, "price": 11 },
        { "wid": 4, "room": "Весь объект", "work": "Электромонтажные работы", "unit": "шт", "qty": 96, "price": 38 },
        { "wid": 5, "room": "Весь объект", "work": "Штукатурка стен", "unit": "м²", "qty": 186, "price": 18 },
        { "wid": 6, "room": "Весь объект", "work": "Шпатлёвка и покраска", "unit": "м²", "qty": 254, "price": 14 },
        { "wid": 12, "room": "Весь объект", "work": "Сантехнические работы", "unit": "шт", "qty": 14, "price": 135 }
      ] } },
    { "name": "Счёт №1 (аванс).pdf", "type": "Счёт", "dir": "out", "party": "Александр Ветров", "date": "2026-06-01", "status": "sent", "version": "v1", "amount": 8000 },
    { "name": "Счёт №2.pdf", "type": "Счёт", "dir": "out", "party": "Александр Ветров", "date": "2026-06-28", "status": "sent", "version": "v1", "amount": 4200 },
    { "name": "Бюджет клиента.pdf", "type": "Бюджет клиента", "dir": "out", "party": "Александр Ветров", "date": "2026-06-15", "date_doc": "2026-06-15", "status": "sent", "version": "v2",
      "budget": { "kind": "cli", "label": "Согласованный Бюджет клиента", "approved_by": "Александр Ветров, по электронной почте", "rows": [
        { "wid": 1, "room": "Кухня", "work": "Подготовка стен", "unit": "м²", "qty": 20, "price": 12 },
        { "wid": 2, "room": "Коридор", "work": "Установка розеток", "unit": "шт", "qty": 6, "price": 25 },
        { "wid": 3, "room": "Весь объект", "work": "Демонтажные работы", "unit": "м²", "qty": 68, "price": 11 },
        { "wid": 4, "room": "Весь объект", "work": "Электромонтажные работы", "unit": "шт", "qty": 96, "price": 38 },
        { "wid": 5, "room": "Весь объект", "work": "Штукатурка стен", "unit": "м²", "qty": 186, "price": 18 },
        { "wid": 6, "room": "Весь объект", "work": "Шпатлёвка и покраска", "unit": "м²", "qty": 254, "price": 14 },
        { "wid": 7, "room": "Весь объект", "work": "Стяжка пола", "unit": "м²", "qty": 62, "price": 21 },
        { "wid": 8, "room": "Весь объект", "work": "Укладка ламината", "unit": "м²", "qty": 46, "price": 20 },
        { "wid": 9, "room": "Санузел", "work": "Гидроизоляция", "unit": "м²", "qty": 9, "price": 26 },
        { "wid": 10, "room": "Санузел", "work": "Укладка плитки", "unit": "м²", "qty": 26, "price": 42 },
        { "wid": 11, "room": "Кухня", "work": "Укладка плитки", "unit": "м²", "qty": 12, "price": 42 },
        { "wid": 12, "room": "Весь объект", "work": "Сантехнические работы", "unit": "шт", "qty": 14, "price": 135 },
        { "wid": 13, "room": "Весь объект", "work": "Установка дверей", "unit": "шт", "qty": 5, "price": 190 },
        { "wid": 14, "room": "Весь объект", "work": "Монтаж гипсокартонных конструкций", "unit": "м²", "qty": 48, "price": 48 }
      ] } },
    { "name": "Исходный внутренний бюджет.pdf", "type": "Внутренний бюджет", "dir": "int", "party": "Анна Соколова", "date": "2026-06-03", "date_doc": "2026-06-03", "status": "approved", "version": "v1",
      "budget": { "kind": "int", "label": "Исходный внутренний бюджет", "rows": [
        { "wid": 1, "room": "Кухня", "work": "Подготовка стен", "unit": "м²", "qty": 20, "price": 8 },
        { "wid": 2, "room": "Коридор", "work": "Установка розеток", "unit": "шт", "qty": 6, "price": 15 },
        { "wid": 3, "room": "Весь объект", "work": "Демонтажные работы", "unit": "м²", "qty": 68, "price": 7 },
        { "wid": 4, "room": "Весь объект", "work": "Электромонтажные работы", "unit": "шт", "qty": 96, "price": 24 },
        { "wid": 5, "room": "Весь объект", "work": "Штукатурка стен", "unit": "м²", "qty": 186, "price": 12 },
        { "wid": 6, "room": "Весь объект", "work": "Шпатлёвка и покраска", "unit": "м²", "qty": 254, "price": 9 },
        { "wid": 7, "room": "Весь объект", "work": "Стяжка пола", "unit": "м²", "qty": 62, "price": 14 },
        { "wid": 8, "room": "Весь объект", "work": "Укладка ламината", "unit": "м²", "qty": 46, "price": 13 },
        { "wid": 9, "room": "Санузел", "work": "Гидроизоляция", "unit": "м²", "qty": 9, "price": 16 },
        { "wid": 10, "room": "Санузел", "work": "Укладка плитки", "unit": "м²", "qty": 26, "price": 26 },
        { "wid": 11, "room": "Кухня", "work": "Укладка плитки", "unit": "м²", "qty": 12, "price": 26 },
        { "wid": 12, "room": "Весь объект", "work": "Сантехнические работы", "unit": "шт", "qty": 14, "price": 85 },
        { "wid": 13, "room": "Весь объект", "work": "Установка дверей", "unit": "шт", "qty": 5, "price": 120 }
      ] } }
   ],
   "tasks": [
    { "num": 1, "title": "Приёмка штукатурных работ", "author": "Анна Соколова", "created": "2026-06-20", "deadline": "2026-06-24", "assignee": "Сергей Кравцов", "status": "review" },
    { "num": 2, "title": "Заказать плитку для санузла", "author": "Анна Соколова", "created": "2026-06-05", "deadline": "2026-06-12", "assignee": "Анна Соколова", "status": "done" },
    { "num": 3, "title": "Согласовать изменение объёма подготовки стен", "author": "Анна Соколова", "created": "2026-09-20", "deadline": "2026-09-26", "assignee": "Анна Соколова", "status": "working" },
    { "num": 4, "title": "Обновить схему электрики", "author": "Сергей Кравцов", "created": "2026-06-10", "deadline": "2026-07-15", "assignee": "Сергей Кравцов", "status": "working" }
   ],
   "timesheets": [
    { "date": "2026-06-12", "person": "Сергей Кравцов", "work": "Демонтажные работы", "hours": 8, "rate": 15, "status": "approved", "work_id": 3 },
    { "date": "2026-06-13", "person": "Сергей Кравцов", "work": "Демонтажные работы", "hours": 8, "rate": 15, "status": "approved", "work_id": 3 },
    { "date": "2026-06-18", "person": "Анна Соколова", "work": "Контроль объекта", "hours": 4, "rate": 22, "status": "approved" },
    { "date": "2026-06-20", "person": "Сергей Кравцов", "work": "Штукатурка стен (приёмка)", "hours": 6, "rate": 15, "status": "draft", "work_id": 5 },
    { "date": "2026-06-22", "person": "Анна Соколова", "work": "Согласование бюджета клиента", "hours": 3, "rate": null, "status": "approved" }
   ],
   "ops": [
    { "date": "2026-06-05", "dir": "in", "purpose": "Аванс по счёту №1", "party": "Александр Ветров", "amount": 8000, "method": "Банковский перевод", "status": "confirmed", "doc": "Счёт №1 (аванс)" },
    { "date": "2026-07-01", "dir": "in", "purpose": "Оплата по счёту №2", "party": "Александр Ветров", "amount": 4200, "method": "Банковский перевод", "status": "confirmed", "doc": "Счёт №2" },
    { "date": "2026-06-10", "dir": "out", "purpose": "Электромонтаж: аванс подрядчику", "party": "ElecPro Ltd", "amount": 2400, "method": "Банковский перевод", "status": "confirmed", "doc": "Счёт ElecPro 1102" },
    { "date": "2026-06-30", "dir": "out", "purpose": "Зарплата за июнь: Кравцов (табели)", "party": "Сергей Кравцов", "amount": 240, "method": "Внутренний перевод", "status": "confirmed", "doc": null },
    { "date": "2026-06-30", "dir": "out", "purpose": "Зарплата за июнь: Соколова (табели)", "party": "Анна Соколова", "amount": 88, "method": "Внутренний перевод", "status": "confirmed", "doc": null },
    { "date": "2026-07-02", "dir": "out", "purpose": "Доставка материалов", "party": "Cyprus Logistics Ltd", "amount": 780, "method": "Карта", "status": "confirmed", "doc": null },
    { "date": "2026-07-15", "dir": "out", "purpose": "Материалы: плитка, клей", "party": "TileHouse Ltd", "amount": 3900, "method": "Банковский перевод", "status": "confirmed", "doc": "Счёт TileHouse 2601" },
    { "date": "2026-09-20", "dir": "out", "purpose": "Электрика: кабель-канал", "party": "ElecPro Ltd", "amount": 560, "method": "Карта", "status": "unconfirmed", "doc": null }
   ],
   "history": []
  },
  {
   "id": 6,
   "name": "2604. Nicosia Office",
   "url": "2604-Nicosia-Office",
   "stage": "postproekt",
   "state": "concluded",
   "start_date": "2026-02-10",
   "end_date": "2026-07-30",
   "client": { "name": "Андреас Пападопулос", "phone": "+357 99 334 455", "tg": "@apapadopulos_demo" },
   "pm": { "name": "Анна Соколова", "phone": "+357 99 445 566", "tg": "@asokolova_demo" },
   "foreman": { "name": "Дмитрий Гусев", "phone": "+357 99 556 677", "tg": "@dgusev_demo" },
   "client_rep": { "name": "Елена Христодулу", "phone": "+357 99 667 788", "tg": "@ehristodoulou_demo" },
   "tg_team": "@meleshin_2604",
   "tg_client": null,
   "vid_rabot": "Ремонт офиса",
   "zametki": "Гарантия 24 месяца с 30.07.2026.",
   "works": [
    { "id": 1, "room": "Весь объект", "work": "Демонтажные работы", "unit": "м²", "qty": 150, "price_int": 7, "price_cli": 11 },
    { "id": 2, "room": "Весь объект", "work": "Электромонтажные работы", "unit": "шт", "qty": 180, "price_int": 24, "price_cli": 38 },
    { "id": 3, "room": "Весь объект", "work": "Штукатурка стен", "unit": "м²", "qty": 420, "price_int": 12, "price_cli": 18 },
    { "id": 4, "room": "Весь объект", "work": "Шпатлёвка и покраска", "unit": "м²", "qty": 510, "price_int": 9, "price_cli": 14 },
    { "id": 5, "room": "Весь объект", "work": "Укладка напольной плитки", "unit": "м²", "qty": 88, "price_int": 26, "price_cli": 40 },
    { "id": 6, "room": "Весь объект", "work": "Сантехнические работы", "unit": "шт", "qty": 22, "price_int": 85, "price_cli": 135 },
    { "id": 7, "room": "Весь объект", "work": "Установка дверей", "unit": "шт", "qty": 9, "price_int": 120, "price_cli": 190 },
    { "id": 8, "room": "Переговорная", "work": "Монтаж гипсокартонных конструкций", "unit": "м²", "qty": 64, "price_int": 32, "price_cli": 48 },
    { "id": 9, "room": "Кухонная зона", "work": "Укладка плитки", "unit": "м²", "qty": 18, "price_int": 26, "price_cli": 42 },
    { "id": 10, "room": "Весь объект", "work": "Вывоз мусора и уборка", "unit": "компл", "qty": 1, "price_int": 210, "price_cli": 330 }
   ],
   "fix_int": [],
   "fix_cli": [
    {
     "label": "Согласованный Бюджет клиента",
     "short": "Согласованный",
     "version": "v3",
     "date": "2026-03-12",
     "vat": 0.19,
     "approved_by": "Андреас Пападопулос, на встрече",
     "rows": [
      { "wid": 1, "room": "Весь объект", "work": "Демонтажные работы", "unit": "м²", "qty": 150, "price": 11 },
      { "wid": 2, "room": "Весь объект", "work": "Электромонтажные работы", "unit": "шт", "qty": 180, "price": 38 },
      { "wid": 3, "room": "Весь объект", "work": "Штукатурка стен", "unit": "м²", "qty": 420, "price": 18 },
      { "wid": 4, "room": "Весь объект", "work": "Шпатлёвка и покраска", "unit": "м²", "qty": 510, "price": 14 },
      { "wid": 5, "room": "Весь объект", "work": "Укладка напольной плитки", "unit": "м²", "qty": 88, "price": 40 },
      { "wid": 6, "room": "Весь объект", "work": "Сантехнические работы", "unit": "шт", "qty": 22, "price": 135 },
      { "wid": 7, "room": "Весь объект", "work": "Установка дверей", "unit": "шт", "qty": 9, "price": 190 },
      { "wid": 8, "room": "Переговорная", "work": "Монтаж гипсокартонных конструкций", "unit": "м²", "qty": 64, "price": 48 },
      { "wid": 9, "room": "Кухонная зона", "work": "Укладка плитки", "unit": "м²", "qty": 18, "price": 42 },
      { "wid": 10, "room": "Весь объект", "work": "Вывоз мусора и уборка", "unit": "компл", "qty": 1, "price": 330 }
     ]
    }
   ],
   "docs": [
    { "name": "Рабочая документация. Комплект.pdf", "type": "Проектная документация", "dir": "in", "party": "Никос Георгиу (проектировщик)", "date": "2026-02-12", "status": "processed" },
    { "name": "Счёт №1 (аванс).pdf", "type": "Счёт", "dir": "out", "party": "Андреас Пападопулос", "date": "2026-02-14", "status": "sent", "version": "v1", "amount": 18000 },
    { "name": "Счёт №2 (финальный).pdf", "type": "Счёт", "dir": "out", "party": "Андреас Пападопулос", "date": "2026-04-28", "status": "sent", "version": "v1", "amount": 17548 },
    { "name": "Отчёт о завершении работ.pdf", "type": "Отчёт", "dir": "out", "party": "Андреас Пападопулос", "date": "2026-07-28", "status": "sent", "version": "v1" },
    { "name": "Акт приёмки.pdf", "type": "Акт", "dir": "in", "party": "Андреас Пападопулос", "date": "2026-07-30", "status": "received" }
   ],
   "tasks": [
    { "num": 1, "title": "Передать гарантийные документы", "author": "Анна Соколова", "created": "2026-07-25", "deadline": "2026-07-30", "assignee": "Дмитрий Гусев", "status": "done" },
    { "num": 2, "title": "Архивировать проект", "author": "Анна Соколова", "created": "2026-08-01", "deadline": "2026-08-05", "assignee": "Анна Соколова", "status": "done" }
   ],
   "timesheets": [
    { "date": "2026-02-14", "person": "Дмитрий Гусев", "work": "Демонтажные работы", "hours": 8, "rate": 15, "status": "approved", "work_id": 1 },
    { "date": "2026-03-20", "person": "Анна Соколова", "work": "Контроль объекта", "hours": 6, "rate": 22, "status": "approved" },
    { "date": "2026-06-25", "person": "Дмитрий Гусев", "work": "Установка дверей", "hours": 7, "rate": 15, "status": "approved", "work_id": 7 }
   ],
   "ops": [
    { "date": "2026-02-15", "dir": "in", "purpose": "Аванс по счёту №1", "party": "Андреас Пападопулос", "amount": 18000, "method": "Банковский перевод", "status": "confirmed", "doc": "Счёт №1 (аванс)" },
    { "date": "2026-04-30", "dir": "in", "purpose": "Оплата по счёту №2 (финальная)", "party": "Андреас Пападопулос", "amount": 17548, "method": "Банковский перевод", "status": "confirmed", "doc": "Счёт №2 (финальный)" },
    { "date": "2026-02-20", "dir": "out", "purpose": "Материалы: плитка, клей", "party": "TileHouse Ltd", "amount": 6400, "method": "Банковский перевод", "status": "confirmed", "doc": "Счёт TileHouse 2419" },
    { "date": "2026-03-05", "dir": "out", "purpose": "Электромонтаж: работа подрядчика", "party": "ElecPro Ltd", "amount": 3860, "method": "Банковский перевод", "status": "confirmed", "doc": "Счёт ElecPro 1088" },
    { "date": "2026-02-28", "dir": "out", "purpose": "Зарплата за февраль: Гусев (табели)", "party": "Дмитрий Гусев", "amount": 120, "method": "Внутренний перевод", "status": "confirmed", "doc": null },
    { "date": "2026-03-31", "dir": "out", "purpose": "Зарплата за март: Соколова (табели)", "party": "Анна Соколова", "amount": 132, "method": "Внутренний перевод", "status": "confirmed", "doc": null },
    { "date": "2026-06-30", "dir": "out", "purpose": "Зарплата за июнь: Гусев (табели)", "party": "Дмитрий Гусев", "amount": 105, "method": "Внутренний перевод", "status": "confirmed", "doc": null },
    { "date": "2026-07-15", "dir": "out", "purpose": "Финальная уборка", "party": "CleanCo Ltd", "amount": 330, "method": "Карта", "status": "confirmed", "doc": null }
   ],
   "history": []
  }
 ]
};
