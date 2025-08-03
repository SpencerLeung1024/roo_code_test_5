import React from 'react';
import { getPropertyDetails } from '../../data/propertyData';
import './PropertySpace.css';

const PropertySpace = ({ space, onClick }) => {
  const propertyDetails = getPropertyDetails(space.propertyId);
  
  if (!propertyDetails) {
    return <div className="property-space" onClick={() => onClick(space)}>{space.name}</div>;
  }

  return (
    <div className="property-space" onClick={() => onClick(space)}>
      <div className="property-color-bar" style={{ backgroundColor: propertyDetails.color }}></div>
      <div className="property-name">{space.name}</div>
      <div className="property-price">${propertyDetails.price}</div>
    </div>
  );
};

export default PropertySpace;