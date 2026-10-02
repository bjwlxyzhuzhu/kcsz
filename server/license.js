// 机构授权（用于向高校按年、按教师席位收费）。只在启用授权的品牌（如国际中文版 zw）中生效，其他版本不受影响。
// 授权文件 license.json = { payload: {license_id, licensee, edition, seats, starts, expires, brand, issued_at}, signature }，
// 由平台方用 Ed25519 私钥签名（node server/cli.js license-issue），服务器只保存公钥（server/license-pubkey.pem）验证，
// 私钥不进入代码仓库。未安装授权时为“展示评估版”：全部功能可用，教师账号数不超过 DEMO_SEATS。
// 授权到期后有宽限期；宽限期结束后不能新建研课/演课，但已有数据仍可查看和导出（不删除任何数据）。
import { createPublicKey, verify as edVerify } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND, BRAND_KEY } from './brand.js';
import { one, fail } from './db.js';

export const ENABLED = !!BRAND?.licensing;
export const DEMO_SEATS = Number(process.env.YANZHI_DEMO_SEATS || 30);
export const GRACE_DAYS = 15;
const PUBKEY_FILE = process.env.YANZHI_LICENSE_PUBKEY || join(dirname(fileURLToPath(import.meta.url)), 'license-pubkey.pem');

/** 规范化序列化：键按字母排序，保证签名与验证使用同一字节串。 */
export const canonical = (o) => JSON.stringify(Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]])));

let state = { mode: ENABLED ? 'demo' : 'off' };
let licenseFile = null;
const DAY = 86400000;

/** 校验授权对象；返回状态（不抛异常）。 */
export function evaluate(lic, today = new Date()) {
  if (!lic) return { mode: 'demo', seats: DEMO_SEATS };
  const p = lic.payload || {};
  try {
    if (!existsSync(PUBKEY_FILE)) return { mode: 'invalid', reason: '服务器未配置授权公钥', seats: DEMO_SEATS };
    const ok = edVerify(null, Buffer.from(canonical(p)), createPublicKey(readFileSync(PUBKEY_FILE)), Buffer.from(String(lic.signature || ''), 'base64'));
    if (!ok) return { mode: 'invalid', reason: '授权签名无效', seats: DEMO_SEATS };
  } catch { return { mode: 'invalid', reason: '授权文件格式错误', seats: DEMO_SEATS }; }
  if (p.brand && p.brand !== BRAND_KEY) return { mode: 'invalid', reason: `授权适用于“${p.brand}”版本`, seats: DEMO_SEATS };
  const exp = new Date(`${p.expires}T23:59:59+08:00`).getTime(), now = today.getTime();
  const daysLeft = Math.ceil((exp - now) / DAY);
  const base = { license_id: p.license_id, licensee: p.licensee, edition: p.edition || '标准版', seats: Number(p.seats) || 0, starts: p.starts, expires: p.expires, days_left: daysLeft };
  if (now <= exp) return { mode: 'licensed', ...base };
  if (now <= exp + GRACE_DAYS * DAY) return { mode: 'grace', ...base, grace_days_left: Math.ceil((exp + GRACE_DAYS * DAY - now) / DAY) };
  return { mode: 'expired', ...base };
}

export function load(dataDir) {
  if (!ENABLED) return state;
  licenseFile = process.env.YANZHI_LICENSE_FILE || join(dataDir, 'license.json');
  let lic = null;
  try { if (existsSync(licenseFile)) lic = JSON.parse(readFileSync(licenseFile, 'utf8')); } catch { lic = { payload: {}, signature: '' }; }
  state = evaluate(lic);
  return state;
}
export const status = () => ({ ...state, enabled: ENABLED });

/** 管理员上传授权文件：验证通过才写入。 */
export function install(text) {
  if (!ENABLED) fail(400, 'license_disabled', '当前版本不使用机构授权');
  let lic; try { lic = typeof text === 'string' ? JSON.parse(text) : text; } catch { fail(400, 'bad_license', '授权文件不是有效的 JSON'); }
  const s = evaluate(lic);
  if (!['licensed', 'grace'].includes(s.mode)) fail(400, 'bad_license', s.reason || (s.mode === 'expired' ? '授权已过期' : '授权无效'));
  writeFileSync(licenseFile, JSON.stringify(lic, null, 2));
  state = s;
  return status();
}

/** 新增或启用教师账号前检查席位（有效授权：授权席位；展示评估版：DEMO_SEATS）。 */
export function checkSeat(db) {
  if (!ENABLED) return;
  const used = one(db, "SELECT COUNT(*) n FROM users WHERE is_teacher=1 AND status='active'").n;
  const seats = ['licensed', 'grace'].includes(state.mode) ? state.seats : DEMO_SEATS;
  if (used >= seats) fail(409, 'seat_limit', `教师席位已用完（${used}/${seats}）。${state.mode === 'licensed' ? '请联系平台方增加授权席位' : '展示评估版席位有限，正式使用请安装机构授权'}`);
}

/** 新建研课/演课前检查授权是否已过宽限期。 */
export function checkActive() {
  if (ENABLED && state.mode === 'expired') fail(402, 'license_expired', `机构授权已于 ${state.expires} 到期（宽限期已过）。已有数据仍可查看和导出；续期后即可继续新建研课与演课。`);
}
