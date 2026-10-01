export const DOCUMENT_VERSION = "2026-10-01-legal-package-v2";

export const plans = [
  {
    id: "standard",
    name: "Стандарт",
    price: 25_000,
    priceLabel: "25 000 ₽",
    eyebrow: "12 месяцев",
    features: ["7 видеоуроков", "Доступ к материалам на 12 месяцев"],
    featured: false,
  },
  {
    id: "vip",
    name: "VIP",
    price: 35_000,
    priceLabel: "35 000 ₽",
    eyebrow: "Без ограничений",
    features: [
      "7 видеоуроков",
      "2 индивидуальные онлайн-консультации по 60 минут",
      "Доступ без ограничений",
    ],
    featured: true,
  },
  {
    id: "vip-plus",
    name: "VIP+",
    price: 50_000,
    priceLabel: "50 000 ₽",
    eyebrow: "Максимум поддержки",
    features: [
      "7 видеоуроков",
      "4 индивидуальные онлайн-консультации по 60 минут",
      "1 бесплатное очное занятие в течение года",
      "Доступ без ограничений",
    ],
    featured: false,
  },
] as const;

export type PlanId = (typeof plans)[number]["id"];

export const courseLessons = [
  { number: "01", slug: "hands", title: "Подготовка рук", short: "Подготовка рук к практике", description: "Подготовка рук к практике. Упражнения для активизации энергетических каналов и разогрева ладоней перед прикосновениями.", videoUrl: "", poster: "/course/course-poster.png" },
  { number: "02", slug: "preparation", title: "Подготовка к массажу", short: "Пространство, масло и музыка", description: "Подготовка пространства. Выбор масла и музыки.", videoUrl: "", poster: "/course/course-poster.png" },
  { number: "03", slug: "touches", title: "Типы прикосновений", short: "Разные качества контакта", description: "Различные типы прикосновений, используемых в Тантрическом массаже.", videoUrl: "", poster: "/course/course-poster.png" },
  { number: "04", slug: "attunement", title: "Сонастройка", short: "Ритуал присутствия", description: "Очень важный этап перед Тантрическим массажем. Красивый ритуал, помогающий войти в состояние любящего служения божественному телу партнера.", videoUrl: "", poster: "/course/course-poster.png" },
  { number: "05", slug: "prone", title: "Практика в положении «на животе»", short: "Задняя поверхность тела", description: "Работа с задней поверхностью тела. Активация энергетических центров и усиление тока энергии в теле. Демонстрация и объяснение движений.", videoUrl: "", poster: "/course/course-poster.png" },
  { number: "06", slug: "supine", title: "Практика в положении «на спине»", short: "Передняя поверхность тела", description: "Работа с передней поверхностью тела. Работа с грудью. Запуск и усиление тока энергии во всём теле. Демонстрация и объяснение движений.", videoUrl: "", poster: "/course/course-poster.png" },
  { number: "07", slug: "completion", title: "Завершение", short: "Замедление и расслабление", description: "Заключительная фаза массажа. Замедление и совместное расслабление.", videoUrl: "", poster: "/course/course-poster.png" },
] as const;

export const bonusLesson = {
  number: "+",
  slug: "full-massage",
  title: "Полная версия массажа",
  short: "Непрерывная практика",
  description: "Непрерывная последовательность движений без остановок и объяснений. Можно просто повторять все движения за мной. Запоминать ничего не нужно, я веду голосом.",
  videoUrl: "",
  poster: "/course/course-poster.png",
};

export const siteConfig = {
  title: "Магия прикосновений",
  subtitle: "Курс по тантрическому массажу",
  description: "«Магия прикосновений» — практический курс по Тантрическому массажу о внимании, доверии, чувственности и близости в отношениях.",
  author: {
    name: "Эмиль Баткуллин",
    bio: "Телесный психолог, телесно-ориентированный психотерапевт и Тантра-практик с более чем 10-летним опытом. Автор курса «Исцеление Женской Сексуальности», соавтор и ведущий программы «Два мира — Мужчина и Женщина».",
    image: "/course/emil-batkullin.png",
  },
  media: {
    poster: "/course/course-poster.png",
    // TODO: заменить на защищённый URL видео перед публикацией.
    introVideoUrl: "",
  },
  documents: [
    { label: "Публичная оферта", href: "/documents/offer" },
    { label: "Политика обработки персональных данных", href: "/documents/privacy" },
    { label: "Согласие на обработку персональных данных", href: "/documents/consent" },
    { label: "Правила курса 18+", href: "/documents/rules-18" },
    { label: "Правила возврата денежных средств", href: "/documents/refunds" },
  ],
  legalDocuments: [
    { label: "Публичная оферта", href: "/documents/offer" },
    { label: "Политика обработки персональных данных", href: "/documents/privacy" },
    { label: "Согласие на обработку персональных данных", href: "/documents/consent" },
    { label: "Пользовательское соглашение", href: "/documents/user-agreement" },
    { label: "Правила курса 18+", href: "/documents/rules-18" },
    { label: "Правила возврата денежных средств", href: "/documents/refunds" },
    { label: "Согласие на использование отзыва", href: "/documents/testimonial-consent" },
  ],
  contacts: {
    email: "emil_ka@list.ru",
    phone: "+7 911 213-69-22",
    location: "Санкт-Петербург, ул. Есенина, д. 1, корп. 1А, кв. 663",
  },
  socials: [] as ReadonlyArray<{ label: string; href: string }>,
  payment: {
    qrImage: "",
    recipient: "ИП Фаткуллин Эмиль Салихович",
    purpose: "Оплата доступа к курсу «Магия прикосновений»",
  },
} as const;

export const planById = (id: string | null | undefined) => plans.find((plan) => plan.id === id) ?? null;
