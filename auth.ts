import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import connectToDatabase from "./lib/db";
import User from "./models/User";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./lib/mongodb";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt", // We are using JWT strategy, but Adapter usually defaults to database sessions.
    // If we want to persist users but keep using JWT for session tokens (less DB hits), we set "jwt".
    // If we use "database", NextAuth manages sessions in DB.
    // Given the previous code didn't use adapter, it was JWT.
    // Let's stick to JWT but use Adapter for User persistence.
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        await connectToDatabase();
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("Invalid email or password");
        }

        const isMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!isMatch) {
          throw new Error("Invalid email or password");
        }

        return { id: user._id.toString(), name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    // We need to ensure the user ID is passed to the session
    // When using JWT strategy with Adapter, the user is retrieved from DB but token is used.
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.image = user.image;
        token.name = user.name;
      }

      // If token exists (sub refers to user ID), fetch fresh data from DB
      if (token.sub) {
        await connectToDatabase();
        const freshUser = await User.findById(token.sub).select("name image");
        if (freshUser) {
          token.name = freshUser.name;
          token.image = freshUser.image;
        }
      }

      if (trigger === "update" && session) {
        if (session.user.name) token.name = session.user.name;
        if (session.user.image) token.image = session.user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.image = token.image as string; // Pass token image to session
        session.user.name = token.name as string;
      }
      return session;
    },
  },
});
