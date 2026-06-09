from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class UserRole(str, enum.Enum):
    customer = "customer"
    store_owner = "store_owner"
    admin = "admin"

class OrderStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    ready = "ready"
    collected = "collected"
    cancelled = "cancelled"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    phone = Column(String)
    role = Column(Enum(UserRole), default=UserRole.customer)
    avatar_url = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    orders = relationship("Order", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")

class Store(Base):
    __tablename__ = "stores"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)  # bakery, restaurant, grocery, etc.
    address = Column(String)
    city = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    logo_url = Column(String)
    cover_url = Column(String)
    rating = Column(Float, default=0.0)
    total_ratings = Column(Integer, default=0)
    owner_id = Column(Integer, ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    bags = relationship("MagicBag", back_populates="store")
    favorites = relationship("Favorite", back_populates="store")

class MagicBag(Base):
    __tablename__ = "magic_bags"
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    original_price = Column(Float)
    discounted_price = Column(Float, nullable=False)
    quantity_available = Column(Integer, default=0)
    quantity_total = Column(Integer, default=0)
    pickup_start = Column(String)   # e.g. "17:00"
    pickup_end = Column(String)     # e.g. "20:00"
    bag_type = Column(String, default="surprise")  # surprise or specific
    image_url = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    store = relationship("Store", back_populates="bags")
    order_items = relationship("OrderItem", back_populates="bag")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(Enum(OrderStatus), default=OrderStatus.pending)
    total_price = Column(Float)
    stripe_payment_id = Column(String)
    qr_code_url = Column(String)
    pickup_code = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    bag_id = Column(Integer, ForeignKey("magic_bags.id"))
    quantity = Column(Integer, default=1)
    price = Column(Float)
    order = relationship("Order", back_populates="items")
    bag = relationship("MagicBag", back_populates="order_items")

class Favorite(Base):
    __tablename__ = "favorites"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    store_id = Column(Integer, ForeignKey("stores.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="favorites")
    store = relationship("Store", back_populates="favorites")

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    store_id = Column(Integer, ForeignKey("stores.id"))
    rating = Column(Integer)
    comment = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())