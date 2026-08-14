/**
 * 功能:
 *   让发起人设定会合名称、参与人数、地点推荐策略与可接受的最远通勤上限。
 * 实现:
 *   读取全局会议状态并将表单选择写入本地状态仓库，随后进入邀请参与者页面。
 * 输入:
 *   用户输入、策略选项、通勤上限选项和 getApp().globalData.store。
 * 输出:
 *   更新后的会议设置与到邀请页面的原生路由跳转；不请求网络。
 * 依赖:
 *   微信小程序 Page、meeting-store 和 meeting-view-model 服务。
 * 用法:
 *   从首页“发起一场聚会”进入本页。
 */

const {
  COMMUTE_CAP_OPTIONS,
  STRATEGY_OPTIONS
} = require('../../services/meeting-view-model');

const MEMBER_OPTIONS = [2, 3, 4, 5, 6, 8, 10];

Page({
  data: {
    meetingName: '',
    expectedMembers: 6,
    strategy: 'smart',
    commuteCap: 90,
    memberOptions: MEMBER_OPTIONS,
    strategyOptions: STRATEGY_OPTIONS,
    commuteCapOptions: COMMUTE_CAP_OPTIONS
  },

  onShow() {
    this.refreshForm();
  },

  refreshForm() {
    const meeting = getApp().globalData.store.getState();
    this.setData({
      meetingName: meeting.settings.name,
      expectedMembers: meeting.settings.expectedMembers,
      strategy: meeting.settings.strategy,
      commuteCap: meeting.settings.commuteCap
    });
  },

  onNameInput(event) {
    this.setData({
      meetingName: event.detail.value
    });
  },

  onMemberCountChange(event) {
    this.setData({
      expectedMembers: Number(event.currentTarget.dataset.value)
    });
  },

  onStrategyChange(event) {
    this.setData({
      strategy: event.currentTarget.dataset.value
    });
  },

  onCommuteCapChange(event) {
    const value = event.currentTarget.dataset.value;
    this.setData({
      commuteCap: value === 'none' ? 'none' : Number(value)
    });
  },

  onContinue() {
    const meetingName = this.data.meetingName.trim() || '未命名会合';
    getApp().globalData.store.updateSettings({
      name: meetingName,
      expectedMembers: this.data.expectedMembers,
      strategy: this.data.strategy,
      commuteCap: this.data.commuteCap
    });
    wx.navigateTo({
      url: '/pages/invite/index'
    });
  }
});
