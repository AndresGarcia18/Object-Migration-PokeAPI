import axios from 'axios';
import { logEvent } from '../db/progressHelper.js';

const BASE_URL = 'https://pokeapi.co/api/v2';

async function withRetries(fn, step, details) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        const wait = 3 * Math.pow(3, attempt - 1) * 1000;
        console.warn(`Error on ${step}, retrying... (attempt ${attempt})`);
        await new Promise(res => setTimeout(res, wait));
        continue;
      }
      await logEvent(step, error.message, details);
      console.error(`${details} after 3 attempts. Continuing with the next item...`);
      return null;
    }
  }
  await logEvent(step, lastError?.message || 'Unknown error', details);
  console.error(`${details} after 3 attempts. Continuing with the next item...`);
  return null;
}

const pokeapiClient = {
  async getPokemonListWithId(limit = 100) {
    return withRetries(
      async () => {
        const response = await axios.get(`${BASE_URL}/pokemon?limit=${limit}`);
        return response.data.results.map(pokemon => {
          const match = pokemon.url.match(/\/(\d+)\/?$/);
          const id = match ? parseInt(match[1], 10) : null;
          return { id, name: pokemon.name, url: pokemon.url };
        });
      },
      'pokeapiList',
      `Error fetching pokemon list with limit ${limit}`
    );
  },
  async getPokemonDetails(identifier) {
    return withRetries(
      async () => {
        const response = await axios.get(`${BASE_URL}/pokemon/${identifier}`);
        return response.data;
      },
      'pokeapiDetails',
      `Error fetching pokemon details for ${identifier}`
    );
  },
  async getPokemonEncounters(id) {
    return withRetries(
      async () => axios.get(`${BASE_URL}/pokemon/${id}/encounters`),
      'pokeapiEncounters',
      `Error fetching pokemon encounters for ${id}`
    );
  },
  async getLocationAreaDetails(url) {
    return withRetries(
      async () => axios.get(url),
      'pokeapiLocationArea',
      `Error fetching location area details for ${url}`
    );
  },
  async getLocation(id) {
    return withRetries(
      async () => axios.get(`${BASE_URL}/location/${id}`),
      'pokeapiLocation',
      `Error fetching location ${id}`
    );
  },
  async getMove(id) {
    return withRetries(
      async () => axios.get(`${BASE_URL}/move/${id}`),
      'pokeapiMove',
      `Error fetching move ${id}`
    );
  }
};

export default pokeapiClient;