import { GameState, Player, Property, Card } from './types';
import { JailMechanics } from './jail-mechanics';

class MonopolyEngine {
  private state: GameState;

  constructor(initialState?: GameState) {
    this.state = initialState || this.createInitialState();
  }

  private createInitialState(): GameState {
    return {
      players: [],
      currentPlayer: '',
      diceRoll: null,
      phase: 'setup',
      properties: this.createProperties(),
      chanceCards: this.createCards('chance'),
      communityChestCards: this.createCards('community_chest'),
      bankBalance: 0
    };
  }

  private createProperties(): Property[] {
    // Standard Monopoly properties
    return [
      // Brown properties
      { id: 'mediterranean', name: 'Mediterranean Avenue', position: 1, price: 60, mortgageValue: 30,
        owner: null, houses: 0, hotel: false, rent: [2, 10, 30, 90, 160, 250], colorGroup: 'brown', mortgaged: false,
        housePrice: 50, hotelPrice: 50 },
      { id: 'baltic', name: 'Baltic Avenue', position: 3, price: 60, mortgageValue: 30,
        owner: null, houses: 0, hotel: false, rent: [4, 20, 60, 180, 320, 450], colorGroup: 'brown', mortgaged: false,
        housePrice: 50, hotelPrice: 50 },
      // ... (rest of property definitions)
    ];
  }

  private createCards(type: 'chance' | 'community_chest'): Card[] {
    const cards: Card[] = [];
    
    if (type === 'chance') {
      cards.push(
        { id: 'chance1', type, description: 'Advance to Go', action: (game) => {
          const player = game.players.find(p => p.id === game.currentPlayer);
          if (player) player.position = 0;
        }},
        // ... (rest of card definitions)
      );
    } else {
      cards.push(
        { id: 'cc1', type, description: 'Bank error in your favor. Collect $200', action: (game) => {
          const player = game.players.find(p => p.id === game.currentPlayer);
          if (player) player.balance += 200;
        }},
        // ... (rest of card definitions)
      );
    }
    return cards;
  }

  public addPlayer(name: string): Player {
    const player: Player = {
      id: `player_${Date.now()}`,
      name,
      balance: 1500,
      position: 0,
      properties: [],
      inJail: false,
      jailTurns: 0,
      hasGetOutOfJailFree: false,
      bankrupt: false
    };
    this.state.players.push(player);
    if (this.state.players.length === 1) {
      this.state.currentPlayer = player.id;
    }
    return player;
  }

  public rollDice(playerId: string): [number, number] {
    if (this.state.currentPlayer !== playerId) {
      throw new Error('Not your turn');
    }

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    this.state.diceRoll = [dice1, dice2];
    return [dice1, dice2];
  }

  public movePlayer(playerId: string, spaces: number): void {
    const player = this.state.players.find(p => p.id === playerId);
    if (!player) throw new Error('Player not found');

    if (player.inJail) {
      throw new Error('Cannot move while in jail - must resolve jail status first');
    }

    player.position = (player.position + spaces) % 40;
    this.handleLanding(player);
  }

  private handleLanding(player: Player): void {
    const property = this.state.properties.find(p => p.position === player.position);
    if (!property) return;

    if (property.owner) {
      // Pay rent
      if (property.owner !== player.id) {
        const owner = this.state.players.find(p => p.id === property.owner);
        if (owner) {
          const rent = property.rent[property.hotel ? 5 : property.houses];
          player.balance -= rent;
          owner.balance += rent;
        }
      }
    } else {
      // Offer to buy property
      if (player.balance >= property.price) {
        this.purchaseProperty(player.id, property.id);
      }
    }
  }

  public handleJailAction(playerId: string, action: 'pay_bail' | 'use_card' | 'roll_doubles'): boolean {
    return JailMechanics.handleJailAction(this.state, playerId, action);
  }

  public endTurn(): void {
    const currentPlayer = this.state.players.find(p => p.id === this.state.currentPlayer);
    if (currentPlayer?.inJail) {
      currentPlayer.jailTurns++;
    }
    
    const currentIndex = this.state.players.findIndex(p => p.id === this.state.currentPlayer);
    const nextIndex = (currentIndex + 1) % this.state.players.length;
    this.state.currentPlayer = this.state.players[nextIndex].id;
    this.state.diceRoll = null;
  }

  public getState(): GameState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public purchaseProperty(playerId: string, propertyId: string): boolean {
    const player = this.state.players.find(p => p.id === playerId);
    const property = this.state.properties.find(p => p.id === propertyId);
    
    if (!player || !property || property.owner !== null || player.balance < property.price) {
      return false;
    }

    player.balance -= property.price;
    property.owner = playerId;
    player.properties.push(propertyId);
    return true;
  }

  public declinePurchase(playerId: string, propertyId: string): void {
    this.startAuction(propertyId);
  }

  public startAuction(propertyId: string): void {
    const property = this.state.properties.find(p => p.id === propertyId);
    if (!property || property.owner) return;

    this.state.auction = {
      propertyId,
      currentBid: property.price / 2,
      currentBidder: null,
      activeBidders: this.state.players
        .filter(p => !p.bankrupt)
        .map(p => p.id)
    };
  }

  public placeBid(playerId: string, amount: number): boolean {
    if (!this.state.auction ||
        !this.state.auction.activeBidders.includes(playerId) ||
        amount <= this.state.auction.currentBid) {
      return false;
    }

    const player = this.state.players.find(p => p.id === playerId);
    if (!player || player.balance < amount) return false;

    this.state.auction.currentBid = amount;
    this.state.auction.currentBidder = playerId;
    return true;
  }

  public resolveAuction(): void {
    if (!this.state.auction) return;

    const { propertyId, currentBid, currentBidder } = this.state.auction;
    const property = this.state.properties.find(p => p.id === propertyId);
    const player = currentBidder ? this.state.players.find(p => p.id === currentBidder) : null;

    if (property && player && currentBidder) {
      player.balance -= currentBid;
      property.owner = currentBidder;
      player.properties.push(propertyId);
    }

    this.state.auction = undefined;
  }

  // ... (other existing methods)
}

export default MonopolyEngine;