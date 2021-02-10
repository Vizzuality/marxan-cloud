import { getLoginSession } from 'auth';

export default async function user(req, res) {
  try {
    const session = await getLoginSession(req);
    console.log(session);
    res.status(200).json(session);
  } catch (error) {
    res.status(200).json(null);
  }
}
