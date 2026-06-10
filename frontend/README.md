# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

1. Stripe — Payments
What it does: Processes real credit card payments for orders.
Get it at: https://dashboard.stripe.com/register
Steps:

Create a free account
Go to Developers → API Keys
Copy Publishable key (starts with pk_test_) and Secret key (starts with sk_test_)
For webhooks later: Developers → Webhooks → Add endpoint

Paste into your .env


2. Cloudinary — Image Storage
What it does: Stores and serves store photos and bag images (resized, optimized automatically).
Get it at: https://cloudinary.com/users/register/free
Steps:

Create a free account
Go to your Dashboard — you'll see Cloud Name, API Key, API Secret right on the home screen
Copy all three

Paste into your .env:


 Mapbox — Map Tiles (upgrade from OpenStreetMap)
What it does: Prettier, faster maps with custom styling. Optional but makes the map look professional.
Get it at: https://account.mapbox.com/auth/signup
Steps:

Create a free account (50,000 map loads/month free)
Go to Account → Access Tokens
Copy your Default public token

Paste into your .env:

4. SendGrid — Transactional Email
What it does: Sends order confirmation emails, pickup reminders, and welcome emails to users.
Get it at: https://signup.sendgrid.com
Steps:

Create a free account (100 emails/day free)
Go to Settings → API Keys → Create API Key
Choose Full Access, name it tgtg-app, copy the key (shown only once!)
Go to Settings → Sender Authentication and verify your sender email

Paste into your .env:

5. Twilio — SMS Notifications
What it does: Sends pickup reminder texts like "Your bag at Green Leaf Bakery is ready!"
Get it at: https://www.twilio.com/try-twilio
Steps:

Create a free account ($15 free credit)
Go to Console Dashboard — copy Account SID and Auth Token
Go to Phone Numbers → Get a Number — get a free trial number
That number becomes your TWILIO_FROM_NUMBER

Paste into your .env:

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

7. PostgreSQL — Production Database
What it does: Replaces SQLite with a real production-grade database.
Get it free at: https://railway.app OR https://supabase.com OR https://neon.tech
Easiest option — Neon (free, serverless Postgres):

Go to https://neon.tech → Sign up
Create a new project → name it tgtg
Copy the Connection string from the dashboard

Paste into your .env:


8. Redis — Sessions & Caching
What it does: Stores user sessions and caches store/bag data so pages load faster.
Get it free at: https://redis.io/try-free (Redis Cloud)
Steps:

Sign up at https://redis.io/try-free
Create a free database (30MB free)
Go to your database → Connect → copy the Public endpoint, username, and password

Paste into your .env:

9. JWT Secret — Auth Tokens
What it does: Signs your login tokens so they can't be forged.
Generate it yourself — run this in your terminal:
bashnode -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
Paste the output into your .env:


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



JWT Secret — generate it right now, takes 5 seconds, app won't work without it
Stripe — needed for checkout, fastest signup
Cloudinary — needed for store images to upload
PostgreSQL (Neon) — needed so data persists between restarts


The rest (SendGrid, Twilio, Google OAuth, Mapbox) are enhancements — the core app works without them.