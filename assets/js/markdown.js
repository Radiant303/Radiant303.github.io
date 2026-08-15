/* ============================================================
 * Markdown 渲染器（行内/段落/标题/代码/列表/引用/分割线）、
 * GitHub 卡片、site.md / files.md 小节解析：index.html / post.html 共用。
 * ==========================================================*/
'use strict';

/* 文中图片的相对路径基于所在目录，由各页面脚本在渲染前设置（如 'content/articles/'） */
var mdImgBase = '';

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function mdSafeUrl(u) { return /^(https?:\/\/|mailto:|\/|#)/i.test(u); }
/* 图片地址：http(s)、根路径、data 图直接用；相对路径（支持中文名、子目录）补 mdImgBase */
function imgUrl(u) {
  if (/^(https?:\/\/|\/|data:image\/)/i.test(u)) return u;
  if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return '';   // 拒绝 javascript: 等显式协议
  if (u.indexOf('..') >= 0) return '';             // 防路径穿越
  return mdImgBase + u.replace(/^\.\//, '');
}
function mdInline(s) {
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (m, a, u) {
    var v = imgUrl(u);
    return v ? '<img alt="' + a + '" src="' + encodeURI(v) + '" loading="lazy" decoding="async">' : m;
  });
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, t, u) {
    return mdSafeUrl(u) ? '<a href="' + u + '" target="_blank" rel="noopener">' + t + '</a>' : t;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^\w*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  return s;
}
function md(src) {
  var lines = src.replace(/\r\n?/g, '\n').split('\n');
  var out = [], i = 0;
  var blockStart = /^(```|#{1,4}\s|\s*[-*]\s|\s*\d+\.\s|\s*>\s?|\s*---+\s*$)/;
  while (i < lines.length) {
    var line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (/^```/.test(line)) {
      var code = []; i++;
      while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
      i++;
      out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>');
      continue;
    }
    var h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      var lv = h[1].length + 1;
      out.push('<h' + lv + '>' + mdInline(esc(h[2].trim())) + '</h' + lv + '>');
      i++; continue;
    }
    if (/^\s*---+\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
    if (/^\s*>\s?/.test(line)) {
      var q = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) q.push(lines[i++].replace(/^\s*>\s?/, ''));
      out.push('<blockquote>' + md(q.join('\n')) + '</blockquote>');
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      var ul = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i]))
        ul.push('<li>' + mdInline(esc(lines[i++].replace(/^\s*[-*]\s+/, '').trim())) + '</li>');
      out.push('<ul>' + ul.join('') + '</ul>');
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      var ol = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i]))
        ol.push('<li>' + mdInline(esc(lines[i++].replace(/^\s*\d+\.\s+/, '').trim())) + '</li>');
      out.push('<ol>' + ol.join('') + '</ol>');
      continue;
    }
    var para = [];
    while (i < lines.length && lines[i].trim() && !blockStart.test(lines[i])) para.push(lines[i++]);
    var ptext = para.join('');
    /* 单独一行的 GitHub 仓库链接 → GitHub 原生预览 */
    var repo = githubRepo(ptext);
    if (repo) out.push(githubCard(repo));
    else out.push('<p>' + mdInline(esc(ptext)) + '</p>');
  }
  return out.join('\n');
}

/* GitHub Social Preview：仓库信息与图片均由 GitHub 生成 */
/* 正文用：整段文字就是一个仓库地址（允许协议头省略与结尾斜杠）才渲染成卡片 */
function githubRepo(src) {
  var m = src.trim().match(/^(?:https?:\/\/)?github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+?)\/?$/i);
  return m ? m[1] : '';
}
/* 项目文件用：内容主题就是仓库地址（兼容仅 URL 与旧版键值格式），宽松匹配 */
function githubRepoLoose(src) {
  var m = src.match(/(?:https?:\/\/)?github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)/i);
  return m ? m[1].replace(/\.git$/i, '') : '';
}
function githubCard(repo) {
  var safe = esc(repo);
  return '<div class="gh-card"><a class="ghc" href="https://github.com/' + safe +
    '" target="_blank" rel="noopener" aria-label="在 GitHub 查看 ' + safe + '">' +
    '<img src="https://opengraph.githubassets.com/1/' + safe + '" alt="' + safe +
    ' GitHub 仓库预览" loading="lazy" decoding="async"></a></div>';
}

/* site.md 与 files.md 的「键: 值」「- 列表项」小节格式 */
function parseSections(src) {
  var secs = {};
  var parts = src.split(/^##\s+/m);
  for (var i = 1; i < parts.length; i++) {
    var nl = parts[i].indexOf('\n');
    if (nl < 0) nl = parts[i].length;
    var name = parts[i].slice(0, nl).trim().toLowerCase();
    var body = parts[i].slice(nl + 1);
    var kv = {}, items = [];
    body.split('\n').forEach(function (line) {
      var t = line.trim();
      if (!t || /^#/.test(t)) return;
      var im = t.match(/^[-*]\s+(.+)$/);
      if (im) { items.push(im[1].trim()); return; }
      var km = t.match(/^([A-Za-z][\w-]{0,20})[:：]\s*(.*)$/);
      if (km) { kv[km[1].toLowerCase()] = km[2].trim(); }
    });
    secs[name] = { kv: kv, items: items };
  }
  return secs;
}
