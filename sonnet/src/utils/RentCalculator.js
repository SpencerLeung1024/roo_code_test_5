/**
 * Rent Calculator Utility for Monopoly Game
 * Handles rent calculations for all property types with comprehensive scenarios
 */

import { PROPERTIES, RAILROADS, UTILITIES } from '../data/boardData.js'

export class RentCalculator {
  constructor(gameState) {
    this.gameState = gameState
  }

  /**
   * Calculate rent for any space when a player lands on it
   * @param {number} spaceId - The board space ID (0-39)
   * @param {string} landingPlayerId - Player who landed on the space
   * @param {number} diceRoll - Current dice roll (for utility rent calculation)
   * @returns {Object} Rent calculation result
   */
  calculateRentForSpace(spaceId, landingPlayerId, diceRoll = 0) {
    const space = this.gameState.board[spaceId]
    if (!space) {
      return { canCollectRent: false, reason: 'Invalid space' }
    }

    // Check basic rent exemptions
    const exemptionCheck = this.checkRentExemptions(space, landingPlayerId)
    if (!exemptionCheck.canCollectRent) {
      return exemptionCheck
    }

    // Calculate rent based on space type
    switch (space.type) {
      case 'property':
        return this.calculatePropertyRent(spaceId, landingPlayerId)
      case 'railroad':
        return this.calculateRailroadRent(spaceId, landingPlayerId)
      case 'utility':
        return this.calculateUtilityRent(spaceId, landingPlayerId, diceRoll)
      default:
        return { canCollectRent: false, reason: 'Not a rentable property' }
    }
  }

  /**
   * Check if rent can be collected (exemptions and special cases)
   */
  checkRentExemptions(space, landingPlayerId) {
    // Get property data based on space type
    let property
    if (space.type === 'property') {
      property = this.gameState.properties[space.id]
    } else if (space.type === 'railroad') {
      property = this.gameState.railroads[space.id]
    } else if (space.type === 'utility') {
      property = this.gameState.utilities[space.id]
    }

    if (!property) {
      return { canCollectRent: false, reason: 'Property not found' }
    }

    // Check if property is owned
    if (!property.ownerId) {
      return { canCollectRent: false, reason: 'Property is unowned' }
    }

    // Check if player owns the property
    if (property.ownerId === landingPlayerId) {
      return { canCollectRent: false, reason: 'Player owns this property' }
    }

    // Check if property is mortgaged
    if (property.isMortgaged) {
      return { canCollectRent: false, reason: 'Property is mortgaged' }
    }

    // Check if owner is in jail (optional rule - owners in jail can still collect rent)
    const owner = this.gameState.players.find(p => p.id === property.ownerId)
    if (!owner || owner.isBankrupt || !owner.isActive) {
      return { canCollectRent: false, reason: 'Owner is not active' }
    }

    // Check if landing player is in jail (players in jail don't pay rent)
    const landingPlayer = this.gameState.players.find(p => p.id === landingPlayerId)
    if (landingPlayer && landingPlayer.isInJail) {
      return { canCollectRent: false, reason: 'Player is in jail' }
    }

    return { canCollectRent: true, ownerId: property.ownerId, owner }
  }

  /**
   * Calculate rent for regular properties
   */
  calculatePropertyRent(propertyId, landingPlayerId) {
    const property = this.gameState.properties[propertyId]
    const propertyData = PROPERTIES[propertyId]
    
    if (!property || !propertyData) {
      return { canCollectRent: false, reason: 'Property data not found' }
    }

    const exemptionCheck = this.checkRentExemptions({ type: 'property', id: propertyId }, landingPlayerId)
    if (!exemptionCheck.canCollectRent) {
      return exemptionCheck
    }

    let rentAmount = 0
    let rentType = 'base'
    let rentDescription = 'Base rent'

    // Calculate rent based on development
    if (property.hasHotel) {
      rentAmount = propertyData.rent[5] // Hotel rent
      rentType = 'hotel'
      rentDescription = 'Hotel rent'
    } else if (property.houses > 0) {
      rentAmount = propertyData.rent[property.houses] // House rent
      rentType = 'houses'
      rentDescription = `Rent with ${property.houses} house${property.houses > 1 ? 's' : ''}`
    } else {
      // Base rent or monopoly rent
      if (property.isPartOfMonopoly) {
        rentAmount = propertyData.rent[0] * 2 // Double rent for monopoly
        rentType = 'monopoly'
        rentDescription = 'Monopoly rent (double base)'
      } else {
        rentAmount = propertyData.rent[0] // Base rent
        rentType = 'base'
        rentDescription = 'Base rent'
      }
    }

    return {
      canCollectRent: true,
      rentAmount,
      rentType,
      rentDescription,
      ownerId: property.ownerId,
      owner: exemptionCheck.owner,
      propertyName: propertyData.name,
      propertyType: 'property',
      colorGroup: propertyData.colorGroupName,
      development: {
        houses: property.houses,
        hasHotel: property.hasHotel,
        isMonopoly: property.isPartOfMonopoly
      }
    }
  }

  /**
   * Calculate rent for railroads
   */
  calculateRailroadRent(railroadId, landingPlayerId) {
    const railroad = this.gameState.railroads[railroadId]
    const railroadData = RAILROADS[railroadId]
    
    if (!railroad || !railroadData) {
      return { canCollectRent: false, reason: 'Railroad data not found' }
    }

    const exemptionCheck = this.checkRentExemptions({ type: 'railroad', id: railroadId }, landingPlayerId)
    if (!exemptionCheck.canCollectRent) {
      return exemptionCheck
    }

    // Count how many railroads the owner has
    const ownedRailroads = Object.values(this.gameState.railroads)
      .filter(r => r.ownerId === railroad.ownerId)
    const railroadCount = ownedRailroads.length

    // Get rent based on number of railroads owned
    const rentAmount = railroadData.rentSchedule[railroadCount - 1]
    const rentDescription = `Rent for ${railroadCount} railroad${railroadCount > 1 ? 's' : ''}`

    return {
      canCollectRent: true,
      rentAmount,
      rentType: 'railroad',
      rentDescription,
      ownerId: railroad.ownerId,
      owner: exemptionCheck.owner,
      propertyName: railroadData.name,
      propertyType: 'railroad',
      railroadCount,
      ownedRailroads: ownedRailroads.map(r => RAILROADS[r.id]?.name).filter(Boolean)
    }
  }

  /**
   * Calculate rent for utilities
   */
  calculateUtilityRent(utilityId, landingPlayerId, diceRoll) {
    const utility = this.gameState.utilities[utilityId]
    const utilityData = UTILITIES[utilityId]
    
    if (!utility || !utilityData) {
      return { canCollectRent: false, reason: 'Utility data not found' }
    }

    const exemptionCheck = this.checkRentExemptions({ type: 'utility', id: utilityId }, landingPlayerId)
    if (!exemptionCheck.canCollectRent) {
      return exemptionCheck
    }

    // Count how many utilities the owner has
    const ownedUtilities = Object.values(this.gameState.utilities)
      .filter(u => u.ownerId === utility.ownerId)
    const utilityCount = ownedUtilities.length

    // Get multiplier based on number of utilities owned
    const multiplier = utilityData.rentMultipliers[utilityCount - 1]
    
    // Use current dice roll or fallback to last roll
    const rollToUse = diceRoll || this.gameState.dice?.total || 2
    const rentAmount = rollToUse * multiplier
    
    const rentDescription = `${multiplier}× dice roll (${rollToUse}) for ${utilityCount} utilit${utilityCount > 1 ? 'ies' : 'y'}`

    return {
      canCollectRent: true,
      rentAmount,
      rentType: 'utility',
      rentDescription,
      ownerId: utility.ownerId,
      owner: exemptionCheck.owner,
      propertyName: utilityData.name,
      propertyType: 'utility',
      utilityCount,
      multiplier,
      diceRoll: rollToUse,
      ownedUtilities: ownedUtilities.map(u => UTILITIES[u.id]?.name).filter(Boolean)
    }
  }

  /**
   * Calculate total assets value for a player (for bankruptcy assessment)
   */
  calculatePlayerAssets(playerId) {
    const player = this.gameState.players.find(p => p.id === playerId)
    if (!player) return { totalValue: 0, breakdown: {} }

    let totalValue = player.money
    const breakdown = {
      cash: player.money,
      properties: 0,
      railroads: 0,
      utilities: 0,
      houses: 0,
      hotels: 0,
      mortgageValue: 0
    }

    // Calculate property values
    player.properties.forEach(propId => {
      const property = this.gameState.properties[propId]
      const propertyData = PROPERTIES[propId]
      if (property && propertyData) {
        if (property.isMortgaged) {
          // Mortgaged properties have no sale value but mortgage debt
          breakdown.mortgageValue += Math.floor(propertyData.mortgageValue * 1.1)
        } else {
          // Unmortgaged properties can be sold for mortgage value
          breakdown.properties += propertyData.mortgageValue
          totalValue += propertyData.mortgageValue
          
          // Add house/hotel values (50% of cost)
          if (property.houses > 0) {
            const houseValue = property.houses * Math.floor(propertyData.houseCost / 2)
            breakdown.houses += houseValue
            totalValue += houseValue
          }
          if (property.hasHotel) {
            const hotelValue = Math.floor(propertyData.houseCost / 2)
            breakdown.hotels += hotelValue
            totalValue += hotelValue
          }
        }
      }
    })

    // Calculate railroad values
    player.railroads.forEach(railId => {
      const railroad = this.gameState.railroads[railId]
      const railroadData = RAILROADS[railId]
      if (railroad && railroadData) {
        if (railroad.isMortgaged) {
          breakdown.mortgageValue += Math.floor(railroadData.mortgageValue * 1.1)
        } else {
          breakdown.railroads += railroadData.mortgageValue
          totalValue += railroadData.mortgageValue
        }
      }
    })

    // Calculate utility values
    player.utilities.forEach(utilId => {
      const utility = this.gameState.utilities[utilId]
      const utilityData = UTILITIES[utilId]
      if (utility && utilityData) {
        if (utility.isMortgaged) {
          breakdown.mortgageValue += Math.floor(utilityData.mortgageValue * 1.1)
        } else {
          breakdown.utilities += utilityData.mortgageValue
          totalValue += utilityData.mortgageValue
        }
      }
    })

    return { totalValue, breakdown }
  }

  /**
   * Get liquidation options for a player (what they can sell/mortgage)
   */
  getLiquidationOptions(playerId) {
    const player = this.gameState.players.find(p => p.id === playerId)
    if (!player) return { options: [], totalPotential: 0 }

    const options = []
    let totalPotential = 0

    // Houses and hotels (must be sold first before mortgaging)
    player.properties.forEach(propId => {
      const property = this.gameState.properties[propId]
      const propertyData = PROPERTIES[propId]
      if (property && propertyData && !property.isMortgaged) {
        if (property.hasHotel) {
          const hotelValue = Math.floor(propertyData.houseCost / 2)
          options.push({
            type: 'hotel',
            propertyId: propId,
            propertyName: propertyData.name,
            value: hotelValue,
            description: `Sell hotel on ${propertyData.name}`
          })
          totalPotential += hotelValue
        } else if (property.houses > 0) {
          const houseValue = Math.floor(propertyData.houseCost / 2)
          for (let i = property.houses; i > 0; i--) {
            options.push({
              type: 'house',
              propertyId: propId,
              propertyName: propertyData.name,
              value: houseValue,
              housesToSell: 1,
              description: `Sell 1 house on ${propertyData.name}`
            })
            totalPotential += houseValue
          }
        }
      }
    })

    // Mortgage properties (only undeveloped properties)
    player.properties.forEach(propId => {
      const property = this.gameState.properties[propId]
      const propertyData = PROPERTIES[propId]
      if (property && propertyData && !property.isMortgaged && 
          property.houses === 0 && !property.hasHotel) {
        options.push({
          type: 'mortgage',
          propertyId: propId,
          propertyName: propertyData.name,
          value: propertyData.mortgageValue,
          description: `Mortgage ${propertyData.name}`
        })
        totalPotential += propertyData.mortgageValue
      }
    })

    // Mortgage railroads
    player.railroads.forEach(railId => {
      const railroad = this.gameState.railroads[railId]
      const railroadData = RAILROADS[railId]
      if (railroad && railroadData && !railroad.isMortgaged) {
        options.push({
          type: 'mortgage',
          propertyId: railId,
          propertyName: railroadData.name,
          value: railroadData.mortgageValue,
          description: `Mortgage ${railroadData.name}`
        })
        totalPotential += railroadData.mortgageValue
      }
    })

    // Mortgage utilities
    player.utilities.forEach(utilId => {
      const utility = this.gameState.utilities[utilId]
      const utilityData = UTILITIES[utilId]
      if (utility && utilityData && !utility.isMortgaged) {
        options.push({
          type: 'mortgage',
          propertyId: utilId,
          propertyName: utilityData.name,
          value: utilityData.mortgageValue,
          description: `Mortgage ${utilityData.name}`
        })
        totalPotential += utilityData.mortgageValue
      }
    })

    // Sort by value (highest first) within each category
    options.sort((a, b) => {
      const typeOrder = { 'house': 1, 'hotel': 1, 'mortgage': 2 }
      if (typeOrder[a.type] !== typeOrder[b.type]) {
        return typeOrder[a.type] - typeOrder[b.type]
      }
      return b.value - a.value
    })

    return { options, totalPotential }
  }

  /**
   * Check if player can afford rent and get payment options
   */
  getPaymentOptions(playerId, rentAmount) {
    const player = this.gameState.players.find(p => p.id === playerId)
    if (!player) {
      return { canPay: false, needsLiquidation: false, shortfall: rentAmount }
    }

    if (player.money >= rentAmount) {
      return {
        canPay: true,
        needsLiquidation: false,
        shortfall: 0,
        paymentMethod: 'cash'
      }
    }

    // Calculate what player can liquidate
    const liquidationOptions = this.getLiquidationOptions(playerId)
    const shortfall = rentAmount - player.money
    const canCoverWithLiquidation = liquidationOptions.totalPotential >= shortfall

    return {
      canPay: canCoverWithLiquidation,
      needsLiquidation: true,
      shortfall,
      availableCash: player.money,
      liquidationPotential: liquidationOptions.totalPotential,
      liquidationOptions: liquidationOptions.options,
      isBankrupt: !canCoverWithLiquidation
    }
  }
}

// Export utility function for creating calculator instances
export const createRentCalculator = (gameState) => {
  return new RentCalculator(gameState)
}

export default RentCalculator