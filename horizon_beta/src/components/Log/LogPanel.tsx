import type { GameState } from '../../types';
import css from './LogPanel.module.css';

type Props = {
  state: GameState;
};

export default function LogPanel({ state }: Props) {
  const items = state.log.slice().reverse();
  return (
    <div className={css.wrap}>
      {items.map((l) => (
        <div className={css.item} key={l.id}>
          <span className={css.ts}>{new Date(l.ts).toLocaleTimeString()}</span>
          <span>{l.text}</span>
        </div>
      ))}
    </div>
  );
}