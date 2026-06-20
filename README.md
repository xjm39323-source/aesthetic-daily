# 每日审美 · Aesthetic Daily

每天 20 分钟提升审美。自动从网络抓取电影、摄影、三维、动漫等高质量作品，每天推送一个主题。

## 零成本架构

```
GitHub Actions（每日自动抓取）
       ↓
   Python 爬虫（Unsplash/Pexels/Reddit/Jikan/Museum）
       ↓
  生成 data.json + 部署到 GitHub Pages
       ↓
  你每天打开网页 = 看当天的审美主题
```

## 搭建步骤（5 分钟）

### 1. Fork 这个仓库

点 GitHub 右上角的 Fork。

### 2. 获取免费 API Key（可选但推荐）

| 服务 | 是否需要 | 申请地址 | 作用 |
|------|---------|---------|------|
| **Pexels** | ⭐ 强烈推荐 | https://www.pexels.com/api/ | 摄影、CG、设计类 |
| **Unsplash** | 推荐 | https://unsplash.com/developers | 摄影、建筑、自然 |
| **TMDB** | 推荐 | https://www.themoviedb.org/settings/api | 电影剧照 |

不申请也不影响使用 — Reddit、Jikan（动漫）、大都会博物馆这三个源不需要 Key。

### 3. 配置 GitHub Secrets

进入仓库 Settings → Secrets and variables → Actions → New repository secret：

| Secret | 值 |
|--------|-----|
| `PEXELS_KEY` | Pexels API Key |
| `UNSPLASH_KEY` | Unsplash API Key |
| `TMDB_KEY` | TMDB API Key |

一个 Key 都不填也能用，只是源少一些。

### 4. 启用 GitHub Pages

Settings → Pages → Source 选 **GitHub Actions**。

### 5. 手动触发一次

点 Actions → Daily Aesthetic Build → Run workflow，等几分钟。

完成后，你的 Page 地址会在 Settings → Pages 顶部显示。

### 6. 添加到手机桌面

用手机浏览器打开 Page 地址 → 分享/菜单 → **添加到主屏幕**。

## 设计

白底黑灰配色，10 大内容领域，每日 10 件作品，可折叠审美分析，收藏，成长记录。