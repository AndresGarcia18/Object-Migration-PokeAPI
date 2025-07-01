const axios = require('axios');
const HubspotRepository = require('../../domain/repositories/HubspotRepository');

const HUBSPOT_PRIVATE_APP_TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
const BASE_URL = 'https://api.hubapi.com';

const MOVES_OBJECT_TYPE_ID = process.env.HUBSPOT_MOVES_OBJECT_TYPE_ID || '2-46531333';

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

  async createContact(pokemon) {
    const data = {
      properties: {
        firstname: pokemon.firstname,
        pokedex_id: pokemon.pokedex_id,
        hp: pokemon.hp,
        attack: pokemon.attack,
        defense: pokemon.defense,
        special_attack: pokemon.special_attack || pokemon['special-attack'],
        special_defense: pokemon.special_defense || pokemon['special-defense'],
        speed: pokemon.speed,
        types: pokemon.types
      }
    };
    return this.axios.post('/crm/v3/objects/contacts', data);
  }

  async createCompany(location) {
    const data = {
      properties: {
        name: location.name,
        location_id: location.id,
        region: location.region,
        generation: location.generation,
        number_of_areas: location.number_of_areas
      }
    };
    return this.axios.post('/crm/v3/objects/companies', data);
  }

  async createMove(move) {
    const data = {
      properties: {
        id: move.id,
        name: move.name,
        pp: move.pp,
        power: move.power
      }
    };
    return this.axios.post(`/crm/v3/objects/${MOVES_OBJECT_TYPE_ID}`, data);
  }

  async associateContactWithCompany(contactId, companyId, associationTypeId = '1') {
    if (!contactId || !companyId) {
      console.warn(`associateContactWithCompany: contactId (${contactId}) o companyId (${companyId}) no válido.`);
      return;
    }
    const url = `/crm/v3/objects/contacts/${contactId}/associations/companies/${companyId}/${associationTypeId}`;
    try {
      return await this.axios.put(url, {});
    } catch (e) {
      const hubspotError = e.response ? JSON.stringify(e.response.data) : e.message;
      console.error(`associateContactWithCompany error:`, hubspotError);
      throw e;
    }
  }

  async associateContactWithMove(contactId, moveId, associationTypeId) {
    if (!associationTypeId) {
      throw new Error('associationTypeId para Contact-Move no puede estar vacío. Consulta /crm/v3/associations/contacts/2-46531333/labels para obtener el ID correcto.');
    }
    const url = `/crm/v3/associations/contact/${contactId}/2-46531333/${moveId}/${associationTypeId}`;
    console.log(`[DEBUG] Asociando contacto (contactId: ${contactId}) con move (moveId: ${moveId}) usando URL: ${url} y associationTypeId: ${associationTypeId}`);
    try {
      return await this.axios.post(url, {});
    } catch (e) {
      const hubspotError = e.response ? JSON.stringify(e.response.data) : e.message;
      console.error(`associateContactWithMove error:`, hubspotError);
      throw e;
    }
  }
}

module.exports = HubspotApi;
