const fs = require('fs');
const path = require('path');
const pokeapiClient = require('./adapters/pokeapi/pokeapiClient');

async function fetchAndSaveLocations(limit = 100) {
  const outPath = path.resolve(__dirname, '../pokemon_locations.json');
  const result = [];
  let locationId = 1;

  while (result.length < limit) {
    try {
      const locationResponse = await pokeapiClient.getLocation(locationId);
      const locationData = locationResponse.data;
      result.push({
        name: locationData.name,
        number_of_areas: Array.isArray(locationData.areas) ? locationData.areas.length : 0,
        id: locationData.id,
        region: locationData.region ? locationData.region.name : null,
        generation: locationData.game_indices && locationData.game_indices.length > 0 && locationData.game_indices[0].generation ? locationData.game_indices[0].generation.name : null
      });
    } catch (e) {
    }
    locationId++;
  }

  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`Pokemon_locations.json generated with ${result.length} unique locations.`);
}

fetchAndSaveLocations(100); 