import NextAuth, { DefaultSession } from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      facebookId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    facebookId?: string;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'public_profile email',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.facebookId = account.providerAccountId;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.facebookId = token.facebookId as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'facebook' && profile) {
        try {
          // Sync author to Sanity
          await fetch(`${process.env.NEXTAUTH_URL}/api/articles/authors/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              facebookId: account.providerAccountId,
              name: user.name,
              email: user.email,
              profileImage: user.image,
            }),
          });
        } catch (error) {
          console.error('Failed to sync author:', error);
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
});
