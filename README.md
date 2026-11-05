# AI 创造营前端

依据 DESGINS.md、PRD.md 和本地参考素材开发。使用 React、TypeScript、Vite、Motion 与本地 SVG 插画。当前交付为视觉及交互原型，未接入后台、真实预约、支付或真实作品。

## 公开仓库与在线演示

- GitHub 仓库：https://github.com/ravicc02/AICT
- GitHub Pages：https://ravicc02.github.io/AICT/

推送到 main 后，.github/workflows/pages.yml 自动安装依赖、构建预渲染页面并发布 Pages。工作流根据 Pages 的 base_path 配置路由、图片、字体与站点元数据；本地默认仍使用根路径。

此站为前端视觉演示，预约表单不发送数据。参考图片的出处保存在 public/images/reference/provenance.json，记录文字与能力数值仍为示例。原始下载图片和本地检查产物保留在本地，不上传到公开仓库；网页使用的压缩图片、字体及其许可证随源码提供。

## 本地运行

```powershell
npm install
npm run dev
```

开发地址：http://127.0.0.1:5173 。

## 生产预览

```powershell
npm run build
npm run preview -- --port 4173
```

预览地址：http://127.0.0.1:4173 。构建会预渲染首页、课程页、作品墙、六个作品详情、联系页与 404，输出在 dist/。预览服务器只提供静态文件，不接收表单。

## 页面与内容

- /：作品扇形画廊、课程 SOP（记录目录、过程图片和单张能力总览）、体验入口。
- /courses：免费体验、按期指导、年度创造；班型和次数切换、服务细则、常见问题。
- /works：开放式创作档案目录、关键记录缩略图、分类、搜索、排序与空结果状态。
- /works/:id：六个示例项目，图片过程时间线、多图记录弹窗，以及关联具体记录的六维总览。
- /works/:id?record=record-01#creation-records：直接查看某次记录，支持刷新、前进后退与关闭。
- /contact：带方案上下文的预约表单预览，不发送或保存填写内容。

所有封面为原创 SVG 占位插画；未声称为真实学员成果，没有真实学员姓名、年龄或成绩。记录文字、孩子表达与六维数值为明确标注的示例，过程图片按用户要求从对标站六个公开项目下载，并标明参考来源，后续需换成本项目实际档案。已知价格来自 PRD；一对二整期价格和年度 100 次方案保持待确认。

## 维护

主要内容：src/data/content.ts。创作档案：src/data/dossiers.ts（32 条示例记录、图片组、老师观察、孩子表达、修改结果及六维依据）。首页 SOP 从同一档案派生。

共享图表和记录弹窗：src/components/CreationArchive.tsx；档案样式：src/components/CreationArchive.css。页面：src/pages/；基础样式：src/styles.css；封面：public/art/；过程图：public/images/reference/。下载了 202 张图片，压缩版合计约 8.9 MB，当前记录选用其中 72 张；映射文件为 src/data/reference-images.ts，图片清单与处理说明见 docs/reference-images.md。

中文字体为本地 Noto Sans SC 子集，许可证位于 public/fonts/OFL.txt。更新中文文案后运行 npm run fonts，需要 Python 与 fontTools、Brotli；源字体已在 artifacts/font-source/ 中。未覆盖的字符可使用系统中文字体回退。

正式配置域名时，在构建环境设置 SITE_URL，预渲染脚本会生成 canonical 与绝对地址的 OG 图链接。示例：$env:SITE_URL='https://your-domain.example'。分享图为 public/og-cover.png。GitHub Pages 的站点地址由发布工作流自动传入；未进行社交平台抓取测试。

## 检查

```powershell
npm run check
npm run build
# 保持生产预览运行后：
npm test
node scripts/verify-sop.mjs
node scripts/verify-archives.mjs
```

浏览器检查使用已安装的 Chrome 和 Playwright。覆盖鼠标、拖动、键盘、手机菜单、筛选、方案、弹窗、表单预览、减少动态效果，以及 320 / 375 / 414 / 768 / 1440 五种屏宽。结果保存在 artifacts/browser-check.json；SOP 专项为 artifacts/sop-verification-v3.json；档案专项为 artifacts/archive-verification.json，额外检查 32 条记录、图库键盘操作、直接链接、历史导航、能力依据和记录弹窗。

仓库子路径构建可设置 BASE_PATH=/AICT/。子路径发布检查脚本为 scripts/verify-pages.mjs；线上检查通过 PAGES_URL 环境变量指定完整站点地址。

视觉说明：docs/motion-design.md。验收记录：docs/verification.md。最初的部分组件与过期实施文档已备份到 artifacts/previous-partial/；产品需求、设计参考和原始素材保留。
