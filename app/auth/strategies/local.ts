import Local from 'passport-local';
import AUTHENTICATION from 'services/authentication';

export const localStrategy = new Local.Strategy(
  { usernameField: 'username', passwordField: 'password', session: true },
  (
    username,
    password,
    done,
  ) => {
    AUTHENTICATION.request({
      url: '/sign-in',
      method: 'POST',
      data: { username, password },
      headers: { 'Content-Type': 'application/json' },
    })
      .then(({ data }) => done(null, data))
      .catch((err) => done(err));
  },
);
