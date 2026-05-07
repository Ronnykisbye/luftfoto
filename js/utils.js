/* AFSNIT 01 – Hjælpefunktioner */
const Utils = {
  clamp:(v,min,max)=>Math.min(Math.max(v,min),max),
  num:v=>{const n=Number(v);return Number.isFinite(n)?n:null},
  esc:v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"),
  yearFrom:v=>{const m=String(v??"").match(/\b(18|19|20)\d{2}\b/);return m?Number(m[0]):null},
  meters:m=>!Number.isFinite(m)?"ukendt":m<1000?`${Math.round(m)} m`:`${(m/1000).toFixed(1).replace(".",",")} km`,
  haversine(a,b){if(!a||!b)return Infinity;const R=6371000,rad=x=>x*Math.PI/180,dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon),lat1=rad(a.lat),lat2=rad(b.lat);const x=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;return 2*R*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));},
  bbox(center,r){const earth=6378137,dLat=(r/earth)*(180/Math.PI),dLon=(r/(earth*Math.cos(Math.PI*center.lat/180)))*(180/Math.PI);return{west:center.lon-dLon,north:center.lat+dLat,east:center.lon+dLon,south:center.lat-dLat}},
  qs(obj){const u=new URLSearchParams();Object.entries(obj).forEach(([k,v])=>{if(v!==undefined&&v!==null&&v!=="")u.set(k,v)});return u.toString()},
  saveFile(name,text,type="text/plain"){const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)},
  csv(rows){const cols=["id","title","year","place","distance","yearDelta","viewerLink"];const q=v=>`"${String(v??"").replaceAll('"','""')}"`;return [cols.join(";"),...rows.map(r=>cols.map(c=>q(r[c])).join(";"))].join("\n")},
  mapLink(item){return Number.isFinite(item.lat)&&Number.isFinite(item.lon)?`https://www.openstreetmap.org/?mlat=${item.lat}&mlon=${item.lon}#map=16/${item.lat}/${item.lon}`:"https://www.openstreetmap.org/"}
};
