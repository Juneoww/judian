/**
 * 功能:
 *   为发起人展示可分享的会合邀请、实时填写进度和参与者状态。
 * 实现:
 *   从全局状态仓库构建会议摘要，在本地演示环境复制邀请文案，并提供填写和查看推荐的路由入口。
 * 输入:
 *   getApp().globalData.store、微信剪贴板与分享生命周期。
 * 输出:
 *   邀请页面数据、剪贴板文案和页面跳转；不请求云端服务。
 * 依赖:
 *   微信小程序 Page、wx.setClipboardData 和 meeting-view-model 服务。
 * 用法:
 *   从发起设置完成后进入本页。
 */

const { buildMeetingSummary } = require('../../services/meeting-view-model');
const { getMapPoint } = require('../../data/demo-data');

Page({
  data: {
    summary: {},
    members: [],
    inviteText: ''
  },

  onShow() {
    this.refreshInvite();
  },

  refreshInvite() {
    const meeting = getApp().globalData.store.getState();
    const summary = buildMeetingSummary(meeting);
    const members = meeting.members.map((member) => {
      const point = member.locationId ? getMapPoint(member.locationId) : null;
      return {
        ...member,
        initial: member.name.slice(0, 1),
        statusText: member.submitted ? '已填写' : '待填写',
        locationText: member.submitted && point
          ? (member.privacy === 'hidden' ? '位置仅自己可见' : `${point.station}附近`)
          : '等待提交出发点'
      };
    });

    this.setData({
      summary,
      members,
      inviteText: `聚点会合「${summary.title}」：打开小程序，填写自己的出发点，一起看更适合见面的地点。`
    });
  },

  onCopyInvite() {
    wx.setClipboardData({
      data: this.data.inviteText,
      success() {
        wx.showToast({
          title: '邀请文案已复制',
          icon: 'success'
        });
      }
    });
  },

  onGoSubmit() {
    wx.navigateTo({
      url: '/pages/submit/index'
    });
  },

  onViewRecommendations() {
    wx.navigateTo({
      url: '/pages/recommendations/index'
    });
  },

  onShareAppMessage() {
    return {
      title: `聚点邀请 · ${this.data.summary.title || '一起找个见面好地点'}`,
      path: '/pages/submit/index'
    };
  }
});
