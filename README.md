# Radiant303.github.io

个人博客——也是一份活着的简历。封面是 `resource/background.png`（新海诚风原野），画面底部溶进纯白正文区。
`index.html` + `post.html`，原生 JS 手写，无框架、无构建。

## 日常更新（只动 Markdown）

**所有内容都在 `content/` 里，增、删、改 `.md` 文件即可**；唯一例外：新加或删除文件时，
在 `content/files.md`（文件清单）里同步增删一行文件名——静态托管没法自动列出目录，
页面就靠这份清单知道要读哪些文件（只写文件名，顺序随意，页面会自动排序）。
`about.md`、`now.md`、`site.md` 是固定文件名，不用登记。

### 页面上的固定文案：`content/site.md`

首页每一个固定的字（大标题、导航、各节标题、速览条、页脚……）都在这里配。写法：

- `## 节名` 分节，节名固定为：`hero` `nav` `about` `work` `now` `tech` `notes` `footer`。
- 节内 `键: 值`（中英文冒号都行），`- ` 开头是列表项。
- 值里可以用行内 Markdown：`**粗体**`、`` `代码` ``、`[链接](url)`。
- 某个键删掉就保留 HTML 里的兜底；节里不写 `sub` 则该节副标题自动隐藏。

各节的键：

- `hero`：`brand`（左上角品牌名）、`eyebrow`、`title`（竖排大标题）、`sub`、`hint`、`time`（时钟前的两个字）、`cue`（底部滚动提示）。
- `nav`：`about` `work` `now` `tech` `notes` `contact` 六个键，对应六个导航链接的文字。
- `about`：`title`，列表项为 `标签 | 内容`，一条就是速览条里的一格（如 `- 身份 | 在校大学生`）。
- `work` / `tech`：`title`、`sub`。
- `now` / `notes`：`title`。
- `footer`：`who`、`note`，列表项为页脚链接（`- [文字](url)`）。

### 作品：`content/projects/一个项目一个.md`

```markdown
# 项目名
status: 进行中
desc: 一句话介绍。
meta: 技术栈 · 数据 · 起始时间
links: [GitHub](https://…) | [主页](https://…)
```

- 展示顺序按**文件名**排序，用数字前缀控制（`01-xxx.md`、`02-xxx.md`……）。
- `status` 可选词：`进行中` `刚开始` `实验` `已发布` `学习中`（其他词也能显示，只是没有专属配色）。
- `desc` `meta` `links` 都可省略；`links` 里多个链接用 `|` 分隔。

### 正文类内容

- `content/about.md` —— 特殊文件，首页「关于我」的正文（首行 `# 标题` 会被吃掉，不显示）。
- `content/now.md` —— 特殊文件，首页「此刻」的正文。
- `content/YYYY-MM-DD-名字.md` —— 普通手记，按文件名倒序展示在「手记」区。
  日期前缀会显示为日期（可选）；首行 `# 标题` 会成为标题（可选）。
- `content/tech/YYYY-MM-DD-名字.md` —— 技术笔记。首页「技术笔记」区自动列出
  （日期 + 标题 + 摘要），点击进入 `post.html` 阅读全文。

支持的 Markdown 语法：`#`~`####` 标题、`**粗体**`、`*斜体*`、`` `代码` ``、``` 围栏代码块```、
`-` / `1.` 列表、`>` 引用、`---` 分割线、`[链接](url)`、`![图片](url)`。

额外特性：**单独一行写一个 GitHub 仓库地址**（如 `https://github.com/shuding/svg-shaders`）
会自动渲染成仓库卡片（描述、语言、stars、forks，走 GitHub 公开接口；接口失败则保持普通链接）。

## 本地预览

- 双击 `index.html`（file://）可以看，但浏览器安全限制读不到 md，会显示 HTML 内置的兜底内容。
- 想本地验证 md 效果：在仓库目录起个静态服务，如 `python -m http.server`，再开 `http://localhost:8000`。
- `post.html` 通过查询参数读文章：`post.html?d=tech&f=2026-08-15-liquid-glass.md`
  （`d` 为 content 下的子目录，可省略；文件名有白名单校验）。

## 技术备注

- 内容全部走**相对路径** fetch `content/` 下的 md；要展示的文件清单在 `content/files.md` 里
  （不依赖任何外部 API，没有限额，fork 仓库也不用改代码）。
- `.nojekyll` 关闭了 Jekyll，保证 `.md` 原样被读取。
- 封面图：`resource/background.png`，想换封面直接替换这个文件即可。
- 「关于我」末尾的 GitHub 贡献热力图：数据来自公开接口
  [github-contributions-api](https://github.com/grubersjoe/github-contributions-api)（只读、无需 token），
  页面按站点色阶自己画格子；接口挂了就显示一条 GitHub 链接兜底。换用户名改 `index.html` 里的 `GITHUB_USER`。
- 液态玻璃：SVG `feDisplacementMap` 折射，思路致谢 [shuding/svg-shaders](https://github.com/shuding/svg-shaders)
  与 [shuding/liquid-glass](https://github.com/shuding/liquid-glass)（MIT）。
  全站只有导航滑块与文章页返回按钮使用，作为点缀。
