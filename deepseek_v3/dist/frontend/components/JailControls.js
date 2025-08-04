"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const JailControls = ({ player, onJailAction }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "jail-controls", children: [(0, jsx_runtime_1.jsxs)("h3", { children: ["You're in Jail (Turn ", player.jailTurns + 1, "/3)"] }), (0, jsx_runtime_1.jsxs)("div", { className: "jail-actions", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => onJailAction('pay_bail'), children: "Pay $50 Bail" }), player.hasGetOutOfJailFree && ((0, jsx_runtime_1.jsx)("button", { onClick: () => onJailAction('use_card'), children: "Use Get Out of Jail Free Card" })), (0, jsx_runtime_1.jsx)("button", { onClick: () => onJailAction('roll_doubles'), children: "Try Rolling Doubles" })] })] }));
};
exports.default = JailControls;
