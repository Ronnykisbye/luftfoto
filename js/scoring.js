/* AFSNIT 01 – Ranking */
const Scoring = {
  rank(items, targetYear, center){
    return items.map(x=>{
      const distance=Number.isFinite(x.distance)?x.distance:(Number.isFinite(x.lat)&&Number.isFinite(x.lon)?Utils.haversine(center,x):Infinity);
      const yearDelta=Number.isFinite(x.year)?Math.abs(x.year-targetYear):999;
      const score=yearDelta*10+(Number.isFinite(distance)?distance/1000:200);
      return {...x,distance,yearDelta,score};
    }).sort((a,b)=>a.score-b.score);
  },
  timeline(items){
    const counts={};
    items.forEach(x=>{if(Number.isFinite(x.year))counts[x.year]=(counts[x.year]||0)+1});
    return Object.entries(counts).sort((a,b)=>Number(a[0])-Number(b[0])).map(([year,count])=>({year,count}));
  }
};
