# Reisadviezenchecker

Vergelijkt voor een gekozen land de reisadviezen van vijf overheden naast
elkaar: Nederland, Duitsland, België, het Verenigd Koninkrijk en de
Verenigde Staten. Je klikt links een land aan en ziet rechts per bron de
kleurcode/fase/niveau, de laatste wijzigingsdatum en een korte samenvatting,
met een link naar de originele pagina.

Er zijn twee versies in deze repository:

1. **`docs/index.html`** — werkt volledig in de browser, zonder installatie.
   Dit is de makkelijkste optie als je niets op je laptop mag/kan
   installeren. Zie "Zonder installatie gebruiken" hieronder. Nadeel:
   sommige overheidssites blokkeren rechtstreekse verbindingen vanuit een
   browser (CORS-beveiliging), waardoor die kaart dan "kon niet automatisch
   worden opgehaald" toont in plaats van de gegevens zelf. Voor die landen
   werkt de link op de kaart altijd wel.
2. **`server/` + `public/`** — een Node.js-app die dezelfde gegevens ophaalt
   via een server, waardoor CORS geen probleem is en alle bronnen
   betrouwbaarder werken. Vereist dat iemand `npm install && npm start`
   draait (zie "Met server draaien" hieronder) — handig om aan IT te vragen.

## Zonder installatie gebruiken (aanbevolen als je niets mag installeren)

**Optie A — meteen openen:** dubbelklik op `docs/index.html`. Die opent in je
browser en werkt direct (in de meeste browsers; sommige browsers blokkeren
uit voorzorg extra streng wanneer een bestand rechtstreeks vanaf schijf wordt
geopend, dan werkt optie B beter).

**Optie B — een echte link om te bookmarken (eenmalig instellen):**
1. Ga naar de GitHub-pagina van deze repository, tabblad **Settings**.
2. Ga naar **Pages** (linkermenu).
3. Bij "Build and deployment" → **Source**: kies **Deploy from a branch**.
4. Kies de branch `claude/logius-overhead-costs-owh4os` (of `main` zodra dit
   daar staat) en map **/docs**. Klik **Save**.
5. Na ongeveer een minuut verschijnt bovenaan een link zoals
   `https://rinsesje.github.io/reisadviezenchecker/`. Die kun je bookmarken —
   vanaf dan is het gewoon een website die je opent zoals elke andere.

Dit is een eenmalige instelling van 3 klikken; er komt geen terminal of
installatie aan te pas.

## Met server draaien (betrouwbaarder, vraagt iets van IT)

```bash
npm install
npm start
```

Open daarna `http://localhost:3000`.

## Hoe de data wordt opgehaald

| Bron | Methode | Betrouwbaarheid |
|---|---|---|
| 🇳🇱 Nederland | Officiële open-data API (`opendata.nederlandwereldwijd.nl`) | Hoog |
| 🇩🇪 Duitsland | Officiële open-data API van het Auswärtiges Amt (`/opendata/travelwarning`) | Hoog |
| 🇬🇧 VK | GOV.UK Content API + Search API (dynamische opzoeking van de juiste pagina) | Hoog |
| 🇺🇸 VS | Officiële RSS-feed van travel.state.gov | Hoog |
| 🇧🇪 België | **Scraping** van diplomatie.belgium.be (geen officiële API/feed gevonden) | Laag — gebruik altijd de link om te verifiëren |

Elke kaart toont altijd een link naar de originele bron. Als een bron niet kan
worden opgehaald of geen betrouwbaar antwoord geeft, wordt dat expliciet
getoond (status "niet gevonden" / foutmelding) — de tool verzint nooit een
kleurcode of datum die niet écht is teruggevonden.

## Belangrijke kanttekening over betrouwbaarheid

Dit is gebouwd in een omgeving zonder internettoegang tot de genoemde
overheidswebsites, dus de exacte JSON/HTML-structuur van elke bron kon niet
live worden getest. De veldnamen voor Duitsland zijn geverifieerd via de
officiële gegenereerde API-client (`de-travelwarning` op PyPI, gebaseerd op
de OpenAPI-specificatie van bund.dev). Voor Nederland, het VK en de VS is
uitgegaan van gedocumenteerde/bekende structuren, met defensieve parsing die
expliciet "fout"/"niet gevonden" teruggeeft in plaats van te gokken als het
niet klopt. **Test de tool na het opstarten op een paar landen die je goed
kent, en vergelijk de uitkomst met de bron-link op de kaart, voordat je erop
vertrouwt.** Als een bron structureel fouten geeft, is de kans groot dat de
site iets is veranderd — meld dat dan, dan passen we de parser aan.

## Land toevoegen

Landen staan in `server/countries.js` met hun naam in het Nederlands, Engels
en Duits (nodig om te matchen met de bronnen). Voeg een land toe aan die
lijst; er is verder geen configuratie per bron nodig, behalve voor België
waar het land ook echt in de Belgische landenlijst moet voorkomen.
