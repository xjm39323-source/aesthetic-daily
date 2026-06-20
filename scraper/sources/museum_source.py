import requests, random

MUSEUM_IDS = list(range(1, 500000, 1000))  # sample space
CATEGORY_TAGS = {
    "Painting": "插画",
    "Photograph": "摄影",
    "Architecture": "建筑/空间",
    "Textile": "时尚",
    "Drawing": "插画",
    "Print": "平面设计",
}

def fetch(count=3):
    results = []
    selected = random.sample(MUSEUM_IDS, min(count * 5, len(MUSEUM_IDS)))
    for oid in selected:
        if len(results) >= count: break
        try:
            r = requests.get(
                f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{oid}",
                timeout=10
            )
            data = r.json()
            if not data.get("primaryImage") or not data.get("isPublicDomain"):
                continue
            img = data["primaryImage"]
            title = data.get("title", "")
            artist = data.get("artistDisplayName") or "Unknown"
            medium = data.get("medium", "")
            tags = [data.get("classification", medium)]
            category = "插画"
            for k, v in CATEGORY_TAGS.items():
                if k.lower() in medium.lower() or k.lower() in str(tags).lower():
                    category = v; break
            results.append({
                "imageName": img,
                "title": title,
                "author": artist,
                "category": category,
                "tags": tags,
                "composition": "",
                "colorAnalysis": "",
                "aestheticNote": "来自大都会艺术博物馆公共领域藏品。"
            })
        except: continue
    return results