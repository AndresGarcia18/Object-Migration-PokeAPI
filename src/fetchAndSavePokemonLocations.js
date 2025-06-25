const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BASE_URL = 'https://pokeapi.co/api/v2';

async function fetchPokemonLocations(minLocations = 100) {
  const outPath = path.resolve(__dirname, '../pokemon_locations.json');
  const result = [];
  let locationId = 1;

  while (result.length < minLocations) {
    try {
      // 1. Consultar la location
      const locationResponse = await axios.get(`${BASE_URL}/location/${locationId}`);
      const locationData = locationResponse.data;
      const locationName = locationData.name;
      const areas = locationData.areas;
      let foundPokemon = null;

      // 2. Buscar en sus áreas los pokémon disponibles
      for (const area of areas) {
        try {
          const areaResponse = await axios.get(area.url);
          const areaData = areaResponse.data;
          const pokemonEncounters = areaData.pokemon_encounters;
          if (pokemonEncounters && pokemonEncounters.length > 0) {
            // 3. Asociar la location con el primer pokémon encontrado
            foundPokemon = {
              location_area: locationName,
              pokemon_id: pokemonEncounters[0].pokemon.url.split('/').filter(Boolean).pop(),
              pokemon_name: pokemonEncounters[0].pokemon.name
            };
            break;
          }
        } catch (e) {
          // ignorar errores de area
        }
      }

      // 4. Si encontró un pokémon, agregarlo al resultado
      if (foundPokemon) {
        result.push(foundPokemon);
      }
      // 5. Si no, simplemente no se agrega y se pasa a la siguiente location
    } catch (e) {
      // ignorar errores de location inexistente
    }
    locationId++;
  }

  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`Archivo pokemon_locations.json generado con ${result.length} locations únicas, cada una asociada a un pokémon correspondiente.`);
}

fetchPokemonLocations(100); 
fetchPokemonLocations(100); 