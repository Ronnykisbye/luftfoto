# Luftfoto Arkivet Pro

Version 2 af en GitHub Pages-klar app til historiske luftfotos.

## Hvad er forbedret i v2?

- Bedre filopdeling.
- Bedre klassisk arkivdesign.
- Demo-fallback, så appen stadig kan vises, hvis live API ikke svarer i browseren.
- Intern QA-knap.
- JSON- og CSV-eksport.
- Favoritter via LocalStorage.
- Kort-link til koordinater.
- Mere robust læsning af KB-metadata.
- PWA manifest.

## Upload til GitHub Pages

1. Pak zip-filen ud.
2. Upload alle filer til roden af et GitHub repository.
3. Gå til Settings → Pages.
4. Vælg branch `main` og `/root`.
5. Gem.

## Vigtige datakilder

- Det Kgl. Bibliotek API: `https://api.kb.dk/data/rest/api/dsfl`
- Danmark set fra luften: `https://www.kb.dk/danmarksetfraluften/`
- Adresse/geokodning: DAWA og OpenStreetMap/Nominatim.

## Kendt begrænsning

KB kan i nogle tilfælde vise billeder via egen viewer frem for direkte billed-URL. Derfor åbner appen sikkert resultatet hos KB.
