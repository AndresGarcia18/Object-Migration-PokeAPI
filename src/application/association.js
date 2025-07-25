import 'dotenv/config';
import HubspotApi from '../infrastructure/hubspot/HubspotApi.js';
import { logEvent } from '../infrastructure/db/progressHelper.js';

const hubspot = new HubspotApi();
const BATCH_SIZE = 100;

async function associate(pokemons, contactIdMap, locationIdMap, moveIdMap) {
  const contactCompanyAssociations = [];
  const contactMoveAssociations = [];

  for (const pokemon of pokemons) {
    const contactId = contactIdMap[pokemon.id];
    if (!contactId) continue;

    if (Array.isArray(pokemon.locations)) {
      for (const locationId of pokemon.locations) {
        const locationHubspotId = locationIdMap[locationId];
        if (locationHubspotId) {
          const exists = await companyExists(locationHubspotId);
          if (exists) {
            contactCompanyAssociations.push({
              contactId,
              companyId: locationHubspotId
            });
          }
        }
      }
    }

    if (Array.isArray(pokemon.moves)) {
      for (const moveId of pokemon.moves) {
        const moveHubspotId = moveIdMap[moveId];
        if (moveHubspotId) {
          contactMoveAssociations.push({
            contactId,
            moveId: moveHubspotId
          });
        }
      }
    }
  }

  const validContactCompanyAssociations = contactCompanyAssociations.filter(pair =>
    pair.contactId && typeof pair.contactId === 'string' && pair.contactId.trim() !== '' &&
    pair.companyId && typeof pair.companyId === 'string' && pair.companyId.trim() !== ''
  );
  const validContactMoveAssociations = contactMoveAssociations.filter(pair =>
    pair.contactId && typeof pair.contactId === 'string' && pair.contactId.trim() !== '' &&
    pair.moveId && typeof pair.moveId === 'string' && pair.moveId.trim() !== ''
  );

  await processInBatches(validContactCompanyAssociations, BATCH_SIZE, async batch => {
    try {
      await hubspot.associateContactsWithCompaniesBatch(batch, 279);
      console.log(`Associated ${batch.length} contacts with companies`);
    } catch (e) {
      console.error('Error associating contacts with companies:', e.response?.data || e.message);
      await logEvent('associate_companies', e.message, 'Error associating contacts with companies');
    }
  });

  await processInBatches(validContactMoveAssociations, BATCH_SIZE, async batch => {
    try {
      await hubspot.associateContactsWithMovesBatch(batch, 17);
      console.log(`Associated ${batch.length} contacts with moves`);
    } catch (e) {
      console.error('Error associating contacts with moves:', e.response?.data || e.message);
      await logEvent('associate_moves', e.message, 'Error associating contacts with moves');
    }
  });
}

async function companyExists(companyId) {
  try {
    await hubspot.axios.get(`/crm/v3/objects/companies/${companyId}`);
    return true;
  } catch {
    return false;
  }
}

async function processInBatches(items, batchSize, fn) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await fn(batch);
  }
}

export default associate;
