import { getLoginSession } from 'auth';
import { removeTokenCookie } from 'auth/cookies';
import AUTHENTICATION from 'services/authentication';

export default async function signout(req, res) {
  const { token } = await getLoginSession(req);

  try {
    // First, invalidate session token on the API
    await AUTHENTICATION.request({
      url: '/sign-out',
      method: 'POST',
      data: null,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Second, Remove local cookie
    removeTokenCookie(res);

    // Then redirect to landing page
    res.writeHead(302, { Location: '/' });
  } catch (error) {
    console.error(error);
    res.status(500).end(error.message);
  }

  res.end();
}
