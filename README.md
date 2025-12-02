# Walkto CRM — Next.js + NextAuth + Prisma (MySQL)

Готовий мінімальний шаблон із входом через Google, App Router, Prisma Adapter та чернеткою дашборду.

## Швидкий старт

1) **ENV** — створіть `.env` у корені (приклад у `.env.example`). Для вашого випадку:
```
DATABASE_URL="mysql://walkto:Dtie4wtkZEKf4bbf@127.0.0.1:23306/walkto"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace_me"

GOOGLE_CLIENT_ID="...apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="..."
```

2) **Встановіть залежності**
```
npm i
```

3) **Prisma**
```
npx prisma generate
npx prisma migrate dev
```

4) **Запуск dev-сервера**
```
npm run dev
```

Відкрий `http://localhost:3000/` → переадресує на `/sign-in` → "Увійти через Google" → поверне на `/dashboard`.

> Якщо міграція просить shadow DB — або дайте тимчасово GRANT CREATE/DROP користувачу `walkto`, або додайте `shadowDatabaseUrl` у `prisma/schema.prisma` і `SHADOW_DATABASE_URL` у `.env` (див. коментар у файлі).

## Файлова структура (скорочено)

```
app/
  api/auth/[...nextauth]/route.ts  # NextAuth handlers (GET/POST)
  dashboard/page.tsx               # захищена сторінка
  sign-in/page.tsx                 # вхід через Google
  layout.tsx, globals.css, ...
auth.ts                            # конфіг NextAuth v5 + PrismaAdapter
lib/prisma.ts                      # сінглтон Prisma Client
prisma/schema.prisma               # схема БД (у т.ч. NextAuth моделі)
```
