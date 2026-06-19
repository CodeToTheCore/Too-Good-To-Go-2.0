from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import random, string, qrcode, io, base64
from database import get_db
import models, schemas, auth_utils
from food_clue import store_diet, conflict_reason

router = APIRouter()

def generate_pickup_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def generate_qr_code(data: str) -> str:
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{encoded}"

@router.post("/", response_model=schemas.OrderOut)
def create_order(
    order_data: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    total = 0.0
    items_out = []
    order_items = []

    # Hard auto-cancel: block the order if a bag conflicts with the user's dietary settings.
    prefs = (current_user.dietary_prefs or "").split(",") if current_user.dietary_prefs else []
    prefs = [p for p in prefs if p]

    for item in order_data.items:
        bag = db.query(models.MagicBag).filter(models.MagicBag.id == item.bag_id).first()
        if not bag:
            raise HTTPException(404, f"Bag {item.bag_id} not found")
        if bag.quantity_available < item.quantity:
            raise HTTPException(400, f"Not enough bags available for {bag.title}")
        if current_user.auto_cancel_conflicts and prefs:
            reason = conflict_reason(prefs, store_diet(bag.store)) if bag.store else None
            if reason:
                raise HTTPException(
                    400,
                    f"Order blocked: '{bag.title}' may not be safe for your {reason} setting. "
                    f"Turn off auto-cancel in your profile to override.",
                )
        total += bag.discounted_price * item.quantity
        bag.quantity_available -= item.quantity
        order_items.append(models.OrderItem(bag_id=item.bag_id, quantity=item.quantity, price=bag.discounted_price))
        items_out.append({"bag_id": item.bag_id, "title": bag.title, "quantity": item.quantity, "price": bag.discounted_price})

    # Cross-sell add-on line items
    for addon_id in order_data.addon_ids or []:
        addon = db.query(models.AddOn).filter(models.AddOn.id == addon_id).first()
        if not addon:
            raise HTTPException(404, f"Add-on {addon_id} not found")
        total += addon.price
        order_items.append(models.OrderItem(addon_id=addon.id, quantity=1, price=addon.price))
        items_out.append({"addon_id": addon.id, "title": addon.name, "quantity": 1, "price": addon.price, "is_addon": True})

    pickup_code = generate_pickup_code()
    qr_data = generate_qr_code(f"TGTG-ORDER-{pickup_code}")

    order = models.Order(
        user_id=current_user.id,
        total_price=round(total, 2),
        pickup_code=pickup_code,
        qr_code_url=qr_data,
        notes=order_data.notes,
    )
    db.add(order)
    db.flush()
    for oi in order_items:
        oi.order_id = order.id
        db.add(oi)
    db.commit()
    db.refresh(order)
    return {**order.__dict__, "items": items_out}

@router.get("/my", response_model=List[dict])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    orders = db.query(models.Order).filter(models.Order.user_id == current_user.id).all()
    result = []
    for o in orders:
        items = []
        for i in o.items:
            if i.addon_id:
                addon = i.addon
                items.append({
                    "addon_id": i.addon_id,
                    "title": addon.name if addon else "Add-on",
                    "quantity": i.quantity,
                    "price": i.price,
                    "is_addon": True,
                })
                continue
            bag = i.bag
            store = bag.store if bag else None
            items.append({
                "bag_id": i.bag_id,
                "title": bag.title if bag else None,
                "quantity": i.quantity,
                "price": i.price,
                "original_price": bag.original_price if bag else None,
                "pickup_start": bag.pickup_start if bag else None,
                "pickup_end": bag.pickup_end if bag else None,
                "store_name": store.name if store else None,
                "store_address": store.address if store else None,
                "store_lat": store.latitude if store else None,
                "store_lng": store.longitude if store else None,
            })
        result.append({
            "id": o.id,
            "status": o.status,
            "total_price": o.total_price,
            "qr_code_url": o.qr_code_url,
            "pickup_code": o.pickup_code,
            "notes": o.notes,
            "created_at": o.created_at,
            "items": items,
        })
    return result

@router.get("/incoming")
def incoming_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    """Orders containing bags from stores this merchant owns."""
    store_ids = [s.id for s in db.query(models.Store).filter(models.Store.owner_id == current_user.id).all()]
    if not store_ids:
        return []
    orders = (
        db.query(models.Order)
        .join(models.OrderItem, models.OrderItem.order_id == models.Order.id)
        .join(models.MagicBag, models.OrderItem.bag_id == models.MagicBag.id)
        .filter(models.MagicBag.store_id.in_(store_ids))
        .distinct()
        .all()
    )
    result = []
    for o in orders:
        items = [
            {"title": i.bag.title, "quantity": i.quantity, "price": i.price, "store_name": i.bag.store.name}
            for i in o.items if i.bag and i.bag.store_id in store_ids
        ]
        if not items:
            continue
        result.append({
            "id": o.id,
            "status": o.status,
            "pickup_code": o.pickup_code,
            "created_at": o.created_at,
            "customer": o.user.full_name if o.user else None,
            "items": items,
        })
    return result

@router.patch("/{order_id}/status")
def update_order_status(
    order_id: int,
    status: models.OrderStatus,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    order.status = status
    db.commit()
    return {"message": "Status updated", "status": status}
