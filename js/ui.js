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
      api: document.getElementById("apiBtn"),
      clear: document.getElementById("clearBtn"),
      qaBtn: document.getElementById("qaBtn"),
      theme: document.getElementById("themeToggle"),

      moselund: document.getElementById("moselundBtn"),
      vesterbro: document.getElementById("vesterbroBtn")
    };
  },

  status(message) {
    this.el.status.textContent = message;
  },

  mode(message) {
    this.el.mode.textContent = message;
    this.el.source.textContent = `Tilstand: ${message}`;
  },

  loading(isLoading) {
    const button = this.el.form.querySelector("button[type='submit']");

    button.textContent = isLoading ? "Søger..." : "Find luftfotos";
    button.disabled = isLoading;
  },

  resetBeforeSearch() {
    this.el.results.innerHTML = `
      <div class="empty">
        Søger… tidligere resultater er ryddet.
      </div>
    `;

    this.el.timeline.innerHTML = "";
    this.el.summary.textContent = "Søger...";
    this.el.qa.hidden = true;

    this.el.json.disabled = true;
    this.el.csv.disabled = true;
    this.el.api.disabled = true;
  },

  empty(message) {
    this.el.results.innerHTML = `
      <div class="empty">
        ${Utils.esc(message)}
      </div>
    `;

    this.el.timeline.innerHTML = "";
    this.el.summary.textContent = "Ingen resultater.";

    this.el.json.disabled = true;
    this.el.csv.disabled = true;
  },

  render(items, context) {
    const shown = items.slice(0, context.limit);

    this.el.summary.textContent =
      `${items.length} fundet. Viser ${shown.length}. Søgning: ${context.place.label}, cirka ${context.targetYear}.`;

    this.el.timeline.innerHTML =
      Scoring.timeline(items)
        .map(item => `
          <span class="year-chip">
            ${item.year}: ${item.count}
          </span>
        `)
        .join("");

    this.el.results.innerHTML =
      shown.length
        ? shown.map(item => this.card(item)).join("")
        : `
          <div class="empty">
            Ingen resultater i dette område. Prøv større radius eller andet årstal.
          </div>
        `;

    this.el.json.disabled = !items.length;
    this.el.csv.disabled = !items.length;
    this.el.api.disabled = !context.apiUrl;
  },

  card(item) {
    const image =
      item.imageUrl
        ? `<img src="${Utils.esc(item.imageUrl)}" alt="Luftfoto">`
        : `
          <div class="placeholder">
            Historisk luftfoto<br>
            <small>${Utils.esc(item.id)}</small>
          </div>
        `;

    const year =
      Number.isFinite(item.year)
        ? item.year
        : "ukendt år";

    return `
      <article class="card">
        <div class="thumb">
          ${image}
        </div>

        <div class="card__body">
          <h3>${Utils.esc(item.title)}</h3>

          <div class="badges">
            <span class="badge">📅 ${Utils.esc(year)}</span>
            <span class="badge">🎯 ${Utils.esc(item.yearDelta)} år</span>
            <span class="badge">📍 ${Utils.esc(Utils.meters(item.distance))}</span>
          </div>

          <div class="meta">
            <span><strong>Sted:</strong> ${Utils.esc(item.place || "ukendt")}</span>
            <span><strong>Type:</strong> ${Utils.esc(item.imageType || "luftfoto")}</span>
            <span><strong>Ophav:</strong> ${Utils.esc(item.origin || "ukendt")}</span>
            <span><strong>ID:</strong> ${Utils.esc(item.id)}</span>
          </div>

          <div class="actions">
            <a href="${Utils.esc(item.viewerLink)}" target="_blank" rel="noreferrer">Åbn KB</a>
            <a class="light" href="${Utils.esc(item.src || item.imageUrl || item.viewerLink)}" target="_blank" rel="noreferrer">Åbn billede</a>
            <a class="light" href="${Utils.esc(Utils.mapLink(item))}" target="_blank" rel="noreferrer">Kort</a>
            <button class="light" onclick="App.toggleFavorite('${Utils.esc(item.id)}')" type="button">★ Favorit</button>
          </div>
        </div>
      </article>
    `;
  },

  qaReport(lines) {
    this.el.qa.hidden = false;

    this.el.qa.innerHTML =
      lines
        .map(line => `
          <div class="${line.ok ? "ok" : "warn"}">
            ${line.ok ? "✅" : "⚠️"} ${Utils.esc(line.text)}
          </div>
        `)
        .join("");
  },

  theme() {
    const current = document.documentElement.dataset.theme || "archive";
    const next = current === "archive" ? "night" : "archive";

    document.documentElement.dataset.theme = next;
    localStorage.setItem("luftfoto-theme", next);
  },

  savedTheme() {
    document.documentElement.dataset.theme =
      localStorage.getItem("luftfoto-theme") || "archive";
  }
};
