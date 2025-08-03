import React from 'react';
import './RailroadSpace.css';

const RailroadSpace = ({ space, onClick }) => {
  return (
    <div className="railroad-space" onClick={() => onClick(space)}>
      <div className="railroad-icon">🚂</div>
      <div className="railroad-name">{space.name}</div>
      <div className="railroad-price">${space.price}</div>
    </div>
  );
};

export default RailroadSpace;