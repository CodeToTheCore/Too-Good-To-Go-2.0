from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas, auth_utils
import math

router = APIRouter()

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1))*math.cos(math.radians(lat2))*math.sin(dlon/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

@router.get("/", response_model=List[schemas.StoreOut])
def get_stores(
    city: Optional[str] = None,
    category: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius_km: float = 10,
    db: Session = Depends(get_db)
):
    query = db.query(models.Store).filter(models.Store.is_active == True)
    if city:
        query = query.filter(models.Store.city.ilike(f"%{city}%"))
    if category:
        query = query.filter(models.Store.category == category)
    stores = query.all()
    if lat and lng:
        stores = [s for s in stores if haversine(lat, lng, s.latitude, s.longitude) <= radius_km]
    return stores

@router.get("/{store_id}", response_model=schemas.StoreOut)
def get_store(store_id: int, db: Session = Depends(get_db)):
    store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store

@router.post("/", response_model=schemas.StoreOut)
def create_store(
    store_data: schemas.StoreCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    store = models.Store(**store_data.dict(), owner_id=current_user.id)
    db.add(store)
    db.commit()
    db.refresh(store)
    return store

@router.get("/{store_id}/bags", response_model=List[schemas.BagOut])
def get_store_bags(store_id: int, db: Session = Depends(get_db)):
    return db.query(models.MagicBag).filter(
        models.MagicBag.store_id == store_id,
        models.MagicBag.is_active == True,
        models.MagicBag.quantity_available > 0
    ).all()