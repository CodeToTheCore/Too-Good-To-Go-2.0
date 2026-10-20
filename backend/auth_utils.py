from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
import models, os

import logging
import secrets

# Signs every login token. It must be secret: anyone who knows it can forge a
# login as any user. There used to be a hard-coded fallback here, which meant a
# server started without JWT_SECRET used a value printed in this public repo.
_PLACEHOLDERS = {"", "fallback_secret_change_me", "your_super_secret_jwt_key_change_this"}
SECRET_KEY = os.getenv("JWT_SECRET", "")
if SECRET_KEY in _PLACEHOLDERS:
    SECRET_KEY = secrets.token_urlsafe(32)
    logging.getLogger("tgtg.auth").warning(
        "JWT_SECRET is not set (or is still the example value). Using a random secret for "
        "this run, so everyone is logged out when the server restarts. Set JWT_SECRET in .env."
    )
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

import bcrypt

def hash_password(password: str) -> str:
    # Convert password to bytes, generate a salt, and hash it
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_password.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    # JWT spec / python-jose require "sub" to be a string, else decode raises JWTClaimsError.
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise credentials_exception
        user_id = int(sub)
    except (JWTError, ValueError, TypeError):
        raise credentials_exception
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

# ---------------------------------------------------------------------------
# Ownership checks. Logging in proves who you are; these prove the store is yours.
# Every route that changes a store's bags, add-ons, or orders goes through them.
# ---------------------------------------------------------------------------

def require_store_owner(db: Session, store_id: int, user: models.User) -> models.Store:
    """Returns the store if this user owns it. 404 if it doesn't exist, 403 if it isn't theirs."""
    store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    if store.owner_id != user.id:
        raise HTTPException(status_code=403, detail="You can only manage your own store")
    return store


def order_store_ids(db: Session, order: models.Order) -> set[int]:
    """Orders don't store a store id directly; it comes through their bag and add-on items."""
    ids = set()
    for item in db.query(models.OrderItem).filter(models.OrderItem.order_id == order.id).all():
        if item.bag_id:
            bag = db.query(models.MagicBag).filter(models.MagicBag.id == item.bag_id).first()
            if bag:
                ids.add(bag.store_id)
        if item.addon_id:
            addon = db.query(models.AddOn).filter(models.AddOn.id == item.addon_id).first()
            if addon:
                ids.add(addon.store_id)
    return ids
