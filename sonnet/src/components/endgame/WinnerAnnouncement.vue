<template>
  <div class="winner-announcement-overlay" v-if="showAnnouncement">
    <div class="announcement-modal">
      <!-- Celebration Background -->
      <div class="celebration-background">
        <div class="confetti-container">
          <div 
            v-for="n in 50" 
            :key="n" 
            class="confetti-piece"
            :style="getConfettiStyle(n)"
          ></div>
        </div>
        <div class="fireworks-container">
          <div 
            v-for="n in 6" 
            :key="n" 
            class="firework"
            :style="getFireworkStyle(n)"
          ></div>
        </div>
      </div>

      <!-- Winner Display -->
      <div class="winner-display">
        <div class="crown-animation">👑</div>
        
        <div class="winner-header">
          <h1 class="winner-title">🎉 GAME OVER! 🎉</h1>
          <div v-if="winnerData.player" class="winner-subtitle">
            {{ winnerData.player.name }} WINS!
          </div>
          <div v-else class="no-winner-subtitle">
            Game Ended
          </div>
        </div>

        <!-- Winner Card -->
        <div v-if="winnerData.player" class="winner-card">
          <div class="winner-avatar">
            <div class="player-piece" :style="{ color: winnerData.player.color }">
              {{ getPlayerPieceSymbol(winnerData.player.piece) }}
            </div>
            <div class="victory-glow"></div>
          </div>
          
          <div class="winner-info">
            <div class="winner-name">{{ winnerData.player.name }}</div>
            <div class="winner-reason">{{ getWinReasonText() }}</div>
            <div class="winner-stats">
              <div class="stat-item">
                <span class="stat-icon">💰</span>
                <span class="stat-label">Final Net Worth:</span>
                <span class="stat-value">${{ winnerData.netWorth.toLocaleString() }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">🏠</span>
                <span class="stat-label">Properties Owned:</span>
                <span class="stat-value">{{ getTotalProperties(winnerData.player) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">💵</span>
                <span class="stat-label">Final Cash:</span>
                <span class="stat-value">${{ winnerData.player.money.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Victory Message -->
        <div class="victory-message">
          <div class="message-icon">🏆</div>
          <div class="message-text">{{ getVictoryMessage() }}</div>
        </div>
      </div>

      <!-- Final Rankings -->
      <div class="final-rankings">
        <h3>📊 Final Rankings</h3>
        <div class="rankings-list">
          <div 
            v-for="(ranking, index) in gameStats.playerRankings" 
            :key="ranking.playerId"
            class="ranking-item"
            :class="{ 
              winner: index === 0 && ranking.status !== 'bankrupt',
              bankrupt: ranking.status === 'bankrupt'
            }"
          >
            <div class="ranking-position">
              <span class="position-number">{{ ranking.rank }}</span>
              <span v-if="index === 0 && ranking.status !== 'bankrupt'" class="position-crown">👑</span>
            </div>
            
            <div class="ranking-player">
              <div class="player-name">{{ ranking.name }}</div>
              <div class="player-status" :class="{ bankrupt: ranking.status === 'bankrupt' }">
                {{ ranking.status === 'bankrupt' ? 'BANKRUPT' : 'ACTIVE' }}
              </div>
            </div>
            
            <div class="ranking-stats">
              <div class="net-worth">${{ ranking.netWorth.toLocaleString() }}</div>
              <div class="properties-count">{{ ranking.properties + ranking.railroads + ranking.utilities }} assets</div>
            </div>
            
            <div class="ranking-medal">
              <span v-if="index === 0 && ranking.status !== 'bankrupt'">🥇</span>
              <span v-else-if="index === 1 && ranking.status !== 'bankrupt'">🥈</span>
              <span v-else-if="index === 2 && ranking.status !== 'bankrupt'">🥉</span>
              <span v-else-if="ranking.status === 'bankrupt'">💀</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Game Statistics Summary -->
      <div class="game-summary">
        <h3>📈 Game Summary</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-icon">⏱️</div>
            <div class="summary-content">
              <div class="summary-label">Game Duration</div>
              <div class="summary-value">{{ formatGameDuration() }}</div>
            </div>
          </div>
          
          <div class="summary-item">
            <div class="summary-icon">🔄</div>
            <div class="summary-content">
              <div class="summary-label">Total Turns</div>
              <div class="summary-value">{{ gameStats.totalTurns }}</div>
            </div>
          </div>
          
          <div class="summary-item">
            <div class="summary-icon">👥</div>
            <div class="summary-content">
              <div class="summary-label">Players</div>
              <div class="summary-value">{{ gameStats.totalPlayers }}</div>
            </div>
          </div>
          
          <div class="summary-item">
            <div class="summary-icon">💀</div>
            <div class="summary-content">
              <div class="summary-label">Bankruptcies</div>
              <div class="summary-value">{{ gameStats.bankruptPlayers }}</div>
            </div>
          </div>
          
          <div class="summary-item">
            <div class="summary-icon">🏠</div>
            <div class="summary-content">
              <div class="summary-label">Properties Traded</div>
              <div class="summary-value">{{ gameStats.propertiesDistributed }}</div>
            </div>
          </div>
          
          <div class="summary-item">
            <div class="summary-icon">💰</div>
            <div class="summary-content">
              <div class="summary-label">Total Money</div>
              <div class="summary-value">${{ Math.round(gameStats.gameMetrics.totalMoneyInGame).toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Achievement Highlights -->
      <div v-if="achievements.length > 0" class="achievements">
        <h3>🏆 Game Achievements</h3>
        <div class="achievements-list">
          <div 
            v-for="achievement in achievements" 
            :key="achievement.id"
            class="achievement-item"
          >
            <div class="achievement-icon">{{ achievement.icon }}</div>
            <div class="achievement-content">
              <div class="achievement-title">{{ achievement.title }}</div>
              <div class="achievement-description">{{ achievement.description }}</div>
              <div class="achievement-player">{{ achievement.playerName }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="announcement-actions">
        <button 
          @click="showGameSummary"
          class="action-btn summary-btn"
        >
          <span class="btn-icon">📊</span>
          View Detailed Summary
        </button>
        
        <button 
          @click="startNewGame"
          class="action-btn new-game-btn"
        >
          <span class="btn-icon">🎮</span>
          Start New Game
        </button>
        
        <button 
          @click="closeAnnouncement"
          class="action-btn close-btn"
        >
          <span class="btn-icon">✅</span>
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'WinnerAnnouncement',

  props: {
    winnerData: {
      type: Object,
      required: true
    },
    gameStats: {
      type: Object,
      required: true
    },
    endReason: {
      type: String,
      default: 'Last Player Standing'
    },
    autoShow: {
      type: Boolean,
      default: true
    }
  },

  emits: [
    'show-game-summary',
    'start-new-game',
    'close-announcement'
  ],

  setup(props, { emit }) {
    const showAnnouncement = ref(false)

    // Game pieces mapping
    const gamePieces = {
      'car': '🚗',
      'dog': '🐕',
      'hat': '🎩',
      'boot': '👢',
      'ship': '🚢',
      'thimble': '🪡',
      'iron': '🔨',
      'wheelbarrow': '🛍️'
    }

    // Computed properties
    const achievements = computed(() => {
      const achievements = []
      
      if (!props.gameStats.playerRankings) return achievements

      // Property mogul achievement
      const propertyKing = props.gameStats.playerRankings.find(p => 
        (p.properties + p.railroads + p.utilities) >= 8
      )
      if (propertyKing) {
        achievements.push({
          id: 'property-mogul',
          icon: '🏰',
          title: 'Property Mogul',
          description: `Owned ${propertyKing.properties + propertyKing.railroads + propertyKing.utilities} properties`,
          playerName: propertyKing.name
        })
      }

      // Survivor achievement
      if (props.gameStats.bankruptPlayers >= 2) {
        achievements.push({
          id: 'survivor',
          icon: '🛡️',
          title: 'Survivor',
          description: `Outlasted ${props.gameStats.bankruptPlayers} bankruptcies`,
          playerName: props.winnerData.player?.name || 'Winner'
        })
      }

      // Marathon achievement
      if (props.gameStats.duration >= 60) {
        achievements.push({
          id: 'marathon',
          icon: '⏰',
          title: 'Marathon Player',
          description: `Played for ${props.gameStats.duration} minutes`,
          playerName: 'All Players'
        })
      }

      // High roller achievement
      const highRoller = props.gameStats.playerRankings.find(p => p.netWorth >= 5000)
      if (highRoller) {
        achievements.push({
          id: 'high-roller',
          icon: '💎',
          title: 'High Roller',
          description: `Achieved net worth of $${highRoller.netWorth.toLocaleString()}`,
          playerName: highRoller.name
        })
      }

      return achievements
    })

    // Methods
    const getPlayerPieceSymbol = (piece) => {
      return gamePieces[piece] || piece || '❓'
    }

    const getTotalProperties = (player) => {
      return (player.properties?.length || 0) + 
             (player.railroads?.length || 0) + 
             (player.utilities?.length || 0)
    }

    const getWinReasonText = () => {
      switch (props.endReason) {
        case 'Last Player Standing':
          return 'Last Player Standing'
        case 'Time Limit Reached':
          return 'Time Limit Victory'
        case 'Asset Threshold Met':
          return 'Wealth Accumulation Victory'
        case 'Turn Limit Reached':
          return 'Turn Limit Victory'
        default:
          return 'Victory'
      }
    }

    const getVictoryMessage = () => {
      if (!props.winnerData.player) {
        return 'Game ended without a clear winner.'
      }

      const messages = [
        `${props.winnerData.player.name} has dominated the property market!`,
        `Congratulations to ${props.winnerData.player.name} for their strategic victory!`,
        `${props.winnerData.player.name} proves that in Monopoly, patience and strategy win!`,
        `Victory belongs to ${props.winnerData.player.name}!`,
        `${props.winnerData.player.name} emerges as the ultimate property tycoon!`
      ]
      
      return messages[Math.floor(Math.random() * messages.length)]
    }

    const formatGameDuration = () => {
      const duration = props.gameStats.duration
      if (duration < 60) {
        return `${duration} minutes`
      } else {
        const hours = Math.floor(duration / 60)
        const minutes = duration % 60
        return `${hours}h ${minutes}m`
      }
    }

    const getConfettiStyle = (index) => {
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff']
      const delay = Math.random() * 3
      const duration = 3 + Math.random() * 2
      const leftPosition = Math.random() * 100
      
      return {
        backgroundColor: colors[index % colors.length],
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        left: `${leftPosition}%`
      }
    }

    const getFireworkStyle = (index) => {
      const delay = index * 0.5
      const leftPosition = 10 + (index * 15)
      
      return {
        animationDelay: `${delay}s`,
        left: `${leftPosition}%`
      }
    }

    const showGameSummary = () => {
      emit('show-game-summary', {
        winnerData: props.winnerData,
        gameStats: props.gameStats,
        endReason: props.endReason
      })
    }

    const startNewGame = () => {
      emit('start-new-game')
    }

    const closeAnnouncement = () => {
      showAnnouncement.value = false
      emit('close-announcement')
    }

    // Auto-show announcement
    onMounted(() => {
      if (props.autoShow) {
        setTimeout(() => {
          showAnnouncement.value = true
        }, 500)
      }
    })

    return {
      // Reactive state
      showAnnouncement,
      achievements,

      // Methods
      getPlayerPieceSymbol,
      getTotalProperties,
      getWinReasonText,
      getVictoryMessage,
      formatGameDuration,
      getConfettiStyle,
      getFireworkStyle,
      showGameSummary,
      startNewGame,
      closeAnnouncement
    }
  }
}
</script>

<style scoped>
.winner-announcement-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  backdrop-filter: blur(10px);
}

.announcement-modal {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.8);
  max-width: 1000px;
  width: 95%;
  max-height: 95vh;
  overflow-y: auto;
  position: relative;
  border: 3px solid #f1c40f;
}

.celebration-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  border-radius: 20px;
}

.confetti-container {
  position: absolute;
  top: -10px;
  left: 0;
  right: 0;
  height: 100%;
}

.confetti-piece {
  position: absolute;
  width: 10px;
  height: 10px;
  animation: confetti-fall 5s linear infinite;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.fireworks-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
}

.firework {
  position: absolute;
  top: 60%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  animation: firework 2s ease-out infinite;
}

@keyframes firework {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  50% {
    transform: translateY(-200px) scale(1.5);
    opacity: 1;
  }
  100% {
    transform: translateY(-300px) scale(2);
    opacity: 0;
    box-shadow: 0 0 0 20px rgba(255, 255, 255, 0);
  }
}

.winner-display {
  text-align: center;
  padding: 40px 30px;
  position: relative;
  z-index: 10;
}

.crown-animation {
  font-size: 4rem;
  animation: crown-bounce 2s ease-in-out infinite;
  margin-bottom: 20px;
}

@keyframes crown-bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-10px) scale(1.1); }
}

.winner-header {
  margin-bottom: 30px;
}

.winner-title {
  font-size: 3rem;
  font-weight: bold;
  color: #f1c40f;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5), 0 0 10px #f1c40f; }
  to { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5), 0 0 20px #f1c40f, 0 0 30px #f1c40f; }
}

.winner-subtitle,
.no-winner-subtitle {
  font-size: 2rem;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.winner-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 30px;
  margin: 30px auto;
  max-width: 600px;
  position: relative;
}

.winner-avatar {
  position: relative;
  margin-bottom: 20px;
}

.player-piece {
  font-size: 4rem;
  font-weight: bold;
  display: inline-block;
  position: relative;
  z-index: 2;
}

.victory-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(241, 196, 15, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: victory-pulse 1.5s ease-in-out infinite;
}

@keyframes victory-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.6; }
}

.winner-info {
  color: white;
}

.winner-name {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.winner-reason {
  font-size: 1.2rem;
  margin-bottom: 20px;
  color: #f1c40f;
  font-weight: bold;
}

.winner-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 10px 15px;
  border-radius: 8px;
}

.stat-icon {
  font-size: 1.2rem;
}

.stat-label {
  flex: 1;
  text-align: left;
}

.stat-value {
  font-weight: bold;
  color: #f1c40f;
}

.victory-message {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  margin: 20px auto;
  max-width: 600px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.message-icon {
  font-size: 2rem;
}

.message-text {
  font-size: 1.1rem;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.final-rankings {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  margin: 20px;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.final-rankings h3 {
  color: white;
  text-align: center;
  margin: 0 0 20px 0;
  font-size: 1.5rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.rankings-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.ranking-item.winner {
  background: rgba(241, 196, 15, 0.2);
  border-color: #f1c40f;
  transform: scale(1.02);
}

.ranking-item.bankrupt {
  opacity: 0.6;
  background: rgba(231, 76, 60, 0.1);
  border-color: rgba(231, 76, 60, 0.3);
}

.ranking-position {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 60px;
}

.position-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.position-crown {
  font-size: 1.2rem;
}

.ranking-player {
  flex: 1;
}

.player-name {
  font-size: 1.1rem;
  font-weight: bold;
  color: white;
  margin-bottom: 4px;
}

.player-status {
  font-size: 0.9rem;
  color: #2ecc71;
  font-weight: bold;
}

.player-status.bankrupt {
  color: #e74c3c;
}

.ranking-stats {
  text-align: right;
}

.net-worth {
  font-size: 1.1rem;
  font-weight: bold;
  color: #f1c40f;
  margin-bottom: 4px;
}

.properties-count {
  font-size: 0.9rem;
  color: #bdc3c7;
}

.ranking-medal {
  font-size: 1.5rem;
  min-width: 30px;
  text-align: center;
}

.game-summary {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  margin: 20px;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.game-summary h3 {
  color: white;
  text-align: center;
  margin: 0 0 20px 0;
  font-size: 1.5rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  text-align: center;
}

.summary-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.summary-label {
  font-size: 0.9rem;
  color: #bdc3c7;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
}

.achievements {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  margin: 20px;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.achievements h3 {
  color: white;
  text-align: center;
  margin: 0 0 20px 0;
  font-size: 1.5rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.achievement-icon {
  font-size: 2rem;
  min-width: 40px;
  text-align: center;
}

.achievement-content {
  flex: 1;
}

.achievement-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #f1c40f;
  margin-bottom: 4px;
}

.achievement-description {
  font-size: 0.9rem;
  color: white;
  margin-bottom: 4px;
}

.achievement-player {
  font-size: 0.8rem;
  color: #bdc3c7;
  font-style: italic;
}

.announcement-actions {
  display: flex;
  gap: 15px;
  padding: 25px;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0 0 20px 20px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 15px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.summary-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.summary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.3);
}

.new-game-btn {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
}

.new-game-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(46, 204, 113, 0.3);
}

.close-btn {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  color: white;
}

.close-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(149, 165, 166, 0.3);
}

.btn-icon {
  font-size: 1.2rem;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .announcement-modal {
    width: 98%;
    margin: 10px;
  }

  .winner-title {
    font-size: 2rem;
  }

  .winner-subtitle,
  .no-winner-subtitle {
    font-size: 1.5rem;
  }

  .winner-card {
    margin: 20px auto;
    padding: 20px;
  }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .announcement-actions {
    flex-direction: column;
    padding: 20px;
  }

  .ranking-item {
    flex-wrap: wrap;
    gap: 10px;
  }

  .ranking-stats {
    order: 3;
    width: 100%;
    text-align: left;
    margin-top: 10px;
  }
}
</style>