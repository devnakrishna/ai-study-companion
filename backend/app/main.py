from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.init_db import init_db
from app.routes.login_routes import router as login_router
from app.routes.quiz_routes import router as quiz_router
from app.routes.evaluation_routes import router as evaluation_router
from app.routes.recommend_routes import router as recommend_router
from app.routes.report_routes import router as report_router
from app.routes.dashboard_routes import router as dashboard_router
from app.routes.history_routes import router as history_router
from app.routes import admin_routes
from app.routes import topic_performance_routes

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield
   
app = FastAPI(lifespan=lifespan)

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


app.include_router(login_router)
app.include_router(quiz_router)
app.include_router(evaluation_router)
app.include_router(recommend_router)
app.include_router(topic_performance_routes.router)
app.include_router(admin_routes.router)
app.include_router(dashboard_router)
app.include_router(report_router)
app.include_router(history_router)