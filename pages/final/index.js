/**
 * 功能:
 *   展示发起人选定的最终会合地点，并提供导航、分享和查看历史的入口。
 * 实现:
 *   从全局状态仓库读取最终候选，构建会合摘要与地图标记；导航动作明确提示真实地图服务的接入边界。
 * 输入:
 *   getApp().globalData.store、演示候选数据和微信分享生命周期。
 * 输出:
 *   最终会合页面、分享卡片信息和路由跳转；不请求真实地图服务。
 * 依赖:
 *   微信小程序 Page、city-map 组件和 meeting-view-model 服务。
 * 用法:
 *   从会合推荐页“发起人确认当前地点”进入。
 */

const { DEMO_CANDIDATES } = require('../../data/demo-data');
const {
  buildFinalSummary,
  buildMapView
} = require('../../services/meeting-view-model');

Page({
  data: {
    finalSummary: {},
    points: [],
    memberPins: [],
    candidatePins: []
  },

  onShow() {
    this.refreshFinal();
  },

  refreshFinal() {
    const meeting = getApp().globalData.store.getState();
    const mapView = buildMapView(meeting, DEMO_CANDIDATES);
    this.setData({
      finalSummary: buildFinalSummary(meeting, DEMO_CANDIDATES),
      points: mapView.points,
      memberPins: mapView.memberPins,
      candidatePins: mapView.candidatePins
    });
  },

  onOpenNavigation() {
    wx.showModal({
      title: '导航入口已生成',
      content: `默认地图为百度地图。接入真实地图密钥后，将直接导航至${this.data.finalSummary.station}附近。`,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  onOpenHistory() {
    wx.navigateTo({
      url: '/pages/history/index'
    });
  },

  onBackHome() {
    wx.reLaunch({
      url: '/pages/home/index'
    });
  },

  onShareAppMessage() {
    return {
      title: this.data.finalSummary.shareTitle || '聚点 · 一起见面',
      path: '/pages/final/index'
    };
  }
});
