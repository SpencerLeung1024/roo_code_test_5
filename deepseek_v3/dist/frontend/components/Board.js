"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Board = ({ properties, currentPlayerPosition }) => {
    return ((0, jsx_runtime_1.jsx)("div", { className: "board", children: properties.map(property => ((0, jsx_runtime_1.jsxs)("div", { className: `property ${property.colorGroup}`, "data-position": property.position, children: [(0, jsx_runtime_1.jsx)("div", { className: "property-name", children: property.name }), property.owner && ((0, jsx_runtime_1.jsx)("div", { className: "property-owner", children: property.owner }))] }, property.id))) }));
};
exports.default = Board;
