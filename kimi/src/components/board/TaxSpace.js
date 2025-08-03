import React from 'react';
import './TaxSpace.css';

const TaxSpace = ({ space, onClick }) => {
  return (
    <div className="tax-space" onClick={() => onClick(space)}>
      <div className="tax-icon">💰</div>
      <div className="tax-name">{space.name}</div>
      <div className="tax-amount">${space.amount}</div>
    </div>
  );
};

export default TaxSpace;