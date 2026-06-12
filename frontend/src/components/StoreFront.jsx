import React from 'react';
import './Storefront.css';

const stores = [
  { id: 1, name: "Green Bistro", category: "Restaurant", price: 3.99, originalPrice: 12.00, pickup: "5:00-6:00 PM", rating: 4.5, items: "Surprise Bag" },
  { id: 2, name: "City Bakery", category: "Bakery", price: 2.99, originalPrice: 9.00, pickup: "7:00-8:00 PM", rating: 4.8, items: "Bread & Pastries" },
  { id: 3, name: "Sushi Place", category: "Japanese", price: 4.99, originalPrice: 15.00, pickup: "9:00-10:00 PM", rating: 4.3, items: "Surprise Bag" },
];

function Storefront() {
  return (
    <div className="storefront">
      <h2>Available Stores Near You</h2>
      <div className="store-grid">
        {stores.map(store => (
          <div key={store.id} className="store-card">
            <div className="store-image">🏪</div>
            <h3>{store.name}</h3>
            <p>{store.category}</p>
            <p>Pickup: {store.pickup}</p>
            <p><strong>${store.price}</strong> <s>${store.originalPrice}</s></p>
            <button>Reserve</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Storefront;