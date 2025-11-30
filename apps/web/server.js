#!/usr/bin/env node

/**
 * Custom Next.js development server with HTTPS support
 * Handles SSL certificates for local development
 */

const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = parseInt(process.env.PORT || '3001', 10);

// HTTPS configuration
const httpsOptions =
  process.env.ENABLE_HTTPS === 'true'
    ? {
        key: fs.readFileSync(path.resolve('./certs/example.com+4-key.pem')),
        cert: fs.readFileSync(path.resolve('./certs/example.com+4.pem')),
      }
    : null;

app
  .prepare()
  .then(() => {
    if (httpsOptions) {
      // Create HTTPS server
      const server = createServer(httpsOptions, (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      });

      server.listen(port, (err) => {
        if (err) throw err;
        console.log(`🔒 HTTPS Ready on https://localhost:${port}`);
        console.log(`🔒 HTTPS Ready on https://127.0.0.1:${port}`);
        console.log(`🔒 HTTPS Ready on https://example.com:${port}`);
      });
    } else {
      // Create HTTP server (fallback)
      const { createServer: createHttpServer } = require('http');

      const server = createHttpServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      });

      server.listen(port, (err) => {
        if (err) throw err;
        console.log(`🌐 Ready on http://localhost:${port}`);
      });
    }
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
