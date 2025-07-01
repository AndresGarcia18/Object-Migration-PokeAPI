require('dotenv').config();

async function main() {
  try {
    // console.log('1. Generando moves.json...');
    // const fetchAndSaveMoves = require('../../infrastructure/pokeapi/fetchAndSaveMoves');
    // await fetchAndSaveMoves();
    // console.log('Moves list generated.');

    // console.log('2. Generando pokemon_locations.json...');
    // const fetchAndSaveLocations = require('../../infrastructure/pokeapi/fetchAndSaveLocations');
    // await fetchAndSaveLocations();
    // console.log('Locations list generated.');

    // console.log('3. Generando pokemons.json...');
    // const fetchAndSavePokemons = require('../../infrastructure/pokeapi/fetchAndSavePokemons');
    // await fetchAndSavePokemons();
    // console.log('Pokemons list generated.');

    console.log('4. Iniciando migración a HubSpot...');
    const migrate = require('../../application/migrateObject');
    await migrate();
    console.log('Migration completed.');
  } catch (error) {
    console.error('Error during the process:', error.message);
    process.exit(1);
  }
}

main();
