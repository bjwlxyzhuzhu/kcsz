// 首页（一屏）：品牌名 + 研课场 ⇄ 演课场两张实拍入口卡片与双向流转箭头。不展示统计数字；双向流转逻辑与原首页一致。
import { post, get, key } from './api.js';
import { esc, $$, toast, fail, confirmBox, TYPE_NAME, MODULE_NAME, tour } from './ui.js';

const ARROW = (dir) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${dir === 'right' ? '<path d="M4 12h15M13 6l6 6-6 6"/>' : '<path d="M20 12H5M11 6l-6 6 6 6"/>'}</svg>`;
// 实拍照片轮播（Unsplash License，可免费使用、无需署名；页脚仍注明作者）
const PHOTOS = {
  seminar: [
    { src: '/img/home/seminar-1.webp', alt: '两位教师在办公桌前对照资料讨论教学设计', by: 'blue sky' },
    { src: '/img/home/seminar-2.webp', alt: '教师们围坐会议桌逐条研读材料', by: 'blue sky' },
    { src: '/img/home/seminar-3.webp', alt: '青年教师团队围着笔记本电脑协作讨论', by: 'Van Tay Media' },
  ],
  classroom: [
    { src: '/img/home/classroom-1.webp', alt: '阶梯教室里教师提问，学生举手回应', by: 'Vitaly Gariev' },
    { src: '/img/home/classroom-2.webp', alt: '满黑板板书的大学课堂', by: 'Shubham Sharan' },
    { src: '/img/home/classroom-3.webp', alt: '学生在大教室里听课', by: 'Vishnu Mehra' },
  ],
};
const CREDITS = [...new Set(Object.values(PHOTOS).flat().map((p) => p.by))].join('、');

export async function pageHome(root, { navigate }) {
  const h = await get('/api/home');
  const cur = (m) => h.current[m];
  const label = (m) => (cur(m) ? `当前：${cur(m).title} · v${cur(m).version}${cur(m).status === 'draft' ? '（草稿）' : ''}` : '当前暂无产物');
  const arrow = (from) => {
    const to = from === 'seminar' ? 'classroom' : 'seminar';
    const src = cur(from);
    const name = `将${MODULE_NAME[from]}当前产物导出并导入${MODULE_NAME[to]}`;
    const tip = src ? `导入${MODULE_NAME[to]}` : `${MODULE_NAME[from]}暂无当前产物`;
    return `<button class="arrow-btn hx-arrow" data-from="${from}" aria-label="${esc(src ? name : `${name}（不可用：${MODULE_NAME[from]}暂无当前产物）`)}" ${src ? '' : 'disabled'}>${ARROW(from === 'seminar' ? 'right' : 'left')}<span class="tip" role="tooltip">${esc(tip)}</span></button>`;
  };
  const card = (m) => {
    const S = m === 'seminar';
    return `<a class="hx-card ${m}" id="portal-${m}" href="/${m}" data-link="/${m}" aria-label="进入${S ? '研课场' : '演课场'}">
      <div class="hx-media">${PHOTOS[m].map((p, i) => `<img class="hx-photo${i ? '' : ' on'}" src="${p.src}" alt="${p.alt}" decoding="async">`).join('')}
        <span class="hx-dots" aria-hidden="true">${PHOTOS[m].map((_, i) => `<i${i ? '' : ' class="on"'}></i>`).join('')}</span></div>
      <div class="hx-body">
        <div><h2>${S ? '研课场' : '演课场'}</h2><p>${S ? '教师智能体协同研课，生成教案与课件' : '学生智能体按班级学情模拟上课'}</p><p class="hx-cur">${esc(label(m))}</p></div>
        <span class="hx-go">进入 ›</span>
      </div></a>`;
  };

  document.body.classList.add('is-home');
  root.innerHTML = `<div class="hx"><div class="hx-bg" aria-hidden="true"><i class="b1"></i><i class="b2"></i><i class="b3"></i><span class="hx-grid"></span></div>
    <header class="hx-intro"><h1 id="hx-title">研思智境</h1><p>“研—演—评—改”多智能体数字教研实验工坊</p></header>
    <div class="hx-stage">${card('seminar')}<div class="hx-bridge">${arrow('seminar')}${arrow('classroom')}</div>${card('classroom')}</div>
    <p class="hx-credit">照片：${CREDITS} · <a href="https://unsplash.com/license" target="_blank" rel="noopener">Unsplash License</a>　|　演课场中的学生为智能体，模拟结果不代表真实学生表现</p>
  </div>`;


  tour('home', [
    { sel: '#portal-seminar', place: 'right', title: '① 研课场', text: '导入讲义、大纲、课件等课程内容后，系统自动解析知识点，教研组逐个知识点研讨讲解要点、难点、思政融入与检测题，生成教案、试卷等成果；可随时暂停与继续。' },
    { sel: '.arrow-btn[data-from=seminar]', place: 'bottom', title: '② 导入课堂 →', text: '把研课场的“当前产物”（如教案）导出并导入演课场。点击后会先让你确认。' },
    { sel: '#portal-classroom', place: 'left', title: '③ 演课场', text: '按设定课时（如 50 分钟）开课：教师依次讲解，学生智能体自主、随机地提问、质疑和讨论；可倍速运行，也可以随时以教师或学生身份插话。' },
    { sel: '.arrow-btn[data-from=classroom]', place: 'bottom', title: '④ 反馈回研讨 ←', text: '把课堂生成的反馈带回研课场，作为反思修订的依据。' },
    { sel: '#credit-pill', place: 'bottom', title: '⑤ 积分与导出', text: '真实模型每次成功回复按费率扣积分，开始前会显示预算；本地生成、编辑、流转、导出都不扣积分。右侧可导出研究数据。' },
  ]);
  $$('.arrow-btn:disabled', root).forEach((b) => { b.title = b.querySelector('.tip').textContent; });
  $$('.arrow-btn[data-from]', root).forEach((b) => b.addEventListener('click', () => doTransfer(b.dataset.from, cur(b.dataset.from), () => pageHome(root, { navigate }))));

  return () => { document.body.classList.remove('is-home'); timers.forEach((t) => { clearTimeout(t); clearInterval(t); }); };
}

export async function doTransfer(from, src, redraw) {
  const to = from === 'seminar' ? 'classroom' : 'seminar';
  const draft = src.status === 'draft';
  const ok = await confirmBox('确认流转', `<p style="font-size:calc(18px * var(--fs));margin:0 0 10px;color:var(--gold)">${MODULE_NAME[from]} → ${MODULE_NAME[to]}</p>
    <dl class="kv"><dt>源产物</dt><dd>${esc(src.title)}</dd><dt>版本</dt><dd>v${src.version}${draft ? '（未保存草稿）' : ''} · ${esc(TYPE_NAME[src.type] || src.type)}</dd><dt>摘要</dt><dd class="small">${esc(src.summary)}</dd></dl>`, draft ? '保存当前版本并导入' : '确认');
  if (!ok) return;
  try {
    const r = await post('/api/transfers', { from, idempotency_key: key('xfer'), save_draft: draft });
    toast(`已导入${MODULE_NAME[to]}：${r.target.title} · v${r.target.version}`);
    redraw();
  } catch (e) { fail(e); }
}
