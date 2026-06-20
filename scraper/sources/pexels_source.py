import requests
from config import PEXELS_KEY

HEADERS = {"Authorization": PEXELS_KEY}
CATEGORY_MAP = {
    "nature": ("自然/微距", "nature", "landscape"),
    "architecture": ("建筑/空间", "architecture", "interior"),
    "fashion": ("时尚", "fashion", "people"),
    "photography": ("摄影", "street", "city", "travel"),
    "cg": ("三维/CG", "technology", "3d", "digital"),
    "design": ("平面设计", "minimalism", "pattern"),
}

def fetch(category_key="photography", count=5):
    queries = CATEGORY_MAP.get(category_key, ("摄影", "art"))
    label = queries[0]
    results = []
    for query in queries[1:]:
        if len(results) >= count: break
        try:
            r = requests.get(
                f"https://api.pexels.com/v1/search?query={query}&per_page={count*2}&orientation=portrait",
                headers=HEADERS, timeout=10
            )
            data = r.json()
            for photo in data.get("photos", []):
                if len(results) >= count: break
                results.append({
                    "imageName": photo["src"]["large"],
                    "title": photo.get("alt", ""),
                    "author": photo["photographer"],
                    "category": label,
                    "tags": [query, "pexels"],
                    "composition": "",
                    "colorAnalysis": "",
                    "aestheticNote": ""
                })
        except: continue
    return label, results