/**
 * 学生群体画像数据导出（最终合并版）
 * 用法：exportStudentProfile(students, templateColumns)
 *   - students: 页面当前持有的学生画像数组
 *     元素结构：{ code: "S01", name: "赵子涵", group: "第1组", profile: { 学业水平: "...", ... } }
 *   - templateColumns: 可选。"下载模板(CSV)"的列名数组，前 3 列须为 ["学生编码","姓名","分组",...画像维度列名]
 *
 * 行为：
 *   - 导出 UTF-8 带 BOM 的 CSV（Excel 打开中文不乱码）
 *   - 列结构与下载模板完全一致，导入/导出双向通用
 *   - 按画像 key 名取值（某学生缺字段不串列），缺失填空字符串
 *   - 全字段值做 CSV 引号转义（含表头）
 */
function exportStudentProfile(students, templateColumns) {
  if (!students?.length) {
    alert("暂无可导出的画像数据，请先导入");
    return;
  }

  try {
    // ---- 1. 确定画像维度列（列结构来源优先级：下载模板 > 全部学生字段并集）----
    const FIXED = ["学生编码", "姓名", "分组"];
    let profileKeys;
    if (Array.isArray(templateColumns) && templateColumns.length > 3) {
      // 校验模板前三列是否为约定的固定列，防止模板列序调整后静默错位
      const ok = FIXED.every((h, i) => templateColumns[i] === h);
      if (!ok) {
        console.warn("[导出画像] 模板前三列与 学生编码/姓名/分组 不符，已回退为按学生数据字段导出");
        profileKeys = null;
      } else {
        profileKeys = templateColumns.slice(3);
      }
    }
    if (!profileKeys) {
      // 全部学生画像字段的并集，保证字段不齐时也不丢列
      profileKeys = [...new Set(students.flatMap((s) => Object.keys(s.profile ?? {})))];
    }

    const headers = [...FIXED, ...profileKeys];

    // ---- 2. CSV 转义 + 组装 ----
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

    const rows = students.map((s) =>
      [
        esc(s.code ?? ""),
        esc(s.name ?? ""),
        esc(s.group ?? ""),
        ...profileKeys.map((k) => esc(s.profile?.[k] ?? "")),
      ].join(",")
    );
    const csv = "\uFEFF" + headers.map(esc).join(",") + "\n" + rows.join("\n");

    // ---- 3. 触发下载 ----
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `学生群体画像_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100); // 延迟释放，确保下载已开始
  } catch (error) {
    console.error("[导出画像] 导出失败:", error);
    alert("导出失败，请重试");
  }
}

// 导出模块（视项目打包方式保留其一）
// ESM:      export default exportStudentProfile;
// CommonJS: module.exports = exportStudentProfile;
// 全局:     window.exportStudentProfile = exportStudentProfile;
if (typeof window !== "undefined") {
  window.exportStudentProfile = exportStudentProfile;
}
