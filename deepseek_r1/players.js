// Player management
const PLAYER_COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00']; // Red, Green, Blue, Yellow

class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.position = 0;
        this.money = 1500;
        this.properties = [];
        this.inJail = false;
        this.getOutOfJailCards = 0;
    }

    move(spaces) {
        this.position = (this.position + spaces) % 40;
        return this.position;
    }

    pay(amount) {
        this.money -= amount;
        return this.money;
    }

    receive(amount) {
        this.money += amount;
        return this.money;
    }

    addProperty(propertyId) {
        this.properties.push(propertyId);
    }
}

// Player manager
let players = [];
let currentPlayerIndex = 0;

function createPlayers(numPlayers) {
    players = [];
    for (let i = 0; i < numPlayers; i++) {
        players.push(new Player(i, `Player ${i + 1}`));
    }
    renderPlayers();
}

// Initialize players with 4 players by default
document.addEventListener('DOMContentLoaded', () => {
    createPlayers(4); // Default to 4 players
});

function renderPlayers() {
    const playersPanel = document.getElementById('players-panel');
    playersPanel.innerHTML = '';
    
    players.forEach(player => {
        const playerElement = document.createElement('div');
        playerElement.className = 'player-info';
        
        const colorElement = document.createElement('div');
        colorElement.className = 'player-color';
        colorElement.style.backgroundColor = PLAYER_COLORS[player.id];
        
        const infoElement = document.createElement('div');
        infoElement.innerHTML = `
            <strong>${player.name}</strong><br>
            Money: $${player.money}<br>
            Properties:
            <div class="player-properties">
                ${player.properties.map(propId => {
                    const prop = PROPERTIES[propId];
                    return prop ? `<span class="property-tag" style="background-color:${getColorForGroup(prop.colorGroup)}">${prop.name}</span>` : '';
                }).join('')}
            </div>
        `;
        
        playerElement.appendChild(colorElement);
        playerElement.appendChild(infoElement);
        playersPanel.appendChild(playerElement);
    });
}

// Initialize players on load