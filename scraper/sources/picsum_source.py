import requests

def fetch(count=5):
    results = []
    try:
        r = requests.get(f"https://picsum.photos/v2/list?limit={count * 2}", timeout=10)
        data = r.json()
        CATEGORIES = ["摄影", "自然/微距", "建筑/空间", "时尚", "插画", "平面设计"]
        for i, photo in enumerate(data):
            if len(results) >= count: break
            cat = CATEGORIES[i % len(CATEGORIES)]
            pid = photo.get("id", "")
            author = photo.get("author", "Unknown")
            url = photo.get("download_url", "")
            if url:
                results.append({
                    "imageName": f"https://picsum.photos/seed/aesthetic{pid}/800/1000",
                    "title": f"随机摄影 #{pid}",
                    "author": author,
                    "category": cat,
                    "tags": ["picsum", "免费图片"],
                    "composition": "自由的构图，每一张照片都有其独特的视觉语言。",
                    "colorAnalysis": "自然色彩，每张图片都有自己独特的色调。",
                    "aestheticNote": "来自免费图片库 picsum.photos 的高质量作品。每天更新。"
                })
    except Exception as e:
        print(f"  picsum error: {e}")
    return results