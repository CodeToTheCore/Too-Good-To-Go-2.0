import React, { useState } from 'react';

const stores = [
  { id: 1, name: "Green Bistro", category: "Restaurant", price: 3.99, originalPrice: 12.00, pickup: "5:00-6:00 PM", rating: 4.5, distance: "0.3 mi" },
  { id: 2, name: "City Bakery", category: "Bakery", price: 2.99, originalPrice: 9.00, pickup: "7:00-8:00 PM", rating: 4.8, distance: "0.5 mi" },
  { id: 3, name: "Sushi Place", category: "Japanese", price: 4.99, originalPrice: 15.00, pickup: "9:00-10:00 PM", rating: 4.3, distance: "0.8 mi" },
  { id: 4, name: "Corner Cafe", category: "Cafe", price: 2.49, originalPrice: 8.00, pickup: "6:00-7:00 PM", rating: 4.6, distance: "0.2 mi" },
];

export default function StorefrontPage() {
  const [search, setSearch] = useState('');

  const filtered = stores.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#00a37a' }}>🛍️ Stores Near You</h1>
      
      <input
        type="text"
        placeholder="Search stores..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ padding: '10px', width: '100%', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ccc' }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {filtered.map(store => (
          <div key={store.id} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '48px', textAlign: 'center' }}>🏪</div>
            <h3 style={{ margin: '8px 0 4px' }}>{store.name}</h3>
            <p style={{ color: '#666', margin: '4px 0' }}>{store.category} • {store.distance}</p>
            <p style={{ margin: '4px 0' }}>⏰ Pickup: {store.pickup}</p>
            <p style={{ margin: '4px 0' }}>⭐ {store.rating}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <span><strong style={{ color: '#00a37a', fontSize: '18px' }}>${store.price}</strong> <s style={{ color: '#999' }}>${store.originalPrice}</s></span>
              <button style={{ background: '#00a37a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                Reserve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}