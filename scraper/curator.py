import random, json
from datetime import datetime

CATEGORIES = [
    "电影美学", "三维/CG", "摄影", "动漫", "平面设计",
    "建筑/空间", "插画", "时尚", "UI/UX", "自然/微距"
]

THEME_TEMPLATES = {
    "电影美学": ["光影之美", "色彩叙事", "经典构图", "导演视觉风格"],
    "三维/CG": ["数字梦境", "未来主义", "渲染艺术", "虚拟现实"],
    "摄影": ["决定性瞬间", "光影对话", "街头叙事", "黑白诗篇"],
    "动漫": ["日本动画美学", "吉卜力式世界", "赛璐珞之梦", "当代作画"],
    "平面设计": ["极简主义", "瑞士风格", "字体与留白", "日式设计"],
    "建筑/空间": ["光线与空间", "材质对话", "几何韵律", "现代主义"],
    "插画": ["数字插画", "水彩意境", "概念设计", "线条与色彩"],
    "时尚": ["高级定制", "街头风格", "配色灵感", "极简穿搭"],
    "UI/UX": ["界面美学", "交互动效", "设计系统", "极简UI"],
    "自然/微距": ["微观世界", "自然几何", "光影斑驳", "色彩自然"]
}

def create_daily_theme(pool):
    day_num = (datetime.now() - datetime(2025, 1, 1)).days
    cat = CATEGORIES[day_num % len(CATEGORIES)]
    theme_name = random.choice(THEME_TEMPLATES.get(cat, ["精选"]))
    cat_pool = [w for w in pool if w.get("category", "").startswith(cat[:2])] or pool
    selected = random.sample(cat_pool, min(10, len(cat_pool)))
    if len(selected) < 10:
        extras = random.sample(pool, min(10 - len(selected), len(pool)))
        selected.extend(extras)

    # Add analysis text
    for w in selected:
        if not w.get("composition"):
            w["composition"] = random.choice([
                "三分法构图，主体置于视觉重心，引导线增强空间深度。",
                "对称构图，画面平衡稳定，中心主体突出。",
                "对角线构图，动感十足，引导观者视线自然流动。",
                "框架构图，利用前景形成画中画效果，增强空间层次。",
            ])
        if not w.get("colorAnalysis"):
            w["colorAnalysis"] = random.choice([
                "低饱和度色调为主，营造沉稳安静的氛围。",
                "冷暖对比强烈，制造视觉张力。",
                "单色系配色，统一和谐，高级感强。",
                "邻近色搭配，柔和过渡，舒适自然。",
            ])
        if not w.get("aestheticNote"):
            w["aestheticNote"] = random.choice([
                "画面的留白使人产生遐想，主体虽小却分量十足。",
                "光影的处理极为细腻，层层递进，赋予画面立体感。",
                "看似随意实则精心，每一个元素都恰到好处。",
                "细节之处见功力，整体的把控力令人叹服。",
            ])

    return {
        "id": f"auto-day-{day_num}",
        "day": day_num,
        "category": cat,
        "title": theme_name,
        "subtitle": f"{cat} · 每日审美提升",
        "colorHex": random.choice(["#0F3460", "#8B7355", "#2D5016", "#A0522D", "#4A4A4A"]),
        "works": selected[:10]
    }