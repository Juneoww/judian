/**
 * 功能:
 *   展示“聚点”首页入口，作为创建会合与填写出发点的第一屏。
 * 实现:
 *   读取全局演示会合状态，渲染产品说明并跳转到发起、填写和历史页面。
 * 输入:
 *   小程序页面生命周期与用户点击事件。
 * 输出:
 *   首页页面数据与原生路由跳转；当前不请求网络。
 * 依赖:
 *   微信小程序 Page、getApp 与 wx.showToast API。
 * 用法:
 *   app.json 注册 pages/home/index 后由小程序自动加载。
 */

Page({
  data: {
    appName: '聚点',
    activeMeetingId: ''
  },

  onLoad() {
    this.refreshMeeting();
  },

  onShow() {
    this.refreshMeeting();
  },

  refreshMeeting() {
    const app = getApp();
    const meeting = app.globalData.store.getState();
    this.setData({
      appName: app.globalData.appName,
      activeMeetingId: meeting.id
    });
  },

  onStartMeeting() {
    const app = getApp();
    app.globalData.store.reset();
    app.globalData.activeMeetingId = app.globalData.store.getState().id;
    wx.navigateTo({
      url: '/pages/create/index'
    });
  },

  onFillLocation() {
    wx.navigateTo({
      url: '/pages/submit/index'
    });
  },

  onOpenHistory() {
    wx.navigateTo({
      url: '/pages/history/index'
    });
  }
});
