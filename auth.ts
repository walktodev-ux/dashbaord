
// auth.ts
// import NextAuth, { type DefaultSession } from "next-auth";
// import Google from "next-auth/providers/google";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { prisma } from "@/lib/prisma";

// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     user: DefaultSession["user"] & { id: string };
//     accessToken?: string;
//   }
//   interface JWT {
//     userId?: string;
//     accessToken?: string;
//     refreshToken?: string;
//     accessTokenExpires?: number; // epoch ms
//   }
// }

// async function refreshAccessToken(token: any) {
//   try {
//     const res = await fetch("https://oauth2.googleapis.com/token", {
//       method: "POST",
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       body: new URLSearchParams({
//         client_id: process.env.GOOGLE_CLIENT_ID!,
//         client_secret: process.env.GOOGLE_CLIENT_SECRET!,
//         grant_type: "refresh_token",
//         refresh_token: token.refreshToken!,
//       }),
//     });
//     const data = await res.json();
//     if (!res.ok) throw new Error(JSON.stringify(data));

//     return {
//       ...token,
//       accessToken: data.access_token,
//       accessTokenExpires: Date.now() + (data.expires_in ?? 3600) * 1000,
//       refreshToken: data.refresh_token ?? token.refreshToken,
//     };
//   } catch {
//     // форсимо ре-логін
//     return { ...token, error: "RefreshAccessTokenError" as const };
//   }
// }

// const useDatabaseSessions = false as const;
// const SESSION_STRATEGY: "jwt" | "database" = useDatabaseSessions ? "database" : "jwt";

// export const { handlers, auth, signIn, signOut } = NextAuth({
//   adapter: PrismaAdapter(prisma) as any,
//   session: { strategy: SESSION_STRATEGY },
//   debug: true,
//   providers: [
//     Google({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       authorization: {
//         params: {
//           scope:
//             "openid email profile https://www.googleapis.com/auth/calendar.readonly",
//           prompt: "consent",
//           access_type: "offline",
//           include_granted_scopes: "true",
//         },
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, account, user }) {
//       // перший логін
//       if (account) {
//         token.accessToken = account.access_token as string | undefined;
//         token.refreshToken = account.refresh_token as string | undefined;
//         token.accessTokenExpires = Date.now() + (account.expires_in ?? 3600) * 1000;
//       }
//       if (user && (user as any).id) token.userId = (user as any).id;

//       // якщо ще валідний
//       if (
//   token.accessToken &&
//   typeof token.accessTokenExpires === "number" &&
//   Date.now() < token.accessTokenExpires
// ) {
//   return token;
// }

//       // якщо протух — оновити
//       if (token.refreshToken) {
//         return await refreshAccessToken(token);
//       }
//       return token;
//     },
//     async session({ session, token, user }) {
//       const id = (SESSION_STRATEGY === "database" ? user?.id : token?.userId) ?? null;
//       if (session.user && id) (session.user as any).id = String(id);
//       if (token?.accessToken) session.accessToken = String(token.accessToken);
//       return session;
//     },
//   },
// });

// import { NextRequest } from "next/server";
// import NextAuth from "next-auth";
// import Google from "next-auth/providers/google";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { prisma } from "@/lib/prisma";

// export const { handlers, auth, signIn, signOut  } = NextAuth({
//   adapter: PrismaAdapter(prisma),
//   session: { strategy: "jwt" },

//   providers: [
//     Google({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       authorization: {
//         params: {
//           prompt: "select_account consent",
//           access_type: "offline",
//           include_granted_scopes: "true",
//         },
//       },
//     }),
//   ],

//   callbacks: {
//     // 1) не зберігай кешоване ім’я в JWT — тягни його з БД щоразу
//     async jwt({ token, account }) {
//       // залишаємо лише id у токені
//       if (account?.provider && token.sub) {
//         token.sub = token.sub; // нічого не міняємо, просто явно
//       }
//       return token;
//     },

//     // 2) завжди підтягуй свіжі дані з БД у session
//     async session({ session, token }) {
//       if (!token.sub || !session.user) return session;
//       const dbUser = await prisma.user.findUnique({
//         where: { id: token.sub },
//         select: { id: true, name: true, email: true, image: true },
//       });
//       if (dbUser) Object.assign(session.user, dbUser);
//       return session;
//     },

//     // 3) якщо користувач уже залогінений — не даємо лінкувати інший Ґуґл
//     async signIn({ account, user, profile }) {
//       // простий спосіб: перевіряємо, чи вже існує сесійний токен cookie
//       // у v5 це робиться поза конфігом, тому зробимо перевірку через БД:
//       // якщо в запиті вже є активна sessionToken — краще заборонити
//       // (спрацює на серверних роутерах /api/auth/*)
//       try {
//         // шукаємо активну сесію для ідентичного sessionToken не завжди тривіально,
//         // тому більш надійно: дозволяємо лінкування ТІЛЬКИ якщо акаунт уже
//         // прив’язаний до цього користувача, інакше — вимагаємо sign out.
//         const acc = await prisma.account.findUnique({
//           where: {
//             provider_providerAccountId: {
//               provider: account!.provider,
//               providerAccountId: account!.providerAccountId!,
//             },
//           },
//           select: { userId: true },
//         });

//         // якщо цей Google уже прив’язаний — ок
//         if (acc && acc.userId === user.id) return true;

//         // якщо користувач має хоч один інший провайдер — вважаємо, що він залогінений
//         const alreadyHasProviders = await prisma.account.findMany({
//           where: { userId: user.id },
//           take: 1,
//         });

//         if (alreadyHasProviders.length > 0 && !acc) {
//           // забороняємо створювати ще один link
//           return false;
//         }
//       } catch {
//         // у разі сумнівів — не блокуємо
//         return true;
//       }
//       return true;
//     },
//   },
// });


// auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account consent",
          access_type: "offline",
          include_granted_scopes: "true",
          response_type: "code",
          // ВАЖЛИВО: включаємо календар
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/calendar.events",
          ].join(" "),
        },
      },
    }),
  ],

  callbacks: {
    // залишаємо лише id у токені, решту тягнемо з БД у session()
    async jwt({ token }) { return token; },
    async session({ session, token }) {
      if (token.sub && session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { id: true, name: true, email: true, image: true },
        });
        if (dbUser) Object.assign(session.user, dbUser);
      }
      return session;
    },
  },
});
