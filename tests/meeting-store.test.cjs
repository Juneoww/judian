/**
 * 功能:
 *   验证会议本地状态对位置草稿、隐私、提交进度和地点确认的更新。
 * 实现:
 *   使用内存存储创建会议状态仓库，按页面操作顺序调用公开 API 并断言结果。
 * 输入:
 *   services/meeting-store.js 与 data/demo-data.js 的演示会议数据。
 * 输出:
 *   Node 测试结果；不访问微信存储、地图或网络。
 * 依赖:
 *   Node.js 内置 node:test 和 node:assert。
 * 用法:
 *   node --test tests/meeting-store.test.cjs
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDemoMeeting } = require('../data/demo-data');
const { createMemoryStorage, createMeetingStore } = require('../services/meeting-store');

test('位置草稿确认并提交后纳入当前成员与进度', () => {
  const store = createMeetingStore({
    initialMeeting: createDemoMeeting(),
    storage: createMemoryStorage()
  });

  store.setLocationDraft({
    pointId: 'huangsha',
    privacy: 'fuzzy'
  });
  store.submitCurrentMemberLocation();

  const state = store.getState();
  const currentMember = state.members.find((member) => member.id === state.currentMemberId);

  assert.equal(currentMember.locationId, 'huangsha');
  assert.equal(currentMember.privacy, 'fuzzy');
  assert.equal(currentMember.submitted, true);
  assert.deepEqual(store.getProgress(), {
    expected: 6,
    submitted: 4,
    remaining: 2
  });
});

test('发起人可保存设置并确认候选地点', () => {
  const store = createMeetingStore({
    initialMeeting: createDemoMeeting(),
    storage: createMemoryStorage()
  });

  store.updateSettings({
    strategy: 'transfer',
    commuteCap: 60
  });
  store.selectCandidate('kui');
  store.confirmSelectedCandidate();

  const state = store.getState();
  assert.equal(state.settings.strategy, 'transfer');
  assert.equal(state.settings.commuteCap, 60);
  assert.equal(state.selectedCandidateId, 'kui');
  assert.equal(state.finalCandidateId, 'kui');
});

test('状态仓库将最新会议快照写入注入的本地存储', () => {
  const storage = createMemoryStorage();
  const store = createMeetingStore({
    initialMeeting: createDemoMeeting(),
    storage
  });

  store.setLocationDraft({
    pointId: 'kezun',
    privacy: 'hidden'
  });

  assert.equal(storage.get('judian:meeting').locationDraft.privacy, 'hidden');
});

test('确认后的会合会保留在本机历史记录中', () => {
  const storage = createMemoryStorage();
  const store = createMeetingStore({
    initialMeeting: createDemoMeeting(),
    storage
  });

  store.updateSettings({
    name: '同学聚餐'
  });
  store.selectCandidate('zhu');
  store.confirmSelectedCandidate();

  const history = store.getHistory();
  assert.equal(history.length, 1);
  assert.equal(history[0].settings.name, '同学聚餐');
  assert.equal(history[0].finalCandidateId, 'zhu');
});

test('连续发起两场会合时，本机历史保留两个独立场次', () => {
  const storage = createMemoryStorage();
  const store = createMeetingStore({
    initialMeeting: createDemoMeeting(),
    storage
  });

  const firstMeetingId = store.getState().id;
  store.confirmSelectedCandidate();
  store.reset();
  const secondMeetingId = store.getState().id;
  store.confirmSelectedCandidate();

  const history = store.getHistory();
  assert.notEqual(secondMeetingId, firstMeetingId);
  assert.equal(history.length, 2);
  assert.deepEqual(history.map((record) => record.id).sort(), [firstMeetingId, secondMeetingId].sort());
});
