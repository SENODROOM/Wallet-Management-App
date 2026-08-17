# Wallet Notepad

A small personal finance notepad with three sections — **Quantum Logics Income**, **Poly Learning Initiative**, and an adjustable **Monthly Budget** — backed by a MongoDB database behind a login. Every field is editable in place and saves automatically a moment after you stop typing.

## Features

- Three editable ledgers: a simple income log, and two budget-vs-spend trackers (Poly Learning Initiative, Monthly Budget) with an adjustable budget amount and a live "Remaining" total.
- Email/password sign up and sign in. Passwords are hashed with bcrypt; sessions are a JWT stored in an httpOnly cookie.
- Each account has its own private data — nothing is shared between users.
- Autosaves to MongoDB (debounced ~500ms after the last keystroke); a status pill in the header shows saving/saved/error.
- Responsive, light/dark-aware UI with no build step and no frontend dependencies.

## Project structure

```
.
├── backend/              Express API + MongoDB models
│   ├── middleware/auth.js    JWT cookie auth (attachUser, requireAuth)
│   ├── models/                Mongoose schemas (User, Section)
│   ├── routes/                 /api/auth/*  and  /api/state*
│   ├── server.js               App entry point; also serves the frontend
│   ├── seed.js                  One-time helper to load starter data for an account
│   ├── package.json
│   └── .env.example
└── frontend/              Static HTML/CSS/JS, no build step
    ├── login.html            Sign in / sign up
    └── notepad.html           The three ledgers
```

## Setup

**1. Install dependencies**

```bash
cd backend
npm install
```

**2. Configure environment variables**

```bash
cp .env.example .env
```

Edit `backend/.env`:

| Variable       | Description                                                                 |
| -------------- | ----------------------------------------------------------------------------- |
| `MONGODB_URI`  | Connection string for a local MongoDB instance or a MongoDB Atlas cluster.    |
| `PORT`         | Port the Express server listens on (defaults to `5000`).                      |
| `JWT_SECRET`   | Long random string used to sign login sessions. Generate one with the command below. |

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**3. Start the server**

```bash
npm start        # plain node
npm run dev       # nodemon, auto-restarts on file changes
```

Visit `http://localhost:5000`. You'll be redirected to `/login.html` — create an account there.

**4. (Optional) Load the original starter data**

After signing up, load the original notepad figures into your new account:

```bash
npm run seed -- youremail@example.com
```

This only fills sections that are still empty — it won't overwrite anything you've already entered.

## How it works

- `frontend/notepad.html` calls `GET /api/state` on load and `PUT /api/state/:section` (debounced) whenever a row, item name, price, or budget changes.
- Each of the three sections is stored as one MongoDB document: `{ user, section, budget, items: [{ day, name, price }] }` in the `sections` collection.
- All `/api/state*` routes require a valid session cookie; `GET /api/auth/me` is used by the frontend to confirm who's signed in.

## Tech stack

Node.js, Express, MongoDB/Mongoose, bcryptjs, jsonwebtoken — vanilla HTML/CSS/JS on the frontend (no framework, no build tooling).
