import requests, random

ANIME_IDS = [
    1, 5, 6, 7, 8, 15, 21, 30, 31, 52, 73, 80, 100, 110, 117,
    153, 164, 200, 225, 302, 511, 925, 1009, 1105, 1175, 1210,
    1215, 1363, 1535, 1544, 1648, 1678, 2001, 3174, 3297, 5114,
    5680, 6351, 1579, 2472
]

def fetch(count=5):
    results = []
    selected = random.sample(ANIME_IDS, min(count * 2, len(ANIME_IDS)))
    for aid in selected:
        if len(results) >= count: break
        try:
            r = requests.get(f"https://api.jikan.moe/v4/anime/{aid}/pictures", timeout=10)
            data = r.json()
            for pic in data.get("data", []):
                if len(results) >= count: break
                img = pic.get("jpg", {}).get("large_image_url", "")
                if img:
                    results.append({
                        "imageName": img,
                        "title": "",
                        "author": "Jikan / MyAnimeList",
                        "category": "动漫",
                        "tags": ["anime", "screenshot"],
                        "composition": "",
                        "colorAnalysis": "",
                        "aestheticNote": ""
                    })
        except: continue
        import time; time.sleep(0.5)
    return results