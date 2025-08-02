import type { GameState } from '../../types';
import Modal from '../Modal/Modal';

type Props = {
  state: GameState;
  onClose: () => void;
};

export default function RentPaymentModal({ state, onClose }: Props) {
  if (state.turn.ui.prompt !== 'PAY_RENT') return null;

  const ctx = state.turn.ui.context as any | undefined;
  const amount: number | undefined = ctx?.amount;
  const toPlayerId: string | undefined = ctx?.toPlayerId;
  const toPlayer = state.players.find(p => p.id === toPlayerId);

  return (
    <Modal open={true} title="Rent Payment" onClose={onClose}>
      <div>
        {typeof amount === 'number' && toPlayer ? (
          <div>You paid ${amount} to {toPlayer.name}.</div>
        ) : (
          <div>Rent resolved.</div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
        <button onClick={onClose}>OK</button>
      </div>
    </Modal>
  );
}