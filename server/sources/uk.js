'use strict';

// Verenigd Koninkrijk - GOV.UK Foreign Travel Advice, via the public
// GOV.UK Content API and Search API (both documented at
// https://content-api.publishing.service.gov.uk/ and
// https://docs.publishing.service.gov.uk/apis/search/search-api.html).
// The country's URL slug is looked up dynamically through the Search API
// instead of a hardcoded slug list, so it keeps working even if GOV.UK
// renames a page.
const { fetchJson } = require('../fetchJson');
const { stripHtml, truncate } = require('../util/extract');
const { normalize } = require('../countries');
const { TtlCache } = require('../cache');
const { makeResult } = require('./result');

const SOURCE = 'uk';
const SOURCE_NAME = 'Verenigd Koninkrijk (GOV.UK / FCDO)';
const SEARCH_URL = 'https://www.gov.uk/api/search.json?filter_format=travel_advice&count=1000&fields=title,link';

const listCache = new TtlCache(6 * 60 * 60 * 1000); // 6 hours

const ALERT_STATUS_LABELS = {
  avoid_all_travel_to_whole_country: 'Ontraad alle reizen naar het hele land',
  avoid_all_travel_to_parts_of_country: 'Ontraad alle reizen naar delen van het land',
  avoid_all_but_essential_travel_to_whole_country: 'Ontraad niet-essentiële reizen naar het hele land',
  avoid_all_but_essential_travel_to_parts_of_country: 'Ontraad niet-essentiële reizen naar delen van het land',
};

async function getTravelAdviceList() {
  return listCache.getOrSet('list', async () => {
    const data = await fetchJson(SEARCH_URL);
    const results = Array.isArray(data && data.results) ? data.results : [];
    return results.filter((r) => typeof r.link === 'string' && r.link.startsWith('/foreign-travel-advice/'));
  });
}

function findBasePath(list, country) {
  const candidates = [country.name_en, ...(country.aliases || [])];
  for (const item of list) {
    if (candidates.some((name) => normalize(name) === normalize(item.title))) {
      return item.link;
    }
  }
  // Fall back to matching the slug itself against a simplified English name.
  const slugGuess = country.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const bySlug = list.find((item) => item.link === `/foreign-travel-advice/${slugGuess}`);
  return bySlug ? bySlug.link : null;
}

async function getAdvisory(country) {
  let basePath;
  try {
    const list = await getTravelAdviceList();
    basePath = findBasePath(list, country);
  } catch (err) {
    return makeResult({
      source: SOURCE,
      sourceName: SOURCE_NAME,
      status: 'error',
      sourceUrl: 'https://www.gov.uk/foreign-travel-advice',
      error: `Kon de GOV.UK landenlijst niet ophalen: ${err.message}`,
    });
  }

  if (!basePath) {
    return makeResult({
      source: SOURCE,
      sourceName: SOURCE_NAME,
      status: 'not_found',
      sourceUrl: 'https://www.gov.uk/foreign-travel-advice',
      error: `${country.name_en} niet gevonden in de GOV.UK reisadvieslijst.`,
    });
  }

  const publicUrl = `https://www.gov.uk${basePath}`;
  const apiUrl = `https://www.gov.uk/api/content${basePath}`;

  let data;
  try {
    data = await fetchJson(apiUrl);
  } catch (err) {
    return makeResult({
      source: SOURCE,
      sourceName: SOURCE_NAME,
      status: 'error',
      sourceUrl: publicUrl,
      error: `Kon de GOV.UK content-API niet ophalen: ${err.message}`,
    });
  }

  const details = data && data.details ? data.details : {};
  const alertStatus = Array.isArray(details.alert_status) ? details.alert_status : [];
  const level = alertStatus.length
    ? alertStatus.map((s) => ALERT_STATUS_LABELS[s] || s.replace(/_/g, ' ')).join('; ')
    : 'Geen actief reiswaarschuwingsniveau (alert_status leeg)';

  const parts = Array.isArray(details.parts) ? details.parts : [];
  const summaryPart = parts.find((p) => /summary/i.test(p.slug || p.title || '')) || parts[0];
  const summary = summaryPart ? truncate(stripHtml(summaryPart.body)) : null;

  const lastUpdated = data.public_updated_at || data.updated_at || null;

  return makeResult({
    source: SOURCE,
    sourceName: SOURCE_NAME,
    status: 'ok',
    level,
    levelKind: 'alert_status',
    lastUpdated: lastUpdated ? new Date(lastUpdated).toISOString() : null,
    summary,
    sourceUrl: publicUrl,
  });
}

module.exports = { getAdvisory, SOURCE, SOURCE_NAME };
