// src/routes/health.ts
import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/ping', (req, res) => {
  res.send('pong');
});

export default router;