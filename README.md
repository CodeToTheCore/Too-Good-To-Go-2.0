# Too Good To Go 2.0

A team rebuild of the [Too Good To Go](https://www.toogoodtogo.com) food-rescue app, plus new features we designed ourselves. Stores sell surplus food as discounted "Magic Bags," customers reserve them and pick them up at the end of the day, and less food goes to waste.

Built in June 2026 at Pursuit by Cornell Robertson and Khushali Haji. Our new-feature plan is in [TGTG New Feature PRD Template.pdf](TGTG%20New%20Feature%20PRD%20Template.pdf).

## What's new in 2.0

- **FlexPass:** a multi-pickup pass (5, 10, or 20 pickups) with a price quote per store, redeemed one punch at a time.
- **Cross-sell add-ons:** stores offer extras like coffee or a tote bag at checkout.
- **Dietary auto-cancel:** customers set dietary preferences, and orders are blocked if a store's food could conflict, with an option to override.
- **Food clues:** every store shows a color-coded hint of what kind of food to expect in a surprise bag.
- **Map search:** find food anywhere with address search (OpenStreetMap / Nominatim) and a distance filter.
- **Favorites bell:** shows when a favorite store has bags available.
- **Pickup window:** a live countdown to the pickup time, a "Navigate Me" link, a pickup code, and a QR code.
- **Store dashboard:** owners manage stores, publish bags, add add-ons, and see incoming orders.
- **Compare with the original:** a toggle to view our clone of the real Too Good To Go landing page, plus a mobile preview.

## How it's built

```
React (Vite)  ──>  Node / Express (port 3001)  ──>  Python FastAPI (port 8001)  ──>  SQLite or PostgreSQL
 frontend/          server/: proxy, rate limit,      backend/: auth, stores, bags,
                    security headers, live updates   orders, FlexPass, add-ons
```

## Run it locally

You need Node 20+ and Python 3.11+.

```bash
# 1. Back end
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed.py                    # creates tgtg_dev.db with sample stores and logins
uvicorn main:app --port 8001

# 2. Middle server (new terminal)
cd server && npm install && node index.js

# 3. Front end (new terminal)
cd frontend && npm install && npm run dev
```

Open http://localhost:5173 and log in with a sample account:

| Role | Email | Password |
| --- | --- | --- |
| Customer | demo@tgtg.com | demo1234 |
| Store owner | owner@tgtg.com | owner1234 |

Settings go in `.env` files (copy `.env.example`). Set `JWT_SECRET` to a long random value. Without it the server makes a random one each run, so everyone is logged out when it restarts. The optional services (Stripe, Cloudinary, Mapbox, and others) are in [docs/API-KEYS.md](docs/API-KEYS.md).

## Tests

```bash
cd backend
pip install -r requirements-dev.txt
python -m pytest
```

10 tests run against a throwaway database and cover sign-up roles, login tokens, and store-ownership rules for bags, add-ons, and orders.

## Security fixes (October 2026)

- **Store ownership is enforced on the server.** Before, any logged-in user could change any store's bag stock, add or delete its add-ons, add bags to it, or change any order's status. These routes now check that the store belongs to you.
- **No self-service admin accounts.** Sign-up only allows customer or store owner.
- **No hard-coded login secret.** The server used a fallback secret that was visible in this public repo, so anyone could have forged a login. That's gone.
- **Order quantities must be 1 to 20.** A negative quantity used to add stock back and make the total negative. Deleted add-ons can no longer be bought.
- **Live stock updates come only from the server.** Before, anyone could broadcast fake "bags left" numbers.
- **The repo no longer tracks** installed packages, the Python virtual environment, the dev database, or `.env` files.

## Team

- Cornell Robertson ([@CodeToTheCore](https://github.com/CodeToTheCore))
- Khushali Haji ([@khushali-haji](https://github.com/khushali-haji))
