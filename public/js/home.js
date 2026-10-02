// 首页展示两种教研场景；点击场景卡片后再登录进入。
import { post, key } from './api.js';
import { esc, $$, toast, fail, confirmBox, TYPE_NAME, MODULE_NAME, tour } from './ui.js';

const SCENES = {
  seminar: {
    index: '01', name: '研课场', kicker: '协同研课',
    title: '让每一次教研，都有更深的对话。',
    description: '汇集课程资料与教学问题，让多智能体协同研讨讲解要点、思政融入与评价方式，形成可继续打磨的教学成果。',
    image: '/img/home/seminar-1.webp',
  },
  classroom: {
    index: '02', name: '演课场', kicker: '虚拟演课',
    title: '在走进课堂之前，先看见课堂。',
    description: '把教学设计带入虚拟课堂，与学生智能体展开提问、质疑和讨论，再将反馈带回教研，持续修订。',
    image: '/img/home/classroom-1.webp',
  },
};

export async function pageHome(root, { navigate, authenticated = false }) {
  const choice = (mode) => {
    const s = SCENES[mode];
    return `<button type="button" class="hx-choice${mode === 'seminar' ? ' active' : ''}" id="portal-${mode}" data-scene="${mode}" aria-pressed="${mode === 'seminar'}">
      <span class="hx-choice-index">${s.index} / ${s.kicker}</span>
      <span class="hx-choice-name">${s.name}</span>
      <span class="hx-choice-action" aria-hidden="true">↗</span>
    </button>`;
  };

  document.body.classList.add('is-home');
  root.innerHTML = `<section class="hx" aria-label="研思智境首页">
    <div class="hx-scenes" aria-hidden="true">
      ${Object.entries(SCENES).map(([mode, s]) => `<img class="hx-scene${mode === 'seminar' ? ' active' : ''}" data-bg="${mode}" src="${s.image}" alt="" decoding="async">`).join('')}
    </div>
    <div class="hx-scrim" aria-hidden="true"></div>
    <div class="hx-light" aria-hidden="true"></div>
    <canvas class="hx-particles" aria-hidden="true"></canvas>
    <div class="hx-content">
      <div class="hx-center">
        <h1 id="hx-title">${SCENES.seminar.title}</h1>
        <p class="hx-description" id="hx-description">${SCENES.seminar.description}</p>
        <div class="hx-choices" role="group" aria-label="选择教研空间">${choice('seminar')}${choice('classroom')}</div>
      </div>
    </div>
  </section>`;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stopParticles = animateParticles(root.querySelector('.hx-particles'), reducedMotion);
  let active = 'seminar';
  let paused = false;
  const showScene = (next) => {
    if (next === active) return;
    active = next;
    $$('.hx-choice', root).forEach((item) => {
      const selected = item.dataset.scene === next;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    $$('.hx-scene', root).forEach((image) => image.classList.toggle('active', image.dataset.bg === next));
    root.querySelector('#hx-title').textContent = SCENES[next].title;
    root.querySelector('#hx-description').textContent = SCENES[next].description;
    if (!reducedMotion.matches) root.querySelector('.hx-center').animate([
      { opacity: .55, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 550, easing: 'ease-out' });
  };
  const choices = root.querySelector('.hx-choices');
  choices.addEventListener('mouseenter', () => { paused = true; });
  choices.addEventListener('mouseleave', () => { paused = false; });
  choices.addEventListener('focusin', () => { paused = true; });
  choices.addEventListener('focusout', () => { paused = false; });
  const carousel = window.setInterval(() => {
    if (!paused && !document.querySelector('#teacher-login')?.open && !document.querySelector('#admin-login')?.open) {
      showScene(active === 'seminar' ? 'classroom' : 'seminar');
    }
  }, 5200);
  $$('.hx-choice', root).forEach((button) => button.addEventListener('click', () => {
    const next = button.dataset.scene;
    showScene(next);
    navigate(`/${next}`);
  }));
  if (authenticated) tour('home', [
    { sel: '#portal-seminar', place: 'bottom', title: '① 研课场', text: '点击进入研课场，导入课程内容并与智能体协同研讨。' },
    { sel: '#portal-classroom', place: 'bottom', title: '② 演课场', text: '点击进入演课场，让学生智能体模拟提问、质疑和讨论。' },
    { sel: '#credit-pill', place: 'bottom', title: '③ 积分与导出', text: '真实模型每次成功回复按费率扣积分；本地生成、编辑和导出不扣积分。' },
  ]);

  return () => {
    window.clearInterval(carousel);
    stopParticles();
    document.body.classList.remove('is-home');
  };
}

function animateParticles(canvas, reducedMotion) {
  if (reducedMotion.matches) return () => {};
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const particles = Array.from({ length: 44 }, () => ({
    x: Math.random(), y: Math.random(), speed: .012 + Math.random() * .024,
    radius: .5 + Math.random() * 1.1, phase: Math.random() * Math.PI * 2,
  }));
  let width = 0, height = 0, frame = 0, previous = 0;
  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = bounds.width; height = bounds.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  const draw = (time) => {
    const delta = Math.min((time - previous) / 1000 || 0, .05);
    previous = time;
    ctx.clearRect(0, 0, width, height);
    if (!document.hidden) {
      for (const particle of particles) {
        particle.y = (particle.y - particle.speed * delta + 1) % 1;
        const shimmer = .35 + .35 * Math.sin(time / 1200 + particle.phase);
        ctx.fillStyle = `rgba(245, 235, 207, ${shimmer})`;
        ctx.fillRect(particle.x * width, particle.y * height, particle.radius, particle.radius * 1.8);
      }
    }
    frame = requestAnimationFrame(draw);
  };
  frame = requestAnimationFrame(draw);
  return () => { cancelAnimationFrame(frame); observer.disconnect(); };
}

export async function doTransfer(from, src, redraw) {
  if (!src) return;
  const to = from === 'seminar' ? 'classroom' : 'seminar';
  const draft = src.status === 'draft';
  const ok = await confirmBox('确认流转', `<p style="font-size:calc(18px * var(--fs));margin:0 0 10px;color:var(--gold)">${MODULE_NAME[from]} → ${MODULE_NAME[to]}</p>
    <dl class="kv"><dt>源产物</dt><dd>${esc(src.title)}</dd><dt>版本</dt><dd>v${src.version}${draft ? '（未保存草稿）' : ''} · ${esc(TYPE_NAME[src.type] || src.type)}</dd><dt>摘要</dt><dd class="small">${esc(src.summary)}</dd></dl>`, draft ? '保存当前版本并导入' : '确认');
  if (!ok) return;
  try {
    const result = await post('/api/transfers', { from, idempotency_key: key('xfer'), save_draft: draft });
    toast(`已导入${MODULE_NAME[to]}：${result.target.title} · v${result.target.version}`);
    redraw();
  } catch (error) { fail(error); }
}
