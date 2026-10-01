export const DOCUMENT_VERSION = "2026-10-01-documents-v9";

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
      "1 бесплатное групповое обучение",
      "Доступ без ограничений",
    ],
    featured: false,
  },
] as const;

export type PlanId = (typeof plans)[number]["id"];

export const courseLessons = [
  { number: "01", slug: "hands", title: "Подготовка рук", short: "Подготовка рук к практике", description: "Подготовка рук к практике: разогрев, пробуждение чувствительности и настройка внимания на прикосновение.", videoUrl: "", poster: "/course/course-poster.png" },
  { number: "02", slug: "preparation", title: "Подготовка к массажу", short: "Пространство, масло и музыка", description: "Практика помогает замедлиться, настроиться друг на друга и создать ощущение доверия, присутствия и контакта перед массажем.", videoUrl: "", poster: "/course/course-poster.png" },
  { number: "03", slug: "touches", title: "Типы прикосновений", short: "Разные качества контакта", description: "Последовательная работа со спиной, шеей, плечами, ногами и другими зонами тела. Осваиваем различные виды прикосновений, поглаживаний и массажных движений.", videoUrl: "", poster: "/course/course-poster.png" },
  { number: "04", slug: "attunement", title: "Сонастройка", short: "Ритуал присутствия", description: "Продолжаем практику с передней частью тела: руки, грудь, живот и другие зоны. Особое внимание уделяется мягкости, чувствительности и вниманию к реакции партнёра.", videoUrl: "", poster: "/course/course-poster.png" },
  { number: "05", slug: "prone", title: "Практика на животе", short: "Задняя поверхность тела", description: "Техники работы с ногами, внутренней и внешней поверхностью бёдер, тазовой областью и всем телом, объединяющие отдельные элементы массажа в единую практику.", videoUrl: "", poster: "/course/course-poster.png" },
  { number: "06", slug: "supine", title: "Практика на спине", short: "Передняя поверхность тела", description: "Переходим к более чувственной части массажа, сохраняя внимание к дыханию, прикосновениям и ощущениям партнёра.", videoUrl: "", poster: "/course/course-poster.png" },
  { number: "07", slug: "completion", title: "Завершение", short: "Замедление и расслабление", description: "Финальная часть практики: замедление, расслабление, контакт и мягкое завершение массажа.", videoUrl: "", poster: "/course/course-poster.png" },
] as const;

export const bonusLesson = {
  number: "+",
  slug: "full-massage",
  title: "Полная версия массажа",
  short: "Непрерывная практика",
  description: "цельная запись всей последовательности массажа от начала до конца без остановок и подробных объяснений, чтобы использовать её как практический ориентир.",
  videoUrl: "",
  poster: "/course/course-poster.png",
};

export const siteConfig = {
  title: "Магия прикосновений",
  subtitle: "Курс по тантрическому массажу",
  description: "Практический курс Эмиля Баткуллина о внимании, доверии и искусстве тантрического массажа.",
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
  contacts: {
    // TODO: заменить демонстрационные контакты на реальные.
    email: "hello@example.invalid",
    phone: "+7 (000) 000-00-00",
    location: "Санкт-Петербург",
  },
  socials: [
    { label: "ВКонтакте", href: "https://vk.com/example" },
    { label: "Telegram", href: "https://t.me/example" },
    { label: "Instagram", href: "https://instagram.com/example" },
  ],
  payment: {
    // TODO: заменить QR-код и реквизиты. Демонстрационные значения не предназначены для оплаты.
    qrImage: "/course/demo-qr.svg",
    recipient: "ДЕМО — НЕ ОПЛАЧИВАТЬ",
    purpose: "Демонстрационная заявка на курс",
  },
} as const;

export const planById = (id: string | null | undefined) => plans.find((plan) => plan.id === id) ?? null;
