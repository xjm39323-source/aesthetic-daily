import requests
from config import UNSPLASH_KEY

HEADERS = {"Authorization": f"Client-ID {UNSPLASH_KEY}"}

def fetch(query="architecture", count=5):
    results = []
    try:
        r = requests.get(
            f"https://api.unsplash.com/search/photos?query={query}&per_page={count*2}&orientation=portrait",
            headers=HEADERS, timeout=10
        )
        data = r.json()
        for photo in data.get("results", []):
            if len(results) >= count: break
            results.append({
                "imageName": photo["urls"]["regular"],
                "title": photo.get("description") or photo.get("alt_description") or "",
                "author": photo["user"]["name"],
                "category": "",
                "tags": [query, "unsplash"],
                "composition": "",
                "colorAnalysis": "",
                "aestheticNote": ""
            })
    except: pass
    return results