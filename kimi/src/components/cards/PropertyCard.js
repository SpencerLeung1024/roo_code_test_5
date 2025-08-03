import React from 'react';
import { getPropertyDetails } from '../../data/propertyData';
import './PropertyCard.css';

const PropertyCard = ({ space, onClose }) => {
  if (!space) return null;

  let propertyDetails = null;
  
  if (space.type === 'property') {
    propertyDetails = getPropertyDetails(space.propertyId);
  }

  const getPropertyType = () => {
    switch (space.type) {
      case 'property':
        return 'Property';
      case 'railroad':
        return 'Railroad';
      case 'utility':
        return 'Utility';
      default:
        return 'Space';
    }
  };

  const getColorStyle = () => {
    if (space.type === 'property' && propertyDetails) {
      return { backgroundColor: propertyDetails.color };
    }
    return { backgroundColor: '#ccc' };
  };

  return (
    <div className="property-card-overlay" onClick={onClose}>
      <div className="property-card" onClick={(e) => e.stopPropagation()}>
        <div className="property-card-header">
          <div className="property-color-bar" style={getColorStyle()}></div>
          <h2>{space.name}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="property-card-content">
          <div className="property-type">{getPropertyType()}</div>
          
          {space.type === 'property' && propertyDetails && (
            <>
              <div className="property-group">Group: {propertyDetails.group}</div>
              <div className="property-price">Price: ${propertyDetails.price}</div>
              
              <div className="rent-info">
                <h4>Rent:</h4>
                <ul>
                  <li>Base Rent: ${propertyDetails.rent}</li>
                  <li>With 1 House: ${propertyDetails.rent1House}</li>
                  <li>With 2 Houses: ${propertyDetails.rent2Houses}</li>
                  <li>With 3 Houses: ${propertyDetails.rent3Houses}</li>
                  <li>With 4 Houses: ${propertyDetails.rent4Houses}</li>
                  <li>With Hotel: ${propertyDetails.rentHotel}</li>
                </ul>
              </div>
              
              <div className="building-costs">
                <p>House Cost: ${propertyDetails.houseCost}</p>
                <p>Hotel Cost: ${propertyDetails.houseCost} + 4 houses</p>
              </div>
              
              <div className="mortgage-info">
                <p>Mortgage Value: ${propertyDetails.mortgage}</p>
              </div>
            </>
          )}
          
          {space.type === 'railroad' && (
            <>
              <div className="railroad-info">
                <p>Rent: $25</p>
                <p>If 2 railroads owned: $50</p>
                <p>If 3 railroads owned: $100</p>
                <p>If 4 railroads owned: $200</p>
                <p>Mortgage Value: $100</p>
              </div>
            </>
          )}
          
          {space.type === 'utility' && (
            <>
              <div className="utility-info">
                <p>If 1 utility owned: 4 × dice roll</p>
                <p>If 2 utilities owned: 10 × dice roll</p>
                <p>Mortgage Value: $75</p>
              </div>
            </>
          )}
          
          {space.type === 'tax' && (
            <>
              <div className="tax-info">
                <p>Pay: ${space.amount}</p>
              </div>
            </>
          )}
          
          {space.type === 'chance' && (
            <>
              <div className="card-info">
                <p>Draw a Chance card</p>
                <p>Follow the instructions on the card</p>
              </div>
            </>
          )}
          
          {space.type === 'community' && (
            <>
              <div className="card-info">
                <p>Draw a Community Chest card</p>
                <p>Follow the instructions on the card</p>
              </div>
            </>
          )}
          
          {space.type === 'corner' && (
            <>
              <div className="corner-info">
                <p>{space.description}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;