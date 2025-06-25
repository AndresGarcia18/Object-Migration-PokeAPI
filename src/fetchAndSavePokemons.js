const fs = require('fs');
const path = require('path');
const pokeapiClient = require('./adapters/pokeapi/pokeapiClient');

async function fetchAndSavePokemons(limit = 100) {
  try {
    const pokemons = await pokeapiClient.getPokemonListWithId(limit);
    const detailedPokemons = [];
    
    for (const pokemon of pokemons) {
      try {
        const details = await pokeapiClient.getPokemonDetails(pokemon.id);
        
        // Get moves that this Pokémon can learn
        const moves_id = [];
        if (details.moves && details.moves.length > 0) {
          for (const move of details.moves) {
            const moveId = parseInt(move.move.url.split('/').slice(-2, -1)[0]);
            if (moveId <= 100) { // Only include moves from our moves.json (first 100)
              moves_id.push(moveId);
            }
          }
        }
        
        // Get locations where this Pokémon can be found
        const location_id = [];
        try {
          const encounters = await pokeapiClient.getPokemonEncounters(pokemon.id);
          if (encounters && encounters.length > 0) {
            for (const encounter of encounters) {
              const locationId = parseInt(encounter.location_area.url.split('/').slice(-2, -1)[0]);
              if (locationId <= 101) { // Only include locations from our pokemon_locations.json
                location_id.push(locationId);
              }
            }
          }
        } catch (error) {
          console.log(`No encounters found for Pokémon ${pokemon.id}`);
        }
        
        // Create Pokémon object with associations
        const pokemonWithAssociations = {
          id: details.id,
          name: details.name,
          hp: details.stats ? details.stats.find(stat => stat.stat.name === 'hp')?.base_stat || 0 : 0,
          attack: details.stats ? details.stats.find(stat => stat.stat.name === 'attack')?.base_stat || 0 : 0,
          defense: details.stats ? details.stats.find(stat => stat.stat.name === 'defense')?.base_stat || 0 : 0,
          'special-attack': details.stats ? details.stats.find(stat => stat.stat.name === 'special-attack')?.base_stat || 0 : 0,
          'special-defense': details.stats ? details.stats.find(stat => stat.stat.name === 'special-defense')?.base_stat || 0 : 0,
          speed: details.stats ? details.stats.find(stat => stat.stat.name === 'speed')?.base_stat || 0 : 0,
          types: details.types ? details.types.map(type => type.type.name) : [],
          moves_id: [...new Set(moves_id)], // Remove duplicates
          location_id: [...new Set(location_id)] // Remove duplicates
        };
        
        detailedPokemons.push(pokemonWithAssociations);
        console.log(`Pokémon ${pokemon.id}: ${details.name} processed`);
      } catch (error) {
        console.error(`Error processing Pokémon ${pokemon.id}:`, error.message);
      }
    }
    
    const filePath = path.resolve(__dirname, '../pokemons.json');
    fs.writeFileSync(filePath, JSON.stringify(detailedPokemons, null, 2), 'utf-8');
    console.log(`Archivo pokemons.json generado con ${detailedPokemons.length} pokémon y sus asociaciones.`);
  } catch (error) {
    console.error('Error al obtener o guardar los pokémon:', error.message);
  }
}

fetchAndSavePokemons(100); 