import { removeTokenCookie } from 'auth/cookies';

export default async function signout(req, res) {
  removeTokenCookie(res);
  res.writeHead(302, { Location: '/' });
  res.end();
}
