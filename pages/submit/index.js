/**
 * 功能:
 *   让参与者在广佛地图上选择出发区域、设定位置公开范围并提交给会合推荐。
 * 实现:
 *   读取全局会议状态，用 city-map 的 pointchange 事件更新位置草稿，再通过状态仓库写入当前成员。
 * 输入:
 *   地图点按事件、隐私选项和 getApp().globalData.store。
 * 输出:
 *   更新后的本地成员位置与前往推荐页面的路由跳转；不请求真实地图服务。
 * 依赖:
 *   微信小程序 Page、city-map 组件和 meeting-view-model 服务。
 * 用法:
 *   从邀请页或首页“填写出发点”进入本页。
 */

const {
  PRIVACY_OPTIONS,
  buildLocationDraft,
  buildMapView,
  buildMeetingSummary
} = require('../../services/meeting-view-model');

Page({
  data: {
    summary: {},
    draft: {},
    points: [],
    memberPins: [],
    privacyOptions: PRIVACY_OPTIONS
  },

  onShow() {
    this.refreshSubmission();
  },

  refreshSubmission() {
    const meeting = getApp().globalData.store.getState();
    const mapView = buildMapView(meeting);
    this.setData({
      summary: buildMeetingSummary(meeting),
      draft: buildLocationDraft(meeting),
      points: mapView.points,
      memberPins: mapView.memberPins
    });
  },

  onMapPointChange(event) {
    this.saveDraftPoint(event.detail.pointId);
  },

  onOpenMapPicker() {
    wx.navigateTo({
      url: '/pages/map-picker/index'
    });
  },

  onPrivacyChange(event) {
    const store = getApp().globalData.store;
    store.setLocationDraft({
      pointId: this.data.draft.pointId,
      privacy: event.currentTarget.dataset.value
    });
    this.refreshSubmission();
  },

  saveDraftPoint(pointId) {
    const store = getApp().globalData.store;
    store.setLocationDraft({
      pointId,
      privacy: this.data.draft.privacy
    });
    this.refreshSubmission();
  },

  onSubmitLocation() {
    getApp().globalData.store.submitCurrentMemberLocation();
    wx.showToast({
      title: '出发点已提交',
      icon: 'success'
    });
    wx.navigateTo({
      url: '/pages/recommendations/index'
    });
  },

  onViewRecommendations() {
    wx.navigateTo({
      url: '/pages/recommendations/index'
    });
  }
});
