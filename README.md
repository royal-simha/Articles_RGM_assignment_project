# Chronicle Editorial · Blog Management System
> **Version 1.0 · Full-Stack Relational Web Application**

A production-style editorial publishing and blog management platform inspired by modern editorial dashboards (e.g. *kitful.ai*). Built with **React + Vite**, **Node.js + Express**, and **Prisma ORM** with normalized relational database models (**SQLite** for zero-friction local development & automated testing, and **PostgreSQL** for production deployment).

---

## 🌟 Key Features

### 1. Role-Based Access Control (RBAC)
- **Visitors**: Explore published articles, full-text search, category and tag filtering, reading time estimates, view discussion threads.
- **Readers**: Visitor capabilities + submit comments, edit/delete their own comments, personalize reader profile.
- **Creators**: Reader capabilities + personal author workspace (`/dashboard`), compose dispatches with live Markdown preview (`/editor`), save drafts, publish/unpublish articles, edit/delete own posts, moderate comments on their articles.
- **Administrators**: Full system governance (`/admin`), view platform KPI metrics, activate/deactivate user accounts, elevate/modify user roles, moderate/delete any comment across the platform.

### 2. Editorial Design & Aesthetics
- **Bespoke Styling**: Warm terracotta and stone editorial palette with balanced contrast.
- **Typography Hierarchy**: *Newsreader* for editorial titles and pull-quotes, *Inter* for crisp UI controls, and *JetBrains Mono* for code blocks.
- **Dark & Light Mode**: Seamless theme switcher with local storage persistence.
- **Interactive UI**: Micro-animations, responsive layout across mobile, tablet, and desktop, card hover elevations, accessible dialog modals, and animated toast feedback.

### 3. Engineering Rigor
- **Authoritative Server Validation**: Zero reliance on client-side security; every protected route verifies identity and RBAC permissions on the server.
- **Normalized Relational Schema**: Enforced foreign keys, cascade deletion policies (no orphaned comments or tag links), unique slugs, and indexes on critical query paths (`status`, `published_at`, `author_id`, `category_id`).
- **Comprehensive Test Suite**: 21 automated integration tests covering authentication, post CRUD, authorization guards, and comments.

---

## 📁 Project Architecture

```
blog-management-system/
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── api/                # API client with JWT attachment & error normalization
│   │   ├── context/            # Auth, Theme, and Toast state providers
│   │   ├── components/         # Reusable Navbar, Footer, BlogCard, Modal, Badges, Skeletons
│   │   ├── pages/              # Home, Article Detail, Creator Dashboard, Editor, Admin, Auth
│   │   ├── utils/              # Markdown parser, date formatters, reading time calculator
│   │   ├── App.jsx             # React Router configuration & route guards
│   │   ├── index.css           # Bespoke editorial CSS design system
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js          # Dev server with proxy to backend API
│
├── server/                     # Backend Application (Node.js + Express)
│   ├── src/
│   │   ├── config/             # Environment variables and Prisma client singleton
│   │   ├── controllers/        # Request handlers (auth, post, comment, category, admin)
│   │   ├── middleware/         # JWT verification, RBAC guards, error handling, rate limiting
│   │   ├── routes/             # REST API routes under /api/v1
│   │   ├── services/           # Core business logic & database transactions
│   │   ├── utils/              # ApiResponse, ApiError, and slug generator
│   │   ├── validators/         # Zod schemas for input validation
│   │   ├── app.js              # Express app configuration with Helmet, CORS, and logging
│   │   └── server.js           # Server bootstrap and graceful shutdown
│   ├── prisma/
│   │   ├── schema.prisma       # SQLite schema (default for zero-dependency local dev)
│   │   ├── schema.postgresql.prisma # PostgreSQL schema (for production deployment)
│   │   └── seed.js             # Realistic seed data (users, categories, tags, posts, comments)
│   ├── tests/
│   │   └── api.test.js         # Vitest + Supertest integration test suite (21 tests)
│   └── package.json
│
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v18+ (tested on Node v22)
- **npm** v9+

### 1. Database Setup & Seeding

The application uses Prisma with SQLite by default so it runs immediately out of the box without requiring external database installation:

```bash
# Navigate to the server folder
cd server

# Install dependencies (if not already installed)
npm install

# Push schema to SQLite database and generate Prisma Client
npx prisma db push

# Seed database with demo users, categories, tags, posts, and comments
node prisma/seed.js
```

### 2. Pre-Configured Demo Credentials

The seed script creates three ready-to-use accounts for immediate testing:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@blog.dev` | `AdminPass123!` | Full platform administration, user management, moderation |
| **Creator** | `creator@blog.dev` | `CreatorPass123!` | Write, edit, publish, delete articles, author dashboard |
| **Reader** | `reader@blog.dev` | `ReaderPass123!` | Read dispatches, participate in discussions, edit comments |

*(Tip: On the `/login` page, you can click the quick-fill demo buttons to sign in with one click).*

### 3. Run the Applications

#### Option A: Run Server & Client Simultaneously (from project root)
```bash
# Terminal 1: Start Backend API (Port 5000)
npm run server

# Terminal 2: Start Frontend Client (Port 5173)
npm run client
```

#### Option B: Run Individually
```bash
# Start Backend
cd server
npm run dev

# Start Frontend
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🧪 Running Automated Tests

Run the full automated integration test suite with Vitest:

```bash
cd server
npm test
```

### Test Coverage Summary:
- **Health Check**: Verifies `/api/v1/health` status.
- **Authentication**:
  - Registration of new users.
  - Rejection of duplicate email addresses (FR-04).
  - Validation of password complexity and email format (FR-03).
  - Invalid password rejection.
  - Retrieval of current user profile via Bearer token (FR-06).
  - Token-missing unauthorized rejection (FR-07).
- **Post CRUD & RBAC**:
  - Creator can create draft articles (FR-08, FR-09).
  - Readers cannot create articles (Server RBAC check).
  - Drafts are hidden from unauthorized visitors (FR-14).
  - Creator can publish draft to live homepage (FR-10).
  - Public visitors can access published post (FR-13).
  - Unauthorized users cannot modify others' posts (Security).
- **Comments**:
  - Authenticated readers can submit comments (FR-16).
  - Anonymous comments are rejected.
  - Comment author can edit and delete own comments (FR-17).
- **Admin Management**:
  - Admin can retrieve platform statistics.
  - Ordinary creators/readers cannot access `/admin/users` (FR-30).
  - Admin can remove abusive content across platform (FR-28).

---

## 📡 REST API Reference (`/api/v1`)

### Authentication & Profiles
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new reader or creator account | Public |
| `POST` | `/auth/login` | Authenticate with email and password | Public |
| `POST` | `/auth/logout` | End session / clear token | Public |
| `GET` | `/auth/me` | Retrieve currently authenticated user profile | Bearer Token |
| `PATCH` | `/auth/profile` | Update name, biography, or avatar URL | Bearer Token |

### Articles & Dispatches
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/posts` | List published posts with search, category, tag, & pagination | Public |
| `GET` | `/posts/:slug` | View article by slug (drafts restricted to author/admin) | Optional |
| `POST` | `/posts` | Create new post (title, summary, content, category, tags, status) | Creator / Admin |
| `PATCH` | `/posts/:id` | Update post (author or admin only) | Creator / Admin |
| `DELETE` | `/posts/:id` | Permanently delete post and cascade comments | Creator / Admin |
| `GET` | `/users/me/posts` | Retrieve current creator's posts with draft/published metrics | Creator / Admin |

### Discussion & Comments
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/posts/:id/comments` | List approved comments for a post | Public |
| `POST` | `/posts/:id/comments` | Add comment to a published article | Authenticated |
| `PATCH` | `/comments/:id` | Edit own comment | Comment Author |
| `DELETE` | `/comments/:id` | Delete comment | Author / Post Creator / Admin |
| `PATCH` | `/comments/:id/moderate` | Moderate comment status (`approved`, `rejected`) | Post Creator / Admin |

### Categories & Tags
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/categories` | List all topic categories with published article counts | Public |
| `POST` | `/categories` | Create new editorial category | Admin |
| `GET` | `/tags` | List all tags with frequency counts | Public |

### Administration
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/stats` | Platform overview KPIs (users by role, articles, comments) | Admin |
| `GET` | `/admin/users` | List registered users with pagination and search | Admin |
| `PATCH` | `/admin/users/:id/status` | Toggle user active/suspended status | Admin |
| `PATCH` | `/admin/users/:id/role` | Modify user role (`reader`, `creator`, `admin`) | Admin |
| `GET` | `/admin/comments` | Global comment moderation queue | Admin |

---

## 🗄️ Database Schemas (SQLite & PostgreSQL)

The system is configured with two schemas:
1. `server/prisma/schema.prisma`: Configured for SQLite with UUID string identifiers, relation cascades, and index definitions for local operation.
2. `server/prisma/schema.postgresql.prisma`: Configured for PostgreSQL with native UUIDs, TIMESTAMPTZ, and native PostgreSQL ENUMs (`Role`, `PostStatus`, `CommentStatus`).

### Switching to PostgreSQL (e.g. Supabase, Neon, Render, Local Postgres):
1. In `server/.env`, set your connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/blog_db?schema=public"
   ```
2. Apply the PostgreSQL schema:
   ```bash
   cd server
   npx prisma db push --schema=prisma/schema.postgresql.prisma
   node prisma/seed.js
   ```

---

## 🔒 Security Best Practices Implemented
- **Password Hashing**: Bcrypt with salt factor 10; plaintext passwords are never stored.
- **SQL Injection Prevention**: Prisma ORM with parameterized queries.
- **Cross-Site Scripting (XSS)**: Safe Markdown parser rendering sanitized React elements.
- **Rate Limiting**: `express-rate-limit` on `/auth/*` and comment submissions.
- **HTTP Headers**: `helmet` enabled for secure headers.
- **Ownership Verification**: Backend strictly enforces post and comment ownership against authenticated `req.user.id`.
