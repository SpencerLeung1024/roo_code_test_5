# Monopoly Game - Project Architecture

## Overview
This is a single-player Monopoly game implementation designed for web browsers. The game runs on localhost and features comprehensive Monopoly mechanics with simplified visual design.

## Key Features
- **Single Browser Multiplayer**: All players take turns on the same device
- **Text-Based Design**: Simple colored rectangles for pieces and cards
- **Numeric Money**: No physical bills - all transactions use numbers
- **Complete Mechanics**: Includes all standard Monopoly rules and features

## Architecture Summary

### Technology Stack
- **Frontend**: React 18 with JSX
- **Build Tool**: Webpack 5 with Babel
- **State Management**: React Context API + useReducer
- **Styling**: CSS3 with CSS Modules
- **Development**: Webpack Dev Server

### Project Structure
```
kimi/
├── src/
│   ├── components/     # React UI components
│   ├── models/        # Core game logic
│   ├── data/          # Game data (properties, cards)
│   ├── styles/        # CSS styles
│   ├── utils/         # Helper functions
│   └── App.jsx        # Main application
├── public/            # Static files
└── Configuration files
```

### Core Components
- **Game State**: Centralized state management with React Context
- **Player System**: Complete player management with money, properties, jail
- **Property System**: Full property ownership, rent, building mechanics
- **Card System**: Chance and Community Chest cards
- **Board System**: 40-square Monopoly board with all special squares

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation
1. Navigate to the project directory:
   ```bash
   cd kimi
   ```

2. Follow the setup instructions in [SETUP.md](SETUP.md)

3. Start development:
   ```bash
   npm start
   ```

### Development Phases
The implementation is organized into 10 phases:
1. Project Setup
2. Core Infrastructure
3. Data Models
4. Game Board
5. Game Logic
6. Property System
7. Advanced Features
8. UI/UX
9. Polish
10. Deployment

## Documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - Detailed technical architecture
- [SETUP.md](SETUP.md) - Setup and installation guide
- [IMPLEMENTATION_TODO.md](IMPLEMENTATION_TODO.md) - Step-by-step implementation checklist

## Game Mechanics
- **Turn-based gameplay** with dice rolling
- **Property purchase and development** (houses/hotels)
- **Rent collection** based on property development
- **Trading system** between players
- **Auction system** for unpurchased properties
- **Jail mechanics** with "Get Out of Jail Free" cards
- **Bankruptcy handling** with property auctions
- **Chance and Community Chest** card effects

## Design Decisions
- **Simplified visuals** for faster development
- **No external dependencies** beyond React ecosystem
- **Responsive design** for mobile compatibility
- **Local storage** for game persistence
- **Modular architecture** for maintainability

## Next Steps
1. Review the architecture documentation
2. Follow the setup guide to initialize the project
3. Use the implementation todo list to track progress
4. Begin with Phase 1: Project Setup