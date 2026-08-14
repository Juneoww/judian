/**
 * 功能:
 *   验证小程序页面使用的会合视图数据能正确呈现进度、位置隐私、暂定推荐与最终结果。
 * 实现:
 *   通过演示会合对象调用视图模型，断言页面所需的中文文案和候选状态来自真实推荐服务。
 * 输入:
 *   data/demo-data.js 的会议与候选数据，以及 services/meeting-view-model.js。
 * 输出:
 *   Node 测试结果；不会写入本地存储或发起网络请求。
 * 依赖:
 *   Node.js 内置 node:test、node:assert 与项目 CommonJS 服务模块。
 * 用法:
 *   node --test tests/meeting-view-model.test.cjs
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDemoMeeting, DEMO_CANDIDATES } = require('../data/demo-data');
const {
  buildFinalSummary,
  buildLocationDraft,
  buildMeetingSummary,
  buildRecommendationView
} = require('../services/meeting-view-model');

test('会议摘要清楚标记当前已填写人数和待填写人数', () => {
  const summary = buildMeetingSummary(createDemoMeeting());

  assert.equal(summary.title, '周五广佛小聚');
  assert.equal(summary.progressText, '3 / 6 人已填写');
  assert.equal(summary.remainingText, '还有 3 人未填写');
  assert.equal(summary.currentMemberName, '思妍');
});

test('填写位置视图提供已选模糊位置与隐私说明', () => {
  const locationDraft = buildLocationDraft(createDemoMeeting());

  assert.equal(locationDraft.station, '客村站');
  assert.equal(locationDraft.privacy, 'fuzzy');
  assert.equal(locationDraft.privacyLabel, '模糊公开（显示站点附近）');
  assert.equal(locationDraft.submitted, false);
});

test('尚未填齐时的推荐标注暂定，并仍显示当前策略的首选项', () => {
  const recommendationView = buildRecommendationView(createDemoMeeting(), DEMO_CANDIDATES);

  assert.equal(recommendationView.isProvisional, true);
  assert.equal(recommendationView.provisionalText, '暂定推荐 · 还有 3 人未填写');
  assert.equal(recommendationView.recommendations[0].station, '祖庙站');
  assert.equal(recommendationView.recommendations[0].rankLabel, '推荐 1');
});

test('发起人确认候选后生成可导航的最终会合摘要', () => {
  const meeting = createDemoMeeting();
  meeting.finalCandidateId = 'kui';

  const finalSummary = buildFinalSummary(meeting, DEMO_CANDIDATES);

  assert.equal(finalSummary.status, '已选定');
  assert.equal(finalSummary.station, '魁奇路站');
  assert.equal(finalSummary.district, '创意产业园');
});
