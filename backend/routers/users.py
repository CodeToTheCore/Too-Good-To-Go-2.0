from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
import models, schemas, auth_utils

router = APIRouter()

@router.patch("/profile", response_model=schemas.UserOut)
def update_profile(
    full_name: Optional[str] = None,
    phone: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    if full_name is not None:
        current_user.full_name = full_name
    if phone is not None:
        current_user.phone = phone
    db.commit()
    db.refresh(current_user)
    return current_user

@router.patch("/dietary", response_model=schemas.UserOut)
def update_dietary(
    prefs: schemas.DietaryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    # stored as a simple comma-separated string (no JSON column needed for SQLite)
    current_user.dietary_prefs = ",".join(prefs.dietary_prefs or [])
    current_user.auto_cancel_conflicts = bool(prefs.auto_cancel_conflicts)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/favorites", response_model=List[int])
def get_favorites(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    favs = db.query(models.Favorite).filter(models.Favorite.user_id == current_user.id).all()
    return [f.store_id for f in favs]

@router.post("/favorites/{store_id}")
def toggle_favorite(
    store_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    fav = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id,
        models.Favorite.store_id == store_id,
    ).first()
    if fav:
        db.delete(fav)
        db.commit()
        return {"favorited": False}
    db.add(models.Favorite(user_id=current_user.id, store_id=store_id))
    db.commit()
    return {"favorited": True}
