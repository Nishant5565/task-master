import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname.startsWith("/login");
      const isOnRegisterPage = nextUrl.pathname.startsWith("/api/register");
      const isOnApiAuth = nextUrl.pathname.startsWith("/api/auth");

      if (isOnApiAuth || isOnRegisterPage) return true;

      if (isOnLoginPage) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      if (!isLoggedIn) return false;
      return true;
    },
  },
  providers: [], // Providers (Credentials) will be added in auth.ts for Node environment
} satisfies NextAuthConfig;
