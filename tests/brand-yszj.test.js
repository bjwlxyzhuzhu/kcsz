// 品牌开关：YANZHI_BRAND=yszj 时恢复原名“研思智境”，界面文字不做替换。
import { test } from 'node:test';
import assert from 'node:assert/strict';
process.env.YANZHI_BRAND = 'yszj';
const { BRAND, brandText } = await import('../server/brand.js');

test('YANZHI_BRAND=yszj：保持“研思智境”', () => {
  assert.equal(BRAND, null);
  assert.equal(brandText('欢迎使用研思智境'), '欢迎使用研思智境');
});
