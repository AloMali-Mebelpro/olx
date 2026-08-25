import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Электроника", slug: "electronics", icon: "📱" },
  { name: "Транспорт", slug: "transport", icon: "🚗" },
  { name: "Недвижимость", slug: "real-estate", icon: "🏠" },
  { name: "Работа", slug: "jobs", icon: "💼" },
  { name: "Мода и стиль", slug: "fashion", icon: "👗" },
  { name: "Дом и сад", slug: "home", icon: "🛋️" },
  { name: "Хобби и отдых", slug: "hobby", icon: "🎮" },
  { name: "Животные", slug: "pets", icon: "🐾" },
];

const listingsSeed = [
  {
    title: "iPhone 13 Pro, 256GB, отличное состояние",
    description:
      "Продаю iPhone 13 Pro, память 256GB, цвет графит. Экран без царапин, батарея 91%. В комплекте кабель и коробка.",
    price: 550,
    currency: "USD",
    location: "Киев",
    imageUrl:
      "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600",
    category: "electronics",
    isPromoted: true,
  },
  {
    title: "Toyota Camry 2018, официальный дилер",
    description:
      "Автомобиль в отличном состоянии, один владелец, полная сервисная история, не битая, не крашена.",
    price: 18500,
    currency: "USD",
    location: "Львов",
    imageUrl:
      "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600",
    category: "transport",
    isPromoted: true,
  },
  {
    title: "2-комнатная квартира в центре",
    description:
      "Уютная квартира с ремонтом, вся мебель и техника в наличии, рядом метро и парк.",
    price: 65000,
    currency: "USD",
    location: "Одесса",
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600",
    category: "real-estate",
    isPromoted: false,
  },
  {
    title: "Требуется frontend-разработчик",
    description:
      "Ищем React-разработчика с опытом от 2 лет. Удалённая работа, гибкий график.",
    price: 1500,
    currency: "USD",
    location: "Удалённо",
    imageUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600",
    category: "jobs",
    isPromoted: false,
  },
  {
    title: "Кожаная куртка, размер M",
    description: "Новая, ни разу не надевалась, куплена в фирменном магазине.",
    price: 90,
    currency: "USD",
    location: "Харьков",
    imageUrl:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600",
    category: "fashion",
    isPromoted: false,
  },
  {
    title: "Диван угловой, б/у в хорошем состоянии",
    description: "Продаю диван, использовался бережно, без пятен и запахов.",
    price: 220,
    currency: "USD",
    location: "Днепр",
    imageUrl:
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600",
    category: "home",
    isPromoted: false,
  },
  {
    title: "Игровая приставка PlayStation 5",
    description: "PS5 с двумя джойстиками и тремя играми в комплекте.",
    price: 480,
    currency: "USD",
    location: "Киев",
    imageUrl:
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600",
    category: "hobby",
    isPromoted: true,
  },
  {
    title: "Щенки лабрадора, чистопородные",
    description: "Щенки от родителей с документами, привиты по возрасту.",
    price: 300,
    currency: "USD",
    location: "Винница",
    imageUrl:
      "https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=600",
    category: "pets",
    isPromoted: false,
  },
  {
    title: "Samsung Galaxy S22, как новый",
    description: "Продаю телефон в идеальном состоянии, полный комплект.",
    price: 400,
    currency: "USD",
    location: "Запорожье",
    imageUrl:
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600",
    category: "electronics",
    isPromoted: false,
  },
  {
    title: "Велосипед горный Trek",
    description: "Велосипед в отличном состоянии, недавно обслужен.",
    price: 350,
    currency: "USD",
    location: "Львов",
    imageUrl:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600",
    category: "hobby",
    isPromoted: false,
  },
];

const adsSeed = [
  {
    title: "Реклама банка",
    imageUrl:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=300&fit=crop",
    linkUrl: "https://example.com/bank",
    position: "BANNER_TOP" as const,
  },
  {
    title: "Реклама страхования авто",
    imageUrl:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=500&fit=crop",
    linkUrl: "https://example.com/insurance",
    position: "SIDEBAR_LEFT" as const,
  },
  {
    title: "Реклама доставки еды",
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=500&fit=crop",
    linkUrl: "https://example.com/delivery",
    position: "SIDEBAR_RIGHT" as const,
  },
  {
    title: "Реклама интернет-магазина",
    imageUrl:
      "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&h=300&fit=crop",
    linkUrl: "https://example.com/shop",
    position: "IN_FEED" as const,
  },
];

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  for (const l of listingsSeed) {
    const category = await prisma.category.findUnique({
      where: { slug: l.category },
    });
    if (!category) continue;

    await prisma.listing.create({
      data: {
        title: l.title,
        description: l.description,
        price: l.price,
        currency: l.currency,
        location: l.location,
        imageUrl: l.imageUrl,
        isPromoted: l.isPromoted,
        categoryId: category.id,
      },
    });
  }

  for (const a of adsSeed) {
    await prisma.ad.create({ data: a });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
