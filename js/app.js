let state = { theme: null, workIndex: 0, tab: "daily" }

async function loadData() {
  try {
    const r = await fetch("js/data.json?_t=" + Date.now())
    if (!r.ok) throw new Error("Fetch failed: " + r.status)
    const data = await r.json()
    if (data && data.theme) { state.theme = data.theme; render() }
  } catch (e) {
    console.warn("Failed to load data.json:", e)
    if ("caches" in window) {
      const cache = await caches.open("aesthetic-v1")
      const r = await cache.match("js/data.json")
      if (r) { const data = await r.json(); if (data && data.theme) { state.theme = data.theme; render() } }
    }
  }
}

function render() { renderThemeCard(); renderWork(); renderProfile() }

function renderThemeCard() {
  const t = state.theme; if (!t) return
  document.getElementById("theme-card").innerHTML = `
    <div class="accent" style="background:${t.colorHex || "#999"}"></div>
    <div class="day-label">Day ${t.day} · ${t.category}</div>
    <h1>${t.title}</h1>
    <div class="subtitle">${t.subtitle}</div>
    <div class="count">今日共 ${t.works.length} 件作品 · 预计 20 分钟</div>`
}

function renderWork() {
  const t = state.theme; if (!t) return
  const w = t.works[state.workIndex]; if (!w) return
  const fav = Store.isFavorited(w.id)
  const imgUrl = w.imageUrl || w.imageName || ""

  document.getElementById("work-detail").innerHTML = `
    <div class="work-image-wrapper">
      ${imgUrl ? `<img class="work-image" src="${imgUrl}" alt="${w.title}" loading="lazy"
        onerror="this.outerHTML='<div class=work-image style=background:#ddd;display:flex;align-items:center;justify-content:center><span style=font-size:48px;color:#999>✦</span></div>'" />`
      : `<div class="work-image" style="background:${w.gradient || "#ddd"};display:flex;align-items:center;justify-content:center"><span style="font-size:48px;color:rgba(255,255,255,0.2)">✦</span></div>`}
    </div>
    <div class="work-info">
      <div>
        <div class="work-title">${w.title || "无标题"}</div>
        <div class="work-meta">${w.author || ""}</div>
      </div>
      <div class="fav-btn ${fav ? "active" : ""}" onclick="toggleFav('${w.id}')">${fav ? "♥" : "♡"}</div>
    </div>
    <div class="tags">${(w.tags||[]).map(t => `<span class="tag">${t}</span>`).join("")}</div>
    ${w.composition ? collapsibleHTML("📐 构图分析", w.composition) : ""}
    ${w.colorAnalysis ? collapsibleHTML("🎨 色彩解析", w.colorAnalysis) : ""}
    ${w.aestheticNote ? collapsibleHTML("💡 审美笔记", w.aestheticNote) : ""}
    <div class="nav-buttons">
      <button class="nav-btn prev" onclick="prevWork()" ${state.workIndex === 0 ? "disabled" : ""}>← 上一张</button>
      <button class="nav-btn next" onclick="nextWork()" ${state.workIndex >= t.works.length - 1 ? "disabled" : ""}>下一张 →</button>
    </div>
    <div class="progress">${state.workIndex + 1} / ${t.works.length}</div>`
}

function collapsibleHTML(title, content) {
  return `<div class="collapsible" onclick="this.classList.toggle('open')">
    <div class="collapsible-header"><span>${title}</span><span class="arrow">▸</span></div>
    <div class="collapsible-body">${content}</div></div>`
}

function nextWork() { const t = state.theme; if (t && state.workIndex < t.works.length - 1) { state.workIndex++; renderWork() } }
function prevWork() { if (state.workIndex > 0) { state.workIndex--; renderWork() } }
function toggleFav(id) { Store.toggleFavorite(id); Store._set("favs", Store.getFavorites()); renderWork() }

function switchTab(tab) {
  state.tab = tab
  document.querySelectorAll(".page").forEach(el => el.classList.remove("active"))
  document.querySelectorAll(".tab-item").forEach(el => el.classList.remove("active"))
  document.getElementById("page-" + tab).classList.add("active")
  document.querySelector(`.tab-item[data-tab="${tab}"]`).classList.add("active")
  if (tab === "favorites") renderFavorites()
  if (tab === "profile") renderProfile()
}

function renderExplore() {
  const cats = ["电影美学","三维/CG","摄影","动漫","平面设计","建筑/空间","插画","时尚","UI/UX","自然/微距"]
  const icons = {"电影美学":"🎬","三维/CG":"💻","摄影":"📷","动漫":"🎨","平面设计":"🖼","建筑/空间":"🏛","插画":"✏️","时尚":"👕","UI/UX":"📱","自然/微距":"🌿"}
  document.getElementById("explore-grid").innerHTML = cats.map(c => `<div class="cat-card"><div class="icon">${icons[c]||"✦"}</div><div class="name">${c}</div></div>`).join("")
}

function renderFavorites() {
  const favIds = Store.getFavorites(); const t = state.theme
  if (!favIds.length) { document.getElementById("fav-list").innerHTML = `<div class="empty-state"><div class="icon">♡</div><p>还没有收藏</p></div>`; return }
  document.getElementById("fav-list").innerHTML = favIds.map(id => {
    const w = t ? t.works.find(x => x.id === id) : null
    const img = w ? (w.imageUrl || w.imageName || "") : ""
    return `<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--card);border-radius:8px;margin-bottom:8px;border:1px solid var(--border)">
      ${img ? `<img src="${img}" style="width:60px;height:60px;border-radius:8px;object-fit:cover" onerror="this.outerHTML='<div style=\\'width:60px;height:60px;border-radius:8px;background:var(--light);display:flex;align-items:center;justify-content:center\\'>✦</div>'" />`
      : `<div style="width:60px;height:60px;border-radius:8px;background:var(--light);display:flex;align-items:center;justify-content:center">✦</div>`}
      <div><div style="font-size:14px;color:var(--text-title)">${w ? w.title : id}</div><div style="font-size:11px;color:var(--text-secondary)">已收藏</div></div></div>`
  }).join("")
}

function renderProfile() {
  const days = Store.getDaysSinceJoin(); const favCount = Store.getFavorites().length; const completedCount = Store.getCompletedCount()
  document.getElementById("profile-content").innerHTML = `
    <div class="profile-header"><div class="avatar">✦</div><div class="profile-name">${Store.getProfile().name}</div><div class="profile-days">加入第 ${days} 天</div></div>
    <div class="stats">
      <div class="stat-card"><div class="num">${days}</div><div class="label">连续天数</div></div>
      <div class="stat-card"><div class="num">${favCount}</div><div class="label">作品收藏</div></div>
      <div class="stat-card"><div class="num">${completedCount}</div><div class="label">完成主题</div></div>
    </div>
    <div class="section"><div class="label">审美偏好</div><div class="pref-card" id="pref-bars"></div></div>`
  const cats = ["电影美学","三维/CG","摄影","动漫","平面设计","建筑/空间","插画","时尚","UI/UX","自然/微距"]
  document.getElementById("pref-bars").innerHTML = cats.map(c => `<div class="pref-row"><div class="row"><span>${c}</span><span>10%</span></div><div class="pref-bar"><div class="fill" style="width:10%"></div></div></div>`).join("")
}

document.addEventListener("DOMContentLoaded", () => {
  renderExplore(); loadData()
  if ("serviceWorker" in navigator) { navigator.serviceWorker.register("sw.js") }
  document.addEventListener("keydown", e => {
    if (state.tab === "daily") { if (e.key === "ArrowLeft") prevWork(); if (e.key === "ArrowRight") nextWork() }
  })
})