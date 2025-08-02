import type { GameState, Tile } from '../../types';
import Modal from '../Modal/Modal';

type Props = {
  state: GameState;
  onBuy: () => void;
  onClose: () => void;
};

export default function BuyPropertyModal({ state, onBuy, onClose }: Props) {
  if (state.turn.ui.prompt !== 'BUY_PROPERTY') return null;

  const ctx = state.turn.ui.context as any | undefined;
  const tileIndex: number | undefined = ctx?.tileIndex ?? state.players[state.currentPlayerIndex]?.position;
  const tile: Tile | undefined = tileIndex != null ? state.tiles[tileIndex] : undefined;

  return (
    <Modal open={true} title="Buy Property?" onClose={onClose}>
      <div>
        {tile ? (
          <>
            <div><strong>{tile.name}</strong></div>
            {'price' in tile && <div>Price: ${(tile as any).price}</div>}
          </>
        ) : (
          <div>Unknown tile</div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
        <button onClick={onClose}>Decline</button>
        <button onClick={onBuy}>Buy</button>
      </div>
    </Modal>
  );
}