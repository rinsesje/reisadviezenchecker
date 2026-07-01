'use strict';

// Verenigde Staten - U.S. Department of State Travel Advisories, published
// as the long-standing public RSS feed https://travel.state.gov/_res/rss/TAsTWs.xml.
// This feed is used deliberately instead of the newer cadataapi.state.gov
// JSON endpoint: the RSS item structure (title/link/pubDate/description) is
// a stable, documented format, while the exact JSON field names of the
// newer API could not be verified from this environment.
const { XMLParser } = require('fast-xml-parser');
const { fetchText } = require('../fetchJson');
const { stripHtml, truncate } = require('../util/extract');
const { normalize: normalizeCountry } = require('../countries');
const { TtlCache } = require('../cache');
const { makeResult } = require('./result');

const SOURCE = 'us';
const SOURCE_NAME = 'Verenigde Staten (U.S. Department of State)';
const FEED_URL = 'https://travel.state.gov/_res/rss/TAsTWs.xml';
const OVERVIEW_URL = 'https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html/';

const feedCache = new TtlCache(60 * 60 * 1000); // 1 hour

async function getFeedItems() {
  return feedCache.getOrSet('items', async () => {
    const xml = await fetchText(FEED_URL);
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xml);
    const items = parsed && parsed.rss && parsed.rss.channel ? parsed.rss.channel.item : null;
    if (!items) throw new Error('Geen <item> elementen gevonden in de RSS-feed (structuur mogelijk gewijzigd).');
    return Array.isArray(items) ? items : [items];
  });
}

function findItemForCountry(items, country) {
  const names = [country.name_en, ...(country.aliases || [])].map((n) => normalizeCountry(n));
  return items.find((item) => {
    const title = String(item.title || '');
    const normalizedTitle = normalizeCountry(title);
    return names.some((name) => name && (normalizedTitle.startsWith(name) || normalizedTitle.includes(` ${name} `) || normalizedTitle.includes(`${name} travel`)));
  });
}

async function getAdvisory(country) {
  let items;
  try {
    items = await getFeedItems();
  } catch (err) {
    return makeResult({
      source: SOURCE,
      sourceName: SOURCE_NAME,
      status: 'error',
      sourceUrl: OVERVIEW_URL,
      error: `Kon de RSS-feed van travel.state.gov niet ophalen of parsen: ${err.message}`,
    });
  }

  const item = findItemForCountry(items, country);
  if (!item) {
    return makeResult({
      source: SOURCE,
      sourceName: SOURCE_NAME,
      status: 'not_found',
      sourceUrl: OVERVIEW_URL,
      error: `${country.name_en} niet gevonden in de travel.state.gov feed.`,
    });
  }

  const title = String(item.title || '');
  const levelMatch = title.match(/level\s*(\d)\s*:?\s*([^|]*)/i);
  const level = levelMatch ? `Level ${levelMatch[1]}${levelMatch[2] ? `: ${levelMatch[2].trim()}` : ''}` : title;

  const pubDate = item.pubDate ? new Date(item.pubDate) : null;
  const summary = item.description ? truncate(stripHtml(item.description)) : null;

  return makeResult({
    source: SOURCE,
    sourceName: SOURCE_NAME,
    status: 'ok',
    level,
    levelKind: 'level',
    lastUpdated: pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate.toISOString() : null,
    summary,
    sourceUrl: item.link || OVERVIEW_URL,
  });
}

module.exports = { getAdvisory, SOURCE, SOURCE_NAME };
