'use strict';

// Nederland - NederlandWereldwijd / Ministerie van Buitenlandse Zaken.
// Official open data: https://www.nederlandwereldwijd.nl/open-data
// Per-country endpoint pattern confirmed to exist:
//   https://opendata.nederlandwereldwijd.nl/v2/sources/nederlandwereldwijd/infotypes/countries/{slug}/traveladvice
// The exact JSON field names were not verifiable from this environment
// (no outbound access to government sites), so this module scans the
// response for keys that look like a colour code / update date / summary
// text instead of assuming one fixed shape.
const { fetchJson } = require('../fetchJson');
const { deepFindByKey, toIsoDate, truncate } = require('../util/extract');
const { makeResult } = require('./result');

const SOURCE = 'nl';
const SOURCE_NAME = 'Nederland (NederlandWereldwijd)';

async function getAdvisory(country) {
  const publicUrl = `https://www.nederlandwereldwijd.nl/reisadvies/${country.id}`;
  const apiUrl = `https://opendata.nederlandwereldwijd.nl/v2/sources/nederlandwereldwijd/infotypes/countries/${country.id}/traveladvice`;

  let data;
  try {
    data = await fetchJson(apiUrl);
  } catch (err) {
    return makeResult({
      source: SOURCE,
      sourceName: SOURCE_NAME,
      status: 'error',
      sourceUrl: publicUrl,
      error: `Kon de NL open-data feed niet ophalen of parsen: ${err.message}`,
    });
  }

  const colorMatch = deepFindByKey(data, /kleur|colou?r/i, { valueType: 'string' })
    .find((m) => /groen|geel|oranje|rood|green|yellow|orange|red/i.test(m.value));
  const dateMatches = deepFindByKey(data, /gewijzigd|modified|updated|datum|date/i);
  const summaryMatches = deepFindByKey(data, /samenvatting|summary|inleiding|omschrijving|description/i, { valueType: 'string' })
    .filter((m) => m.value && m.value.length > 30);

  if (!colorMatch && summaryMatches.length === 0) {
    return makeResult({
      source: SOURCE,
      sourceName: SOURCE_NAME,
      status: 'error',
      sourceUrl: publicUrl,
      error: 'De API gaf een antwoord terug, maar hier kon geen kleurcode of tekst in worden herkend (mogelijk is het dataformaat gewijzigd).',
    });
  }

  const lastUpdated = dateMatches.length
    ? dateMatches.map((m) => toIsoDate(m.value)).find(Boolean) || null
    : null;

  return makeResult({
    source: SOURCE,
    sourceName: SOURCE_NAME,
    status: 'ok',
    level: colorMatch ? colorMatch.value : null,
    levelKind: 'color',
    lastUpdated,
    summary: summaryMatches.length ? truncate(summaryMatches[0].value) : null,
    sourceUrl: publicUrl,
    confidence: colorMatch ? 'high' : 'medium',
  });
}

module.exports = { getAdvisory, SOURCE, SOURCE_NAME };
