# jinyang-simplify

杨金的个人作品集，记录我在 AI 产品运营、内容策略、AI 工作流与建筑设计中的实践。

这里展示的是完整项目过程：从用户问题与项目背景出发，说明我做了什么，以及最终产生了什么效果。

---

## Featured projects

- [稿定简历](public/projects/resume-notes/) — 面向求职者的可解释 AI 简历优化产品，从岗位理解、证据提取到逐项修改与导出。
- [图片提示词反推](public/projects/image-prompt/) — 将参考图拆解为结构化、可调整的中文生图提示词。
- [走马岭数字预运营系统](public/projects/zoumaling/) — 面向乡村文旅项目的数字化运营与体验设计实践。
- [AI.Simplify Skills](https://github.com/18087627569yj-hue/AI.Simplify) — 将高频工作方法整理成可复用、可安装的 AI Skill。

---

## AI workflows

- 文章生成：从主题与资料出发，建立适合长文的完整叙事。
- 图文笔记：结合图片、用户利益点与平台语感生成可编辑文案。
- 图片提示词反推：把参考图转换为可复现、可调整的视觉描述。
- 可编辑 SketchUp 模型：根据图纸、尺寸或参考图建立可继续修改的 SU 模型结构。

Skill 文件与安装说明统一维护在 [AI.Simplify](https://github.com/18087627569yj-hue/AI.Simplify) 仓库，本仓库只负责作品集展示。

---

## Repository structure

```text
jinyang-simplify/
├── index.html              # 个人作品集首页
├── src/                    # 全站样式与交互
├── public/
│   ├── assets/             # 公开展示素材
│   ├── projects/           # 独立项目详情页
│   └── downloads/          # 可下载文件
├── scripts/                # 本地预览与构建脚本
├── worker/                 # 在线部署入口
└── docs/                   # 项目说明与产品文档
```

本地原始照片、录屏和设计源文件不会作为网站代码发布，但会保留在本地，不会因仓库整理而删除。

## Local development

```bash
npm install
npm run dev
```

默认预览地址：`http://localhost:4173`

生成发布版本：

```bash
npm run build
```

公共留言墙使用 Cloudflare Pages Functions 与 D1 数据库。首次部署配置见 [Cloudflare 公共留言墙配置](docs/cloudflare-messages.md)。

## License

[MIT](LICENSE)
