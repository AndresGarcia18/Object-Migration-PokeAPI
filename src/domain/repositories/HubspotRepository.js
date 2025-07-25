import Pokemon from '../../infrastructure/db/models/pokemons.js';
import Location from '../../infrastructure/db/models/locations.js';
import Move from '../../infrastructure/db/models/moves.js';

class HubspotRepository {
  async createPokemon(pokemon) {
    const pokemonDoc = new Pokemon(pokemon);
    return await pokemonDoc.save();
  }
  async createLocation(location) {
    const locationDoc = new Location(location);
    return await locationDoc.save();
  }
  async createMove(move) {
    const moveDoc = new Move(move);
    return await moveDoc.save();
  }
}

export default HubspotRepository;