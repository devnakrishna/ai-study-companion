from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.quiz_routes import router as quiz_router
from app.routes.evaluation_routes import router as evaluation_router
from app.routes.recommend_routes import router as recommend_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://192.168.29.173:3000"
        ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "AI Quiz Backend Running "}


app.include_router(quiz_router)
app.include_router(evaluation_router)
app.include_router(recommend_router)