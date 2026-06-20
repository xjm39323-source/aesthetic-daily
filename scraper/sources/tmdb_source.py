import requests, random
from config import TMDB_KEY

GENRES = {28: "动作", 12: "冒险", 16: "动画", 18: "剧情",
          27: "恐怖", 53: "惊悚", 14: "奇幻", 878: "科幻",
          80: "犯罪", 35: "喜剧", 10749: "爱情", 9648: "悬疑",
          10402: "音乐", 10751: "家庭"}

def fetch(count=5):
    results = []
    if not TMDB_KEY: return results
    pages = random.sample(range(1, 100), 3)
    for page in pages:
        if len(results) >= count: break
        try:
            r = requests.get(
                f"https://api.themoviedb.org/3/movie/popular?page={page}&api_key={TMDB_KEY}",
                timeout=10
            )
            movies = r.json().get("results", [])
            for movie in movies:
                if len(results) >= count: break
                img = movie.get("backdrop_path") or movie.get("poster_path")
                if not img: continue
                genre_names = [GENRES.get(g, "") for g in movie.get("genre_ids", [])]
                results.append({
                    "imageName": f"https://image.tmdb.org/t/p/w1280{img}",
                    "title": movie.get("title", ""),
                    "author": f"TMDB · {', '.join(genre_names)}",
                    "category": "电影美学",
                    "tags": genre_names,
                    "composition": "",
                    "colorAnalysis": "",
                    "aestheticNote": f"评分: {movie.get('vote_average', 'N/A')} · 上映: {movie.get('release_date', '未知')}"
                })
        except: continue
    return results