import pokeapiClient from './pokeapiClient.js';
import Move from '../db/models/moves.js';
import { logEvent } from '../db/progressHelper.js';

async function fetchAndSaveMoves() {
  const existingCount = await Move.countDocuments();
  if (existingCount >= 100) {
    console.log('Moves already present in MongoDB, skipping fetch.');
    return;
  }
  let count = 0;
  for (let moveId = 1; moveId <= 100; moveId++) {
    try {
      const moveResponse = await pokeapiClient.getMove(moveId);
      const moveData = moveResponse.data;
      const moveDoc = new Move({
        id: moveData.id,
        name: moveData.name,
        pp: moveData.pp,
        power: moveData.power
      });
      await moveDoc.save();
      count++;
    } catch (error) {
      console.error(`Error fetching move ${moveId}:`, error.message);
      await logEvent('moves', error.message, `Error fetching move ${moveId}`);
    }
  }
  console.log(` -- Moves saved to MongoDB: ${count} -- `);
}

export default fetchAndSaveMoves;