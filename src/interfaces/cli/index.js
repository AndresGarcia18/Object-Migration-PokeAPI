import 'dotenv/config';
import connectMongo from '../../infrastructure/db/mongo.js';
import fetchAndSaveMoves from '../../infrastructure/pokeapi/fetchAndSaveMoves.js';
import fetchAndSaveLocations from '../../infrastructure/pokeapi/fetchAndSaveLocations.js';
import fetchAndSavePokemons from '../../infrastructure/pokeapi/fetchAndSavePokemons.js';
import migrate from '../../application/migrateObject.js';
import { logEvent } from '../../infrastructure/db/progressHelper.js';

await connectMongo();

async function main() {
  let currentStep = null;
  try {
    console.log('1. Generating moves...');
    currentStep = 'moves';
    await fetchAndSaveMoves();

    console.log('2. Generating pokemon_locations...');
    currentStep = 'locations';
    await fetchAndSaveLocations();

    console.log('3. Generating pokemons...');
    currentStep = 'pokemons';
    await fetchAndSavePokemons();

    console.log('4. Starting Migration...');
    currentStep = 'migration';
    await migrate();

    console.log('Migration completed.');
  } catch (error) {
    if (currentStep) {
      await logEvent(currentStep, 'error', null, error.message);
    }
    console.error('Error during the process:', error.message);
    process.exit(1);
  }
}

main();