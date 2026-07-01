'use strict';

const DEFAULT_TIMEOUT_MS = 10000;
const USER_AGENT = 'reisadviezenchecker/1.0 (+contact: rinskehiemstra@gmail.com)';

// Wraps fetch() with a timeout and a consistent error type, so every source
// module can fail the same way instead of throwing whatever fetch/JSON.parse
// happens to throw.
async function fetchText(url, { timeoutMs = DEFAULT_TIMEOUT_MS, headers = {} } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json, text/xml, text/html, */*', ...headers },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText} voor ${url}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson(url, options) {
  const text = await fetchText(url, options);
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Ongeldige JSON ontvangen van ${url}: ${err.message}`);
  }
}

module.exports = { fetchText, fetchJson };
