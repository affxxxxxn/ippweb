/* ===================================================================
   IPP — Shared site JavaScript (assets/js/main.js)
   Loaded on every page. Each block guards for element existence so
   this one file works whether a page has the widget or not.
=================================================================== */

/* ---------- FORM DELIVERY (no backend required) -----------------------
   Uses FormSubmit.co's AJAX endpoint to email submissions — free, no
   signup, no API key. Change DESTINATION_EMAIL below to redirect where
   contact/quote submissions land.
   IMPORTANT ONE-TIME STEP: the first submission ever sent to a given
   address triggers an activation email from FormSubmit to that address —
   someone with access to that inbox must click the confirmation link
   once. After that, every future submission is delivered normally.
------------------------------------------------------------------- */
const DESTINATION_EMAIL = 'info@ipp.ae';
function submitToInbox(payload, subject){
  return fetch(`https://formsubmit.co/ajax/${DESTINATION_EMAIL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ ...payload, _subject: subject, _template: 'table', _captcha: 'false' })
  }).then(res => { if(!res.ok) throw new Error('Delivery failed'); return res.json(); });
}
function mailtoFallback(subject, bodyLines){
  const body = encodeURIComponent(bodyLines.join('\n'));
  return `mailto:${DESTINATION_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`;
}

/* ---------- NAV / MEGA MENU / SCROLLED STATE ---------- */
(function(){
  const navEl = document.getElementById('nav');
  if(!navEl) return;
  window.addEventListener('scroll', () => navEl.classList.toggle('scrolled', window.scrollY > 30), {passive:true});
  if(!document.body.classList.contains('is-home')) navEl.classList.add('scrolled');

  document.querySelectorAll('.nav-item').forEach(item=>{
    const btn = item.querySelector('button');
    if(!btn) return;
    btn.addEventListener('click', (e)=>{
      e.preventDefault();
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.nav-item.open').forEach(i=>i.classList.remove('open'));
      if(!wasOpen) item.classList.add('open');
    });
  });
  document.addEventListener('click', (e)=>{ if(!e.target.closest('.nav-item')) document.querySelectorAll('.nav-item.open').forEach(i=>i.classList.remove('open')); });
})();

/* ---------- MOBILE DRAWER ---------- */
(function(){
  const drawer = document.getElementById('drawer');
  const toggle = document.getElementById('menuToggle');
  const closeBtn = document.getElementById('drawerClose');
  if(!drawer || !toggle) return;
  toggle.addEventListener('click', ()=>drawer.classList.add('open'));
  if(closeBtn) closeBtn.addEventListener('click', ()=>drawer.classList.remove('open'));
  drawer.querySelectorAll('a.d-link, a.d-sub').forEach(a=>a.addEventListener('click', ()=>drawer.classList.remove('open')));
})();

/* ---------- SCROLL REVEAL ---------- */
(function(){
  const els = document.querySelectorAll('.reveal');
  if(!els.length) return;
  const io = new IntersectionObserver((entries)=>{ entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } }); },{threshold:.12});
  els.forEach(el=>io.observe(el));
})();

/* ---------- ANIMATED COUNTERS ---------- */
(function(){
  const counters = document.querySelectorAll('[data-count]');
  if(!counters.length) return;
  const cio = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        const el = en.target; const target = parseInt(el.dataset.count,10); const suffix = el.dataset.suffix || '';
        let cur = 0; const step = Math.max(1, Math.round(target/60));
        const t = setInterval(()=>{ cur += step; if(cur>=target){cur=target; clearInterval(t);} el.textContent = cur.toLocaleString() + suffix; },20);
        cio.unobserve(el);
      }
    });
  },{threshold:.4});
  counters.forEach(c=>cio.observe(c));
})();

/* ---------- PACKAGING FINDER (CONFIGURATOR) ---------- */
(function(){
  const chipGroups = document.querySelectorAll('.chip-row');
  const pouchEl = document.getElementById('pouchRender');
  if(!chipGroups.length || !pouchEl) return;
  const specMap = {format:'specFormat', barrier:'specBarrier', closure:'specClosure', finish:'specFinish'};
  function currentConfig(){ const cfg = {}; chipGroups.forEach(g=>{ cfg[g.dataset.group] = g.querySelector('.chip.active').dataset.val; }); return cfg; }
  function renderPouch(){
    const cfg = currentConfig();
    const finishOpacity = cfg.finish === 'Gloss' ? 1 : cfg.finish === 'Soft-Touch' ? .55 : .82;
    const barrierColor = cfg.barrier === 'Metallized' ? '#AAB6CC' : cfg.barrier === 'High-Barrier' ? '#2456C9' : '#3868DE';
    const isFlat = cfg.format === 'Flat Bottom'; const isSachet = cfg.format === 'Sachet';
    const zip = cfg.closure === 'Slider Zipper' ? '<rect x="18" y="14" width="114" height="10" rx="5" fill="#0B1E3F" opacity=".5"/>' : '';
    const spout = cfg.closure === 'Spout' ? '<rect x="60" y="0" width="30" height="22" rx="6" fill="#C9CFE0"/>' : '';
    const tie = cfg.closure === 'Tin-Tie' ? '<rect x="10" y="10" width="130" height="6" fill="#8b8378"/>' : '';
    pouchEl.innerHTML = `<svg viewBox="0 0 150 210"><defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${barrierColor}" stop-opacity="${finishOpacity}"/><stop offset="1" stop-color="#0B1E3F" stop-opacity="${finishOpacity}"/></linearGradient></defs>
    ${isSachet ? `<rect x="20" y="30" width="110" height="150" rx="10" fill="url(#pg)" stroke="#0B1E3F" stroke-opacity=".12"/>` : `<path d="M25 30 Q25 10 45 8 L105 8 Q125 10 125 30 L125 ${isFlat?165:190} Q125 205 105 205 L45 205 Q25 205 25 ${isFlat?165:190} Z" fill="url(#pg)" stroke="#0B1E3F" stroke-opacity=".12"/>${isFlat ? '<ellipse cx="75" cy="188" rx="42" ry="12" fill="#000" opacity=".1"/>' : ''}`}
    ${zip}${spout}${tie}</svg>`;
  }
  chipGroups.forEach(group=>{
    group.addEventListener('click', (e)=>{
      const chip = e.target.closest('.chip'); if(!chip) return;
      group.querySelectorAll('.chip').forEach(c=>c.classList.remove('active')); chip.classList.add('active');
      const specEl = document.getElementById(specMap[group.dataset.group]);
      if(specEl) specEl.textContent = chip.dataset.val;
      renderPouch();
    });
  });
  renderPouch();
})();

/* ---------- SUSTAINABILITY CALCULATOR + WEIGHING SCALE ---------- */
(function(){
  const volSlider = document.getElementById('volSlider'); const pctSlider = document.getElementById('pctSlider');
  if(!volSlider || !pctSlider) return;
  const beam = document.getElementById('scaleBeam');
  function calc(){
    const vol = parseInt(volSlider.value,10); const pct = parseInt(pctSlider.value,10);
    document.getElementById('volOut').textContent = vol.toLocaleString(); document.getElementById('pctOut').textContent = pct + '%';
    const gaugeReductionPerPouchKg = 0.0009;
    const yearlyKg = vol * 12 * gaugeReductionPerPouchKg * (pct/100);
    const co2Tonnes = (yearlyKg * 1.8) / 1000;
    document.getElementById('plasticSaved').textContent = Math.round(yearlyKg).toLocaleString();
    document.getElementById('co2Saved').textContent = co2Tonnes.toFixed(1);
    // drive the weighing scale, if present on this page
    if(beam){
      const standardKgPerMonth = vol * 0.009; // approx total pack weight, standard laminate
      const recyclableShareKg = standardKgPerMonth * (pct/100) * (1 - gaugeReductionPerPouchKg*1000/9);
      const nonRecyclableShareKg = standardKgPerMonth * (1 - pct/100);
      const recyclableTotal = recyclableShareKg + nonRecyclableShareKg;
      const diff = standardKgPerMonth - recyclableTotal; // positive = recyclable side lighter
      const maxTilt = 12;
      const tilt = Math.max(-maxTilt, Math.min(maxTilt, (diff / standardKgPerMonth) * maxTilt * 4));
      beam.style.transform = `rotate(${tilt}deg)`;
      document.getElementById('scaleLeftWeight').textContent = Math.round(standardKgPerMonth).toLocaleString() + ' kg/mo';
      document.getElementById('scaleRightWeight').textContent = Math.round(recyclableTotal).toLocaleString() + ' kg/mo';
    }
  }
  volSlider.addEventListener('input', calc); pctSlider.addEventListener('input', calc); calc();
})();

/* ---------- PRODUCT SHOWCASE (HORIZONTAL SCROLL) ---------- */
(function(){
  const scTrack = document.getElementById('scTrack');
  if(!scTrack) return;
  const scLeftBtn = document.getElementById('scLeft'); const scRightBtn = document.getElementById('scRight'); const scBar = document.getElementById('scBar');
  function updateBar(){ if(!scBar) return; const max = scTrack.scrollWidth - scTrack.clientWidth; const pct = max > 0 ? (scTrack.scrollLeft / max) * (100-16) : 0; scBar.style.width='16%'; scBar.style.left = pct + '%'; }
  scTrack.addEventListener('scroll', updateBar, {passive:true});
  if(scLeftBtn) scLeftBtn.addEventListener('click', ()=> scTrack.scrollBy({left:-360, behavior:'smooth'}));
  if(scRightBtn) scRightBtn.addEventListener('click', ()=> scTrack.scrollBy({left:360, behavior:'smooth'}));
  updateBar();
  let isDown=false, startX, scrollLeftStart;
  scTrack.addEventListener('mousedown', e=>{ isDown=true; startX=e.pageX; scrollLeftStart=scTrack.scrollLeft; scTrack.style.cursor='grabbing'; });
  window.addEventListener('mouseup', ()=>{ isDown=false; scTrack.style.cursor='grab'; });
  window.addEventListener('mousemove', e=>{ if(!isDown) return; const dx = e.pageX - startX; scTrack.scrollLeft = scrollLeftStart - dx; });
  document.querySelectorAll('[data-tilt]').forEach(card=>{
    card.addEventListener('mousemove', (e)=>{ const r = card.getBoundingClientRect(); const px=(e.clientX-r.left)/r.width-.5; const py=(e.clientY-r.top)/r.height-.5;
      card.style.transform = `perspective(1200px) rotateY(${px*6}deg) rotateX(${-py*6}deg) translateY(-6px)`; });
    card.addEventListener('mouseleave', ()=>{ card.style.transform = 'perspective(1200px) rotateY(0) rotateX(0) translateY(0)'; });
  });
})();

/* ---------- GLOBAL REACH MAP ---------- */
(function(){
  const worldMap = document.getElementById('worldMap');
  if(!worldMap) return;
  const tip = document.getElementById('mapTip'); const panel = document.querySelector('.globe-panel'); const arcPath = document.getElementById('arcPath');
  const hub = document.querySelector('.hotspot.hub'); if(!hub) return;
  const hubX = parseFloat(hub.dataset.x), hubY = parseFloat(hub.dataset.y);
  function showTip(name, detail, clientX, clientY){ document.getElementById('tipCountry').textContent = name; document.getElementById('tipDetail').textContent = detail; const rect = panel.getBoundingClientRect(); tip.style.left = (clientX - rect.left) + 'px'; tip.style.top = (clientY - rect.top) + 'px'; tip.classList.add('show'); }
  function drawArc(x,y){ if(x===hubX && y===hubY){ arcPath.classList.remove('show'); return; } const mx=(hubX+x)/2, my=Math.min(hubY,y)-60; arcPath.setAttribute('d', `M${hubX} ${hubY} Q ${mx} ${my} ${x} ${y}`); arcPath.classList.add('show'); }
  function activate(name){ document.querySelectorAll('.hotspot').forEach(h=> h.classList.toggle('active', h.dataset.country===name)); document.querySelectorAll('.country-pill').forEach(p=> p.classList.toggle('active', p.dataset.country===name)); }
  function clearActive(){ document.querySelectorAll('.hotspot.active').forEach(h=>h.classList.remove('active')); document.querySelectorAll('.country-pill.active').forEach(p=>p.classList.remove('active')); arcPath.classList.remove('show'); tip.classList.remove('show'); }
  document.querySelectorAll('.hotspot').forEach(h=>{
    h.addEventListener('mouseenter', ()=>{ activate(h.dataset.country); drawArc(parseFloat(h.dataset.x), parseFloat(h.dataset.y)); });
    h.addEventListener('mousemove', (e)=> showTip(h.dataset.country, h.dataset.detail, e.clientX, e.clientY));
    h.addEventListener('mouseleave', clearActive);
  });
  document.querySelectorAll('.country-pill').forEach(p=>{
    p.addEventListener('mouseenter', ()=>{
      const h = document.querySelector(`.hotspot[data-country="${p.dataset.country}"]`); if(!h) return;
      activate(p.dataset.country); drawArc(parseFloat(h.dataset.x), parseFloat(h.dataset.y));
      const svgRect = worldMap.getBoundingClientRect(); const scale = svgRect.width / 1000;
      showTip(p.dataset.country, h.dataset.detail, svgRect.left + parseFloat(h.dataset.x)*scale, svgRect.top + parseFloat(h.dataset.y)*scale);
    });
    p.addEventListener('mouseleave', clearActive);
  });
})();

/* ---------- MARQUEE PAUSE ON HOVER ---------- */
(function(){
  const marquee = document.getElementById('marquee');
  if(!marquee) return;
  const wrap = marquee.closest('.marquee-wrap');
  if(!wrap) return;
  wrap.addEventListener('mouseenter', ()=> marquee.style.animationPlayState='paused');
  wrap.addEventListener('mouseleave', ()=> marquee.style.animationPlayState='running');
})();

/* ---------- REEL VIDEO LIGHTBOX ---------- */
(function(){
  const cards = document.querySelectorAll('.reel-media[data-video]');
  if(!cards.length) return;

  // Build the lightbox once and append to body
  const lightbox = document.createElement('div');
  lightbox.className = 'video-lightbox';
  lightbox.innerHTML = `
    <div class="video-lightbox-inner">
      <button class="video-lightbox-close" aria-label="Close video">✕</button>
      <video class="video-lightbox-player" playsinline controls></video>
    </div>`;
  document.body.appendChild(lightbox);
  const player = lightbox.querySelector('.video-lightbox-player');
  const closeBtn = lightbox.querySelector('.video-lightbox-close');
  const inner = lightbox.querySelector('.video-lightbox-inner');

  function openLightbox(src, poster, orientation){
    player.src = src;
    if(poster) player.poster = poster;
    inner.classList.toggle('portrait', orientation === 'portrait');
    inner.classList.toggle('landscape', orientation !== 'portrait');
    lightbox.classList.add('open');
    document.body.classList.add('lightbox-open');
    player.currentTime = 0;
    player.play().catch(()=>{});
  }
  function closeLightbox(){
    lightbox.classList.remove('open');
    document.body.classList.remove('lightbox-open');
    player.pause();
    player.removeAttribute('src');
    player.load();
  }
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e)=>{ if(e.target === lightbox) closeLightbox(); }); // click off the video closes it
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox(); });

  cards.forEach(media=>{
    const video = media.querySelector('video');
    if(!video) return;
    const orientation = media.classList.contains('portrait') ? 'portrait' : 'landscape';
    media.addEventListener('click', ()=>{
      openLightbox(video.getAttribute('src'), video.getAttribute('poster'), orientation);
    });
  });
})();

/* ---------- AI PACKAGING EXPERT (with voice) ---------- */
(function(){
  const aiFab = document.getElementById('aiFab'); const aiPanel = document.getElementById('aiPanel');
  if(!aiFab || !aiPanel) return;
  aiFab.addEventListener('click', ()=> aiPanel.classList.toggle('open'));
  const closeBtn = document.getElementById('aiClose');
  if(closeBtn) closeBtn.addEventListener('click', ()=> aiPanel.classList.remove('open'));
  const aiBody = document.getElementById('aiBody');

  // Each entry: keywords, advice, source, and an optional recommended page {label, href}
  const KB = [
    // ---- Food subcategories ----
    {k:['chip','crisp','crisps'], a:"For chips and crisps, we'd typically recommend a metallized OPP/PE flow-wrap laminate — it blocks oxygen and moisture (the two things that make chips go stale or soggy) and gives a bright, high-gloss print surface for shelf standout.", src:'Source: Food product line', rec:{label:'Food', href:'food.html'}},
    {k:['biscuit','cookie','snack bar'], a:"Biscuits and snack bars usually run on flow-wrap format with a moisture-barrier laminate — light enough for high-speed wrapping lines, with enough grease resistance for buttery formulations.", src:'Source: Food — Biscuits & Snacks', rec:{label:'Food', href:'food.html'}},
    {k:['cereal'], a:"Cereal typically goes into a stand-up pouch or a bag-in-box liner, with a moisture barrier to keep things crisp. A flat-bottom pouch also gives good shelf stand-out if you want it as the primary pack rather than a liner.", src:'Source: Food — Cereal', rec:{label:'Food', href:'food.html'}},
    {k:['confection', 'chocolate', 'candy', 'sweets'], a:"Confectionery and chocolate usually need a light barrier against moisture and light rather than heavy oxygen barrier — twist-wrap or flow-wrap film with good machinability and gloss finish is the common choice.", src:'Source: Food — Confectionery', rec:{label:'Food', href:'food.html'}},
    {k:['dairy', 'baby food', 'milk powder', 'infant'], a:"Dairy and baby food need a high-barrier laminate plus tamper-evidence — moisture, oxygen and light all affect shelf life and nutrient stability here, so this is one of the more technically demanding structures we build.", src:'Source: Food — Dairy & Baby Food', rec:{label:'Food', href:'food.html'}},
    {k:['ice cream'], a:"Ice cream packaging (tub lids, wrap film) needs strong grease resistance and good low-temperature flexibility so the film doesn't crack in the freezer.", src:'Source: Food — Ice Cream', rec:{label:'Food', href:'food.html'}},
    {k:['ready meal', 'soup', 'sauce'], a:"Ready meals, soups and sauces that need to be heated or sterilised typically use a retort pouch — a multi-layer laminate rated for high-temperature processing, replacing a can with a lighter, flatter pack.", src:'Source: Food — Ready Meals, Soups & Sauces', rec:{label:'Food', href:'food.html'}},
    {k:['rice'], a:"Rice usually goes into a stand-up or side-gusseted flat-bottom pouch — we've actually won a Dow Packaging Innovation Platinum award for a recyclable flat-bottom rice pouch design.", src:'Source: Food — Rice', rec:{label:'Food', href:'food.html'}},
    {k:['date', 'seed', 'nuts'], a:"Dates, seeds and nuts do well in a resealable stand-up pouch with a moderate moisture/oxygen barrier — enough to prevent rancidity in nuts without over-speccing the laminate.", src:'Source: Food — Seeds & Dates', rec:{label:'Food', href:'food.html'}},
    {k:['spice', 'seasoning', 'masala'], a:"Spices need a strong aroma barrier above all — a foil or high-barrier metallized laminate in a small sachet or stand-up pouch keeps volatile oils from escaping.", src:'Source: Food — Spices', rec:{label:'Food', href:'food.html'}},
    // ---- Beverages ----
    {k:['coffee','aroma'], a:"Coffee pouches typically need a high-barrier metallized or foil laminate to block oxygen, moisture and aroma loss — usually paired with a one-way degassing valve for fresh-roast beans.", src:'Source: Beverages — Coffee', rec:{label:'Beverages', href:'beverages.html'}},
    {k:['tea'], a:"Tea (loose-leaf or sachet) needs a strong aroma barrier similar to coffee, though usually without the degassing valve since tea doesn't off-gas the way fresh coffee does.", src:'Source: Beverages — Tea', rec:{label:'Beverages', href:'beverages.html'}},
    {k:['juice'], a:"Juice usually runs on a spouted stand-up pouch with a light and oxygen barrier laminate — protects flavour and vitamin content without needing the heavier structure retort products use.", src:'Source: Beverages — Juices', rec:{label:'Beverages', href:'beverages.html'}},
    {k:['water', 'sachet water'], a:"Water packaging is one of the simplest structures we run — a basic PE-based film or sachet, since there's no real barrier requirement beyond containing the liquid.", src:'Source: Beverages — Water', rec:{label:'Beverages', href:'beverages.html'}},
    {k:['carbonat', 'soft drink', 'csd', 'soda', 'fizzy'], a:"Carbonated soft drinks need a laminate that can handle internal pressure without seal failure — we build these with reinforced seal areas and a barrier rated for CO2 retention.", src:'Source: Beverages — Carbonated Soft Drinks', rec:{label:'Beverages', href:'beverages.html'}},
    {k:['powdered drink', 'powdered beverage', 'drink mix'], a:"Powdered beverages need a moisture-barrier stand-up pouch, usually with a zipper closure so it stays fresh after opening across multiple uses.", src:'Source: Beverages — Powdered Beverages', rec:{label:'Beverages', href:'beverages.html'}},
    // ---- Healthcare ----
    {k:['tablet', 'solid dose', 'pill'], a:"Solid-dose healthcare products (tablets, capsules) need tamper-evident sachets or pouches with precise dosing accuracy — compatibility with automated pharmaceutical filling lines is the key spec here.", src:'Source: Healthcare — Solids', rec:{label:'Healthcare', href:'healthcare.html'}},
    {k:['supplement', 'protein powder', 'nutraceutical', 'powder sachet'], a:"Powdered supplements and nutraceuticals usually go into single-dose sachets — tamper-evident, precisely dosed, and sized for exact serving control.", src:'Source: Healthcare — Powdery Products', rec:{label:'Healthcare', href:'healthcare.html'}},
    // ---- Personal & household ----
    {k:['wipe', 'wet wipe'], a:"Wet wipes need a strong moisture-barrier laminate with a reliable resealable closure — the whole point is stopping the pack from drying out between uses.", src:'Source: Personal & Household — Personal Care', rec:{label:'Personal & Household Care', href:'personal-household-care.html'}},
    {k:['detergent', 'washing powder', 'household chemical', 'liquid soap'], a:"Detergents and household chemicals need a chemical-resistant laminate — standard food-grade films can degrade against strong surfactants — with fully leak-proof seals.", src:'Source: Personal & Household — Household', rec:{label:'Personal & Household Care', href:'personal-household-care.html'}},
    // ---- Pet food ----
    {k:['dry pet food', 'kibble', 'dry dog food', 'dry cat food'], a:"Dry pet food (kibble) needs a high burst-strength laminate — dense, sharp-edged kibble puts real stress on seams — usually with a resealable zipper for repeat use.", src:'Source: Pet Food — Dry', rec:{label:'Pet Food', href:'pet-food.html'}},
    {k:['wet pet food', 'wet dog food', 'wet cat food'], a:"Wet pet food typically uses a retort pouch structure — a lighter, flatter, shelf-stable alternative to a can, with the same grease and oil resistance.", src:'Source: Pet Food — Wet', rec:{label:'Pet Food', href:'pet-food.html'}},
    {k:['pet food', 'dog', 'cat'], a:"Pet food pouches are built with high burst-strength films and grease resistance for both wet and dry formats, with resealable zipper options for repeat use.", src:'Source: Pet Food product line', rec:{label:'Pet Food', href:'pet-food.html'}},
    // ---- Specialized features ----
    {k:['recyclable','recycle','sustainab','mono'], a:"Yes — we manufacture recyclable, mono-material structures designed to stay within curbside recycling streams, including a design that won a Dow Packaging Innovation Platinum award.", src:'Source: Sustainability & Awards', rec:{label:'Recyclable Packaging', href:'specialized-products.html'}},
    {k:['zipper','slider','reclose'], a:"Our slider zipper closures give a reclosable, reusable opening for multi-serve formats — commonly paired with stand-up pouches.", src:'Source: Specialized Features', rec:{label:'Slider Zipper', href:'specialized-products.html'}},
    {k:['anti-fog','antifog','condensation'], a:"Anti-fog film and coatings prevent condensation build-up on chilled or frozen packs, keeping the product visible through the pack window.", src:'Source: Specialized Features', rec:{label:'Anti-fog Film / Coating', href:'specialized-products.html'}},
    {k:['burst strength', 'puncture', 'heavy', 'sharp'], a:"For dense, heavy or sharp-edged products, we build in extra burst strength with reinforced laminate structures — this is standard on our dry pet food and rice formats too.", src:'Source: Specialized Features', rec:{label:'High Burst Strength Packaging', href:'specialized-products.html'}},
    {k:['high-barrier', 'high barrier', 'oxygen barrier'], a:"High-barrier structures combine metallized or foil layers to block oxygen, moisture and light together — used wherever shelf life is the top priority.", src:'Source: Specialized Features', rec:{label:'High-Barrier Packaging', href:'specialized-products.html'}},
    {k:['laser scor', 'tear', 'easy open'], a:"Laser scoring gives a precise, controlled tear-open line — linear or shaped — without weakening the pack's overall seal integrity.", src:'Source: Specialized Features', rec:{label:'Laser Scoring', href:'specialized-products.html'}},
    {k:['matt', 'gloss', 'finish', 'coating'], a:"Matt and gloss effect coatings are spot or full-surface finishes that change the tactile and visual feel of the pack without altering the underlying barrier — a shelf-presence upgrade.", src:'Source: Specialized Features', rec:{label:'Matt/Gloss Effect Coatings', href:'specialized-products.html'}},
    {k:['perforat', 'breathable', 'fresh produce'], a:"Perforated films give controlled micro-perforation for breathability — mainly used on fresh produce packs that need airflow to avoid condensation and spoilage.", src:'Source: Specialized Features', rec:{label:'Perforated Films', href:'specialized-products.html'}},
    {k:['tactile', 'varnish', 'texture', 'soft touch'], a:"Tactile varnish is a textured spot-coating that adds a premium, touch-led brand cue — popular on healthcare and premium food packaging.", src:'Source: Specialized Features', rec:{label:'Tactile Varnish', href:'specialized-products.html'}},
    {k:['barrier'], a:"Barrier level depends on what you're protecting against — moisture, oxygen, light or aroma. Tell me the product and I can suggest a starting structure.", src:'Source: Packaging Finder'},
    // ---- Company / logistics ----
    {k:['moq','minimum','quantity'], a:"Minimum order quantities depend on format and material — our team can confirm an exact MOQ once we know your product, dimensions and material choice. Happy to start that in the Quote Builder.", src:'Source: Sales team'},
    {k:['brc','certif','quality','iso'], a:"IPP is BRC certified and has received multiple FPA Flexible Packaging Achievement Awards (2022–2025) along with a Dow Packaging Innovation Platinum award.", src:'Source: Certifications & Awards', rec:{label:'Awards & Recognition', href:'awards-recognition.html'}},
    {k:['found','history','established','1999','profile'], a:"IPP was established in 1999 in Jebel Ali Free Zone, Dubai, as part of the Lutfi Group of Companies — starting with a blown-film PE co-extrusion plant.", src:'Source: Company Profile', rec:{label:'Company Profile', href:'company-profile.html'}},
    {k:['vision','mission'], a:"Our mission is to create value for customers, stakeholders and employees by continuously upgrading technology and process knowledge, produced on time and with environmental responsibility. Our vision is to become a globally competitive flexible packaging manufacturer.", src:'Source: Mission & Vision', rec:{label:'Mission & Vision', href:'mission-vision.html'}},
    {k:['export','countr','ship','global'], a:"IPP exports to 23 countries across the Middle East, Africa, Europe, the Americas, South Asia and Oceania from our Dubai facility.", src:'Source: Exports', rec:{label:'Exports', href:'exports.html'}},
    {k:['career','job','vacan','hiring'], a:"IPP regularly hires across production, quality and sales roles in Dubai. The Careers page lists current openings and how to apply.", src:'Source: Careers', rec:{label:'Careers', href:'careers.html'}},
    {k:['csr','blood','environment day','charity','communit'], a:"IPP runs regular CSR programmes including annual blood donation camps, World Environment Day tree planting, and a partnership with the 1 Billion Meals Endowment.", src:'Source: CSR', rec:{label:'Corporate Social Responsibility', href:'csr.html'}},
  ];

  function aiRespond(q){
    const lower = q.toLowerCase();
    const hit = KB.find(item=>item.k.some(k=>lower.includes(k)));
    const bubble = document.createElement('div'); bubble.className='msg user'; bubble.textContent=q; aiBody.appendChild(bubble);
    setTimeout(()=>{
      const reply = document.createElement('div'); reply.className='msg bot';
      let spokenText = '';
      if(hit){
        spokenText = hit.a;
        reply.innerHTML = hit.a + `<span class="src">${hit.src}</span>` + (hit.rec ? `<a class="rec" href="${hit.rec.href}">${hit.rec.label} →</a>` : '');
      } else {
        spokenText = "I don't have a confirmed answer for that in our product library. I'll flag this to our packaging team, or you can start a formal quote and they'll cover every detail.";
        reply.innerHTML = spokenText + `<span class="src">Escalating to a human specialist</span>`;
      }
      aiBody.appendChild(reply); aiBody.scrollTop = aiBody.scrollHeight;
      speak(spokenText);
    },450);
    aiBody.scrollTop = aiBody.scrollHeight;
  }
  const sendBtn = document.getElementById('aiSend'); const input = document.getElementById('aiInput');
  if(sendBtn && input){
    sendBtn.addEventListener('click', ()=>{ if(input.value.trim()){ aiRespond(input.value.trim()); input.value=''; } });
    input.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); sendBtn.click(); } });
  }
  const suggestWrap = document.getElementById('aiSuggest');
  if(suggestWrap) suggestWrap.addEventListener('click', (e)=>{ const b = e.target.closest('button'); if(!b) return; aiRespond(b.dataset.q); });

  /* ---- Voice output: speak bot replies in an English male voice ---- */
  let voiceOn = true;
  let englishMaleVoice = null;
  function pickVoice(){
    if(!window.speechSynthesis) return;
    const voices = speechSynthesis.getVoices();
    if(!voices.length) return;
    const preferredNames = ['Male','Daniel','Google UK English Male','Microsoft Guy','Microsoft David','Arthur','Oliver'];
    englishMaleVoice = voices.find(v=> v.lang && v.lang.startsWith('en') && preferredNames.some(n=> v.name.includes(n)))
      || voices.find(v=> v.lang && v.lang.startsWith('en') && /male/i.test(v.name))
      || voices.find(v=> v.lang === 'en-GB')
      || voices.find(v=> v.lang && v.lang.startsWith('en'))
      || voices[0];
  }
  if(window.speechSynthesis){
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }
  function speak(text){
    if(!voiceOn || !window.speechSynthesis) return;
    try{
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g,''));
      if(englishMaleVoice) u.voice = englishMaleVoice;
      u.lang = 'en-GB'; u.rate = 1; u.pitch = 0.9;
      speechSynthesis.speak(u);
    }catch(e){ /* speech synthesis unavailable — fail silently */ }
  }
  const voiceToggle = document.getElementById('aiVoiceToggle');
  if(voiceToggle){
    voiceToggle.addEventListener('click', ()=>{
      voiceOn = !voiceOn;
      voiceToggle.classList.toggle('off', !voiceOn);
      voiceToggle.setAttribute('aria-label', voiceOn ? 'Mute voice replies' : 'Unmute voice replies');
      if(!voiceOn && window.speechSynthesis) speechSynthesis.cancel();
    });
  }

  /* ---- Voice input: speak to the assistant via microphone ---- */
  const micBtn = document.getElementById('aiMic');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(micBtn){
    if(!SpeechRecognition){
      micBtn.style.display = 'none'; // graceful fallback: hide mic where the browser doesn't support it (e.g. Firefox, older Safari)
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      let listening = false;
      recognition.onresult = (e)=>{
        const transcript = e.results[0][0].transcript;
        input.value = transcript;
        aiRespond(transcript);
        input.value = '';
      };
      recognition.onend = ()=>{ listening = false; micBtn.classList.remove('listening'); };
      recognition.onerror = ()=>{ listening = false; micBtn.classList.remove('listening'); };
      micBtn.addEventListener('click', ()=>{
        if(listening){ recognition.stop(); return; }
        try{
          recognition.start();
          listening = true;
          micBtn.classList.add('listening');
        }catch(e){ /* recognition already running or mic permission denied */ }
      });
    }
  }
})();

/* ---------- AI QUOTE BUILDER ---------- */
(function(){
  const overlay = document.getElementById('quoteOverlay');
  if(!overlay) return;
  const steps = [...document.querySelectorAll('.q-step')]; const progressWrap = document.getElementById('qProgress');
  let curStep = 0; const answers = {};
  const titles = ["What are you packaging?","Choose a material & size","Volume & delivery","Your contact details","Review your request","Thank you"];
  steps.forEach(()=>{ const s = document.createElement('span'); progressWrap.appendChild(s); });
  window.openQuote = function(){ overlay.classList.add('open'); goTo(0); };
  window.closeQuote = function(){ overlay.classList.remove('open'); };
  const quoteCloseBtn = document.getElementById('quoteClose');
  if(quoteCloseBtn) quoteCloseBtn.addEventListener('click', window.closeQuote);
  overlay.addEventListener('click', (e)=>{ if(e.target === overlay) window.closeQuote(); });
  function goTo(i){
    curStep = i; steps.forEach(s=>s.classList.toggle('active', parseInt(s.dataset.step)===i));
    document.getElementById('qTitle').textContent = titles[i];
    [...progressWrap.children].forEach((s,idx)=> s.classList.toggle('done', idx<=i));
    document.getElementById('qBack').style.visibility = i===0 ? 'hidden' : 'visible';
    const nextBtn = document.getElementById('qNext'); const nav = document.getElementById('qNav');
    nav.style.display = (i===steps.length-1) ? 'none' : 'flex';
    nextBtn.textContent = i===4 ? 'Submit Request' : 'Continue';
    if(i===4) buildSummary();
  }
  document.querySelectorAll('.q-option').forEach(opt=>{
    opt.addEventListener('click', ()=>{ const field = opt.dataset.field; document.querySelectorAll(`.q-option[data-field="${field}"]`).forEach(o=>o.classList.remove('sel')); opt.classList.add('sel'); answers[field] = opt.dataset.val; });
  });
  document.getElementById('qNext').addEventListener('click', ()=>{
    if(curStep===1){ answers.dimensions = document.getElementById('qDimensions').value; }
    if(curStep===2){ answers.quantity = document.getElementById('qQuantity').value; answers.destination = document.getElementById('qDestination').value; answers.timeline = document.getElementById('qTimeline').value; }
    if(curStep===3){ answers.name = document.getElementById('qName').value; answers.company = document.getElementById('qCompany').value; answers.email = document.getElementById('qEmail').value; answers.artwork = document.getElementById('qArtwork').value; }
    if(curStep===4){ submitQuote(); return; }
    if(curStep < steps.length-1) goTo(curStep+1);
  });
  function submitQuote(){
    const nextBtn = document.getElementById('qNext');
    nextBtn.disabled = true; nextBtn.textContent = 'Sending…';
    submitToInbox(answers, `New quote request — ${answers.product || 'packaging'}`)
      .then(()=>{ goTo(5); })
      .catch(()=>{
        const link = mailtoFallback(`Quote request — ${answers.product||'packaging'}`, [
          `Product: ${answers.product||'—'}`, `Material: ${answers.material||'—'}`, `Dimensions: ${answers.dimensions||'—'}`,
          `Quantity: ${answers.quantity||'—'}`, `Destination: ${answers.destination||'—'}`, `Timeline: ${answers.timeline||'—'}`,
          `Contact: ${answers.name||'—'} (${answers.company||'—'})`, `Email: ${answers.email||'—'}`, `Artwork notes: ${answers.artwork||'—'}`
        ]);
        document.getElementById('qSummary').innerHTML += `<p class="form-status error" style="margin-top:16px;">Couldn't send automatically. <a href="${link}">Click here to email this request directly</a> instead.</p>`;
      })
      .finally(()=>{ nextBtn.disabled = false; nextBtn.textContent = 'Submit Request'; });
  }
  document.getElementById('qBack').addEventListener('click', ()=>{ if(curStep>0) goTo(curStep-1); });
  function buildSummary(){
    const rows = [['Product', answers.product||'—'],['Material', answers.material||'—'],['Dimensions', answers.dimensions||'—'],['Quantity', answers.quantity||'—'],['Destination', answers.destination||'—'],['Timeline', answers.timeline||'—'],['Contact', (answers.name||'—') + (answers.company ? ' · '+answers.company : '')],['Email', answers.email||'—']];
    document.getElementById('qSummary').innerHTML = rows.map(r=>`<div class="q-summary-row"><span>${r[0]}</span><b>${r[1]}</b></div>`).join('');
  }
})();

/* ---------- CONTACT FORM SUBMISSION ---------- */
(function(){
  const form = document.getElementById('contactForm');
  if(!form) return;
  const status = document.getElementById('contactStatus');
  const btn = document.getElementById('contactSendBtn');
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    btn.disabled = true; btn.textContent = 'Sending…';
    status.className = 'form-status';
    submitToInbox(data, `Website enquiry from ${data.name || 'a visitor'}`)
      .then(()=>{
        status.textContent = "Message sent — we'll be in touch within one business day.";
        status.className = 'form-status success';
        form.reset();
      })
      .catch(()=>{
        const link = mailtoFallback('Website enquiry', [`Name: ${data.name||''}`, `Company: ${data.company||''}`, `Email: ${data.email||''}`, '', data.message||'']);
        status.innerHTML = `Couldn't send automatically. <a href="${link}">Click here to email us directly</a> instead.`;
        status.className = 'form-status error';
      })
      .finally(()=>{ btn.disabled = false; btn.textContent = 'Send Message'; });
  });
})();

/* ---------- FAQ ACCORDION ---------- */
(function(){
  document.querySelectorAll('.faq-item').forEach(item=>{
    const q = item.querySelector('.faq-q');
    if(!q) return;
    q.addEventListener('click', ()=>{
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item.open').forEach(i=>i.classList.remove('open'));
      if(!wasOpen) item.classList.add('open');
    });
  });
})();
