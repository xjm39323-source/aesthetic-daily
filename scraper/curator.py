import random
from datetime import datetime

CATEGORIES = [
    "电影美学", "三维/CG", "摄影", "动漫", "平面设计",
    "建筑/空间", "插画", "时尚", "UI/UX", "自然/微距"
]

THEME_TEMPLATES = {
    "摄影": ["光影对话", "构图的力量", "街头叙事", "色彩之美"],
    "建筑/空间": ["线与面", "几何韵律", "材质之美", "光的空间"],
    "自然/微距": ["微观世界", "自然几何", "光影斑驳", "色彩自然"],
    "动漫": ["动画美学", "色彩叙事", "作画赏析", "场景之美"],
    "电影美学": ["光影之美", "色彩叙事", "经典构图", "镜头语言"],
    "平面设计": ["极简主义", "字体之美", "品牌视觉", "海报赏析"],
    "插画": ["数字插画", "水彩意境", "概念设计", "线条与色彩"],
    "时尚": ["色彩搭配", "材质对话", "廓形之美", "风格解读"],
    "三维/CG": ["数字梦境", "渲染艺术", "光影质感", "虚拟现实"],
    "UI/UX": ["界面美学", "交互动效", "信息层级", "设计系统"],
}

COMPOSITIONS = [
    "三分法构图，主体置于视觉重心，引导线增强空间深度。",
    "对称构图，画面平衡稳定，中心主体突出。",
    "对角线构图，动感十足，引导观者视线自然流动。",
    "框架构图，利用前景形成画中画效果，增强空间层次。",
    "引导线运用娴熟，将视线引向画面深处的视觉焦点。",
    "大面积留白，主体偏下放置，营造空旷寂寥的意境。",
]

COLOR_ANALYSES = [
    "低饱和度色调为主，营造沉稳安静的氛围。",
    "冷暖对比强烈，制造视觉张力。",
    "单色系配色，统一和谐，高级感强。",
    "邻近色搭配，柔和过渡，舒适自然。",
    "色彩克制而富有表现力，形成微妙的平衡。",
    "高饱和度点缀色在整体低饱和背景中跳脱而出。",
]

AESTHETIC_NOTES = [
    "好的构图不是规则本身，而是规则服务于情感。",
    "留白不是空白，而是给观者的想象力预留的空间。",
    "当光线、线条和色彩三者完美交汇的瞬间，平凡变成不凡。",
    "少即是多，在克制中见丰富，这是审美的高级阶段。",
    "每一个出现在画面中的元素都应有不可替代的位置。",
    "真正的审美力不是知道多少规则，而是感受有多少种可能。",
]

def create_daily_theme(pool):
    day_num = (datetime.now() - datetime(2025, 1, 1)).days
    cat = CATEGORIES[day_num % len(CATEGORIES)]
    theme_name = random.choice(THEME_TEMPLATES.get(cat, ["精选"]))

    cat_pool = [w for w in pool if w.get("category", "").startswith(cat[:2])] or pool
    safe_pool = cat_pool if len(cat_pool) > 0 else pool
    selected = random.sample(safe_pool, min(10, len(safe_pool))) if len(safe_pool) >= 2 else safe_pool[:]

    if len(selected) < 10 and len(pool) >= 2:
        extras = random.sample(pool, min(10 - len(selected), len(pool)))
        selected.extend(extras)

    for w in selected:
        w["composition"] = w.get("composition") or random.choice(COMPOSITIONS)
        w["colorAnalysis"] = w.get("colorAnalysis") or random.choice(COLOR_ANALYSES)
        w["aestheticNote"] = w.get("aestheticNote") or random.choice(AESTHETIC_NOTES)
        w["year"] = w.get("year", "")
        w["tags"] = w.get("tags", [cat])

    return {
        "id": f"auto-day-{day_num}",
        "day": day_num,
        "category": cat,
        "title": theme_name,
        "subtitle": f"{cat} · 每日审美提升",
        "colorHex": random.choice(["#0F3460", "#8B7355", "#2D5016", "#A0522D", "#4A4A4A"]),
        "works": selected[:10]
    }