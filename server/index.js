require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Which website may call this server. Set FRONTEND_URL in .env when deploying
// (comma-separate several). Defaults to the Vite dev server.
const FRONTEND_ORIGINS = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',').map((origin) => origin.trim()).filter(Boolean);

const io = new Server(server, {
  cors: { origin: FRONTEND_ORIGINS, credentials: true }
});

app.use(cors({ origin: FRONTEND_ORIGINS, credentials: true }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
// NOTE: do NOT add a global express.json() here. It consumes the request body
// stream before the proxy can forward it, which makes every proxied POST/PATCH
// (login, register, checkout, favorites...) hang and time out. JSON parsing is
// applied per-route below only where this server itself reads the body.

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use(limiter);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'tgtg-middleware' }));

// Proxy to Python FastAPI on 8001
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8001',
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
  on: {
    error: (err, req, res) => {
      console.error('Proxy error:', err.message);
      res.status(502).json({ error: 'Backend unavailable', detail: err.message });
    },
    proxyReq: (proxyReq, req) => {
      console.log(`→ Proxying: ${req.method} ${req.path}`);
    }
  }
}));

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.on('subscribe_store', (storeId) => socket.join(`store_${storeId}`));
  // Stock updates come only from the server (POST /internal/stock-update), never
  // from a browser: a client-sent "bag_purchased" event could be faked by anyone.
  socket.on('disconnect', () => console.log(`Client disconnected: ${socket.id}`));
});

// Only the backend on this same machine may broadcast stock changes. Without this
// check, anyone who could reach the server could push fake "bags left" numbers to
// every shopper's screen.
const LOCAL_ADDRESSES = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

app.post('/internal/stock-update', express.json(), (req, res) => {
  if (!LOCAL_ADDRESSES.has(req.socket.remoteAddress)) {
    return res.status(403).json({ error: 'Internal endpoint' });
  }
  const { storeId, bagId, remaining } = req.body;
  io.to(`store_${storeId}`).emit('stock_update', { bagId, remaining });
  res.json({ broadcast: true });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Middleware on http://localhost:${PORT} → proxying to http://localhost:8001`));