(function () {
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOVER = window.matchMedia('(hover: hover)').matches;
  function mod(n, m) { return ((n % m) + m) % m; }

  /* ---------- Rotating headline ---------- */
  var sw = [].slice.call(document.querySelectorAll('.swap span')), k = 0;
  if (!RM && sw.length) {
    setInterval(function () {
      var prev = sw[k];
      prev.classList.remove('on'); prev.classList.add('out');
      setTimeout(function () { prev.classList.remove('out'); }, 700);
      k = (k + 1) % sw.length;
      sw[k].classList.add('on');
    }, 2800);
  }

  /* ---------- Counters ---------- */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    if (RM) return;
    var end = +el.getAttribute('data-count');
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      var t0 = performance.now();
      (function step(t) {
        var p = Math.min(1, (t - t0) / 1100);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
    io.observe(el);
  });

  /* ---------- Scroll reveal ---------- */
  var rvs = [].slice.call(document.querySelectorAll('.rv'));
  if ('IntersectionObserver' in window && !RM) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.remove('pre'); rio.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rvs.forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.92) { el.classList.add('pre'); rio.observe(el); }
    });
  }

  /* ---------- Nav highlight ---------- */
  var links = [].slice.call(document.querySelectorAll('.nav a'));
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('act', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) nio.observe(s); });
  }

  /* ---------- Scroll progress + pipeline rail ---------- */
  var sp = document.getElementById('sp'), rail = document.getElementById('stages');
  var stages = [].slice.call(rail.querySelectorAll('.stage')), ticking = false;
  function onScroll() {
    ticking = false;
    var de = document.documentElement, max = de.scrollHeight - window.innerHeight;
    sp.style.width = (max > 0 ? Math.min(1, window.scrollY / max) * 100 : 0) + '%';
    var r = rail.getBoundingClientRect(), mid = window.innerHeight * 0.58;
    rail.style.setProperty('--full', r.height + 'px');
    rail.style.setProperty('--p', Math.min(Math.max(mid - r.top - 20, 0), r.height) + 'px');
    stages.forEach(function (li) { li.classList.toggle('on', li.getBoundingClientRect().top + 30 < mid); });
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  onScroll();

  /* ---------- Hero pointer effects ---------- */
  var hero = document.getElementById('hero'), tilt = document.getElementById('tilt');
  if (HOVER && !RM) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--gx', (e.clientX - r.left) + 'px');
      hero.style.setProperty('--gy', (e.clientY - r.top) + 'px');
    });
    tilt.addEventListener('pointermove', function (e) {
      var r = tilt.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      tilt.style.setProperty('--ry', ((x - 0.5) * 14).toFixed(2) + 'deg');
      tilt.style.setProperty('--rx', ((0.5 - y) * 12).toFixed(2) + 'deg');
      tilt.style.setProperty('--sx', (x * 100) + '%');
      tilt.style.setProperty('--sy', (y * 100) + '%');
    });
    tilt.addEventListener('pointerleave', function () {
      tilt.style.setProperty('--rx', '0deg'); tilt.style.setProperty('--ry', '0deg');
    });
  }

  /* ---------- Glow cards ---------- */
  document.addEventListener('pointermove', function (e) {
    var el = e.target.closest ? e.target.closest('.glow') : null;
    if (!el) return;
    var r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });

  /* ---------- Time zones + route map ---------- */
  var CITIES = [
    { city: 'Noida', name: 'Noida, India', tz: 'Asia/Kolkata', lon: 77.3, lat: 28.6, col: 'mint', lab: [12, 22, 'left'] },
    { city: 'Dubai', name: 'Dubai, UAE', tz: 'Asia/Dubai', lon: 55.3, lat: 25.2, col: 'sun', lab: [10, 22, 'left'] },
    { city: 'Riyadh', name: 'Riyadh, Saudi Arabia', tz: 'Asia/Riyadh', lon: 46.7, lat: 24.7, col: 'hot', lab: [-10, 22, 'right'] },
    { city: 'Rome', name: 'Rome, Italy', tz: 'Europe/Rome', lon: 12.5, lat: 41.9, col: 'sky', lab: [10, 20, 'left'] },
    { city: 'London', name: 'London, UK', tz: 'Europe/London', lon: -0.1, lat: 51.5, col: 'orchid', lab: [-10, -2, 'right'] },
    { city: 'Toronto', name: 'Toronto, Canada', tz: 'America/Toronto', lon: -79.4, lat: 43.7, col: 'mint', lab: [-10, -4, 'right'] },
    { city: 'New York', name: 'New York, USA', tz: 'America/New_York', lon: -74, lat: 40.7, col: 'sun', lab: [12, 22, 'left'] },
    { city: 'Houston', name: 'Houston, Texas', tz: 'America/Chicago', lon: -95.4, lat: 29.8, col: 'hot', lab: [10, 22, 'left'] },
    { city: 'Kuala Lumpur', name: 'Kuala Lumpur, Malaysia', tz: 'Asia/Kuala_Lumpur', lon: 101.7, lat: 3.1, col: 'sky', lab: [-10, -6, 'right'] },
    { city: 'Singapore', name: 'Singapore', tz: 'Asia/Singapore', lon: 103.8, lat: 1.35, col: 'orchid', lab: [12, 20, 'left'] },
    { city: 'Sydney', name: 'Sydney, Australia', tz: 'Australia/Sydney', lon: 151.2, lat: -33.9, col: 'mint', lab: [-12, 4, 'right'] }
  ];
  var OPEN = 540, CLOSE = 1080, IST = 330, hot = -1;

  function offsetMin(tz, d) {
    var parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).formatToParts(d);
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    return Math.round((Date.UTC(+o.year, +o.month - 1, +o.day, +o.hour, +o.minute, +o.second) - Math.floor(d.getTime() / 1000) * 1000) / 60000);
  }
  function fmtOffset(m) {
    var s = m < 0 ? '-' : '+', a = Math.abs(m), h = Math.floor(a / 60), mm = a % 60;
    return 'UTC' + s + h + (mm ? ':' + String(mm).padStart(2, '0') : '');
  }
  function pct(min) { return (min / 1440 * 100) + '%'; }

  var host = document.getElementById('zones');
  var rows = CITIES.map(function (c, i) {
    var row = document.createElement('div'); row.className = 'zrow'; row.tabIndex = 0;
    row.style.setProperty('--cc', 'var(--' + c.col + ')');
    var label = document.createElement('div'); label.className = 'zlabel';
    var top = document.createElement('div'); top.className = 'ztop';
    var city = document.createElement('span'); city.className = 'zcity'; city.textContent = c.name;
    var pill = document.createElement('span'); pill.className = 'pill';
    top.appendChild(city); top.appendChild(pill);
    var time = document.createElement('span'); time.className = 'ztime';
    label.appendChild(top); label.appendChild(time);
    var track = document.createElement('div'); track.className = 'track';
    row.appendChild(label); row.appendChild(track);
    host.appendChild(row);
    row.addEventListener('pointerenter', function () { setHot(i); });
    row.addEventListener('pointerleave', function () { setHot(-1); });
    row.addEventListener('focus', function () { setHot(i); });
    row.addEventListener('blur', function () { setHot(-1); });
    return { pill: pill, time: time, track: track, row: row, clock: '' };
  });
  function setHot(i) {
    hot = i;
    rows.forEach(function (r, j) { r.row.classList.toggle('hot', j === i); });
    if (RM) draw(0);
  }
  function renderZones() {
    var now = new Date(), mins = Math.floor(now.getTime() / 60000), istNow = mod(mins + IST, 1440);
    rows.forEach(function (r, i) {
      var off = offsetMin(CITIES[i].tz, now), local = mod(mins + off, 1440);
      var hh = String(Math.floor(local / 60)).padStart(2, '0'), mm = String(local % 60).padStart(2, '0');
      r.clock = hh + ':' + mm;
      r.time.textContent = r.clock + ' · ' + fmtOffset(off);
      var open = local >= OPEN && local < CLOSE;
      r.pill.textContent = open ? 'Open' : 'Closed';
      r.pill.className = 'pill' + (open ? ' open' : '');
      var start = mod(OPEN - off + IST, 1440), len = CLOSE - OPEN;
      var segs = start + len > 1440 ? [[start, 1440 - start], [0, start + len - 1440]] : [[start, len]];
      r.track.textContent = '';
      segs.forEach(function (s) {
        var d = document.createElement('div'); d.className = 'seg';
        d.style.left = pct(s[0]); d.style.width = pct(s[1]);
        r.track.appendChild(d);
      });
      var n = document.createElement('div'); n.className = 'now';
      n.style.left = 'calc(' + pct(istNow) + ' - 1px)';
      r.track.appendChild(n);
    });
    if (RM) draw(0);
  }
  renderZones();
  setInterval(renderZones, 30000);

  /* Coarse land polygons [lon, lat] for the dot map */
  var LAND = [
    [[-9,37],[-9,43.5],[-2,43.5],[-4.5,48.5],[2,51],[8,54],[9,57],[12,56],[14,54],[21,55],[24,59],[30,60],[30,66],[40,67],[60,70],[130,70],[130,43],[126,38],[122,40],[121,37],[122,31],[118,24],[110,20],[106,18],[109,12],[105,9],[100.5,13.5],[100,6],[103.5,1.3],[101,3],[98,8],[98,16],[94,19],[91,22.5],[87,21],[80,15.5],[79,10],[77.5,8],[73.5,17],[72.5,21],[68,23.5],[62,25],[57,25.7],[56.3,27],[51,29],[48,30],[44,33],[40,36.5],[36,36],[30,36.5],[26.5,38],[26.5,41],[28.5,41.5],[24,40],[23,38],[19.5,41.5],[15,44.5],[13,45.5],[12.5,44],[18.5,40],[16,38],[12,41.5],[10,44],[6,43.2],[3,43],[3,42],[0,39],[-1,37.5],[-5,36]],
    [[5,59],[5,62],[11,65],[14,68],[20,70],[28,71],[30,69.5],[29,66],[25,65.5],[22,63],[18.5,60.5],[19,59],[17,56.5],[13,55.5],[11,58.5],[8,58]],
    [[-5,50],[1.5,51],[1.5,53],[-0.5,55],[-2,57.5],[-3,58.5],[-6,58],[-6,56],[-3,54.5],[-4.5,53],[-5,51.7]],
    [[-10,52],[-6,52],[-6,54.5],[-8,55],[-10,54]],
    [[-17,21],[-17,15],[-13,10],[-8,5],[0,5],[8,4],[9.5,3],[10,-2],[12,-6],[13,-10],[12,-17],[15,-27],[18,-33],[20,-35],[26,-34],[32,-28],[35,-24],[35,-18],[40,-15],[40,-10],[40,-3],[44,1],[51,11.5],[43,12.5],[39,16],[37,21],[34,28],[32.5,30],[32,31.3],[25,31.5],[20,32],[15,32.5],[10,34],[10.5,37],[3,36.8],[-2,35.2],[-6,35.8],[-9.5,32],[-13,28],[-16,24]],
    [[34.5,29.5],[35,28],[39,22],[42.5,16],[43.3,12.7],[45,12.8],[52,16],[55,17.5],[57.5,19],[59.8,22.5],[56.5,24.5],[56.3,26.2],[54,24],[51.5,24.5],[50,26],[48,29.5],[44,30],[38,31.5],[36,33]],
    [[79.8,9.8],[81.8,7.5],[81,6],[80,6],[79.8,7.5]],
    [[95,5.5],[98,4],[104,-1],[106,-3],[105.8,-5.8],[102,-4],[98,0.5],[95.5,3.5]],
    [[109,1.5],[111,2],[114,4.5],[117,7],[119,5],[118,1],[116.5,-3],[114,-4],[110,-3],[109,-1]],
    [[105.5,-6.5],[114.5,-7.8],[114.5,-8.7],[106,-7.4]],
    [[120,18.5],[122,18.3],[122,14],[124,13],[121,13.5],[120,15]],
    [[122,8.5],[126,9],[126.5,6.5],[124,6.5],[122,7]],
    [[-101,66],[-62,66],[-61,56],[-57,52],[-60,47],[-64,45],[-67,44.8],[-70,43.5],[-70,41.8],[-74,40.5],[-75.5,38],[-76,35],[-81,31.5],[-80,27],[-80.5,25.2],[-82,26.5],[-83,29.5],[-85.5,30],[-89,30.2],[-91,29.2],[-94,29.5],[-97,27.5],[-97.5,22],[-96,19],[-94.5,18.3],[-91,19],[-90.5,21],[-87,21.5],[-88,18],[-88.5,15.8],[-84,15.5],[-83.3,11],[-81.8,9],[-79,9.2],[-77.4,8.5],[-78,7],[-80,7.3],[-83,8.3],[-86,11],[-88,13],[-92,14.5],[-96,15.8],[-101,17.8],[-105,20],[-109,24],[-112,31],[-117,33],[-121,35],[-124,40],[-124,48],[-128,52],[-135,58],[-141,60],[-141,70]],
    [[-81,-5],[-80.5,-1],[-78.5,1.5],[-77.4,8.5],[-75,11],[-72,12],[-71,11.5],[-67,10.5],[-61,10.5],[-60,8],[-55,6],[-52,5],[-50,1.5],[-48,-1],[-44,-2.5],[-39,-3.5],[-35,-5.5],[-35,-9],[-37,-12],[-39,-17],[-41,-22],[-45,-24],[-48,-26],[-49,-29],[-53,-34],[-57,-35],[-57,-38],[-62,-39],[-65,-41],[-64,-46],[-68,-50],[-70,-54],[-74,-50],[-73,-40],[-71,-30],[-70,-18],[-76,-14],[-81,-6]],
    [[113,-22],[114,-26],[115,-34],[118,-35],[123,-34],[129,-31.5],[132,-32],[135,-35],[138,-35.5],[140,-38],[144,-38.5],[147,-38],[150,-37],[151,-33],[153,-28],[153,-25],[150,-22],[146,-19],[145,-15],[143,-11],[142,-11],[141,-17],[136,-15],[135,-12],[131,-12],[129,-15],[125,-14],[122,-17],[120,-20],[114,-22]]
  ];
  var WATER = [
    [[28,41.5],[41,41],[41.5,43],[38,45],[34,46],[30,46],[28,44]],
    [[47,45],[53,45],[54,41],[53.5,37],[50,37],[49,40],[47,43]]
  ];
  function inside(x, y, poly) {
    var c = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c;
    }
    return c;
  }
  function isLand(lon, lat) {
    for (var w = 0; w < WATER.length; w++) if (inside(lon, lat, WATER[w])) return false;
    for (var l = 0; l < LAND.length; l++) if (inside(lon, lat, LAND[l])) return true;
    return false;
  }

  var cv = document.getElementById('map'), ctx = cv.getContext('2d');
  var LON0 = -108, LON1 = 158, LAT0 = 64, LAT1 = -40, PAD = 26;
  var W = 0, H = 0, dots = [], nodes = [], COL = {};
  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    function g(n) { return cs.getPropertyValue(n).trim(); }
    COL = { dot: g('--dot'), ink: g('--ink'), muted: g('--muted'), mint: g('--mint'), sun: g('--sun'), hot: g('--hot'), sky: g('--sky'), orchid: g('--orchid') };
  }
  function layout() {
    var r = cv.getBoundingClientRect();
    if (!r.width) return;
    W = r.width; H = r.height;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var step = W < 560 ? 8 : 11;
    dots = [];
    for (var x = PAD; x <= W - PAD; x += step) {
      for (var y = PAD; y <= H - PAD; y += step) {
        var lon = LON0 + (x - PAD) / (W - 2 * PAD) * (LON1 - LON0);
        var lat = LAT0 - (y - PAD) / (H - 2 * PAD) * (LAT0 - LAT1);
        if (isLand(lon, lat)) dots.push([x, y, Math.random() * 6.28]);
      }
    }
    nodes = CITIES.map(function (c) {
      return { x: PAD + (c.lon - LON0) / (LON1 - LON0) * (W - 2 * PAD), y: PAD + (LAT0 - c.lat) / (LAT0 - LAT1) * (H - 2 * PAD) };
    });
    readColors();
    draw(0);
  }
  function ctrl(a, b) {
    return { x: (a.x + b.x) / 2, y: Math.max(10, (a.y + b.y) / 2 - Math.abs(b.x - a.x) * 0.26 - 16) };
  }
  function draw(t) {
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = COL.dot;
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      ctx.globalAlpha = RM ? 0.75 : 0.55 + 0.3 * Math.sin(t / 900 + d[2]);
      ctx.fillRect(d[0] - 1.2, d[1] - 1.2, 2.6, 2.6);
    }
    ctx.globalAlpha = 1;
    var a = nodes[0];
    for (var n = 1; n < nodes.length; n++) {
      var b = nodes[n], c = ctrl(a, b), color = COL[CITIES[n].col], on = hot === n;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(c.x, c.y, b.x, b.y);
      ctx.strokeStyle = color; ctx.lineWidth = on ? 2.4 : 1.3; ctx.globalAlpha = hot === -1 || on ? (on ? 1 : 0.7) : 0.2;
      ctx.setLineDash(on ? [] : [5, 6]); ctx.lineDashOffset = RM ? 0 : -t / 45; ctx.stroke(); ctx.setLineDash([]);
      if (!RM) {
        var p = ((t / 2800) + n * 0.21) % 1, q = 1 - p;
        var px = q * q * a.x + 2 * q * p * c.x + p * p * b.x, py = q * q * a.y + 2 * q * p * c.y + p * p * b.y;
        ctx.globalAlpha = hot === -1 || on ? 1 : 0.25;
        ctx.fillStyle = color; ctx.beginPath(); ctx.arc(px, py, on ? 4.2 : 3, 0, 6.283); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.font = '500 12px "JetBrains Mono", ui-monospace, monospace';
    for (var m = 0; m < nodes.length; m++) {
      var nd = nodes[m], cc = COL[CITIES[m].col], act = hot === m, dim = hot !== -1 && !act && m !== 0;
      ctx.globalAlpha = dim ? 0.35 : 1;
      if (!RM) {
        var rr = ((t / 1600) + m * 0.2) % 1;
        ctx.strokeStyle = cc; ctx.globalAlpha = (1 - rr) * (dim ? 0.15 : 0.55); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(nd.x, nd.y, 6 + rr * 18, 0, 6.283); ctx.stroke();
        ctx.globalAlpha = dim ? 0.35 : 1;
      }
      ctx.fillStyle = cc; ctx.beginPath(); ctx.arc(nd.x, nd.y, m === 0 ? 7 : (act ? 7 : 5), 0, 6.283); ctx.fill();
      ctx.fillStyle = COL.ink;
      if (W < 560 && m !== 0 && !act) continue;
      ctx.textAlign = CITIES[m].lab[2];
      var txt = CITIES[m].city + (act || m === 0 && hot === -1 ? '  ' + rows[m].clock : '');
      ctx.fillText(txt, nd.x + CITIES[m].lab[0], nd.y + CITIES[m].lab[1]);
    }
    ctx.globalAlpha = 1;
  }
  var vis = true, running = false;
  function loop(t) {
    if (!vis || document.hidden) { running = false; return; }
    draw(t); requestAnimationFrame(loop);
  }
  function start() { if (!running && !RM) { running = true; requestAnimationFrame(loop); } }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) start(); }).observe(cv);
  }
  document.addEventListener('visibilitychange', start);
  cv.addEventListener('pointermove', function (e) {
    var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, best = -1, bd = 26;
    nodes.forEach(function (nd, i) { var d = Math.hypot(nd.x - x, nd.y - y); if (d < bd) { bd = d; best = i; } });
    if (best !== hot) setHot(best);
  });
  cv.addEventListener('pointerleave', function () { setHot(-1); });
  if ('ResizeObserver' in window) new ResizeObserver(layout).observe(cv); else window.addEventListener('resize', layout);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { readColors(); draw(0); });
  new MutationObserver(function () { readColors(); draw(0); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  layout(); start();


  /* ---------- Cursor ring, tilt, magnetic buttons, click sparks ---------- */
  var PAL = ['mint', 'sun', 'hot', 'sky', 'orchid'];
  if (HOVER && !RM) {
    document.addEventListener('pointermove', function (e) {
      var el = e.target.closest && e.target.closest('.glow');
      if (!el) return;
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--ry', ((x - 0.5) * 10).toFixed(1) + 'deg');
      el.style.setProperty('--rx', ((0.5 - y) * 8).toFixed(1) + 'deg');
    });
    document.addEventListener('pointerout', function (e) {
      var el = e.target.closest && e.target.closest('.glow');
      if (el && !el.contains(e.relatedTarget)) { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); }
    });

    document.querySelectorAll('.btn, .copy').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--tx', ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px');
        el.style.setProperty('--ty', ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + 'px');
      });
      el.addEventListener('pointerleave', function () { el.style.setProperty('--tx', '0px'); el.style.setProperty('--ty', '0px'); });
    });
  }

  function burst(x, y) {
    for (var i = 0; i < 14; i++) {
      var p = document.createElement('i');
      p.style.cssText = 'position:fixed;left:' + x + 'px;top:' + y + 'px;width:7px;height:7px;border-radius:' + (i % 3 ? '50%' : '2px') + ';background:var(--' + PAL[i % PAL.length] + ');pointer-events:none;z-index:70';
      document.body.appendChild(p);
      var a = Math.PI * 2 * i / 14 + Math.random() * 0.4, d = 44 + Math.random() * 56;
      var an = p.animate([
        { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + (Math.cos(a) * d).toFixed(1) + 'px), calc(-50% + ' + (Math.sin(a) * d).toFixed(1) + 'px)) scale(0) rotate(180deg)', opacity: 0 }
      ], { duration: 650 + Math.random() * 300, easing: 'cubic-bezier(0.2,0.7,0.2,1)' });
      an.onfinish = (function (el) { return function () { el.remove(); }; })(p);
    }
  }
  document.addEventListener('click', function (e) {
    if (RM || !e.target.closest) return;
    if (e.target.closest('.btn,.copy,.tags li,.glow,.stage,.chip,.stats>div,.mq-group span,.ch')) burst(e.clientX, e.clientY);
  });

  /* ---------- Copy buttons ---------- */
  var status = document.getElementById('cstatus');
  function fallback(el) {
    try { var rg = document.createRange(); rg.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(rg); } catch (e) {}
    status.textContent = 'Selected. Press Ctrl+C (or Cmd+C) to copy.';
  }
  document.querySelectorAll('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var el = document.getElementById(btn.getAttribute('data-target')), text = el.textContent.trim();
      function ok() {
        status.textContent = 'Copied ' + text;
        btn.textContent = 'Copied'; btn.classList.add('done');
        setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('done'); }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok).catch(function () { fallback(el); });
      else fallback(el);
    });
  });
})();

(function () {
  var cv = document.getElementById('space'), c = cv.getContext('2d');
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, stars = [], shoots = [], nextShoot = 2500;
  var TINT = ['#FFFFFF', '#CFE3FF', '#FFE9B8', '#FFC6E0', '#B9E8FF'];
  var DEPTH = [0.02, 0.05, 0.11], SIZE = [0.7, 1.1, 1.7];
  function init() {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(W * H / 5200);
    stars = [];
    for (var i = 0; i < n; i++) {
      var r = Math.random(), l = r < 0.6 ? 0 : (r < 0.88 ? 1 : 2);
      stars.push({ x: Math.random() * W, y: Math.random() * H, l: l, r: SIZE[l] * (0.7 + Math.random() * 0.6), p: Math.random() * 6.28, s: 0.6 + Math.random() * 1.8, c: TINT[Math.floor(Math.random() * TINT.length)] });
    }
    paint(0);
  }
  function paint(t) {
    c.clearRect(0, 0, W, H);
    var sy = window.scrollY || 0;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i], y = (s.y - sy * DEPTH[s.l]) % H;
      if (y < 0) y += H;
      c.globalAlpha = RM ? 0.75 : 0.45 + 0.5 * Math.sin(t / 1000 * s.s + s.p);
      c.fillStyle = s.c;
      if (s.l === 2) { c.shadowColor = s.c; c.shadowBlur = 6; } else { c.shadowBlur = 0; }
      c.beginPath(); c.arc(s.x, y, s.r, 0, 6.283); c.fill();
    }
    c.shadowBlur = 0;
    for (var k = shoots.length - 1; k >= 0; k--) {
      var o = shoots[k], age = (t - o.t0) / o.life;
      if (age >= 1) { shoots.splice(k, 1); continue; }
      var hx = o.x + o.vx * (t - o.t0), hy = o.y + o.vy * (t - o.t0);
      var tx = hx - o.vx * 220, ty = hy - o.vy * 220;
      var g = c.createLinearGradient(hx, hy, tx, ty);
      g.addColorStop(0, 'rgba(255,255,255,' + (1 - age) + ')');
      g.addColorStop(1, 'rgba(92,200,255,0)');
      c.globalAlpha = 1; c.strokeStyle = g; c.lineWidth = 2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(hx, hy); c.lineTo(tx, ty); c.stroke();
    }
    c.globalAlpha = 1;
  }
  function frame(t) {
    if (!document.hidden) {
      if (t > nextShoot) {
        nextShoot = t + 3500 + Math.random() * 6000;
        var sp = 0.9 + Math.random() * 0.5;
        shoots.push({ x: W * (0.35 + Math.random() * 0.65), y: Math.random() * H * 0.45, vx: -sp, vy: sp * 0.55, t0: t, life: 900 });
      }
      paint(t);
    }
    requestAnimationFrame(frame);
  }
  init();
  window.addEventListener('resize', init);
  if (RM) { window.addEventListener('scroll', function () { paint(0); }, { passive: true }); }
  else { requestAnimationFrame(frame); }
})();

(function () {
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gfx = [].slice.call(document.querySelectorAll('.gfx'));
  if ('IntersectionObserver' in window && !RM) {
    var go = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('go'); go.unobserve(e.target); } });
    }, { threshold: 0.3 });
    gfx.forEach(function (g) { go.observe(g); });
  }
  var ed = document.getElementById('editor');
  if (!ed) return;
  var code = ed.querySelector('.ed-code'), tabs = [].slice.call(ed.querySelectorAll('.ed-tabs button'));
  var FILES = [
    ['<span class="t">&lt;section</span> <span class="p">class</span>=<span class="s">"hero"</span><span class="t">&gt;</span>',
     '  <span class="t">&lt;h1&gt;</span>Hello, I&#39;m Aditya<span class="t">&lt;/h1&gt;</span>',
     '  <span class="t">&lt;p&gt;</span>Sales meets code.<span class="t">&lt;/p&gt;</span>',
     '<span class="t">&lt;/section&gt;</span>'],
    ['<span class="t">.hero</span> {',
     '  <span class="p">display</span>: <span class="s">grid</span>;',
     '  <span class="p">place-items</span>: <span class="s">center</span>;',
     '  <span class="p">gap</span>: <span class="s">1rem</span>;',
     '}'],
    ['<span class="k">const</span> markets = [<span class="s">"India"</span>, <span class="s">"UAE"</span>, <span class="s">"USA"</span>];',
     '<span class="k">function</span> <span class="f">closeDeal</span>(client) {',
     '  <span class="k">return</span> client + <span class="s">" signed"</span>;',
     '}',
     '<span class="f">closeDeal</span>(markets[<span class="s">0</span>]);'],
    ['<span class="k">public class</span> <span class="f">Main</span> {',
     '  <span class="k">public static void</span> <span class="f">main</span>(String[] args) {',
     '    System.out.<span class="f">println</span>(<span class="s">"Deal closed"</span>);',
     '  }',
     '}'],
    ['<span class="p">You</span>     Draft a follow-up email for a new client.',
     '<span class="k">Claude</span>  Here is a first draft:',
     '<span class="c">         "Thanks for your time today. As discussed,</span>',
     '<span class="c">          here is the proposal and the next steps."</span>']
  ];
  var cur = 0, paused = false;
  function show(i) {
    cur = i;
    tabs.forEach(function (b, j) { b.classList.toggle('on', j === i); b.setAttribute('aria-selected', j === i ? 'true' : 'false'); });
    code.innerHTML = FILES[i].map(function (l, k) { return '<span class="ln" style="--i:' + k + '">' + l + '</span>'; }).join('');
  }
  tabs.forEach(function (b, i) { b.addEventListener('click', function () { show(i); }); });
  ed.addEventListener('pointerenter', function () { paused = true; });
  ed.addEventListener('pointerleave', function () { paused = false; });
  ed.addEventListener('focusin', function () { paused = true; });
  ed.addEventListener('focusout', function () { paused = false; });
  show(0);
  if (!RM) setInterval(function () { if (!paused && !document.hidden) show((cur + 1) % FILES.length); }, 5200);
})();
