# CivicEye Backend

Backend API for **CivicEye**, an AI-assisted civic issue reporting, classification, and
municipal routing platform. Implements the architecture described in the CivicEye paper
(Sections V–VIII): a Node.js/Express REST API, MongoDB data store, JWT authentication, and
a Google Cloud Vision–based AI Detection + rule-based Classification/Routing pipeline.

This backend is built to match the API contract already expected by the
[CivicEye frontend](https://github.com/Architaaa02/CivicEye) (`src/services/api.js`).

## Tech Stack

- **Node.js / Express.js** — REST API
- **MongoDB / Mongoose** — data store (users, issues, geospatial index)
- **JWT (jsonwebtoken) + bcryptjs** — authentication, hashed passwords, role-based access
- **@google-cloud/vision** — AI Detection Module (image label detection)
- **multer** — image upload handling (in-memory, then written to `/uploads`)
- **helmet, cors, express-rate-limit, morgan** — security & logging middleware

## Project Structure

```
civiceye-backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # register / login / me
│   └── issueController.js     # submit, list, update status, stats, heatmap
├── middleware/
│   ├── auth.js                # JWT verification + role-based access control
│   ├── upload.js               # multer image upload config
│   └── errorHandler.js
├── models/
│   ├── User.js                 # citizen / admin / system_admin
│   └── Issue.js                # complaint record, GeoJSON location, status history
├── routes/
│   ├── authRoutes.js
│   └── issueRoutes.js
├── services/
│   ├── visionService.js        # AI Detection Module (Google Cloud Vision)
│   ├── classificationService.js# Issue Classification Module
│   └── routingService.js       # Department Routing + Notification stub
├── utils/
│   ├── taxonomy.js             # rule-based label → category/department/severity mapping
│   ├── generateToken.js
│   └── seed.js                 # provisions admin accounts
├── uploads/                    # locally stored complaint images (static-served)
├── app.js                      # Express app wiring
├── server.js                   # entrypoint
└── .env.example
```

## Setup

1. **Install dependencies**
   ```
   npm install
   ```

2. **Configure environment**
   ```
   cp .env.example .env
   ```
   At minimum set:
   - `MONGO_URI` — your MongoDB connection string
   - `JWT_SECRET` — a long random string
   - `GOOGLE_APPLICATION_CREDENTIALS` — path to a GCP service-account JSON key with the
     **Cloud Vision API** enabled (see [Vision API docs](https://cloud.google.com/vision)).
     If unset, complaint submission still works but falls back to `category: "Other"` /
     `department: "General Administration"` for manual triage.

3. **Seed admin accounts** (public registration only creates citizen accounts)
   ```
   npm run seed
   ```
   Prints the seeded department-admin emails and a shared default password
   (override with `SEED_ADMIN_PASSWORD` in `.env`).

4. **Run**
   ```
   npm run dev     # nodemon, auto-reload
   npm start       # production
   ```
   Server listens on `PORT` (default `5000`).

## API Reference

All endpoints are prefixed with `/api`. Protected routes require
`Authorization: Bearer <token>`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | public | Create a citizen account |
| POST | `/auth/login` | public | Authenticate, returns JWT |
| GET | `/auth/me` | authenticated | Current user profile |
| POST | `/issues` | citizen | Submit a complaint (`multipart/form-data`: `image`, `description`, `lat`, `lng`, `address`) |
| GET | `/issues/user` | citizen | List the caller's own complaints |
| GET | `/issues/:id` | owner or admin | Fetch a single complaint |
| GET | `/issues` | admin | List/filter all complaints (`status`, `category`, `department`, `severity`, `page`, `limit`) |
| PATCH | `/issues/:id/status` | admin | Update status (`Submitted`, `In Progress`, `Resolved`, `Rejected`) |
| GET | `/issues/stats` | admin | Aggregate counts by status/category/department |
| GET | `/issues/heatmap` | admin | Geo points for map/heatmap visualization |
| GET | `/health` | public | Liveness check |

Department-scoped admins (`role: admin`, `department` set) automatically see only their
department's complaints on `/issues`, `/issues/stats`, and `/issues/heatmap`.
`role: system_admin` sees everything.

### Example: submit a complaint

```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@pothole.jpg" \
  -F "description=Large pothole blocking half the lane" \
  -F "lat=22.3072" \
  -F "lng=73.1812" \
  -F "address=Near Parul University, Vadodara"
```

## How classification & routing work (Algorithm 1)

1. Image is validated and forwarded to the **Google Cloud Vision API** (`visionService.js`)
   for label detection.
2. Returned labels are matched against a configurable keyword taxonomy
   (`utils/taxonomy.js`) to assign a **category** (Road Damage, Drainage Problem, Illegal
   Dumping, Streetlight Failure, Fallen Tree, or Other) and the **responsible department**.
3. The free-text description is scanned for severity keywords (e.g. "dangerous",
   "collapsed", "minor") to assign a **severity** level.
4. The complaint is stored in MongoDB with a `routedAt` timestamp for auditing, and a
   notification event is dispatched (`routingService.js` — currently logs; swap in
   WebSocket/queue delivery when that layer is built, per the paper's future-work section).
5. Citizens track status transitions (`Submitted → In Progress → Resolved`) via
   `GET /issues/user` / `GET /issues/:id`; admins update status via `PATCH /issues/:id/status`.

## Notes / things to configure before production use

- **Image storage**: currently written to local disk under `/uploads` and served
  statically. For production, swap `saveImageToDisk` in `issueController.js` for a Cloud
  Storage / S3 upload and store the resulting URL instead.
- **Vision API credentials**: requires a real GCP project with Vision API enabled and
  billing configured.
- **Real-time notifications**: WebSocket push is stubbed (`routingService.notify`), matching
  the paper's statement that this is a planned extension, not yet implemented.
- **Rate limiting / CORS**: defaults are permissive for development — tighten
  `CLIENT_ORIGIN` and rate limits before deploying.
