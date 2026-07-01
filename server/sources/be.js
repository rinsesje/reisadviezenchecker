'use strict';

// België - FOD Buitenlandse Zaken (diplomatie.belgium.be). This is the one
// source in the tool with no public API or feed, so it works by scraping
// the country listing page and then the country's own page. This makes it
// the least robust source: if Belgium restyles its site this will start
// failing, which is why it always reports its confidence as 'low' and
// always includes a direct link so a person can double-check by hand.
const cheerio = require('cheerio');
const { fetchText } = require('../fetchJson');
const { truncate } = require('../util/extract');
const { normalize } = require('../countries');
const { TtlCache } = require('../cache');
const { makeResult } = require('./result');

const SOURCE = 'be';
const SOURCE_NAME = 'België (FOD Buitenlandse Zaken)';
const COUNTRY_LIST_URL = 'https://diplomatie.belgium.be/nl/landen';
const BASE_URL = 'https://diplomatie.belgium.be';

const listCache = new TtlCache(24 * 60 * 60 * 1000); // 24 hours

const MONTHS = 'januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december';
const DATE_NEAR_KEYWORD_RE = new RegExp(
  `(laatst\\s+bijgewerkt|laatste\\s+update|bijgewerkt\\s+op|gewijzigd\\s+op|van\\s+kracht\\s+sinds)[^\\d]{0,20}(\\d{1,2}\\s+(?:${MONTHS})\\s+\\d{4}|\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{4})`,
  'i'
);
const PHASE_RE = /fase\s*([0-4])\b/i;

async function getCountryLinks() {
  return listCache.getOrSet('links', async () => {
    const html = await fetchText(COUNTRY_LIST_URL);
    const $ = cheerio.load(html);
    const links = [];
    $('a[href^="/nl/landen/"]').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href && text && /^\/nl\/landen\/[a-z0-9-]+\/?$/i.test(href)) {
        links.push({ text, href });
      }
    });
    if (!links.length) {
      throw new Error('Geen landenlinks gevonden op de landenpagina (paginastructuur is mogelijk gewijzigd).');
    }
    return links;
  });
}

function findTravelAdviceLink($, landingUrl) {
  let found = null;
  $('a').each((_, el) => {
    if (found) return;
    const href = $(el).attr('href') || '';
    const text = $(el).text() || '';
    if (/reisadvies/i.test(text) || /reisadvies/i.test(href)) {
      found = href.startsWith('http') ? href : new URL(href, landingUrl).toString();
    }
  });
  return found;
}

async function getAdvisory(country) {
  let links;
  try {
    links = await getCountryLinks();
  } catch (err) {
    return makeResult({
      source: SOURCE,
      sourceName: SOURCE_NAME,
      status: 'error',
      sourceUrl: COUNTRY_LIST_URL,
      error: `Kon de Belgische landenlijst niet ophalen: ${err.message}`,
      confidence: 'low',
    });
  }

  const target = normalize(country.name_nl);
  const match = links.find((l) => normalize(l.text) === target);
  if (!match) {
    return makeResult({
      source: SOURCE,
      sourceName: SOURCE_NAME,
      status: 'not_found',
      sourceUrl: COUNTRY_LIST_URL,
      error: `${country.name_nl} niet gevonden in de Belgische landenlijst.`,
      confidence: 'low',
    });
  }

  const landingUrl = `${BASE_URL}${match.href}`;
  let landingHtml;
  try {
    landingHtml = await fetchText(landingUrl);
  } catch (err) {
    return makeResult({
      source: SOURCE,
      sourceName: SOURCE_NAME,
      status: 'error',
      sourceUrl: landingUrl,
      error: `Kon de landenpagina niet ophalen: ${err.message}`,
      confidence: 'low',
    });
  }

  const $landing = cheerio.load(landingHtml);
  const adviceUrl = findTravelAdviceLink($landing, landingUrl) || landingUrl;

  let pageHtml = landingHtml;
  let pageUrl = landingUrl;
  if (adviceUrl !== landingUrl) {
    try {
      pageHtml = await fetchText(adviceUrl);
      pageUrl = adviceUrl;
    } catch (err) {
      // Fall back to the landing page text if the dedicated advice page
      // could not be loaded for some reason.
      pageHtml = landingHtml;
      pageUrl = landingUrl;
    }
  }

  const $page = cheerio.load(pageHtml);
  const text = $page('body').text().replace(/\s+/g, ' ').trim();

  const phaseMatch = text.match(PHASE_RE);
  if (!phaseMatch) {
    return makeResult({
      source: SOURCE,
      sourceName: SOURCE_NAME,
      status: 'error',
      sourceUrl: pageUrl,
      error: 'Kon geen "Fase" (reisadviesniveau) herkennen op de pagina. Controleer de pagina handmatig via de link.',
      confidence: 'low',
    });
  }

  const dateMatch = text.match(DATE_NEAR_KEYWORD_RE);
  const phaseIndex = phaseMatch.index || 0;
  const snippetStart = Math.max(0, phaseIndex - 40);
  const snippet = text.slice(snippetStart, snippetStart + 300);

  return makeResult({
    source: SOURCE,
    sourceName: SOURCE_NAME,
    status: 'ok',
    level: `Fase ${phaseMatch[1]}`,
    levelKind: 'phase',
    lastUpdated: dateMatch ? dateMatch[2] : null,
    summary: truncate(snippet),
    sourceUrl: pageUrl,
    confidence: 'low',
  });
}

module.exports = { getAdvisory, SOURCE, SOURCE_NAME };
