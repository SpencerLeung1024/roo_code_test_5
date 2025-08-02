import type { GameState } from '../../types';
import Modal from '../Modal/Modal';

type Props = {
  state: GameState;
  onClose: () => void;
};

export default function CardModal({ state, onClose }: Props) {
  if (state.turn.ui.prompt !== 'DRAW_CARD') return null;

  const ctx = state.turn.ui.context as any | undefined;
  const title: string | undefined = ctx?.title ?? 'Card Drawn';
  const text: string | undefined = ctx?.text ?? 'Effect applied.';

  return (
    <Modal open={true} title={title} onClose={onClose}>
      <div>{text}</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
        <button onClick={onClose}>OK</button>
      </div>
    </Modal>
  );
}