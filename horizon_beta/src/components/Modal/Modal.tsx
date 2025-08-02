import React from 'react';
import css from './Modal.module.css';

type Props = {
  open: boolean;
  title?: string;
  onClose?: () => void;
  children: React.ReactNode;
};

export default function Modal({ open, title, onClose, children }: Props) {
  if (!open) return null;
  return (
    <div className={css.overlay} onClick={onClose}>
      <div className={css.modal} onClick={(e) => e.stopPropagation()}>
        {title && <div className={css.title}>{title}</div>}
        <div>{children}</div>
        {onClose && (
          <div className={css.actions}>
            <button className={css.btn} onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}