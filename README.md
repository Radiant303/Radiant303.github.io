# Radiant303.github.io

个人博客——也是一份活着的简历。封面是 `resource/background.png`（新海诚风原野），画面底部溶进纯白正文区。
`index.html` + `post.html`，原生 JS 手写，无框架、无构建。

![主页截图](resource/screenshot.jpg)

## 目录结构

```
index.html             首页骨架（页面上的字全部由 Markdown 注入，无硬编码文案）
post.html              文章阅读页
assets/
  css/base.css         两页共用：变量、重置、液态玻璃、Markdown 骨架、GitHub 卡片
  css/index.css        首页特有（导航/Hero/热力图/作品/文章列表/页脚/动效）
  css/post.css         文章页特有（顶栏/正文排版/页脚注）
  js/glass.js          液态玻璃：SVG feDisplacementMap 折射（两页共用）
  js/markdown.js       Markdown 渲染器 + GitHub 卡片（两页共用）
  js/index.js          首页逻辑（标题动效/导航/时钟/热力图/内容加载）
  js/post.js           文章页逻辑（顶栏/品牌/文章加载/上下篇导航）
content/               所有内容（见下）
resource/background.png 封面图，想换封面直接替换这个文件
```

## 日常更新（只动 Markdown）

**所有内容都在 `content/` 里，增、删、改 `.md` 文件即可**；唯一例外：新加或删除作品/文章时，
在 `content/files.md`（文件清单）里同步增删一行文件名——静态托管没法自动列出目录，
页面就靠这份清单知道要读哪些文件（只写文件名，顺序随意，页面会自动排序）。
`about.md`、`site.md` 是固定文件名，不用登记。

注意：**页面没有任何内置兜底文案**——某个 md 读不到，对应区域就留空。页面上每个字都来自 `content/`。

### 页面上的固定文案：`content/site.md`

首页每一个固定的字（品牌名、大标题、导航、各节标题、速览条、页脚……）都在这里配。写法：

- `## 节名` 分节，节名固定为：`hero` `nav` `about` `work` `articles` `footer`。
- 节内 `键: 值`（中英文冒号都行），`- ` 开头是列表项。
- 值里可以用行内 Markdown：`**粗体**`、`` `代码` ``、`[链接](url)`。
- 节里不写 `sub` 则该节副标题自动隐藏。

各节的键：

- `hero`：`brand`（左上角品牌名）、`title`（大标题）、`sub`、`hint`、`time`（时钟前的两个字）、`cue`（底部滚动提示）。
- `nav`：`about` `work` `articles` `contact` 四个键，对应四个导航链接的文字。
- `about`：`title`，列表项为 `标签 | 内容`，一条就是速览条里的一格（如 `- 身份 | 在校大学生`）。
- `work` / `articles`：`title`、`sub`。
- `footer`：`who`、`note`，列表项为页脚链接（`- [文字](url)`）。

### 作品：`content/projects/一个项目一个.md`

文件内容就一个 GitHub 仓库地址（如 `https://github.com/Radiant303/SpringNote`）。
页面把它渲染成 GitHub 原生 Social Preview 卡片（仓库名、描述、stars、语言条都在图里，由 GitHub 生成）。
展示顺序按**文件名**排序，用数字前缀控制（`01-xxx.md`、`02-xxx.md`……）。

### 文章：`content/articles/YYYY-MM-DD-名字.md`

- 首页「文章」区按文件名倒序列出（日期 + 标题 + 摘要 + 文中第一张图的缩略图），点击进入 `post.html` 阅读全文。
- 日期前缀显示为日期（可选）；首行 `# 标题` 成为标题（可选，会被吃掉不在正文重复显示）。
- 文中图片统一放 `content/articles/images/`，用相对路径引用（如 `![alt](./images/图.png)`），支持中文文件名。

### 关于我：`content/about.md`

首页「关于我」的正文，完整 Markdown。首行 `# 标题` 会被吃掉；文中图片按相对 `content/` 解析。

支持的 Markdown 语法：`#`~`####` 标题、`**粗体**`、`*斜体*`、`` `代码` ``、``` 围栏代码块```、
`-` / `1.` 列表、`>` 引用、`---` 分割线、`[链接](url)`、`![图片](url)`。

额外特性：正文里**单独一段只写一个 GitHub 仓库地址**会自动渲染成 Social Preview 卡片。

## 本地预览

- 双击 `index.html`（file://）浏览器安全限制读不到 md，页面动态区域会是空白。
- 想本地验证效果：在仓库目录起个静态服务，如 `python -m http.server`，再开 `http://localhost:8000`。
- `post.html` 通过查询参数读文章：`post.html?d=articles&f=2025-09-30-she.md`
  （`d` 为 content 下的子目录，可省略；文件名有白名单校验，防路径穿越）。

## 技术备注

- 内容全部走**相对路径** fetch `content/` 下的 md；要展示的文件清单在 `content/files.md` 里。
- 「关于我」末尾的 GitHub 贡献热力图：数据来自公开接口
  [github-contributions-api](https://github.com/grubersjoe/github-contributions-api)（只读、无需 token），
  页面按站点色阶自己画格子；接口挂了就显示一条 GitHub 链接兜底。换用户名改 `assets/js/index.js` 里的 `GITHUB_USER`。
- 液态玻璃思路致谢 [shuding/svg-shaders](https://github.com/shuding/svg-shaders) 与
  [shuding/liquid-glass](https://github.com/shuding/liquid-glass)（MIT）。
