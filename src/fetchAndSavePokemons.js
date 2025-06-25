const fs = require('fs');
const path = require('path');
const pokeapiClient = require('./adapters/pokeapi/pokeapiClient');

async function fetchAndSavePokemons(limit = 100) {
  try {
    const pokemons = await pokeapiClient.getPokemonListWithId(limit);
    const detailedPokemons = [];
    for (const pokemon of pokemons) {
      const details = await pokeapiClient.getPokemonDetails(pokemon.id);
      detailedPokemons.push(details);
    }
    const filePath = path.resolve(__dirname, '../pokemons.json');
    fs.writeFileSync(filePath, JSON.stringify(detailedPokemons, null, 2), 'utf-8');
    console.log(`Archivo pokemons.json generado con ${detailedPokemons.length} pokémon.`);
  } catch (error) {
    console.error('Error al obtener o guardar los pokémon:', error.message);
  }
}

fetchAndSavePokemons(100); 