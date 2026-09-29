import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import jwt from 'jsonwebtoken';
import test from 'node:test';
import express from 'express';

process.env.JWT_SECRET = 'test-only-secret-for-auth-middleware';
const { default: authenticateToken } = await import('../src/middlewares/auth.js');

async function withAuthServer(run) {
  const app = express();
  app.get('/protected', authenticateToken, (req, res) => res.json({ id: req.user.ID }));
  const server = createServer(app);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  try {
    await run(`http://127.0.0.1:${server.address().port}/protected`);
  } finally {
    server.close();
    server.closeAllConnections();
    await once(server, 'close');
  }
}

test('rejects missing and expired bearer tokens', async () => {
  await withAuthServer(async (url) => {
    const missing = await fetch(url);
    assert.equal(missing.status, 401);

    const expiredToken = jwt.sign({ ID: 'user-1', exp: Math.floor(Date.now() / 1000) - 10 }, process.env.JWT_SECRET);
    const expired = await fetch(url, { headers: { Authorization: `Bearer ${expiredToken}` } });
    assert.equal(expired.status, 401);
    assert.equal((await expired.json()).message, 'Token expirado');
  });
});

test('rejects tokens signed with a disallowed algorithm and accepts HS256', async () => {
  await withAuthServer(async (url) => {
    const wrongAlgorithm = jwt.sign({ ID: 'user-1' }, process.env.JWT_SECRET, { algorithm: 'HS512' });
    const rejected = await fetch(url, { headers: { Authorization: `Bearer ${wrongAlgorithm}` } });
    assert.equal(rejected.status, 401);

    const validToken = jwt.sign({ ID: 'user-1' }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' });
    const accepted = await fetch(url, { headers: { Authorization: `Bearer ${validToken}` } });
    assert.equal(accepted.status, 200);
    assert.deepEqual(await accepted.json(), { id: 'user-1' });
  });
});
