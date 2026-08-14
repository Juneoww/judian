/**
 * 功能:
 *   验证“聚点”核心会合流程已经注册为可访问的小程序页面，并具备可复用的地图组件。
 * 实现:
 *   静态读取 app.json、页面文件和组件文件，校验从首页、发起、邀请、填写、推荐到确认的完整路径。
 * 输入:
 *   项目根目录下的小程序页面配置、WXML/WXSS/JS/JSON 文件与视图模型服务。
 * 输出:
 *   Node 测试结果；不会修改项目文件，也不访问网络。
 * 依赖:
 *   Node.js 内置 node:test、node:assert、node:fs 与 node:path。
 * 用法:
 *   node --test tests/core-flow-pages.test.cjs
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const expectedPages = [
  'pages/home/index',
  'pages/create/index',
  'pages/invite/index',
  'pages/submit/index',
  'pages/map-picker/index',
  'pages/recommendations/index',
  'pages/final/index',
  'pages/history/index'
];

test('核心会合流程页面和地图组件均已注册', () => {
  const appConfig = JSON.parse(fs.readFileSync(path.join(projectRoot, 'app.json'), 'utf8'));
  assert.deepEqual(appConfig.pages, expectedPages);

  const requiredFiles = [
    'services/meeting-view-model.js',
    'components/city-map/index.js',
    'components/city-map/index.json',
    'components/city-map/index.wxml',
    'components/city-map/index.wxss'
  ];

  expectedPages.forEach((page) => {
    ['js', 'json', 'wxml', 'wxss'].forEach((extension) => {
      requiredFiles.push(`${page}.${extension}`);
    });
  });

  requiredFiles.forEach((file) => {
    assert.equal(fs.existsSync(path.join(projectRoot, file)), true, `缺少 ${file}`);
  });
});

test('填写页和推荐页接入可交互地图选择与推荐结果', () => {
  const submitWxml = fs.readFileSync(path.join(projectRoot, 'pages/submit/index.wxml'), 'utf8');
  const pickerWxml = fs.readFileSync(path.join(projectRoot, 'pages/map-picker/index.wxml'), 'utf8');
  const recommendationsWxml = fs.readFileSync(path.join(projectRoot, 'pages/recommendations/index.wxml'), 'utf8');

  assert.match(submitWxml, /city-map/);
  assert.match(submitWxml, /bind:pointchange/);
  assert.match(pickerWxml, /bind:pointchange/);
  assert.match(recommendationsWxml, /wx:for/);
  assert.match(recommendationsWxml, /onConfirmCandidate/);
});
