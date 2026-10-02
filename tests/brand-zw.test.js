// 国际中文版（YANZHI_BRAND=zw）：领域术语与配色替换、学习者智能体、文化与交际要素库、机构授权（签名、席位、到期）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateKeyPairSync, sign } from 'node:crypto';

const keyDir = mkdtempSync(join(tmpdir(), 'yz-lic-'));
const { publicKey, privateKey } = generateKeyPairSync('ed25519');
writeFileSync(join(keyDir, 'pub.pem'), publicKey.export({ type: 'spki', format: 'pem' }));
process.env.YANZHI_BRAND = 'zw';
process.env.YANZHI_LICENSE_PUBKEY = join(keyDir, 'pub.pem');
process.env.YANZHI_DEMO_SEATS = '3';

const { BRAND, brandText, brandDeep, recolor } = await import('../server/brand.js');
const { SEMINAR_ROLES, IDEOLOGY_LIBRARY } = await import('../server/templates.js');
const { studentIdentity } = await import('../server/agents.js');
const { makeStudents } = await import('../server/scheduler.js');
const { classroomPrompt, demoClassLine } = await import('../server/dialogue.js');
const lic = await import('../server/license.js');
const { startApp, client } = await import('./helpers.js');
const { createUser } = await import('../server/auth.js');

const issue = (payload) => ({ payload, signature: sign(null, Buffer.from(lic.canonical(payload)), privateKey).toString('base64') });

test('品牌与领域术语：演知中文，课程思政 → 国际中文教学', () => {
  assert.equal(BRAND.name, '演知中文');
  assert.equal(brandText('研思智境'), '演知中文');
  assert.equal(brandText('思政版教学大纲'), '国际中文课程大纲');
  assert.equal(brandText('思政元素：家国情怀'), '文化与交际要素：家国情怀');
  for (const [, b] of BRAND.terms) assert.equal(brandText(b), b, `替换须幂等：${b}`);
  assert.deepEqual(brandDeep({ type: 'syllabus', name: '课程思政课件', list: ['思政融入点'] }), { type: 'syllabus', name: '国际中文课件', list: ['文化融入点'] });
});

test('配色：品牌红 → 青花蓝，描金与灰阶保持不变', () => {
  const out = recolor('a{color:#c02a3e;background:#eec486;border:#888}');
  assert.match(out, /color:#[0-9a-f]{6};/);
  assert.notEqual(out.match(/color:(#[0-9a-f]{6})/)[1], '#c02a3e');
  const [, r, , b] = out.match(/color:#(..)(..)(..)/).map((x) => parseInt(x, 16));
  assert.ok(b > r, '替换后的颜色偏蓝');
  assert.ok(out.includes('#eec486') && out.includes('#888'));
  assert.equal(recolor('#add', { shortHex: false }), '#add');
});

test('教研角色与要素库：跨文化交际教师、语音与声调等', () => {
  assert.equal(SEMINAR_ROLES.ideology.name, '跨文化交际教师');
  assert.equal(SEMINAR_ROLES.subject.name, '中文教师');
  assert.ok(IDEOLOGY_LIBRARY.some((c) => c.name === '跨文化比较与理解'));
});

test('学习者智能体：来自不同国家，带母语与中文水平；提示词体现水平与典型偏误', () => {
  assert.deepEqual(studentIdentity(0), { name: '玛丽亚', gender: 'f', country: '西班牙', l1: '西班牙语' });
  const ss = makeStudents({ class_size: 12, group_size: 4, knowledge: 'normal', skepticism: 'medium', cooperation: 'medium' }, 'seed-1');
  assert.equal(new Set(ss.map((s) => s.traits.country)).size >= 8, true);
  for (const s of ss) assert.ok(s.traits.hsk >= 1 && s.traits.hsk <= 6);
  const p = classroomPrompt({ who: 'student', action: 'ask' }, { stage: { label: '导入' }, student: ss[1], memory: [], publicHistory: [], unitLabel: '第3课 在饭馆', names: {} });
  assert.match(p.system, /国际中文学习者/);
  assert.match(p.system, new RegExp(`HSK ${ss[1].traits.hsk} 级`));
  assert.match(p.system, /越南语/);
  const t = classroomPrompt({ who: 'teacher', action: 'lecture' }, { stage: { label: '导入' }, memory: [], publicHistory: [], unitLabel: '第3课 在饭馆', names: {} });
  assert.match(t.system, /国际中文课堂/);
  const line = demoClassLine({ who: 'student', action: 'supplement', target_name: '汤姆' }, { topic: '点菜' }, {}, 0.2, { student: ss[1] });
  assert.match(line, /越南/);
});

test('机构授权：签名校验、到期与宽限期、品牌不符与篡改', () => {
  const p = { license_id: 'LIC-T', licensee: '某某大学', edition: '标准版', seats: 2, starts: '2026-10-01', expires: '2027-09-30', brand: 'zw', issued_at: '2026-10-01T00:00:00Z' };
  const now = new Date('2026-12-01T00:00:00+08:00');
  assert.equal(lic.evaluate(null).mode, 'demo');
  assert.equal(lic.evaluate(issue(p), now).mode, 'licensed');
  assert.equal(lic.evaluate(issue(p), new Date('2027-10-05T00:00:00+08:00')).mode, 'grace');
  assert.equal(lic.evaluate(issue(p), new Date('2027-11-30T00:00:00+08:00')).mode, 'expired');
  const forged = issue(p); forged.payload = { ...p, seats: 999 };
  assert.equal(lic.evaluate(forged, now).mode, 'invalid');
  assert.equal(lic.evaluate(issue({ ...p, brand: 'szsx' }), now).mode, 'invalid');
});

test('机构授权：展示评估版席位上限、安装授权后按授权席位控制', async () => {
  const app = await startApp();
  try {
    createUser(app.db, { login: 'root1', display_name: '管理员', password: 'Admin12345', is_admin: true, is_teacher: false, must_change_password: false }, null);
    for (let i = 1; i <= 3; i++) createUser(app.db, { login: `t0${i}`, password: 'Teach12345', must_change_password: false }, null);
    assert.throws(() => createUser(app.db, { login: 't04', password: 'Teach12345' }, null), (e) => e.code === 'seat_limit');
    const a = client(app.base);
    assert.equal((await a.login('root1', 'Admin12345', true)).status, 200);
    let s = (await a.get('/api/admin/license')).data;
    assert.equal(s.mode, 'demo'); assert.equal(s.seats_used, 3);
    const bad = await a.post('/api/admin/license', { license: '{"payload":{},"signature":"x"}' });
    assert.equal(bad.status, 400);
    const good = issue({ license_id: 'LIC-OK', licensee: '某某大学', edition: '标准版', seats: 5, starts: '2026-10-01', expires: '2099-09-30', brand: 'zw', issued_at: '2026-10-01T00:00:00Z' });
    assert.equal((await a.post('/api/admin/license', { license: JSON.stringify(good) })).status, 200);
    s = (await a.get('/api/admin/license')).data;
    assert.equal(s.mode, 'licensed'); assert.equal(s.licensee, '某某大学');
    createUser(app.db, { login: 't04', password: 'Teach12345' }, null);
    createUser(app.db, { login: 't05', password: 'Teach12345' }, null);
    assert.throws(() => createUser(app.db, { login: 't06', password: 'Teach12345' }, null), (e) => e.code === 'seat_limit');
    const pub = (await client(app.base).get('/api/public-config')).data;
    assert.equal(pub.license.licensee, '某某大学');
  } finally { await app.stop(); }
});
