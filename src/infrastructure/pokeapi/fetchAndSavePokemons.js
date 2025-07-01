const fs = require('fs');
const path = require('path');
const pokeapiClient = require('./pokeapiClient');

const locationsPath = path.resolve(__dirname, '../../../data/pokemon_locations.json');
const validLocations = new Set(JSON.parse(fs.readFileSync(locationsPath, 'utf-8')).map(loc => loc.id));

async function fetchAndSavePokemons() {
  try {
    const pokemons = await pokeapiClient.getPokemonListWithId(100);
    const detailedPokemons = [];
    
    for (const pokemon of pokemons) {
      try {
        const details = await pokeapiClient.getPokemonDetails(pokemon.id);
        
        const moves_id = [];
        if (details.moves && details.moves.length > 0) {
          for (const move of details.moves) {
            const moveId = parseInt(move.move.url.split('/').slice(-2, -1)[0]);
            if (moveId <= 100) {
              moves_id.push(moveId);
            }
          }
        }
        
        const location_id = [];
        try {
          const encountersResponse = await pokeapiClient.getPokemonEncounters(pokemon.id);
          const encounters = encountersResponse.data;
          if (encounters && encounters.length > 0) {
            for (const encounter of encounters) {
              if (encounter.location_area && encounter.location_area.url) {
                try {
                  const locationAreaResponse = await pokeapiClient.getLocationAreaDetails(encounter.location_area.url);
                  const locationAreaData = locationAreaResponse.data;
                  if (!locationAreaData.location || !locationAreaData.location.url) {
                    continue;
                  }
                  const locationUrl = locationAreaData.location.url;
                  const locationId = parseInt(locationUrl.split('/').filter(Boolean).pop());
                  if (validLocations.has(locationId)) {
                    location_id.push(locationId);
                  }
                } catch (err) {
                  console.log(`Error fetching location area for ${pokemon.name}:`, err.message);
                }
              }
            }
          }
        } catch (error) {
          console.log(`No encounters found for Pokémon ${pokemon.id}`);
        }
        
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
          moves: [...new Set(moves_id)],
          locations: [...new Set(location_id)]
        };
        
        detailedPokemons.push(pokemonWithAssociations);
        console.log(`Processing: ${pokemonWithAssociations.name} (ID: ${pokemonWithAssociations.id})`);
      } catch (error) {
        console.error(`Error processing Pokémon ${pokemon.id}:`, error.message);
      }
    }
    
    const filePath = path.resolve(__dirname, '../../../data/pokemons.json');
    fs.writeFileSync(filePath, JSON.stringify(detailedPokemons, null, 2), 'utf-8');
    console.log(`File pokemons.json generated with ${detailedPokemons.length} pokémon.`);
  } catch (error) {
    console.error('Error fetching and saving pokemons:', error.message);
  }
}

module.exports = fetchAndSavePokemons; 