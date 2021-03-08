import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import AUTHENTICATION from 'services/authentication';
import USERS from 'services/users';

const options = {
  // Defining custom pages
  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/sign-in',
  },

  // Configure one or more authentication providers
  providers: [
    Providers.Credentials({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Sign in with Marxan',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        username: { label: 'Email', type: 'email', placeholder: 'username@domain.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { username, password } = credentials;

        // Request to sign in
        const signInRequest = await AUTHENTICATION.request({
          url: '/sign-in',
          method: 'POST',
          data: { username, password },
          headers: { 'Content-Type': 'application/json' },
        });

        const { data } = signInRequest;
        const { accessToken } = data;

        // After sign-in, request data user to create session with a complete profile
        const userRequest = await USERS.request({
          url: '/me',
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        const { data: userData } = userRequest;

        if (userRequest.statusText === 'OK') {
          const user = { ...userData, ...userData, accessToken };
          return user;
        }

        throw new Error(data);
      },
    }),
  ],

  callbacks: {
    // Assigning encoded token from API to token created in the session
    async jwt(token, user) {
      if (user) {
        const { accessToken, ...rest } = user;
        token.accessToken = accessToken;
        token.user = rest;
      }
      return token;
    },

    // Extending session object
    async session(session, token) {
      session.user = {
        ...session.user,
        ...token.user,
      };
      session.accessToken = token.accessToken;
      return session;
    },
  },

  events: {
    async signOut(session) {
      // After sign-out expire token in the API
      if (session) {
        await AUTHENTICATION.request({
          url: '/sign-out',
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
    },
  },
};

export default (req, res) => NextAuth(req, res, options);
