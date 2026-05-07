/* AFSNIT 01 – UI */
const Ui = {
  init(){
    this.el={
      form:document.getElementById("searchForm"),place:document.getElementById("placeInput"),year:document.getElementById("yearInput"),radius:document.getElementById("radiusInput"),limit:document.getElementById("limitInput"),
      status:document.getElementById("status"),summary:document.getElementById("resultSummary"),results:document.getElementById("results"),timeline:document.getElementById("timeline"),qa:document.getElementById("qaOutput"),
      mode:document.getElementById("modeBadge"),json:document.getElementById("jsonBtn"),csv:document.getElementById("csvBtn"),clear:document.getElementById("clearBtn"),qaBtn:document.getElementById("qaBtn"),theme:document.getElementById("themeToggle"),
      moselund:document.getElementById("moselundBtn"),vesterbro:document.getElementById("vesterbroBtn"),install:document.getElementById("installBtn")
    };
  },
  status(msg){this.el.status.textContent=msg},
  loading(on){this.el.form.querySelector("button[type='submit']").textContent=on?"Søger...":"Find luftfotos";this.el.form.querySelector("button[type='submit']").disabled=on},
  empty(msg){this.el.results.innerHTML=`<div class="empty">${Utils.esc(msg)}</div>`;this.el.timeline.innerHTML="";this.el.summary.textContent="Ingen resultater."},
  render(items,ctx){
    const max=ctx.limit; const shown=items.slice(0,max);
    this.el.summary.textContent=`${items.length} fundet. Viser ${shown.length}. Søgning: ${ctx.place.label}, cirka ${ctx.targetYear}.`;
    this.el.timeline.innerHTML=Scoring.timeline(items).map(x=>`<span class="year-chip">${x.year}: ${x.count}</span>`).join("");
    this.el.results.innerHTML=shown.length?shown.map(x=>this.card(x)).join(""):`<div class="empty">Ingen resultater i denne søgning.</div>`;
    this.el.json.disabled=this.el.csv.disabled=!items.length;
  },
  card(x){
    const img=x.imageUrl?`<img src="${Utils.esc(x.imageUrl)}" alt="Luftfoto">`:`<div class="placeholder">Historisk luftfoto<br><small>${Utils.esc(x.id)}</small></div>`;
    const y=Number.isFinite(x.year)?x.year:"ukendt år";
    return `<article class="card">
      <div class="thumb">${img}</div>
      <div class="card__body">
        <h3>${Utils.esc(x.title)}</h3>
        <div class="badges"><span class="badge">📅 ${Utils.esc(y)}</span><span class="badge">🎯 ${Utils.esc(x.yearDelta)} år</span><span class="badge">📍 ${Utils.esc(Utils.meters(x.distance))}</span></div>
        <div class="meta"><span><strong>Sted:</strong> ${Utils.esc(x.place||"ukendt")}</span><span><strong>Type:</strong> ${Utils.esc(x.imageType||"luftfoto")}</span><span><strong>Ophav:</strong> ${Utils.esc(x.origin||"ukendt")}</span><span><strong>ID:</strong> ${Utils.esc(x.id)}</span></div>
        <div class="actions"><a href="${Utils.esc(x.viewerLink)}" target="_blank" rel="noreferrer">Åbn KB</a><a class="light" href="${Utils.esc(Utils.mapLink(x))}" target="_blank" rel="noreferrer">Kort</a><button class="light" onclick="App.toggleFavorite('${Utils.esc(x.id)}')" type="button">★ Favorit</button></div>
      </div>
    </article>`;
  },
  qaReport(lines){this.el.qa.hidden=false;this.el.qa.innerHTML=lines.map(l=>`<div class="${l.ok?'ok':'warn'}">${l.ok?'✅':'⚠️'} ${Utils.esc(l.text)}</div>`).join("")},
  theme(){const n=(document.documentElement.dataset.theme||"archive")==="archive"?"night":"archive";document.documentElement.dataset.theme=n;localStorage.setItem("luftfoto-theme",n)},
  savedTheme(){document.documentElement.dataset.theme=localStorage.getItem("luftfoto-theme")||"archive"}
};
