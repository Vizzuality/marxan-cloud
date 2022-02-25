// Needed by the Kubernetes and load balancer health checks
export default function handler(req, res) {
  res.status(200).json({ ping: 'pong' });
}
