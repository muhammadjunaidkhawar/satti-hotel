const { TABLE_STATUS } = require('../../models/Table.model');

/**
 * Generate dummy table data
 * @returns {Array} Array of table objects
 */
function generateTables() {
  const tables = [];
  
  // Generate tables across 2-3 floors
  const numFloors = Math.floor(Math.random() * 2) + 2; // 2 or 3 floors
  const tablesPerFloor = [8, 10, 12]; // Different number of tables per floor
  
  let tableNumber = 1;

  for (let floor = 1; floor <= numFloors; floor++) {
    const numTables = tablesPerFloor[floor - 1] || 10;
    
    for (let i = 0; i < numTables; i++) {
      // Capacity between 2 and 8 people
      const capacity = Math.floor(Math.random() * 7) + 2;
      
      // Most tables are available, some are not
      const status = Math.random() > 0.15 ? TABLE_STATUS.AVAILABLE : TABLE_STATUS.NOT_AVAILABLE;

      tables.push({
        number: tableNumber++,
        floor,
        capacity,
        status,
        isDeleted: false,
      });
    }
  }

  return tables;
}

module.exports = { generateTables };
