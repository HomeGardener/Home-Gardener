import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import test from 'node:test';
import express from 'express';
import { uploadFile } from '../src/middlewares/upload.js';

async function withUploadServer(run) {
  const app = express();
  app.post('/', uploadFile('Foto'), (req, res) => res.sendStatus(204));
  const server = createServer(app);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.close();
    await once(server, 'close');
  }
}

test('rejects multipart requests with too many text fields', async () => {
  await withUploadServer(async (url) => {
    const body = new FormData();
    for (let index = 0; index < 11; index += 1) body.append(`field${index}`, 'value');

    const response = await fetch(url, { method: 'POST', body });
    assert.equal(response.status, 400);
    assert.match((await response.json()).message, /demasiados campos/);
  });
});

test('rejects multipart text fields larger than 16 KiB', async () => {
  await withUploadServer(async (url) => {
    const body = new FormData();
    body.append('nombre', 'x'.repeat(16 * 1024 + 1));

    const response = await fetch(url, { method: 'POST', body });
    assert.equal(response.status, 400);
    assert.match((await response.json()).message, /demasiados campos/);
  });
});

test('rejects image files larger than 5 MiB', async () => {
  await withUploadServer(async (url) => {
    const body = new FormData();
    body.append('Foto', new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: 'image/jpeg' }), 'photo.jpg');

    const response = await fetch(url, { method: 'POST', body });
    assert.equal(response.status, 400);
    assert.match((await response.json()).message, /5 MB/);
  });
});

test('rejects unsupported image types and mismatched image signatures', async () => {
  await withUploadServer(async (url) => {
    const unsupported = new FormData();
    unsupported.append('Foto', new Blob(['not an image'], { type: 'image/gif' }), 'photo.gif');
    const unsupportedResponse = await fetch(url, { method: 'POST', body: unsupported });
    assert.equal(unsupportedResponse.status, 400);

    const mismatched = new FormData();
    mismatched.append('Foto', new Blob(['not an image'], { type: 'image/jpeg' }), 'photo.jpg');
    const mismatchedResponse = await fetch(url, { method: 'POST', body: mismatched });
    assert.equal(mismatchedResponse.status, 400);
    assert.match((await mismatchedResponse.json()).message, /no coincide/);
  });
});

test('accepts a supported image with a matching signature', async () => {
  await withUploadServer(async (url) => {
    const body = new FormData();
    body.append('Foto', new Blob([new Uint8Array([0xff, 0xd8, 0xff])], { type: 'image/jpeg' }), 'photo.jpg');

    const response = await fetch(url, { method: 'POST', body });
    assert.equal(response.status, 204);
  });
});
