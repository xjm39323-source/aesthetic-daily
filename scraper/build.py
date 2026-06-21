import json, os
from config import SOURCES
from curator import create_daily_theme, CATEGORIES

def main():
    pool = []

    # Fetch from all available sources
    if SOURCES.get("pexels"):
        from sources.pexels_source import fetch as pexels_fetch
        for cat in ["nature", "architecture", "fashion", "photography", "cg", "design"]:
            label, items = pexels_fetch(cat, 3)
            for item in items:
                if not item.get("category"):
                    item["category"] = label
            pool.extend(items)
            print(f"  Pexels/{cat}: {len(items)} works")

    if SOURCES.get("jikan"):
        from sources.jikan_source import fetch as jikan_fetch
        items = jikan_fetch(5)
        pool.extend(items)
        print(f"  Jikan/Anime: {len(items)} works")

    if SOURCES.get("reddit"):
        from sources.reddit_source import fetch as reddit_fetch
        for cat in list(range(min(4, len(CATEGORIES)))):
            items = reddit_fetch(cat, 3)
            pool.extend(items)
            print(f"  Reddit/{cat}: {len(items)} works")

    if SOURCES.get("museum"):
        from sources.museum_source import fetch as museum_fetch
        items = museum_fetch(5)
        pool.extend(items)
        print(f"  Museum: {len(items)} works")

    if SOURCES.get("unsplash"):
        from sources.unsplash_source import fetch as unsplash_fetch
        for q in ["architecture", "nature", "interior", "street-photography"]:
            items = unsplash_fetch(q, 3)
            for item in items:
                if not item.get("category"):
                    item["category"] = {"architecture":"建筑/空间","nature":"自然/微距","interior":"建筑/空间","street-photography":"摄影"}.get(q, "摄影")
            pool.extend(items)
            print(f"  Unsplash/{q}: {len(items)} works")

    if SOURCES.get("tmdb"):
        from sources.tmdb_source import fetch as tmdb_fetch
        items = tmdb_fetch(5)
        pool.extend(items)
        print(f"  TMDB: {len(items)} works")

    # Fallback: if nothing fetched, use dummy data
    if not pool:
        print("  No data from any source! Using built-in fallback.")
        for i in range(10):
            pool.append({
                "id": f"fallback-{i}",
                "imageName": "",
                "title": f"审美作品 #{i+1}",
                "author": "待补充",
                "year": "",
                "category": CATEGORIES[i % len(CATEGORIES)],
                "tags": ["待补充"],
                "composition": "作品的构图精巧，体现了创作者对视觉语言的深刻理解。",
                "colorAnalysis": "色彩搭配和谐，色调统一中富有变化。",
                "aestheticNote": "这是一件值得反复品味的作品，每一次观看都有新的发现。"
            })

    # Create daily theme
    theme = create_daily_theme(pool)

    # Save
    output = {"theme": theme}
    os.makedirs("../js", exist_ok=True)
    with open("../js/data.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"\n✅ Theme saved: Day {theme['day']} - {theme['title']} ({len(theme['works'])} works)")
    print(f"   Pool size: {len(pool)} total works fetched")

if __name__ == "__main__":
    main()


