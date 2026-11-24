import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { test } from 'node:test';

async function serve(env, signal, check) {
  const server = spawn(process.execPath, ['server.js'], {
    env,
    stdio: ['ignore', 'pipe', 'inherit']
  });
  const exited = once(server, 'exit');

  try {
    using output = createInterface({ input: server.stdout });
    const [origin] = await once(output, 'line', { signal: AbortSignal.timeout(5_000) });

    const request = (path, form, headers = { origin }) =>
      fetch(new URL(path, origin), {
        method: form ? 'POST' : 'GET',
        body: form && new URLSearchParams(form),
        headers,
        redirect: 'manual',
        signal: AbortSignal.timeout(5_000)
      });

    await check(request);

    server.kill(signal);
    assert.deepEqual(await exited, [0, null]);
  } finally {
    server.kill('SIGKILL');
    await exited;
  }
}

async function read(response, status) {
  assert.equal(response.status, status);

  return response.text();
}

test('creates, edits, publishes and deletes posts', { timeout: 20_000 }, async (t) => {
  const path = await mkdtemp(join(tmpdir(), 'yamb-express-'));
  t.after(() => rm(path, { recursive: true, force: true }));

  const env = { ...process.env, PORT: '0', YAMB_POSTS_DIR: path };
  const title = 'Welcome <b> & Yamb';
  const heading = 'Welcome &lt;b&gt; &amp; Yamb';
  const text = '**Hello from Yamb.**\n\n[All posts](/)\n\n<script>unsafe()</script>';

  let edit;
  let published;

  await serve(env, 'SIGTERM', async (request) => {
    await read(await request('/posts', { title, text, status: 'draft' }), 303);

    const drafts = await read(await request('/'), 200);
    assert.match(drafts, /<li>\s*Welcome &lt;b&gt; &amp; Yamb \(draft\)/);
    [, edit] = drafts.match(/href="(\/posts\/[^"]+)">Edit/);

    const invalid = await read(await request(edit, { title: ' ', text, status: 'draft' }), 422);
    assert.match(invalid, /role="alert"/);
    assert.ok(invalid.includes('&lt;script&gt;unsafe()&lt;/script&gt;</textarea>'));

    await read(await request(edit, { title, text, status: 'published' }), 303);

    const listing = await read(await request('/'), 200);
    [, published] = listing.match(/href="(\/\d{4}\/\d{2}\/[a-z0-9-]+)">Welcome/);

    const article = await request(published);
    const page = await read(article, 200);
    assert.ok(page.includes(`<title>${heading}</title>`));
    assert.ok(page.includes(`<h1>${heading}</h1>`));
    assert.match(page, /<strong>Hello from Yamb\.<\/strong>/);
    assert.ok(page.includes(`<a href="${new URL('/', article.url).href}">All posts</a>`));
    assert.doesNotMatch(page, /<script/i);

    await read(await request(`${edit}/delete`, {}, { origin: 'https://example.com' }), 403);
    await read(await request(article.url.replace('127.0.0.1', 'localhost')), 403);
    await read(await request('/posts', { title, text, status: 'unknown' }), 422);
  });

  await serve(env, 'SIGINT', async (request) => {
    await read(await request(published), 200);
    await read(await request(`${edit}/delete`, {}), 303);

    for (const missing of [published, edit, '/2000/01/missing', '/year/month/missing']) {
      await read(await request(missing), 404);
    }
  });
});
