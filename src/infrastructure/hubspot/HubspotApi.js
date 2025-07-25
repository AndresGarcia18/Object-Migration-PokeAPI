import axios from 'axios';
import HubspotRepository from '../../domain/repositories/HubspotRepository.js';
import { logEvent } from '../db/progressHelper.js';

const HUBSPOT_PRIVATE_APP_TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
const BASE_URL = 'https://api.hubapi.com';

const MOVES_OBJECT_TYPE_ID = process.env.HUBSPOT_MOVES_OBJECT_TYPE_ID || '2-46531333';

async function withRetries(fn, step, details) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const status = error.response?.status;
      if ((status === 429 || error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND' || error.code === 'ECONNRESET') && attempt < 3) {
        const wait = 3 * Math.pow(3, attempt - 1) * 1000;
        console.warn(`Rate limit or network error on ${step}, retrying (attempt ${attempt})`);
        await new Promise(res => setTimeout(res, wait));
        continue;
      }
      await logEvent(step, error.message, details);
      throw error;
    }
  }
  await logEvent(step, lastError?.message || 'Unknown error', details);
  throw lastError;
}

class HubspotApi extends HubspotRepository {
  constructor() {
    super();
    this.axios = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HUBSPOT_PRIVATE_APP_TOKEN}`
      }
    });
  }

  async createContactsBatch(pokemons) {
    const inputs = pokemons.map(pokemon => ({
      properties: {
        firstname: pokemon.firstname,
        pokedex_id_: pokemon.pokedex_id_,
        hp: pokemon.hp,
        attack: pokemon.attack,
        defense: pokemon.defense,
        special_attack: pokemon.special_attack || pokemon['special-attack'],
        special_defense: pokemon.special_defense || pokemon['special-defense'],
        speed: pokemon.speed,
        types: pokemon.types
      }
    }));
    return withRetries(
      () => this.axios.post('/crm/v3/objects/contacts/batch/create', { inputs }),
      'hubspotContacts',
      'Error in createContactsBatch'
    );
  }

  async createCompaniesBatch(locations) {
    const inputs = locations.map(location => ({
      properties: {
        name: location.name,
        location_id_: location.id,
        region: location.region,
        generation: location.generation,
        number_of_areas: location.number_of_areas
      }
    }));
    return withRetries(
      () => this.axios.post('/crm/v3/objects/companies/batch/create', { inputs }),
      'hubspot_companies',
      'Error in createCompaniesBatch'
    );
  }

  async createMovesBatch(moves) {
    const inputs = moves.map(move => ({
      properties: {
        id: move.id,
        name: move.name,
        pp: move.pp,
        power: move.power
      }
    }));
    return withRetries(
      () => this.axios.post(`/crm/v3/objects/${MOVES_OBJECT_TYPE_ID}/batch/create`, { inputs }),
      'hubspot_moves',
      'Error in createMovesBatch'
    );
  }

  async associateContactsWithCompaniesBatch(contactCompanyPairs, associationTypeId = '1') {
    if (!associationTypeId) {
      throw new Error('associationTypeId is required.');
    }

    const inputs = contactCompanyPairs
      .filter(pair =>
        pair.contactId && typeof pair.contactId === 'string' && pair.contactId.trim() !== '' &&
        pair.companyId && typeof pair.companyId === 'string' && pair.companyId.trim() !== ''
      )
      .map(pair => ({
        from: { id: pair.contactId },
        to: { id: pair.companyId },
        type: String(associationTypeId)
      }));

    if (inputs.length === 0) {
      return;
    }

    return withRetries(
      () => this.axios.post('/crm/v3/associations/contacts/companies/batch/create', { inputs }),
      'hubspot_associate_companies',
      'Error in associateContactsWithCompaniesBatch'
    );
  }

  async associateContactsWithMovesBatch(contactMovePairs, associationTypeId) {
    if (!associationTypeId) {
      throw new Error('associationTypeId is required for contacts and moves.');
    }

    const inputs = contactMovePairs
      .filter(pair =>
        pair.contactId && typeof pair.contactId === 'string' && pair.contactId.trim() !== '' &&
        pair.moveId && typeof pair.moveId === 'string' && pair.moveId.trim() !== ''
      )
      .map(pair => ({
        from: { id: pair.contactId },
        to: { id: pair.moveId },
        type: String(associationTypeId)
      }));

    if (inputs.length === 0) {
      return;
    }

    return withRetries(
      () => this.axios.post(`/crm/v3/associations/contacts/${MOVES_OBJECT_TYPE_ID}/batch/create`, { inputs }),
      'hubspot_associate_moves',
      'Error in associateContactsWithMovesBatch'
    );
  }
}

export default HubspotApi;