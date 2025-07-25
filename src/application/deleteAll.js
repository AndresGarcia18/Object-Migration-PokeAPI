import dotenv from 'dotenv';
import Hubspot from '@hubspot/api-client';

dotenv.config();

const hubspotClient = new Hubspot.Client({
  accessToken: process.env.HUBSPOT_PRIVATE_APP_TOKEN,
});

async function batchDelete(objectType, ids) {
  if (ids.length === 0) return;

  const batchSize = 100;
  for (let i = 0; i < ids.length; i += batchSize) {
    const batchIds = ids.slice(i, i + batchSize);
    try {
      if (objectType === 'contacts') {
        await hubspotClient.crm.contacts.batchApi.archive({ inputs: batchIds.map(id => ({ id })) });
      } else if (objectType === 'companies') {
        await hubspotClient.crm.companies.batchApi.archive({ inputs: batchIds.map(id => ({ id })) });
      } else {
        await hubspotClient.crm.objects.batchApi.archive(objectType, { inputs: batchIds.map(id => ({ id })) });
      }
      console.log(`Batch deleted: ${batchIds.length} ${objectType}`);
    } catch (err) {
      console.error(`Error deleting ${objectType} by batch:`, err.message);
    }
  }
}

async function getAllIds(objectType) {
  let ids = [];
  let after = undefined;

  do {
    let page;
    if (objectType === 'contacts') {
      page = await hubspotClient.crm.contacts.basicApi.getPage(100, after);
    } else if (objectType === 'companies') {
      page = await hubspotClient.crm.companies.basicApi.getPage(100, after);
    } else {
      page = await hubspotClient.crm.objects.basicApi.getPage(objectType, 100, after);
    }

    ids.push(...page.results.map(obj => obj.id));
    after = page.paging?.next?.after;
  } while (after);

  return ids;
}

async function main() {
  try {
    console.log('Contacts');
    const contactIds = await getAllIds('contacts');
    await batchDelete('contacts', contactIds);

    console.log('Companies');
    const companyIds = await getAllIds('companies');
    await batchDelete('companies', companyIds);

    const customObjectType = '2-46531333';
    console.log(`Custom object Moves:`);
    const customObjectIds = await getAllIds(customObjectType);
    await batchDelete(customObjectType, customObjectIds);

    console.log('Cleanup completed');
  } catch (err) {
    console.error('General error:', err.message);
  }
}

main();
