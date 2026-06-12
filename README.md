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





name: frontend-design
description: Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults.
license: Complete terms in LICENSE.txt
---
 
# Frontend Design
 
Approach this as the design lead at a small studio known for giving every client a visual identity that could not be mistaken for anyone else's. This client has already rejected proposals that felt templated, and is paying for a distinctive point of view: make deliberate, opinionated choices about palette, typography, and layout that are specific to this brief, and take one real aesthetic risk you can justify.
 
## Ground it in the subject
 
If the brief does not pin down what the product or subject is, pin it yourself before designing: name one concrete subject, its audience, and the page's single job, and state your choice. If there's any information in your memory about the human's preferences, context about what they're building, or designs you've made before – use that as a hint. The subject's own world, its materials, instruments, artifacts, and vernacular, is where distinctive choices come from. Build with the brief's real content and subject matter throughout.
 
## Design principles
 
For web designs, the hero is a thesis. Open with the most characteristic thing in the subject's world, in whatever form makes sense for it: a headline, an image, an animation, a live demo, an interactive moment. Be deliberate with your choice: a big number with a small label, supporting stats, and a gradient accent is the template answer, only use if that's truly the best option.
 
Typography carries the personality of the page. Pair the display and body faces deliberately, not the same families you would reach for on any other project, and set a clear type scale with intentional weights, widths, and spacing. Make the type treatment itself a memorable part of the design, not a neutral delivery vehicle for the content.
 
Structure is information. Structural devices, numbering, eyebrows, dividers, labels, should encode something true about the content, not decorate it. Many generic designs use numbered markers (01 / 02 / 03), but that's only appropriate if the content actually is a sequence - like a real process or a typed timeline where order carries information the reader needs. Question if choices like numbered markers actually make sense before incorporating them.
 
Leverage motion deliberately. Think about where and if animation can serve the subject: a page-load sequence, a scroll-triggered reveal, hover micro-interactions, ambient atmosphere. An orchestrated moment usually lands harder than scattered effects; choose what the direction calls for. However, sometimes less is more, and extra animation contributes to the feeling that the design is AI-generated.
 
Match complexity to the vision. Maximalist directions need elaborate execution; minimal directions need precision in spacing, type, and detail. Elegance is executing the chosen vision well.
 
Consider written content carefully. Often a design brief may not contain real content, and it's up to you to come up with copy. Copy can make a design feel as templated as the design itself. See the below section on writing for more guidance.
 
## Process: brainstorm, explore, plan, critique, build, critique again
 
For calibration: AI-generated design right now clusters around three looks: (1) a warm cream background (near #F4F1EA) with a high-contrast serif display and a terracotta accent; (2) a near-black background with a single bright acid-green or vermilion accent; (3) a broadsheet-style layout with hairline rules, zero border-radius, and dense newspaper-like columns. All three are legitimate for some briefs, but they are defaults rather than choices, and they appear regardless of subject. Where the brief pins down a visual direction, follow it exactly — the brief's own words always win, including when it asks for one of these looks. Where it leaves an axis free, don't spend that freedom on one of these defaults. Just like a human designer who's hired, there's often a careful balance between doing what you're good at and taking each project as a chance to experiment and learn.
 
Work in two passes. First, brainstorm a short design plan based on the human's design brief: create a compact token system with color, type, layout, and signature. Color: describe the palette as 4–6 named hex values. Type: the typefaces for 2+ roles (a characterful display face that's used with restraint, a complementary body face, and a utility face for captions or data if needed). Layout: a layout concept, using one-sentence prose descriptions and ASCII wireframes to ideate and compare. Signature: the single unique element this page will be remembered by that embodies the brief in an appropriate way.
 
Then review that plan against the brief before building: if any part of it reads like the generic default you would produce for any similar page (work through a similar prompt to see if you arrive somewhere similar) rather than a choice made for this specific brief — revise that part, say what you changed and why. Only after you've confirmed the relative uniqueness of your design plan should you start to write the code, following the revised plan exactly and deriving every color and type decision from it.
 
When writing the code, be careful of structuring your CSS selector specificities. It's easy to generate CSS classes that cancel each other out (especially with a type-based selector like .section and a element-based selector like .cta). This can happen often with paddings/margins between sections.
 
Try to do a lot of this planning and iteration in your thinking, and only show ideas to the user when you have higher confidence it'll delight them.
 
## Restraint and self-critique
 
Spend your boldness in one place. Let the signature element be the one memorable thing, keep everything around it quiet and disciplined, and cut any decoration that does not serve the brief. Not taking a risk can be a risk itself! Build to a quality floor without announcing it: responsive down to mobile, visible keyboard focus, reduced motion respected. Critique your own work as you build, taking screenshots if your environment supports it – a picture is worth 1000 tokens. Consider Chanel's advice: before leaving the house, take a look in the mirror and remove one accessory. Human creators have memory and always try to do something new, so if you have a space to quickly jot down notes about what you've tried, it can help you in future passes.
 
## More on writing in design
 
Words appear in a design for one reason: to make it easier to understand, and therefore easier to use. They are design material, not decoration. Bring the same intentionality to copy that you would bring to spacing and color. Before writing anything, ask what the design needs to say, and how it can best be said to help the person navigate the experience.
 
Write from the end user's side of the screen. Name things by what people control and recognize, never by how the system is built. A person manages notifications, not webhook config. Describe what something does in plain terms rather than selling it. Being specific is always better than being clever.
 
Use active voice as default. A control should say exactly what happens when it's used: "Save changes," not "Submit." An action keeps the same name through the whole flow, so the button that says "Publish" produces a toast that says "Published." The vocabulary of an interface is the signposting for someone navigating the product. Cohesion and consistency are how people learn their way around.
 
Treat failure and emptiness as moments for direction, not mood. Explain what went wrong and how to fix it, in the interface's voice rather than a person's. Errors don't apologize, and they are never vague about what happened. An empty screen is an invitation to act.
 
Keep the register conversational and tuned: plain verbs, sentence case, no filler, with tone matched to the brand and the audience. Let each element do exactly one job. A label labels, an example demonstrates, and nothing quietly does double duty.
 