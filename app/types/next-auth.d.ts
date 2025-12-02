import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & { id: string };
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number; 
    error?: "RefreshAccessTokenError";
  }
}