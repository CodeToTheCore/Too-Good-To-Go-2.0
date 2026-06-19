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

const io = new Server(server, {
  cors: { origin: ['http://localhost:5173'], credentials: true }
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
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
  socket.on('bag_purchased', ({ storeId, bagId, remaining }) => {
    io.to(`store_${storeId}`).emit('stock_update', { bagId, remaining });
  });
  socket.on('disconnect', () => console.log(`Client disconnected: ${socket.id}`));
});

app.post('/internal/stock-update', express.json(), (req, res) => {
  const { storeId, bagId, remaining } = req.body;
  io.to(`store_${storeId}`).emit('stock_update', { bagId, remaining });
  res.json({ broadcast: true });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Middleware on http://localhost:${PORT} → proxying to http://localhost:8001`));