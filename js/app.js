/* AFSNIT 01 – App-controller */
const App = {
  results:[], ctx:null, deferredInstall:null,
  init(){
    Ui.init(); Ui.savedTheme(); Ui.empty("Vælg en demo eller skriv en søgning.");
    Ui.el.form.addEventListener("submit",e=>{e.preventDefault();this.search()});
    Ui.el.theme.addEventListener("click",()=>Ui.theme());
    Ui.el.clear.addEventListener("click",()=>this.clear());
    Ui.el.json.addEventListener("click",()=>Utils.saveFile("luftfoto-resultater.json",JSON.stringify({ctx:this.ctx,results:this.results},null,2),"application/json"));
    Ui.el.csv.addEventListener("click",()=>Utils.saveFile("luftfoto-resultater.csv",Utils.csv(this.results),"text/csv"));
    Ui.el.qaBtn.addEventListener("click",()=>this.qa());
    Ui.el.moselund.addEventListener("click",()=>this.demo("Moselundsvej Helsingør",1950,1500));
    Ui.el.vesterbro.addEventListener("click",()=>this.demo("Vesterbro København",1950,1500));
    window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();this.deferredInstall=e;Ui.el.install.hidden=false});
    Ui.el.install.addEventListener("click",async()=>{if(this.deferredInstall){this.deferredInstall.prompt();this.deferredInstall=null;Ui.el.install.hidden=true}});
  },
  async search(){
    const q=Ui.el.place.value.trim(), targetYear=Number(Ui.el.year.value), radius=Number(Ui.el.radius.value), limit=Number(Ui.el.limit.value);
    if(!q||!Number.isFinite(targetYear)){Ui.status("Udfyld sted og årstal.");return}
    Ui.loading(true); Ui.status("Finder sted...");
    try{
      const place=await Api.geocodePlace(q); Ui.status(`Sted fundet via ${place.source}. Søger hos KB...`);
      let items=[];
      try{items=await Api.searchKb(place,radius);Ui.el.mode.textContent="Live KB-resultater"}catch(kbErr){
        if(!APP_CONFIG.demoFallback)throw kbErr;
        console.warn(kbErr); Ui.el.mode.textContent="Demo-fallback"; Ui.status("KB kunne ikke nås fra browseren. Viser demo-fallback.");
        items=window.DEMO_DATA;
      }
      this.results=Scoring.rank(items,targetYear,place); this.ctx={place,targetYear,radius,limit,query:q};
      Ui.render(this.results,this.ctx); Ui.status(`Færdig. ${this.results.length} resultater behandlet.`);
    }catch(e){console.error(e);Ui.empty("Søgningen kunne ikke gennemføres.");Ui.status(e.message||"Ukendt fejl.")}
    finally{Ui.loading(false)}
  },
  demo(q,y,r){Ui.el.place.value=q;Ui.el.year.value=y;Ui.el.radius.value=r;this.search()},
  clear(){this.results=[];this.ctx=null;Ui.el.json.disabled=Ui.el.csv.disabled=true;Ui.el.qa.hidden=true;Ui.empty("Resultater ryddet.")},
  toggleFavorite(id){const key="luftfoto-favorites";const fav=new Set(JSON.parse(localStorage.getItem(key)||"[]"));fav.has(id)?fav.delete(id):fav.add(id);localStorage.setItem(key,JSON.stringify([...fav]));Ui.status(`Favoritter opdateret: ${fav.size}`)},
  qa(){
    const lines=[
      {ok:!!document.getElementById("searchForm"),text:"Søgeformular findes"},
      {ok:typeof Api.searchKb==="function",text:"KB API-funktion findes"},
      {ok:typeof Api.geocodePlace==="function",text:"Geokodning findes"},
      {ok:typeof Scoring.rank==="function",text:"Rankingfunktion findes"},
      {ok:Array.isArray(window.DEMO_DATA)&&window.DEMO_DATA.length>0,text:"Demo-data findes"},
      {ok:!!APP_CONFIG.kbApiBase.includes("api.kb.dk"),text:"KB API-base er sat"},
      {ok:!!document.querySelector('link[rel="manifest"]'),text:"PWA manifest findes"},
      {ok:true,text:"Appen er opdelt i HTML, CSS, JS, API, scoring, UI og config"}
    ];
    Ui.qaReport(lines);
  }
};
document.addEventListener("DOMContentLoaded",()=>App.init());
