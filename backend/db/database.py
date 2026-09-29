"""SQLAlchemy async database setup.
Uses SQLite (aiosqlite) for local dev and MySQL (aiomysql) for production.
Set USE_SQLITE=true in .env to force SQLite regardless of other settings.
"""
import logging
from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from backend.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# ── Pick driver ───────────────────────────────────────────────────────────────
if settings.use_sqlite:
    DATABASE_URL = f"sqlite+aiosqlite:///{settings.sqlite_path}"
    connect_args = {"check_same_thread": False}
else:
    DATABASE_URL = (
        f"mysql+aiomysql://{settings.db_user}:{settings.db_password}"
        f"@{settings.db_host}:{settings.db_port}/{settings.db_name}"
    )
    connect_args = {}

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)


class Base(DeclarativeBase):
    pass


async def init_db():
    """Create all tables on startup and dynamically migrate missing columns for SQLite. Non-fatal if DB is unreachable."""
    from backend.models import user, trip  # noqa: F401 – register mappers
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

            if settings.use_sqlite:
                def _sync_migrate(sync_conn):
                    inspector = inspect(sync_conn)
                    tables = inspector.get_table_names()

                    if "users" in tables:
                        cols = {col["name"] for col in inspector.get_columns("users")}
                        if "password" not in cols:
                            sync_conn.execute(text("ALTER TABLE users ADD COLUMN password VARCHAR(255)"))
                        if "preferences" not in cols:
                            sync_conn.execute(text("ALTER TABLE users ADD COLUMN preferences VARCHAR(1000)"))
                        if "created_at" not in cols:
                            sync_conn.execute(text("ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT (datetime('now'))"))
                        if "updated_at" not in cols:
                            sync_conn.execute(text("ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT (datetime('now'))"))

                    if "trips" in tables:
                        cols = {col["name"] for col in inspector.get_columns("trips")}
                        if "raw_itinerary" not in cols:
                            sync_conn.execute(text("ALTER TABLE trips ADD COLUMN raw_itinerary TEXT"))
                        if "updated_at" not in cols:
                            sync_conn.execute(text("ALTER TABLE trips ADD COLUMN updated_at DATETIME DEFAULT (datetime('now'))"))

                    if "itinerary_items" in tables:
                        cols = {col["name"] for col in inspector.get_columns("itinerary_items")}
                        if "weather_risk" not in cols:
                            sync_conn.execute(text("ALTER TABLE itinerary_items ADD COLUMN weather_risk VARCHAR(100) DEFAULT 'low'"))
                        if "tips" not in cols:
                            sync_conn.execute(text("ALTER TABLE itinerary_items ADD COLUMN tips TEXT"))

                await conn.run_sync(_sync_migrate)

        logger.info("Database tables ready (%s).", DATABASE_URL.split("://")[0])
    except Exception as exc:
        logger.warning("DB init skipped (will retry on first request): %s", exc)


async def get_db():
    """FastAPI dependency that yields an async session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
