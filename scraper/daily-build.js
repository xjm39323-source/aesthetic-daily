#!/usr/bin/env node
// Aesthetic Daily Scraper - runs daily via GitHub Actions
// Fetches images from Met Museum API (free, no key needed)
// and generates rich aesthetic analysis content

const https = require('https');
const fs = require('fs');
const path = require('path');

const REPO = process.env.GITHUB_REPOSITORY || 'xjm39323-source/aesthetic-daily';
const TOKEN = process.env.GH_TOKEN || '';
const BRANCH = 'main';

const themes = [
  { search: 'landscape painting', category: '浪漫主义风景', tags: ['风景', '自然', '浪漫主义', '色彩'] },
  { search: 'portrait painting', category: '肖像艺术', tags: ['肖像', '人物', '表情', '光影'] },
  { search: 'still life', category: '静物画', tags: ['静物', '质感', '构图', '色彩'] },
  { search: 'seascape', category: '海景画', tags: ['海洋', '风景', '水彩', '氛围'] },
  { search: 'abstract', category: '抽象艺术', tags: ['抽象', '形式', '色彩', '构成'] },
  { search: 'urban landscape', category: '城市风景', tags: ['城市', '建筑', '街景', '现代'] },
  { search: 'religious painting', category: '宗教艺术', tags: ['宗教', '神圣', '金色', '古典'] },
  { search: 'flower painting', category: '花卉艺术', tags: ['花卉', '自然', '色彩', '细节'] },
  { search: 'figure drawing', category: '人体素描', tags: ['人体', '素描', '线条', '比例'] },
  { search: 'scientific illustration', category: '科学插图', tags: ['科学', '精密', '设计', '插画'] },
];

function fetchJSON(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const opts = { timeout: 20000, rejectUnauthorized: false, headers: { 'User-Agent': 'aesthetic-daily', ...headers } };
    https.get(url, opts, (res) => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (e) { reject(new Error('JSON parse failed: ' + e.message)); }
      });
    }).on('error', reject).on('timeout', function () { this.destroy(); reject(new Error('timeout')); });
  });
}

function fetchBinary(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 30000, rejectUnauthorized: false, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, { timeout: 30000, rejectUnauthorized: false }, (res2) => {
          let chunks = []; res2.on('data', c => chunks.push(c));
          res2.on('end', () => resolve(Buffer.concat(chunks)));
        }).on('error', reject);
        return;
      }
      let chunks = []; res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject).on('timeout', function () { this.destroy(); reject(new Error('timeout')); });
  });
}

function ghPut(path, content, sha) {
  return new Promise((resolve, reject) => {
    const body = { message: 'Update ' + path.split('/').pop(), content: Buffer.from(content, 'utf8').toString('base64'), branch: BRANCH };
    if (sha) body.sha = sha;
    const data = JSON.stringify(body);
    const opts = {
      hostname: 'api.github.com', path: '/repos/' + REPO + '/contents/' + path,
      method: 'PUT', timeout: 30000,
      headers: {
        'Authorization': 'Bearer ' + TOKEN, 'User-Agent': 'aesthetic-daily',
        'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data),
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    const req = https.request(opts, (res) => {
      let chunks = []; res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        if (res.statusCode === 200 || res.statusCode === 201) resolve(JSON.parse(body));
        else reject(new Error('HTTP ' + res.statusCode + ': ' + body.substring(0, 100)));
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(data);
    req.end();
  });
}

function ghPutBinary(path, buffer, sha) {
  return new Promise((resolve, reject) => {
    const body = { message: 'Upload ' + path.split('/').pop(), content: buffer.toString('base64'), branch: BRANCH };
    if (sha) body.sha = sha;
    const data = JSON.stringify(body);
    const opts = {
      hostname: 'api.github.com', path: '/repos/' + REPO + '/contents/' + path,
      method: 'PUT', timeout: 30000,
      headers: {
        'Authorization': 'Bearer ' + TOKEN, 'User-Agent': 'aesthetic-daily',
        'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data),
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    const req = https.request(opts, (res) => {
      let chunks = []; res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        if (res.statusCode === 200 || res.statusCode === 201) resolve(JSON.parse(body));
        else reject(new Error('HTTP ' + res.statusCode + ': ' + body.substring(0, 100)));
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(data);
    req.end();
  });
}

async function getSha(path) {
  try {
    const data = await fetchJSON('https://api.github.com/repos/' + REPO + '/contents/' + path, { 'Authorization': 'Bearer ' + TOKEN });
    return data.sha;
  } catch (e) { return null; }
}

const analysisTemplates = {
  composition: [
    '画面采用经典的三分法构图，主体位于黄金分割点，引导线自然地将视线引向视觉焦点。',
    '不对称的平衡结构，画面左侧大面积留白与右侧密集元素形成对比，产生呼吸感。',
    '采用框架式构图，利用前景元素框住主体，创造了画中画的纵深感。',
    '对角线构图贯穿画面，从左下到右上形成动态视觉流，增加了画面张力。',
    '对称构图带来稳定与庄重的视觉感受，水平线与垂直线交织出建筑般的结构感。',
    '层层递进的空间布局，近景、中景、远景三个层次清晰分明。',
  ],
  color: [
    '整体以暖色调为主，金黄色的光线与深褐色阴影形成丰富的明暗层次。',
    '冷色调主导画面，蓝灰色系营造出静谧而深邃的氛围，微弱的暖色点缀成为视觉亮点。',
    '色彩的饱和度经过精心控制，低饱和度的和谐配色让观者感受到高级的视觉舒适感。',
    '补色对比鲜明——红与绿、蓝与橙的碰撞在画面中形成强烈的视觉冲击力。',
    '近似色系的使用让画面呈现统一的调性，细微的色相变化考验的是对色彩的敏感度。',
    '黑白灰的明度序列严格，从最亮到最暗的跨度赋予了画面雕塑般的体积感。',
  ],
  aesthetic: [
    '这件作品提醒我们：真正的美不在于复制现实，而在于通过艺术家的视角重新诠释世界。',
    '经典之所以成为经典，是因为它在特定的历史时刻捕捉到了某种永恒的人类情感。',
    '细节不是堆砌，而是有选择的强调。艺术家知道什么时候该画什么、不该画什么。',
    '伟大的作品总有一种"未完成"的活力——它留给观者想象和参与的空间。',
    '观察这幅画的光线处理：光的落点就是艺术家希望你停留的地方。这就是视觉叙事。',
    '这幅画的美学力量在于它的"克制"——在应该停笔的地方停下来，比画更多需要更大的勇气。',
  ]
};

async function generateDailyContent(searchTerm, idx) {
  // Fetch from Met Museum API
  const search = await fetchJSON(
    `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(searchTerm)}&hasImages=true&size=15`
  );
  const ids = (search.objectIDs || []).filter((_, i) => i < 5);
  
  let works = [];
  for (const id of ids) {
    if (works.length >= 1) break;
    try {
      const obj = await fetchJSON(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
      const imgUrl = obj.primaryImageSmall || obj.primaryImage || '';
      if (!imgUrl) continue;
      
      const title = obj.title || 'Untitled';
      const artist = obj.artistDisplayName || obj.culture || obj.period || 'Unknown';
      const date = obj.objectDate || '';
      const medium = obj.medium || '';
      
      works.push({ id, title, artist, date, medium, imgUrl });
    } catch (e) { continue; }
  }
  return works;
}

async function main() {
  console.log('=== Aesthetic Daily Scraper ===');
  console.log('Repo:', REPO);
  console.log('Date:', new Date().toISOString());
  
  const dayCount = Math.floor((Date.now() - new Date('2026-06-22').getTime()) / 86400000) + 1;
  const themeIdx = dayCount % themes.length;
  const theme = themes[themeIdx];
  
  console.log('Theme:', theme.category, 'Search:', theme.search);
  
  // Generate new content
  const works = await generateDailyContent(theme.search, themeIdx);
  console.log('Found', works.length, 'works');
  
  if (works.length === 0) {
    console.log('No works found, keeping existing content');
    // For daily updates with no new content, we still need to bump the day
    // Read existing and just update the day
    const existingData = await fetchJSON(
      'https://raw.githubusercontent.com/' + REPO + '/main/js/data.json'
    ).catch(() => null);
    if (existingData && existingData.theme) {
      existingData.theme.day = dayCount;
      const dataStr = JSON.stringify(existingData, null, 2);
      const sha = await getSha('js/data.json');
      if (sha) await ghPut('js/data.json', dataStr, sha);
      console.log('Updated day count only');
    }
    return;
  }
  
  // Download images
  const today = new Date().toISOString().split('T')[0];
  const imgDir = '/tmp/aesthetic-images';
  if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
  
  for (let i = 0; i < Math.min(works.length, 5); i++) {
    try {
      const buf = await fetchBinary(works[i].imgUrl);
      if (buf.length > 5000 && buf.length < 1000000) {
        const fname = `daily-${today}-${i}.jpg`;
        fs.writeFileSync(path.join(imgDir, fname), buf);
        works[i]._localFile = fname;
        console.log('Downloaded', fname, buf.length, 'bytes');
      }
    } catch (e) {
      console.log('Failed to download', works[i].imgUrl.substring(0, 60));
    }
  }
  
  // Upload images to repo
  for (const w of works) {
    if (!w._localFile) continue;
    try {
      const buf = fs.readFileSync(path.join(imgDir, w._localFile));
      const existingSha = await getSha('images/' + w._localFile);
      await ghPutBinary('images/' + w._localFile, buf, existingSha || undefined);
      console.log('Uploaded', w._localFile);
    } catch (e) {
      console.log('Failed to upload', w._localFile, e.message.substring(0, 50));
    }
  }
  
  // Build data.json content
  const dayTheme = {
    id: `daily-${today}`,
    day: dayCount,
    category: theme.category,
    title: theme.category + '的美学',
    subtitle: theme.category + ' · 每日审美提升',
    colorHex: '#4A4A4A',
    works: works.slice(0, 5).map((w, i) => ({
      id: `w-${String(i + 1).padStart(2, '0')}`,
      imageName: w._localFile
        ? `https://cdn.jsdelivr.net/gh/xjm39323-source/aesthetic-daily@main/images/${w._localFile}`
        : w.imgUrl,
      title: w.title.substring(0, 60),
      author: w.artist + ' · ' + (w.date || '时期不详'),
      year: w.medium || '',
      category: theme.category,
      tags: theme.tags,
      composition: analysisTemplates.composition[i % analysisTemplates.composition.length],
      colorAnalysis: analysisTemplates.color[i % analysisTemplates.color.length],
      aestheticNote: analysisTemplates.aesthetic[i % analysisTemplates.aesthetic.length]
    }))
  };
  
  const dataStr = JSON.stringify({ theme: dayTheme }, null, 2);
  console.log('Generated data.json:', dataStr.length, 'chars');
  
  // Update data.json
  const dataSha = await getSha('js/data.json');
  const dataResult = await ghPut('js/data.json', dataStr, dataSha || undefined);
  console.log('Updated js/data.json:', dataResult.content.sha.substring(0, 8));
  
  // Read current index.html, update INLINE_DATA
  const currentHtml = await (await fetch(
    'https://raw.githubusercontent.com/' + REPO + '/main/index.html',
    { 'Authorization': 'Bearer ' + TOKEN }
  )).catch(() => null);
  
  if (currentHtml) {
    // This is a simplified approach - in production we'd rebuild the HTML
    console.log('Would update index.html with new INLINE_DATA');
  }
  
  console.log('=== Daily Build Complete ===');
}

main().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
