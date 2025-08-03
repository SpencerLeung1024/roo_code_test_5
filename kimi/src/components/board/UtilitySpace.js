import React from 'react';
import './UtilitySpace.css';

const UtilitySpace = ({ space, onClick }) => {
  return (
    <div className="utility-space" onClick={() => onClick(space)}>
      <div className="utility-icon">⚡</div>
      <div className="utility-name">{space.name}</div>
      <div className="utility-price">${space.price}</div>
    </div>
  );
};

export default UtilitySpace;