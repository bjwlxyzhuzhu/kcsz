// Protected deployment initialisation. No default admin password exists anywhere in the code.
// Usage:
//   node server/cli.js create-admin --login admin [--name 管理员] [--also-teacher]
//     password is read from env YANZHI_ADMIN_PASSWORD or prompted on the terminal (not echoed).
//   node server/cli.js create-teacher --login t01 --name 张老师   (prints a one-time temporary password)
//   node server/cli.js reconcile
// 机构授权（平台方使用；私钥务必保存在代码目录之外，不要上传）：
//   node server/cli.js license-keygen --out <私钥目录>        生成 Ed25519 密钥对，公钥写入 server/license-pubkey.pem
//   node server/cli.js license-issue --key <私钥.pem> --licensee 某某大学 --seats 50 --expires 2027-09-30 [--starts 2026-10-01] [--edition 标准版] [--brand zw] --out license.json
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import { randomBytes, generateKeyPairSync, createPrivateKey, sign as edSign } from 'node:crypto';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { canonical } from './license.js';
import { openDb, one, getSetting } from './db.js';
import { createUser } from './auth.js';
import { seedTemplates } from './templates.js';
import { reconcile } from './runs.js';
import { loadMasterKey } from './models.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = process.env.YANZHI_DATA_DIR || join(ROOT, 'data');
mkdirSync(dataDir, { recursive: true });
const db = openDb(join(dataDir, 'yanzhi.db'));
loadMasterKey(dataDir);
seedTemplates(db);

const [cmd, ...rest] = process.argv.slice(2);
const arg = (k) => { const i = rest.indexOf(`--${k}`); return i >= 0 ? rest[i + 1] : undefined; };
const flag = (k) => rest.includes(`--${k}`);

function promptHidden(q) {
  return new Promise((res) => {
    process.stdout.write(q);
    const stdin = process.stdin; let buf = '';
    if (!stdin.isTTY) { stdin.setEncoding('utf8'); stdin.once('data', (d) => res(String(d).split(/\r?\n/)[0])); return; }
    stdin.setRawMode(true); stdin.resume(); stdin.setEncoding('utf8');
    const on = (ch) => {
      if (ch === '\r' || ch === '\n' || ch === '\u0004') { stdin.setRawMode(false); stdin.pause(); stdin.off('data', on); process.stdout.write('\n'); res(buf); }
      else if (ch === '\u0003') process.exit(1);
      else if (ch === '\u007f' || ch === '\b') buf = buf.slice(0, -1);
      else buf += ch;
    };
    stdin.on('data', on);
  });
}

try {
  if (cmd === 'create-admin') {
    const login = arg('login'); if (!login) throw new Error('请提供 --login');
    let pw = process.env.YANZHI_ADMIN_PASSWORD;
    if (!pw) { pw = await promptHidden('设置管理员密码（≥8位，含字母和数字）：'); const pw2 = await promptHidden('再次输入：'); if (pw !== pw2) throw new Error('两次输入不一致'); }
    const u = createUser(db, { login, display_name: arg('name') || '平台管理员', password: pw, is_admin: true, is_teacher: flag('also-teacher'), must_change_password: false }, null);
    console.log(`管理员已创建：${u.login}（${flag('also-teacher') ? '同时具有教师身份，已获一次性初始积分' : '仅管理员身份，不领取教师积分'}）`);
  } else if (cmd === 'create-teacher') {
    const login = arg('login'); if (!login) throw new Error('请提供 --login');
    const temp = `Yz${randomBytes(5).toString('hex')}7`;
    const u = createUser(db, { login, display_name: arg('name') || login, password: temp, is_teacher: true, must_change_password: true }, null);
    console.log(`教师已创建：${u.login}；一次性临时密码：${temp}（首次登录需修改）；初始积分 ${getSetting(db, 'signup_bonus')}`);
  } else if (cmd === 'license-keygen') {
    const out = arg('out'); if (!out) throw new Error('请用 --out 指定私钥保存目录（放在代码目录之外）');
    const pubFile = join(ROOT, 'server', 'license-pubkey.pem');
    if (existsSync(pubFile) && !flag('force')) throw new Error('已存在授权公钥 server/license-pubkey.pem；更换密钥会使已签发的授权全部失效，确需更换请加 --force');
    const { publicKey, privateKey } = generateKeyPairSync('ed25519');
    mkdirSync(out, { recursive: true });
    writeFileSync(join(out, 'yanzhi-license-private.pem'), privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 });
    writeFileSync(pubFile, publicKey.export({ type: 'spki', format: 'pem' }));
    console.log(`私钥：${join(out, 'yanzhi-license-private.pem')}（请离线备份，切勿上传）
公钥：server/license-pubkey.pem（随代码部署）`);
  } else if (cmd === 'license-issue') {
    const keyFile = arg('key'), licensee = arg('licensee'), expires = arg('expires'), seats = Number(arg('seats'));
    if (!keyFile || !licensee || !expires || !(seats > 0)) throw new Error('需要 --key --licensee --seats --expires');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expires)) throw new Error('--expires 格式为 YYYY-MM-DD');
    const payload = { license_id: `LIC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomBytes(3).toString('hex').toUpperCase()}`, licensee, edition: arg('edition') || '标准版', seats,
      starts: arg('starts') || new Date().toISOString().slice(0, 10), expires, brand: arg('brand') || 'zw', issued_at: new Date().toISOString() };
    const signature = edSign(null, Buffer.from(canonical(payload)), createPrivateKey(readFileSync(keyFile))).toString('base64');
    const out = arg('out') || 'license.json';
    writeFileSync(out, JSON.stringify({ payload, signature }, null, 2));
    console.log(`已签发授权 ${payload.license_id}：${licensee}，${seats} 个教师席位，${payload.starts} 至 ${expires} → ${out}`);
  } else if (cmd === 'reconcile') {
    console.log(reconcile(db));
  } else {
    console.log('命令：create-admin --login <名> | create-teacher --login <名> --name <显示名> | reconcile | license-keygen --out <目录> | license-issue --key <私钥> --licensee <单位> --seats <数> --expires <日期>');
    console.log(`当前管理员数量：${one(db, 'SELECT COUNT(*) n FROM users WHERE is_admin=1').n}`);
  }
} catch (e) {
  console.error('失败：', e.message); process.exitCode = 1;
} finally { db.close(); }
