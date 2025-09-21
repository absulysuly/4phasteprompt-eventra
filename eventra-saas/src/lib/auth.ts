import { AuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  providers: [
    // Only include Google provider if environment variables are properly configured
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && 
        process.env.GOOGLE_CLIENT_ID !== "your-google-client-id-here" ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name };
      }
    })
  ],
  session: { strategy: "jwt" as const },
  secret: (() => {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      throw new Error('NEXTAUTH_SECRET environment variable is required but not set. Generate one with: openssl rand -base64 32');
    }
    if (secret.length < 32) {
      throw new Error('NEXTAUTH_SECRET must be at least 32 characters long for security');
    }
    return secret;
  })(),
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });
          
          if (!existingUser) {
            // Create new user for Google sign-in
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || '',
                password: '', // Google users don't need password
              }
            });
          }
          return true;
        } catch (error) {
          console.error('Error during Google sign-in:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    }
  },
};