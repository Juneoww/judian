/**
 * 功能:
 *   将会议状态、地图点位和推荐结果整理为各小程序页面可直接渲染的视图数据。
 * 实现:
 *   基于本地推荐引擎生成中文进度、隐私文案、地图标记、暂定推荐和最终会合摘要。
 * 输入:
 *   会议状态、data/demo-data.js 的地图与候选数据，以及 recommendation-engine 的排序结果。
 * 输出:
 *   不可变风格的普通对象，供 Page.setData 使用；不写入存储、不调用网络。
 * 依赖:
 *   data/demo-data.js 和 services/recommendation-engine.js。
 * 用法:
 *   const view = buildRecommendationView(meeting, DEMO_CANDIDATES);
 */

const { getMapPoint, MAP_POINTS } = require('../data/demo-data');
const { getMeetingProgress, getRecommendations } = require('./recommendation-engine');

const STRATEGY_OPTIONS = [
  { value: 'smart', label: '智能平衡', description: '兼顾总通勤、最远成员与换乘' },
  { value: 'total', label: '总通勤更短', description: '让大家合计花更少时间' },
  { value: 'fair', label: '最远成员更轻松', description: '优先压低最长通勤' },
  { value: 'transfer', label: '少换乘', description: '优先减少换乘次数' },
  { value: 'food', label: '餐饮优先', description: '优先美食聚集地' }
];

const PRIVACY_OPTIONS = [
  { value: 'hidden', label: '仅自己可见', description: '不向其他参与者展示位置' },
  { value: 'fuzzy', label: '模糊公开', description: '只展示到地铁站附近' },
  { value: 'exact', label: '精确公开', description: '向所有参与者展示精确位置' }
];

const COMMUTE_CAP_OPTIONS = [
  { value: 45, label: '45 分钟内' },
  { value: 60, label: '60 分钟内' },
  { value: 90, label: '90 分钟内' },
  { value: 'none', label: '不设上限' }
];

function findCurrentMember(meeting) {
  return meeting.members.find((member) => member.id === meeting.currentMemberId) || null;
}

function findStrategy(strategy) {
  return STRATEGY_OPTIONS.find((item) => item.value === strategy) || STRATEGY_OPTIONS[0];
}

function getPrivacyLabel(privacy) {
  const labels = {
    hidden: '仅自己可见（不向其他参与者展示）',
    fuzzy: '模糊公开（显示站点附近）',
    exact: '精确公开（显示精确位置）'
  };

  return labels[privacy] || labels.fuzzy;
}

function buildMeetingSummary(meeting) {
  const progress = getMeetingProgress(meeting);
  const currentMember = findCurrentMember(meeting);

  return {
    meetingId: meeting.id,
    title: meeting.settings.name,
    expected: progress.expected,
    submitted: progress.submitted,
    remaining: progress.remaining,
    progressText: `${progress.submitted} / ${progress.expected} 人已填写`,
    remainingText: progress.remaining > 0 ? `还有 ${progress.remaining} 人未填写` : '所有人都已填写',
    currentMemberName: currentMember ? currentMember.name : '参与者',
    isCurrentMemberHost: Boolean(currentMember && currentMember.role === 'host')
  };
}

function buildLocationDraft(meeting) {
  const currentMember = findCurrentMember(meeting);
  const draft = meeting.locationDraft || {};
  const point = getMapPoint(draft.pointId) || MAP_POINTS[0];

  return {
    pointId: point.id,
    station: point.station,
    area: point.area,
    line: point.line,
    privacy: draft.privacy || 'fuzzy',
    privacyLabel: getPrivacyLabel(draft.privacy || 'fuzzy'),
    submitted: Boolean(currentMember && currentMember.submitted),
    memberName: currentMember ? currentMember.name : '参与者'
  };
}

function buildMapView(meeting, candidates = []) {
  const draftPointId = meeting.locationDraft && meeting.locationDraft.pointId;
  const points = MAP_POINTS.map((point) => ({
    ...point,
    isSelected: point.id === draftPointId
  }));
  const memberPins = meeting.members
    .filter((member) => member.submitted && member.locationId)
    .map((member) => {
      const point = getMapPoint(member.locationId);
      if (!point) {
        return null;
      }

      return {
        id: member.id,
        name: member.name,
        initial: member.name.slice(0, 1),
        role: member.role,
        privacy: member.privacy,
        station: point.station,
        x: point.x,
        y: point.y
      };
    })
    .filter(Boolean);
  const candidatePins = candidates.map((candidate) => ({
    id: candidate.id,
    station: candidate.station,
    district: candidate.district,
    rank: candidate.rank || null,
    isSelected: meeting.selectedCandidateId === candidate.id || meeting.finalCandidateId === candidate.id,
    x: candidate.x,
    y: candidate.y
  }));

  return {
    points,
    memberPins,
    candidatePins
  };
}

function buildRecommendationView(meeting, candidates) {
  const summary = buildMeetingSummary(meeting);
  const strategy = findStrategy(meeting.settings.strategy);
  const recommendations = getRecommendations(meeting, candidates).map((candidate) => ({
    ...candidate,
    isSelected: meeting.selectedCandidateId === candidate.id,
    rankLabel: `推荐 ${candidate.rank}`,
    commuteText: `总通勤 ${candidate.totalMinutes} 分钟 · 最远 ${candidate.farthestMinutes} 分钟`,
    transferText: `${candidate.transfers} 次换乘`,
    ownTimeText: candidate.ownMinutes === null ? '' : `你约 ${candidate.ownMinutes} 分钟到达`,
    capText: candidate.isWithinCap ? '在通勤上限内' : `最远成员超出 ${candidate.overCapMinutes} 分钟`
  }));
  const isProvisional = summary.remaining > 0 && !meeting.finalCandidateId;

  return {
    ...summary,
    strategy,
    strategyLabel: strategy.label,
    commuteCap: meeting.settings.commuteCap,
    isProvisional,
    provisionalText: isProvisional ? `暂定推荐 · ${summary.remainingText}` : '推荐结果已更新',
    recommendations
  };
}

function buildFinalSummary(meeting, candidates) {
  const candidateId = meeting.finalCandidateId || meeting.selectedCandidateId;
  const candidate = candidates.find((item) => item.id === candidateId) || candidates[0];
  const summary = buildMeetingSummary(meeting);

  return {
    ...summary,
    status: meeting.finalCandidateId ? '已选定' : '待选定',
    station: candidate ? candidate.station : '暂未选择',
    district: candidate ? candidate.district : '',
    reason: candidate ? candidate.reason : '',
    foodText: candidate ? `${candidate.foodLabel} · ${candidate.foodNote}` : '',
    commuteText: candidate ? `总通勤 ${candidate.totalMinutes} 分钟 · 最远 ${candidate.farthestMinutes} 分钟` : '',
    shareTitle: candidate ? `聚点 · ${summary.title}：${candidate.station} 附近见` : `聚点 · ${summary.title}`,
    navigationLabel: candidate ? `导航至 ${candidate.station} 附近` : '等待发起人选定地点'
  };
}

module.exports = {
  COMMUTE_CAP_OPTIONS,
  PRIVACY_OPTIONS,
  STRATEGY_OPTIONS,
  buildFinalSummary,
  buildLocationDraft,
  buildMapView,
  buildMeetingSummary,
  buildRecommendationView,
  getPrivacyLabel
};
