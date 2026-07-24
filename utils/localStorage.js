
class LocalStorage {
  getItem(key) {
    return wx.getStorageSync(key);
  }

  setItem(key, data) {
    return wx.setStorage({ key, data });
  }

  removeItem(key) {
    return wx.removeStorage({ key });
  }

  clear() {
    return wx.clearStorage();
  }
}

export default new LocalStorage();
