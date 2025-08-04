// Core type definitions for Monopoly game

interface Player {
  id: string;
  name: string;
  balance: number;
  position: number;
  properties: string[]; // Array of property IDs
  inJail: boolean;
  jailTurns: number;
  hasGetOutOfJailFree: boolean;
  bankrupt: boolean;
}

interface Property {
  id: string;
  name: string;
  position: number;
  price: number;
  mortgageValue: number;
  owner: string | null; // Player ID
  houses: number;
  hotel: boolean;
  rent: number[];
  colorGroup: string;
  mortgaged: boolean;
  housePrice: number;
  hotelPrice: number;
}

interface GameState {
  players: Player[];
  currentPlayer: string; // Player ID
  diceRoll: [number, number] | null;
  phase: 'setup' | 'main' | 'end';
  properties: Property[];
  chanceCards: Card[];
  communityChestCards: Card[];
  bankBalance: number;
  auction?: {
    propertyId: string;
    currentBid: number;
    currentBidder: string | null;
    activeBidders: string[];
  };
}

interface Card {
  id: string;
  type: 'chance' | 'community_chest';
  description: string;
  action: (game: GameState) => void;
  canKeep?: boolean; // For "Get Out of Jail Free" cards
}

type CardEffect = {
  type: 'money' | 'move' | 'property' | 'jail' | 'repairs' | 'dividend';
  amount?: number; // For money transactions
  position?: number; // For movement
  perHouse?: number; // For repairs
  perHotel?: number; // For repairs
  targetPlayer?: string; // For forcing payments between players
  jailAction?: 'go_to_jail' | 'get_out_of_jail'; // Specific jail actions
};

// Property transaction types
type PropertyTransaction = {
  playerId: string;
  propertyId: string;
  amount?: number;
};

type PropertyDevelopment = {
  playerId: string;
  propertyId: string;
  action: 'buildHouse' | 'sellHouse' | 'buildHotel' | 'sellHotel';
};

// Jail action payload
interface JailAction {
  playerId: string;
  action: 'pay_bail' | 'use_card' | 'roll_doubles';
}

export type {
  Player,
  Property,
  GameState,
  Card,
  CardEffect,
  PropertyTransaction,
  PropertyDevelopment,
  JailAction
};