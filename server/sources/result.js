'use strict';

// Every source module resolves to this shape, so the frontend never has to
// special-case a source. `status` drives the UI: 'ok' shows the data,
// 'not_found' means the source was reachable but has nothing for this
// country, 'error' means the fetch/parse itself failed.
function makeResult({
  source,
  sourceName,
  status,
  level = null,
  levelKind = null,
  lastUpdated = null,
  summary = null,
  sourceUrl = null,
  error = null,
  confidence = 'high',
}) {
  return {
    source,
    sourceName,
    status,
    level,
    levelKind,
    lastUpdated,
    summary,
    sourceUrl,
    error,
    confidence,
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { makeResult };
