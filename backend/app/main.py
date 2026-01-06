from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from .routers import auth, tickets, users, notifications, settings, ticket_config
from .scheduler import run_scheduled_tasks


def create_app() -> FastAPI:
    app = FastAPI(title="Système de gestion des tickets")

    # Configuration CORS pour permettre les requêtes depuis le frontend
    # IMPORTANT: Le middleware CORS doit être ajouté AVANT les routers
    # En développement, autoriser toutes les origines locales
    cors_origins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8081",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # IMPORTANT: En FastAPI, l'ordre des middlewares est inversé (le dernier ajouté est exécuté en premier)
    # Ajouter le middleware CORS en DERNIER pour qu'il soit exécuté en PREMIER
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,  # Liste des origines autorisées
        allow_credentials=True,  # Autoriser les credentials
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
        allow_headers=["*"],  # Autoriser tous les headers
        expose_headers=["*"],
        max_age=3600,
    )
    
    # Middleware HTTP personnalisé APRÈS le CORSMiddleware pour garantir les headers
    # (sera exécuté APRÈS le CORSMiddleware car ajouté après)
    @app.middleware("http")
    async def ensure_cors_headers(request: Request, call_next):
        origin = request.headers.get("origin")
        response = await call_next(request)
        
        # Forcer l'ajout du header Access-Control-Allow-Origin si l'origine est autorisée
        if origin and origin in cors_origins:
            # Vérifier si le header n'est pas déjà présent
            if "Access-Control-Allow-Origin" not in response.headers:
                response.headers["Access-Control-Allow-Origin"] = origin
            # S'assurer que les autres headers CORS sont présents
            if "Access-Control-Allow-Credentials" not in response.headers:
                response.headers["Access-Control-Allow-Credentials"] = "true"
        
        return response

    # Routers principaux
    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(tickets.router, prefix="/tickets", tags=["tickets"])
    app.include_router(users.router, prefix="/users", tags=["users"])
    app.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
    app.include_router(settings.router, tags=["settings"])
    app.include_router(ticket_config.router)

    # Configurer le scheduler pour exécuter les tâches planifiées
    scheduler = BackgroundScheduler()
    # Exécuter toutes les heures
    scheduler.add_job(
        run_scheduled_tasks,
        trigger=CronTrigger(minute=0),  # Toutes les heures à la minute 0
        id='run_scheduled_tasks',
        name='Exécuter les tâches planifiées (rappels et clôtures)',
        replace_existing=True
    )
    scheduler.start()

    return app


app = create_app()


