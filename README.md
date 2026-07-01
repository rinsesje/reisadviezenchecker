# Reisadviezenchecker

Vergelijkt voor een gekozen land de reisadviezen van vijf overheden naast
elkaar: Nederland, Duitsland, België, het Verenigd Koninkrijk en de
Verenigde Staten. Je klikt links een land aan en ziet rechts per bron de
kleurcode/fase/niveau, de laatste wijzigingsdatum en een korte samenvatting,
met een link naar de originele pagina.

## Starten

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
