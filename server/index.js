'use strict';

const path = require('path');
const express = require('express');
const { COUNTRIES, getCountryById } = require('./countries');
const { TtlCache } = require('./cache');

const nl = require('./sources/nl');
const uk = require('./sources/uk');
const us = require('./sources/us');
const de = require('./sources/de');
const be = require('./sources/be');

const SOURCES = [nl, de, be, uk, us];
const PORT = process.env.PORT || 3000;
const RESULT_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const app = express();
const resultCache = new TtlCache(RESULT_CACHE_TTL_MS);

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/countries', (req, res) => {
  res.json(COUNTRIES.map((c) => ({ id: c.id, name: c.name_nl })));
});

app.get('/api/advisory/:countryId', async (req, res) => {
  const country = getCountryById(req.params.countryId);
  if (!country) {
    res.status(404).json({ error: `Onbekend land: ${req.params.countryId}` });
    return;
  }

  if (req.query.force) {
    resultCache.store.delete(country.id);
  }

  try {
    const result = await resultCache.getOrSet(country.id, async () => {
      const settled = await Promise.allSettled(SOURCES.map((mod) => mod.getAdvisory(country)));
      const sources = settled.map((s, i) =>
        s.status === 'fulfilled'
          ? s.value
          : {
              source: SOURCES[i].SOURCE,
              sourceName: SOURCES[i].SOURCE_NAME,
              status: 'error',
              error: `Onverwachte fout: ${s.reason && s.reason.message}`,
              level: null,
              levelKind: null,
              lastUpdated: null,
              summary: null,
              sourceUrl: null,
              confidence: 'high',
              fetchedAt: new Date().toISOString(),
            }
      );
      return { country: { id: country.id, name: country.name_nl }, sources, fetchedAt: new Date().toISOString() };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: `Onverwachte serverfout: ${err.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Reisadviezenchecker draait op http://localhost:${PORT}`);
});
