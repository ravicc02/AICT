export type Work = {
  id: string;
  title: string;
  english?: string;
  category: string;
  description: string;
  image: string;
  featured?: boolean;
};
// Visual fixtures: the covers and descriptions below are presentation samples, not student records.
export const works: Work[] = [
  {
    id: "mech",
    title: "机甲狂澜",
    english: "MECH MAELSTROM",
    category: "互动游戏",
    description: "选择一台机甲，设计它的技能，创造一个属于自己的冒险世界。",
    image: "mech",
    featured: true,
  },
  {
    id: "caravan",
    title: "房车人生",
    english: "CARAVAN",
    category: "互动游戏",
    description: "装修自己的小小房车，在一路探索中，想象另一种生活。",
    image: "caravan",
    featured: true,
  },
  {
    id: "formation",
    title: "星球编队",
    english: "ORBIT MAKER",
    category: "创意工具",
    description: "为星球设计轨道，让一个小小的灵感，组成自己的宇宙。",
    image: "formation",
    featured: true,
  },
  {
    id: "racing",
    title: "狂野飙车",
    english: "CRAZY CAR RACING",
    category: "互动游戏",
    description: "选择赛车，设计赛道，让想象力跑在前面。",
    image: "racing",
  },
  {
    id: "maze",
    title: "动物迷宫",
    english: "MAZE EXPLORER",
    category: "互动游戏",
    description: "画出一座迷宫，为每一次探索，设置新的惊喜。",
    image: "maze",
  },
  {
    id: "fencing",
    title: "击剑对决",
    english: "FENCING DUEL",
    category: "互动游戏",
    description: "设计一场小小的对决，在规则与节奏之间找到乐趣。",
    image: "fencing",
  },
];
export const records = [
  {
    title: "随机灵感，深度研究",
    date: "09/01",
    type: "项目更新",
    image: "process-idea",
  },
  {
    title: "框架调整",
    date: "09/06",
    type: "课堂记录",
    image: "process-frame",
  },
  {
    title: "角色选择",
    date: "09/12",
    type: "项目更新",
    image: "process-character",
  },
  {
    title: "大更新！",
    date: "09/13",
    type: "课堂记录",
    image: "process-update",
  },
  {
    title: "游戏性更新",
    date: "09/23",
    type: "项目更新",
    image: "process-play",
  },
  {
    title: "游戏性更新",
    date: "09/26",
    type: "课堂记录",
    image: "process-rules",
  },
];
export const dimensions = [
  "语言表达",
  "逻辑思维",
  "工程思维",
  "用户思维",
  "数学能力",
  "艺术审美",
];
export type PlanKey =
  "trial" | "term-one" | "term-two" | "year-60" | "year-100";
export type Plan = {
  key: PlanKey;
  name: string;
  variant: string;
  price: string;
  unit: string;
  duration: string;
  summary: string;
  features: string[];
  sections: { title: string; text: string }[];
};
const formalRules = [
  {
    title: "预约与改期",
    text: "改期原则上提前 24 小时通知，未实际上课不扣课时。具体排期、迟到及缺席安排待补充。",
  },
  {
    title: "托管与资产",
    text: "根据作品形式提供基础托管。服务结束后公网访问可能停止，可提前申请导出源码和项目资产。",
  },
  {
    title: "公开展示",
    text: "作品公开展示需监护人另行主动授权，签约或付款不作为展示授权。",
  },
];
const termSections = [
  {
    title: "创作与交付",
    text: "围绕孩子自己的创意，经历设计、实现、试玩和修改，完成可运行 Demo。包含创作记录、结合项目证据的六维表现整理，以及介绍主要功能的演示视频。",
  },
  {
    title: "次数与时长",
    text: "每期 8 次指导，每次 120 分钟，共 16 个 60 分钟课时。",
  },
  {
    title: "参与准备",
    text: "适合 7–15 岁孩子，无需编程基础，需自备笔记本电脑。授课地点、线上或线下形式、工具要求待补充。",
  },
  ...formalRules,
];
export const plans: Record<PlanKey, Plan> = {
  trial: {
    key: "trial",
    name: "创作体验",
    variant: "90 分钟",
    price: "0",
    unit: "／次",
    duration: "1 次 · 90 分钟",
    summary: "先尝试，再决定。",
    features: [
      "认识 AI 工具与创作方式",
      "完成简单可操作 Demo",
      "试玩并提出一次具体修改",
    ],
    sections: [
      {
        title: "体验内容",
        text: "表达一个小想法，尝试提出需求并观察生成结果，运行简单 Demo，完成一次具体修改。体验后与家长沟通继续学习的方向。",
      },
      {
        title: "参与准备",
        text: "适合 7–15 岁孩子，无需编程基础，需自备笔记本电脑。家长是否陪同、班型、名额与排期在预约时沟通。",
      },
      {
        title: "费用与范围",
        text: "体验费用 ¥0，一次 90 分钟。体验预约不代表已经购买正式指导；创作记录、六维表现整理、完整路演及长期迭代不在体验范围内。",
      },
    ],
  },
  "term-one": {
    key: "term-one",
    name: "按期指导",
    variant: "一对一",
    price: "4,880",
    unit: "／人／期",
    duration: "8 次 · 每次 120 分钟",
    summary: "把一个创意，做成 Demo。",
    features: [
      "围绕自己的创意完成 Demo",
      "创作记录与六维表现整理",
      "演示视频与基础托管",
    ],
    sections: [
      ...termSections,
      {
        title: "付款与退款",
        text: "一对一整期 ¥4,880。提前结束时按实际指导记录与 ¥610／次核算未履行部分；材料说明不另扣违约金及手续费，记录核实后 5 个工作日内退款。具体以书面约定为准。",
      },
    ],
  },
  "term-two": {
    key: "term-two",
    name: "按期指导",
    variant: "一对二",
    price: "待补充",
    unit: "整期价格",
    duration: "8 次 · 每次 120 分钟",
    summary: "各自创作，也与同伴交流。",
    features: [
      "与一对一相同的创作目标",
      "每个孩子围绕自己的创意",
      "同伴交流与老师指导",
    ],
    sections: [
      ...termSections,
      {
        title: "班型与费用",
        text: "一对二整期价格待补充。目标与内容与一对一相同，差别在指导比例和同伴交流。组班与排期在咨询时确认。材料中的提前结束核算价格为 ¥435／次，此价格不等于整期售价。",
      },
    ],
  },
  "year-60": {
    key: "year-60",
    name: "年度创造",
    variant: "60 次",
    price: "30,000",
    unit: "全年规划",
    duration: "12 个月 · 60 次指导",
    summary: "让作品，持续生长。",
    features: [
      "项目长期迭代与创作记录",
      "按进展安排完整路演准备",
      "约定平台展示与基础托管",
    ],
    sections: [
      {
        title: "规划与节奏",
        text: "12 个月规划期，每周 1～2 次，全年规划 60 次指导。每次 120 分钟，共 120 个 60 分钟课时。",
      },
      {
        title: "指导形式",
        text: "以一对一为主，可能根据年龄、进度和方向成组指导。人数与排期提前沟通，参加 1 次 120 分钟指导计 1 次，成组不额外扣次。",
      },
      {
        title: "购买方式",
        text: "全年规划费用 ¥30,000。默认每笔 ¥5,000 独立购买 10 次指导，用完后自主决定是否续购。不自动续费，未购买次数不形成剩余全年欠款；也可在咨询时确定按年付款。",
      },
      {
        title: "成果与路演",
        text: "根据作品实际进展，在已购次数内安排 PPT 梳理、演讲表达、路演演练和双方约定的平台展示。不承诺固定上线或展示结果。",
      },
      ...formalRules,
      {
        title: "费用核算",
        text: "提前结束时按实际指导记录与 ¥500／次核算未履行部分。材料说明不另扣违约金及手续费，记录核实后 5 个工作日内退款。具体以书面约定为准。",
      },
    ],
  },
  "year-100": {
    key: "year-100",
    name: "年度创造",
    variant: "100 次",
    price: "待补充",
    unit: "方案价格",
    duration: "100 次 · 具体安排待补充",
    summary: "完整服务内容待补充。",
    features: [
      "指导时长待补充",
      "规划周期与排课密度待补充",
      "交付与购买方式待补充",
    ],
    sections: [
      {
        title: "方案内容待补充",
        text: "当前材料仅提供 100 次档位选项。价格、单次时长、排课节奏、购买方式及具体交付尚未提供，不能沿用 60 次档位的服务内容。",
      },
    ],
  },
};
export const faqs = [
  {
    q: "没有编程基础，可以参加吗？",
    a: "可以。材料中的适龄范围为 7–15 岁，无需编程基础。老师帮助孩子明确目标、制作、试玩和修改。",
  },
  {
    q: "需要准备什么？",
    a: "需要自备笔记本电脑。具体软硬件与工具要求待补充，体验时是否需要家长陪同在预约时确认。",
  },
  { q: "课程在线上还是线下？", a: "授课形式、地点与可预约时段待补充。" },
  {
    q: "年度方案需要一次付清吗？",
    a: "60 次档位默认每笔 ¥5,000 独立购买 10 次指导，不自动续费，未购买次数不形成后续欠款。也可沟通按年付款。100 次档位的购买安排待补充。",
  },
  {
    q: "作品和源码可以带走吗？",
    a: "按期和年度服务结束时，可提前申请导出源码和项目资产。服务结束后，原有公网访问可能停止。",
  },
];
export const contact = {
  wechat: import.meta.env.VITE_CONTACT_WECHAT || "",
  email: import.meta.env.VITE_CONTACT_EMAIL || "",
  phone: import.meta.env.VITE_CONTACT_PHONE || "",
};
