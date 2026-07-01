'use strict';

// Shared helpers used by the source modules to pull information out of
// JSON/HTML responses without assuming one exact, unverified schema.
// Preferring "found nothing" over "guessed wrong" is the point: every
// helper here returns null/[] when it cannot find something with
// reasonable confidence instead of inventing a value.

// Recursively walks a JSON value (object/array) up to `depth` levels and
// collects every {key, value} pair whose key matches `keyPattern`.
function deepFindByKey(node, keyPattern, { depth = 5, valueType = null } = {}) {
  const results = [];
  function walk(current, level) {
    if (current == null || level > depth) return;
    if (Array.isArray(current)) {
      for (const item of current) walk(item, level + 1);
      return;
    }
    if (typeof current === 'object') {
      for (const [key, value] of Object.entries(current)) {
        if (keyPattern.test(key)) {
          if (!valueType || typeof value === valueType) {
            results.push({ key, value });
          }
        }
        walk(value, level + 1);
      }
    }
  }
  walk(node, 0);
  return results;
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text, maxLength = 400) {
  if (!text) return text;
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

// Best-effort parse of a timestamp that might be an ISO string, an epoch in
// seconds, or an epoch in milliseconds. Returns an ISO string or null.
function toIsoDate(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number') {
    const ms = value > 1e12 ? value : value * 1000;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

module.exports = { deepFindByKey, stripHtml, truncate, toIsoDate };
