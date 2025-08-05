"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var helmet_1 = __importDefault(require("helmet"));
var compression_1 = __importDefault(require("compression"));
var path_1 = __importDefault(require("path"));
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var app = (0, express_1.default)();
var httpServer = (0, http_1.createServer)(app);
var io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL
            ? ['http://localhost:3000', 'http://127.0.0.1:3000', process.env.FRONTEND_URL]
            : ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
// Serve static files from React app
app.use(express_1.default.static(path_1.default.join(__dirname, '../dist')));
// Handle API routes
app.get('/api/status', function (req, res) {
    res.json({ status: 'ok' });
});
// Handle Socket.IO connections
io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});
// Serve React app for all other routes
app.get('*', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, '../dist/index.html'));
});
var PORT = process.env.PORT || 3001;
httpServer.listen(PORT, function () {
    console.log("Server listening on port ".concat(PORT));
});
