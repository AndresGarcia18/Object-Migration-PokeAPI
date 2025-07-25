import pokeapiClient from './pokeapiClient.js';
import Pokemon from '../db/models/pokemons.js';
import Location from '../db/models/locations.js';
import { logEvent } from '../db/progressHelper.js';

async function fetchAndSavePokemons() {
  const existingCount = await Pokemon.countDocuments();
  if (existingCount >= 100) {
    console.log('Pokemons already present in MongoDB, skipping fetch.');
    return;
  }
  const validLocationsArr = await Location.find({}, { id: 1 });
  const validLocations = new Set(validLocationsArr.map(loc => loc.id));

  const pokemons = await pokeapiClient.getPokemonListWithId(100);
  let count = 0;

  for (const pokemon of pokemons) {
    try {
      const details = await pokeapiClient.getPokemonDetails(pokemon.id);

      const moves_id = [];
      if (details.moves) {
        for (const move of details.moves) {
          const moveId = parseInt(move.move.url.split('/').slice(-2, -1)[0]);
          if (moveId <= 100) moves_id.push(moveId);
        }
      }

      const location_id = [];
      try {
        const encountersResponse = await pokeapiClient.getPokemonEncounters(pokemon.id);
        const encounters = encountersResponse.data;
        if (encounters) {
          for (const encounter of encounters) {
            if (encounter.location_area && encounter.location_area.url) {
              try {
                const locationAreaResponse = await pokeapiClient.getLocationAreaDetails(encounter.location_area.url);
                const locationAreaData = locationAreaResponse.data;
                if (!locationAreaData.location || !locationAreaData.location.url) continue;
                const locationUrl = locationAreaData.location.url;
                const locationId = parseInt(locationUrl.split('/').filter(Boolean).pop());
                if (validLocations.has(locationId)) location_id.push(locationId);
              } catch (err) {}
            }
          }
        }
      } catch (error) {}

      const pokemonDoc = new Pokemon({
        id: details.id,
        name: details.name,
        hp: details.stats ? details.stats.find(stat => stat.stat.name === 'hp')?.base_stat || 0 : 0,
        attack: details.stats ? details.stats.find(stat => stat.stat.name === 'attack')?.base_stat || 0 : 0,
        defense: details.stats ? details.stats.find(stat => stat.stat.name === 'defense')?.base_stat || 0 : 0,
        specialAttack: details.stats ? details.stats.find(stat => stat.stat.name === 'special-attack')?.base_stat || 0 : 0,
        specialDefense: details.stats ? details.stats.find(stat => stat.stat.name === 'special-defense')?.base_stat || 0 : 0,
        speed: details.stats ? details.stats.find(stat => stat.stat.name === 'speed')?.base_stat || 0 : 0,
        types: details.types ? details.types.map(type => type.type.name) : [],
        moves: [...new Set(moves_id)],
        locations: [...new Set(location_id)]
      });

      await pokemonDoc.save();
      count++;
      console.log(`${details.name} ${details.id}`);
    } catch (error) {
      console.error(`Error fetching pokemon ${pokemon.id}:`, error.message);
      await logEvent('pokemons', error.message, `Error fetching pokemon ${pokemon.id}`);
    }
  }

  console.log(` -- Pokemons saved to MongoDB: ${count} -- `);
}

export default fetchAndSavePokemons;