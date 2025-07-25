
import pokeapiClient from './pokeapiClient.js';
import Location from '../db/models/locations.js';
import { logEvent } from '../db/progressHelper.js';

async function fetchAndSaveLocations() {
  const existingCount = await Location.countDocuments();
  if (existingCount >= 100) {
    console.log('Locations already present in MongoDB, skipping fetch.');
    return;
  }
  let count = 0;
  let locationId = 1;

  async function saveLocation(locationData) {
    const locationDoc = new Location({
      id: locationData.id,
      name: locationData.name,
      number_of_areas: locationData.areas?.length || 0,
      region: locationData.region?.name || null,
      generation: locationData.game_indices?.[0]?.generation?.name || null
    });
    await locationDoc.save();
  }

  async function isDuplicate(locationId) {
    return await Location.exists({ id: locationId });
  }

  while (count < 100) {
    try {
      const response = await pokeapiClient.getLocation(locationId);
      if (!response || !response.data) {
        locationId++;
        continue;
      }
      const locationData = response.data;
      if (await isDuplicate(locationData.id)) {
        console.error(`Error fetching location with ID ${locationId}, duplicate key error...`);
        await logEvent('locations', 'Duplicate key error', `Duplicate location ID ${locationId}`);
        count++;
        locationId++;
        continue;
      }
      await saveLocation(locationData);
      count++;
    } catch (error) {
      console.error(`Error fetching location ${locationId}:`, error.message);
      await logEvent('locations', error.message, `Error fetching location ${locationId}`);
    }
    locationId++;
  }
  console.log(` -- Locations saved to MongoDB: ${count} -- `);
}

export default fetchAndSaveLocations;
