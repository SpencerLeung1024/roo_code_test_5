import React from 'react';
import './CardSpace.css';

const CardSpace = ({ space, onClick }) => {
  const getIcon = () => {
    if (space.type === 'chance') {
      return '?';
    } else if (space.type === 'community') {
      return '♦';
    }
    return '';
  };

  const getClassName = () => {
    if (space.type === 'chance') {
      return 'card-space chance';
    } else if (space.type === 'community') {
      return 'card-space community';
    }
    return 'card-space';
  };

  return (
    <div className={getClassName()} onClick={() => onClick(space)}>
      <div className="card-icon">{getIcon()}</div>
      <div className="card-name">{space.name}</div>
    </div>
  );
};

export default CardSpace;