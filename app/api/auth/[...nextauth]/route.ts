import NextAuth, { NextAuthOptions } from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";

export const authOptions: NextAuthOptions = {
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'public_profile,email',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Create or update author in Sanity when user signs in
      if (account?.provider === "facebook" && profile) {
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/articles/authors/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              facebookId: profile.sub || account.providerAccountId,
              name: user.name || profile.name,
              email: user.email,
              profileImage: user.image,
            }),
          });

          if (!response.ok) {
            console.error('Failed to sync author with Sanity');
          }
        } catch (error) {
          console.error('Error syncing author:', error);
        }
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.facebookId = profile.sub || account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.facebookId = token.facebookId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
