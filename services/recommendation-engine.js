/**
 * 功能:
 *   根据会合策略、通勤上限和演示候选数据生成广佛聚集地推荐列表。
 * 实现:
 *   对候选的总通勤、最远成员、换乘和餐饮分值计算策略分数，并标出超出通勤上限的风险。
 * 输入:
 *   会议状态对象与候选地点数组。
 * 输出:
 *   排序后的候选列表和成员提交进度摘要；不调用路线或地图服务。
 * 依赖:
 *   JavaScript 原生数组与对象能力。
 * 用法:
 *   const { getRecommendations } = require('./recommendation-engine');
 */

function getMeetingProgress(meeting) {
  const expected = Number(meeting.settings.expectedMembers) || meeting.members.length;
  const submitted = meeting.members.filter((member) => member.submitted).length;

  return {
    expected,
    submitted,
    remaining: Math.max(expected - submitted, 0)
  };
}

function normalizeCap(commuteCap) {
  if (commuteCap === 'none' || commuteCap === null || commuteCap === undefined) {
    return Infinity;
  }

  const value = Number(commuteCap);
  return Number.isFinite(value) ? value : Infinity;
}

function scoreCandidate(candidate, strategy, commuteCap) {
  const overCapMinutes = Math.max(candidate.farthestMinutes - commuteCap, 0);
  const capPenalty = overCapMinutes * 10000;

  if (strategy === 'total') {
    return capPenalty + candidate.totalMinutes;
  }
  if (strategy === 'fair') {
    return capPenalty + candidate.farthestMinutes * 10 + candidate.totalMinutes * 0.05;
  }
  if (strategy === 'transfer') {
    return capPenalty + candidate.transfers * 100 + candidate.totalMinutes * 0.1;
  }
  if (strategy === 'food') {
    return capPenalty - candidate.foodScore * 1000 + candidate.totalMinutes * 0.2;
  }

  return capPenalty + candidate.totalMinutes + candidate.farthestMinutes * 1.6 + candidate.transfers * 10 - candidate.foodScore * 6;
}

function getRecommendations(meeting, candidates) {
  const commuteCap = normalizeCap(meeting.settings.commuteCap);
  const currentMember = meeting.members.find((member) => member.id === meeting.currentMemberId);
  const progress = getMeetingProgress(meeting);

  return candidates
    .map((candidate) => {
      const overCapMinutes = Math.max(candidate.farthestMinutes - commuteCap, 0);
      const ownMinutes = currentMember ? candidate.travelMinutesByMember[currentMember.id] : null;
      const timeMessage = meeting.settings.timeMode === 'asap' ? candidate.asapMessage : candidate.plannedMessage;

      return {
        ...candidate,
        score: scoreCandidate(candidate, meeting.settings.strategy, commuteCap),
        isWithinCap: overCapMinutes === 0,
        overCapMinutes,
        ownMinutes,
        ownRoute: currentMember ? candidate.routeByMember[currentMember.id] || '' : '',
        timeMessage,
        progress
      };
    })
    .sort((left, right) => left.score - right.score)
    .map((candidate, index) => ({
      ...candidate,
      rank: index + 1
    }));
}

module.exports = {
  getMeetingProgress,
  getRecommendations,
  normalizeCap,
  scoreCandidate
};
