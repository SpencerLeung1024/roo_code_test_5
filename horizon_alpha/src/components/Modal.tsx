import React from 'react';

export interface ModalProps {
  open: boolean;
  title: string;
  children?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// Basic modal primitive for this subtask. Later we can add focus trap and keyboard handling.
const Modal: React.FC<ModalProps> = ({ open, title, children, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" className="modal" style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="panel" style={{ minWidth: 320 }}>
        <h3 className="section-title">{title}</h3>
        <div>{children}</div>
        {(onConfirm || onCancel) && (
          <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {onCancel && <button type="button" onClick={onCancel}>Decline</button>}
            {onConfirm && <button type="button" onClick={onConfirm}>Buy</button>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;