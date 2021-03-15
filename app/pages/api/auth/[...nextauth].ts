import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import AUTHENTICATION from 'services/authentication';

/**
 * Takes a token, and returns a new token
 */
// async function refreshAccessToken(token) {
//   try {
//     const refreshTokenResponse = await AUTHENTICATION.request({
//       url: '/refresh-token',
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${token.accessToken}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     const { data, statusText } = refreshTokenResponse;

//     if (statusText !== 'OK') {
//       throw new Error(data);
//     }

//     return {
//       ...token,
//       accessToken: data.accessToken,
//     };
//   } catch (error) {
//     console.error(error);
//     return {
//       ...token,
//       error: 'RefreshAccessTokenError',
//     };
//   }
// }

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

        const { data, status } = signInRequest;

        if (status === 201) {
          return data;
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

      // // Return previous token if the access token has not expired yet
      // const { iat } = token;
      // const tokenCloseToExpire = (Date.now() - SESSION_BUFFER_TIME) < (iat * 1000);
      // if (!tokenCloseToExpire) return token;

      // // Refresh token when less than 1 hour left
      // return refreshAccessToken(token);
    },

    // Extending session object
    async session(session, token) {
      session.accessToken = token.accessToken;
      return session;
    },

    async redirect(callbackUrl) {
      // By default it should be redirect to /projects
      if (callbackUrl.includes('/sign-in') || callbackUrl.includes('/sign-up')) {
        return '/projects';
      }
      return callbackUrl;
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
