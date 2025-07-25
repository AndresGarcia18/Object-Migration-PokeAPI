import Log from './models/progress.js';

export async function logEvent(step, errorMessage, details = null) {
  await Log.create({ step, status: 'error', message: details, error: errorMessage });
} 