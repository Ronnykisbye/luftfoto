/* AFSNIT 01 – API og metadata-normalisering */
const Api = {
  async geocodePlace(query){
    const clean=String(query||"").trim();
    if(!clean)throw new Error("Skriv en adresse eller et sted.");
    return await this.geocodeDawa(clean) || await this.geocodeNominatim(clean) || this.smartDemoGeocode(clean);
  },
  smartDemoGeocode(q){
    const t=q.toLowerCase();
    if(t.includes("vesterbro"))return{label:"Vesterbro, København",lat:55.667,lon:12.548,source:"Demo-koordinat"};
    if(t.includes("moselund")||t.includes("helsingør"))return{label:"Moselundsvej/Helsingør",lat:56.04003,lon:12.56389,source:"Demo-koordinat"};
    throw new Error("Stedet blev ikke fundet. Prøv mere præcist eller brug en demo-knap.");
  },
  async geocodeDawa(q){
    for(const base of [APP_CONFIG.dawaAdresseUrl,APP_CONFIG.dawaAdgangUrl]){
      try{
        const url=`${base}?${Utils.qs({q, struktur:"mini", per_side:1})}`;
        const r=await fetch(url); if(!r.ok)continue;
        const d=await r.json(); const h=d?.[0];
        if(h?.x&&h?.y)return{label:h.betegnelse||q,lat:Number(h.y),lon:Number(h.x),source:base.includes("adgang")?"DAWA adgangsadresse":"DAWA adresse"};
      }catch(e){console.warn("DAWA fejl",e)}
    }
    return null;
  },
  async geocodeNominatim(q){
    try{
      const url=`${APP_CONFIG.nominatimUrl}?${Utils.qs({q:`${q}, Denmark`,format:"jsonv2",limit:1,addressdetails:1})}`;
      const r=await fetch(url,{headers:{Accept:"application/json"}}); if(!r.ok)return null;
      const d=await r.json(); const h=d?.[0]; if(!h?.lat||!h?.lon)return null;
      return{label:h.display_name||q,lat:Number(h.lat),lon:Number(h.lon),source:"OpenStreetMap/Nominatim"};
    }catch(e){console.warn("Nominatim fejl",e);return null}
  },
  async searchKb(center,radius){
    const b=Utils.bbox(center,Utils.clamp(radius,50,APP_CONFIG.maxRadiusMeters));
    const bbo=[b.west,b.north,b.east,b.south].join(",");
    const url=`${APP_CONFIG.kbApiBase}?${Utils.qs({bbo,itemsPerPage:APP_CONFIG.itemsPerPage})}`;
    const r=await fetch(url,{headers:{Accept:"application/json"}});
    if(!r.ok)throw new Error(`KB API-fejl ${r.status}`);
    return this.normalize(await r.json(),center,url);
  },
  normalize(data,center,apiUrl){
    const raw=Array.isArray(data)?data:data?.items||data?.records||data?.response?.docs||data?.result||data?.data||[];
    return raw.map((item,i)=>{
      const f=this.flat(item), get=(keys)=>this.get(f,keys);
      const id=get(["id","identifier","recordID","pid","PID","kbId"])||`KB-${i+1}`;
      const title=get(["title","Titel","dc:title","label","name"])||id;
      const yearText=get(["year","aar","År","date","created","dcterms:created","temporal","time"])||"";
      const year=Utils.num(yearText)||Utils.yearFrom(`${title} ${yearText} ${JSON.stringify(item).slice(0,600)}`);
      const lat=Utils.num(get(["lat","latitude","wgs84_lat","y"]));
      const lon=Utils.num(get(["lon","lng","longitude","wgs84_lon","x"]));
      const links=Object.values(f).filter(v=>typeof v==="string"&&/^https?:\/\//i.test(v));
      const imageUrl=links.find(v=>/\.(jpg|jpeg|png|webp)(\?|$)/i.test(v))||"";
      const viewerLink=links.find(v=>v.includes("danmarksetfraluften"))||links.find(v=>v.includes("kb.dk"))||APP_CONFIG.kbViewerBase;
      return {id:String(id),title:String(title),year,yearText:String(yearText||""),place:String(get(["place","sted","Sted","locality","city","By"])||""),origin:String(get(["creator","ophav","Ophav","photographer"])||"Det Kgl. Bibliotek"),imageType:String(get(["type","billedtype","Billedtype","format"])||"Luftfoto"),lat,lon,distance:Number.isFinite(lat)&&Number.isFinite(lon)?Utils.haversine(center,{lat,lon}):Infinity,viewerLink,imageUrl,apiUrl,raw:item};
    });
  },
  get(f,keys){
    const low=new Map(Object.entries(f).map(([k,v])=>[k.toLowerCase(),v]));
    for(const k of keys){if(f[k]!==undefined&&f[k]!==null&&f[k]!=="")return f[k];const v=low.get(String(k).toLowerCase());if(v!==undefined&&v!==null&&v!=="")return v}
    for(const k of keys){const n=String(k).toLowerCase();const hit=Object.entries(f).find(([fk,v])=>fk.toLowerCase().includes(n)&&v!==undefined&&v!==null&&v!=="");if(hit)return hit[1]}
    return null;
  },
  flat(obj,p="",out={}){
    if(obj==null)return out;
    if(typeof obj!=="object"){out[p]=obj;return out}
    if(Array.isArray(obj)){obj.forEach((v,i)=>this.flat(v,`${p}[${i}]`,out));return out}
    Object.entries(obj).forEach(([k,v])=>{const nk=p?`${p}.${k}`:k;v&&typeof v==="object"?this.flat(v,nk,out):out[nk]=v});
    return out;
  }
};
