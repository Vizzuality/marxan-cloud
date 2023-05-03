/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    accessToken: string;
  }

  interface Session {
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
  }
}
