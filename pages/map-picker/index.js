/**
 * 功能:
 *   提供专注的全屏广佛地图选点界面，帮助参与者更精确地选择站点附近区域。
 * 实现:
 *   将地图组件的 pointchange 事件立即写入位置草稿，确认后返回填写页保留选择。
 * 输入:
 *   地图与站点列表点击事件、getApp().globalData.store。
 * 输出:
 *   更新后的本地位置草稿和页面返回动作；不请求真实地图服务。
 * 依赖:
 *   微信小程序 Page、city-map 组件和 meeting-view-model 服务。
 * 用法:
 *   从填写出发点页的“展开地图精细选择”进入。
 */

const {
  buildLocationDraft,
  buildMapView
} = require('../../services/meeting-view-model');

Page({
  data: {
    draft: {},
    points: [],
    memberPins: []
  },

  onShow() {
    this.refreshPicker();
  },

  refreshPicker() {
    const meeting = getApp().globalData.store.getState();
    const mapView = buildMapView(meeting);
    this.setData({
      draft: buildLocationDraft(meeting),
      points: mapView.points,
      memberPins: mapView.memberPins
    });
  },

  onMapPointChange(event) {
    this.selectPoint(event.detail.pointId);
  },

  onStationSelect(event) {
    this.selectPoint(event.currentTarget.dataset.pointId);
  },

  selectPoint(pointId) {
    const store = getApp().globalData.store;
    store.setLocationDraft({
      pointId,
      privacy: this.data.draft.privacy
    });
    this.refreshPicker();
  },

  onConfirm() {
    wx.navigateBack();
  }
});
