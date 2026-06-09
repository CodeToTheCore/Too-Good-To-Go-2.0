from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import random, string, qrcode, io, base64
from database import get_db
import models, schemas, auth_utils

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

    for item in order_data.items:
        bag = db.query(models.MagicBag).filter(models.MagicBag.id == item.bag_id).first()
        if not bag:
            raise HTTPException(404, f"Bag {item.bag_id} not found")
        if bag.quantity_available < item.quantity:
            raise HTTPException(400, f"Not enough bags available for {bag.title}")
        total += bag.discounted_price * item.quantity
        bag.quantity_available -= item.quantity
        order_items.append(models.OrderItem(bag_id=item.bag_id, quantity=item.quantity, price=bag.discounted_price))
        items_out.append({"bag_id": item.bag_id, "title": bag.title, "quantity": item.quantity, "price": bag.discounted_price})

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
        items = [{"bag_id": i.bag_id, "quantity": i.quantity, "price": i.price} for i in o.items]
        result.append({**o.__dict__, "items": items})
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
