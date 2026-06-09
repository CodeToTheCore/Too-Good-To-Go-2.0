from database import SessionLocal, engine
import models

models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

from auth_utils import hash_password

# Demo users
user = models.User(email="demo@tgtg.com", hashed_password=hash_password("demo1234"),
                   full_name="Demo User", role=models.UserRole.customer)
owner = models.User(email="owner@tgtg.com", hashed_password=hash_password("owner1234"),
                    full_name="Store Owner", role=models.UserRole.store_owner)
db.add_all([user, owner])
db.flush()

# Demo stores
stores_data = [
    {"name": "Green Leaf Bakery", "category": "bakery", "description": "Fresh sourdough and pastries daily",
     "address": "123 Main St", "city": "New York", "latitude": 40.7128, "longitude": -74.0060},
    {"name": "Sushi Palace", "category": "restaurant", "description": "Best sushi rolls in town",
     "address": "456 Park Ave", "city": "New York", "latitude": 40.7580, "longitude": -73.9855},
    {"name": "Corner Grocer", "category": "grocery", "description": "Fresh produce, dairy and more",
     "address": "789 Broadway", "city": "New York", "latitude": 40.7484, "longitude": -73.9967},
    {"name": "Pizza Napoli", "category": "restaurant", "description": "Authentic Neapolitan pizza",
     "address": "321 W 42nd St", "city": "New York", "latitude": 40.7561, "longitude": -74.0025},
    {"name": "Morning Brew Cafe", "category": "cafe", "description": "Coffee, croissants and more",
     "address": "555 Lexington Ave", "city": "New York", "latitude": 40.7549, "longitude": -73.9741},
]
stores = []
for sd in stores_data:
    s = models.Store(**sd, owner_id=owner.id, rating=4.5, total_ratings=120)
    db.add(s)
    stores.append(s)
db.flush()

# Magic bags
bags_data = [
    {"title": "Surprise Bag", "description": "Assorted breads and pastries", "original_price": 18.0,
     "discounted_price": 5.99, "quantity_available": 5, "quantity_total": 5,
     "pickup_start": "18:00", "pickup_end": "20:00", "bag_type": "surprise"},
    {"title": "Sushi Surprise", "description": "Chef's selection of fresh rolls",  "original_price": 35.0,
     "discounted_price": 9.99, "quantity_available": 3, "quantity_total": 3,
     "pickup_start": "20:00", "pickup_end": "22:00", "bag_type": "surprise"},
    {"title": "Veggie Box", "description": "Mixed seasonal vegetables", "original_price": 22.0,
     "discounted_price": 6.99, "quantity_available": 8, "quantity_total": 8,
     "pickup_start": "17:00", "pickup_end": "19:00", "bag_type": "surprise"},
    {"title": "Pizza Rescue", "description": "Leftover slices and whole pizzas", "original_price": 28.0,
     "discounted_price": 7.99, "quantity_available": 4, "quantity_total": 4,
     "pickup_start": "21:00", "pickup_end": "23:00", "bag_type": "surprise"},
    {"title": "Cafe Bundle", "description": "Pastries, sandwiches and drinks", "original_price": 20.0,
     "discounted_price": 5.99, "quantity_available": 6, "quantity_total": 6,
     "pickup_start": "16:00", "pickup_end": "18:00", "bag_type": "surprise"},
]
for i, bd in enumerate(bags_data):
    bag = models.MagicBag(**bd, store_id=stores[i].id)
    db.add(bag)

db.commit()
print("✅ Database seeded! Login: demo@tgtg.com / demo1234")
db.close()