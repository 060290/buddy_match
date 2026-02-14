# BuddyMatch

A full-stack web platform for **reactive dog owners** to safely connect, coordinate training meetups, communicate, and access structured support in a location-aware community.

## Features

- **Auth**: Register, log in, profile with location (lat/lng) and safety pledge
- **Meetups**: Create and browse training meetups with location and date; RSVP; message organizer
- **Nearby**: Find other users near you (by profile or device location) and message them
- **Messages**: In-app conversations with other members
- **Support**: Structured articles (reactivity basics, safety guidelines, parallel walking, body language, when to get help)
- **Dogs**: Profile your dogs (backend API ready; optional UI can be extended)
- **Reports**: Report users or posts (backend only)

## Tech stack

- **Backend**: Node.js, Express, Prisma (SQLite), JWT auth (cookie + Bearer), bcrypt
- **Frontend**: React 18, Vite, React Router; cookie-based auth with API proxy

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env   # optional: set JWT_SECRET, PORT, FRONTEND_ORIGIN
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```

API runs at **http://localhost:3001** (or set `PORT` in `.env` if the port is in use). Health: `GET /api/health`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173** and proxies `/api` to the backend.

### Demo account (after seed)

- Email: `demo@buddymatch.example`
- Password: `demo1234`

## Project structure

```
backend/
  prisma/
    schema.prisma   # User, Dog, Post, Rsvp, Message, Report, SupportArticle
    seed.js         # Support articles + optional demo user
  src/
    index.js        # Express app, CORS, cookie-parser, routes
    middleware/auth.js
    routes/        # auth, users, dogs, posts, messages, reports, support

frontend/
  src/
    api.js          # fetch wrapper with credentials
    context/AuthContext.jsx
    components/    # Layout, Nav
    pages/         # Home, Login, Register, Dashboard, Meetups, CreateMeetup, MeetupDetail,
                   # Messages, Support, Article, Profile, Nearby
```

## API overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | no | Register |
| POST | /api/auth/login | no | Login |
| POST | /api/auth/logout | no | Logout |
| GET | /api/auth/me | cookie | Current user |
| GET/PATCH | /api/users/me | yes | Profile |
| POST | /api/users/me/safety-pledge | yes | Take pledge |
| GET | /api/users/nearby?lat=&lng=&radiusKm= | yes | Nearby users |
| CRUD | /api/dogs | yes | My dogs |
| GET | /api/posts | optional | List meetups (optional lat/lng/radiusKm) |
| GET/POST/PATCH/DELETE | /api/posts | yes | Meetup CRUD |
| POST/DELETE | /api/posts/:id/rsvp | yes | RSVP |
| GET | /api/messages/conversations | yes | Conversations |
| GET | /api/messages/with/:userId | yes | Thread |
| POST | /api/messages | yes | Send message |
| GET | /api/support | no | Articles by category |
| GET | /api/support/:slug | no | One article |
| POST | /api/reports | yes | Report user/post |

## License

MIT
