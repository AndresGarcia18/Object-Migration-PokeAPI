const axios = require('axios');

const BASE_URL = 'https://pokeapi.co/api/v2';

const pokeapiClient = {
  async getPokemons(limit = 100) {
    return axios.get(`${BASE_URL}/pokemon?limit=${limit}`);
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
    return response.data;
  },
  async getPokemonEncounters(id) {
    return axios.get(`${BASE_URL}/pokemon/${id}/encounters`);
  },
  async getLocationAreaDetails(url) {
    return axios.get(url);
  },
  async getLocation(id) {
    return axios.get(`${BASE_URL}/location/${id}`);
  },
  async getMove(id) {
    return axios.get(`${BASE_URL}/move/${id}`);
  }
};

module.exports = pokeapiClient; 