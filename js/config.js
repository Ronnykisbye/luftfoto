/* AFSNIT 01 – Konfiguration */
window.APP_CONFIG = {
  kbApiBase: "https://api.kb.dk/data/rest/api/dsfl",
  kbViewerBase: "https://www.kb.dk/danmarksetfraluften/",
  dawaAdresseUrl: "https://api.dataforsyningen.dk/adresser",
  dawaAdgangUrl: "https://api.dataforsyningen.dk/adgangsadresser",
  nominatimUrl: "https://nominatim.openstreetmap.org/search",
  itemsPerPage: 500,
  maxRadiusMeters: 10000,

  // VIGTIG RETTELSE:
  // Demo-data må IKKE bruges ved normale søgninger
  useDemoFallbackForNormalSearch: false
};
