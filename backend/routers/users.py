"""Users router – registration, login, and profile retrieval."""
from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import bcrypt

from backend.db.database import get_db
from backend.models.user import User
from backend.models.schemas import UserCreate, UserLogin, UserOut

router = APIRouter()

# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------


def _hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _verify_password(plain: str, hashed: str) -> bool:
    if not hashed:
        return False
    if hashed.startswith(("$2a$", "$2b$", "$2y$")):
        try:
            return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
        except Exception:
            return False
    return plain == hashed


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/users", response_model=UserOut, status_code=201)
async def create_user(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    # Check for duplicate email
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    # Hash the password before storing
    data = payload.model_dump()
    if data.get("password"):
        data["password"] = _hash_password(data["password"])

    user = User(**data)
    db.add(user)
    await db.flush()   # populates user.id; session auto-commits via get_db
    return user


@router.post("/login", response_model=UserOut)
async def login_user(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate a user and return their profile."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.password:
        # Normal case: bcrypt-hashed password stored
        if not _verify_password(payload.password, user.password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
    else:
        # Legacy / no-password account – deny login if password provided
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return user


@router.get("/users/{user_id}", response_model=UserOut)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Fetch a user by ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
