(() => {
  const countryListEl = document.getElementById('country-list');
  const searchEl = document.getElementById('search');
  const resultEl = document.getElementById('result');
  const emptyStateEl = document.getElementById('empty-state');
  const resultTitleEl = document.getElementById('result-title');
  const cardsEl = document.getElementById('cards');
  const refreshBtn = document.getElementById('refresh');

  let countries = [];
  let activeCountryId = null;

  function badgeColorFor(source) {
    const text = (source.level || '').toLowerCase();
    if (source.status !== 'ok') return 'gray';
    if (source.levelKind === 'color') {
      if (/groen|green/.test(text)) return 'green';
      if (/geel|yellow/.test(text)) return 'yellow';
      if (/oranje|orange/.test(text)) return 'orange';
      if (/rood|red/.test(text)) return 'red';
      return 'gray';
    }
    if (source.levelKind === 'level') {
      if (/level\s*1/.test(text)) return 'green';
      if (/level\s*2/.test(text)) return 'yellow';
      if (/level\s*3/.test(text)) return 'orange';
      if (/level\s*4/.test(text)) return 'red';
      return 'gray';
    }
    if (source.levelKind === 'phase') {
      const m = text.match(/fase\s*(\d)/);
      const phase = m ? Number(m[1]) : null;
      return { 0: 'green', 1: 'yellow', 2: 'orange', 3: 'orange', 4: 'red' }[phase] || 'gray';
    }
    if (source.levelKind === 'boolean_flags') {
      if (/geen reiswaarschuwing/.test(text)) return 'green';
      if (/gedeeltelijke/.test(text)) return 'orange';
      if (/reiswaarschuwing \(volledig/.test(text)) return 'red';
      return 'gray';
    }
    if (source.levelKind === 'alert_status') {
      if (/geen actief/.test(text)) return 'green';
      if (/niet-essentiële/.test(text)) return 'orange';
      if (/alle reizen/.test(text)) return 'red';
      return 'gray';
    }
    return 'gray';
  }

  function formatDate(value) {
    if (!value) return null;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    return value; // raw text fallback (e.g. a date string scraped from a page)
  }

  function renderCard(source) {
    const wrapper = document.createElement('div');
    wrapper.className = `card ${source.status}`;

    const header = document.createElement('div');
    header.className = 'card-header';
    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = source.sourceName;
    header.appendChild(title);

    if (source.status === 'ok') {
      const badge = document.createElement('span');
      badge.className = `badge ${badgeColorFor(source)}`;
      badge.textContent = source.status === 'ok' ? 'OK' : source.status;
      header.appendChild(badge);
    }
    wrapper.appendChild(header);

    if (source.status === 'ok') {
      const level = document.createElement('div');
      level.className = 'level';
      level.textContent = source.level || 'Geen niveau gevonden';
      wrapper.appendChild(level);

      const updated = document.createElement('div');
      updated.className = 'updated';
      const formatted = formatDate(source.lastUpdated);
      updated.textContent = formatted ? `Laatst bijgewerkt: ${formatted}` : 'Laatst bijgewerkt: onbekend';
      wrapper.appendChild(updated);

      if (source.confidence === 'low' || source.confidence === 'medium') {
        const note = document.createElement('div');
        note.className = 'confidence-note';
        note.textContent =
          source.confidence === 'low'
            ? 'Let op: automatisch van de webpagina gelezen, minder betrouwbaar dan een officiële feed.'
            : 'Let op: niet alle velden konden met zekerheid worden herkend.';
        wrapper.appendChild(note);
      }

      if (source.summary) {
        const summary = document.createElement('div');
        summary.className = 'summary';
        summary.textContent = source.summary;
        wrapper.appendChild(summary);
      }
    } else {
      const err = document.createElement('div');
      err.className = 'error-text';
      err.textContent =
        source.status === 'not_found'
          ? source.error || 'Land niet gevonden bij deze bron.'
          : source.error || 'Onbekende fout bij het ophalen van deze bron.';
      wrapper.appendChild(err);
    }

    if (source.sourceUrl) {
      const link = document.createElement('a');
      link.className = 'source-link';
      link.href = source.sourceUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Bekijk originele bron ↗';
      wrapper.appendChild(link);
    }

    return wrapper;
  }

  async function loadAdvisory(countryId, { force = false } = {}) {
    activeCountryId = countryId;
    highlightActiveCountry();

    emptyStateEl.hidden = true;
    resultEl.hidden = false;
    const country = countries.find((c) => c.id === countryId);
    resultTitleEl.textContent = country ? country.name : countryId;
    cardsEl.innerHTML = '<p>Bezig met ophalen…</p>';

    try {
      const url = `/api/advisory/${encodeURIComponent(countryId)}${force ? '?force=1' : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Serverfout (${res.status})`);
      const data = await res.json();

      cardsEl.innerHTML = '';
      data.sources.forEach((source) => cardsEl.appendChild(renderCard(source)));
    } catch (err) {
      cardsEl.innerHTML = `<p class="error-text">Kon de reisadviezen niet ophalen: ${err.message}</p>`;
    }
  }

  function highlightActiveCountry() {
    countryListEl.querySelectorAll('button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.id === activeCountryId);
    });
  }

  function renderCountryList(filter = '') {
    const normalizedFilter = filter.trim().toLowerCase();
    countryListEl.innerHTML = '';
    countries
      .filter((c) => c.name.toLowerCase().includes(normalizedFilter))
      .forEach((c) => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = c.name;
        btn.dataset.id = c.id;
        btn.addEventListener('click', () => loadAdvisory(c.id));
        li.appendChild(btn);
        countryListEl.appendChild(li);
      });
    highlightActiveCountry();
  }

  searchEl.addEventListener('input', () => renderCountryList(searchEl.value));
  refreshBtn.addEventListener('click', () => {
    if (activeCountryId) loadAdvisory(activeCountryId, { force: true });
  });

  fetch('/api/countries')
    .then((res) => res.json())
    .then((data) => {
      countries = data;
      renderCountryList();
    })
    .catch(() => {
      countryListEl.innerHTML = '<li>Kon landenlijst niet laden.</li>';
    });
})();
