/**
 * 功能:
 *   展示多人会合地点的实时/暂定推荐，并让发起人按策略调整后确认最终地点。
 * 实现:
 *   用推荐引擎的视图模型渲染候选卡片和地图标记，用户选择候选或策略后写入本地状态仓库。
 * 输入:
 *   getApp().globalData.store、演示候选数据、策略和通勤上限点击事件。
 * 输出:
 *   更新后的本地推荐设置、选中地点及前往最终结果页的路由跳转。
 * 依赖:
 *   微信小程序 Page、city-map 组件、meeting-view-model 与 data/demo-data.js。
 * 用法:
 *   从填写位置或邀请页“先看暂定推荐”进入。
 */

const { DEMO_CANDIDATES } = require('../../data/demo-data');
const {
  COMMUTE_CAP_OPTIONS,
  STRATEGY_OPTIONS,
  buildMapView,
  buildRecommendationView
} = require('../../services/meeting-view-model');

Page({
  data: {
    view: {},
    points: [],
    memberPins: [],
    candidatePins: [],
    strategyOptions: STRATEGY_OPTIONS,
    commuteCapOptions: COMMUTE_CAP_OPTIONS,
    activeStrategy: 'smart',
    activeCap: 90
  },

  onShow() {
    this.refreshRecommendations();
  },

  refreshRecommendations() {
    const meeting = getApp().globalData.store.getState();
    const view = buildRecommendationView(meeting, DEMO_CANDIDATES);
    const mapView = buildMapView(meeting, view.recommendations);
    this.setData({
      view,
      points: mapView.points,
      memberPins: mapView.memberPins,
      candidatePins: mapView.candidatePins,
      activeStrategy: meeting.settings.strategy,
      activeCap: meeting.settings.commuteCap
    });
  },

  onStrategyChange(event) {
    getApp().globalData.store.updateSettings({
      strategy: event.currentTarget.dataset.value
    });
    this.refreshRecommendations();
  },

  onCapChange(event) {
    const value = event.currentTarget.dataset.value;
    getApp().globalData.store.updateSettings({
      commuteCap: value === 'none' ? 'none' : Number(value)
    });
    this.refreshRecommendations();
  },

  onCandidateSelect(event) {
    getApp().globalData.store.selectCandidate(event.currentTarget.dataset.candidateId);
    this.refreshRecommendations();
  },

  onConfirmCandidate() {
    getApp().globalData.store.confirmSelectedCandidate();
    wx.navigateTo({
      url: '/pages/final/index'
    });
  },

  onBackToInvite() {
    wx.navigateTo({
      url: '/pages/invite/index'
    });
  }
});
