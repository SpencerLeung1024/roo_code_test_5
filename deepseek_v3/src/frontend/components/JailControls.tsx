import React from 'react';
import { Player } from '../../types';

interface JailControlsProps {
  player: Player;
  onJailAction: (action: 'pay_bail' | 'use_card' | 'roll_doubles') => void;
}

const JailControls: React.FC<JailControlsProps> = ({ player, onJailAction }) => {
  return (
    <div className="jail-controls">
      <h3>You're in Jail (Turn {player.jailTurns + 1}/3)</h3>
      <div className="jail-actions">
        <button onClick={() => onJailAction('pay_bail')}>
          Pay $50 Bail
        </button>
        {player.hasGetOutOfJailFree && (
          <button onClick={() => onJailAction('use_card')}>
            Use Get Out of Jail Free Card
          </button>
        )}
        <button onClick={() => onJailAction('roll_doubles')}>
          Try Rolling Doubles
        </button>
      </div>
    </div>
  );
};

export default JailControls;