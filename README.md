first build # Too-Good-To-Go-2.0
we are making a clone of the Too Good To Go App.  we will clone it first.  then we will add some enhance features that we came up with for the 


Complete API Keys List for Too Good To Go 2.0

1. Stripe — Payments
What it does: Processes real credit card payments for orders.
Get it at: https://dashboard.stripe.com/register
Steps:

Create a free account
Go to Developers → API Keys
Copy Publishable key (starts with pk_test_) and Secret key (starts with sk_test_)
For webhooks later: Developers → Webhooks → Add endpoint

Paste into your .env:
sk_test_YOUR_STRIPE_SECRET_KEY_HERE_xxxxxxxxxxxxxxxxxxxxxxxx
sk_test_YOUR_STRIPE_SECRET_KEY_HERE_xxxxxxxxxxxxxxxxxxxxxxxx
sk_test_YOUR_STRIPE_SECRET_KEY_HERE_xxxxxxxxxxxxxxxxxxxxxxxx

2. Cloudinary — Image Storage
What it does: Stores and serves store photos and bag images (resized, optimized automatically).
Get it at: https://cloudinary.com/users/register/free
Steps:

Create a free account
Go to your Dashboard — you'll see Cloud Name, API Key, API Secret right on the home screen
Copy all three

Paste into your .env:
envCLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

3. Mapbox — Map Tiles (upgrade from OpenStreetMap)
What it does: Prettier, faster maps with custom styling. Optional but makes the map look professional.
Get it at: https://account.mapbox.com/auth/signup
Steps:

Create a free account (50,000 map loads/month free)
Go to Account → Access Tokens
Copy your Default public token

Paste into your .env:
envVITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6...
Then in MapPage.jsx swap the TileLayer URL to:
https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=YOUR_TOKEN

4. SendGrid — Transactional Email
What it does: Sends order confirmation emails, pickup reminders, and welcome emails to users.
Get it at: https://signup.sendgrid.com
Steps:

Create a free account (100 emails/day free)
Go to Settings → API Keys → Create API Key
Choose Full Access, name it tgtg-app, copy the key (shown only once!)
Go to Settings → Sender Authentication and verify your sender email

Paste into your .env:
envSENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Too Good To Go 2.0
Install in backend:
bashcd backend && pip install sendgrid

5. Twilio — SMS Notifications
What it does: Sends pickup reminder texts like "Your bag at Green Leaf Bakery is ready!"
Get it at: https://www.twilio.com/try-twilio
Steps:

Create a free account ($15 free credit)
Go to Console Dashboard — copy Account SID and Auth Token
Go to Phone Numbers → Get a Number — get a free trial number
That number becomes your TWILIO_FROM_NUMBER

Paste into your .env:
envTWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_FROM_NUMBER=+15551234567
Install in backend:
bashcd backend && pip install twilio

6. Google OAuth — Social Login
What it does: Lets users sign in with their Google account (one-click login).
Get it at: https://console.cloud.google.com
Steps:

Create a new project (name it Too Good To Go 2.0)
Go to APIs & Services → OAuth consent screen → set to External → fill in app name
Go to APIs & Services → Credentials → Create Credentials → OAuth Client ID
Choose Web application
Add http://localhost:5173 to Authorized JavaScript origins
Add http://localhost:3001/auth/google/callback to Authorized redirect URIs
Copy Client ID and Client Secret

Paste into your .env:
envGOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

7. PostgreSQL — Production Database
What it does: Replaces SQLite with a real production-grade database.
Get it free at: https://railway.app OR https://supabase.com OR https://neon.tech
Easiest option — Neon (free, serverless Postgres):

Go to https://neon.tech → Sign up
Create a new project → name it tgtg
Copy the Connection string from the dashboard

Paste into your .env:
envDATABASE_URL=postgresql://username:password@ep-xxxx.us-east-2.aws.neon.tech/tgtg?sslmode=require

8. Redis — Sessions & Caching
What it does: Stores user sessions and caches store/bag data so pages load faster.
Get it free at: https://redis.io/try-free (Redis Cloud)
Steps:

Sign up at https://redis.io/try-free
Create a free database (30MB free)
Go to your database → Connect → copy the Public endpoint, username, and password

Paste into your .env:
envREDIS_URL=redis://default:your_password@redis-xxxxx.c1.us-east-1-2.ec2.redns.redis-cloud.com:12345

9. JWT Secret — Auth Tokens
What it does: Signs your login tokens so they can't be forged.
Generate it yourself — run this in your terminal:
bashnode -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
Paste the output into your .env:
envJWT_SECRET=a8f3c2e1d4b7a9f0e2c5d8b1a4f7c0e3d6b9a2f5c8e1d4b7a0f3c6e9d2b5a8f1c4e7d0b3a6f9c2e5d8b1a4f7

Your Complete .env File
Here's what your final .env should look like with all keys filled in:
env# ── DATABASE ──────────────────────────────────────────
DATABASE_URL=postgresql://user:pass@host/tgtg
REDIS_URL=redis://default:pass@host:port

# ── AUTH ──────────────────────────────────────────────
JWT_SECRET=your_generated_64_byte_hex_string
JWT_EXPIRES_IN=7d

# ── GOOGLE OAUTH ──────────────────────────────────────
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# ── STRIPE ────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx

# ── CLOUDINARY ────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxx

# ── EMAIL (SENDGRID) ──────────────────────────────────
SENDGRID_API_KEY=SG.xxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Too Good To Go 2.0

# ── SMS (TWILIO) ──────────────────────────────────────
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_FROM_NUMBER=+15551234567

# ── MAPS ──────────────────────────────────────────────
VITE_MAPBOX_TOKEN=pk.eyJ1...

# ── SERVICES ──────────────────────────────────────────
PYTHON_API_URL=http://localhost:8001
PORT=3001
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001

Priority Order
For your class assignment tomorrow, do these first:

JWT Secret — generate it right now, takes 5 seconds, app won't work without it
Stripe — needed for checkout, fastest signup
Cloudinary — needed for store images to upload
PostgreSQL (Neon) — needed so data persists between restarts

The rest (SendGrid, Twilio, Google OAuth, Mapbox) are enhancements — the core app works without them.Sonnet 4.6 Low