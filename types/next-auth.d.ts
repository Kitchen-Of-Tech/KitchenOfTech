import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      facebookId?: string;
    };
  }

  interface User {
    facebookId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    facebookId?: string;
  }
}
