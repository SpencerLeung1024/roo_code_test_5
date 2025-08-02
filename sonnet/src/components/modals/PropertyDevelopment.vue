<template>
  <div class="property-development-modal" v-if="show">
    <div class="modal-overlay" @click="closeModal"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>Property Development</h3>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>

      <div class="development-overview">
        <div class="bank-inventory">
          <h4>Bank Inventory</h4>
          <div class="inventory-items">
            <div class="inventory-item">
              <span class="item-icon">🏠</span>
              <span class="item-label">Houses:</span>
              <span class="item-count">{{ gameState.bank.houses }}</span>
            </div>
            <div class="inventory-item">
              <span class="item-icon">🏨</span>
              <span class="item-label">Hotels:</span>
              <span class="item-count">{{ gameState.bank.hotels }}</span>
            </div>
          </div>
        </div>

        <div class="player-development">
          <h4>Your Development</h4>
          <div class="development-stats">
            <div class="stat-item">
              <span class="stat-label">Houses Owned:</span>
              <span class="stat-value">{{ currentPlayer.houses || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Hotels Owned:</span>
              <span class="stat-value">{{ currentPlayer.hotels || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="monopolies-section">
        <h4>Your Monopolies</h4>
        
        <div v-if="playerMonopolies.length === 0" class="no-monopolies">
          <div class="info-message">
            <span class="info-icon">💡</span>
            <div class="info-text">
              <strong>No monopolies available for development</strong>
              <p>You need to own all properties in a color group to build houses and hotels.</p>
            </div>
          </div>
        </div>

        <div v-else class="monopoly-groups">
          <div 
            v-for="monopoly in playerMonopolies"
            :key="monopoly.colorGroup"
            class="monopoly-group"
          >
            <div class="monopoly-header">
              <h5 :style="{ color: monopoly.colorGroup }">
                {{ monopoly.groupName }}
              </h5>
              <div class="group-stats">
                <span class="house-cost">House Cost: ${{ monopoly.houseCost }}</span>
                <span class="hotel-cost">Hotel Cost: ${{ monopoly.houseCost }}</span>
              </div>
            </div>

            <div class="monopoly-properties">
              <div 
                v-for="property in monopoly.properties"
                :key="property.id"
                class="property-card"
                :class="{ 
                  mortgaged: property.isMortgaged,
                  'max-developed': property.hasHotel || property.houses === 4
                }"
              >
                <div class="property-header">
                  <span class="property-name">{{ property.name }}</span>
                  <span v-if="property.isMortgaged" class="mortgaged-badge">Mortgaged</span>
                </div>

                <div class="property-development">
                  <div class="current-development">
                    <div class="development-display">
                      <span v-for="n in property.houses" :key="`house-${n}`" class="house-icon">🏠</span>
                      <span v-if="property.hasHotel" class="hotel-icon">🏨</span>
                      <span v-if="property.houses === 0 && !property.hasHotel" class="no-development">
                        No Development
                      </span>
                    </div>
                    <div class="rent-info">
                      Current Rent: ${{ property.currentRent }}
                    </div>
                  </div>

                  <div class="development-actions" v-if="!property.isMortgaged">
                    <!-- Build Houses -->
                    <div v-if="property.houses < 4 && !property.hasHotel" class="action-group">
                      <div class="action-header">
                        <span class="action-label">Build Houses</span>
                        <span class="max-houses">(Max: {{ 4 - property.houses }})</span>
                      </div>
                      <div class="build-controls">
                        <div class="quantity-selector">
                          <label>Houses:</label>
                          <input 
                            type="number"
                            v-model.number="housesToBuild[property.id]"
                            :min="1"
                            :max="getMaxHousesToBuild(property)"
                            class="quantity-input"
                          >
                        </div>
                        <div class="cost-display">
                          Cost: ${{ getBuildCost(property, housesToBuild[property.id] || 1) }}
                        </div>
                        <button 
                          @click="buildHouses(property.id, housesToBuild[property.id] || 1)"
                          :disabled="!canBuildHouses(property, housesToBuild[property.id] || 1) || isProcessing"
                          class="btn build-btn"
                        >
                          Build {{ housesToBuild[property.id] || 1 }} House{{ (housesToBuild[property.id] || 1) > 1 ? 's' : '' }}
                        </button>
                      </div>
                    </div>

                    <!-- Build Hotel -->
                    <div v-if="property.houses === 4 && !property.hasHotel" class="action-group">
                      <div class="action-header">
                        <span class="action-label">Build Hotel</span>
                        <span class="hotel-info">(Replaces 4 houses)</span>
                      </div>
                      <div class="build-controls">
                        <div class="cost-display">
                          Cost: ${{ monopoly.houseCost }}
                        </div>
                        <button 
                          @click="buildHotel(property.id)"
                          :disabled="!canBuildHotel(property) || isProcessing"
                          class="btn hotel-btn"
                        >
                          Build Hotel
                        </button>
                      </div>
                    </div>

                    <!-- Fully Developed -->
                    <div v-if="property.hasHotel" class="action-group">
                      <div class="fully-developed">
                        <span class="status-icon">✅</span>
                        <span class="status-text">Fully Developed</span>
                      </div>
                    </div>

                    <!-- Development Warnings -->
                    <div class="warnings">
                      <div v-if="property.houses < 4 && !canBuildHouses(property, 1)" class="warning-item">
                        {{ getHouseBuildWarning(property) }}
                      </div>
                      <div v-if="property.houses === 4 && !canBuildHotel(property)" class="warning-item">
                        {{ getHotelBuildWarning(property) }}
                      </div>
                    </div>
                  </div>

                  <div v-else class="mortgaged-notice">
                    <span class="notice-icon">🏦</span>
                    <span class="notice-text">Cannot develop mortgaged property</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Even Development Rule -->
            <div class="development-rules">
              <div class="rule-info">
                <span class="rule-icon">⚖️</span>
                <span class="rule-text">
                  Houses must be built evenly across the monopoly. You cannot have more than 1 house difference between properties.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="development-strategy" v-if="playerMonopolies.length > 0">
        <h5>💡 Development Strategy Tips</h5>
        <ul>
          <li>Build houses on monopolies with high rental traffic (like orange and red properties)</li>
          <li>Consider the cost vs. rental income ratio when deciding where to develop</li>
          <li>Hotels free up houses for other properties, but require significant investment</li>
          <li>Develop properties that opponents are likely to land on frequently</li>
          <li>Keep some cash on hand for unexpected expenses like rent or taxes</li>
        </ul>
      </div>

      <div class="modal-footer">
        <div class="footer-info">
          <span class="player-money">Your Money: ${{ currentPlayer.money.toLocaleString() }}</span>
        </div>
        <button @click="closeModal" class="btn cancel-btn">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { gameState, gameActions } from '../../game/gameState.js'
import { COLOR_GROUPS } from '../../data/boardData.js'

export default {
  name: 'PropertyDevelopment',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    currentPlayer: {
      type: Object,
      required: true
    }
  },

  emits: ['close', 'development'],

  setup(props, { emit }) {
    const isProcessing = ref(false)
    const housesToBuild = ref({})

    // Player's monopolies
    const playerMonopolies = computed(() => {
      const monopolies = []
      
      Object.entries(COLOR_GROUPS).forEach(([colorGroup, groupData]) => {
        const properties = groupData.properties.map(id => gameState.properties[id])
        const ownedByPlayer = properties.filter(p => p.ownerId === props.currentPlayer.id)
        
        if (ownedByPlayer.length === properties.length) {
          // Player owns all properties in this group
          monopolies.push({
            colorGroup,
            groupName: groupData.name,
            houseCost: properties[0].houseCost,
            properties: ownedByPlayer.sort((a, b) => a.id - b.id)
          })
        }
      })
      
      return monopolies
    })

    // Helper methods
    const getMaxHousesToBuild = (property) => {
      const maxFromProperty = 4 - property.houses
      const maxFromBank = gameState.bank.houses
      const maxFromMoney = Math.floor(props.currentPlayer.money / property.houseCost)
      
      // Even development rule: check other properties in the monopoly
      const monopoly = playerMonopolies.value.find(m => 
        m.properties.some(p => p.id === property.id)
      )
      
      if (monopoly) {
        const otherProperties = monopoly.properties.filter(p => p.id !== property.id)
        const minHousesOnOthers = Math.min(...otherProperties.map(p => p.houses))
        const maxFromEvenRule = Math.max(0, minHousesOnOthers + 1 - property.houses)
        
        return Math.min(maxFromProperty, maxFromBank, maxFromMoney, maxFromEvenRule)
      }
      
      return Math.min(maxFromProperty, maxFromBank, maxFromMoney)
    }

    const getBuildCost = (property, houseCount) => {
      return property.houseCost * houseCount
    }

    const canBuildHouses = (property, houseCount) => {
      if (property.isMortgaged || property.hasHotel || property.houses >= 4) {
        return false
      }
      
      const cost = getBuildCost(property, houseCount)
      if (props.currentPlayer.money < cost) {
        return false
      }
      
      if (gameState.bank.houses < houseCount) {
        return false
      }
      
      // Even development rule
      const monopoly = playerMonopolies.value.find(m => 
        m.properties.some(p => p.id === property.id)
      )
      
      if (monopoly) {
        const otherProperties = monopoly.properties.filter(p => p.id !== property.id)
        const minHousesOnOthers = Math.min(...otherProperties.map(p => p.houses))
        const wouldHaveAfterBuild = property.houses + houseCount
        
        // Cannot have more than 1 house difference
        if (wouldHaveAfterBuild > minHousesOnOthers + 1) {
          return false
        }
      }
      
      return true
    }

    const canBuildHotel = (property) => {
      if (property.isMortgaged || property.hasHotel || property.houses !== 4) {
        return false
      }
      
      if (props.currentPlayer.money < property.houseCost) {
        return false
      }
      
      if (gameState.bank.hotels <= 0) {
        return false
      }
      
      return true
    }

    const getHouseBuildWarning = (property) => {
      if (property.isMortgaged) return 'Property is mortgaged'
      if (property.hasHotel) return 'Property has hotel'
      if (property.houses >= 4) return 'Maximum houses built'
      
      const cost = getBuildCost(property, 1)
      if (props.currentPlayer.money < cost) {
        return `Need $${(cost - props.currentPlayer.money).toLocaleString()} more`
      }
      
      if (gameState.bank.houses < 1) {
        return 'No houses available in bank'
      }
      
      // Check even development rule
      const monopoly = playerMonopolies.value.find(m => 
        m.properties.some(p => p.id === property.id)
      )
      
      if (monopoly) {
        const otherProperties = monopoly.properties.filter(p => p.id !== property.id)
        const minHousesOnOthers = Math.min(...otherProperties.map(p => p.houses))
        
        if (property.houses >= minHousesOnOthers + 1) {
          return 'Must build evenly across monopoly'
        }
      }
      
      return 'Cannot build houses'
    }

    const getHotelBuildWarning = (property) => {
      if (property.houses !== 4) return 'Need 4 houses first'
      if (props.currentPlayer.money < property.houseCost) {
        return `Need $${(property.houseCost - props.currentPlayer.money).toLocaleString()} more`
      }
      if (gameState.bank.hotels <= 0) return 'No hotels available in bank'
      return 'Cannot build hotel'
    }

    // Actions
    const buildHouses = async (propertyId, houseCount) => {
      const property = gameState.properties[propertyId]
      if (!canBuildHouses(property, houseCount) || isProcessing.value) {
        return
      }

      isProcessing.value = true
      
      try {
        const result = gameActions.buildHouses(props.currentPlayer.id, propertyId, houseCount)
        
        if (result.success) {
          emit('development', {
            type: 'build-houses',
            propertyId,
            housesBuilt: result.housesBuilt,
            cost: result.cost,
            player: props.currentPlayer
          })
          
          // Reset input
          housesToBuild.value[propertyId] = 1
        } else {
          alert(`Cannot build houses: ${result.reason}`)
        }
      } catch (error) {
        console.error('Build houses error:', error)
        alert('An error occurred while building houses. Please try again.')
      } finally {
        isProcessing.value = false
      }
    }

    const buildHotel = async (propertyId) => {
      const property = gameState.properties[propertyId]
      if (!canBuildHotel(property) || isProcessing.value) {
        return
      }

      isProcessing.value = true
      
      try {
        const result = gameActions.buildHotel(props.currentPlayer.id, propertyId)
        
        if (result.success) {
          emit('development', {
            type: 'build-hotel',
            propertyId,
            cost: result.cost,
            player: props.currentPlayer
          })
        } else {
          alert(`Cannot build hotel: ${result.reason}`)
        }
      } catch (error) {
        console.error('Build hotel error:', error)
        alert('An error occurred while building hotel. Please try again.')
      } finally {
        isProcessing.value = false
      }
    }

    const closeModal = () => {
      if (!isProcessing.value) {
        emit('close')
      }
    }

    // Initialize housesToBuild for all properties
    watch(() => playerMonopolies.value, (newMonopolies) => {
      const newHousesToBuild = {}
      newMonopolies.forEach(monopoly => {
        monopoly.properties.forEach(property => {
          if (!housesToBuild.value[property.id]) {
            newHousesToBuild[property.id] = 1
          } else {
            newHousesToBuild[property.id] = housesToBuild.value[property.id]
          }
        })
      })
      housesToBuild.value = newHousesToBuild
    }, { immediate: true })

    return {
      gameState,
      isProcessing,
      housesToBuild,
      playerMonopolies,
      getMaxHousesToBuild,
      getBuildCost,
      canBuildHouses,
      canBuildHotel,
      getHouseBuildWarning,
      getHotelBuildWarning,
      buildHouses,
      buildHotel,
      closeModal
    }
  }
}
</script>

<style scoped>
.property-development-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  margin: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #7f8c8d;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #2c3e50;
}

.development-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px;
  background: #f8f9fa;
}

.bank-inventory, .player-development {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.bank-inventory h4, .player-development h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.inventory-items, .development-stats {
  display: grid;
  gap: 12px;
}

.inventory-item, .stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-icon {
  font-size: 1.2rem;
}

.item-label, .stat-label {
  font-weight: 600;
  color: #34495e;
}

.item-count, .stat-value {
  margin-left: auto;
  font-weight: 700;
  color: #27ae60;
}

.monopolies-section {
  padding: 24px;
}

.monopolies-section h4 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.no-monopolies {
  text-align: center;
  padding: 40px 20px;
}

.info-message {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: center;
  padding: 20px;
  background: #e1ecf4;
  border-radius: 8px;
  max-width: 400px;
  margin: 0 auto;
}

.info-icon {
  font-size: 2rem;
}

.info-text strong {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
}

.info-text p {
  margin: 0;
  color: #7f8c8d;
  line-height: 1.4;
}

.monopoly-groups {
  display: grid;
  gap: 32px;
}

.monopoly-group {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
}

.monopoly-header {
  padding: 20px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.monopoly-header h5 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.group-stats {
  display: flex;
  gap: 16px;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.house-cost, .hotel-cost {
  font-weight: 600;
}

.monopoly-properties {
  padding: 24px;
  display: grid;
  gap: 20px;
}

.property-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  background: white;
}

.property-card.mortgaged {
  background: #fff3cd;
  border-color: #ffeaa7;
}

.property-card.max-developed {
  background: #e8f5e8;
  border-color: #27ae60;
}

.property-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.property-name {
  font-weight: 700;
  color: #2c3e50;
  font-size: 1.1rem;
}

.mortgaged-badge {
  background: #f39c12;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.property-development {
  display: grid;
  gap: 16px;
}

.current-development {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.development-display {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.house-icon, .hotel-icon {
  font-size: 1.2rem;
}

.no-development {
  color: #7f8c8d;
  font-style: italic;
}

.rent-info {
  font-size: 0.9rem;
  color: #27ae60;
  font-weight: 600;
}

.action-group {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.action-label {
  font-weight: 700;
  color: #2c3e50;
}

.max-houses, .hotel-info {
  font-size: 0.85rem;
  color: #7f8c8d;
}

.build-controls {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-selector label {
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
}

.quantity-input {
  width: 60px;
  padding: 8px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  text-align: center;
  font-weight: 600;
}

.cost-display {
  font-weight: 600;
  color: #e74c3c;
  text-align: center;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.build-btn {
  background: #3498db;
  color: white;
}

.build-btn:not(:disabled):hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.hotel-btn {
  background: #9b59b6;
  color: white;
}

.hotel-btn:not(:disabled):hover {
  background: #8e44ad;
  transform: translateY(-1px);
}

.btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.fully-developed {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  color: #27ae60;
  font-weight: 600;
}

.status-icon {
  font-size: 1.2rem;
}

.mortgaged-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  padding: 16px;
  background: #fff3cd;
  border-radius: 6px;
  color: #856404;
  font-weight: 600;
}

.notice-icon {
  font-size: 1.2rem;
}

.warnings {
  margin-top: 12px;
}

.warning-item {
  padding: 8px 12px;
  background: #fff3cd;
  color: #856404;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
}

.development-rules {
  padding: 16px 24px;
  background: #e1ecf4;
  border-top: 1px solid #e9ecef;
}

.rule-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rule-icon {
  font-size: 1.2rem;
}

.rule-text {
  color: #2c3e50;
  font-size: 0.9rem;
  line-height: 1.4;
}

.development-strategy {
  padding: 20px 24px;
  background: #e8f4fd;
  border-top: 1px solid #e0e0e0;
}

.development-strategy h5 {
  margin: 0 0 12px 0;
  color: #2c3e50;
}

.development-strategy ul {
  margin: 0;
  padding-left: 20px;
}

.development-strategy li {
  margin-bottom: 8px;
  color: #34495e;
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
}

.footer-info {
  color: #2c3e50;
  font-weight: 600;
}

.player-money {
  font-size: 1.1rem;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #7f8c8d;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-height: 95vh;
  }
  
  .development-overview {
    grid-template-columns: 1fr;
  }
  
  .build-controls {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style>