/* AFSNIT 01 – Ranking og filtrering */
const Scoring = {
  rank(items, targetYear, center, radius) {
    return items
      .map(item => {
        const distance =
          Number.isFinite(item.distance)
            ? item.distance
            : (
                Number.isFinite(item.lat) &&
                Number.isFinite(item.lon)
              )
                ? Utils.haversine(center, item)
                : Infinity;

        const yearDelta =
          Number.isFinite(item.year)
            ? Math.abs(item.year - targetYear)
            : 999;

        const score =
          yearDelta * 10 +
          (
            Number.isFinite(distance)
              ? distance / 1000
              : 200
          );

        return {
          ...item,
          distance,
          yearDelta,
          score
        };
      })

      .filter(item => {
        return (
          !Number.isFinite(item.distance) ||
          item.distance <= radius * 1.25
        );
      })

      .sort((a, b) => a.score - b.score);
  },

  timeline(items) {
    const counts = {};

    items.forEach(item => {
      if (Number.isFinite(item.year)) {
        counts[item.year] = (counts[item.year] || 0) + 1;
      }
    });

    return Object
      .entries(counts)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([year, count]) => ({ year, count }));
  }
};
