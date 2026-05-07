/* AFSNIT 01 – App-controller */

const App = {

  results: [],
  ctx: null,

  init() {

    Ui.init();

    Ui.savedTheme();

    Ui.empty(
      "Vælg en demo eller skriv en live-søgning."
    );

    Ui.mode("Klar");

    Ui.el.form.addEventListener(
      "submit",
      e => {

        e.preventDefault();

        this.searchLive();

      }
    );

    Ui.el.moselund.addEventListener(
      "click",
      () => this.searchDemo(
        "Moselundsvej Helsingør",
        1950,
        1500,
        "helsingør"
      )
    );

    Ui.el.vesterbro.addEventListener(
      "click",
      () => this.searchDemo(
        "Vesterbro København",
        1950,
        1500,
        "vesterbro"
      )
    );

  },

  // VIGTIG RETTELSE:
  // Normal søgning bruger KUN live-data
  async searchLive() {

    const q =
      Ui.el.place.value.trim();

    const targetYear =
      Number(Ui.el.year.value);

    const radius =
      Number(Ui.el.radius.value);

    const limit =
      Number(Ui.el.limit.value);

    if (!q || !Number.isFinite(targetYear)) {

      Ui.status(
        "Udfyld sted og årstal."
      );

      return;

    }

    // Ryd ALT først
    this.results = [];
    this.ctx = null;

    Ui.resetBeforeSearch();

    Ui.loading(true);

    Ui.mode("Live KB");

    Ui.status("Finder sted...");

    try {

      const place =
        await Api.geocodePlace(q);

      Ui.status(
        `Sted fundet via ${place.source}`
      );

      // KUN live-data
      const items =
        await Api.searchKb(
          place,
          radius
        );

      this.results =
        Scoring.rank(
          items,
          targetYear,
          place,
          radius
        );

      this.ctx = {
        place,
        targetYear,
        radius,
        limit,
        query: q,
        mode: "live"
      };

      Ui.render(
        this.results,
        this.ctx
      );

      Ui.status(
        `Færdig. ${this.results.length} live-resultater behandlet.`
      );

    }
    catch (e) {

      console.error(e);

      Ui.mode("Fejl");

      // VIGTIG RETTELSE:
      // Ingen demo-fallback længere
      Ui.empty(`
        Live-søgningen kunne ikke vise sikre KB-resultater.
        Der vises IKKE demo-data.
      `);

      Ui.status(
        "KB API svarede ikke korrekt."
      );

    }
    finally {

      Ui.loading(false);

    }

  },

  // Demo virker KUN via demo-knapper
  async searchDemo(
    q,
    y,
    r,
    keyword
  ) {

    Ui.mode("Demo");

    Ui.status(
      "Viser demo-data."
    );

    const center =
      keyword === "vesterbro"
        ? {
            label: q,
            lat: 55.667,
            lon: 12.548
          }
        : {
            label: q,
            lat: 56.04003,
            lon: 12.56389
          };

    const items =
      DEMO_DATA.filter(x => {

        return (
          `${x.place} ${x.title}`
            .toLowerCase()
            .includes(keyword)
        );

      });

    this.results =
      Scoring.rank(
        items,
        y,
        center,
        r
      );

    this.ctx = {
      place: center,
      targetYear: y,
      radius: r,
      limit: Number(
        Ui.el.limit.value
      ),
      query: q,
      mode: "demo"
    };

    Ui.render(
      this.results,
      this.ctx
    );

  }

};
