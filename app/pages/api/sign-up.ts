import AUTHENTICATION from 'services/authentication';

export default async function signup(req, res) {
  try {
    await AUTHENTICATION.request({
      url: '/sign-up',
      method: 'POST',
      data: {
        displayName: req.body.displayName,
        email: req.body.username,
        password: req.body.password,
      },
      headers: { 'Content-Type': 'application/json' },
    });

    res.status(200).send({ done: true });
  } catch (error) {
    console.error(error);
    res.status(500).end(error.message);
  }
}
