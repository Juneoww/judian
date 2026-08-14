/**
 * 功能:
 *   提供“聚点”本地可运行 MVP 的广佛站点、成员与推荐候选演示数据。
 * 实现:
 *   集中定义不含真实地址或坐标的模糊站点附近标签，以及可复制的初始会合状态。
 * 输入:
 *   页面、会议状态仓库与推荐引擎对演示数据的读取。
 * 输出:
 *   不可变的演示数据常量和 createDemoMeeting 工厂函数。
 * 依赖:
 *   JavaScript 原生对象与 CommonJS 模块机制。
 * 用法:
 *   const { createDemoMeeting, DEMO_CANDIDATES } = require('../data/demo-data');
 */

const MAP_POINTS = [
  { id: 'huangsha', label: '黄沙站附近', station: '黄沙站', area: '荔湾区 · 西关片区', line: '8 号线 · 西关风味', x: 11, y: 42 },
  { id: 'xilang', label: '西塱站附近', station: '西塱站', area: '荔湾区 · 广佛线入口', line: '1 / 广佛线', x: 25, y: 76 },
  { id: 'zumiao', label: '祖庙站附近', station: '祖庙站', area: '禅城区 · 岭南天地', line: '广佛线 · 祖庙商圈', x: 33, y: 55 },
  { id: 'kui', label: '魁奇路站附近', station: '魁奇路站', area: '禅城区 · 创意产业园', line: '广佛线 · 通勤方便', x: 58, y: 66 },
  { id: 'kezun', label: '客村站附近', station: '客村站', area: '海珠区 · 客村片区', line: '3 / 8 号线换乘', x: 76, y: 31 },
  { id: 'yantang', label: '燕塘站附近', station: '燕塘站', area: '天河区 · 燕塘片区', line: '3 / 6 号线换乘', x: 64, y: 17 },
  { id: 'changgang', label: '昌岗站附近', station: '昌岗站', area: '海珠区 · 昌岗片区', line: '8 号线 · 商圈便利', x: 61, y: 47 },
  { id: 'lujiang', label: '鹭江站附近', station: '鹭江站', area: '海珠区 · 鹭江片区', line: '8 号线 · 步行到站', x: 76, y: 44 },
  { id: 'guicheng', label: '桂城站附近', station: '桂城站', area: '南海区 · 桂城片区', line: '广佛线 · 商业便利', x: 64, y: 45 },
  { id: 'chencun', label: '陈村站附近', station: '陈村站', area: '顺德区 · 陈村片区', line: '广佛线 · 顺德方向', x: 51, y: 69 }
];

const DEMO_MEMBERS = [
  { id: 'alin', name: '阿林', role: 'host', locationId: 'kezun', privacy: 'fuzzy', submitted: true },
  { id: 'xiaomi', name: '小米', role: 'member', locationId: 'guicheng', privacy: 'fuzzy', submitted: true },
  { id: 'jiahao', name: '嘉豪', role: 'member', locationId: 'chencun', privacy: 'fuzzy', submitted: true },
  { id: 'siyan', name: '思妍', role: 'member', locationId: null, privacy: 'fuzzy', submitted: false },
  { id: 'friend-a', name: '朋友 A', role: 'member', locationId: null, privacy: 'fuzzy', submitted: false },
  { id: 'friend-b', name: '朋友 B', role: 'member', locationId: null, privacy: 'fuzzy', submitted: false }
];

const DEMO_CANDIDATES = [
  {
    id: 'zhu',
    station: '祖庙站',
    district: '岭南天地',
    totalMinutes: 214,
    farthestMinutes: 61,
    transfers: 1.2,
    foodScore: 4.7,
    foodLabel: '餐饮丰富',
    foodNote: '晚餐选择多',
    reason: '在总通勤与最远成员时间之间最均衡，广佛线衔接顺畅。',
    travelMinutesByMember: { alin: 54, xiaomi: 41, jiahao: 61, siyan: 50, 'friend-a': 47, 'friend-b': 49 },
    routeByMember: { siyan: '黄沙站附近 → 8 号线 / 广佛线 → 祖庙站 · 50 分钟' },
    plannedMessage: '目标 19:30；预计最早全员到齐 19:42，建议改为 19:45。',
    asapMessage: '按当前可出发时间，最早全员到齐 18:57。',
    x: 33,
    y: 55
  },
  {
    id: 'kui',
    station: '魁奇路站',
    district: '创意产业园',
    totalMinutes: 226,
    farthestMinutes: 63,
    transfers: 1,
    foodScore: 3.8,
    foodLabel: '餐饮适中',
    foodNote: '步行街餐饮',
    reason: '换乘更少，但对黄沙方向的成员略远。',
    travelMinutesByMember: { alin: 58, xiaomi: 35, jiahao: 63, siyan: 55, 'friend-a': 50, 'friend-b': 52 },
    routeByMember: { siyan: '黄沙站附近 → 广佛线 → 魁奇路站 · 55 分钟' },
    plannedMessage: '目标 19:30；有 1 人预计 19:46 抵达。',
    asapMessage: '按当前可出发时间，最早全员到齐 19:01。',
    x: 58,
    y: 66
  },
  {
    id: 'xi',
    station: '西塱站',
    district: '荔胜广场',
    totalMinutes: 239,
    farthestMinutes: 72,
    transfers: 1.4,
    foodScore: 4.4,
    foodLabel: '餐饮较多',
    foodNote: '商场餐饮集中',
    reason: '广州侧更便利，但佛山方向的通勤差异较大。',
    travelMinutesByMember: { alin: 51, xiaomi: 58, jiahao: 72, siyan: 36, 'friend-a': 49, 'friend-b': 53 },
    routeByMember: { siyan: '黄沙站附近 → 8 号线 → 西塱站 · 36 分钟' },
    plannedMessage: '目标 19:30；预计最早全员到齐 19:49。',
    asapMessage: '按当前可出发时间，最早全员到齐 19:08。',
    x: 24,
    y: 76
  }
];

const DEFAULT_SETTINGS = {
  name: '周五广佛小聚',
  expectedMembers: 6,
  timeMode: 'planned',
  strategy: 'smart',
  commuteCap: 90,
  mapSource: 'baidu'
};

let newMeetingSequence = 0;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createDemoMeeting() {
  return {
    id: 'guangfo-friday-demo',
    settings: clone(DEFAULT_SETTINGS),
    members: clone(DEMO_MEMBERS),
    currentMemberId: 'siyan',
    locationDraft: {
      pointId: 'kezun',
      privacy: 'fuzzy'
    },
    selectedCandidateId: 'zhu',
    finalCandidateId: null,
    updatedAt: null
  };
}

function createNewDemoMeeting() {
  newMeetingSequence += 1;
  const meeting = createDemoMeeting();
  meeting.id = `guangfo-demo-${Date.now().toString(36)}-${newMeetingSequence}`;
  return meeting;
}

function getMapPoint(pointId) {
  return MAP_POINTS.find((point) => point.id === pointId) || null;
}

module.exports = {
  DEFAULT_SETTINGS,
  DEMO_CANDIDATES,
  DEMO_MEMBERS,
  MAP_POINTS,
  clone,
  createDemoMeeting,
  createNewDemoMeeting,
  getMapPoint
};
