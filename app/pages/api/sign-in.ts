import passport from 'passport';
import nextConnect from 'next-connect';
import { setLoginSession } from 'auth';
import { localStrategy } from 'auth/strategies/local';
import USERS from 'services/users';

interface TokenProps {
  accessToken: string;
}

const authenticate = (method, req, res) => new Promise((resolve, reject) => {
  passport.authenticate(method, { session: false }, (error, token: TokenProps) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  })(req, res);
});

passport.use(localStrategy);

export default nextConnect()
  .use(passport.initialize())
  .post(async (req, res) => {
    try {
      const { accessToken } = await authenticate('local', req, res);

      const { data: user } = await USERS.request({
        method: 'GET',
        url: '/me',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const userWithToken = {
        ...user,
        token: accessToken,
      };

      await setLoginSession(res, userWithToken);

      res.status(200).send(userWithToken);
    } catch (error) {
      console.error(error);
      res.status(401).send(error.message);
    }
  });
