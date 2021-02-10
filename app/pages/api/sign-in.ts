import passport from 'passport';
import nextConnect from 'next-connect';
import { setLoginSession } from 'auth';
import { localStrategy } from 'auth/strategies/local';
import USERS from 'services/users';
import { NextApiRequest, NextApiResponse } from 'next';

interface AuthenticateProps {
  accessToken: string;
}

const authenticate = (method, req, res) => new Promise<AuthenticateProps>((resolve, reject) => {
  return passport.authenticate(method, { session: false }, (error, token) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  })(req, res);
});

passport.use(localStrategy);

export default nextConnect<NextApiRequest, NextApiResponse>()
  .use(passport.initialize())
  .post(async (req, res) => {
    try {
      const Auth = await authenticate('local', req, res);

      const { data: user } = await USERS.request({
        method: 'GET',
        url: '/me',
        headers: {
          Authorization: `Bearer ${Auth.accessToken}`,
        },
      });

      const userWithToken = {
        ...user,
        token: Auth.accessToken,
      };

      await setLoginSession(res, userWithToken);

      res.status(200).send(userWithToken);
    } catch (error) {
      console.error(error);
      res.status(401).send(error.message);
    }
  });
