// 品牌默认值：未设置 YANZHI_BRAND 时为参赛版“演知思政”（公网只上传代码、按 npm start 或 Dockerfile 启动也生效）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
delete process.env.YANZHI_BRAND;
const { BRAND, BRAND_KEY, brandText } = await import('../server/brand.js');

test('未设置 YANZHI_BRAND：默认显示“演知思政”', () => {
  assert.equal(BRAND_KEY, 'szsx');
  assert.equal(BRAND?.name, '演知思政');
  assert.equal(brandText('欢迎使用研思智境'), '欢迎使用演知思政');
});
