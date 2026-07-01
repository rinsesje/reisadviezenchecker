// Curated list of countries this tool can look up.
// name_nl / name_en / name_de are used to match this country against the
// name strings returned by each government source (Dutch, UK/US and German
// sources all label countries differently), so keep them accurate.
'use strict';

const COUNTRIES = [
  { id: 'belgie', name_nl: 'België', name_en: 'Belgium', name_de: 'Belgien' },
  { id: 'duitsland', name_nl: 'Duitsland', name_en: 'Germany', name_de: 'Deutschland' },
  { id: 'frankrijk', name_nl: 'Frankrijk', name_en: 'France', name_de: 'Frankreich' },
  { id: 'spanje', name_nl: 'Spanje', name_en: 'Spain', name_de: 'Spanien' },
  { id: 'italie', name_nl: 'Italië', name_en: 'Italy', name_de: 'Italien' },
  { id: 'portugal', name_nl: 'Portugal', name_en: 'Portugal', name_de: 'Portugal' },
  { id: 'griekenland', name_nl: 'Griekenland', name_en: 'Greece', name_de: 'Griechenland' },
  { id: 'verenigd-koninkrijk', name_nl: 'Verenigd Koninkrijk', name_en: 'United Kingdom', name_de: 'Vereinigtes Königreich', aliases: ['VK', 'UK', 'Groot-Brittannië'] },
  { id: 'ierland', name_nl: 'Ierland', name_en: 'Ireland', name_de: 'Irland' },
  { id: 'oostenrijk', name_nl: 'Oostenrijk', name_en: 'Austria', name_de: 'Österreich' },
  { id: 'zwitserland', name_nl: 'Zwitserland', name_en: 'Switzerland', name_de: 'Schweiz' },
  { id: 'polen', name_nl: 'Polen', name_en: 'Poland', name_de: 'Polen' },
  { id: 'tsjechie', name_nl: 'Tsjechië', name_en: 'Czechia', name_de: 'Tschechien', aliases: ['Czech Republic', 'Tsjechische Republiek'] },
  { id: 'hongarije', name_nl: 'Hongarije', name_en: 'Hungary', name_de: 'Ungarn' },
  { id: 'kroatie', name_nl: 'Kroatië', name_en: 'Croatia', name_de: 'Kroatien' },
  { id: 'slovenie', name_nl: 'Slovenië', name_en: 'Slovenia', name_de: 'Slowenien' },
  { id: 'denemarken', name_nl: 'Denemarken', name_en: 'Denmark', name_de: 'Dänemark' },
  { id: 'zweden', name_nl: 'Zweden', name_en: 'Sweden', name_de: 'Schweden' },
  { id: 'noorwegen', name_nl: 'Noorwegen', name_en: 'Norway', name_de: 'Norwegen' },
  { id: 'finland', name_nl: 'Finland', name_en: 'Finland', name_de: 'Finnland' },
  { id: 'ijsland', name_nl: 'IJsland', name_en: 'Iceland', name_de: 'Island' },
  { id: 'luxemburg', name_nl: 'Luxemburg', name_en: 'Luxembourg', name_de: 'Luxemburg' },
  { id: 'malta', name_nl: 'Malta', name_en: 'Malta', name_de: 'Malta' },
  { id: 'cyprus', name_nl: 'Cyprus', name_en: 'Cyprus', name_de: 'Zypern' },
  { id: 'roemenie', name_nl: 'Roemenië', name_en: 'Romania', name_de: 'Rumänien' },
  { id: 'bulgarije', name_nl: 'Bulgarije', name_en: 'Bulgaria', name_de: 'Bulgarien' },
  { id: 'slowakije', name_nl: 'Slowakije', name_en: 'Slovakia', name_de: 'Slowakei' },
  { id: 'servie', name_nl: 'Servië', name_en: 'Serbia', name_de: 'Serbien' },
  { id: 'albanie', name_nl: 'Albanië', name_en: 'Albania', name_de: 'Albanien' },
  { id: 'montenegro', name_nl: 'Montenegro', name_en: 'Montenegro', name_de: 'Montenegro' },
  { id: 'oekraine', name_nl: 'Oekraïne', name_en: 'Ukraine', name_de: 'Ukraine' },
  { id: 'wit-rusland', name_nl: 'Wit-Rusland', name_en: 'Belarus', name_de: 'Weißrussland', aliases: ['Belarus'] },
  { id: 'rusland', name_nl: 'Rusland', name_en: 'Russia', name_de: 'Russland' },
  { id: 'turkije', name_nl: 'Turkije', name_en: 'Turkey', name_de: 'Türkei', aliases: ['Türkiye'] },
  { id: 'marokko', name_nl: 'Marokko', name_en: 'Morocco', name_de: 'Marokko' },
  { id: 'tunesie', name_nl: 'Tunesië', name_en: 'Tunisia', name_de: 'Tunesien' },
  { id: 'egypte', name_nl: 'Egypte', name_en: 'Egypt', name_de: 'Ägypten' },
  { id: 'zuid-afrika', name_nl: 'Zuid-Afrika', name_en: 'South Africa', name_de: 'Südafrika' },
  { id: 'kenia', name_nl: 'Kenia', name_en: 'Kenya', name_de: 'Kenia' },
  { id: 'verenigde-staten', name_nl: 'Verenigde Staten', name_en: 'United States', name_de: 'Vereinigte Staaten', aliases: ['VS', 'Amerika', 'USA'] },
  { id: 'canada', name_nl: 'Canada', name_en: 'Canada', name_de: 'Kanada' },
  { id: 'mexico', name_nl: 'Mexico', name_en: 'Mexico', name_de: 'Mexiko' },
  { id: 'brazilie', name_nl: 'Brazilië', name_en: 'Brazil', name_de: 'Brasilien' },
  { id: 'argentinie', name_nl: 'Argentinië', name_en: 'Argentina', name_de: 'Argentinien' },
  { id: 'peru', name_nl: 'Peru', name_en: 'Peru', name_de: 'Peru' },
  { id: 'chili', name_nl: 'Chili', name_en: 'Chile', name_de: 'Chile' },
  { id: 'colombia', name_nl: 'Colombia', name_en: 'Colombia', name_de: 'Kolumbien' },
  { id: 'cuba', name_nl: 'Cuba', name_en: 'Cuba', name_de: 'Kuba' },
  { id: 'dominicaanse-republiek', name_nl: 'Dominicaanse Republiek', name_en: 'Dominican Republic', name_de: 'Dominikanische Republik' },
  { id: 'jamaica', name_nl: 'Jamaica', name_en: 'Jamaica', name_de: 'Jamaika' },
  { id: 'suriname', name_nl: 'Suriname', name_en: 'Suriname', name_de: 'Suriname' },
  { id: 'china', name_nl: 'China', name_en: 'China', name_de: 'China' },
  { id: 'japan', name_nl: 'Japan', name_en: 'Japan', name_de: 'Japan' },
  { id: 'zuid-korea', name_nl: 'Zuid-Korea', name_en: 'South Korea', name_de: 'Südkorea' },
  { id: 'india', name_nl: 'India', name_en: 'India', name_de: 'Indien' },
  { id: 'thailand', name_nl: 'Thailand', name_en: 'Thailand', name_de: 'Thailand' },
  { id: 'vietnam', name_nl: 'Vietnam', name_en: 'Vietnam', name_de: 'Vietnam' },
  { id: 'indonesie', name_nl: 'Indonesië', name_en: 'Indonesia', name_de: 'Indonesien' },
  { id: 'maleisie', name_nl: 'Maleisië', name_en: 'Malaysia', name_de: 'Malaysia' },
  { id: 'filipijnen', name_nl: 'Filipijnen', name_en: 'Philippines', name_de: 'Philippinen' },
  { id: 'sri-lanka', name_nl: 'Sri Lanka', name_en: 'Sri Lanka', name_de: 'Sri Lanka' },
  { id: 'nepal', name_nl: 'Nepal', name_en: 'Nepal', name_de: 'Nepal' },
  { id: 'israel', name_nl: 'Israël', name_en: 'Israel', name_de: 'Israel' },
  { id: 'libanon', name_nl: 'Libanon', name_en: 'Lebanon', name_de: 'Libanon' },
  { id: 'jordanie', name_nl: 'Jordanië', name_en: 'Jordan', name_de: 'Jordanien' },
  { id: 'verenigde-arabische-emiraten', name_nl: 'Verenigde Arabische Emiraten', name_en: 'United Arab Emirates', name_de: 'Vereinigte Arabische Emirate', aliases: ['VAE', 'Dubai'] },
  { id: 'saoedi-arabie', name_nl: 'Saoedi-Arabië', name_en: 'Saudi Arabia', name_de: 'Saudi-Arabien' },
  { id: 'qatar', name_nl: 'Qatar', name_en: 'Qatar', name_de: 'Katar' },
  { id: 'iran', name_nl: 'Iran', name_en: 'Iran', name_de: 'Iran' },
  { id: 'irak', name_nl: 'Irak', name_en: 'Iraq', name_de: 'Irak' },
  { id: 'afghanistan', name_nl: 'Afghanistan', name_en: 'Afghanistan', name_de: 'Afghanistan' },
  { id: 'pakistan', name_nl: 'Pakistan', name_en: 'Pakistan', name_de: 'Pakistan' },
  { id: 'oezbekistan', name_nl: 'Oezbekistan', name_en: 'Uzbekistan', name_de: 'Usbekistan' },
  { id: 'georgie', name_nl: 'Georgië', name_en: 'Georgia', name_de: 'Georgien' },
  { id: 'armenie', name_nl: 'Armenië', name_en: 'Armenia', name_de: 'Armenien' },
  { id: 'azerbeidzjan', name_nl: 'Azerbeidzjan', name_en: 'Azerbaijan', name_de: 'Aserbaidschan' },
  { id: 'nigeria', name_nl: 'Nigeria', name_en: 'Nigeria', name_de: 'Nigeria' },
  { id: 'ethiopie', name_nl: 'Ethiopië', name_en: 'Ethiopia', name_de: 'Äthiopien' },
  { id: 'tanzania', name_nl: 'Tanzania', name_en: 'Tanzania', name_de: 'Tansania' },
  { id: 'oeganda', name_nl: 'Oeganda', name_en: 'Uganda', name_de: 'Uganda' },
  { id: 'ghana', name_nl: 'Ghana', name_en: 'Ghana', name_de: 'Ghana' },
  { id: 'senegal', name_nl: 'Senegal', name_en: 'Senegal', name_de: 'Senegal' },
  { id: 'algerije', name_nl: 'Algerije', name_en: 'Algeria', name_de: 'Algerien' },
  { id: 'libie', name_nl: 'Libië', name_en: 'Libya', name_de: 'Libyen' },
  { id: 'australie', name_nl: 'Australië', name_en: 'Australia', name_de: 'Australien' },
  { id: 'nieuw-zeeland', name_nl: 'Nieuw-Zeeland', name_en: 'New Zealand', name_de: 'Neuseeland' },
];

function normalize(str) {
  return String(str)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents (combining diacritical marks)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(the|de|het|republic of|republiek|kingdom of|koninkrijk van)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getCountryById(id) {
  return COUNTRIES.find((c) => c.id === id) || null;
}

// Finds the country in COUNTRIES whose nl/en/de name or aliases best match
// an arbitrary free-text name coming from an external source. Returns null
// when nothing matches closely enough to be trustworthy.
function matchCountryName(externalName) {
  if (!externalName) return null;
  const target = normalize(externalName);
  if (!target) return null;

  for (const country of COUNTRIES) {
    const candidates = [country.name_nl, country.name_en, country.name_de, ...(country.aliases || [])];
    for (const candidate of candidates) {
      if (normalize(candidate) === target) return country;
    }
  }
  return null;
}

module.exports = { COUNTRIES, normalize, getCountryById, matchCountryName };
