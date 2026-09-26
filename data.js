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
   "coef2": { "added": true, "purpose": "Вознаграждение дизайнера" },
   "rooms": [
    { "name": "Кухня", "elements": [
      { "name": "Стены", "kind": "element", "measures": [ { "label": "Площадь стен", "value": 24, "unit": "м²", "source": "ПД: Обмерный план.pdf, лист 2" } ] }
    ] },
    { "name": "Санузел", "elements": [
      { "name": "Пол", "kind": "element", "measures": [ { "label": "Площадь пола", "value": 30, "unit": "м²", "source": "ПД: Обмерный план.pdf, лист 5" } ] },
      { "name": "Стены", "kind": "element", "measures": [ { "label": "Площадь стен", "value": 38, "unit": "м²", "source": "design-data, запись 7" } ] }
    ] },
    { "name": "Спальня", "elements": [
      { "name": "Стены", "kind": "element", "measures": [ { "label": "Площадь под окраску", "value": 40, "unit": "м²", "source": "ПД: Обмерный план.pdf, лист 3" } ] }
    ] },
    { "name": "Гостиная", "elements": [
      { "name": "Стены", "kind": "element", "measures": [ { "label": "Площадь под окраску", "value": 60, "unit": "м²", "source": "ПД: Обмерный план.pdf, лист 4" } ] }
    ] }
   ],
   "works": [
    { "id": 1, "stage": 2, "room": "Весь объект", "work": "Демонтажные работы", "unit": "м²", "qty": 210, "element": null,
      "scope": "Ручное значение: обследованная площадь под демонтаж", "origin": "Задание на словах (Марина Лебедева), 15.09.2026",
      "rel": [], "price_buy": null, "k1": null, "k2": 1 },
    { "id": 2, "stage": 11, "room": "Кухня", "work": "Подготовка стен (шпатлевание)", "unit": "м²", "qty": 24, "element": "Стены",
      "scope": "Прямое значение из ПД: площадь стен", "origin": "ПД: Обмерный план.pdf, лист 2; design-data 3",
      "rel": [], "price_buy": 4, "k1": 1.3, "k2": 1 },
    { "id": 3, "stage": 18, "room": "Спальня", "work": "Окраска стен", "unit": "м²", "qty": 40, "element": "Стены",
      "scope": "Формула: периметр × высота − проёмы", "origin": "ПД: Обмерный план.pdf, лист 3",
      "rel": [], "price_buy": 5, "k1": 1.3, "k2": 1.1 },
    { "id": 4, "stage": 18, "room": "Гостиная", "work": "Окраска стен", "unit": "м²", "qty": 60, "element": "Стены",
      "scope": "Формула: периметр × высота − проёмы", "origin": "ПД: Обмерный план.pdf, лист 4",
      "rel": [], "price_buy": 5, "k1": 1.3, "k2": 1.1 },
    { "id": 5, "stage": 12, "room": "Санузел", "work": "Укладка плитки", "unit": "м²", "qty": 30, "element": "Пол",
      "scope": "Прямое значение из ПД: площадь пола", "origin": "ПД: Обмерный план.pdf, лист 5",
      "rel": [], "price_buy": 22, "k1": 1.35, "k2": 1 }
   ],
   "materials": [
    { "id": 1, "name": "Черновые материалы", "unit": "компл", "qty": 1, "price_buy": 850, "k1": 1.2, "k2": 1, "comment": "Общая предварительная оценка" }
   ],
   "others": [
    { "id": 1, "name": "Работы по управлению проектом", "unit": "мес", "qty": 1, "price_buy": 150, "k1": 1.8, "k2": 1, "comment": "Предпроектное сопровождение" },
    { "id": 2, "name": "Сопутствующие работы", "unit": "мес", "qty": 1, "price_buy": 90, "k1": 1.8, "k2": 1, "comment": "" }
   ],
   "fix_calc": [],
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
   "coef2": { "added": false },
   "rooms": [
    { "name": "Кухня", "elements": [
      { "name": "Стены", "kind": "element", "measures": [ { "label": "Площадь стен", "value": 25, "unit": "м²", "source": "ПД: План помещения.pdf, лист 1" } ] }
    ] },
    { "name": "Коридор", "elements": [
      { "name": "Стены", "kind": "element", "measures": [ { "label": "Площадь стен", "value": 18, "unit": "м²", "source": "ПД: План помещения.pdf, лист 1" } ] }
    ] },
    { "name": "Санузел", "elements": [
      { "name": "Пол", "kind": "element", "measures": [ { "label": "Площадь пола", "value": 9, "unit": "м²", "source": "ПД: План помещения.pdf, лист 2" } ] },
      { "name": "Стены", "kind": "element", "measures": [ { "label": "Площадь стен под плитку", "value": 26, "unit": "м²", "source": "design-data, запись 12" } ] }
    ] }
   ],
   "works": [
    { "id": 1, "stage": 11, "room": "Кухня", "work": "Подготовка стен", "unit": "м²", "qty": 25, "element": "Стены",
      "scope": "Прямое значение из ПД", "origin": "ПД: План помещения.pdf, лист 1", "rel": [],
      "price_buy": 8, "k1": 1.5, "k2": 1 },
    { "id": 2, "stage": 17, "room": "Коридор", "work": "Установка розеток", "unit": "шт", "qty": 6, "element": "Стены",
      "scope": "Ручное значение: точки по схеме электрики", "origin": "ПД: Электрика. Схема.pdf, лист 1", "rel": [],
      "price_buy": 15, "k1": 1.5, "k2": 1 },
    { "id": 3, "stage": 2, "room": "Весь объект", "work": "Демонтажные работы", "unit": "м²", "qty": 68, "element": null,
      "scope": "Ручное значение: обследованная площадь", "origin": "Обследование 03.06.2026", "rel": [],
      "price_buy": 7, "k1": 1.5, "k2": 1 },
    { "id": 4, "stage": 5, "room": "Весь объект", "work": "Электромонтажные работы", "unit": "шт", "qty": 96, "element": null,
      "scope": "Прямое значение из ПД: количество точек", "origin": "ПД: Электрика. Схема.pdf, лист 1", "rel": [3],
      "price_buy": 24, "k1": 1.5, "k2": 1 },
    { "id": 5, "stage": 10, "room": "Весь объект", "work": "Штукатурка стен", "unit": "м²", "qty": 186, "element": null,
      "scope": "Формула: площадь стен − проёмы", "origin": "ПД: План помещения.pdf, лист 1; design-data 2", "rel": [3],
      "price_buy": 12, "k1": 1.5, "k2": 1 },
    { "id": 6, "stage": 18, "room": "Весь объект", "work": "Шпатлёвка и покраска", "unit": "м²", "qty": 254, "element": null,
      "scope": "Формула: площадь стен − проёмы", "origin": "ПД: План помещения.pdf, лист 1; design-data 2", "rel": [5],
      "price_buy": 9, "k1": 1.5, "k2": 1 },
    { "id": 7, "stage": 7, "room": "Весь объект", "work": "Стяжка пола", "unit": "м²", "qty": 62, "element": null,
      "scope": "Прямое значение из ПД: площадь полов", "origin": "ПД: План помещения.pdf, лист 1", "rel": [3],
      "price_buy": 14, "k1": 1.5, "k2": 1 },
    { "id": 8, "stage": 13, "room": "Весь объект", "work": "Укладка ламината", "unit": "м²", "qty": 46, "element": null,
      "scope": "Прямое значение из ПД: площадь полов", "origin": "ПД: План помещения.pdf, лист 1", "rel": [7],
      "price_buy": 13, "k1": 1.5, "k2": 1 },
    { "id": 9, "stage": 12, "room": "Санузел", "work": "Гидроизоляция", "unit": "м²", "qty": 9, "element": "Пол",
      "scope": "Прямое значение из ПД: площадь пола", "origin": "ПД: План помещения.pdf, лист 2", "rel": [7],
      "price_buy": 16, "k1": 1.5, "k2": 1 },
    { "id": 10, "stage": 12, "room": "Санузел", "work": "Укладка плитки", "unit": "м²", "qty": 26, "element": "Стены",
      "scope": "Прямое значение из ПД", "origin": "design-data, запись 12", "rel": [9],
      "price_buy": 26, "k1": 1.5, "k2": 1 },
    { "id": 11, "stage": 12, "room": "Кухня", "work": "Укладка плитки", "unit": "м²", "qty": 12, "element": null,
      "scope": "Ручное значение: фартук", "origin": "Уточнение прораба, 10.06.2026", "rel": [],
      "price_buy": 26, "k1": 1.5, "k2": 1 },
    { "id": 12, "stage": 15, "room": "Весь объект", "work": "Сантехнические работы", "unit": "шт", "qty": 14, "element": null,
      "scope": "Прямое значение из ПД: приборы", "origin": "ПД: План помещения.pdf, лист 3", "rel": [],
      "price_buy": 85, "k1": 1.5, "k2": 1 },
    { "id": 13, "stage": 16, "room": "Весь объект", "work": "Установка дверей", "unit": "шт", "qty": 5, "element": null,
      "scope": "Прямое значение из ПД: проёмы", "origin": "ПД: План помещения.pdf, лист 1", "rel": [],
      "price_buy": 120, "k1": 1.5, "k2": 1 },
    { "id": 14, "stage": 9, "room": "Весь объект", "work": "Монтаж гипсокартонных конструкций", "unit": "м²", "qty": 48, "element": null,
      "scope": "Ручное значение: по эскизу", "origin": "Эскиз дизайнера, 08.06.2026", "rel": [],
      "price_buy": 32, "k1": 1.5, "k2": 1 }
   ],
   "materials": [
    { "id": 1, "name": "Черновые материалы", "unit": "компл", "qty": 1, "price_buy": 1800, "k1": 1.15, "k2": 1, "comment": "Общая предварительная оценка" }
   ],
   "others": [
    { "id": 1, "name": "Работы по управлению проектом", "unit": "мес", "qty": 3, "price_buy": 300, "k1": 1.8, "k2": 1, "comment": "" }
   ],
   "fix_calc": [
    {
     "label": "Исходный внутренний бюджет",
     "short": "Исходный",
     "version": "v1",
     "date": "2026-06-03",
     "coef2": { "added": false },
     "works": [
      { "wid": 1, "stage": 11, "room": "Кухня", "work": "Подготовка стен", "unit": "м²", "qty": 20, "price_buy": 8, "k1": 1.5, "k2": 1 },
      { "wid": 2, "stage": 17, "room": "Коридор", "work": "Установка розеток", "unit": "шт", "qty": 6, "price_buy": 15, "k1": 1.5, "k2": 1 },
      { "wid": 3, "stage": 2, "room": "Весь объект", "work": "Демонтажные работы", "unit": "м²", "qty": 68, "price_buy": 7, "k1": 1.5, "k2": 1 },
      { "wid": 4, "stage": 5, "room": "Весь объект", "work": "Электромонтажные работы", "unit": "шт", "qty": 96, "price_buy": 24, "k1": 1.5, "k2": 1 },
      { "wid": 5, "stage": 10, "room": "Весь объект", "work": "Штукатурка стен", "unit": "м²", "qty": 186, "price_buy": 12, "k1": 1.5, "k2": 1 },
      { "wid": 6, "stage": 18, "room": "Весь объект", "work": "Шпатлёвка и покраска", "unit": "м²", "qty": 254, "price_buy": 9, "k1": 1.5, "k2": 1 },
      { "wid": 7, "stage": 7, "room": "Весь объект", "work": "Стяжка пола", "unit": "м²", "qty": 62, "price_buy": 14, "k1": 1.5, "k2": 1 },
      { "wid": 8, "stage": 13, "room": "Весь объект", "work": "Укладка ламината", "unit": "м²", "qty": 46, "price_buy": 13, "k1": 1.5, "k2": 1 },
      { "wid": 9, "stage": 12, "room": "Санузел", "work": "Гидроизоляция", "unit": "м²", "qty": 9, "price_buy": 16, "k1": 1.5, "k2": 1 },
      { "wid": 10, "stage": 12, "room": "Санузел", "work": "Укладка плитки", "unit": "м²", "qty": 26, "price_buy": 26, "k1": 1.5, "k2": 1 },
      { "wid": 11, "stage": 12, "room": "Кухня", "work": "Укладка плитки", "unit": "м²", "qty": 12, "price_buy": 26, "k1": 1.5, "k2": 1 },
      { "wid": 12, "stage": 15, "room": "Весь объект", "work": "Сантехнические работы", "unit": "шт", "qty": 14, "price_buy": 85, "k1": 1.5, "k2": 1 },
      { "wid": 13, "stage": 16, "room": "Весь объект", "work": "Установка дверей", "unit": "шт", "qty": 5, "price_buy": 120, "k1": 1.5, "k2": 1 }
     ],
     "materials": [
      { "id": 1, "name": "Черновые материалы", "unit": "компл", "qty": 1, "price_buy": 1800, "k1": 1.15, "k2": 1 }
     ],
     "others": [
      { "id": 1, "name": "Работы по управлению проектом", "unit": "мес", "qty": 3, "price_buy": 300, "k1": 1.8, "k2": 1 }
     ]
    }
   ],
   "fix_cli": [
    {
     "label": "Согласованный Бюджет клиента",
     "short": "Согласованный",
     "version": "v2",
     "date": "2026-06-15",
     "approved_by": "Александр Ветров, по электронной почте",
     "works": [
      { "wid": 1, "stage": 11, "room": "Кухня", "work": "Подготовка стен", "unit": "м²", "qty": 20, "price": 12 },
      { "wid": 2, "stage": 17, "room": "Коридор", "work": "Установка розеток", "unit": "шт", "qty": 6, "price": 22.5 },
      { "wid": 3, "stage": 2, "room": "Весь объект", "work": "Демонтажные работы", "unit": "м²", "qty": 68, "price": 10.5 },
      { "wid": 4, "stage": 5, "room": "Весь объект", "work": "Электромонтажные работы", "unit": "шт", "qty": 96, "price": 36 },
      { "wid": 5, "stage": 10, "room": "Весь объект", "work": "Штукатурка стен", "unit": "м²", "qty": 186, "price": 18 },
      { "wid": 6, "stage": 18, "room": "Весь объект", "work": "Шпатлёвка и покраска", "unit": "м²", "qty": 254, "price": 13.5 },
      { "wid": 7, "stage": 7, "room": "Весь объект", "work": "Стяжка пола", "unit": "м²", "qty": 62, "price": 21 },
      { "wid": 8, "stage": 13, "room": "Весь объект", "work": "Укладка ламината", "unit": "м²", "qty": 46, "price": 19.5 },
      { "wid": 9, "stage": 12, "room": "Санузел", "work": "Гидроизоляция", "unit": "м²", "qty": 9, "price": 24 },
      { "wid": 10, "stage": 12, "room": "Санузел", "work": "Укладка плитки", "unit": "м²", "qty": 26, "price": 39 },
      { "wid": 11, "stage": 12, "room": "Кухня", "work": "Укладка плитки", "unit": "м²", "qty": 12, "price": 39 },
      { "wid": 12, "stage": 15, "room": "Весь объект", "work": "Сантехнические работы", "unit": "шт", "qty": 14, "price": 127.5 },
      { "wid": 13, "stage": 16, "room": "Весь объект", "work": "Установка дверей", "unit": "шт", "qty": 5, "price": 180 },
      { "wid": 14, "stage": 9, "room": "Весь объект", "work": "Монтаж гипсокартонных конструкций", "unit": "м²", "qty": 48, "price": 48 }
     ],
     "materials": [
      { "id": 1, "name": "Черновые материалы", "unit": "компл", "qty": 1, "price": 2070, "comment": "Предварительная оценка" }
     ],
     "others": [
      { "id": 1, "name": "Работы по управлению проектом", "unit": "мес", "qty": 3, "price": 540 }
     ]
    }
   ],
   "docs": [
    { "name": "План помещения.pdf", "type": "Проектная документация", "dir": "in", "party": "Александр Ветров", "date": "2026-06-05", "status": "processed" },
    { "name": "Электрика. Схема.pdf", "type": "Проектная документация", "dir": "in", "party": "Александр Ветров", "date": "2026-06-11", "status": "processed" },
    { "name": "КП v1 — 2607. Polis Apartment", "type": "КП", "dir": "out", "party": "Александр Ветров", "date": "2026-06-10", "date_doc": "2026-06-09", "status": "sent", "version": "v1",
      "kp": { "extra": false, "rows": [
        { "kind": "work", "wid": 3, "room": "Весь объект", "work": "Демонтажные работы", "unit": "м²", "qty": 68, "price": 10.5 },
        { "kind": "work", "wid": 4, "room": "Весь объект", "work": "Электромонтажные работы", "unit": "шт", "qty": 96, "price": 36 },
        { "kind": "work", "wid": 5, "room": "Весь объект", "work": "Штукатурка стен", "unit": "м²", "qty": 186, "price": 18 },
        { "kind": "work", "wid": 6, "room": "Весь объект", "work": "Шпатлёвка и покраска", "unit": "м²", "qty": 254, "price": 13.5 },
        { "kind": "work", "wid": 12, "room": "Весь объект", "work": "Сантехнические работы", "unit": "шт", "qty": 14, "price": 127.5 }
      ] } },
    { "name": "Счёт №1 (аванс).pdf", "type": "Счёт", "dir": "out", "party": "Александр Ветров", "date": "2026-06-01", "status": "sent", "version": "v1", "amount": 8000 },
    { "name": "Счёт №2.pdf", "type": "Счёт", "dir": "out", "party": "Александр Ветров", "date": "2026-06-28", "status": "sent", "version": "v1", "amount": 4200 },
    { "name": "Бюджет клиента.pdf", "type": "Бюджет клиента", "dir": "out", "party": "Александр Ветров", "date": "2026-06-15", "date_doc": "2026-06-15", "status": "sent", "version": "v2",
      "budget": { "kind": "cli", "label": "Согласованный Бюджет клиента", "approved_by": "Александр Ветров, по электронной почте",
        "works": [
          { "wid": 1, "stage": 11, "room": "Кухня", "work": "Подготовка стен", "unit": "м²", "qty": 20, "price": 12 },
          { "wid": 2, "stage": 17, "room": "Коридор", "work": "Установка розеток", "unit": "шт", "qty": 6, "price": 22.5 },
          { "wid": 3, "stage": 2, "room": "Весь объект", "work": "Демонтажные работы", "unit": "м²", "qty": 68, "price": 10.5 },
          { "wid": 4, "stage": 5, "room": "Весь объект", "work": "Электромонтажные работы", "unit": "шт", "qty": 96, "price": 36 },
          { "wid": 5, "stage": 10, "room": "Весь объект", "work": "Штукатурка стен", "unit": "м²", "qty": 186, "price": 18 },
          { "wid": 6, "stage": 18, "room": "Весь объект", "work": "Шпатлёвка и покраска", "unit": "м²", "qty": 254, "price": 13.5 },
          { "wid": 7, "stage": 7, "room": "Весь объект", "work": "Стяжка пола", "unit": "м²", "qty": 62, "price": 21 },
          { "wid": 8, "stage": 13, "room": "Весь объект", "work": "Укладка ламината", "unit": "м²", "qty": 46, "price": 19.5 },
          { "wid": 9, "stage": 12, "room": "Санузел", "work": "Гидроизоляция", "unit": "м²", "qty": 9, "price": 24 },
          { "wid": 10, "stage": 12, "room": "Санузел", "work": "Укладка плитки", "unit": "м²", "qty": 26, "price": 39 },
          { "wid": 11, "stage": 12, "room": "Кухня", "work": "Укладка плитки", "unit": "м²", "qty": 12, "price": 39 },
          { "wid": 12, "stage": 15, "room": "Весь объект", "work": "Сантехнические работы", "unit": "шт", "qty": 14, "price": 127.5 },
          { "wid": 13, "stage": 16, "room": "Весь объект", "work": "Установка дверей", "unit": "шт", "qty": 5, "price": 180 },
          { "wid": 14, "stage": 9, "room": "Весь объект", "work": "Монтаж гипсокартонных конструкций", "unit": "м²", "qty": 48, "price": 48 }
        ],
        "materials": [ { "id": 1, "name": "Черновые материалы", "unit": "компл", "qty": 1, "price": 2070, "comment": "Предварительная оценка" } ],
        "others": [ { "id": 1, "name": "Работы по управлению проектом", "unit": "мес", "qty": 3, "price": 540 } ] } },
    { "name": "Исходный внутренний бюджет.pdf", "type": "Внутренний бюджет", "dir": "int", "party": "Анна Соколова", "date": "2026-06-03", "date_doc": "2026-06-03", "status": "approved", "version": "v1",
      "budget": { "kind": "int", "label": "Исходный внутренний бюджет",
        "works": [
          { "wid": 1, "stage": 11, "room": "Кухня", "work": "Подготовка стен", "unit": "м²", "qty": 20, "price_buy": 8, "k1": 1.5, "k2": 1 },
          { "wid": 2, "stage": 17, "room": "Коридор", "work": "Установка розеток", "unit": "шт", "qty": 6, "price_buy": 15, "k1": 1.5, "k2": 1 },
          { "wid": 3, "stage": 2, "room": "Весь объект", "work": "Демонтажные работы", "unit": "м²", "qty": 68, "price_buy": 7, "k1": 1.5, "k2": 1 },
          { "wid": 4, "stage": 5, "room": "Весь объект", "work": "Электромонтажные работы", "unit": "шт", "qty": 96, "price_buy": 24, "k1": 1.5, "k2": 1 },
          { "wid": 5, "stage": 10, "room": "Весь объект", "work": "Штукатурка стен", "unit": "м²", "qty": 186, "price_buy": 12, "k1": 1.5, "k2": 1 },
          { "wid": 6, "stage": 18, "room": "Весь объект", "work": "Шпатлёвка и покраска", "unit": "м²", "qty": 254, "price_buy": 9, "k1": 1.5, "k2": 1 },
          { "wid": 7, "stage": 7, "room": "Весь объект", "work": "Стяжка пола", "unit": "м²", "qty": 62, "price_buy": 14, "k1": 1.5, "k2": 1 },
          { "wid": 8, "stage": 13, "room": "Весь объект", "work": "Укладка ламината", "unit": "м²", "qty": 46, "price_buy": 13, "k1": 1.5, "k2": 1 },
          { "wid": 9, "stage": 12, "room": "Санузел", "work": "Гидроизоляция", "unit": "м²", "qty": 9, "price_buy": 16, "k1": 1.5, "k2": 1 },
          { "wid": 10, "stage": 12, "room": "Санузел", "work": "Укладка плитки", "unit": "м²", "qty": 26, "price_buy": 26, "k1": 1.5, "k2": 1 },
          { "wid": 11, "stage": 12, "room": "Кухня", "work": "Укладка плитки", "unit": "м²", "qty": 12, "price_buy": 26, "k1": 1.5, "k2": 1 },
          { "wid": 12, "stage": 15, "room": "Весь объект", "work": "Сантехнические работы", "unit": "шт", "qty": 14, "price_buy": 85, "k1": 1.5, "k2": 1 },
          { "wid": 13, "stage": 16, "room": "Весь объект", "work": "Установка дверей", "unit": "шт", "qty": 5, "price_buy": 120, "k1": 1.5, "k2": 1 }
        ],
        "materials": [ { "id": 1, "name": "Черновые материалы", "unit": "компл", "qty": 1, "price_buy": 1800, "k1": 1.15, "k2": 1 } ],
        "others": [ { "id": 1, "name": "Работы по управлению проектом", "unit": "мес", "qty": 3, "price_buy": 300, "k1": 1.8, "k2": 1 } ] } }
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
    { "date": "2026-07-20", "type": "refund", "dir": "in", "purpose": "Возврат за брак плитки", "party": "TileHouse Ltd", "amount": 400, "method": "Банковский перевод", "status": "confirmed", "doc": "Счёт TileHouse 2601", "refund_of": "Материалы: плитка, клей" },
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
   "coef2": { "added": false },
   "rooms": [
    { "name": "Переговорная", "elements": [
      { "name": "Стены", "kind": "element", "measures": [ { "label": "Площадь стен", "value": 64, "unit": "м²", "source": "ПД: Рабочая документация, лист 4" } ] }
    ] },
    { "name": "Кухонная зона", "elements": [
      { "name": "Пол", "kind": "element", "measures": [ { "label": "Площадь пола", "value": 18, "unit": "м²", "source": "ПД: Рабочая документация, лист 5" } ] }
    ] }
   ],
   "works": [
    { "id": 1, "stage": 2, "room": "Весь объект", "work": "Демонтажные работы", "unit": "м²", "qty": 150, "element": null,
      "scope": "Ручное значение: обследованная площадь", "origin": "Обследование 12.02.2026", "rel": [],
      "price_buy": 7, "k1": 1.45, "k2": 1 },
    { "id": 2, "stage": 5, "room": "Весь объект", "work": "Электромонтажные работы", "unit": "шт", "qty": 180, "element": null,
      "scope": "Прямое значение из ПД: количество точек", "origin": "ПД: Рабочая документация, лист 2", "rel": [1],
      "price_buy": 24, "k1": 1.45, "k2": 1 },
    { "id": 3, "stage": 10, "room": "Весь объект", "work": "Штукатурка стен", "unit": "м²", "qty": 420, "element": null,
      "scope": "Формула: площадь стен − проёмы", "origin": "ПД: Рабочая документация, лист 1", "rel": [1],
      "price_buy": 12, "k1": 1.45, "k2": 1 },
    { "id": 4, "stage": 18, "room": "Весь объект", "work": "Шпатлёвка и покраска", "unit": "м²", "qty": 510, "element": null,
      "scope": "Формула: площадь стен − проёмы", "origin": "ПД: Рабочая документация, лист 1", "rel": [3],
      "price_buy": 9, "k1": 1.45, "k2": 1 },
    { "id": 5, "stage": 12, "room": "Весь объект", "work": "Укладка напольной плитки", "unit": "м²", "qty": 88, "element": null,
      "scope": "Прямое значение из ПД: площадь полов", "origin": "ПД: Рабочая документация, лист 1", "rel": [],
      "price_buy": 26, "k1": 1.45, "k2": 1 },
    { "id": 6, "stage": 15, "room": "Весь объект", "work": "Сантехнические работы", "unit": "шт", "qty": 22, "element": null,
      "scope": "Прямое значение из ПД: приборы", "origin": "ПД: Рабочая документация, лист 3", "rel": [],
      "price_buy": 85, "k1": 1.45, "k2": 1 },
    { "id": 7, "stage": 16, "room": "Весь объект", "work": "Установка дверей", "unit": "шт", "qty": 9, "element": null,
      "scope": "Прямое значение из ПД: проёмы", "origin": "ПД: Рабочая документация, лист 1", "rel": [],
      "price_buy": 120, "k1": 1.45, "k2": 1 },
    { "id": 8, "stage": 9, "room": "Переговорная", "work": "Монтаж гипсокартонных конструкций", "unit": "м²", "qty": 64, "element": "Стены",
      "scope": "Прямое значение из ПД", "origin": "ПД: Рабочая документация, лист 4", "rel": [],
      "price_buy": 32, "k1": 1.45, "k2": 1 },
    { "id": 9, "stage": 12, "room": "Кухонная зона", "work": "Укладка плитки", "unit": "м²", "qty": 18, "element": "Пол",
      "scope": "Прямое значение из ПД: площадь пола", "origin": "ПД: Рабочая документация, лист 5", "rel": [],
      "price_buy": 26, "k1": 1.45, "k2": 1 },
    { "id": 10, "stage": 19, "room": "Весь объект", "work": "Вывоз мусора и уборка", "unit": "компл", "qty": 1, "element": null,
      "scope": "Ручное значение: комплексная уборка", "origin": "Задание на словах (Андреас Пападопулос), 10.02.2026", "rel": [],
      "price_buy": 210, "k1": 1.45, "k2": 1 }
   ],
   "materials": [
    { "id": 1, "name": "Черновые материалы", "unit": "компл", "qty": 1, "price_buy": 5200, "k1": 1.15, "k2": 1, "comment": "Общая предварительная оценка" }
   ],
   "others": [
    { "id": 1, "name": "Работы по управлению проектом", "unit": "мес", "qty": 5, "price_buy": 300, "k1": 1.8, "k2": 1, "comment": "" }
   ],
   "fix_calc": [],
   "fix_cli": [
    {
     "label": "Согласованный Бюджет клиента",
     "short": "Согласованный",
     "version": "v3",
     "date": "2026-03-12",
     "approved_by": "Андреас Пападопулос, на встрече",
     "works": [
      { "wid": 1, "stage": 2, "room": "Весь объект", "work": "Демонтажные работы", "unit": "м²", "qty": 150, "price": 10.15 },
      { "wid": 2, "stage": 5, "room": "Весь объект", "work": "Электромонтажные работы", "unit": "шт", "qty": 180, "price": 34.8 },
      { "wid": 3, "stage": 10, "room": "Весь объект", "work": "Штукатурка стен", "unit": "м²", "qty": 420, "price": 17.4 },
      { "wid": 4, "stage": 18, "room": "Весь объект", "work": "Шпатлёвка и покраска", "unit": "м²", "qty": 510, "price": 13.05 },
      { "wid": 5, "stage": 12, "room": "Весь объект", "work": "Укладка напольной плитки", "unit": "м²", "qty": 88, "price": 37.7 },
      { "wid": 6, "stage": 15, "room": "Весь объект", "work": "Сантехнические работы", "unit": "шт", "qty": 22, "price": 123.25 },
      { "wid": 7, "stage": 16, "room": "Весь объект", "work": "Установка дверей", "unit": "шт", "qty": 9, "price": 174 },
      { "wid": 8, "stage": 9, "room": "Переговорная", "work": "Монтаж гипсокартонных конструкций", "unit": "м²", "qty": 64, "price": 46.4 },
      { "wid": 9, "stage": 12, "room": "Кухонная зона", "work": "Укладка плитки", "unit": "м²", "qty": 18, "price": 37.7 },
      { "wid": 10, "stage": 19, "room": "Весь объект", "work": "Вывоз мусора и уборка", "unit": "компл", "qty": 1, "price": 304.5 }
     ],
     "materials": [
      { "id": 1, "name": "Черновые материалы", "unit": "компл", "qty": 1, "price": 5980, "comment": "Предварительная оценка" }
     ],
     "others": [
      { "id": 1, "name": "Работы по управлению проектом", "unit": "мес", "qty": 5, "price": 540 }
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
