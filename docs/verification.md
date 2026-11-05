# 本轮前端验收记录

日期：2026-11-05。范围为视觉与交互原型；没有后台预约、真实游戏、支付、学员成绩或公网部署。旧版本验收文字已保存在 artifacts/previous-partial/docs/verification.md，不作为本轮结果。

## 创作档案与参考图片验收（2026-11-05，当前版本）

作品墙改为开放横列，每个项目有独立的过程图片入口；详情以图片时间线展示记录，弹窗包含图库、老师观察、孩子表达和修改结果。首页保留左目录、右图片与单张总览布局，图片打开同一套记录弹窗。详情末尾的一张六维总览支持选择维度并回看对应记录。

- `npm run build` 通过，预渲染 11 个页面；新增中文已纳入本地字体子集。
- `npm test` 13 / 13；25 组页面布局检查、10 组 A/AA 页面自动扫描通过。
- `node scripts/verify-sop.mjs` 12 / 12；九个屏宽、触屏、键盘、记录弹窗、静态总览、无 JavaScript 和实时减少动态效果通过。结果为 `artifacts/sop-verification-v3.json`。
- `node scripts/verify-archives.mjs` 10 / 10；核查六个项目全部 32 条记录、图片与文本完整性、图库方向键、记录前后边界、焦点循环、深链刷新、浏览器前进后退、六个维度对应依据、时间线滚动及静态内容。18 组布局和两组记录弹窗 A/AA 自动扫描通过，无脚本错误或资源失败。结果为 `artifacts/archive-verification.json`。
- 公共图片下载 202 / 202 成功，转换文件全部通过 Pillow 验证，并从本地预览逐一请求校验状态、类型与字节数，失败数为 0；桌面与手机预览未发出外部图片请求。图片检查结果为 `artifacts/reference-images-verification.json`。

专项中修复了记录参数直达时的预渲染不一致、打开记录时丢失锚点，以及关闭弹窗后因 DOM 与历史导航更新导致的焦点恢复时序问题。单条图片数量随源素材变化，不强制凑成三张。未导入参考站记录文案、学生资料、评估或视频。

最终截图：`artifacts/archive-index-desktop.png`、`artifacts/archive-index-mobile.png`、`artifacts/archive-detail-desktop.png`、`artifacts/archive-detail-mobile.png`、`artifacts/archive-record-desktop.png`、`artifacts/archive-record-mobile.png`。首页证据更新为 `artifacts/sop-v3-desktop.png` 与 `artifacts/sop-v3-mobile.png`。截图反映本地 Chrome 检查，不代表真实设备人工验收或公网部署。

下面保留此前实现与检查历史，旧截图不作为当前档案与素材版本的证据。

## 浏览器批注调整后的验收（2026-11-05，上一版）

根据三处批注，将课程 SOP 改为左侧纵向目录，右侧展示可放大的记录照片/截图和单张六维能力总览；总览的六个轴共同形成完整多边形，切换记录时保持不变。首页的作品精选区整段移除，Hero 画廊保留。

- 最终 `npm run build` 通过，仍预渲染 11 个页面。
- `npm test` 13 / 13 通过，包含首页目录、记录图片、总览独立性及作品精选移除。25 组页面响应式检查、10 组页面 A/AA 自动扫描通过；无捕获到的脚本错误。
- `node scripts/verify-sop.mjs` 12 / 12 通过。专项核对左右排列、全部 10 条记录图片加载、六个雷达顶点与单张固定总览、键盘边界、无卡片样式、图片放大与体验/路演三种弹窗、关闭恢复焦点、真实触屏点击、无 JavaScript 和实时减少动态效果。
- 320、375、767、768、1023、1024、1100、1387、1440 九个屏宽均无横向溢出或越界操作，触区高度不小于 44px。放大图片弹窗的 A/AA 扫描无发现，专项未捕获失败资源。

专项证据：`artifacts/sop-verification-v2.json`。当前截图：`artifacts/sop-v2-desktop.png`、`artifacts/sop-v2-active-record.png`、`artifacts/sop-v2-mobile.png`，完整首页为 `artifacts/home-sop-v2-desktop.png` 与 `artifacts/home-sop-v2-mobile.png`。区域截图只隐藏固定导航以展示完整区域；全页截图从页面顶部拍摄。

记录图片复用已有参考素材并注明占位；示例项目名称改为与机甲素材对应的“机甲狂澜”。雷达形状注明为示意，没有加入真实学员身份、成绩或测评数据。下面的章节仅保留前一轮实现和检查历史。

## 首页课程 SOP 增量验收（2026-11-05）

根据用户追加要求，课程 SOP 移到 Hero 后的第二部分。复用参考图的左侧创作时间线与右侧成长维度布局，去除卡片容器；原四步流程区已替换。以下为本次增量实际执行的检查，旧截图不是新增区域的证据。

- `npm run build` 通过，仍预渲染 11 个页面；新增中文已加入本地字体子集。
- 更新后的 `npm test` 13 / 13 通过：包含课程 SOP 的位置、十个节点、键盘操作与成长联动；25 组页面布局检查和 10 组页面 A/AA 扫描通过。
- 专项 `node scripts/verify-sop.mjs` 最终 10 / 10 通过。覆盖十条记录、反向维度定位、无卡片样式、两个占位弹窗及焦点恢复、真实触屏点击、无 JavaScript 的初始内容、运行中切换减少动态效果。
- 320、375、767、1023、1024、1100、1280、1440 八个宽度无横向溢出，新增区域所有操作触区高度不小于 44px。体验弹窗 A/AA 扫描无发现。无捕获到的运行时错误或失败资源。
- 补查中修复了 320px 下课程链接触区偏小，以及在页面打开后切换减少动态效果时 Motion 偏好没有更新的问题。修复后重新构建并完整重跑上述 SOP 专项；未将此前全站测试冒充为修复后的重复测试。

结果：`artifacts/sop-verification.json`。已实际查看 `artifacts/sop-desktop.png`、`artifacts/sop-active-record.png`、`artifacts/sop-mobile.png`。完整首页为 `artifacts/home-with-sop-desktop.png` 与 `artifacts/home-with-sop-mobile.png`。

10 个节点是创作过程示例，不代表 10 次课；没有真实学员身份、日期或测评分数。作品体验和路演仍为明确占位，未新增后台或真实游戏。

## 前一轮完整网站验收

| 检查                           | 结果                                                                    | 证据                                               |
| ------------------------------ | ----------------------------------------------------------------------- | -------------------------------------------------- |
| TypeScript、客户端与服务端构建 | 通过，预渲染 11 个页面                                                  | npm run build                                      |
| 浏览器交互                     | 13 / 13 项通过                                                          | artifacts/browser-check.json                       |
| 响应式                         | 320、375、414、768、1440 × 5 个主要页面，共 25 组，无横向溢出或标题溢出 | artifacts/browser-check.json                       |
| 页面无障碍                     | 桌面与手机共 10 组，WCAG A/AA 自动扫描无发现                            | 同上                                               |
| 弹窗无障碍                     | 作品预览弹窗扫描无发现                                                  | artifacts/final-evidence.json                      |
| 真实触屏手势                   | CDP 触摸事件完成滑动切换；菜单触摸打开成功                              | 同上                                               |
| 资源与运行时                   | 最终捕获无缺图、无失败资源、无页面脚本错误                              | 同上                                               |
| 减少动态效果                   | 内容完整；画廊切换有效；指针倾斜关闭；无运行中的动画                    | artifacts/browser-check.json 与 reduced-motion.png |
| 无 JavaScript 与 404           | 首屏及导航保留；未知地址返回 HTTP 404                                   | artifacts/browser-check.json                       |
| 设计源码检查                   | 聚合源码 P0 = 0                                                         | artifacts/finesse-final.json                       |
| 触区补查                       | 方案选择按钮在五种屏宽均为 44px，无横向溢出                             | artifacts/touch-target-check.json                  |

交互检查使用真实鼠标、拖动、滚轮、点击和键盘输入。包括：画廊指针反馈与拖动、四步创作与配色、方案选择与价格状态、FAQ、分类搜索排序与空结果、六个详情与弹窗、预约预览及返回编辑、手机菜单、焦点、减少动态效果和静态首屏。

修复了筛选退出动画收尾偏慢、带查询参数的方案选择在预渲染接管后不同步、图片原生拖拽抢占画廊手势、详情页三处文字对比度不足。最后将方案按钮触区提升到 44px，并单独重新检查五种屏宽；没有扩大为与改动无关的重复测试。

## 视觉证据

已实际查看桌面首页、完整首页、手机首页、桌面作品墙、手机联系页、课程页和平板课程布局，以及作品预览弹窗。静态检查之外，保留最终截图：

- artifacts/final-home-desktop.png：桌面首屏。
- artifacts/final-home-1440.png、final-home-375.png：完整首页。
- artifacts/final-courses-1440.png、final-courses-768.png、final-courses-375.png：课程布局。
- artifacts/final-works-1440.png、final-works-375.png：作品墙。
- artifacts/final-works-mech-1440.png、final-works-mech-375.png：详情。
- artifacts/final-contact-1440.png、final-contact-375.png：预约预览。
- artifacts/final-work-preview.png：作品演示占位弹窗。
- artifacts/reduced-motion.png：减少动态效果状态。

## 本机动效采样

Headless Chrome，1440 × 1000，CDP CPU slowdown 4x，真实指针扫动期间采集 90 个 requestAnimationFrame 间隔。平均 6.26ms，P95 6.30ms，最大 15.30ms，超过 33.5ms 的帧为 0。原始数据在 artifacts/final-evidence.json。

这是本机浏览器实验记录；浏览器刷新率、GPU 和模拟方式与真实手机不同，不能当成真实手机帧率承诺。未进行 Lighthouse、真实手机硬件或弱网测试。

## 静态检测器说明

按文件扫描 Layout.tsx 时，检测器将安排锚点定位的 requestAnimationFrame 误判为没有减少动态效果支持。它只安排一次即时滚动，不是连续动画；全站 CSS 和 Motion 均实现减少动态效果。保留逐文件报告 artifacts/finesse-modules.json，使用完整聚合源码 artifacts/finesse-source.txt 再检查后 P0 为 0，并以实际浏览器减少动态效果测试补充证据。

剩余 P1 为导航和 dialog 内部头部都有 sticky top:0；两者位于不同滚动容器，弹窗使用浏览器顶层，不相互覆盖。P2 为局部插画、创作纸片等颜色未全部抽为根令牌；网站操作色保持一致。检测器不是对静态画面美观程度的评分。

## 明确保留的占位

六张作品封面为本次制作的 SVG 视觉样例。作品演示、课堂过程和成长观察没有接入真实内容。预约预览不发送和保存信息。未确认的班型总价、年度 100 次安排及联系渠道保持待补充。没有使用假学员姓名、人数、成绩、证言或项目效果数字。

分享封面、favicon 和 Apple touch icon 已输出。正式上线需配置 SITE_URL，补齐真实内容与联系方式；本轮未进行公网发布或社交平台抓取验收。
