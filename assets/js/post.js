/* ============================================================
 * 文章页逻辑：顶栏 / 站点品牌 / 文章加载 / 上下篇导航
 * 依赖 glass.js（attachGlass）与 markdown.js（md、esc、parseSections、mdImgBase）
 * ==========================================================*/
(function () {
  'use strict';

  /* ============ 加载文章 ============ */
  function fail(msg) {
    var t = document.getElementById('post-title');
    var b = document.getElementById('post-body');
    var d = document.getElementById('post-date');
    if (d) d.textContent = '';
    if (t) t.textContent = '没有找到这篇文章';
    if (b) b.innerHTML = '<div class="missing"><p>' + msg + '</p><p style="margin-top:14px"><a href="index.html" style="color:var(--spring);text-decoration:underline;text-underline-offset:3px">回到首页 →</a></p></div>';
  }

  async function loadPost() {
    var q = new URLSearchParams(location.search);
    var d = q.get('d') || '';
    var f = q.get('f') || '';
    /* 文件名白名单：只允许字母数字与 . _ -，防路径穿越 */
    var ok = /^[a-zA-Z0-9._-]+$/.test(f) && f.indexOf('..') < 0 &&
             (!d || (/^[a-zA-Z0-9._-]+$/.test(d) && d.indexOf('..') < 0));
    if (!ok || !f) { fail('链接里缺少有效的文章名。'); return; }
    if (location.protocol === 'file:') {
      fail('本地直接双击打开时读不到 Markdown——请通过 GitHub Pages 访问，或在目录里起一个本地服务器（如 python -m http.server）。');
      return;
    }
    mdImgBase = 'content/' + (d ? d + '/' : '');
    var path = mdImgBase + f;
    try {
      var res = await fetch(path);
      if (!res.ok) { fail('文章不存在，或者还没有同步过来。'); return; }
      var src = await res.text();
      var m = f.match(/^(\d{4})-(\d{2})-(\d{2})/);
      var date = m ? m[1] + ' · ' + m[2] + ' · ' + m[3] : '';
      var title = '', tm = src.match(/^\s*#\s+(.+)$/m);
      if (tm) { title = tm[1].trim(); src = src.replace(tm[0], ''); }
      document.getElementById('post-date').textContent = date;
      document.getElementById('post-title').textContent = title || f;
      document.getElementById('post-body').innerHTML = md(src);
      document.title = (title || f) + ' · Radiant303';
      initPostNav(d, f);
    } catch (e) {
      fail('网络不太好，文章没加载出来。');
    }
  }

  /* 顶栏：下滑阅读时隐去，上滑时找回 */
  function initTopbar() {
    var bar = document.getElementById('topbar');
    var lastY = window.scrollY;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      bar.classList.toggle('hide', y > 160 && y > lastY);
      lastY = y;
    }, { passive: true });
  }

  /* 顶栏品牌与首页同源：读 content/site.md 的 hero.brand，读不到留空 */
  async function loadSite() {
    var brandEl = document.querySelector('.topbar .brand');
    try {
      var res = await fetch('content/site.md', { cache: 'no-cache' });
      if (!res.ok) return;
      var lines = (await res.text()).split(/\r?\n/);
      var sec = '', brand = '';
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        var sm = line.match(/^##\s+(.+)$/);
        if (sm) { sec = sm[1]; continue; }
        var m = line.match(/^([A-Za-z]+)\s*[:：]\s*(.+)$/);
        if (!m) continue;
        if (sec === 'hero' && m[1] === 'brand') brand = m[2].trim();
      }
      if (brand && brandEl) brandEl.textContent = brand;
    } catch (e) { /* 留空，不做兜底 */ }
  }

  /* 底部导航：左上一篇、右下一篇（按 files.md 清单排序，同首页列表）；
     没有上一篇/下一篇时对应一侧指向回到首页 */
  async function initPostNav(d, f) {
    var nav = document.getElementById('post-nav');
    if (!nav) return;
    var prev = null, next = null;
    try {
      var res = await fetch('content/files.md', { cache: 'no-cache' });
      if (res.ok) {
        var secs = parseSections(await res.text());
        var items = secs[d || 'articles'] ? secs[d || 'articles'].items : [];
        var names = items
          .map(function (s) { return s.replace(/[`*]/g, '').trim(); })
          .filter(function (s) { return /^[a-zA-Z0-9._-]+\.md$/i.test(s); })
          .sort().reverse();
        var i = names.indexOf(f);
        if (i > 0) prev = names[i - 1];
        if (i >= 0 && i < names.length - 1) next = names[i + 1];
      }
    } catch (e) { /* 清单不可用：两侧都回首页 */ }

    async function cell(name, cls, dir) {
      if (!name) {
        return '<a class="pn ' + cls + '" href="index.html">' +
               '<span class="pn-dir">' + dir + '</span>' +
               '<span class="pn-title">回到首页</span></a>';
      }
      var title = name;
      try {
        var r = await fetch('content/' + (d ? d + '/' : '') + encodeURIComponent(name), { cache: 'no-cache' });
        if (r.ok) {
          var tm = (await r.text()).match(/^\s*#\s+(.+)$/m);
          if (tm) title = tm[1].trim();
        }
      } catch (e) { /* 标题取不到就用文件名 */ }
      return '<a class="pn ' + cls + '" href="post.html?' + (d ? 'd=' + encodeURIComponent(d) + '&' : '') +
             'f=' + encodeURIComponent(name) + '">' +
             '<span class="pn-dir">' + dir + '</span>' +
             '<span class="pn-title">' + esc(title) + '</span></a>';
    }
    nav.innerHTML = await cell(prev, 'pn-prev', '← 上一篇') + await cell(next, 'pn-next', '下一篇 →');
  }

  function init() {
    document.querySelectorAll('[data-glass]').forEach(attachGlass);
    initTopbar();
    loadSite();
    loadPost();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
