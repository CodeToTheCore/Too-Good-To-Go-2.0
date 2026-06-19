from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth_utils

router = APIRouter()

PREPAY_DISCOUNT = 0.10   # 10% off for locking in long-term value
FALLBACK_PRICE = 4.0     # per-punch price if the store has no active bags

def _per_punch_price(store, db):
    bag = (
        db.query(models.MagicBag)
        .filter(models.MagicBag.store_id == store.id, models.MagicBag.is_active == True)
        .order_by(models.MagicBag.discounted_price.asc())
        .first()
    )
    base = bag.discounted_price if bag and bag.discounted_price else FALLBACK_PRICE
    return round(base * (1 - PREPAY_DISCOUNT), 2)

def _to_out(p):
    return {
        "id": p.id,
        "store_id": p.store_id,
        "store_name": p.store.name if p.store else None,
        "total_punches": p.total_punches,
        "remaining_punches": p.remaining_punches,
        "price_paid": p.price_paid,
        "created_at": p.created_at,
    }

@router.post("/", response_model=schemas.FlexPassOut)
def buy_flex_pass(
    data: schemas.FlexPassCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    store = db.query(models.Store).filter(models.Store.id == data.store_id).first()
    if not store:
        raise HTTPException(404, "Store not found")
    if data.total_punches < 1:
        raise HTTPException(400, "A pass needs at least 1 punch")
    price = round(_per_punch_price(store, db) * data.total_punches, 2)
    p = models.FlexPass(
        user_id=current_user.id,
        store_id=store.id,
        total_punches=data.total_punches,
        remaining_punches=data.total_punches,
        price_paid=price,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return _to_out(p)

@router.get("/my", response_model=List[schemas.FlexPassOut])
def my_flex_passes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    passes = db.query(models.FlexPass).filter(models.FlexPass.user_id == current_user.id).all()
    return [_to_out(p) for p in passes]

@router.post("/{pass_id}/redeem", response_model=schemas.FlexPassOut)
def redeem_punch(
    pass_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    p = db.query(models.FlexPass).filter(
        models.FlexPass.id == pass_id, models.FlexPass.user_id == current_user.id
    ).first()
    if not p:
        raise HTTPException(404, "Pass not found")
    if p.remaining_punches <= 0:
        raise HTTPException(400, "No punches remaining on this pass")
    p.remaining_punches -= 1
    db.commit()
    db.refresh(p)
    return _to_out(p)

# Quote the price without buying (for the store-page widget).
@router.get("/quote/{store_id}")
def quote(store_id: int, punches: int = 5, db: Session = Depends(get_db)):
    store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not store:
        raise HTTPException(404, "Store not found")
    per = _per_punch_price(store, db)
    return {"per_punch": per, "punches": punches, "total": round(per * punches, 2), "discount_pct": int(PREPAY_DISCOUNT * 100)}
