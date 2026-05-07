# Luftfoto Arkivet Pro v3

## Rettet fejl

I v2 kunne demo-fallback vise gamle demo-resultater
fra fx Vesterbro, selv om man søgte på et andet sted.

Det er rettet i v3:

- Almindelige søgninger bruger kun live KB-resultater.
- Demo-data bruges kun ved demo-knapperne.
- Tidligere resultater ryddes før ny søgning.
- Hvis KB ikke svarer, vises en fejl i stedet for falske demo-resultater.
- Resultater filtreres bedre efter radius.
