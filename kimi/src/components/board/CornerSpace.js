import React from 'react';
import './CornerSpace.css';

const CornerSpace = ({ space, onClick }) => {
  const getRotation = () => {
    switch (space.position) {
      case 0: return 0;      // GO
      case 10: return 90;    // Jail
      case 20: return 180;   // Free Parking
      case 30: return 270;   // Go To Jail
      default: return 0;
    }
  };

  return (
    <div className="corner-space" onClick={() => onClick(space)}>
      <div className="corner-content" style={{ transform: `rotate(${getRotation()}deg)` }}>
        <div className="corner-name">{space.name}</div>
        {space.position === 0 && <div className="corner-arrow">➡</div>}
        {space.position === 10 && <div className="corner-icon">🚓</div>}
        {space.position === 20 && <div className="corner-icon">🚗</div>}
        {space.position === 30 && <div className="corner-icon">👮</div>}
      </div>
    </div>
  );
};

export default CornerSpace;