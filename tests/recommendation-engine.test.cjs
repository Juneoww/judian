/**
 * 功能:
 *   验证本地会合推荐规则对策略、通勤上限和成员进度的处理。
 * 实现:
 *   使用演示会合数据调用推荐引擎，断言候选排序、超时提示与进度摘要。
 * 输入:
 *   data/demo-data.js 与 services/recommendation-engine.js 导出的会议和候选数据。
 * 输出:
 *   Node 测试结果；不修改会议状态或访问网络。
 * 依赖:
 *   Node.js 内置 node:test 和 node:assert。
 * 用法:
 *   node --test tests/recommendation-engine.test.cjs
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDemoMeeting, DEMO_CANDIDATES } = require('../data/demo-data');
const { getMeetingProgress, getRecommendations } = require('../services/recommendation-engine');

test('智能平衡策略优先返回祖庙站，并保留 3 个候选', () => {
  const meeting = createDemoMeeting();
  const recommendations = getRecommendations(meeting, DEMO_CANDIDATES);

  assert.equal(recommendations.length, 3);
  assert.equal(recommendations[0].id, 'zhu');
  assert.equal(recommendations[0].rank, 1);
  assert.equal(recommendations[0].isWithinCap, true);
});

test('少换乘策略优先返回魁奇路站', () => {
  const meeting = createDemoMeeting();
  meeting.settings.strategy = 'transfer';

  const recommendations = getRecommendations(meeting, DEMO_CANDIDATES);

  assert.equal(recommendations[0].id, 'kui');
  assert.equal(recommendations[0].transfers, 1);
});

test('通勤上限会在候选中标出超时分钟数', () => {
  const meeting = createDemoMeeting();
  meeting.settings.commuteCap = 60;

  const recommendations = getRecommendations(meeting, DEMO_CANDIDATES);
  const zhu = recommendations.find((item) => item.id === 'zhu');

  assert.equal(zhu.isWithinCap, false);
  assert.equal(zhu.overCapMinutes, 1);
});

test('成员进度根据已提交成员数计算未填写人数', () => {
  const progress = getMeetingProgress(createDemoMeeting());

  assert.deepEqual(progress, {
    expected: 6,
    submitted: 3,
    remaining: 3
  });
});
