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

// Allow both 5173 and 5174 to make requests and connect to WebSockets
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true }
});

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'tgtg-middleware' }));

// Proxy all /api/* requests to Python FastAPI
app.use('/api', createProxyMiddleware({
  target: process.env.PYTHON_API_URL || 'http://localhost:8001',
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
  on: {
    error: (err, req, res) => {
      res.status(502).json({ error: 'Backend service unavailable', detail: err.message });
    }
  }
}));

// Socket.io — real-time stock updates
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('subscribe_store', (storeId) => {
    socket.join(`store_${storeId}`);
    console.log(`${socket.id} subscribed to store ${storeId}`);
  });

  socket.on('bag_purchased', ({ storeId, bagId, remaining }) => {
    io.to(`store_${storeId}`).emit('stock_update', { bagId, remaining });
  });

  socket.on('disconnect', () => console.log(`Client disconnected: ${socket.id}`));
});

// Broadcast stock updates (called internally after orders)
app.post('/internal/stock-update', (req, res) => {
  const { storeId, bagId, remaining } = req.body;
  io.to(`store_${storeId}`).emit('stock_update', { bagId, remaining });
  res.json({ broadcast: true });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Middleware running on http://localhost:${PORT}`));