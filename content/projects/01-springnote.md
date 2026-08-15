# 我还在做东西

我一直觉得，一个人的个人主页不应该只是简历的另一种排版。

简历会告诉别人我学过什么、做过什么、使用过哪些技术；但这些东西其实很容易被压缩成几行关键词。

Java、Python、Flutter、Spring Boot、AI、MCP、Agent……

看起来很多，但如果只剩下这些词，其实很难知道我是一个什么样的人。

所以，如果要做一个属于自己的网页，我更希望它记录的不是“我掌握了多少技术”，而是这些技术最后被我拿去做了什么。

我喜欢做东西。

有时候是一个完整的软件，有时候只是一个很小的工具，有时候甚至只是一个看起来没有什么用的实验。

我会因为一个很小的想法，突然开始写代码；也会因为一个界面里的几个像素、一个 ASCII 字符没有对齐，而反复修改很久。

这可能不是一种特别高效的开发方式。

但它很像我。

---

## 我喜欢从一个很小的问题开始

我做 SpringNote 的起点，其实并不宏大。

我只是觉得，很多笔记软件要求用户太勤快了。

打开软件。

创建笔记。

写标题。

整理分类。

打标签。

写总结。

过几天再打开。

然后面对一大堆自己曾经认真写下来的东西，却已经懒得重新看了。

我一直觉得这件事情有点奇怪。

如果记录本身已经需要花时间，记录之后还需要花时间整理，那么所谓的“知识管理”，最后很容易变成另一种待办事项。

于是我开始做 SpringNote。

我想做一个更懒一点的笔记。

想到什么就记下来。

不用特别考虑格式。

不用提前决定它属于哪个分类。

甚至不需要想着以后应该怎么整理。

剩下的事情交给程序。

于是它慢慢从一个很小的想法，变成了现在的 SpringNote。

它会根据日常记录生成日报、周报、月报，也会尝试从过去发生过的事情里找到用户想要回忆的内容。

后来我又开始思考，全局的目标、待办、长期事项应该怎么处理；于是有了全局签。

我发现一个看起来很简单的功能，真正做起来以后，会不断牵扯出新的问题：

AI 到底应该判断什么？

哪些内容应该进入日报？

哪些内容应该成为待办？

完成一个任务以后，原来的记录应该怎么处理？

如果 AI 失败了怎么办？

用户删除了内容之后，系统应该如何恢复？

这些问题并不是什么宏大的人工智能问题。

但它们很真实。

而我越来越喜欢这种真实的问题。

因为最终决定一个软件好不好用的，往往不是模型有多大，而是这些很小的事情有没有被认真处理。

---

## 我越来越喜欢 AI，但我不太喜欢“为了 AI 而 AI”

这也是我后来开始接触 Agent、MCP、Graph、Spring AI 的原因。

我对 AI 的兴趣，并不是简单地想调用一个模型，让它返回一段文字。

我更感兴趣的是：

**如果 AI 真正成为软件的一部分，软件本身应该变成什么样？**

过去的软件大多是确定性的。

用户点击按钮。

程序执行逻辑。

数据库保存结果。

然后返回页面。

但有了 AI 以后，中间多了一层不确定性。

用户说了一句话。

AI 理解它。

AI 决定应该做什么。

调用工具。

得到结果。

继续判断。

最后再把结果交给用户。

这意味着软件的边界开始变得模糊。

以前我们写的是一个个函数。

现在我们开始设计一个个“能力”。

以前 API 是固定的。

现在 Agent 可以根据上下文决定调用哪个工具。

以前一个流程需要把所有分支提前写出来。

现在可以让模型参与其中的一部分决策。

我对这件事情非常感兴趣。

所以我开始折腾 Spring AI、Graph、MCP、工具注册、OpenAPI，也开始尝试把语音、Agent 和业务系统连接起来。

甚至会去思考：

如果一个系统有一千个工具呢？

工具应该怎么注册？

Agent 应该怎么找到它需要的工具？

MCP 和 OpenAPI 到底应该如何协作？

语音输入进入以后，应该怎样经过 ASR、Agent、工具调用，再通过 TTS 返回给用户？

这些问题看起来越来越像“工程”，而不是简单的 AI Demo。

我反而更喜欢了。

因为我一直觉得，真正有意思的地方，不是让模型回答一个问题，而是让它真正进入一个系统。

---

## 我也在做一些很“古法”的东西

有时候我会觉得自己和现在很多 AI 开发方式有点不太一样。

现在做一个东西已经越来越容易。

一句 Prompt。

生成代码。

生成页面。

生成接口。

甚至可以让 Agent 自己修改项目、运行测试、提交代码。

这当然很好。

我也在使用这些东西。

但我并不希望自己最后只剩下“会描述需求的人”。

所以我还是喜欢写代码。

喜欢看一个程序从零开始慢慢长出来。

喜欢自己设计数据结构。

喜欢为了一个奇怪的问题翻源码。

喜欢看到一个报错以后一路追进去，最后发现真正的问题藏在很深的地方。

我甚至喜欢一些已经有点“古法”的开发方式。

不是因为古法一定更好。

而是因为我希望自己知道机器到底在做什么。

AI 可以帮我写代码。

但我希望自己仍然能够读懂这些代码。

AI 可以帮我设计系统。

但我希望自己仍然能够解释为什么这样设计。

AI 可以帮我完成一项工作。

但我不希望自己因此失去完成这项工作的能力。

所以我会把 AI 当成工具，也会把它当成合作对象。

但我不希望把自己的思考外包出去。

---

## SpringHarness

最近我又开始做 SpringHarness。

这个项目的名字来自 Spring。

是春天。

不是

---

## 我在 GitHub 上的实时贡献

```markdown
https://github.com/Radiant303
```

---

## SpringNote

status: 进行中

desc: 给懒人用的笔记：随手记，剩下的交给 AI——自动整理成日报、周报、月报；全局标签，回忆搜索。

meta: Flutter · Dart · AGPL-3.0 · 2026-06 起

links: [GitHub](https://github.com/Radiant303/SpringNote) | [主页](https://radiant303.github.io/SpringNote/)

---

## SpringHarness

status: 刚开始

desc: 对 Agent 工程化的一次整理：PydanticAI、Harness、工具调用。尝试回归古法编程。

meta: PydanticAI · Harness · 工具调用 · 2026-08-14 起

links: [GitHub](https://github.com/Radiant303/spring-harness)

---

## LoraQwen

status: 实验

desc: 为 SpringNote 微调的 Qwen 模型，负责日报补全与问答。

meta: Python · Qwen 微调

links: [GitHub](https://github.com/Radiant303/LoraQwen)

---

## astrbot_plugin_clonetts

status: 已发布

desc: 接入火山引擎音色克隆的 AstrBot TTS 插件，让聊天机器人用克隆音色「说话」。

meta: Python · AstrBot

links: [GitHub](https://github.com/Radiant303/astrbot_plugin_clonetts)

---

## markdownPreviewService

status: 实验

desc: Rust + Axum 写的微服务：把 Markdown 渲染成 PNG 图片。

meta: Rust · Axum

links: [GitHub](https://github.com/Radiant303/markdownPreviewService)

---

## springnote-skill

status: 刚开始

desc: 「懒人记录」Skills——让记录这件事再省一步。

meta: 2026-08 起

links: [GitHub](https://github.com/Radiant303/springnote-skill)

---

## pydantic-ai

status: 学习中

desc: 「pydanticAI 学习路线」笔记仓库。笔记会厚，这条路还长。

meta: Python · 学习笔记

links: [GitHub](https://github.com/Radiant303/pydantic-ai)

---

## cc-switch-kimicode

status: 学习中

desc: 一个 Rust 工具的分支，专注于更完整的 Kimi Code 支持。

meta: Rust · 分支维护

links: [GitHub](https://github.com/Radiant303/cc-switch-kimicode)

---