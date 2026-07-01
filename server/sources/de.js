'use strict';

// Duitsland - Auswärtiges Amt "Reisewarnungen OpenData Schnittstelle".
// Field names below (lastModified, effective, title, CountryCode,
// CountryName, warning, partialWarning, situationWarning,
// situationPartWarning, content) come from the official generated API
// client published by bund.dev / bundesAPI (openapi.yaml for
// travelwarning-api), not from a live call, since this environment could
// not reach auswaertiges-amt.de directly. Docs: https://travelwarning.api.bund.dev/
const { fetchJson } = require('../fetchJson');
const { stripHtml, truncate, toIsoDate } = require('../util/extract');
const { normalize } = require('../countries');
const { TtlCache } = require('../cache');
const { makeResult } = require('./result');

const SOURCE = 'de';
const SOURCE_NAME = 'Duitsland (Auswärtiges Amt)';
const LIST_URL = 'https://www.auswaertiges-amt.de/opendata/travelwarning';
const OVERVIEW_URL = 'https://www.auswaertiges-amt.de/de/reiseundsicherheit/reise-und-sicherheitshinweise';

const listCache = new TtlCache(60 * 60 * 1000); // 1 hour

async function getWarningList() {
  return listCache.getOrSet('list', async () => {
    const data = await fetchJson(LIST_URL);
    const response = data && data.response;
    if (!response || typeof response !== 'object') {
      throw new Error('Onverwachte structuur: geen "response" object in de Auswärtiges Amt open-data feed.');
    }
    const ids = Array.isArray(response.contentList) ? response.contentList : Object.keys(response).filter((k) => k !== 'contentList');
    return ids.map((id) => ({ id, ...response[id] })).filter((entry) => entry.CountryName);
  });
}

function summarizeWarningFlags(entry) {
  const flags = [];
  if (entry.warning) flags.push('Reiswaarschuwing (volledig land)');
  if (entry.partialWarning) flags.push('Gedeeltelijke reiswaarschuwing');
  if (entry.situationWarning) flags.push('Situatieve waarschuwing (bv. gezondheid)');
  if (entry.situationPartWarning) flags.push('Gedeeltelijke situatieve waarschuwing');
  return flags.length ? flags.join('; ') : 'Geen reiswaarschuwing van kracht';
}

async function getAdvisory(country) {
  let list;
  try {
    list = await getWarningList();
  } catch (err) {
    return makeResult({
      source: SOURCE,
      sourceName: SOURCE_NAME,
      status: 'error',
      sourceUrl: OVERVIEW_URL,
      error: `Kon de Duitse open-data feed niet ophalen: ${err.message}`,
    });
  }

  const target = normalize(country.name_de);
  const entry = list.find((e) => normalize(e.CountryName) === target);

  if (!entry) {
    return makeResult({
      source: SOURCE,
      sourceName: SOURCE_NAME,
      status: 'not_found',
      sourceUrl: OVERVIEW_URL,
      error: `${country.name_de} niet gevonden in de Duitse open-data feed.`,
    });
  }

  let summary = null;
  try {
    const detail = await fetchJson(`${LIST_URL}/${entry.id}`);
    const detailEntry = detail && detail.response && detail.response[entry.id];
    if (detailEntry && detailEntry.content) {
      summary = truncate(stripHtml(detailEntry.content));
    }
  } catch (err) {
    // Detail fetch failing is not fatal: we still have the summary flags
    // from the list call, so this source stays 'ok' with a shorter summary.
  }

  return makeResult({
    source: SOURCE,
    sourceName: SOURCE_NAME,
    status: 'ok',
    level: summarizeWarningFlags(entry),
    levelKind: 'boolean_flags',
    lastUpdated: toIsoDate(entry.lastModified),
    summary,
    sourceUrl: OVERVIEW_URL,
  });
}

module.exports = { getAdvisory, SOURCE, SOURCE_NAME };
