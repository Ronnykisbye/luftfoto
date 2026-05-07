/* AFSNIT 01 – API og geokodning */

const Api = {
  async geocodePlace(query) {
    const clean = String(query || "").trim();

    if (!clean) {
      throw new Error("Skriv en adresse eller et sted.");
    }

    // AFSNIT 01.1 – Først DAWA, bedst til rigtige danske adresser
    const dawaHit = await this.geocodeDawa(clean);

    if (dawaHit) {
      return dawaHit;
    }

    // AFSNIT 01.2 – Derefter OpenStreetMap, bedst til steder som havne, parker og bydele
    const nominatimHit = await this.geocodeNominatim(clean);

    if (nominatimHit) {
      return nominatimHit;
    }

    throw new Error(
      "Stedet blev ikke fundet. Prøv fx bynavn, vejnavn + by eller et mere kendt stednavn."
    );
  },

  async geocodeDawa(query) {
    const endpoints = [
      APP_CONFIG.dawaAdresseUrl,
      APP_CONFIG.dawaAdgangUrl
    ];

    for (const baseUrl of endpoints) {
      try {
        const url = `${baseUrl}?${Utils.qs({
          q: query,
          struktur: "mini",
          per_side: 1
        })}`;

        const response = await fetch(url, {
          headers: { Accept: "application/json" },
          cache: "no-store"
        });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const hit = Array.isArray(data) ? data[0] : null;

        if (hit?.x && hit?.y) {
          return {
            label: hit.betegnelse || query,
            lat: Number(hit.y),
            lon: Number(hit.x),
            source: baseUrl.includes("adgang")
              ? "DAWA adgangsadresse"
              : "DAWA adresse"
          };
        }
      } catch (error) {
        console.warn("DAWA-fejl:", error);
      }
    }

    return null;
  },

  async geocodeNominatim(query) {
    try {
      const searchText = `${query} Denmark`;

      const url = `${APP_CONFIG.nominatimUrl}?${Utils.qs({
        q: searchText,
        format: "jsonv2",
        limit: 1,
        addressdetails: 1
      })}`;

      const response = await fetch(url, {
        headers: {
          Accept: "application/json"
        },
        cache: "no-store"
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const hit = Array.isArray(data) ? data[0] : null;

      if (!hit?.lat || !hit?.lon) {
        return null;
      }

      return {
        label: hit.display_name || query,
        lat: Number(hit.lat),
        lon: Number(hit.lon),
        source: "OpenStreetMap/Nominatim"
      };
    } catch (error) {
      console.warn("Nominatim-fejl:", error);
      return null;
    }
  },

  async searchKb(center, radiusMeters) {
    const radius = Utils.clamp(
      radiusMeters,
      50,
      APP_CONFIG.maxRadiusMeters
    );

    const box = Utils.bbox(center, radius);

    const bbo = [
      box.west,
      box.north,
      box.east,
      box.south
    ].join(",");

    const apiUrl = `${APP_CONFIG.kbApiBase}?${Utils.qs({
      bbo,
      itemsPerPage: APP_CONFIG.itemsPerPage
    })}`;

    const response = await fetch(apiUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`KB API-fejl ${response.status}`);
    }

    const data = await response.json();

    return {
      apiUrl,
      transport: "Direkte KB",
      items: this.normalizeKbResponse(data, center, apiUrl)
    };
  },

  normalizeKbResponse(data, center, apiUrl) {
    const rawItems =
      Array.isArray(data)
        ? data
        : data?.features ||
          data?.items ||
          data?.records ||
          data?.response?.docs ||
          data?.result ||
          data?.data ||
          [];

    return rawItems.map((item, index) => {
      const props = item?.properties || {};
      const geometry = item?.geometry || {};

      const coords = Array.isArray(geometry.coordinates)
        ? geometry.coordinates
        : [];

      const lonFromGeoJson = Utils.num(coords[0]);
      const latFromGeoJson = Utils.num(coords[1]);

      const flat = this.flattenObject(item);

      const id =
        this.getFirst(flat, [
          "properties.id",
          "properties.identifier",
          "id",
          "identifier",
          "recordID",
          "PID",
          "pid",
          "kbId"
        ]) ||
        this.extractIdFromUrl(props.src || props.thumbnail || "") ||
        `KB-${index + 1}`;

      const title =
        props.name ||
        this.getFirst(flat, [
          "properties.name",
          "title",
          "Titel",
          "dc:title",
          "label",
          "name"
        ]) ||
        id;

      const yearText =
        props.subjectCreationDate ||
        props.recordCreationDate ||
        this.getFirst(flat, [
          "properties.subjectCreationDate",
          "subjectCreationDate",
          "year",
          "date",
          "created",
          "temporal"
        ]) ||
        "";

      const year =
        Utils.num(yearText) ||
        Utils.yearFrom(`${title} ${yearText}`);

      const lat =
        latFromGeoJson ??
        Utils.num(
          this.getFirst(flat, [
            "lat",
            "latitude",
            "wgs84_lat",
            "y"
          ])
        );

      const lon =
        lonFromGeoJson ??
        Utils.num(
          this.getFirst(flat, [
            "lon",
            "lng",
            "longitude",
            "wgs84_lon",
            "x"
          ])
        );

      const distance =
        Number.isFinite(lat) && Number.isFinite(lon)
          ? Utils.haversine(center, { lat, lon })
          : Infinity;

      const src =
        props.src ||
        this.getFirst(flat, [
          "properties.src",
          "src"
        ]) ||
        "";

      const thumbnail =
        props.thumbnail ||
        this.getFirst(flat, [
          "properties.thumbnail",
          "thumbnail"
        ]) ||
        "";

      const imageUrl = thumbnail || src || "";

      const viewerLink =
        props.url ||
        props.link ||
        this.getFirst(flat, [
          "properties.url",
          "properties.link"
        ]) ||
        APP_CONFIG.kbViewerBase;

      return {
        id: String(id),
        title: String(title).trim() || String(id),
        year,
        yearText: String(yearText || ""),
        place: String(props.geographic || ""),
        origin: "Det Kgl. Bibliotek",
        imageType: String(props.genre || "Luftfoto"),
        lat,
        lon,
        distance,
        viewerLink,
        imageUrl,
        src,
        thumbnail,
        apiUrl,
        raw: item
      };
    });
  },

  getFirst(flat, keys) {
    for (const key of keys) {
      const value = flat[key];

      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }

    const lowerMap = new Map(
      Object.entries(flat).map(([key, value]) => [
        key.toLowerCase(),
        value
      ])
    );

    for (const key of keys) {
      const value = lowerMap.get(String(key).toLowerCase());

      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }

    return null;
  },

  extractIdFromUrl(url) {
    const text = String(url || "");
    const match = text.match(/\/([^\/]+?)\/full\//);

    return match ? match[1] : "";
  },

  flattenObject(obj, prefix = "", out = {}) {
    if (obj === null || obj === undefined) {
      return out;
    }

    if (typeof obj !== "object") {
      out[prefix] = obj;
      return out;
    }

    if (Array.isArray(obj)) {
      obj.forEach((value, index) => {
        this.flattenObject(value, `${prefix}[${index}]`, out);
      });

      return out;
    }

    Object.entries(obj).forEach(([key, value]) => {
      const nextKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === "object") {
        this.flattenObject(value, nextKey, out);
      } else {
        out[nextKey] = value;
      }
    });

    return out;
  }
};
