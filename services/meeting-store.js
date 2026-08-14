/**
 * 功能:
 *   管理单场会合的本地状态、位置草稿、成员提交进度、地点确认和本机历史。
 * 实现:
 *   通过注入式存储保存可复制的会议快照，使页面无需直接依赖 wx 存储或远端数据库。
 * 输入:
 *   初始会议对象、存储适配器和页面发出的设置、位置与候选操作。
 * 输出:
 *   最新会议状态、进度摘要与最多 20 条本机历史；默认仅写入注入的本地存储。
 * 依赖:
 *   data/demo-data.js 与 JavaScript 原生对象能力。
 * 用法:
 *   const store = createMeetingStore({ initialMeeting, storage });
 */

const { clone, createDemoMeeting, createNewDemoMeeting } = require('../data/demo-data');

const STORAGE_KEY = 'judian:meeting';
const HISTORY_STORAGE_KEY = 'judian:history';
const PRIVACY_MODES = ['hidden', 'fuzzy', 'exact'];

function createMemoryStorage(initialValues = {}) {
  const values = clone(initialValues);

  return {
    get(key) {
      return values[key] === undefined ? null : clone(values[key]);
    },
    set(key, value) {
      values[key] = clone(value);
    },
    remove(key) {
      delete values[key];
    }
  };
}

function createMeetingStore(options = {}) {
  const storage = options.storage || createMemoryStorage();
  const storedMeeting = storage.get(STORAGE_KEY);
  let state = clone(storedMeeting || options.initialMeeting || createDemoMeeting());

  function persist() {
    state.updatedAt = new Date().toISOString();
    storage.set(STORAGE_KEY, state);
  }

  function getState() {
    return clone(state);
  }

  function getProgress() {
    const expected = Number(state.settings.expectedMembers) || state.members.length;
    const submitted = state.members.filter((member) => member.submitted).length;

    return {
      expected,
      submitted,
      remaining: Math.max(expected - submitted, 0)
    };
  }

  function getHistory() {
    const history = storage.get(HISTORY_STORAGE_KEY);
    return Array.isArray(history) ? clone(history) : [];
  }

  function saveCurrentToHistory() {
    const currentRecord = clone(state);
    const deduplicatedHistory = getHistory().filter((record) => record.id !== currentRecord.id);
    storage.set(HISTORY_STORAGE_KEY, [currentRecord, ...deduplicatedHistory].slice(0, 20));
  }

  function updateSettings(nextSettings) {
    state.settings = {
      ...state.settings,
      ...clone(nextSettings)
    };
    persist();
    return getState();
  }

  function setLocationDraft({ pointId, privacy }) {
    if (!pointId) {
      throw new Error('pointId is required');
    }
    if (!PRIVACY_MODES.includes(privacy)) {
      throw new Error('privacy must be hidden, fuzzy or exact');
    }

    state.locationDraft = {
      pointId,
      privacy
    };
    persist();
    return getState();
  }

  function submitCurrentMemberLocation() {
    const currentMember = state.members.find((member) => member.id === state.currentMemberId);
    if (!currentMember) {
      throw new Error('current member does not exist');
    }

    currentMember.locationId = state.locationDraft.pointId;
    currentMember.privacy = state.locationDraft.privacy;
    currentMember.submitted = true;
    persist();
    return getState();
  }

  function selectCandidate(candidateId) {
    state.selectedCandidateId = candidateId;
    state.finalCandidateId = null;
    persist();
    return getState();
  }

  function confirmSelectedCandidate() {
    state.finalCandidateId = state.selectedCandidateId;
    persist();
    saveCurrentToHistory();
    return getState();
  }

  function reset() {
    state = createNewDemoMeeting();
    storage.remove(STORAGE_KEY);
    return getState();
  }

  return {
    confirmSelectedCandidate,
    getHistory,
    getProgress,
    getState,
    reset,
    selectCandidate,
    setLocationDraft,
    submitCurrentMemberLocation,
    updateSettings
  };
}

module.exports = {
  HISTORY_STORAGE_KEY,
  PRIVACY_MODES,
  STORAGE_KEY,
  createMeetingStore,
  createMemoryStorage
};
