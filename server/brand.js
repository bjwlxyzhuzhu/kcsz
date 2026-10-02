// 品牌版本：同一套程序以不同名称运行（启动时设置环境变量 YANZHI_BRAND）。
// 默认（未设置 YANZHI_BRAND，或设为 szsx）为参赛版“演知思政——基于Agents协同与对抗的虚拟教研实训工场”；
// 设为 yszj 时恢复原名“研思智境”；设为 zw 时为国际中文教育版“演知中文”。
// 这样只上传代码、按 npm start / Dockerfile 启动的公网站点也显示“演知思政”。
// 名称替换只作用于界面文字、页面标题、Logo 与数字客服的回答，不改变任何功能与数据。
// 国际中文版（domain: 'ichinese'）另外做领域术语替换（课程思政 → 国际中文教学等）与配色替换（青花蓝 + 描金），
// 领域内容（学习者智能体、文化与交际要素库、教研角色）见 server/domain.js。
export const BRANDS = {
  szsx: {
    key: 'szsx', name: '演知思政', slogan: '基于Agents协同与对抗的虚拟教研实训工场',
    en: 'Agents Collaboration & Confrontation · Virtual Teaching-Research Studio',
  },
  zw: {
    key: 'zw', name: '演知中文', slogan: '国际中文教师多智能体研课与课堂预演平台', motto: '上课之前，先在这里教一遍世界',
    en: 'YanZhi Chinese · Multi-Agent Lesson Design & Classroom Rehearsal for International Chinese Teachers',
    domain: 'ichinese', palette: 'qinghua', licensing: true,
    // 领域术语（按原文长度从长到短依次替换，避免短词先替换破坏长词）
    terms: [
      ['演知思政', '演知中文'],
      // 本地生成文字中的工程类情境 → 交际与文化情境
      ['思政融入与价值冲突情境', '文化融入与跨文化比较情境'],
      ['真实工程情境', '真实交际情境'],
      ['以具体决策情境呈现价值冲突', '以真实交际任务呈现文化差异'],
      ['引导学生分析工程责任与公共利益', '引导学习者比较中外异同、学会得体表达'],
      ['能解决复杂工程问题', '能在真实情境中用中文完成交际任务'],
      ['“依据—推理—验证”的工程决策任务', '“输入—操练—输出”的真实交际任务'],
      ['具有工程伦理与社会责任意识', '具有跨文化交际意识与中华文化理解'],
      ['以真实案例的价值冲突情境组织讨论与决策', '以真实交际中的文化差异情境组织讨论与体验'],
      ['是否落在具体专业决策上', '是否落在具体交际任务上'],
      ['考查专业判断与价值判断的理由', '考查语言运用与文化理解'],
      ['你能举一个工程中的例子吗', '你能用它说一个句子吗'],
      ['建议在教案中设计具体的价值冲突情境与提问', '建议在教案中设计文化比较或文化体验任务'],
      ['建议把价值要求落到一次专业判断上', '建议把文化内容落到一次交际任务上'],
      ['从岗位现场看', '从海外本土课堂看'],
      ['是检验、装配时每天都要用到的判断依据', '是学习者日常交际中经常用到的表达'],
      ['关键是让学生在专业判断中给出理由，而不是记口号', '关键是让学习者在交际任务中体验和比较，而不是单向灌输'],
      ['分析价值冲突与责任', '设计文化比较与体验'],
      ['融入专业任务', '融入交际任务'],
      ['相关的专业问题引入', '相关的真实交际情境引入'],
      ['这里的判断需要依据，我们一起看材料。', '我们一起看课文里的例句，再说一遍。'],
      ['我们先区分已知事实和需要核查的信息。', '我们先看看中国人一般怎么说。'],
      ['可设置为专业课教师、专业博导、企业工程师等', '可设置为海外本土中文教师、汉语言文字学教授、中文水平考试考官等'],
      ['学生智能体按班级学情模拟上课', '来自不同国家的学习者智能体按中文水平模拟上课'],
      ['教师智能体协同研课，生成教案与课件', '教师智能体协同研课，生成国际中文教案与课件'],
      ['使用工程责任、科技伦理、职业规范、公共利益等具体决策情境，避免只在结尾添加口号', '以真实交际任务和文化比较呈现文化内容，尊重学习者的文化背景，避免刻板印象和单向灌输'],
      ['在这个情境中，工程师应承担什么责任？依据是什么？', '在这个情境中，你会怎样用中文得体地表达？和你的国家有什么不同？'],
      ['专业内容准确性与案例的专业依据', '语音、词汇、语法、汉字等语言知识讲解的准确性'],
      ['思政元素与专业任务的有机融入', '中华文化与跨文化交际要素的有机融入'],
      ['人才培养方案（课程思政融入）', '人才培养方案（国际中文教育）'],
      ['毕业要求—课程思政支撑矩阵', '毕业要求—国际中文能力支撑矩阵'],
      ['培养目标—思政元素映射', '培养目标—文化与交际要素映射'],
      ['课程知识点与思政融入图谱', '语言点与文化融入图谱'],
      ['知识点与思政融入图谱', '语言点与文化融入图谱'],
      ['岗位真实情境与职业规范', '海外本土教学情境与学习者母语背景'],
      ['专业目标与价值目标协同', '语言目标、交际目标与文化目标协同'],
      ['你在模拟一名大学生', '你在模拟一名国际中文学习者'],
      ['高校课程思政课堂', '国际中文课堂'],
      ['课程思政教学设计', '国际中文教学设计'],
      ['工程责任与公共利益', '跨文化理解与得体表达'],
      ['工程责任的角度', '文化比较的角度'],
      ['课程体系思政分工', '课程体系文化教学分工'],
      ['实践环节可行性', '课堂操练与交际活动的可行性'],
      ['思政版教学大纲', '国际中文课程大纲'],
      ['课程思政课件', '国际中文课件'],
      ['思政情境讨论', '文化情境讨论'],
      ['思政案例材料', '文化案例材料'],
      ['学生智能体', '学习者智能体'],
      ['课程思政', '国际中文教学'],
      ['思政融入点', '文化融入点'],
      ['思政教师', '跨文化交际教师'],
      ['思政融入', '文化融入'],
      ['思政元素', '文化与交际要素'],
      ['思政映射', '文化映射'],
      ['思政要点', '文化要点'],
      ['思政重点', '文化重点'],
      ['专业教师', '中文教师'],
      ['行业导师', '本土化教学顾问'],
      ['实验教师', '语言实践教师'],
      ['评价专家', '测评专家'],
      ['价值目标', '文化目标'],
      ['思政', '文化'],
    ],
  },
};
export const BRAND_KEY = String(process.env.YANZHI_BRAND || 'szsx').trim().toLowerCase();
export const BRAND = BRANDS[BRAND_KEY] || null; // yszj 或其他未登记的值：原名“研思智境”
export const DOMAIN = BRAND?.domain || 'ideology';

const PAIRS = BRAND ? [
  ['研思智境（原“研思智境”）', BRAND.name],
  ['“研—演—评—改”多智能体数字教研实验工坊', BRAND.slogan],
  ['Research · Simulation · Evaluation · Improvement', BRAND.en],
  ['Research · Reflection · Simulation · Improvement · Multi-Agent Teaching Research Intelligence', BRAND.en],
  ['研思智境', BRAND.name],
  ...[...(BRAND.terms || [])].sort((a, b) => b[0].length - a[0].length),
] : [];
/** 把默认品牌名称（及领域术语）替换为当前品牌的写法（默认品牌下原样返回）。 */
export const brandText = (s) => (BRAND && typeof s === 'string' ? PAIRS.reduce((t, [a, b]) => (t.includes(a) ? t.split(a).join(b) : t), s) : s);
/** 对 JSON 可序列化的对象做同样的替换（只替换字符串值，不改键名）。 */
export const brandDeep = (v) => {
  if (!BRAND?.terms) return v;
  if (typeof v === 'string') return brandText(v);
  if (Array.isArray(v)) return v.map(brandDeep);
  if (v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, brandDeep(x)]));
  return v;
};
/** 品牌专属图片（Logo 等）：public/img/brand/<key>/<文件名>，不存在时回退到默认图片。 */
export const brandImage = (name) => (BRAND ? `img/brand/${BRAND.key}/${name}` : null);

// ---------- 配色替换：把原“绛红 + 暖金 + 深空”色板按色相映射为品牌色板 ----------
// qinghua（青花）：红/玫红/暖褐色调 → 青花钴蓝（色相 218°）；高饱和金色保持为描金点缀；青色、绿色不变。
const hex2 = (n) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function hsl2rgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}
const PALETTES = {
  qinghua: (r, g, b) => {
    const [h, s, l] = rgb2hsl(r, g, b);
    if (s < 0.04) return null; // 纯灰阶不动
    const gold = h >= 22 && h <= 55 && s >= 0.45 && l >= 0.3 && l <= 0.86;
    const warm = h >= 280 || h < 60;
    if (gold || !warm) return null;
    const vivid = s > 0.45 && l > 0.25 && l < 0.75; // 原品牌红 → 钴蓝
    return hsl2rgb(vivid ? 220 : 216, vivid ? Math.min(s, 0.78) : Math.min(s, 0.55), vivid ? Math.min(l + 0.04, 0.7) : l);
  },
};
const MAP = BRAND?.palette ? PALETTES[BRAND.palette] : null;
/** 替换 CSS / JS / SVG 文本中的颜色字面量（#rgb、#rrggbb、#rrggbbaa、rgb()/rgba()）。shortHex=false 时不处理 3/4 位十六进制（JS 中易与选择器混淆）。 */
export function recolor(text, { shortHex = true } = {}) {
  if (!MAP) return text;
  const re = shortHex ? /#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g : /#([0-9a-fA-F]{8}|[0-9a-fA-F]{6})\b/g;
  let out = text.replace(re, (m, hx) => {
    const full = hx.length <= 4 ? [...hx].map((c) => c + c).join('') : hx;
    const r = parseInt(full.slice(0, 2), 16), g = parseInt(full.slice(2, 4), 16), b = parseInt(full.slice(4, 6), 16);
    const n = MAP(r, g, b); if (!n) return m;
    const alpha = full.length === 8 ? full.slice(6) : '';
    return `#${n.map(hex2).join('')}${alpha}`;
  });
  out = out.replace(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*[\d.]+\s*)?\)/g, (m, r, g, b, a) => {
    const n = MAP(+r, +g, +b); if (!n) return m;
    return a ? `rgba(${n.map(Math.round).join(', ')}${a})` : `rgb(${n.map(Math.round).join(', ')})`;
  });
  return out;
}
