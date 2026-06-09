from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth_utils

router = APIRouter()

@router.get("/", response_model=List[schemas.BagOut])
def get_all_bags(db: Session = Depends(get_db)):
    return db.query(models.MagicBag).filter(
        models.MagicBag.is_active == True,
        models.MagicBag.quantity_available > 0
    ).all()

@router.post("/", response_model=schemas.BagOut)
def create_bag(
    bag_data: schemas.BagCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    bag = models.MagicBag(**bag_data.dict())
    db.add(bag)
    db.commit()
    db.refresh(bag)
    return bag

@router.patch("/{bag_id}/stock")
def update_stock(bag_id: int, quantity: int, db: Session = Depends(get_db),
                 current_user: models.User = Depends(auth_utils.get_current_user)):
    bag = db.query(models.MagicBag).filter(models.MagicBag.id == bag_id).first()
    if not bag:
        raise HTTPException(404, "Bag not found")
    bag.quantity_available = quantity
    db.commit()
    return {"message": "Stock updated", "quantity_available": quantity}