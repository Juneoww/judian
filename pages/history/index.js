/**
 * 功能:
 *   展示已确认会合在当前设备上的本机历史记录。
 * 实现:
 *   从会议状态仓库读取确认时保存的快照，并用最终会合视图模型转换为可读的历史列表数据。
 * 输入:
 *   getApp().globalData.store 的 getHistory() 结果和演示候选数据。
 * 输出:
 *   历史列表页面数据与前往当前结果、首页的路由跳转；不访问网络。
 * 依赖:
 *   微信小程序 Page、meeting-store 和 meeting-view-model 服务。
 * 用法:
 *   从首页或最终结果页进入本页。
 */

const { DEMO_CANDIDATES } = require('../../data/demo-data');
const { buildFinalSummary } = require('../../services/meeting-view-model');

function formatHistoryTime(updatedAt) {
  if (!updatedAt) {
    return '刚刚保存';
  }

  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) {
    return '刚刚保存';
  }

  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hour = `${date.getHours()}`.padStart(2, '0');
  const minute = `${date.getMinutes()}`.padStart(2, '0');
  return `${month}-${day} ${hour}:${minute}`;
}

Page({
  data: {
    records: []
  },

  onShow() {
    this.refreshHistory();
  },

  refreshHistory() {
    const records = getApp().globalData.store.getHistory().map((meeting) => ({
      ...buildFinalSummary(meeting, DEMO_CANDIDATES),
      updatedLabel: formatHistoryTime(meeting.updatedAt)
    }));
    this.setData({ records });
  },

  onOpenCurrentResult() {
    wx.navigateTo({
      url: '/pages/final/index'
    });
  },

  onBackHome() {
    wx.reLaunch({
      url: '/pages/home/index'
    });
  }
});
