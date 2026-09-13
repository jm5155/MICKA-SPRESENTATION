/* ============================================================
   OPERATING SYSTEMS — FULL LESSON DECK ENGINE
   Opening -> Discussion -> Closing, one seamless slide array.
   ============================================================ */

/* ---------------- Discussion content data (unchanged) ---------------- */
const OS_TOPICS = [
{ key:"batch", title:"Batch Operating System",
  def:"Jobs with similar needs are collected into a batch and run one after another with no user interaction during execution — a human only loads the batch and collects results afterward.",
  note:"Jobs queue → CPU runs one at a time → results returned only after the whole batch finishes" },
{ key:"timesharing", title:"Time-Sharing (Multitasking) OS",
  def:"The CPU rapidly switches between multiple users' tasks in tiny time slices, so each user feels like they have the machine to themselves.",
  note:"CPU cycles through each user's slice in rapid rotation — no one waits long" },
{ key:"distributed", title:"Distributed Operating System",
  def:"Multiple independent, networked computers are coordinated so that, to the user, they appear and behave as a single unified system.",
  note:"Independent nodes exchange messages to act as one combined system" },
{ key:"network", title:"Network Operating System",
  def:"Runs on a server and manages users, security, and shared resources — like files and printers — for computers connected to a local network.",
  note:"Server manages accounts and shared resources for every connected client" },
{ key:"rtos", title:"Real-Time Operating System",
  def:"Processes input and produces output within a strict, predictable deadline. Hard RTOS deadlines are absolute (pacemakers, airbags); Soft RTOS deadlines are important but survivable if missed.",
  note:"Task must complete before the deadline line — hard limits cannot be missed" },
{ key:"mobile", title:"Mobile Operating System",
  def:"Purpose-built for smartphones, tablets, and wearables — optimized for touch input, battery efficiency, and constant connectivity.",
  note:"Optimized for touch interaction, battery life, and constant connectivity" },
{ key:"classify", title:"Other Ways to Classify an Operating System",
  def:"Aside from function, an OS can also be classified by ownership/license and by the platform or device it runs on.",
  note:"By License: Proprietary vs Free and Open-Source  ·  By Platform: Desktop vs Mobile" }
];

/* ---------------- Build the discussion slides into the deck ---------------- */
(function buildDiscussionSlides(){
  const mount = document.getElementById('discussionSlides');
  const frag = document.createDocumentFragment();

  OS_TOPICS.forEach(topic=>{
    // Intro slide — big title/definition card
    const intro = document.createElement('section');
    intro.className = 'slide';
    intro.dataset.phase = 'discussion';
    intro.dataset.subtype = 'intro';
    intro.dataset.topic = topic.key;
    intro.innerHTML = `
      <div class="topic-title-slab panel fadeUp d1">
        <div class="kicker fadeUp d1">Foundations of Operating Systems</div>
        <h1 class="fadeUp d2">${topic.title}</h1>
        <p class="fadeUp d3">${topic.def}</p>
      </div>
    `;
    frag.appendChild(intro);

    // Diagram slide — live animated SVG
    const diagram = document.createElement('section');
    diagram.className = 'slide';
    diagram.dataset.phase = 'discussion';
    diagram.dataset.subtype = 'diagram';
    diagram.dataset.topic = topic.key;
    diagram.innerHTML = `
      <div class="header-panel panel fadeUp d1">
        <div class="kicker">Foundations of Operating Systems</div>
        <h2>${topic.title}</h2>
      </div>
      <div class="stage diagram-stage panel fadeUp d2">
        <div class="diag-toolbar">
          <button type="button" class="diag-btn primary" data-action="play" title="Play / pause animation" aria-label="Play or pause animation">
            <span class="ico">▶</span>
          </button>
          <button type="button" class="diag-btn" data-action="reset" title="Reset animation" aria-label="Reset animation">
            <span class="ico">↺</span>
          </button>
          <span class="live-label"><span class="live-dot"></span>LIVE DIAGRAM</span>
        </div>
        <div class="diagram-box"></div>
      </div>
      <div class="caption panel-sm diag-footer fadeUp d3">${topic.note}</div>
    `;
    frag.appendChild(diagram);
  });

  mount.appendChild(frag);
})();

/* ---------------- Unified slide engine ---------------- */
const slides = Array.from(document.querySelectorAll('#deck .slide'));
const total = slides.length;
let current = 0;

const progressBadge = document.getElementById('progressBadge');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const deckEl = document.getElementById('deck');

let isFirstShow = true;
let transitionCleanupId = null;

function replayAnimations(slide){
  slide.querySelectorAll('.fadeUp').forEach(el=>{
    el.style.animation = 'none';
    void el.offsetWidth; // reflow to restart animation
    el.style.animation = '';
  });
}

function activateContent(slideEl){
  progressBadge.textContent = (current+1) + ' / ' + total;
  replayAnimations(slideEl);

  if (slideEl.dataset.subtype === 'diagram'){
    const box = slideEl.querySelector('.diagram-box');
    const key = slideEl.dataset.topic;
    buildDiagram(key, box);
    setPlayingUI(true, slideEl);
    playAnim(key);
  }
}

function showSlide(index){
  const prevIndex = current;
  const prevSlide = slides[prevIndex];
  current = (index + total) % total;
  const nextSlideEl = slides[current];
  if (nextSlideEl === prevSlide) return;

  // Tear down whatever diagram was running before we move on.
  stopAnim();
  if (prevSlide && prevSlide.dataset.subtype === 'diagram'){
    const box = prevSlide.querySelector('.diagram-box');
    if (box) box.innerHTML = '';
  }

  if (transitionCleanupId) clearTimeout(transitionCleanupId);

  if (isFirstShow || !prevSlide){
    isFirstShow = false;
    nextSlideEl.classList.add('active');
    activateContent(nextSlideEl);
    return;
  }

  // direction: did we move forward or backward through the deck?
  const forward = (prevIndex + 1) % total === current;
  const backward = (current + 1) % total === prevIndex;
  const dir = backward && !forward ? 'prev' : 'next';
  deckEl.classList.remove('dir-next','dir-prev');
  deckEl.classList.add('dir-' + dir);

  // Stage the incoming slide off to the side (no transition yet)...
  nextSlideEl.classList.remove('leaving');
  nextSlideEl.classList.add('incoming');
  void nextSlideEl.offsetWidth; // force the staged position to apply

  // ...then, next frame, fly the outgoing slide away and the incoming
  // slide into place at the same time.
  requestAnimationFrame(()=>{
    prevSlide.classList.remove('active');
    prevSlide.classList.add('leaving');

    nextSlideEl.classList.remove('incoming');
    nextSlideEl.classList.add('active');
    activateContent(nextSlideEl);
  });

  transitionCleanupId = setTimeout(()=>{
    prevSlide.classList.remove('leaving');
  }, 750);
}

prevBtn.addEventListener('click', ()=> showSlide(current-1));
nextBtn.addEventListener('click', ()=> showSlide(current+1));

function setPlayingUI(isPlaying, slideEl){
  const btn = slideEl.querySelector('[data-action="play"]');
  if (!btn) return;
  btn.classList.toggle('is-playing', isPlaying);
  btn.querySelector('.ico').textContent = isPlaying ? '❚❚' : '▶';
  btn.title = isPlaying ? 'Pause animation' : 'Play animation';
  btn.setAttribute('aria-label', btn.title);
}

/* Play / reset / click-to-toggle — delegated, since only one diagram slide
   is ever active at a time. */
deckEl.addEventListener('click', (e)=>{
  const slide = slides[current];
  if (!slide || slide.dataset.subtype !== 'diagram') return;

  const btn = e.target.closest('[data-action]');
  if (btn){
    const key = slide.dataset.topic;
    if (btn.dataset.action === 'play'){
      const playing = btn.classList.contains('is-playing');
      if (playing){ stopAnim(); setPlayingUI(false, slide); }
      else { setPlayingUI(true, slide); playAnim(key); }
    } else if (btn.dataset.action === 'reset'){
      const box = slide.querySelector('.diagram-box');
      stopAnim();
      buildDiagram(key, box);
      setPlayingUI(true, slide);
      playAnim(key);
    }
    return;
  }

  // clicking the diagram canvas itself toggles play, like the original deck
  if (e.target.closest('.diagram-box') && !e.target.closest('.detail-overlay-html')){
    const playBtn = slide.querySelector('[data-action="play"]');
    if (playBtn) playBtn.click();
  }
});

document.addEventListener('keydown', (e)=>{
  if (e.key === 'ArrowRight') showSlide(current+1);
  if (e.key === 'ArrowLeft') showSlide(current-1);
  if (e.key === ' ' || e.code === 'Space'){
    const slide = slides[current];
    if (slide && slide.dataset.subtype === 'diagram'){
      e.preventDefault();
      slide.querySelector('[data-action="play"]').click();
    }
  }
  if (e.key === 'r' || e.key === 'R'){
    const slide = slides[current];
    if (slide && slide.dataset.subtype === 'diagram'){
      slide.querySelector('[data-action="reset"]').click();
    }
  }
});

(function swipe(){
  let x0 = null;
  deckEl.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, {passive:true});
  deckEl.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) showSlide(dx < 0 ? current+1 : current-1);
    x0 = null;
  }, {passive:true});
})();

/* ================= SVG diagram building blocks (viewBox 0 0 1360 480) ================= */
const svgns = "http://www.w3.org/2000/svg";
const VB_W = 1360, VB_H = 480;

function rect(x,y,w,h,fill,stroke,rx=12){
  const r=document.createElementNS(svgns,"rect");
  r.setAttribute("x",x);r.setAttribute("y",y);r.setAttribute("width",w);r.setAttribute("height",h);
  r.setAttribute("rx",rx);r.setAttribute("fill",fill);r.setAttribute("stroke",stroke||"none");
  r.setAttribute("stroke-width","2.5");
  return r;
}
function glowRect(x,y,w,h,fill,stroke,rx=16,filterId="glowCyan"){
  const r=rect(x,y,w,h,fill,stroke,rx);
  r.setAttribute("stroke-width","3");
  r.setAttribute("filter",`url(#${filterId})`);
  return r;
}
function text(x,y,str,cls="lbl",anchor="middle"){
  const t=document.createElementNS(svgns,"text");
  t.setAttribute("x",x);t.setAttribute("y",y);t.setAttribute("class",cls);t.setAttribute("text-anchor",anchor);
  t.textContent=str;
  return t;
}
function tinyText(x,y,str){
  const t=text(x,y,str,"lbl-tiny");
  t.style.fontSize="18px";
  return t;
}
function microText(x,y,str){
  const t=text(x,y,str,"lbl-tiny");
  t.style.fontSize="16px";
  return t;
}
function circle(cx,cy,r,fill,id){
  const c=document.createElementNS(svgns,"circle");
  c.setAttribute("cx",cx);c.setAttribute("cy",cy);c.setAttribute("r",r);c.setAttribute("fill",fill);
  if(id)c.id=id;
  return c;
}
function pathEl(d,fill,stroke,id){
  const p=document.createElementNS(svgns,"path");
  p.setAttribute("d",d);p.setAttribute("fill",fill);p.setAttribute("stroke",stroke||"none");
  p.setAttribute("stroke-width","2");
  if(id)p.id=id;
  return p;
}
function line(x1,y1,x2,y2,stroke,id){
  const l=document.createElementNS(svgns,"line");
  l.setAttribute("x1",x1);l.setAttribute("y1",y1);l.setAttribute("x2",x2);l.setAttribute("y2",y2);
  l.setAttribute("stroke",stroke||"#2b394c");l.setAttribute("stroke-width","3.5");
  l.setAttribute("stroke-linecap","round");
  if(id)l.id=id;
  return l;
}
function connector(x1,y1,x2,y2,stroke,id,{gap=0,arrow=null}={}){
  const dx=x2-x1, dy=y2-y1, len=Math.hypot(dx,dy)||1;
  const ux=dx/len, uy=dy/len;
  const nx1=x1+ux*gap, ny1=y1+uy*gap, nx2=x2-ux*gap, ny2=y2-uy*gap;
  const l=line(nx1,ny1,nx2,ny2,stroke,id);
  if(arrow) l.setAttribute("marker-end", `url(#${arrow})`);
  return l;
}
function packet(id,fill="#f0a83e"){
  const c=circle(0,0,7,fill,id);
  c.setAttribute("filter","url(#glowAmber)");
  c.style.opacity="0";
  return c;
}
function movePacketAlong(pk,x1,y1,x2,y2,duration,onDone){
  pk.style.opacity="1";
  tween(duration, easeInOutSine, p=>{
    pk.setAttribute("cx", x1+(x2-x1)*p);
    pk.setAttribute("cy", y1+(y2-y1)*p);
  }, ()=>{ pk.style.opacity="0"; if(onDone) onDone(); });
}

function defs(svg){
  const d=document.createElementNS(svgns,"defs");

  const mk=(id,color)=>{
    const m=document.createElementNS(svgns,"marker");
    m.setAttribute("id",id);m.setAttribute("viewBox","0 0 10 10");
    m.setAttribute("refX","8");m.setAttribute("refY","5");
    m.setAttribute("markerWidth","7.5");m.setAttribute("markerHeight","7.5");
    m.setAttribute("orient","auto-start-reverse");
    const p=document.createElementNS(svgns,"path");
    p.setAttribute("d","M0,0 L10,5 L0,10 z");
    p.setAttribute("fill",color);
    m.appendChild(p);
    d.appendChild(m);
  };
  mk("arrowDim","#54698a");
  mk("arrowAmber","#f0a83e");
  mk("arrowCyan","#5fd6d1");

  const glow=(id,color,dev=6)=>{
    const f=document.createElementNS(svgns,"filter");
    f.setAttribute("id",id);
    f.setAttribute("x","-80%");f.setAttribute("y","-80%");f.setAttribute("width","260%");f.setAttribute("height","260%");
    const blur=document.createElementNS(svgns,"feGaussianBlur");
    blur.setAttribute("stdDeviation",dev);blur.setAttribute("result","blur");
    const merge=document.createElementNS(svgns,"feMerge");
    const n1=document.createElementNS(svgns,"feMergeNode");n1.setAttribute("in","blur");
    const n2=document.createElementNS(svgns,"feMergeNode");n2.setAttribute("in","SourceGraphic");
    merge.appendChild(n1);merge.appendChild(n2);
    f.appendChild(blur);f.appendChild(merge);
    d.appendChild(f);
  };
  glow("glowCyan","#5fd6d1",7);
  glow("glowAmber","#f0a83e",8);
  glow("glowSoft","#5fd6d1",14);

  const rg=document.createElementNS(svgns,"radialGradient");
  rg.setAttribute("id","coreGlow");
  rg.setAttribute("cx","50%");rg.setAttribute("cy","50%");rg.setAttribute("r","50%");
  const s1=document.createElementNS(svgns,"stop");s1.setAttribute("offset","0%");s1.setAttribute("stop-color","#5fd6d1");s1.setAttribute("stop-opacity","0.35");
  const s2=document.createElementNS(svgns,"stop");s2.setAttribute("offset","100%");s2.setAttribute("stop-color","#5fd6d1");s2.setAttribute("stop-opacity","0");
  rg.appendChild(s1);rg.appendChild(s2);
  d.appendChild(rg);

  const rg2=document.createElementNS(svgns,"radialGradient");
  rg2.setAttribute("id","coreGlowAmber");
  rg2.setAttribute("cx","50%");rg2.setAttribute("cy","50%");rg2.setAttribute("r","50%");
  const s3=document.createElementNS(svgns,"stop");s3.setAttribute("offset","0%");s3.setAttribute("stop-color","#f0a83e");s3.setAttribute("stop-opacity","0.3");
  const s4=document.createElementNS(svgns,"stop");s4.setAttribute("offset","100%");s4.setAttribute("stop-color","#f0a83e");s4.setAttribute("stop-opacity","0");
  rg2.appendChild(s3);rg2.appendChild(s4);
  d.appendChild(rg2);

  const lg=document.createElementNS(svgns,"linearGradient");
  lg.setAttribute("id","panelGrad");
  lg.setAttribute("x1","0%");lg.setAttribute("y1","0%");lg.setAttribute("x2","0%");lg.setAttribute("y2","100%");
  const g1=document.createElementNS(svgns,"stop");g1.setAttribute("offset","0%");g1.setAttribute("stop-color","#16202e");
  const g2=document.createElementNS(svgns,"stop");g2.setAttribute("offset","100%");g2.setAttribute("stop-color","#0e1620");
  lg.appendChild(g1);lg.appendChild(g2);
  d.appendChild(lg);

  svg.appendChild(d);
}

function haze(cx,cy,r,fillId="url(#coreGlow)"){
  return circle(cx,cy,r,fillId);
}

function buildDiagram(key, box){
  box.innerHTML='';
  const svg=document.createElementNS(svgns,"svg");
  svg.setAttribute("viewBox",`0 0 ${VB_W} ${VB_H}`);
  svg.id="mainSvg";
  defs(svg);

  if(key==="batch"){
    svg.appendChild(haze(680,240,230));

    svg.appendChild(rect(70,165,240,140,"url(#panelGrad)","#2b394c"));
    svg.appendChild(text(190,140,"Job Queue","lbl-title"));
    for(let i=0;i<4;i++){
      const job=rect(96+i*54,190,40,90,"#f0a83e22","#f0a83e",8);
      job.id="job"+i;
      svg.appendChild(job);
    }

    svg.appendChild(connector(310,235,505,235,"#54698a","link-in",{gap:0,arrow:"arrowDim"}));

    svg.appendChild(glowRect(505,95,350,280,"#0d1721","#5fd6d1",22,"glowCyan"));
    svg.appendChild(text(680,225,"CPU","lbl-strong"));
    svg.appendChild(text(680,268,"runs one job at a time","lbl"));

    svg.appendChild(connector(855,235,1050,235,"#54698a","link-out",{gap:0,arrow:"arrowDim"}));

    svg.appendChild(rect(1050,165,240,140,"url(#panelGrad)","#2b394c"));
    svg.appendChild(text(1170,140,"Output","lbl-title"));
    svg.appendChild(text(1170,222,"results after","lbl"));
    svg.appendChild(text(1170,256,"full batch ends","lbl"));

    svg.appendChild(packet("pk1"));
  }

  if(key==="timesharing"){
    const cx=680, cy=250, R=155;
    svg.appendChild(haze(cx,cy,R+70));
    svg.appendChild(circle(cx,cy,R+16,"#0f1620"));
    const users=4, colors=["#f0a83e","#5fd6d1","#e0707a","#8fb8ea"];
    for(let i=0;i<users;i++){
      const a0=(i/users)*2*Math.PI - Math.PI/2;
      const a1=((i+1)/users)*2*Math.PI - Math.PI/2;
      const x0=cx+R*Math.cos(a0), y0=cy+R*Math.sin(a0);
      const x1=cx+R*Math.cos(a1), y1=cy+R*Math.sin(a1);
      svg.appendChild(pathEl(`M${cx},${cy} L${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1} Z`, colors[i]+"38", colors[i], "slice"+i));
      const lx=cx+(R+70)*Math.cos((a0+a1)/2), ly=cy+(R+70)*Math.sin((a0+a1)/2);
      svg.appendChild(text(lx,ly,"User "+(i+1),"lbl-title"));
    }
    svg.appendChild(circle(cx,cy,R+16,"none"));
    const ring=circle(cx,cy,R+16,"none");
    ring.setAttribute("stroke","#26364a");ring.setAttribute("stroke-width","2");
    svg.appendChild(ring);

    const ptr=line(cx,cy,cx,cy-R,"#ffffff","ptr");
    ptr.setAttribute("stroke-width","5");
    ptr.setAttribute("filter","url(#glowSoft)");
    svg.appendChild(ptr);
    svg.appendChild(circle(cx,cy,10,"#ffffff"));
    svg.appendChild(text(cx,cy+52,"CPU","lbl-strong"));
  }

  if(key==="distributed"){
    const pts=[[240,90],[680,55],[1120,100],[290,375],[730,400],[1120,340]];
    const links=[[0,1],[1,2],[0,3],[1,4],[2,5],[3,4],[4,5]];
    svg.appendChild(haze(680,230,320));
    links.forEach(([a,b],i)=>{
      svg.appendChild(connector(pts[a][0],pts[a][1],pts[b][0],pts[b][1],"#2c3a4d","link"+i,{gap:48}));
    });
    links.forEach((l,i)=>{
      svg.appendChild(packet("pkd"+i,"#5fd6d1"));
    });
    pts.forEach((p,i)=>{
      svg.appendChild(glowRect(p[0]-72,p[1]-38,144,76,"url(#panelGrad)","#5fd6d1",12,"glowCyan"));
      svg.appendChild(text(p[0],p[1]+9,"Node "+(i+1),"lbl-title"));
    });
    svg.pts=pts; svg.links=links;
  }

  if(key==="network"){
    svg.appendChild(haze(680,140,220));
    svg.appendChild(glowRect(540,40,280,120,"#0d1721","#5fd6d1",20,"glowCyan"));
    svg.appendChild(text(680,100,"Server (NOS)","lbl-strong"));
    svg.appendChild(text(680,140,"users · security · files","lbl"));

    const clients=[[170,380],[560,400],[800,400],[1190,380]];
    clients.forEach((p,i)=>{
      svg.appendChild(connector(680,162,p[0],p[1]-46,"#2c3a4d","netlink"+i,{arrow:"arrowDim"}));
      svg.appendChild(packet("pkn"+i));
    });
    clients.forEach((p,i)=>{
      svg.appendChild(rect(p[0]-90,p[1]-44,180,88,"url(#panelGrad)","#2b394c",14));
      svg.appendChild(text(p[0],p[1]+10,"Client "+(i+1),"lbl-title"));
    });
    svg.clients=clients;
  }

  if(key==="rtos"){
    svg.appendChild(text(680,55,"Task must complete before deadline","lbl-strong"));

    const barX=90, barW=980, barY=250, barH=30;
    const barEnd = barX+barW;

    svg.appendChild(rect(barX,barY,barW,barH,"#0f1620","#2b394c",15));
    svg.appendChild(haze(barX,barY+barH/2,60,"url(#coreGlowAmber)"));
    const marker=circle(barX,barY+barH/2,15,"#f0a83e","marker");
    marker.setAttribute("filter","url(#glowAmber)");
    svg.appendChild(marker);

    svg.appendChild(text(barX,barY+barH+46,"0 ms","lbl"));
    svg.appendChild(text(barEnd,barY+barH+46,"deadline","lbl"));

    const boundary=document.createElementNS(svgns,"line");
    boundary.setAttribute("x1",barEnd);boundary.setAttribute("y1",barY-22);
    boundary.setAttribute("x2",barEnd);boundary.setAttribute("y2",barY+barH+22);
    boundary.setAttribute("stroke","#e0707aa0");boundary.setAttribute("stroke-width","2.5");
    boundary.setAttribute("stroke-dasharray","6,6");
    svg.appendChild(boundary);

    const clX=1120, clW=190, clY=195, clH=125;
    svg.appendChild(text(clX+clW/2,clY-22,"HARD LIMIT","lbl-title"));
    svg.appendChild(glowRect(clX,clY,clW,clH,"#e0707a1c","#e0707a",14,"glowAmber"));
    svg.appendChild(text(clX+clW/2,clY+55,"missed =","lbl"));
    svg.appendChild(text(clX+clW/2,clY+90,"system failure","lbl"));
  }

  if(key==="mobile"){
    svg.appendChild(haze(680,240,230));
    svg.appendChild(text(680,40,"Touch · Battery · Connectivity","lbl-title"));

    const stacks=[["Wi-Fi",190,150],["Bluetooth",190,240],["Cellular",190,330]];
    stacks.forEach(([label,x,y],i)=>{
      svg.appendChild(connector(x+95,y,588,150+i*90,"#2c3a4d","wave"+i,{gap:2}));
      svg.appendChild(packet("pkm"+i,"#5fd6d1"));
    });
    stacks.forEach(([label,x,y])=>{
      svg.appendChild(text(x,y+8,label,"lbl-title"));
    });

    svg.appendChild(glowRect(590,70,180,340,"#0d1721","#5fd6d1",34,"glowCyan"));
    svg.appendChild(rect(614,106,132,220,"#182233","#2b394c",8));
    const apps=[[644,138],[712,138],[644,196],[712,196],[644,254],[712,254]];
    apps.forEach((p,i)=>{
      const a=rect(p[0]-24,p[1]-24,48,48,"#f0a83e22","#f0a83e",9);
      a.id="app"+i;
      svg.appendChild(a);
    });
    svg.appendChild(circle(680,362,11,"#5fd6d1"));
  }

  if(key==="classify"){
    // Classify keeps the exact same proven 1360x480 layout/ratios as every
    // other diagram (zero risk of new text/box overflow) — the size boost
    // for this slide comes entirely from giving it a much larger on-screen
    // box in CSS (see .slide[data-topic="classify"] .diagram-stage), so
    // the same vector shapes simply render at a bigger scale.
    svg.appendChild(haze(685,180,320));

    const ghost=document.createElementNS(svgns,"g");
    ghost.setAttribute("opacity","0.16");
    ghost.appendChild(rect(575,20,220,60,"none","#3a4c66",12));
    ghost.appendChild(rect(200,155,300,60,"none","#3a4c66",14));
    ghost.appendChild(rect(870,155,300,60,"none","#3a4c66",14));
    ghost.appendChild(rect(30,290,300,160,"none","#3a4c66",14));
    ghost.appendChild(rect(350,290,340,160,"none","#3a4c66",14));
    ghost.appendChild(rect(710,290,300,160,"none","#3a4c66",14));
    ghost.appendChild(rect(1030,290,300,160,"none","#3a4c66",14));
    svg.appendChild(ghost);

    function nodeGroup(id, els, extraClass, origin){
      const g=document.createElementNS(svgns,"g");
      g.id=id; g.setAttribute("class","node-grp"+(extraClass?" "+extraClass:""));
      els.forEach(e=>g.appendChild(e));
      svg.appendChild(g);
      if(extraClass==="leaf"){
        g.addEventListener("click",(e)=>{
          e.stopPropagation();
          openDetail(svg, id, origin||"50% 100%");
        });
      }
      return g;
    }
    function branch(id,x1,y1,x2,y2,stroke){
      const l=connector(x1,y1,x2,y2,stroke,id,{gap:2,arrow:"arrowDim"});
      l.setAttribute("class","branch-line");
      const len=Math.hypot(x2-x1,y2-y1);
      l.dataset.len=len;
      l.setAttribute("stroke-dasharray",len);
      l.setAttribute("stroke-dashoffset",len);
      svg.appendChild(l);
      return l;
    }

    nodeGroup("nRoot",[
      glowRect(575,20,220,60,"#0d1721","#5fd6d1",12,"glowCyan"),
      text(685,58,"Operating System","lbl-title")
    ]);

    branch("br-license",685,80,350,155,"#f0a83e");
    branch("br-platform",685,80,1020,155,"#8fb8ea");

    nodeGroup("nLicense",[
      rect(200,155,300,60,"#182233","#f0a83e",14),
      text(350,192,"By License","lbl-strong")
    ]);
    nodeGroup("nPlatform",[
      rect(870,155,300,60,"#182233","#8fb8ea",14),
      text(1020,192,"By Platform","lbl-strong")
    ]);

    const leafY=290, leafH=160;
    branch("leaf-lic1",300,215,180,leafY,"#f0a83e");
    branch("leaf-lic2",400,215,520,leafY,"#f0a83e");
    branch("leaf-plat1",970,215,825,leafY,"#8fb8ea");
    branch("leaf-plat2",1070,215,1180,leafY,"#8fb8ea");

    nodeGroup("nProp",[
      rect(30,leafY,300,leafH,"#0f1620","#f0a83e",14),
      text(180,leafY+46,"Proprietary /","lbl-title"),
      text(180,leafY+78,"Exclusive Software","lbl-title"),
      tinyText(180,leafY+118,"e.g. Windows, macOS")
    ], "leaf", "20% 100%");
    nodeGroup("nFoss",[
      rect(350,leafY,340,leafH,"#0f1620","#f0a83e",14),
      text(520,leafY+42,"Free and","lbl-title"),
      text(520,leafY+74,"Open-Source Software","lbl-title"),
      tinyText(520,leafY+114,"open-source · e.g. Linux")
    ], "leaf", "40% 100%");
    nodeGroup("nDesktop",[
      rect(710,leafY,300,leafH,"#0f1620","#8fb8ea",14),
      text(860,leafY+50,"Desktop OS","lbl-strong"),
      text(860,leafY+88,"full control, robust","lbl"),
      microText(860,leafY+124,"Windows, macOS, Linux/UNIX")
    ], "leaf", "60% 100%");
    nodeGroup("nMobile",[
      rect(1030,leafY,300,leafH,"#0f1620","#8fb8ea",14),
      text(1180,leafY+50,"Mobile OS","lbl-strong"),
      text(1180,leafY+88,"touch, small screens","lbl"),
      microText(1180,leafY+124,"battery efficient · Android, iOS")
    ], "leaf", "80% 100%");

    buildDetailOverlay(svg, box);
  }

  box.appendChild(svg);
}

/* ---- Click-to-expand detail overlay for the classify tree's leaf nodes ---- */
const LEAF_DETAILS = {
  nProp:    { accent:"#f0a83e", title:"Proprietary / Exclusive Software",
              desc:"Source code is closed — one company controls it.",
              chips:["Windows","macOS"] },
  nFoss:    { accent:"#f0a83e", title:"Free and Open-Source Software",
              desc:"Public source — anyone can view, modify, and share it.",
              chips:["Linux","Ubuntu","Fedora"] },
  nDesktop: { accent:"#8fb8ea", title:"Desktop OS",
              desc:"Full control, robust multitasking for traditional PCs.",
              chips:["Windows","macOS","Linux / UNIX"] },
  nMobile:  { accent:"#8fb8ea", title:"Mobile OS",
              desc:"Optimized for touch, battery life, and connectivity.",
              chips:["Android","iOS"] },
};

function buildDetailOverlay(svg, box){
  const old = box.querySelector(".detail-overlay-html");
  if(old) old.remove();

  const overlay=document.createElement("div");
  overlay.className="detail-overlay-html";
  overlay.innerHTML=`
    <div class="detail-backdrop-html"></div>
    <div class="detail-panel-html">
      <div class="detail-accent-html"></div>
      <button class="detail-close-html" type="button" aria-label="Close">&#10005;</button>
      <h3 class="detail-title-html"></h3>
      <p class="detail-desc-html"></p>
      <div class="detail-eyebrow-html">Examples</div>
      <div class="detail-chips-html"></div>
    </div>
  `;
  box.appendChild(overlay);

  const backdrop=overlay.querySelector(".detail-backdrop-html");
  const panel=overlay.querySelector(".detail-panel-html");
  const titleEl=overlay.querySelector(".detail-title-html");
  const descEl=overlay.querySelector(".detail-desc-html");
  const chipLayer=overlay.querySelector(".detail-chips-html");
  const closeBtn=overlay.querySelector(".detail-close-html");

  svg._detail = { overlay, backdrop, panel, titleEl, descEl, chipLayer, closeBtn };

  backdrop.addEventListener("click", (e)=>{ e.stopPropagation(); closeDetail(svg); });
  panel.addEventListener("click", (e)=> e.stopPropagation());
  closeBtn.addEventListener("click", (e)=>{ e.stopPropagation(); closeDetail(svg); });
}

function forceFullTree(svg){
  ["nRoot","nLicense","nPlatform","nProp","nFoss","nDesktop","nMobile"].forEach(id=>{
    const g=svg.querySelector("#"+id);
    if(g){ g.classList.remove("hide"); g.classList.add("show"); }
  });
  [["br-license","#f0a83e","arrowAmber"],["br-platform","#8fb8ea","arrowCyan"],
   ["leaf-lic1","#f0a83e","arrowAmber"],["leaf-lic2","#f0a83e","arrowAmber"],
   ["leaf-plat1","#8fb8ea","arrowCyan"],["leaf-plat2","#8fb8ea","arrowCyan"]].forEach(([id,color,arrow])=>{
    const l=svg.querySelector("#"+id);
    if(l){
      l.style.transition="none";
      l.setAttribute("stroke-dashoffset","0");
      l.setAttribute("stroke",color); l.setAttribute("stroke-width","6");
      l.setAttribute("marker-end",`url(#${arrow})`);
    }
  });
}

function openDetail(svg, leafId, originStr){
  stopAnim();
  forceFullTree(svg);

  const d = svg._detail;
  const info = LEAF_DETAILS[leafId];
  if(!d || !info) return;

  d.panel.style.transformOrigin = originStr;
  d.panel.style.setProperty("--accent", info.accent);
  d.titleEl.textContent = info.title;
  d.descEl.textContent = info.desc;

  d.chipLayer.innerHTML = "";
  info.chips.forEach((label,i)=>{
    const chip=document.createElement("span");
    chip.className="chip-html";
    chip.style.transitionDelay = (i*90)+"ms";
    chip.textContent = label;
    d.chipLayer.appendChild(chip);
  });

  d.overlay.style.pointerEvents = "auto";
  requestAnimationFrame(()=>{
    d.backdrop.classList.add("show");
    d.panel.classList.add("show");
    requestAnimationFrame(()=>{
      d.chipLayer.querySelectorAll(".chip-html").forEach(c=>c.classList.add("show"));
    });
  });
}

function closeDetail(svg){
  const d = svg._detail;
  if(!d) return;
  d.chipLayer.querySelectorAll(".chip-html").forEach(c=>c.classList.remove("show"));
  d.panel.classList.remove("show");
  d.backdrop.classList.remove("show");
  d.overlay.style.pointerEvents = "none";
  setT(()=>{ playAnim("classify"); }, 320);
}

/* ================= Animations — requestAnimationFrame + easing ================= */
let rafId = null;
let timeouts = [];

function stopAnim(){
  if(rafId) cancelAnimationFrame(rafId);
  rafId = null;
  timeouts.forEach(t=>clearTimeout(t));
  timeouts = [];
}
function setT(fn,ms){ const id=setTimeout(fn,ms); timeouts.push(id); return id; }
function easeInOutSine(t){ return -(Math.cos(Math.PI*t)-1)/2; }
function easeOutCubic(t){ return 1-Math.pow(1-t,3); }

function tween(duration, easing, fn, onDone){
  const start = performance.now();
  function frame(now){
    const t = Math.min(1, (now-start)/duration);
    fn(easing(t));
    if(t<1){ rafId = requestAnimationFrame(frame); }
    else if(onDone){ onDone(); }
  }
  rafId = requestAnimationFrame(frame);
}

function playAnim(key){
  stopAnim();
  // NOTE: because only one diagram slide is ever built at a time (the
  // previous one's box is cleared on navigation), plain getElementById
  // lookups below always resolve to the currently active diagram's nodes.

  if(key==="batch"){
    const jobs=[0,1,2,3].map(i=>document.getElementById("job"+i));
    const pk=document.getElementById("pk1");
    function cycle(){
      jobs.forEach(j=>j.setAttribute("fill","#f0a83e22"));
      movePacketAlong(pk,310,235,505,235,500,()=>{
        pk.style.opacity="0";
        let litUpTo=-1;
        tween(2000, t=>t, p=>{
          const step = Math.floor(p*jobs.length);
          if(step>litUpTo && step<jobs.length){
            litUpTo = step;
            jobs[step].setAttribute("fill","#f0a83e");
            jobs[step].style.transition="fill .2s ease";
          }
        }, ()=>{
          movePacketAlong(pk,855,235,1050,235,450, ()=> setT(cycle,650));
        });
      });
    }
    cycle();
  }

  if(key==="timesharing"){
    const ptr=document.getElementById("ptr");
    const cx=680, cy=250, R=155;
    function cycle(){
      tween(2600, t=>t, p=>{
        const angle = -90 + p*360;
        const rad = angle*Math.PI/180;
        ptr.setAttribute("x2", cx+R*Math.cos(rad));
        ptr.setAttribute("y2", cy+R*Math.sin(rad));
      }, cycle);
    }
    cycle();
  }

  if(key==="distributed"){
    const links=document.querySelectorAll('[id^="link"]');
    const svg=document.getElementById("mainSvg");
    const pts=svg.pts, linkPairs=svg.links;
    function cycle(){
      links.forEach((l,i)=>{
        setT(()=>{
          l.style.transition="stroke .25s ease, stroke-width .25s ease";
          l.setAttribute("stroke","#5fd6d1"); l.setAttribute("stroke-width","5.5");
          const pk=document.getElementById("pkd"+i);
          const [a,b]=linkPairs[i];
          movePacketAlong(pk, pts[a][0],pts[a][1], pts[b][0],pts[b][1], 380);
        },i*220);
      });
      setT(()=>{
        links.forEach(l=>{l.setAttribute("stroke","#2c3a4d");l.setAttribute("stroke-width","3.5");});
        setT(cycle,450);
      }, links.length*220+650);
    }
    cycle();
  }

  if(key==="network"){
    const links=document.querySelectorAll('[id^="netlink"]');
    const svg=document.getElementById("mainSvg");
    const clients=svg.clients;
    function cycle(){
      links.forEach((l,i)=>{
        setT(()=>{
          l.style.transition="stroke .25s ease, stroke-width .25s ease";
          l.setAttribute("stroke","#f0a83e"); l.setAttribute("stroke-width","5.5");
          l.setAttribute("marker-end","url(#arrowAmber)");
          const pk=document.getElementById("pkn"+i);
          movePacketAlong(pk, 680,162, clients[i][0],clients[i][1]-46, 500);
        },i*200);
        setT(()=>{
          l.setAttribute("stroke","#2c3a4d"); l.setAttribute("stroke-width","3.5");
          l.setAttribute("marker-end","url(#arrowDim)");
        },i*200+700);
      });
      setT(cycle, links.length*200+900);
    }
    cycle();
  }

  if(key==="rtos"){
    const marker=document.getElementById("marker");
    const startX=90, endX=1070;
    function cycle(){
      marker.setAttribute("fill","#f0a83e");
      tween(2400, easeInOutSine, p=>{
        marker.setAttribute("cx", startX + p*(endX-startX));
      }, ()=>{
        marker.setAttribute("fill","#4fd18a");
        setT(()=>{ marker.setAttribute("cx",startX); cycle(); }, 900);
      });
    }
    cycle();
  }

  if(key==="mobile"){
    const apps=[0,1,2,3,4,5].map(i=>document.getElementById("app"+i));
    const pks=[0,1,2].map(i=>document.getElementById("pkm"+i));
    const starts=[[285,150],[285,240],[285,330]];
    function cycle(){
      pks.forEach((pk,i)=>{
        setT(()=>movePacketAlong(pk, starts[i][0],starts[i][1], 588,150+i*90, 500), i*150);
      });
      apps.forEach((a,i)=>{
        setT(()=>{
          a.style.transition="fill .3s ease";
          a.setAttribute("fill","#f0a83e");
          setT(()=>a.setAttribute("fill","#f0a83e22"),420);
        }, 500+i*160);
      });
      setT(cycle, 500+apps.length*160+700);
    }
    cycle();
  }

  if(key==="classify"){
    const root=document.getElementById("nRoot");
    const license=document.getElementById("nLicense");
    const platform=document.getElementById("nPlatform");
    const leaves={
      prop:document.getElementById("nProp"),
      foss:document.getElementById("nFoss"),
      desktop:document.getElementById("nDesktop"),
      mobile:document.getElementById("nMobile"),
    };
    const branches={
      license:document.getElementById("br-license"),
      platform:document.getElementById("br-platform"),
      lic1:document.getElementById("leaf-lic1"),
      lic2:document.getElementById("leaf-lic2"),
      plat1:document.getElementById("leaf-plat1"),
      plat2:document.getElementById("leaf-plat2"),
    };

    function popIn(g){ if(g){ g.classList.remove("hide"); g.classList.add("show"); } }
    function popOut(g){ if(g){ g.classList.remove("show"); g.classList.add("hide"); } }
    function drawLine(l,dur=520){
      if(!l) return;
      l.style.transition=`stroke-dashoffset ${dur}ms cubic-bezier(.22,.68,0,1.01), stroke .2s ease, stroke-width .2s ease`;
      l.setAttribute("stroke-dashoffset","0");
    }
    function retractLine(l,dur=320){
      if(!l) return;
      l.style.transition=`stroke-dashoffset ${dur}ms ease-in`;
      l.setAttribute("stroke-dashoffset", l.dataset.len);
    }
    function litLine(l,color,arrow){
      if(!l) return;
      l.setAttribute("stroke",color); l.setAttribute("stroke-width","6");
      l.setAttribute("marker-end",`url(#${arrow})`);
    }
    function dimLine(l){
      if(!l) return;
      l.setAttribute("stroke","#2c3a4d"); l.setAttribute("stroke-width","3.5");
      l.setAttribute("marker-end","url(#arrowDim)");
    }

    function cycle(){
      setT(()=> popIn(root), 100);

      setT(()=>{ drawLine(branches.license); litLine(branches.license,"#f0a83e","arrowAmber"); }, 550);
      setT(()=>{ drawLine(branches.platform); litLine(branches.platform,"#8fb8ea","arrowCyan"); }, 700);

      setT(()=> popIn(license), 1000);
      setT(()=> popIn(platform), 1150);

      setT(()=>{ drawLine(branches.lic1); litLine(branches.lic1,"#f0a83e","arrowAmber"); }, 1500);
      setT(()=>{ drawLine(branches.lic2); litLine(branches.lic2,"#f0a83e","arrowAmber"); }, 1620);
      setT(()=>{ drawLine(branches.plat1); litLine(branches.plat1,"#8fb8ea","arrowCyan"); }, 1740);
      setT(()=>{ drawLine(branches.plat2); litLine(branches.plat2,"#8fb8ea","arrowCyan"); }, 1860);

      setT(()=> popIn(leaves.prop), 2000);
      setT(()=> popIn(leaves.foss), 2140);
      setT(()=> popIn(leaves.desktop), 2280);
      setT(()=> popIn(leaves.mobile), 2420);

      setT(()=>{
        [root,license,platform,leaves.prop,leaves.foss,leaves.desktop,leaves.mobile].forEach(g=>{
          g.classList.add("pulse");
        });
      }, 2900);
      setT(()=>{
        [root,license,platform,leaves.prop,leaves.foss,leaves.desktop,leaves.mobile].forEach(g=>{
          g.classList.remove("pulse");
        });
      }, 3500);

      setT(()=>{}, 4200);

      setT(()=>{ popOut(leaves.mobile); retractLine(branches.plat2); }, 4400);
      setT(()=>{ popOut(leaves.desktop); retractLine(branches.plat1); }, 4520);
      setT(()=>{ popOut(leaves.foss); retractLine(branches.lic2); }, 4640);
      setT(()=>{ popOut(leaves.prop); retractLine(branches.lic1); }, 4760);

      setT(()=>{ popOut(platform); retractLine(branches.platform); }, 5150);
      setT(()=>{ popOut(license); retractLine(branches.license); }, 5280);

      setT(()=> popOut(root), 5700);

      setT(()=>{
        Object.values(branches).forEach(dimLine);
      }, 5850);

      setT(cycle, 6400);
    }
    cycle();
  }
}

/* ---------------- Boot ---------------- */
showSlide(0);
