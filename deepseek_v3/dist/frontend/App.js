"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const Board_1 = __importDefault(require("@frontend/components/Board"));
const JailControls_1 = __importDefault(require("@frontend/components/JailControls"));
const App = () => {
    const [socket, setSocket] = (0, react_1.useState)(null);
    const [gameState, setGameState] = (0, react_1.useState)(null);
    const [currentPlayer, setCurrentPlayer] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const newSocket = (0, socket_io_client_1.default)('http://localhost:3000');
        setSocket(newSocket);
        newSocket.on('game-state', (state) => {
            setGameState(state);
            const player = state.players.find(p => p.id === state.currentPlayer);
            if (player)
                setCurrentPlayer(player);
        });
        newSocket.on('jail-action-result', (result) => {
            setGameState(result.newState);
        });
        return () => {
            newSocket.disconnect();
        };
    }, []);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "app", children: [(0, jsx_runtime_1.jsx)("h1", { children: "Monopoly" }), currentPlayer?.inJail && ((0, jsx_runtime_1.jsx)(JailControls_1.default, { player: currentPlayer, onJailAction: (action) => {
                    if (socket && currentPlayer) {
                        socket.emit('handle-jail-action', {
                            playerId: currentPlayer.id,
                            action
                        });
                    }
                } })), (0, jsx_runtime_1.jsx)(Board_1.default, { properties: gameState?.properties || [], currentPlayerPosition: currentPlayer?.position || 0 })] }));
};
exports.default = App;
