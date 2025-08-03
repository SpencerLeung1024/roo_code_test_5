// Monopoly board data - 40 spaces in order
export const BOARD_SPACES = [
  // Bottom row (right to left) - positions 0-9
  {
    id: 0,
    name: "GO",
    type: "corner",
    position: 0,
    corner: "bottom-left"
  },
  {
    id: 1,
    name: "Mediterranean Avenue",
    type: "property",
    position: 1,
    group: "brown",
    price: 60,
    rent: 2
  },
  {
    id: 2,
    name: "Community Chest",
    type: "community-chest",
    position: 2
  },
  {
    id: 3,
    name: "Baltic Avenue",
    type: "property",
    position: 3,
    group: "brown",
    price: 60,
    rent: 4
  },
  {
    id: 4,
    name: "Income Tax",
    type: "tax",
    position: 4,
    amount: 200
  },
  {
    id: 5,
    name: "Reading Railroad",
    type: "railroad",
    position: 5,
    price: 200
  },
  {
    id: 6,
    name: "Oriental Avenue",
    type: "property",
    position: 6,
    group: "light-blue",
    price: 100,
    rent: 6
  },
  {
    id: 7,
    name: "Chance",
    type: "chance",
    position: 7
  },
  {
    id: 8,
    name: "Vermont Avenue",
    type: "property",
    position: 8,
    group: "light-blue",
    price: 100,
    rent: 6
  },
  {
    id: 9,
    name: "Connecticut Avenue",
    type: "property",
    position: 9,
    group: "light-blue",
    price: 120,
    rent: 8
  },

  // Left side (bottom to top) - positions 10-19
  {
    id: 10,
    name: "Jail",
    type: "corner",
    position: 10,
    corner: "top-left"
  },
  {
    id: 11,
    name: "St. Charles Place",
    type: "property",
    position: 11,
    group: "pink",
    price: 140,
    rent: 10
  },
  {
    id: 12,
    name: "Electric Company",
    type: "utility",
    position: 12,
    price: 150
  },
  {
    id: 13,
    name: "States Avenue",
    type: "property",
    position: 13,
    group: "pink",
    price: 140,
    rent: 10
  },
  {
    id: 14,
    name: "Virginia Avenue",
    type: "property",
    position: 14,
    group: "pink",
    price: 160,
    rent: 12
  },
  {
    id: 15,
    name: "Pennsylvania Railroad",
    type: "railroad",
    position: 15,
    price: 200
  },
  {
    id: 16,
    name: "St. James Place",
    type: "property",
    position: 16,
    group: "orange",
    price: 180,
    rent: 14
  },
  {
    id: 17,
    name: "Community Chest",
    type: "community-chest",
    position: 17
  },
  {
    id: 18,
    name: "Tennessee Avenue",
    type: "property",
    position: 18,
    group: "orange",
    price: 180,
    rent: 14
  },
  {
    id: 19,
    name: "New York Avenue",
    type: "property",
    position: 19,
    group: "orange",
    price: 200,
    rent: 16
  },

  // Top row (left to right) - positions 20-29
  {
    id: 20,
    name: "Free Parking",
    type: "corner",
    position: 20,
    corner: "top-right"
  },
  {
    id: 21,
    name: "Kentucky Avenue",
    type: "property",
    position: 21,
    group: "red",
    price: 220,
    rent: 18
  },
  {
    id: 22,
    name: "Chance",
    type: "chance",
    position: 22
  },
  {
    id: 23,
    name: "Indiana Avenue",
    type: "property",
    position: 23,
    group: "red",
    price: 220,
    rent: 18
  },
  {
    id: 24,
    name: "Illinois Avenue",
    type: "property",
    position: 24,
    group: "red",
    price: 240,
    rent: 20
  },
  {
    id: 25,
    name: "B&O Railroad",
    type: "railroad",
    position: 25,
    price: 200
  },
  {
    id: 26,
    name: "Atlantic Avenue",
    type: "property",
    position: 26,
    group: "yellow",
    price: 260,
    rent: 22
  },
  {
    id: 27,
    name: "Ventnor Avenue",
    type: "property",
    position: 27,
    group: "yellow",
    price: 260,
    rent: 22
  },
  {
    id: 28,
    name: "Water Works",
    type: "utility",
    position: 28,
    price: 150
  },
  {
    id: 29,
    name: "Marvin Gardens",
    type: "property",
    position: 29,
    group: "yellow",
    price: 280,
    rent: 24
  },

  // Right side (top to bottom) - positions 30-39
  {
    id: 30,
    name: "Go To Jail",
    type: "corner",
    position: 30,
    corner: "bottom-right"
  },
  {
    id: 31,
    name: "Pacific Avenue",
    type: "property",
    position: 31,
    group: "green",
    price: 300,
    rent: 26
  },
  {
    id: 32,
    name: "North Carolina Avenue",
    type: "property",
    position: 32,
    group: "green",
    price: 300,
    rent: 26
  },
  {
    id: 33,
    name: "Community Chest",
    type: "community-chest",
    position: 33
  },
  {
    id: 34,
    name: "Pennsylvania Avenue",
    type: "property",
    position: 34,
    group: "green",
    price: 320,
    rent: 28
  },
  {
    id: 35,
    name: "Short Line Railroad",
    type: "railroad",
    position: 35,
    price: 200
  },
  {
    id: 36,
    name: "Chance",
    type: "chance",
    position: 36
  },
  {
    id: 37,
    name: "Park Place",
    type: "property",
    position: 37,
    group: "dark-blue",
    price: 350,
    rent: 35
  },
  {
    id: 38,
    name: "Luxury Tax",
    type: "tax",
    position: 38,
    amount: 100
  },
  {
    id: 39,
    name: "Boardwalk",
    type: "property",
    position: 39,
    group: "dark-blue",
    price: 400,
    rent: 50
  }
];

// Helper function to get space by position
export const getSpaceByPosition = (position) => {
  return BOARD_SPACES.find(space => space.position === position);
};

// Helper function to get spaces by type
export const getSpacesByType = (type) => {
  return BOARD_SPACES.filter(space => space.type === type);
};

// Helper function to get properties by color group
export const getPropertiesByGroup = (group) => {
  return BOARD_SPACES.filter(space => 
    space.type === 'property' && space.group === group
  );
};