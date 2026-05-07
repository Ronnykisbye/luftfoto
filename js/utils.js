/* AFSNIT 01 – Hjælpefunktioner */
const Utils = {
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  num(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  },

  esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  },

  yearFrom(value) {
    const match = String(value ?? "").match(/\b(18|19|20)\d{2}\b/);
    return match ? Number(match[0]) : null;
  },

  meters(value) {
    if (!Number.isFinite(value)) return "ukendt";
    if (value < 1000) return `${Math.round(value)} m`;
    return `${(value / 1000).toFixed(1).replace(".", ",")} km`;
  },

  haversine(a, b) {
    if (!a || !b) return Infinity;

    const R = 6371000;
    const rad = degrees => degrees * Math.PI / 180;

    const dLat = rad(b.lat - a.lat);
    const dLon = rad(b.lon - a.lon);
    const lat1 = rad(a.lat);
    const lat2 = rad(b.lat);

    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  },

  bbox(center, radiusMeters) {
    const earth = 6378137;
    const dLat = (radiusMeters / earth) * (180 / Math.PI);
    const dLon =
      (radiusMeters / (earth * Math.cos(Math.PI * center.lat / 180))) *
      (180 / Math.PI);

    return {
      west: center.lon - dLon,
      north: center.lat + dLat,
      east: center.lon + dLon,
      south: center.lat - dLat
    };
  },

  qs(params) {
    const usp = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        usp.set(key, value);
      }
    });

    return usp.toString();
  },

  saveFile(filename, text, type = "text/plain") {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  },

  csv(rows) {
    const cols = [
      "id",
      "title",
      "year",
      "place",
      "distance",
      "yearDelta",
      "viewerLink",
      "imageUrl"
    ];

    const quote = value =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;

    return [
      cols.join(";"),
      ...rows.map(row =>
        cols.map(col => quote(row[col])).join(";")
      )
    ].join("\n");
  },

  mapLink(item) {
    if (!Number.isFinite(item.lat) || !Number.isFinite(item.lon)) {
      return "https://www.openstreetmap.org/";
    }

    return `https://www.openstreetmap.org/?mlat=${item.lat}&mlon=${item.lon}#map=16/${item.lat}/${item.lon}`;
  }
};
