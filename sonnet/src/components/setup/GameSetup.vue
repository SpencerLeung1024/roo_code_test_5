<template>
  <div class="game-setup-overlay">
    <div class="setup-modal">
      <div class="setup-header">
        <h2>Setup New Game</h2>
        <p>Configure players and start your Monopoly game</p>
      </div>

      <div class="setup-content">
        <!-- Player Count Selection -->
        <div class="setup-section">
          <h3>Number of Players</h3>
          <div class="player-count-selector">
            <button
              v-for="count in [2, 3, 4, 5, 6, 7, 8]"
              :key="count"
              @click="setPlayerCount(count)"
              :class="['count-btn', { active: playerCount === count }]"
            >
              {{ count }}
            </button>
          </div>
        </div>

        <!-- Player Configuration -->
        <div class="setup-section">
          <h3>Configure Players</h3>
          <div class="players-config">
            <div
              v-for="(player, index) in playerConfigs"
              :key="index"
              class="player-config"
            >
              <div class="player-number">Player {{ index + 1 }}</div>
              
              <div class="config-row">
                <div class="name-input">
                  <label>Name:</label>
                  <input
                    v-model="player.name"
                    type="text"
                    :placeholder="`Player ${index + 1}`"
                    maxlength="20"
                  />
                </div>
                
                <div class="piece-selector">
                  <label>Piece:</label>
                  <div class="piece-options">
                    <button
                      v-for="piece in availablePieces"
                      :key="piece.id"
                      @click="selectPiece(index, piece)"
                      :class="['piece-btn', { 
                        selected: player.piece === piece.id,
                        taken: isPieceTaken(piece.id, index)
                      }]"
                      :disabled="isPieceTaken(piece.id, index)"
                      :title="piece.name"
                    >
                      {{ piece.symbol }}
                    </button>
                  </div>
                </div>
              </div>

              <div class="player-preview">
                <div class="preview-piece" :style="{ color: player.color }">
                  {{ getPieceSymbol(player.piece) }}
                </div>
                <div class="preview-info">
                  <div class="preview-name">{{ player.name || `Player ${index + 1}` }}</div>
                  <div class="preview-piece-name">{{ getPieceName(player.piece) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Game Options -->
        <div class="setup-section">
          <h3>Game Options</h3>
          <div class="game-options">
            <div class="option-row">
              <label>
                <input
                  v-model="gameOptions.auctionUnbought"
                  type="checkbox"
                />
                Auction unbought properties
              </label>
            </div>
            <div class="option-row">
              <label>
                <input
                  v-model="gameOptions.limitedHouses"
                  type="checkbox"
                />
                Limited houses (32) and hotels (12)
              </label>
            </div>
            <div class="option-row">
              <label>Free Parking:</label>
              <select v-model="gameOptions.freeParking">
                <option value="nothing">Nothing happens</option>
                <option value="taxes">Collect taxes and fines</option>
                <option value="fixed">Collect $500</option>
              </select>
            </div>
            <div class="option-row">
              <label>Starting Money:</label>
              <select v-model="gameOptions.startingMoney">
                <option value="1500">$1,500 (Standard)</option>
                <option value="2000">$2,000 (Easy)</option>
                <option value="1000">$1,000 (Hard)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="setup-actions">
        <button @click="cancelSetup" class="btn secondary">Cancel</button>
        <button 
          @click="startGame" 
          :disabled="!canStartGame"
          class="btn primary"
        >
          Start Game
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'GameSetup',
  emits: ['start-game', 'cancel-setup'],
  
  setup(props, { emit }) {
    const playerCount = ref(2)
    const playerConfigs = ref([])
    const gameOptions = ref({
      auctionUnbought: false,
      limitedHouses: true,
      freeParking: 'nothing',
      startingMoney: 1500
    })

    // Available game pieces
    const availablePieces = [
      { id: 'car', name: 'Car', symbol: '🚗' },
      { id: 'dog', name: 'Dog', symbol: '🐕' },
      { id: 'hat', name: 'Top Hat', symbol: '🎩' },
      { id: 'boot', name: 'Boot', symbol: '👢' },
      { id: 'ship', name: 'Ship', symbol: '🚢' },
      { id: 'thimble', name: 'Thimble', symbol: '🪡' },
      { id: 'iron', name: 'Iron', symbol: '🔨' },
      { id: 'wheelbarrow', name: 'Wheelbarrow', symbol: '🛍️' }
    ]

    // Player colors
    const playerColors = [
      '#e74c3c', // Red
      '#3498db', // Blue
      '#2ecc71', // Green
      '#f39c12', // Orange
      '#9b59b6', // Purple
      '#1abc9c', // Teal
      '#e67e22', // Dark Orange
      '#34495e'  // Dark Gray
    ]

    // Initialize player configurations
    const initializePlayerConfigs = (count) => {
      playerConfigs.value = Array.from({ length: count }, (_, index) => ({
        name: '',
        piece: index < availablePieces.length ? availablePieces[index].id : null,
        color: playerColors[index % playerColors.length]
      }))
    }

    // Watch player count changes
    watch(playerCount, (newCount) => {
      initializePlayerConfigs(newCount)
    }, { immediate: true })

    // Methods
    const setPlayerCount = (count) => {
      playerCount.value = count
    }

    const selectPiece = (playerIndex, piece) => {
      if (!isPieceTaken(piece.id, playerIndex)) {
        playerConfigs.value[playerIndex].piece = piece.id
      }
    }

    const isPieceTaken = (pieceId, excludeIndex = -1) => {
      return playerConfigs.value.some((config, index) => 
        index !== excludeIndex && config.piece === pieceId
      )
    }

    const getPieceSymbol = (pieceId) => {
      const piece = availablePieces.find(p => p.id === pieceId)
      return piece ? piece.symbol : '❓'
    }

    const getPieceName = (pieceId) => {
      const piece = availablePieces.find(p => p.id === pieceId)
      return piece ? piece.name : 'Unknown'
    }

    // Validation
    const canStartGame = computed(() => {
      return playerConfigs.value.every(config => {
        const hasValidName = config.name.trim().length > 0
        const hasValidPiece = config.piece !== null
        return hasValidName && hasValidPiece
      })
    })

    // Actions
    const startGame = () => {
      if (canStartGame.value) {
        const players = playerConfigs.value.map((config, index) => ({
          name: config.name.trim() || `Player ${index + 1}`,
          piece: config.piece,
          color: config.color
        }))

        emit('start-game', {
          players,
          options: gameOptions.value
        })
      }
    }

    const cancelSetup = () => {
      emit('cancel-setup')
    }

    return {
      playerCount,
      playerConfigs,
      gameOptions,
      availablePieces,
      setPlayerCount,
      selectPiece,
      isPieceTaken,
      getPieceSymbol,
      getPieceName,
      canStartGame,
      startGame,
      cancelSetup
    }
  }
}
</script>

<style scoped>
.game-setup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.setup-modal {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.setup-header {
  background: #2c3e50;
  color: white;
  padding: 1.5rem;
  text-align: center;
  border-radius: 12px 12px 0 0;
}

.setup-header h2 {
  margin: 0;
  font-size: 1.8rem;
}

.setup-header p {
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
}

.setup-content {
  padding: 1.5rem;
}

.setup-section {
  margin-bottom: 2rem;
}

.setup-section h3 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 0.5rem;
}

/* Player Count Selector */
.player-count-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.count-btn {
  padding: 0.75rem 1rem;
  border: 2px solid #bdc3c7;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

.count-btn:hover {
  border-color: #3498db;
}

.count-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

/* Player Configuration */
.players-config {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.player-config {
  border: 1px solid #bdc3c7;
  border-radius: 8px;
  padding: 1rem;
  background: #f8f9fa;
}

.player-number {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
}

.config-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.name-input label,
.piece-selector label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #34495e;
}

.name-input input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 1rem;
}

.name-input input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

/* Piece Selector */
.piece-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.piece-btn {
  padding: 0.75rem;
  border: 2px solid #bdc3c7;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.2s ease;
  text-align: center;
}

.piece-btn:hover:not(:disabled) {
  border-color: #3498db;
  transform: scale(1.05);
}

.piece-btn.selected {
  border-color: #27ae60;
  background: #d5f4e6;
}

.piece-btn.taken {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Player Preview */
.player-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #ecf0f1;
}

.preview-piece {
  font-size: 2rem;
  font-weight: bold;
}

.preview-name {
  font-weight: bold;
  color: #2c3e50;
}

.preview-piece-name {
  font-size: 0.9rem;
  color: #7f8c8d;
}

/* Game Options */
.game-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.option-row label {
  font-weight: 500;
  color: #34495e;
}

.option-row input[type="checkbox"] {
  transform: scale(1.2);
}

.option-row select {
  padding: 0.5rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 0.95rem;
}

/* Setup Actions */
.setup-actions {
  padding: 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #ecf0f1;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-radius: 0 0 12px 12px;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.btn.primary {
  background: #27ae60;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: #229954;
}

.btn.primary:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.btn.secondary {
  background: #95a5a6;
  color: white;
}

.btn.secondary:hover {
  background: #7f8c8d;
}

/* Responsive Design */
@media (max-width: 768px) {
  .setup-modal {
    margin: 1rem;
    max-width: none;
  }
  
  .config-row {
    grid-template-columns: 1fr;
  }
  
  .piece-options {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .setup-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>