require('dotenv').config();
const fs = require('fs');
const path = require('path');
const HubspotApi = require('../infrastructure/hubspot/HubspotApi');
const { CONTACT_TO_MOVE_ASSOCIATION_TYPE_ID } = require('../infrastructure/hubspot/HubspotApi');

const dataDir = path.resolve(__dirname, '../../data');
const pokemons = JSON.parse(fs.readFileSync(path.join(dataDir, 'pokemons.json'), 'utf-8'));
const locations = JSON.parse(fs.readFileSync(path.join(dataDir, 'pokemon_locations.json'), 'utf-8'));
const moves = JSON.parse(fs.readFileSync(path.join(dataDir, 'moves.json'), 'utf-8'));

const hubspot = new HubspotApi();

async function migrate() {
  const moveIdMap = {};
  for (const move of moves) {
    try {
      const res = await hubspot.createMove(move);
      const hubspotId = res.data.id;
      moveIdMap[move.id] = hubspotId;
      console.log(`Move created: ${move.name}`);
    } catch (e) {
      const hubspotError = e.response ? JSON.stringify(e.response.data) : e.message;
      console.error(`Error creating move ${move.name}:`, hubspotError);
    }
  }

  const locationIdMap = {};
  for (const location of locations) {
    try {
      const res = await hubspot.createCompany(location);
      const hubspotId = res.data.id;
      locationIdMap[location.id] = hubspotId;
      console.log(`Company created: ${location.name}`);
    } catch (e) {
      const hubspotError = e.response ? JSON.stringify(e.response.data) : e.message;
      console.error(`Error creating company ${location.name}:`, hubspotError);
    }
  }
  console.log('locationIdMap:', locationIdMap);
  console.log('Todos los IDs de compañías migradas:', Object.values(locationIdMap));
  for (const pokemon of pokemons) {
    try {
      const contactPayload = {
        firstname: pokemon.name,
        pokedex_id: pokemon.id,
        hp: pokemon.hp,
        attack: pokemon.attack,
        defense: pokemon.defense,
        special_attack: pokemon['special-attack'],
        special_defense: pokemon['special-defense'],
        speed: pokemon.speed,
        types: Array.isArray(pokemon.types) ? pokemon.types.join(';') : ''
      };
      const res = await hubspot.createContact(contactPayload);
      const contactId = res.data.id;
      console.log(`Contact created: ${pokemon.name}`);

      if (Array.isArray(pokemon.locations)) {
        for (const pokeapiLocationId of pokemon.locations) {
          const locationHubspotId = locationIdMap[pokeapiLocationId];
          if (locationHubspotId) {
            if (await companyExists(locationHubspotId)) {
              try {
                await hubspot.associateContactWithCompany(contactId, locationHubspotId);
              } catch (e) {
                const hubspotError = e.response ? JSON.stringify(e.response.data) : e.message;
                console.error(`  Error associating company (PokeAPI ID: ${pokeapiLocationId}):`, hubspotError);
              }
            }
          }
        }
      }
    } catch (e) {
      const hubspotError = e.response ? JSON.stringify(e.response.data) : e.message;
      console.error(`Error migrating contact ${pokemon.name}:`, hubspotError);
    }
  }
}

async function companyExists(companyId) {
  try {
    await hubspot.axios.get(`/crm/v3/objects/companies/${companyId}`);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = migrate;