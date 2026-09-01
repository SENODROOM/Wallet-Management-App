# Wallet Notepad

A small personal finance notepad with three sections — **Quantum Logics Income**, **Poly Learning Initiative**, and an adjustable **Monthly Budget** — backed by a MongoDB database behind a login. Every field is editable in place and saves automatically a moment after you stop typing.

## Features

- Three editable ledgers: a simple income log, and two budget-vs-spend trackers (Poly Learning Initiative, Monthly Budget) with an adjustable budget amount and a live "Remaining" total.
- Email/password sign up and sign in. Passwords are hashed with bcrypt; sessions are a JWT stored in an httpOnly cookie.
- The Monthly Budget runs a calendar month: on the 1st the finished month is saved to its own record and a fresh budget opens, with the budget amount carried over. Saved months sit in a strip above the ledger, read-only and still printable.
- Each account has its own private data — nothing is shared between users.
- Autosaves to MongoDB (debounced ~500ms after the last keystroke); a status dot in the utility bar shows saving/synced/error.
- Responsive, light/dark-aware UI.

## Project structure

`backend/` and `frontend/` are separate git repositories, wired into this repo as submodules (see `.gitmodules`).

```
.
├── backend/                    Express API + MongoDB models (own repo/remote)
│   ├── middleware/auth.js         JWT cookie auth (attachUser, requireAuth)
│   ├── lib/period.js                Month-boundary logic for the Monthly Budget
│   ├── models/                     Mongoose schemas (User, Section, Notepad, MonthlyArchive)
│   ├── routes/                      /api/auth/*, /api/state*, /api/notepads*, /api/monthly*
│   ├── test/period.test.js       Month rollover cases (npm test)
│   ├── server.js                    App entry point; serves the built frontend in production
│   ├── seed.js                       One-time helper to load starter data for an account
│   ├── package.json
│   └── .env.example
└── frontend/                   React (Vite) app (own repo/remote)
    ├── index.html
    └── src/
        ├── App.jsx                 Auth gate — decides Login vs Notepad
        ├── api.js                   Small fetch wrapper for the backend API
        └── components/
            ├── Login.jsx            Sign in / sign up
            ├── Notepad.jsx          Page shell, utility bar, the ledgers
            ├── MonthlyBudget.jsx    Month strip, rollover, saved-month records
            └── Ledger.jsx           One section (rows, budget, autosave; read-only for saved months)
```

## Setup

**1. Install dependencies**

```bash
cd backend && npm install
cd ../frontend && npm install
```

**2. Configure environment variables**

```bash
cd backend
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

**3. Run it**

During development, run the backend and frontend separately — Vite proxies `/api` requests to the backend:

```bash
# terminal 1
cd backend && npm run dev        # http://localhost:5000

# terminal 2
cd frontend && npm run dev       # http://localhost:5173
```

Open `http://localhost:5173`, create an account, and use the app.

For a single deployed instance, build the frontend and let Express serve it:

```bash
cd frontend && npm run build     # writes frontend/dist
cd ../backend && npm start       # now serves the app at http://localhost:5000
```

**4. (Optional) Load the original starter data**

After signing up, load the original notepad figures into your new account:

```bash
cd backend
npm run seed -- youremail@example.com
```

This only fills sections that are still empty — it won't overwrite anything you've already entered.

## How it works

- `App.jsx` checks `GET /api/auth/me` on load and renders `Login` or `Notepad` accordingly — there's no client-side router, just that one gate.
- `Notepad.jsx` fetches `GET /api/state` once, and each `Ledger` autosaves its own section via `PUT /api/state/:section` (debounced ~500ms) whenever a row, item name, price, or budget changes.
- Each of the three sections is stored as one MongoDB document: `{ user, section, budget, items: [{ day, name, price }] }` in the `sections` collection.
- The browser owns the month boundary — it is the only side that knows the user's local date — so on load (and every minute, for a tab left open past midnight on the 1st) it posts the current `YYYY-MM` to `POST /api/monthly/rollover`. If the live section belongs to an earlier month, the server copies it into the `monthlyarchives` collection under that month and clears the entries and note, keeping the budget amount. Re-opening the month already in progress is a no-op.
- Sections saved before this existed carry no month, so the rollover dates them from their own day labels ("16 Aug (Saturday)") — see `backend/lib/period.js`, covered by `npm test` in `backend/`.
- Saved months are read via `GET /api/monthly/history` (one summary per month) and `GET /api/monthly/history/:period` (the full record). They are records, not sheets: the UI renders them without inputs, and there is no route to edit one.
- All `/api/state*`, `/api/notepads*` and `/api/monthly*` routes require a valid session cookie.

## Tech stack

**Backend:** Node.js, Express, MongoDB/Mongoose, bcryptjs, jsonwebtoken.
**Frontend:** React, Vite. No CSS framework — the design is a small hand-written system (serif headings, monospace tabular figures, hairline rules) defined in `frontend/src/styles.css`.
