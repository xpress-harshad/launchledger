import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/settings.js', ['settings.js', 'text/javascript; charset=utf-8']]
]);

createServer(async (request, response) => {
  const file = files.get(request.url.split('?')[0]);
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  if (!file) {
    response.writeHead(404).end('Page not found');
    return;
  }
  try {
    const [filename, type] = file;
    const body = await readFile(new URL(filename, import.meta.url));
    response.writeHead(200, {
      'Content-Type': type,
      'Content-Length': body.length,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': "default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(500).end('Unable to load the page');
  }
}).listen(process.env.PORT || 3000, () => {
  console.log('LaunchLedger is ready on port ' + (process.env.PORT || 3000));
});
