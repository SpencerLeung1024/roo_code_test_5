# Monopoly Game - Single Player Web Version

A complete Monopoly game implementation in vanilla JavaScript, running entirely in your web browser. No downloads, no plugins, no frameworks - just pure web technology.

## 🎮 How to Play

1. Open `index.html` in your web browser
2. Set up your game (number of players, starting money)
3. Take turns rolling dice and making strategic decisions
4. Buy properties, build houses, and bankrupt your opponents!

## 🚀 Quick Start

### Option 1: Direct Browser
Simply open `kimi/index.html` in any modern web browser.

### Option 2: Local Server (Recommended)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve .
```

Then visit `http://localhost:8000/kimi/`

## 🏗️ Architecture Overview

This project follows a modular architecture with clear separation of concerns:

- **Models**: Data structures (Player, Property, Board, etc.)
- **Engine**: Game logic and rules
- **UI**: User interface components
- **Services**: Business logic for complex operations
- **Utils**: Helper functions and utilities

## 📁 Project Structure

```
kimi/
├── index.html              # Main entry point
├── css/                    # Styling
├── js/                     # JavaScript modules
├── assets/                 # Images, sounds
└── docs/                   # Documentation
```

## 🎯 Features

### Core Gameplay
- ✅ Complete Monopoly rules implementation
- ✅ Turn-based gameplay
- ✅ Property buying and selling
- ✅ House and hotel building
- ✅ Rent calculation
- ✅ Jail mechanics
- ✅ Chance and Community Chest cards

### Advanced Features
- ✅ Save/load game state
- ✅ Property trading
- ✅ Auction system
- ✅ Mortgage handling
- ✅ Bankruptcy rules

### User Experience
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Intuitive interface
- ✅ Clear game state indication
- ✅ Mobile-friendly

## 🛠️ Development

### Prerequisites
- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+)
- Text editor or IDE
- Local HTTP server (recommended)

### Getting Started
1. Clone or download the project
2. Navigate to the `kimi` folder
3. Start a local HTTP server
4. Open `index.html` in your browser

### Development Commands
```bash
# Start development server
python -m http.server 8000

# Run tests (in browser console)
# All tests run automatically on page load
```

### Code Style
- ES6+ JavaScript
- Modular architecture
- JSDoc documentation
- Consistent naming conventions

## 🧪 Testing

Tests are built into the application and run automatically in the browser console. Look for:
- Unit tests for game logic
- Integration tests for game flow
- Performance benchmarks

## 🐛 Troubleshooting

### Common Issues

**Game not loading**
- Check browser console for errors
- Ensure using local HTTP server
- Verify file permissions

**Save/load not working**
- Check LocalStorage permissions
- Clear browser cache
- Check browser console for storage errors

**Performance issues**
- Close other browser tabs
- Check for browser extensions
- Try refreshing the page

## 🤝 Contributing

This is a learning project, but suggestions are welcome! Please:
1. Test thoroughly in multiple browsers
2. Follow the existing code style
3. Add tests for new features
4. Update documentation

## 📄 License

This project is for educational purposes. Monopoly is a trademark of Hasbro.

## 🙋‍♂️ Support

For issues or questions:
1. Check the browser console for errors
2. Review the documentation in `docs/`
3. Test in a different browser
4. Clear browser cache and reload

## 🗺️ Roadmap

### Version 1.0 (Current)
- Basic Monopoly gameplay
- Single player experience
- Save/load functionality

### Future Versions
- AI opponents
- Multiplayer support
- Sound effects
- Statistics tracking
- Custom house rules
- Theme customization

---

**Happy gaming!** 🎲🏠