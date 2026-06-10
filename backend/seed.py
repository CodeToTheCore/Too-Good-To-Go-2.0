from database import SessionLocal, engine
import models

models.Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Clear existing data
db.query(models.OrderItem).delete()
db.query(models.Order).delete()
db.query(models.MagicBag).delete()
db.query(models.Favorite).delete()
db.query(models.Store).delete()
db.query(models.User).delete()
db.commit()

from auth_utils import hash_password

user = models.User(
    email="demo@tgtg.com",
    hashed_password=hash_password("demo1234"),
    full_name="Demo User",
    role=models.UserRole.customer
)
owner = models.User(
    email="owner@tgtg.com",
    hashed_password=hash_password("owner1234"),
    full_name="Store Owner",
    role=models.UserRole.store_owner
)
db.add_all([user, owner])
db.flush()

stores_data = [
    {
        "name": "Green Leaf Bakery",
        "category": "bakery",
        "description": "Award-winning sourdough, croissants, and seasonal pastries baked fresh every morning.",
        "address": "123 Main St, Lower East Side",
        "city": "New York",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "cover_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
        "logo_url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&q=80",
        "rating": 4.8,
        "total_ratings": 234,
    },
    {
        "name": "Sushi Palace",
        "category": "restaurant",
        "description": "Premium omakase sushi and creative rolls. Surplus from our nightly tasting menu.",
        "address": "456 Park Ave, Midtown",
        "city": "New York",
        "latitude": 40.7580,
        "longitude": -73.9855,
        "cover_url": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
        "logo_url": "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=200&q=80",
        "rating": 4.9,
        "total_ratings": 412,
    },
    {
        "name": "Corner Grocer",
        "category": "grocery",
        "description": "Organic produce, artisan dairy, and locally sourced pantry staples.",
        "address": "789 Broadway, SoHo",
        "city": "New York",
        "latitude": 40.7484,
        "longitude": -73.9967,
        "cover_url": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
        "logo_url": "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=200&q=80",
        "rating": 4.5,
        "total_ratings": 189,
    },
    {
        "name": "Pizza Napoli",
        "category": "restaurant",
        "description": "Authentic Neapolitan pizza in a wood-fired oven imported from Naples. Surplus pies at closing.",
        "address": "321 W 42nd St, Hell's Kitchen",
        "city": "New York",
        "latitude": 40.7561,
        "longitude": -74.0025,
        "cover_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
        "logo_url": "https://images.unsplash.com/photo-1571066811602-716837d681de?w=200&q=80",
        "rating": 4.7,
        "total_ratings": 567,
    },
    {
        "name": "Morning Brew Café",
        "category": "cafe",
        "description": "Single-origin coffees, house-made granola, and the city's best avocado toast.",
        "address": "555 Lexington Ave, Murray Hill",
        "city": "New York",
        "latitude": 40.7549,
        "longitude": -73.9741,
        "cover_url": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
        "logo_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&q=80",
        "rating": 4.6,
        "total_ratings": 321,
    },
    {
        "name": "Thai Garden",
        "category": "restaurant",
        "description": "Authentic Thai street food — pad thai, curries, and mango sticky rice.",
        "address": "88 9th Ave, Chelsea",
        "city": "New York",
        "latitude": 40.7444,
        "longitude": -74.0046,
        "cover_url": "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&q=80",
        "logo_url": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&q=80",
        "rating": 4.4,
        "total_ratings": 278,
    },
    {
        "name": "The Cheese Shop",
        "category": "grocery",
        "description": "Imported and domestic artisan cheeses, charcuterie, and gourmet accompaniments.",
        "address": "210 Bleecker St, West Village",
        "city": "New York",
        "latitude": 40.7310,
        "longitude": -74.0027,
        "cover_url": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&q=80",
        "logo_url": "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=200&q=80",
        "rating": 4.9,
        "total_ratings": 145,
    },
    {
        "name": "Ramen Lab",
        "category": "restaurant",
        "description": "48-hour tonkotsu broth, hand-pulled noodles, and creative toppings.",
        "address": "170 Mott St, Nolita",
        "city": "New York",
        "latitude": 40.7208,
        "longitude": -73.9962,
        "cover_url": "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80",
        "logo_url": "https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=200&q=80",
        "rating": 4.7,
        "total_ratings": 389,
    },
]

stores = []
for sd in stores_data:
    s = models.Store(**sd, owner_id=owner.id, is_active=True)
    db.add(s)
    stores.append(s)
db.flush()

bags_data = [
    # Green Leaf Bakery
    {
        "store_idx": 0,
        "title": "Bread & Pastry Surprise",
        "description": "A mixed bag of sourdough loaves, croissants, and seasonal pastries. What's inside depends on the day!",
        "original_price": 22.00,
        "discounted_price": 5.99,
        "quantity_available": 5,
        "quantity_total": 5,
        "pickup_start": "18:00",
        "pickup_end": "20:00",
        "image_url": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80",
    },
    {
        "store_idx": 0,
        "title": "Morning Pastry Box",
        "description": "Croissants, pain au chocolat, and muffins from today's bake.",
        "original_price": 18.00,
        "discounted_price": 4.99,
        "quantity_available": 3,
        "quantity_total": 3,
        "pickup_start": "16:00",
        "pickup_end": "17:30",
        "image_url": "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600&q=80",
    },
    # Sushi Palace
    {
        "store_idx": 1,
        "title": "Chef's Sushi Surprise",
        "description": "Hand-selected nigiri, maki rolls, and sashimi from tonight's omakase service.",
        "original_price": 45.00,
        "discounted_price": 12.99,
        "quantity_available": 4,
        "quantity_total": 4,
        "pickup_start": "21:00",
        "pickup_end": "22:30",
        "image_url": "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80",
    },
    # Corner Grocer
    {
        "store_idx": 2,
        "title": "Veggie & Fruit Box",
        "description": "Seasonal organic vegetables and fruits. Great for a week of healthy cooking.",
        "original_price": 28.00,
        "discounted_price": 7.99,
        "quantity_available": 8,
        "quantity_total": 8,
        "pickup_start": "17:00",
        "pickup_end": "19:00",
        "image_url": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&q=80",
    },
    {
        "store_idx": 2,
        "title": "Dairy & Deli Rescue",
        "description": "Premium cheeses, yogurts, cold cuts, and more approaching best-by date.",
        "original_price": 32.00,
        "discounted_price": 8.99,
        "quantity_available": 5,
        "quantity_total": 5,
        "pickup_start": "18:00",
        "pickup_end": "20:00",
        "image_url": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&q=80",
    },
    # Pizza Napoli
    {
        "store_idx": 3,
        "title": "Pizza Rescue Bag",
        "description": "2–3 whole pizzas from tonight's oven: Margherita, Diavola, and whatever else was baked.",
        "original_price": 38.00,
        "discounted_price": 9.99,
        "quantity_available": 6,
        "quantity_total": 6,
        "pickup_start": "21:30",
        "pickup_end": "23:00",
        "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80",
    },
    # Morning Brew Café
    {
        "store_idx": 4,
        "title": "Café Closing Bundle",
        "description": "Sandwiches, pastries, and a bottled drink. Perfect end-of-day snack pack.",
        "original_price": 24.00,
        "discounted_price": 5.99,
        "quantity_available": 7,
        "quantity_total": 7,
        "pickup_start": "16:30",
        "pickup_end": "18:00",
        "image_url": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
    },
    # Thai Garden
    {
        "store_idx": 5,
        "title": "Thai Feast Surprise",
        "description": "Curries, noodles, spring rolls — enough for two. Spice level varies!",
        "original_price": 30.00,
        "discounted_price": 7.99,
        "quantity_available": 4,
        "quantity_total": 4,
        "pickup_start": "20:30",
        "pickup_end": "22:00",
        "image_url": "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=600&q=80",
    },
    # The Cheese Shop
    {
        "store_idx": 6,
        "title": "Cheesemonger's Pick",
        "description": "3–4 artisan cheeses, crackers, and seasonal accompaniments hand-selected by our team.",
        "original_price": 42.00,
        "discounted_price": 11.99,
        "quantity_available": 3,
        "quantity_total": 3,
        "pickup_start": "18:00",
        "pickup_end": "19:30",
        "image_url": "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=600&q=80",
    },
    # Ramen Lab
    {
        "store_idx": 7,
        "title": "Ramen Night Surprise",
        "description": "A large bowl of tonkotsu ramen plus gyoza and a small side. Late-night special.",
        "original_price": 28.00,
        "discounted_price": 7.99,
        "quantity_available": 5,
        "quantity_total": 5,
        "pickup_start": "21:00",
        "pickup_end": "22:30",
        "image_url": "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80",
    },
]

for bd in bags_data:
    idx = bd.pop("store_idx")
    bag = models.MagicBag(**bd, store_id=stores[idx].id, bag_type="surprise", is_active=True)
    db.add(bag)

db.commit()
print("✅ Database seeded!")
print("   Customer login: demo@tgtg.com / demo1234")
print("   Owner login:    owner@tgtg.com / owner1234")
db.close()