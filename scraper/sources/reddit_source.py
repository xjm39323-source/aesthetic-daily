import requests, random

SUBREDDITS = {
    "摄影": ["ArtPorn", "ExposurePorn", "CityPorn", "EarthPorn"],
    "建筑/空间": ["ArchitecturePorn", "RoomPorn", "DesignPorn"],
    "自然/微距": ["NaturePorn", "MacroPorn", "BotanicalPorn"],
    "平面设计": ["DesignPorn", "GraphicDesign", "typography"],
    "插画": ["ImaginaryLeviathans", "ImaginaryLandscapes", "Art"],
    "时尚": ["streetwear", "malefashion", "femalefashion"],
}

def fetch(category="摄影", count=3):
    results = []
    subs = SUBREDDITS.get(category, ["ArtPorn"])
    random.shuffle(subs)
    for sub in subs:
        if len(results) >= count: break
        try:
            r = requests.get(
                f"https://www.reddit.com/r/{sub}/hot.json?limit=15",
                headers={"User-Agent": "AestheticDaily/1.0"}, timeout=10
            )
            data = r.json()
            for post in data.get("data", {}).get("children", []):
                if len(results) >= count: break
                p = post["data"]
                if p.get("url", "").endswith((".jpg", ".png", ".jpeg", ".webp")):
                    results.append({
                        "imageName": p["url"],
                        "title": p.get("title", ""),
                        "author": f"u/{p.get('author', 'unknown')}",
                        "category": category,
                        "tags": [sub],
                        "composition": "",
                        "colorAnalysis": "",
                        "aestheticNote": ""
                    })
        except: continue
    return results