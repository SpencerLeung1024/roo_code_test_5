import type { GameState } from '../types';

/**
 * Auction stubs – not implemented in this vertical slice.
 * These exports provide types so UI/engine can reference them later without compile errors.
 */

export interface AuctionState {
  tileId: number;
  active: boolean;
  highestBid: number;
  highestBidderId: string | null;
  participants: string[]; // player ids
}

export function startAuction(_state: GameState, _tileId: number, _participants: string[]): AuctionState {
  return {
    tileId: _tileId,
    active: true,
    highestBid: 0,
    highestBidderId: null,
    participants: _participants,
  };
}

export function placeBid(_state: GameState, auction: AuctionState, bidderId: string, amount: number): boolean {
  if (!auction.active) return false;
  if (amount <= auction.highestBid) return false;
  if (!auction.participants.includes(bidderId)) return false;
  auction.highestBid = amount;
  auction.highestBidderId = bidderId;
  return true;
}

export function closeAuction(_state: GameState, auction: AuctionState): AuctionState {
  auction.active = false;
  return auction;
}