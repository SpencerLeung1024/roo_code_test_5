const express = require('express');
const WebSocket = require('ws');
const app = express();
const port = 3000;

// Serve static files from client directory
app.use(express.static('client'));

// Create WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// Set up HTTP server
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Handle WebSocket upgrades
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});