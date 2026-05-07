# Luftfoto Arkivet Pro v4

## Hovedrettelse

v4 fjerner den fejl, hvor almindelig søgning kunne vise demo-resultater fra tidligere test.

## Hvad er ændret?

- Normal søgning bruger kun live KB-data.
- Demo-data bruges kun ved demo-knapper.
- Tidligere resultater ryddes altid før ny søgning.
- Hvis KB/API fejler, vises en fejlbesked i stedet for demo-resultater.
- Appen læser KB's GeoJSON-format korrekt:
  - `geometry.coordinates`
  - `properties.subjectCreationDate`
  - `properties.thumbnail`
  - `properties.src`
  - `properties.genre`
  - `properties.geographic`
- Der er tilføjet knap til seneste API-kald.

## Test efter upload

1. Hard refresh: Ctrl + Shift + R.
2. Tjek at topbaren siger `Luftfoto Arkivet Pro v4`.
3. Søg: `Odense Havn`, år `1950`.
4. Der må ikke stå `Demo`.
5. Der må ikke vises Vesterbro eller Helsingør.
6. Tryk `Kør intern QA-test`.
