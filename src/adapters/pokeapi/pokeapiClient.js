const axios = require('axios');

const BASE_URL = 'https://pokeapi.co/api/v2';

const pokeapiClient = {
  async getPokemons(limit = 100) {
    return axios.get(`${BASE_URL}/pokemon?limit=${limit}`);
  },
  async getMoves(limit = 100) {
    return axios.get(`${BASE_URL}/move?limit=${limit}`);
  },
  async getLocations(limit = 100) {
    return axios.get(`${BASE_URL}/location?limit=${limit}`);
  },
  async getPokemonListWithId(limit = 100) {
    const response = await axios.get(`${BASE_URL}/pokemon?limit=${limit}`);
    return response.data.results.map(pokemon => {
      const match = pokemon.url.match(/\/(\d+)\/?$/);
      const id = match ? parseInt(match[1], 10) : null;
      return { id, name: pokemon.name, url: pokemon.url };
    });
  },
  async getPokemonDetails(identifier) {
    const response = await axios.get(`${BASE_URL}/pokemon/${identifier}`);
    const data = response.data;
    const stats = {};
    data.stats.forEach(statObj => {
      const statName = statObj.stat.name;
      if ([
        'hp',
        'attack',
        'defense',
        'special-attack',
        'special-defense',
        'speed'
      ].includes(statName)) {
        stats[statName] = statObj.base_stat;
      }
    });
    const types = data.types.map(t => t.type.name);
    return {
      id: data.id,
      name: data.name,
      ...stats,
      types
    };
  }
};

module.exports = pokeapiClient; 