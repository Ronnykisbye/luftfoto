/* AFSNIT 01 – App-controller */
const App = {
  results: [],
  ctx: null,
  lastApiUrl: "",

  init() {
    Ui.init();
    Ui.savedTheme();

    Ui.empty("Skriv en live-søgning eller vælg en demo.");
    Ui.mode("Klar");

    Ui.el.form.addEventListener("submit", event => {
      event.preventDefault();
      this.searchLive();
    });

    Ui.el.theme.addEventListener("click", () => Ui.theme());
    Ui.el.clear.addEventListener("click", () => this.clear());
    Ui.el.qaBtn.addEventListener("click", () => this.qa());

    Ui.el.json.addEventListener("click", () => {
      Utils.saveFile(
        "luftfoto-resultater.json",
        JSON.stringify(
          {
            ctx: this.ctx,
            results: this.results
          },
          null,
          2
        ),
        "application/json"
      );
    });

    Ui.el.csv.addEventListener("click", () => {
      Utils.saveFile(
        "luftfoto-resultater.csv",
        Utils.csv(this.results),
        "text/csv"
      );
    });

    Ui.el.api.addEventListener("click", () => {
      if (this.lastApiUrl) {
        window.open(this.lastApiUrl, "_blank", "noopener,noreferrer");
      }
    });

    Ui.el.moselund.addEventListener("click", () => {
      this.searchDemo(
        "Moselundsvej Helsingør",
        1950,
        1500,
        "helsingør"
      );
    });

    Ui.el.vesterbro.addEventListener("click", () => {
      this.searchDemo(
        "Vesterbro København",
        1950,
        1500,
        "vesterbro"
      );
    });
  },

  async searchLive() {
    const query = Ui.el.place.value.trim();
    const targetYear = Number(Ui.el.year.value);
    const radius = Number(Ui.el.radius.value);
    const limit = Number(Ui.el.limit.value);

    if (!query || !Number.isFinite(targetYear)) {
      Ui.status("Udfyld sted og årstal.");
      return;
    }

    // VIGTIGT:
    // Ryd alt gammelt indhold før hver ny søgning.
    this.results = [];
    this.ctx = null;
    this.lastApiUrl = "";

    Ui.resetBeforeSearch();
    Ui.loading(true);
    Ui.mode("Live KB");
    Ui.status("Finder sted...");

    try {
      const place = await Api.geocodePlace(query);

      Ui.status(
        `Sted fundet via ${place.source}: ${place.label}. Søger hos KB...`
      );

      const kbResult = await Api.searchKb(place, radius);

      this.lastApiUrl = kbResult.apiUrl;

      this.results = Scoring.rank(
        kbResult.items,
        targetYear,
        place,
        radius
      );

      this.ctx = {
        place,
        targetYear,
        radius,
        limit,
        query,
        mode: "live",
        apiUrl: kbResult.apiUrl
      };

      Ui.render(this.results, this.ctx);

      Ui.status(
        `Færdig. ${this.results.length} live-resultater behandlet.`
      );
    }
    catch (error) {
      console.error(error);

      Ui.mode("Fejl");

      Ui.empty(
        `Live-søgningen kunne ikke vise sikre KB-resultater. Der vises ikke demo-data. Fejl: ${error.message || "Ukendt fejl"}`
      );

      Ui.status(
        "Live-søgningen fejlede. Prøv større radius, anden stavning eller åbn KB direkte."
      );
    }
    finally {
      Ui.loading(false);
    }
  },

  searchDemo(query, targetYear, radius, keyword) {
    this.results = [];
    this.ctx = null;
    this.lastApiUrl = "";

    Ui.resetBeforeSearch();
    Ui.mode("Demo");
    Ui.status("Viser demo-data. Dette er ikke en live-søgning.");

    Ui.el.place.value = query;
    Ui.el.year.value = targetYear;
    Ui.el.radius.value = radius;

    const center =
      keyword === "vesterbro"
        ? {
            label: query,
            lat: 55.667,
            lon: 12.548,
            source: "Demo"
          }
        : {
            label: query,
            lat: 56.04003,
            lon: 12.56389,
            source: "Demo"
          };

    const items =
      DEMO_DATA.filter(item =>
        `${item.place} ${item.title}`
          .toLowerCase()
          .includes(keyword)
      );

    this.results = Scoring.rank(
      items,
      targetYear,
      center,
      radius
    );

    this.ctx = {
      place: center,
      targetYear,
      radius,
      limit: Number(Ui.el.limit.value),
      query,
      mode: "demo",
      apiUrl: ""
    };

    Ui.render(this.results, this.ctx);
  },

  clear() {
    this.results = [];
    this.ctx = null;
    this.lastApiUrl = "";

    Ui.mode("Klar");
    Ui.el.qa.hidden = true;
    Ui.empty("Resultater ryddet.");
    Ui.status("Klar.");
  },

  toggleFavorite(id) {
    const key = "luftfoto-favorites";
    const favorites = new Set(
      JSON.parse(localStorage.getItem(key) || "[]")
    );

    if (favorites.has(id)) {
      favorites.delete(id);
    }
    else {
      favorites.add(id);
    }

    localStorage.setItem(
      key,
      JSON.stringify([...favorites])
    );

    Ui.status(`Favoritter opdateret: ${favorites.size}`);
  },

  qa() {
    const lines = [
      {
        ok: document.title.includes("v4"),
        text: "Du kører v4, ikke den gamle demo-fallback-version."
      },
      {
        ok: APP_CONFIG.useDemoFallbackForNormalSearch === false,
        text: "Demo-fallback er slået fra for normal søgning."
      },
      {
        ok: typeof Api.searchKb === "function",
        text: "KB API-funktion findes."
      },
      {
        ok: typeof Api.normalizeKbResponse === "function",
        text: "KB GeoJSON-normalisering findes."
      },
      {
        ok: typeof Scoring.rank === "function",
        text: "Ranking og afstandsfilter findes."
      },
      {
        ok: typeof Ui.resetBeforeSearch === "function",
        text: "Tidligere resultater ryddes før ny søgning."
      },
      {
        ok: Array.isArray(window.DEMO_DATA),
        text: "Demo-data findes, men bruges kun af demo-knapper."
      }
    ];

    Ui.qaReport(lines);
  }
};

document.addEventListener("DOMContentLoaded", () => App.init());
