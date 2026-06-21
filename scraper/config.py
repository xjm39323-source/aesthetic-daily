import os

# Free APIs - get keys from env vars (GitHub Secrets)
UNSPLASH_KEY = os.environ.get("UNSPLASH_KEY", "")
PEXELS_KEY = os.environ.get("PEXELS_KEY", "")
TMDB_KEY = os.environ.get("TMDB_KEY", "")

# No API key needed
JIKAN_BASE = "https://api.jikan.moe/v4"
REDDIT_BASE = "https://www.reddit.com/r"
MUSEUM_BASE = "https://collectionapi.metmuseum.org/public/collection/v1"

# Sources to use - disable if no key
SOURCES = {
    "picsum": True,   # no key needed, always on
    "pexels": True,  # try without key too
    "unsplash": bool(UNSPLASH_KEY),
    "tmdb": bool(TMDB_KEY),
    "jikan": True,    # no key needed
    "reddit": True,   # no key needed
    "museum": True,   # no key needed
}

