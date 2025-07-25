import mongoose from 'mongoose';

const PokemonSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  hp: Number,
  attack: Number,
  defense: Number,
  specialAttack: {
    type: Number,
    alias: 'special-attack',
  },
  specialDefense: {
    type: Number,
    alias: 'special-defense',
  },
  speed: Number,
  types: {
    type: [String],
    default: [],
  },
  moves: {
    type: [Number],
    default: [],
  },
  locations: {
    type: [Number],
    default: [],
  },
}, { collection: 'pokemons' });

const Pokemon = mongoose.models.Pokemon || mongoose.model('Pokemon', PokemonSchema);
export default Pokemon;
