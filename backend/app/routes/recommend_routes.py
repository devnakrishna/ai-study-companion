import urllib.request
import urllib.parse
import re
from fastapi import APIRouter, Body, Depends
from app.core.security import get_current_user

router = APIRouter()


def get_first_youtube_video(topic: str) -> str:
    query = f"{topic} tutorial"
    encoded_query = urllib.parse.quote(query)
    url = f"https://www.youtube.com/results?search_query={encoded_query}"
    try:
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            html = response.read().decode('utf-8')
            video_ids = re.findall(r"\"videoId\":\"(\S{11})\"", html)
            if not video_ids:
                video_ids = re.findall(r"watch\?v=(\S{11})", html)
            if video_ids:
                return f"https://www.youtube.com/watch?v={video_ids[0]}"
    except Exception as e:
        print("YouTube recommendation scraping failed:", e)
    return url


@router.post("/recommend")
def recommend(data: dict = Body(...), current_user = Depends(get_current_user)):
    weak_areas = data.get("weak_areas", [])
    recommendations = []

    for topic in weak_areas:
        youtube_url = get_first_youtube_video(topic)

        recommendations.append({
            "topic": topic,
            "youtube": youtube_url
        })

    return {"recommendations": recommendations}