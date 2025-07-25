import 'dotenv/config';
import HubspotApi from '../infrastructure/hubspot/HubspotApi.js';
import Pokemon from '../infrastructure/db/models/pokemons.js';
import Location from '../infrastructure/db/models/locations.js';
import Move from '../infrastructure/db/models/moves.js';
import associate from './association.js';
import { logEvent } from '../infrastructure/db/progressHelper.js';

const hubspot = new HubspotApi();

async function migrate() {
  const moves = await Move.find();
  const movePayloads = moves.map(move => move.toObject());
  let moveIdMap = {};
  try {
    const res = await hubspot.createMovesBatch(movePayloads);
    if (res.data && Array.isArray(res.data.results)) {
      res.data.results.forEach((result, idx) => {
        moveIdMap[moves[idx].id] = result.id;
        console.log(`Move created: ${moves[idx].name}`);
      });
    }
  } catch (e) {
    console.error('Error batch creating moves:', e.response ? JSON.stringify(e.response.data) : e.message);
    await logEvent('migrate_moves', e.message, 'Error batch creating moves');
  }

  const locations = await Location.find();
  const locationPayloads = locations.map(location => location.toObject());
  let locationIdMap = {};
  try {
    const res = await hubspot.createCompaniesBatch(locationPayloads);
    if (res.data && Array.isArray(res.data.results)) {
      res.data.results.forEach((result, idx) => {
        locationIdMap[locations[idx].id] = result.id;
        console.log(`Company created: ${locations[idx].name}`);
      });
    }
  } catch (e) {
    console.error('Error batch creating companies:', e.response ? JSON.stringify(e.response.data) : e.message);
    await logEvent('migrate_companies', e.message, 'Error batch creating companies');
  }

  const pokemons = await Pokemon.find();
  const contactPayloads = pokemons.map(pokemon => ({
    firstname: pokemon.name,
    pokedex_id_: pokemon.id,
    hp: pokemon.hp,
    attack: pokemon.attack,
    defense: pokemon.defense,
    special_attack: pokemon.specialAttack || pokemon['special-attack'],
    special_defense: pokemon.specialDefense || pokemon['special-defense'],
    speed: pokemon.speed,
    types: Array.isArray(pokemon.types) ? pokemon.types.join(';') : ''
  }));
  let contactIdMap = {};
  try {
    const res = await hubspot.createContactsBatch(contactPayloads);
    if (res.data && Array.isArray(res.data.results)) {
      res.data.results.forEach((result, idx) => {
        contactIdMap[pokemons[idx].id] = result.id;
        console.log(`Contact created: ${pokemons[idx].name}`);
      });
    }
  } catch (e) {
    console.error('Error batch creating contacts:', e.response ? JSON.stringify(e.response.data) : e.message);
    await logEvent('migrate_contacts', e.message, 'Error batch creating contacts');
  }

  console.log('5. Creating Associations...');
  await associate(pokemons, contactIdMap, locationIdMap, moveIdMap);
}

export default migrate;