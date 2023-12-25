const { createServer } = require('http');
const next = require('next');
const routes = require('./routes'); // der Pfad zu deiner routes-Datei

const app = next({ dev });
const handler = routes.getRequestHandler(app);

app.prepare().then(() => {
  createServer(handler).listen(33333, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:33333');
  });
});
