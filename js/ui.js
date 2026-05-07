/* AFSNIT 01 – UI */

const Ui = {

  init() {

    this.el = {

      form: document.getElementById("searchForm"),
      place: document.getElementById("placeInput"),
      year: document.getElementById("yearInput"),
      radius: document.getElementById("radiusInput"),
      limit: document.getElementById("limitInput"),

      status: document.getElementById("status"),
      summary: document.getElementById("resultSummary"),
      results: document.getElementById("results"),
      timeline: document.getElementById("timeline"),
      qa: document.getElementById("qaOutput"),

      mode: document.getElementById("modeBadge"),
      source: document.getElementById("sourcePill"),

      json: document.getElementById("jsonBtn"),
      csv: document.getElementById("csvBtn"),

      clear: document.getElementById("clearBtn"),
      qaBtn: document.getElementById("qaBtn"),

      theme: document.getElementById("themeToggle"),

      moselund: document.getElementById("moselundBtn"),
      vesterbro: document.getElementById("vesterbroBtn")

    };

  },

  status(msg) {

    this.el.status.textContent = msg;

  },

  mode(msg) {

    this.el.mode.textContent = msg;

    this.el.source.textContent =
      `Tilstand: ${msg}`;

  },

  loading(on) {

    const btn =
      this.el.form.querySelector(
        "button[type='submit']"
      );

    btn.textContent =
      on
        ? "Søger..."
        : "Find luftfotos";

    btn.disabled = on;

  },

  // VIGTIG RETTELSE:
  // Tidligere resultater ryddes før ny søgning
  resetBeforeSearch() {

    this.el.results.innerHTML = `
      <div class="empty">
        Søger… tidligere resultater er ryddet.
      </div>
    `;

    this.el.timeline.innerHTML = "";

    this.el.summary.textContent =
      "Søger...";

    this.el.qa.hidden = true;

    this.el.json.disabled = true;
    this.el.csv.disabled = true;

  }

};
