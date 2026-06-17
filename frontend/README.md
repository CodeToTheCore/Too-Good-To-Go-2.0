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


# features to add from AI testing
1. # Feature: Allergy-anxious user -
 Add a color-coded badge or banner right across the corner of the restaurant image. 
 Someone with a severe shellfish allergy sees "seafood" as a clue. Do they have enough info to feel safe? Is there a warning or confirmation step?
 Check the Clue: Look at the food category (Meat, Veggie, Fish) to match your diet.
Why it helps: If Arthur sees a photo of a local bakery, but a bright green banner across the image says "Clue: Veggie/Bakery Box" or a red one says "Clue: Beef/Meat Box", he immediately gets the concept without having to click around and hunt for information.

2. #  First-time user: A "How It Works" 3-Step Onboarding -
 User Opens app, doesn't understand "mystery bag" concept. Is there onboarding that explains how it works?
Older users get anxious about what happens after they hit the buy button. They don't like the unknown.
The Feature: The very first time someone opens the app, show a simple, 3-step screen with big text and illustrations:
Browse & Pick: Find local stores selling extra food at a steep discount.
Non-tech-savvy older user — Can they find the clue label easily? Is the font/button size accessible?


3. # Grab & Go: Last-minute buyer The "Pick Up Countdown" and Map Navigation:
 User selects a bag 2 minutes before pickup closes. Is timing/urgency clearly communicated?
 Show up at the specified time, show your phone, and enjoy your mystery deal!
Why it helps: It builds immediate trust. Arthur now knows exactly what the app expects him to do.
One of the biggest pain points for users on food-rescue apps is missing the pickup window because they forgot, or getting lost on the way.
The Feature: Once a user buys a bag, give them a giant, clear "Pick up between 8:00 PM - 8:30 PM" notice. Even better, add a "Navigate Me" button right next to it that automatically opens Google Maps or Apple Maps.
Why it helps: Arthur doesn't have to copy and paste the restaurant's address into a separate app. One click, and his phone is guiding him to the food.


4. # A "Favorite Stores" (Heart) Button
Users tend to be creatures of habit. They find two or three restaurants they love near their house and want to buy from them repeatedly.
The Feature: Let users "heart" or favorite a restaurant. When that restaurant posts new leftover items or mystery bags, send the user a push notification.
Why it helps: For Arthur, it saves him from scrolling through a massive list every day. For your app, push notifications about favorite stores are the #1 way to get users to return and buy again.

5. # A "Money Saved" Counter on the Profile
People love seeing the tangible results of their good deeds and smart spending.
The Feature: On the user’s profile page, show a small dashboard that tracks:
Total money saved (Original Price minus the App Price).
Meals rescued (Number of bags bought).
Why it helps: It gamifies the app in a wholesome way. Arthur can look at his app and proudly think, "Wow, I saved $45 this month and kept 6 meals from going to waste." It gives him a reason to brag about your app to his friends.

6. # Clear "Pick Up Instructions" from the Store
Every restaurant operates differently. At a bakery, you go to the register. At a busy restaurant, you might go to the host stand.
The Feature: Give stores a small text box where they can type specific instructions, like: "Please walk up to the counter and tell the barista you have a [App Name] pickup."
Why it helps: It eliminates the social anxiety of walking into a restaurant and not knowing who to talk to. Users/customers will feel confident walking in because they will know exactly what to say. Store uploading items — What if a store skips adding a clue? Does the app block them or allow incomplete listings?

💡 # Summary Checklist for this Next Build:
Features:	What it does	Why it gains users
Image Badges	Puts the food clue directly on the restaurant photo.	Instant clarity, no confusion.
1-Click Navigation	Opens maps directly from the order confirmation.	Frictionless pickup.
Favorites & Alerts Notifies users when their favorite spots have food.	Drives repeat daily traffic.
Savings Tracker	Shows total cash saved over time.	Word-of-mouth marketing

# features to add from PRD
Price-conscious and dietary-restricted consumers experience high checkout hesitation and transaction anxiety on the Too Good To Go storefront because of blind "Surprise Bag" uncertainty and restrictive dietary risks. This results in depressed conversion rates, frequent cart abandonment, and low Average Order Value (AOV) for local merchants who are unable to effectively upsell excess capacity.

# 1a. Background & Dependencies

Legacy constraint: The current core platform infrastructure only supports isolated, single-unit checkout actions; it does not natively possess multi-day multi-buy architecture or custom additive item catalogs.
Dependency: Requires a backend core modification to support the "Flex Pass" multi-use wallet ledger, priority early-access reservation windows, and merchant-managed add-on SKU pricing.

# 1b. Target Use Cases
As a dietary-restricted app user, I want to flag my dietary requirements and set a hard auto-cancel parameter so that I do not risk spending money on a surprise meal I cannot safely eat.
As a frequent neighborhood commuter, I want to buy a flexible prepaid digital punch card for my favorite bakery so that I lock in long-term value and secure a priority window for daily leftovers.


As a merchant kitchen owner, I want to showcase visual context of typical past surplus items and cross-sell high-margin fresh items at checkout so that I can increase my transaction value and offset daily operational losses.

# 1c. Current User Journey
User opens the Too Good To Go app, uses the map/list view to identify a local merchant, and taps on their storefront.

User lands on the storefront profile and sees a generic graphic header along with an ambiguous title labeled "Surprise Bag."
  basically in this app we need a to have the users and store side backend/ frontend side too for when each side log in the can add thsese certain features on there logged in accounts.