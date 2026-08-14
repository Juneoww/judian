/**
 * 功能:
 *   为微信登录、地图导航、会合分享与云端同步提供可替换的平台适配边界。
 * 实现:
 *   有微信 API 时调用对应原生能力；无 API 或未配置真实服务时返回明确的本地演示结果。
 * 输入:
 *   可选的 wx API 对象、地点信息、分享信息与会议快照。
 * 输出:
 *   Promise 或同步状态对象；默认不发起网络请求。
 * 依赖:
 *   微信小程序 wx API（可选）与 JavaScript Promise。
 * 用法:
 *   const adapters = createPlatformAdapters(wx);
 */

function createPlatformAdapters(wxApi) {
  function login() {
    if (!wxApi || typeof wxApi.login !== 'function') {
      return Promise.resolve({ mode: 'mock', userId: 'demo-user', message: '等待接入微信授权' });
    }

    return new Promise((resolve, reject) => {
      wxApi.login({
        success(result) {
          resolve({ mode: 'wechat', code: result.code });
        },
        fail(error) {
          reject(error);
        }
      });
    });
  }

  function openMap(place) {
    if (!wxApi || typeof wxApi.openLocation !== 'function') {
      return { mode: 'mock', place, message: '等待接入地图导航' };
    }

    wxApi.openLocation({
      latitude: place.latitude,
      longitude: place.longitude,
      name: place.name,
      scale: 16
    });
    return { mode: 'wechat', place };
  }

  function shareMeeting(payload) {
    return {
      mode: wxApi ? 'wechat-ready' : 'mock',
      payload
    };
  }

  function syncMeeting(meeting) {
    return Promise.resolve({
      mode: 'mock',
      meetingId: meeting.id,
      message: '等待接入 CloudBase 或业务后端'
    });
  }

  return {
    login,
    openMap,
    shareMeeting,
    syncMeeting
  };
}

module.exports = {
  createPlatformAdapters
};
