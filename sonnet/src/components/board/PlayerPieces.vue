<template>
  <div class="player-pieces" v-if="playersOnSpace.length > 0">
    <div 
      class="player-piece" 
      v-for="playerId in playersOnSpace" 
      :key="playerId"
      :style="getPlayerStyle(playerId)"
      :title="getPlayerName(playerId)"
    ></div>
  </div>
</template>

<script>
import { computed } from 'vue'
import gameState from '../../game/gameState.js'

export default {
  name: 'PlayerPieces',
  
  props: {
    playersOnSpace: {
      type: Array,
      default: () => []
    }
  },
  
  setup(props) {
    // Get player style (color) by ID
    const getPlayerStyle = (playerId) => {
      const player = gameState.players.find(p => p.id === playerId)
      if (player) {
        return {
          backgroundColor: player.color,
          borderColor: player.color === '#ffffff' ? '#2c3e50' : '#ffffff'
        }
      }
      return {
        backgroundColor: '#2c3e50',
        borderColor: '#ffffff'
      }
    }
    
    // Get player name by ID for tooltip
    const getPlayerName = (playerId) => {
      const player = gameState.players.find(p => p.id === playerId)
      return player ? player.name : 'Unknown Player'
    }
    
    return {
      getPlayerStyle,
      getPlayerName
    }
  }
}
</script>

<style scoped>
.player-pieces {
  position: absolute;
  bottom: 2px;
  left: 2px;
  right: 2px;
  display: flex;
  gap: 1px;
  flex-wrap: wrap;
  z-index: 10;
  pointer-events: none;
}

.player-piece {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .player-piece {
    width: 7px;
    height: 7px;
  }
}

@media (max-width: 480px) {
  .player-pieces {
    bottom: 1px;
    left: 1px;
    right: 1px;
  }
  
  .player-piece {
    width: 6px;
    height: 6px;
  }
}
</style>