// 选择要流转的产物：研课场“导入演课结果”（选一份课堂反馈）与演课场“选择上课内容”（选一份研课场成果）共用。
// 同一产物的多个版本只列最新一版；标出当前产物。选中后由调用方决定导入方式。
import { get } from './api.js';
import { esc, modal, toast, TYPE_NAME } from './ui.js';

const when = (t) => { try { return new Date(t).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

/** 列出某模块中满足 accept(type) 的产物（每条血缘只取最新版本）。 */
export async function listLatest(module, accept) {
  const seen = new Set(), out = [];
  for (const a of (await get(`/api/artifacts?module=${module}`)).artifacts) {
    if (!accept(a.type) || seen.has(a.lineage_id)) continue;
    seen.add(a.lineage_id); out.push(a);
  }
  return out;
}

/**
 * 弹出选择框。buttons：[{ label, value, cls }]，返回 { artifact, action } 或 null。
 * items 为空时只提示 emptyText。
 */
export async function pickArtifact({ title, intro, items, isCurrent = () => false, buttons, emptyText }) {
  if (!items.length) { toast(emptyText, true); return null; }
  let chosen = null;
  const body = `<p class="small muted" style="margin-top:0">${intro}</p>
    <div class="pick-list" role="radiogroup" aria-label="${esc(title)}">${items.slice(0, 40).map((a, i) => `<label class="pick-item">
      <input type="radio" name="pick" value="${a.artifact_id}" ${i === 0 ? 'checked' : ''}>
      <span class="pick-main"><b>${esc(a.title)}</b><small>${a.taught ? `上课内容：${esc(a.taught.title || '')}${a.taught.version ? ` v${a.taught.version}` : ''}${a.taught.started_at ? ` · 开课 ${when(a.taught.started_at)}` : ''}` : `${esc(TYPE_NAME[a.type] || a.type)} · v${a.version}${a.status === 'draft' ? '（草稿）' : ''}${a.course_name ? ` · ${esc(a.course_name)}` : ''}`}</small></span>
      <span class="pick-side">${isCurrent(a) ? '<em>当前</em>' : ''}<small>${when(a.updated_at || a.created_at)}</small></span></label>`).join('')}</div>`;
  const action = await modal({ title, wide: true, body, buttons: [{ label: '取消', value: null }, ...buttons.map((b) => ({ ...b, handler: (back) => { chosen = back.querySelector('input[name=pick]:checked')?.value; return chosen ? b.value : false; } }))] });
  if (!action || !chosen) return null;
  return { artifact: items.find((a) => a.artifact_id === chosen), action };
}
