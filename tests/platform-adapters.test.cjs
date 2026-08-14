/**
 * 功能:
 *   验证尚未接入微信与地图 SDK 时，平台适配器能给出安全的本地演示反馈。
 * 实现:
 *   注入空平台对象，断言登录、导航与分享均返回模拟结果而非抛出异常。
 * 输入:
 *   services/platform-adapters.js 导出的工厂函数。
 * 输出:
 *   Node 测试结果；不访问微信 API 或网络。
 * 依赖:
 *   Node.js 内置 node:test 和 node:assert。
 * 用法:
 *   node --test tests/platform-adapters.test.cjs
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createPlatformAdapters } = require('../services/platform-adapters');

test('无微信 API 时使用本地演示适配器反馈', async () => {
  const adapters = createPlatformAdapters(null);

  const login = await adapters.login();
  const navigation = adapters.openMap({
    name: '祖庙站 · 岭南天地',
    latitude: 23.03,
    longitude: 113.12
  });
  const sharing = adapters.shareMeeting({
    title: '周五广佛小聚',
    path: '/pages/invite/index?id=guangfo-friday-demo'
  });

  assert.equal(login.mode, 'mock');
  assert.equal(navigation.mode, 'mock');
  assert.equal(sharing.mode, 'mock');
});
