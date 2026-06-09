from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import UserRole, OrderStatus

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.customer

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    avatar_url: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class StoreCreate(BaseModel):
    name: str
    description: Optional[str]
    category: str
    address: str
    city: str
    latitude: float
    longitude: float

class StoreOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category: str
    address: str
    city: str
    latitude: float
    longitude: float
    logo_url: Optional[str]
    cover_url: Optional[str]
    rating: float
    total_ratings: int
    is_active: bool
    class Config:
        from_attributes = True

class BagCreate(BaseModel):
    store_id: int
    title: str
    description: Optional[str]
    original_price: float
    discounted_price: float
    quantity_available: int
    quantity_total: int
    pickup_start: str
    pickup_end: str
    bag_type: str = "surprise"

class BagOut(BaseModel):
    id: int
    store_id: int
    title: str
    description: Optional[str]
    original_price: float
    discounted_price: float
    quantity_available: int
    pickup_start: str
    pickup_end: str
    bag_type: str
    image_url: Optional[str]
    store: Optional[StoreOut]
    class Config:
        from_attributes = True

class OrderItemCreate(BaseModel):
    bag_id: int
    quantity: int = 1

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    notes: Optional[str]

class OrderOut(BaseModel):
    id: int
    status: OrderStatus
    total_price: float
    qr_code_url: Optional[str]
    pickup_code: Optional[str]
    created_at: datetime
    items: List[dict]
    class Config:
        from_attributes = True