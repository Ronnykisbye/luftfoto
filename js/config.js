/* AFSNIT 01 – Konfiguration */

window.APP_CONFIG = {
  kbApiBase: "https://api.kb.dk/data/rest/api/dsfl",
  kbViewerBase: "https://www.kb.dk/danmarksetfraluften/",

  dawaAdresseUrl: "https://api.dataforsyningen.dk/adresser",
  dawaAdgangUrl: "https://api.dataforsyningen.dk/adgangsadresser",
  nominatimUrl: "https://nominatim.openstreetmap.org/search",

  itemsPerPage: 500,
  maxRadiusMeters: 20000,

  // Demo-data må aldrig bruges ved normal søgning
  useDemoFallbackForNormalSearch: false,

  // CORS fallback hvis browseren blokerer KB direkte
  corsProxyPrefix: "https://api.allorigins.win/raw?url="
};
