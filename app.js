/**
 * 功能:
 *   初始化“聚点”微信小程序的全局会议状态、平台能力适配器和本地会话恢复。
 * 实现:
 *   在启动时创建注入微信本地存储的状态仓库，向各页面提供应用名称、会议状态和平台能力。
 * 输入:
 *   微信小程序启动生命周期、wx 本地存储和本地演示数据。
 * 输出:
 *   getApp() 可访问的 globalData；不发起网络请求。
 * 依赖:
 *   微信小程序原生 App、wx API 与项目本地服务模块。
 * 用法:
 *   由微信开发者工具加载 app.json 后自动执行。
 */

const { createDemoMeeting } = require('./data/demo-data');
const { createMeetingStore } = require('./services/meeting-store');
const { createPlatformAdapters } = require('./services/platform-adapters');

function createWechatStorage(wxApi) {
  return {
    get(key) {
      try {
        return wxApi.getStorageSync(key) || null;
      } catch (error) {
        return null;
      }
    },
    set(key, value) {
      wxApi.setStorageSync(key, value);
    },
    remove(key) {
      wxApi.removeStorageSync(key);
    }
  };
}

App({
  globalData: {
    appName: '聚点',
    activeMeetingId: 'guangfo-friday-demo'
  },

  onLaunch() {
    const wxApi = typeof wx === 'undefined' ? null : wx;
    const storage = wxApi ? createWechatStorage(wxApi) : undefined;
    this.globalData.store = createMeetingStore({
      initialMeeting: createDemoMeeting(),
      storage
    });
    this.globalData.adapters = createPlatformAdapters(wxApi);
    this.globalData.activeMeetingId = this.globalData.store.getState().id;
  }
});
