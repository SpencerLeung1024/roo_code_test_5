import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Security middleware
app.use(helmet());
app.use(compression());

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../dist')));

// Handle API routes
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok' });
});

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});