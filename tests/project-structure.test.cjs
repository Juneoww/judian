/**
 * 功能:
 *   验证“聚点”原生微信小程序最小骨架是否完整、可被微信开发者工具识别。
 * 实现:
 *   读取项目入口配置与首页文件，检查必需文件、页面注册和基础导航配置。
 * 输入:
 *   项目根目录下的 app.json、project.config.json 与 pages/home 文件。
 * 输出:
 *   Node 测试结果；不修改项目文件或网络状态。
 * 依赖:
 *   Node.js 内置 node:test、node:assert、node:fs 与 node:path。
 * 用法:
 *   node --test tests/project-structure.test.cjs
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');

test('原生小程序最小骨架包含入口配置与首页', () => {
  const requiredFiles = [
    'project.config.json',
    'package.json',
    'app.js',
    'app.json',
    'app.wxss',
    'pages/home/index.js',
    'pages/home/index.json',
    'pages/home/index.wxml',
    'pages/home/index.wxss'
  ];

  requiredFiles.forEach((file) => {
    assert.equal(fs.existsSync(path.join(projectRoot, file)), true, `缺少 ${file}`);
  });

  const appConfig = JSON.parse(fs.readFileSync(path.join(projectRoot, 'app.json'), 'utf8'));
  assert.equal(appConfig.pages[0], 'pages/home/index');
  assert.equal(appConfig.window.navigationBarTitleText, '聚点');
});
