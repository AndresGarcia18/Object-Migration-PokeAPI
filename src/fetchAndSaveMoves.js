const fs = require('fs');
const path = require('path');
const pokeapiClient = require('./adapters/pokeapi/pokeapiClient');

async function fetchAndSaveMoves(limit = 100) {
  try {
    const result = [];
    
    for (let moveId = 1; moveId <= limit; moveId++) {
      try {
        const moveResponse = await pokeapiClient.getMove(moveId);
        const moveData = moveResponse.data;
        
        const move = {
          id: moveData.id,
          name: moveData.name,
          pp: moveData.pp,
          power: moveData.power
        };
        
        result.push(move);
        console.log(`Move ${moveId}: ${moveData.name} processed`);
      } catch (error) {
        console.error(`Error fetching move ${moveId}:`, error.message);
      }
    }
    
    const outPath = path.resolve(__dirname, '../moves.json');
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`moves.json generated with ${result.length} unique moves.`);
  } catch (error) {
    console.error('Error fetching moves:', error.message);
  }
}

fetchAndSaveMoves(100); 