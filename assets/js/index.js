/* ============================================================
 * 首页逻辑：标题动效 / 导航 / 时钟 / 热力图 / 内容加载
 * 依赖 glass.js（attachGlass、debounce）与
 *      markdown.js（esc、mdInline、md、githubCard、githubRepoLoose、parseSections、mdImgBase）
 * ==========================================================*/
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
   * 标题：逐字升起（竖排同样适用）；site.md 换标题时会重播
   * ==========================================================*/
  function renderTitle() {
    var h1 = document.getElementById('title');
    if (!h1) return;
    var text = h1.textContent;
    if (reduced) { h1.textContent = text; return; }
    h1.textContent = '';
    h1.setAttribute('aria-label', text);
    var frag = document.createDocumentFragment();
    text.split('').forEach(function (chr) {
      var box = document.createElement('span');
      box.className = 'ch';
      box.setAttribute('aria-hidden', 'true');
      var inner = document.createElement('span');
      inner.textContent = chr;
      box.appendChild(inner);
      frag.appendChild(box);
    });
    h1.appendChild(frag);
    /* 关键：先强制一次布局，让 CSS 里的起始态 translateY(112%) 真正完成计算，
       再写终态——否则浏览器把起始/终态合并成首次排版，过渡被跳过（动画时有时无） */
    void h1.offsetWidth;
    var chars = h1.querySelectorAll('.ch > span');
    for (var i = 0; i < chars.length; i++) {
      (function (el, k) {
        el.style.transition = 'transform 1s cubic-bezier(.2,.85,.25,1.12) ' + (0.08 + k * 0.055) + 's';
        el.style.transform = 'translateY(0)';
      })(chars[i], i);
    }
  }
  function initTitle() {
    /* 字体就绪后升起效果最好，但最多等 450ms，保证任何情况下标题都会就位 */
    var done = false;
    function once() { if (!done) { done = true; renderTitle(); } }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { setTimeout(once, 60); });
    }
    setTimeout(once, 450);
  }

  /* ============================================================
   * 滚动渐显
   * ==========================================================*/
  var revealIO = null;
  function observeReveals(root) {
    var items = root.querySelectorAll('[data-reveal]:not(.in)');
    if (!items.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    if (!revealIO) {
      revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            revealIO.unobserve(en.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    }
    items.forEach(function (el) { revealIO.observe(el); });
  }

  /* ============================================================
   * 导航：顶部分居两侧，下滑 FLIP 聚拢；玻璃滑块 scrollspy + 悬停
   * ==========================================================*/
  function initNav() {
    var nav = document.getElementById('nav');
    var seg = document.getElementById('seg');
    if (!nav || !seg) return;
    var brand = nav.querySelector('.brand');
    var thumb = seg.querySelector('.thumb');
    var links = Array.prototype.slice.call(seg.querySelectorAll('a'));
    var current = null, hovering = false, compact = false, shown = false;

    /* 刷新时浏览器会异步恢复滚动位置（时机不可控，可能晚于任何固定等待），
       所以聚拢动画只在用户第一次真实操作后才启用；此前脚本触发的状态变化
       （恢复滚动、锚点跳转）一律直接就位，不播动画 */
    var canAnimate = false;
    nav.classList.add('no-anim');
    function arm() {
      if (canAnimate) return;
      canAnimate = true;
      nav.classList.remove('no-anim');
    }
    ['wheel', 'touchmove', 'keydown', 'pointerdown'].forEach(function (ev) {
      window.addEventListener(ev, arm, { once: true, passive: true });
    });
    setTimeout(arm, 4000);   /* 拖滚动条不产生上述事件，兜底 */

    function moveTo(link) {
      if (!link || !compact) { thumb.classList.remove('on'); return; }
      /* 滑块的第一次出现（常见于刷新后浏览器恢复了滚动位置）只淡入到目标位置——
         否则它会从 CSS 初始姿态（左缘、scale(.85)）弹性飞过来，闪出一团白 */
      if (!shown) {
        shown = true;
        thumb.style.transition = 'opacity .3s';
        setTimeout(function () { thumb.style.transition = ''; }, 350);
      }
      thumb.style.width = (link.offsetWidth + 22) + 'px';
      thumb.style.transform = 'translate(' + (link.offsetLeft - 11) + 'px, -50%)';
      thumb.classList.add('on');
    }
    function setActive(id) {
      current = null;
      links.forEach(function (l) {
        var on = l.getAttribute('href') === '#' + id;
        l.classList.toggle('active', on);
        if (on) current = l;
      });
      if (!hovering) moveTo(current);
    }
    links.forEach(function (l) {
      l.addEventListener('mouseenter', function () { hovering = true; moveTo(l); });
    });
    seg.addEventListener('mouseleave', function () { hovering = false; moveTo(current); });

    function setCompact(on, animate) {
      if (on === compact) return;
      compact = on;
      if (reduced || !animate || !canAnimate) {
        nav.classList.toggle('compact', on);
        moveTo(current);
        return;
      }
      var els = [brand, seg];
      var oldRects = els.map(function (el) { return el.getBoundingClientRect(); });
      nav.classList.toggle('compact', on);
      els.forEach(function (el, i) {
        el.style.transition = 'none';
        el.style.transform = '';
        var r = el.getBoundingClientRect();
        if (oldRects[i].width === 0 || r.width === 0) { el.style.transition = ''; return; }
        var dx = oldRects[i].left - r.left, dy = oldRects[i].top - r.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) { el.style.transition = ''; return; }
        el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
        void el.offsetWidth;
        el.style.transition = 'transform .62s cubic-bezier(.22,.9,.26,1.06)';
        el.style.transform = '';
        setTimeout(function () { el.style.transition = ''; }, 700);
      });
      moveTo(current);
    }

    function threshold() { return window.innerHeight * 0.5; }
    window.addEventListener('scroll', function () {
      setCompact(window.scrollY > threshold(), true);
    }, { passive: true });
    setCompact(window.scrollY > threshold(), false);

    if ('IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
      }, { rootMargin: '-40% 0px -55% 0px' });
      ['top', 'about', 'work', 'articles', 'contact'].forEach(function (id) {
        var s = document.getElementById(id);
        if (s) spy.observe(s);
      });
    }
    window.addEventListener('resize', debounce(function () {
      if (current && !hovering) moveTo(current);
    }, 120));
    /* 字体换入后链接变宽，滑块位置/宽度跟着重算 */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        if (current && !hovering) moveTo(current);
      });
    }
  }

  function initClock() {
    var el = document.getElementById('clock');
    if (!el) return;
    function tick() {
      el.textContent = new Date().toLocaleTimeString('zh-CN', {
        hour12: false, timeZone: 'Asia/Shanghai'
      });
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ============================================================
   * GitHub 贡献热力图：公开 JSON 接口取数，按站点色阶手绘。
   * 拉取失败格子就留空，不影响页面。
   * ==========================================================*/
  var GITHUB_USER = 'Radiant303';   // 换 GitHub 用户名改这里
  async function initContrib() {
    if (location.protocol === 'file:') return;
    var grid = document.getElementById('cg-grid');
    if (!grid) return;
    try {
      var res = await fetch('https://github-contributions-api.jogruber.de/v4/' +
                            encodeURIComponent(GITHUB_USER) + '?y=last');
      if (!res.ok) return;
      var data = await res.json();
      var days = (data && data.contributions) || [];
      if (!days.length) return;
      var frag = document.createDocumentFragment();
      /* 第一列从周日开始：前面补透明占位格 */
      var first = new Date(days[0].date + 'T00:00:00Z');
      for (var i = 0; i < first.getUTCDay(); i++) {
        var pad = document.createElement('span');
        pad.className = 'cg-cell pad';
        frag.appendChild(pad);
      }
      days.forEach(function (d) {
        var c = document.createElement('span');
        c.className = 'cg-cell' + (d.level ? ' l' + d.level : '');
        c.title = d.date + ' · ' + d.count + ' 次贡献';
        frag.appendChild(c);
      });
      grid.innerHTML = '';
      grid.appendChild(frag);
      var total = data.total && data.total.lastYear;
      var tt = document.getElementById('cg-total');
      if (total && tt) tt.innerHTML = '过去一年 <b>' + total + '</b> 次贡献';
    } catch (e) { /* 网络/接口不可用：格子留空 */ }
  }

  /* ============================================================
   * 文章条目解析：文件名取日期、首个一级标题取标题、正文取摘要
   * ==========================================================*/
  function parseEntry(name, src) {
    var m = name.match(/^(\d{4})-(\d{2})-(\d{2})/);
    var date = m ? m[1] + '.' + m[2] + '.' + m[3] : '';
    var iso = m ? m[0] : '';
    var title = '', tm = src.match(/^\s*#\s+(.+)$/m);
    if (tm) { title = tm[1].trim(); src = src.replace(tm[0], ''); }
    return { date: date, iso: iso, title: title };
  }
  function excerptOf(src) {
    var t = src.replace(/^\s*#\s+.+$/m, '')
               .replace(/```[\s\S]*?```/g, ' ')
               .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
               .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
               .replace(/[*`>~#]/g, '')
               .replace(/\s+/g, ' ').trim();
    return t.length > 76 ? t.slice(0, 76) + '…' : t;
  }
  /* 文中第一张图（Markdown 图片语法），用于列表缩略图 */
  function firstImageOf(src) {
    var m = src.match(/!\[([^\]]*)\]\(([^)\s]+)\)/);
    return m ? { alt: m[1], url: m[2] } : null;
  }
  function fetchText(path) {
    return fetch(path, { cache: 'no-cache' }).then(function (r) { return r.ok ? r.text() : null; })
                                             .catch(function () { return null; });
  }

  /* ============================================================
   * site.md：页面上每个固定字都在这里配置
   * ==========================================================*/
  function applySite(src) {
    var secs = parseSections(src);

    if (secs.hero) {
      var h = secs.hero.kv;
      var brand = document.getElementById('brand');
      if (h.brand && brand) brand.textContent = h.brand;
      if (h.title) {
        var t = document.getElementById('title');
        t.textContent = h.title;
        renderTitle();
      }
      if (h.sub) document.getElementById('h-sub').innerHTML = mdInline(esc(h.sub));
      if (h.hint) document.getElementById('h-hint').innerHTML = mdInline(esc(h.hint));
      if (h.time) document.getElementById('h-time').textContent = h.time;
      if (h.cue) document.getElementById('h-cue').textContent = h.cue;
    }

    if (secs.nav) {
      var order = ['about', 'work', 'articles', 'contact'];
      var as = document.querySelectorAll('#seg a');
      order.forEach(function (key, i) {
        if (secs.nav.kv[key] && as[i]) as[i].textContent = secs.nav.kv[key];
      });
    }

    ['about', 'work', 'articles'].forEach(function (id) {
      var sec = secs[id];
      if (!sec) return;
      var box = document.querySelector('[data-section="' + id + '"]');
      if (!box) return;
      var title = box.querySelector('.sec-title');
      var sub = box.querySelector('.sec-sub');
      if (sec.kv.title && title) title.textContent = sec.kv.title;
      if (sub) {
        if (sec.kv.sub) sub.innerHTML = mdInline(esc(sec.kv.sub));
        else sub.style.display = 'none';
      }
      if (id === 'about' && sec.items.length) {
        var facts = document.getElementById('facts');
        facts.innerHTML = '';
        sec.items.forEach(function (it) {
          var halves = it.split(/\s*[|｜]\s*/);
          var div = document.createElement('div');
          var dt = document.createElement('dt');
          dt.textContent = halves.shift() || '';
          var dd = document.createElement('dd');
          dd.innerHTML = mdInline(esc(halves.join(' | ')));
          div.appendChild(dt); div.appendChild(dd);
          facts.appendChild(div);
        });
      }
    });

    if (secs.footer) {
      var f = secs.footer.kv;
      if (f.who) document.getElementById('f-who').textContent = f.who;
      if (f.note) document.getElementById('f-note').innerHTML = mdInline(esc(f.note));
      if (secs.footer.items.length) {
        var fl = document.getElementById('f-links');
        fl.innerHTML = secs.footer.items.map(function (it) {
          return mdInline(esc(it));
        }).join('');
      }
    }
  }

  /* ============================================================
   * 内容流：全部走相对路径读 content/ 下的 md。
   * 静态托管没法列出目录，要展示哪些文件登记在 content/files.md。
   * ==========================================================*/
  async function loadContent() {
    if (location.protocol === 'file:') return;   // 浏览器不允许直接读取本地 Markdown

    /* 站点文案 */
    var siteSrc = await fetchText('content/site.md');
    if (siteSrc != null) {
      try { applySite(siteSrc); } catch (e) { /* 配置写错了也不拖垮页面 */ }
      /* 导航文字是这时才注入的，链接宽度变了——通知依赖布局的部件（玻璃滑块）重算 */
      window.dispatchEvent(new Event('resize'));
    }

    /* 关于：文件名固定，直接相对路径读；文中图片按相对 content/ 解析 */
    var ar = await fetchText('content/about.md');
    var ab = document.getElementById('about-body');
    if (ab && ar != null) {
      mdImgBase = 'content/';
      ab.innerHTML = md(ar.replace(/^\s*#\s+.+\n?/, ''));
    }

    /* 清单：content/files.md（`- 文件名`，白名单校验；顺序由程序按文件名排） */
    var listSrc = await fetchText('content/files.md');
    if (listSrc == null) return;                 // 没有清单就不渲染动态内容
    var lists = parseSections(listSrc);
    function names(sec) {
      return (lists[sec] ? lists[sec].items : [])
        .map(function (s) { return s.replace(/[`*]/g, '').trim(); })
        .filter(function (s) { return /^[a-zA-Z0-9._-]+\.md$/i.test(s); });
    }

    /* 作品：每个 md 只写一个仓库地址，文件名前缀数字控制顺序 */
    var pnames = names('projects').sort();
    var works = document.getElementById('works');
    if (pnames.length && works) {
      var ptexts = await Promise.all(pnames.map(function (n) {
        return fetchText('content/projects/' + encodeURIComponent(n));
      }));
      var repos = ptexts.map(function (src) { return src == null ? '' : githubRepoLoose(src); });
      /* 任一项目未加载时保持空白，不渲染部分结果。 */
      if (repos.length === pnames.length && repos.every(function (repo) { return repo; })) {
        var pfrag = document.createDocumentFragment();
        var wgrid = null;
        repos.forEach(function (repo, i) {
          var art = document.createElement('article');
          art.className = 'work' + (i === 0 ? ' feat' : '');
          art.innerHTML =
            '<span class="wnum" aria-hidden="true">' + ('0' + (i + 1)).slice(-2) + '</span>' +
            githubCard(repo);
          if (i === 0) {
            pfrag.appendChild(art);   /* 第一张独占一行，领衔 */
          } else {
            if (!wgrid) { wgrid = document.createElement('div'); wgrid.className = 'wgrid'; }
            wgrid.appendChild(art);
          }
        });
        if (wgrid) pfrag.appendChild(wgrid);
        works.replaceChildren(pfrag);
      }
    }

    /* 文章：content/articles/ 下的文件，文件名倒序 */
    var articleNames = names('articles').sort().reverse();
    var articlesList = document.getElementById('articles-list');
    if (articleNames.length && articlesList) {
      var articleTexts = await Promise.all(articleNames.map(function (n) {
        return fetchText('content/articles/' + encodeURIComponent(n));
      }));
      var articleFragment = document.createDocumentFragment(), articleCount = 0;
      articleTexts.forEach(function (src, k) {
        if (src == null) return;
        var e = parseEntry(articleNames[k], src);
        var row = document.createElement('a');
        row.className = 'entry';
        row.href = 'post.html?d=articles&f=' + encodeURIComponent(articleNames[k]);
        row.setAttribute('data-reveal', '');
        var thumb = '', im = firstImageOf(src);
        if (im) {
          var iu = /^(https?:\/\/|\/)/i.test(im.url) ? im.url :
                   (!/^[a-z][a-z0-9+.-]*:/i.test(im.url) && im.url.indexOf('..') < 0
                     ? 'content/articles/' + im.url.replace(/^\.\//, '') : '');
          if (iu) thumb = '<div class="ethumb" aria-hidden="true"><img src="' + esc(encodeURI(iu)) + '" alt="" loading="lazy" decoding="async"></div>';
        }
        row.innerHTML = '<div class="etext">' +
                        '<h3>' + esc(e.title || articleNames[k]) + '</h3>' +
                        '<p class="excerpt">' + esc(excerptOf(src)) + '</p>' +
                        '<span class="meta"><span class="go">阅读全文 <i>→</i></span>' +
                        (e.date ? '<time class="date" datetime="' + e.iso + '">' + e.date + '</time>' : '') +
                        '</span></div>' + thumb;
        articleFragment.appendChild(row);
        articleCount++;
      });
      if (articleCount) {
        articlesList.innerHTML = '';
        articlesList.appendChild(articleFragment);
        observeReveals(articlesList);
      }
    }
  }

  function init() {
    document.querySelectorAll('[data-glass]').forEach(attachGlass);
    initTitle();
    observeReveals(document);
    initNav();
    initClock();
    initContrib();
    loadContent();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
