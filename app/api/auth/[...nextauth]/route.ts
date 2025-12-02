// // app/api/auth/[...nextauth]/route.ts
// import NextAuth from "next-auth";
// import Google from "next-auth/providers/google";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { prisma } from "@/lib/prisma";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// // Базовий адаптер (для Account, інше ми перевизначимо)
// const base = PrismaAdapter(prisma) as any;

// const authConfig = {
//   debug: true,
//   // Щоб не торкатись таблиці Session
//   session: { strategy: "jwt" },

//   // ⚠️ Перевизначаємо методи під твою схему User
//   adapter: {
//     ...base,

//     // Створення юзера: тільки існуючі поля
//     async createUser(data: any) {
//       return prisma.user.create({
//         data: {
//           email: data.email!,
//           name: data.name ?? null,
//           // Google -> avatarUrl
//           avatarUrl: data.image ?? null,
//         },
//       });
//     },

//     // Оновлення юзера (на випадок, якщо next-auth спробує оновити image)
//     async updateUser(data: any) {
//       const { id, name, image } = data;
//       return prisma.user.update({
//         where: { id },
//         data: {
//           ...(name !== undefined ? { name } : {}),
//           ...(image !== undefined ? { avatarUrl: image } : {}),
//         },
//       });
//     },
//   },

//   providers: [
//     Google({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
// } as const;

// // Сумісно з v4/v5
// const authHandler = NextAuth(authConfig) as any;
// export const GET = authHandler.GET ?? authHandler;
// export const POST = authHandler.POST ?? authHandler;

import { handlers } from "@/auth";


export const { GET, POST } = handlers;

// (не обов’язково, але корисно для деву)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
