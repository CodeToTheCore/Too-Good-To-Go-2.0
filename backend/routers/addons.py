from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth_utils

router = APIRouter()

@router.get("/store/{store_id}", response_model=List[schemas.AddOnOut])
def list_store_addons(store_id: int, db: Session = Depends(get_db)):
    return db.query(models.AddOn).filter(
        models.AddOn.store_id == store_id, models.AddOn.is_active == True
    ).all()

@router.post("/", response_model=schemas.AddOnOut)
def create_addon(
    data: schemas.AddOnCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    store = db.query(models.Store).filter(models.Store.id == data.store_id).first()
    if not store:
        raise HTTPException(404, "Store not found")
    addon = models.AddOn(**data.dict())
    db.add(addon)
    db.commit()
    db.refresh(addon)
    return addon

@router.delete("/{addon_id}")
def delete_addon(
    addon_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    addon = db.query(models.AddOn).filter(models.AddOn.id == addon_id).first()
    if not addon:
        raise HTTPException(404, "Add-on not found")
    addon.is_active = False
    db.commit()
    return {"deleted": True}
