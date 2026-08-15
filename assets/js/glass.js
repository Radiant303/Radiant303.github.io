/* ============================================================
 * 液态玻璃（思路来自 shuding/svg-shaders · liquid-glass，MIT）
 * 顶层声明即全局，供 index.js / post.js 调用 attachGlass。
 * ==========================================================*/
'use strict';

var NS = 'http://www.w3.org/2000/svg';
var XL = 'http://www.w3.org/1999/xlink';

function smoothStep(a, b, t) {
  t = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
function sdfRoundRect(x, y, w, h, r) {
  var qx = Math.abs(x) - w + r, qy = Math.abs(y) - h + r;
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r;
}

var supported = CSS.supports('backdrop-filter', 'url("#lg-probe")');
if (!supported) document.documentElement.classList.add('glass-fallback');

var svgRoot = null, defs = null, seq = 0;
function ensureSvg() {
  if (svgRoot) return;
  svgRoot = document.createElementNS(NS, 'svg');
  svgRoot.setAttribute('width', '0');
  svgRoot.setAttribute('height', '0');
  svgRoot.setAttribute('aria-hidden', 'true');
  svgRoot.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;overflow:hidden';
  defs = document.createElementNS(NS, 'defs');
  svgRoot.appendChild(defs);
  document.body.insertBefore(svgRoot, document.body.firstChild);
}

function buildMap(w, h, dpr, fragment) {
  var cw = Math.max(2, Math.round(w * dpr));
  var ch = Math.max(2, Math.round(h * dpr));
  var canvas = document.createElement('canvas');
  canvas.width = cw; canvas.height = ch;
  var ctx = canvas.getContext('2d');
  var img = ctx.createImageData(cw, ch);
  var data = img.data;
  var raw = new Float32Array(cw * ch * 2);
  var max = 0.001;
  for (var y = 0, p = 0; y < ch; y++) {
    for (var x = 0; x < cw; x++, p += 2) {
      var pos = fragment(x / cw, y / ch);
      var dx = pos.x * w - (x / cw) * w;
      var dy = pos.y * h - (y / ch) * h;
      raw[p] = dx; raw[p + 1] = dy;
      if (Math.abs(dx) > max) max = Math.abs(dx);
      if (Math.abs(dy) > max) max = Math.abs(dy);
    }
  }
  for (var i = 0, q = 0; i < data.length; i += 4, q += 2) {
    data[i]     = (0.5 + 0.5 * raw[q] / max) * 255;
    data[i + 1] = (0.5 + 0.5 * raw[q + 1] / max) * 255;
    data[i + 2] = 0;
    data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return { url: canvas.toDataURL('image/png'), scale: 2 * max };
}

function buildMask(w, h, dpr, radius) {
  var cw = Math.max(2, Math.round(w * dpr));
  var ch = Math.max(2, Math.round(h * dpr));
  var canvas = document.createElement('canvas');
  canvas.width = cw; canvas.height = ch;
  var ctx = canvas.getContext('2d');
  var r = Math.min(radius * dpr, cw / 2, ch / 2);
  var o = 2 * dpr;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(-o, -o, cw + 2 * o, ch + 2 * o, r + o);
  } else {
    var rr = r + o, x0 = -o, y0 = -o, x1 = cw + o, y1 = ch + o;
    ctx.moveTo(x0 + rr, y0);
    ctx.arcTo(x1, y0, x1, y1, rr);
    ctx.arcTo(x1, y1, x0, y1, rr);
    ctx.arcTo(x0, y1, x0, y0, rr);
    ctx.arcTo(x0, y0, x1, y0, rr);
    ctx.closePath();
  }
  ctx.fillStyle = '#fff';
  ctx.fill();
  return canvas.toDataURL('image/png');
}

function makeFilter(w, h) {
  var id = 'lg-' + (seq++);
  var f = document.createElementNS(NS, 'filter');
  f.setAttribute('id', id);
  f.setAttribute('filterUnits', 'userSpaceOnUse');
  f.setAttribute('color-interpolation-filters', 'sRGB');
  f.setAttribute('x', '0'); f.setAttribute('y', '0');
  f.setAttribute('width', w); f.setAttribute('height', h);
  var fe = document.createElementNS(NS, 'feImage');
  fe.setAttribute('result', 'map');
  fe.setAttribute('preserveAspectRatio', 'none');
  fe.setAttribute('width', w); fe.setAttribute('height', h);
  var dm = document.createElementNS(NS, 'feDisplacementMap');
  dm.setAttribute('in', 'SourceGraphic');
  dm.setAttribute('in2', 'map');
  dm.setAttribute('xChannelSelector', 'R');
  dm.setAttribute('yChannelSelector', 'G');
  dm.setAttribute('result', 'disp');
  var feMask = document.createElementNS(NS, 'feImage');
  feMask.setAttribute('result', 'mask');
  feMask.setAttribute('preserveAspectRatio', 'none');
  feMask.setAttribute('width', w); feMask.setAttribute('height', h);
  var comp = document.createElementNS(NS, 'feComposite');
  comp.setAttribute('in', 'disp');
  comp.setAttribute('in2', 'mask');
  comp.setAttribute('operator', 'in');
  f.appendChild(fe); f.appendChild(dm); f.appendChild(feMask); f.appendChild(comp);
  defs.appendChild(f);
  return { id: id, node: f, fe: fe, dm: dm, feMask: feMask };
}

function debounce(fn, ms) {
  var t = null;
  return function () { clearTimeout(t); t = setTimeout(fn, ms); };
}

function glassFragment(w, h, opts) {
  var R = Math.min(opts.radius, Math.min(w, h) / 2);
  var B = opts.bezel, rim = opts.rim, mag = opts.mag;
  return function (u, v) {
    var px = (u - 0.5) * w, py = (v - 0.5) * h;
    var d = sdfRoundRect(px, py, w / 2, h / 2, R);
    if (d > 1.5) return { x: u, y: v };
    var s = smoothStep(0, -B, d);
    var pull = rim * (1 - s) * (1 - s);
    var nx = px / (w / 2), ny = py / (h / 2);
    return {
      x: 0.5 + (u - 0.5) * (1 - mag) - (nx * pull) / w,
      y: 0.5 + (v - 0.5) * (1 - mag) - (ny * pull) / h
    };
  };
}

function attachGlass(el) {
  if (!supported) return;
  ensureSvg();
  var opts = {
    radius: parseFloat(el.dataset.radius || '24'),
    bezel: parseFloat(el.dataset.bezel || '26'),
    rim: parseFloat(el.dataset.rim || '7'),
    mag: parseFloat(el.dataset.mag || '0.015')
  };
  var filter = null;
  var build = function () {
    /* 用 offsetWidth/Height 而不是 getBoundingClientRect：后者把 CSS transform
       （滑块初始的 scale(.85)）也算进去，会把位移图做成错误的尺寸，
       导致玻璃刚出现的一瞬折射区域错位 */
    var w = el.offsetWidth, h = el.offsetHeight;
    if (w < 4 || h < 4) return;
    var dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth <= 700 ? 1 : 1.5);
    var map = buildMap(w, h, dpr, glassFragment(w, h, opts));
    map.mask = buildMask(w, h, dpr, opts.radius);
    var created = !filter;
    if (created) filter = makeFilter(w, h);
    filter.node.setAttribute('width', w);
    filter.node.setAttribute('height', h);
    filter.fe.setAttribute('width', w);
    filter.fe.setAttribute('height', h);
    filter.fe.setAttribute('href', map.url);
    filter.fe.setAttributeNS(XL, 'xlink:href', map.url);
    filter.dm.setAttribute('scale', map.scale.toFixed(2));
    filter.feMask.setAttribute('width', w);
    filter.feMask.setAttribute('height', h);
    filter.feMask.setAttribute('href', map.mask);
    filter.feMask.setAttributeNS(XL, 'xlink:href', map.mask);
    if (created) {
      requestAnimationFrame(function () {
        var bf = 'url(#' + filter.id + ')';
        el.style.backdropFilter = bf;
        el.style.webkitBackdropFilter = bf;
      });
    }
  };
  build();
  if ('ResizeObserver' in window) {
    new ResizeObserver(debounce(build, 140)).observe(el);
  }
  /* 字体就绪后文字宽度会变（导航文字由 site.md 注入），届时重算一次位移图 */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(build);
  }
}
