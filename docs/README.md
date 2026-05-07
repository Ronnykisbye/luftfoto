# Luftfoto Arkivet Pro v5

## Hovedrettelse

v5 retter problemet med `Failed to fetch`.

Appen gør nu dette:

1. Søger først direkte i KB API.
2. Hvis browseren blokerer kaldet, prøver appen CORS-fallback.
3. Hvis begge fejler, vises fejl.
4. Demo-data vises aldrig i normal søgning.

## Vigtigt

Normal søgning bruger kun live-data.

Demo-data bruges kun ved disse knapper:

- Demo: Moselundsvej 1950
- Demo: Vesterbro 1950

## Test

Efter upload:

1. Tryk `Ctrl + Shift + R`.
2. Tjek at topbaren siger `Luftfoto Arkivet Pro v5`.
3. Søg på `Odense Havn`.
4. Tjek at der ikke står `Demo`.
5. Tjek at der ikke vises Vesterbro eller Helsingør.
6. Tryk `Kør intern QA-test`.

## Hvis den stadig fejler

Så er både direkte KB-kald og proxy-kald blokeret.
Næste løsning er en lille backend/proxy via fx:

- Cloudflare Worker
- Vercel Function
- Netlify Function
