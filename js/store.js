const Store = {
  _get(key, def) {
    try { return JSON.parse(localStorage.getItem(key)) ?? def }
    catch { return def }
  },
  _set(key, val) { localStorage.setItem(key, JSON.stringify(val)) },

  getFavorites() { return this._get("favs", []) },
  toggleFavorite(id) {
    const favs = this.getFavorites()
    const idx = favs.indexOf(id)
    if (idx >= 0) { favs.splice(idx, 1); return false }
    else { favs.push(id); return true }
    this._set("favs", favs)
  },
  isFavorited(id) { return this.getFavorites().includes(id) },

  getProfile() {
    let p = this._get("profile", null)
    if (!p) { p = { joinDate: Date.now(), name: "审美旅人" }; this._set("profile", p) }
    return p
  },
  getDaysSinceJoin() {
    const jd = this.getProfile().joinDate
    return Math.floor((Date.now() - jd) / (86400000)) || 1
  },
  getCompletedCount() { return this._get("completed", []).length },
  markCompleted(themeId) {
    const c = this._get("completed", [])
    if (!c.includes(themeId)) { c.push(themeId); this._set("completed", c) }
  },
  getCategoryPrefs() { return this._get("catPrefs", {}) },
  setCategoryPrefs(prefs) { this._set("catPrefs", prefs) },

  getDataVersion() { return this._get("dataVersion", 0) },
  setDataVersion(v) { this._set("dataVersion", v) }
}