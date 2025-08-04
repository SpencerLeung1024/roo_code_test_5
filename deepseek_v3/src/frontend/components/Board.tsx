import React from 'react';
import { Property } from '@backend/types';

interface BoardProps {
  properties: Property[];
  currentPlayerPosition: number;
}

const Board: React.FC<BoardProps> = ({ properties, currentPlayerPosition }) => {
  return (
    <div className="board">
      {properties.map(property => (
        <div 
          key={property.id}
          className={`property ${property.colorGroup}`}
          data-position={property.position}
        >
          <div className="property-name">{property.name}</div>
          {property.owner && (
            <div className="property-owner">{property.owner}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Board;