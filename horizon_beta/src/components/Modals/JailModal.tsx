import type { GameState } from '../../types';
import Modal from '../Modal/Modal';

type Props = {
  state: GameState;
  onPay: () => void;
  onRoll: () => void;
  onUseCard?: () => void; // placeholder if engine supports later
  onClose: () => void;
};

export default function JailModal({ state, onPay, onRoll, onUseCard, onClose }: Props) {
  const p = state.players[state.currentPlayerIndex];
  if (!p.inJail) return null;

  return (
    <Modal open={true} title="In Jail" onClose={onClose}>
      <div>
        <div>You are in Jail. Turns spent: {p.jailTurns}</div>
        <div>Options: Pay fine, try to roll doubles{p.getOutOfJailFree > 0 ? ', or use a Get Out of Jail Free card' : ''}.</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
        <button onClick={onPay}>Pay Fine</button>
        <button onClick={onRoll}>Try Roll Doubles</button>
        {p.getOutOfJailFree > 0 && onUseCard && <button onClick={onUseCard}>Use Card</button>}
      </div>
    </Modal>
  );
}