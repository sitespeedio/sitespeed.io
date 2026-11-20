import { getLogger } from '@sitespeed.io/log';
const log = getLogger('sitespeedio.plugin.webhook');

const SEND_RETRIES = 3;
const TIMEOUT_MS = 30_000;

function isRetryable(error) {
  return (
    error.status === undefined ||
    error.status === 408 ||
    error.status === 429 ||
    error.status >= 500
  );
}

export async function send(url, payload) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
      if (!response.ok) {
        const error = new Error(
          `Webhook answered ${response.status} ${response.statusText}`
        );
        error.status = response.status;
        throw error;
      }
      return;
    } catch (error) {
      if (!isRetryable(error) || attempt > SEND_RETRIES) {
        throw error;
      }
      log.info(
        `Webhook failed (attempt ${attempt}/${SEND_RETRIES}), retrying: ${error.message}`
      );
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
