from fastapi import APIRouter, Body

router = APIRouter()

@router.post("/recommend")
def recommend(data: dict = Body(...)):
    weak_areas = data.get("weak_areas", [])
    recommendations = []

    for topic in weak_areas:
        search_query = topic.replace(" ", "+")
        youtube_url = f"https://www.youtube.com/results?search_query={search_query}"

        recommendations.append({
            "topic": topic,
            "youtube": youtube_url
        })

    return {"recommendations": recommendations}