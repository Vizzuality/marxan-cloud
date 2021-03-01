import Iron from '@hapi/iron';
import { decode } from 'jsonwebtoken';
import { setTokenCookie, getTokenCookie } from './cookies';

const { TOKEN_SECRET } = process.env;

export async function setLoginSession(res, userData) {
  const { token } = userData;
  const decodedToken = decode(token);
  const { iat, exp } = decodedToken; // iat and ext are seconds
  const createdAt = new Date(iat * 1000); // converting to milliseconds
  const expiresAt = new Date(exp * 1000); // converting to milliseconds
  // Create a session object with params from token
  const obj = {
    ...userData,
    createdAt,
    expiresAt,
    token,
    decodedToken,
  };
  // Generates a new secure token only for the application
  const newToken = await Iron.seal(obj, TOKEN_SECRET, Iron.defaults);

  // sync session expiration from token
  setTokenCookie(res, newToken, {
    maxAge: exp - iat, // seconds
    expires: new Date(exp * 1000), // date format required
  });
}

export async function getLoginSession(req) {
  const token = getTokenCookie(req);

  if (!token) return undefined;

  const session = await Iron.unseal(token, TOKEN_SECRET, Iron.defaults);
  const { expiresAt } = session;

  // Validate the expiration date of the session
  if (Date.now() > expiresAt) {
    throw new Error('Session expired');
  }

  return session;
}
