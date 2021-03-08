import 'next-auth';

declare module 'next-auth' {
  interface User {
    displayName: string;
    fname?: string;
    lname?: string;
  }
}
