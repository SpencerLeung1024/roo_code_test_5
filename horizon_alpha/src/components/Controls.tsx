import React from 'react';
import { useGameStore } from '../state/store';
import { selectPhase, selectTurnInfo, selectUI, selectTileById, selectCurrentPlayer, selectCurrentPlayerJailInfo } from '../state/selectors';
import { TurnPhase } from '../data/constants';
import Modal from './Modal';

export const Controls: React.FC = () => {
  const { state, dispatch } = useGameStore();
  const phase = selectPhase(state);
  const turn = selectTurnInfo(state);
  const ui = selectUI(state);
  const currentPlayer = selectCurrentPlayer(state);
  const jailInfo = selectCurrentPlayerJailInfo(state);
  const tile = typeof ui.purchasePromptTileId === 'number' ? (selectTileById(state, ui.purchasePromptTileId) as any) : undefined;

  const startDemo = () => {
    const seed = Math.random().toString(36).slice(2);
    dispatch({ type: 'INIT_NEW_GAME', numberOfPlayers: 4, seed });
  };

  const onRoll = () => dispatch({ type: 'ROLL_DICE' });
  const onMove = () => dispatch({ type: 'MOVE_CURRENT_PLAYER' });
  const onEnd = () => dispatch({ type: 'END_TURN' });

  const canRoll = phase === TurnPhase.Idle;
  const canMove = phase === TurnPhase.Rolled && !!turn.dice;
  const canEnd = phase === TurnPhase.Resolve || phase === TurnPhase.End;

  const canInteractPurchase = phase === TurnPhase.Resolve;

  const onBuy = () => {
    if (typeof ui.purchasePromptTileId === 'number' && canInteractPurchase) {
      dispatch({ type: 'CONFIRM_PURCHASE', tileId: ui.purchasePromptTileId });
    }
  };
  const onDecline = () => {
    if (typeof ui.purchasePromptTileId === 'number' && canInteractPurchase) {
      dispatch({ type: 'DECLINE_PURCHASE', tileId: ui.purchasePromptTileId });
    }
  };

  // Jail controls
  const onJailPay = () => dispatch({ type: 'JAIL_PAY_FINE' });
  const onJailUse = () => dispatch({ type: 'JAIL_USE_CARD' });
  const onJailRoll = () => dispatch({ type: 'JAIL_ROLL' });
  const onJailEndAttempt = () => dispatch({ type: 'JAIL_END_ATTEMPT' });

  return (
    <div className="panel">
      <h3 className="section-title">Controls</h3>

      {(phase === TurnPhase.InJailStart || phase === TurnPhase.InJailRolled) ? (
        <div className="controls-grid">
          {phase === TurnPhase.InJailStart && (
            <>
              <button type="button" onClick={startDemo}>Start Demo Game</button>
              <button type="button" onClick={onJailPay}>Pay $50</button>
              <button type="button" onClick={onJailUse} disabled={(jailInfo?.cards ?? 0) <= 0}>Use Card</button>
              <button type="button" onClick={onJailRoll}>Roll for Doubles</button>
              <div style={{ gridColumn: '1 / -1', fontSize: 12, color: '#555' }}>
                In Jail: attempt {jailInfo?.turns ?? 0}/3{(jailInfo?.cards ?? 0) > 0 ? ` • Cards: ${jailInfo?.cards}` : ''}
              </div>
            </>
          )}
          {phase === TurnPhase.InJailRolled && (
            <>
              <button type="button" onClick={startDemo}>Start Demo Game</button>
              <button type="button" onClick={onJailEndAttempt}>End Attempt</button>
              <div style={{ gridColumn: '1 / -1', fontSize: 12, color: '#555' }}>
                No doubles. End Attempt to increment jail turn. After 3rd fail, fine is paid and you will move.
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="controls-grid">
          <button type="button" onClick={startDemo}>Start Demo Game</button>
          <button type="button" onClick={onRoll} disabled={!canRoll}>Roll</button>
          <button type="button" onClick={onMove} disabled={!canMove}>Move</button>
          <button type="button" onClick={onEnd} disabled={!canEnd}>End Turn</button>
          <button type="button" disabled>Buy</button>
          <button type="button" disabled>Auction</button>
        </div>
      )}

      <Modal
        open={typeof ui.purchasePromptTileId === 'number'}
        title="Purchase Property"
        onConfirm={onBuy}
        onCancel={onDecline}
      >
        {tile ? (
          <div>
            <div><strong>{tile.name}</strong></div>
            <div>Price: ${tile.price ?? 'N/A'}</div>
            <div>Player: {currentPlayer?.name}</div>
          </div>
        ) : (
          <div>Loading...</div>
        )}
        <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
          Choose Buy to purchase or Decline to skip. Auctions are not implemented yet.
        </div>
      </Modal>
    </div>
  );
};

export default Controls;