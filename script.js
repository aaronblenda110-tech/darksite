
const perPage = 6;
let page = 1, allVideos = [], filtered = [];

fetch('./videos.txt').then(r=>r.text()).then(t=>{
  allVideos = t.trim().split('\n').map(l=>{
    const [date,cat,title,src,thumb]=l.split('|');
    return {date:new Date(date),cat,title,src,thumb};
  }).sort((a,b)=>b.date-a.date);
  buildNav();
  applyFilter();
});

function buildNav(){
  const cats=[...new Set(allVideos.map(v=>v.cat))];
  const nav=document.getElementById('nav');
  nav.innerHTML='<a href="#" onclick="filterCat('all')">Home</a>';
  cats.forEach(c=>nav.innerHTML+=`<a href="#" onclick="filterCat('${c}')">${c}</a>`);
}

function filterCat(c){
  filtered = c==='all'?allVideos:allVideos.filter(v=>v.cat===c);
  page=1; render();
}

function applyFilter(){
  filtered=allVideos; render();
}

function render(){
  const list=document.getElementById('video-list');
  list.innerHTML='';
  const start=(page-1)*perPage;
  filtered.slice(start,start+perPage).forEach(v=>{
    list.innerHTML+=`
    <div class="card">
      <a href="player.html?src=${encodeURIComponent(v.src)}&title=${encodeURIComponent(v.title)}">
        <img src="${v.thumb}"><h3>${v.title}</h3>
      </a>
    </div>`;
  });
  paginate();
}

function paginate(){
  const p=document.getElementById('pagination');
  p.innerHTML='';
  const total=Math.ceil(filtered.length/perPage);
  for(let i=1;i<=total;i++){
    p.innerHTML+=`<button onclick="page=${i};render()">${i}</button>`;
  }
}

document.getElementById('search').oninput=e=>{
  const q=e.target.value.toLowerCase();
  filtered=allVideos.filter(v=>v.title.toLowerCase().includes(q));
  page=1; render();
}
