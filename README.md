# 🛒 ShopStack — Enterprise Multi-Vendor Marketplace

> A full-stack, multi-role e-commerce marketplace built with **React + Vite** (frontend) and **Spring Boot** (backend), using **MySQL** for persistence and **JWT** for stateless authentication.

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [System Architecture](#-system-architecture)
4. [Folder Structure](#-folder-structure)
5. [Database Schema](#-database-schema)
6. [User Roles & Permissions](#-user-roles--permissions)
7. [API Reference](#-api-reference)
8. [Frontend Components](#-frontend-components)
9. [Authentication & Security](#-authentication--security)
10. [Setup & Installation](#-setup--installation)
11. [Environment Variables](#-environment-variables)
12. [Running the Project](#-running-the-project)
13. [Key Features](#-key-features)
14. [Known Limitations & TODOs](#-known-limitations--todos)

---

## 🏠 Project Overview

**ShopStack** is a multi-vendor marketplace platform where:

- **Customers** browse products, add items to cart, and place orders.
- **Vendors** register their store, list products, and submit them for admin review.
- **Admins** approve/reject vendors and products, and manage commission rates.

The project is structured as a **monorepo** with two top-level directories:

```
ShopStack/
├── backend/    ← Spring Boot REST API (Java 17)
└── frontend/   ← React 19 + Vite SPA
```

---

## 🧰 Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI library |
| Vite | 8.x | Build tool + dev server |
| React Router DOM | 7.x | Client-side routing |
| Axios | 1.x | HTTP client |
| Tailwind CSS | 4.x | Utility-first styling |
| Lucide React | 1.x | Icon library |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Runtime |
| Spring Boot | 3.x | Application framework |
| Spring Security | 6.x | Auth + authorization |
| Spring Data JPA | 3.x | ORM / database access |
| Hibernate | 6.x | JPA implementation |
| MySQL | 8.x | Primary database |
| Lombok | Latest | Boilerplate reduction |
| JJWT | Latest | JWT token generation/validation |

---

## 🏗️ System Architecture

```
Browser (React SPA @ :5173)
        │
        │  HTTP/REST (Axios)
        ▼
Spring Boot API Server (@ :8082)
        │
        ├── JwtAuthenticationFilter (validates Bearer token on every request)
        │
        ├── Controllers (REST endpoints)
        │       ├── AuthController       → /api/auth/**
        │       ├── ProductController    → /api/products/**, /api/vendor/products/**
        │       ├── ProfileController    → /api/profiles/**
        │       ├── AdminController      → /api/admin/**
        │       ├── CategoryController   → /api/categories/**
        │       └── UploadController     → /api/upload/**
        │
        ├── Services (business logic)
        │
        ├── Repositories (Spring Data JPA)
        │
        └── MySQL Database (@ :3306/shopstack)
```

### Request Flow

```
User Action → React Component → API function (src/api/*.js)
           → Axios Interceptor (attaches JWT)
           → Spring Boot Controller
           → Spring Security Filter (validates JWT → extracts role)
           → Service Layer (business logic)
           → JPA Repository → MySQL
           → JSON Response → React State Update → UI Re-render
```

---

## 📁 Folder Structure

### Backend

```
backend/
└── src/main/java/com/shopstack/shopstack/
    ├── ShopstackApplication.java       ← Entry point
    ├── CategorySeeder.java             ← Seeds default categories on startup
    │
    ├── controller/
    │   ├── AuthController.java         ← Register, Login
    │   ├── ProductController.java      ← CRUD products (public + vendor + admin)
    │   ├── ProfileController.java      ← Vendor & Customer profile management
    │   ├── AdminController.java        ← Vendor approval, product moderation
    │   ├── CategoryController.java     ← Category listing & creation
    │   └── UploadController.java       ← Image file upload & serving
    │
    ├── model/
    │   ├── User.java                   ← Core user entity (email, password, role)
    │   ├── Role.java                   ← Enum: CUSTOMER, VENDOR, ADMIN
    │   ├── VendorProfile.java          ← Vendor store details (storeName, status, commission)
    │   ├── VendorStatus.java           ← Enum: PENDING_APPROVAL, APPROVED, REJECTED
    │   ├── CustomerProfile.java        ← Customer shipping/billing addresses
    │   ├── Product.java                ← Product entity (name, price, stock, status)
    │   ├── ProductStatus.java          ← Enum: DRAFT, PENDING_APPROVAL, APPROVED, REJECTED
    │   ├── ProductImage.java           ← Product image URLs (linked to Product)
    │   ├── ProductReview.java          ← Customer reviews (rating, comment)
    │   └── Category.java              ← Product categories
    │
    ├── repository/                     ← Spring Data JPA interfaces (auto-generated SQL)
    │
    ├── service/                        ← Business logic layer (validation, orchestration)
    │
    ├── dto/                            ← Data Transfer Objects (request/response shapes)
    │
    └── security/
        ├── SecurityConfig.java         ← CORS, CSRF, route permissions, JWT filter setup
        ├── JwtAuthenticationFilter.java← Extracts and validates JWT on every request
        └── JwtUtil.java               ← JWT generation & parsing (using JJWT)
```

### Frontend

```
frontend/
├── .env                                ← Environment variables (API base URL)
├── vite.config.js
├── index.html
└── src/
    ├── App.jsx                         ← Root router with role-guarded routes
    ├── main.jsx                        ← React DOM entry point
    ├── index.css                       ← Global styles + design tokens (CSS variables)
    │
    ├── api/                            ← All Axios API calls (grouped by domain)
    │   ├── client.js                   ← Axios instance (base URL, JWT interceptor)
    │   ├── auth.js                     ← login(), register()
    │   ├── products.js                 ← searchProducts(), createProduct(), approveProduct()...
    │   ├── vendors.js                  ← getVendorProfile(), getAllVendors(), updateVendorStatus()...
    │   └── upload.js                   ← uploadProductImage() (multipart/form-data)
    │
    ├── context/
    │   ├── AuthContext.jsx             ← Global auth state (user, token, login, logout)
    │   └── CartContext.jsx             ← Global cart state (items, add, remove, subtotal)
    │
    ├── components/
    │   ├── layout/
    │   │   └── Navbar.jsx              ← Responsive navbar with role-based nav links & dropdowns
    │   └── guards/
    │       └── ProtectedRoute.jsx      ← ProtectedRoute (any auth) + RoleRoute (specific role)
    │
    └── pages/
        ├── auth/
        │   ├── Login.jsx
        │   └── Register.jsx
        ├── home/
        │   └── Home.jsx               ← Marketplace: product grid, search, filter, cart, modal
        ├── customer/
        │   ├── CustomerDashboard.jsx
        │   ├── Profile.jsx             ← Edit shipping/billing address, phone
        │   └── Orders.jsx
        ├── vendor/
        │   ├── VendorDashboard.jsx     ← Product CRUD, image upload, submit for approval
        │   └── VendorProfile.jsx       ← Edit store info (name, description, tax ID, license)
        ├── admin/
        │   ├── AdminDashboard.jsx      ← Product approval queue + category management
        │   └── AdminProfile.jsx        ← Vendor management (status, commission rate)
        └── misc/
            └── Fallback.jsx            ← 404 NotFound + Unauthorized pages
```

---

## 🗄️ Database Schema

> Tables are auto-created by Hibernate (`spring.jpa.hibernate.ddl-auto=update`).

```
┌──────────────────┐     ┌──────────────────────┐
│      users       │──┐  │   vendor_profiles    │
│─────────────────-│  └─▶│─────────────────────-│
│ id (UUID PK)     │     │ id (UUID PK)          │
│ first_name       │     │ user_id (FK → users)  │
│ last_name        │     │ store_name (UNIQUE)   │
│ email (UNIQUE)   │     │ description           │
│ password (hash)  │     │ business_license      │
│ role (ENUM)      │     │ tax_id                │
└──────────────────┘     │ status (ENUM)         │
         │               │ commission_rate       │
         │               │ created_at / updated_at│
         │               └──────────────────────┘
         │
         │    ┌──────────────────────┐
         └───▶│  customer_profiles   │
              │──────────────────────│
              │ id (UUID PK)         │
              │ user_id (FK → users) │
              │ phone                │
              │ shipping_address     │
              │ billing_address      │
              └──────────────────────┘

┌──────────────────┐     ┌──────────────────────┐
│    products      │──┐  │   product_images     │
│──────────────────│  └─▶│──────────────────────│
│ id (UUID PK)     │     │ id (UUID PK)         │
│ name             │     │ product_id (FK)      │
│ brand            │     │ image_url            │
│ description      │     │ is_primary           │
│ price            │     └──────────────────────┘
│ stock_quantity   │
│ status (ENUM)    │     ┌──────────────────────┐
│ vendor_id (FK)   │──┐  │   product_reviews    │
│ category_id (FK) │  └─▶│──────────────────────│
│ slug (UNIQUE)    │     │ id (UUID PK)         │
│ created_at       │     │ product_id (FK)      │
└──────────────────┘     │ user_id (FK)         │
                         │ rating (1–5)         │
┌──────────────────┐     │ comment              │
│   categories     │     │ created_at           │
│──────────────────│     └──────────────────────┘
│ id (UUID PK)     │
│ name (UNIQUE)    │
│ description      │
└──────────────────┘
```

---

## 👥 User Roles & Permissions

| Feature | Customer | Vendor | Admin |
|---|:---:|:---:|:---:|
| Browse marketplace | ✅ | ✅ | ✅ |
| Add to cart | ✅ | ❌ | ❌ |
| Write reviews | ✅ | ❌ | ❌ |
| View own orders | ✅ | ❌ | ❌ |
| Edit customer profile | ✅ | ❌ | ❌ |
| Create/edit products | ❌ | ✅ | ❌ |
| Upload product images | ❌ | ✅ | ❌ |
| Submit product for approval | ❌ | ✅ | ❌ |
| Edit store profile | ❌ | ✅ | ❌ |
| Approve/reject products | ❌ | ❌ | ✅ |
| Approve/reject vendors | ❌ | ❌ | ✅ |
| Set commission rates | ❌ | ❌ | ✅ |
| Create categories | ❌ | ❌ | ✅ |

---

## 📡 API Reference

### Auth — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login → returns JWT token | No |

### Products (Public) — `/api/products/public`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/products/public` | Search/filter products (query params: `q`, `category`, `sort`, `page`) | No |
| GET | `/api/products/public/{slug}` | Get product by slug | No |

### Categories — `/api/categories/public`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/categories/public` | List all categories | No |

### Vendor Products — `/api/vendor/products`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/vendor/products` | Get my products | VENDOR |
| POST | `/api/vendor/products` | Create product | VENDOR |
| PUT | `/api/vendor/products/{id}` | Update product | VENDOR |
| POST | `/api/vendor/products/{id}/submit` | Submit for admin approval | VENDOR |
| POST | `/api/vendor/products/{id}/image` | Add product image URL | VENDOR |

### Profiles — `/api/profiles`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/profiles/vendor` | Get my vendor profile | VENDOR |
| PUT | `/api/profiles/vendor` | Update my vendor profile | VENDOR |
| GET | `/api/profiles/customer` | Get my customer profile | CUSTOMER |
| PUT | `/api/profiles/customer` | Update my customer profile | CUSTOMER |

### Admin — `/api/admin`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/admin/vendors` | List all vendors (optional `?status=`) | ADMIN |
| PUT | `/api/admin/vendors/{id}/status` | Update vendor status & commission | ADMIN |
| GET | `/api/admin/products/pending` | List products pending review | ADMIN |
| PUT | `/api/admin/products/{id}/approve` | Approve or reject product | ADMIN |
| POST | `/api/admin/categories` | Create a new category | ADMIN |

### Upload — `/api/upload`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/upload` | Upload image file → returns `{ imageUrl }` | Yes (any role) |
| GET | `/api/upload/files/{filename}` | Serve uploaded file | No |

> **Note:** Files are stored locally in the `backend/uploads/` folder.

---

## 🧩 Frontend Components

### `App.jsx` — Router

Defines all routes with role guards:

```
/ (public)              → Home (Marketplace)
/login                  → Login
/register               → Register
/unauthorized           → Unauthorized page
/dashboard              → CustomerDashboard  [Protected]
/profile                → Customer Profile   [Protected]
/orders                 → Customer Orders    [Protected]
/vendor                 → VendorDashboard    [VENDOR only]
/vendor/profile         → VendorProfile      [VENDOR only]
/admin                  → AdminDashboard     [ADMIN only]
/admin/profile          → AdminProfile       [ADMIN only]
* (404)                 → NotFound
```

### `Navbar.jsx`

- Sticky top nav with logo, navigation links, About & Help dropdowns.
- **Role-based rendering:**
  - `CUSTOMER` — shows cart icon + "Profile" + "My Orders"
  - `VENDOR` — no cart, shows "Store Profile" link
  - `ADMIN` — no cart, shows "Manage Vendors" link
- Cart dropdown shows live item list, subtotal, and checkout button.

### `AuthContext.jsx`

Wraps the app with global auth state. Persists `token` and `user` in `localStorage`.

```js
const { user, login, logout, loading } = useAuth();
// user: { id, firstName, lastName, email, role }
```

### `CartContext.jsx`

Wraps the app with global cart state (in-memory, not persisted).

```js
const { cartItems, cartCount, cartSubtotal, addToCart, removeFromCart } = useCart();
```

### Route Guards — `ProtectedRoute.jsx`

```jsx
<ProtectedRoute />     // Redirects to /login if not authenticated
<RoleRoute role="VENDOR" />  // Redirects to /unauthorized if wrong role
```

---

## 🔐 Authentication & Security

### JWT Flow

1. **Login** → `POST /api/auth/login` → Server returns `{ token, user }`.
2. Token is stored in `localStorage` via `AuthContext`.
3. Every subsequent API request includes `Authorization: Bearer <token>` (added by Axios interceptor in `client.js`).
4. Spring's `JwtAuthenticationFilter` validates the token and sets the security context.
5. On `401` response → Axios interceptor clears storage and redirects to `/login`.

### Spring Security Rules

```
/api/auth/**              → Public (no auth)
/api/products/public/**   → Public
/api/categories/public/** → Public
/api/upload/files/**      → Public (serve images)
/api/admin/**             → ADMIN role only
/api/vendor/**            → VENDOR role only
everything else           → Any authenticated user
```

### Password Security

Passwords are hashed with **BCrypt** before storage. Plain-text passwords are never stored.

---

## ⚙️ Setup & Installation

### Prerequisites

Make sure you have the following installed:

| Tool | Version | Download |
|---|---|---|
| Java JDK | 17+ | https://adoptium.net |
| Maven | 3.9+ | Bundled via `./mvnw` |
| Node.js | 18+ | https://nodejs.org |
| MySQL | 8.x | https://dev.mysql.com/downloads/ |

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ShopStack
```

### 2. Configure MySQL

Create a MySQL database (or let Spring Boot auto-create it):

```sql
CREATE DATABASE shopstack;
CREATE USER 'shopstack_user'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON shopstack.* TO 'shopstack_user'@'localhost';
FLUSH PRIVILEGES;
```

> **Note:** By default the app uses `root` with no password on `localhost:3306`. Edit `application.properties` to change credentials.

### 3. Configure Backend Properties

Edit `backend/src/main/resources/application.properties`:

```properties
server.port=8082

spring.datasource.url=jdbc:mysql://localhost:3306/shopstack?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# JWT secret (change this in production!)
app.jwt.secret=your_super_secret_key_here
app.jwt.expiration=86400000

# Allow unlimited image uploads
spring.servlet.multipart.max-file-size=-1
spring.servlet.multipart.max-request-size=-1
```

### 4. Configure Frontend Environment

Create or edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8082
```

---

## 🚀 Running the Project

### Start the Backend

```bash
cd backend
./mvnw spring-boot:run
```

The API will be available at **http://localhost:8082**

> On first run, `CategorySeeder.java` auto-populates default product categories.

### Start the Frontend

```bash
cd frontend
npm install        # only needed once
npm run dev
```

The frontend will be available at **http://localhost:5173**

### Default Test Accounts

You can register accounts via the UI with any email. Choose your role during registration:
- `CUSTOMER` — default marketplace shopper
- `VENDOR` — apply to sell (requires admin approval)

> Admin accounts are typically created directly in the database or by seeding.

---

## 🌟 Key Features

### Marketplace (Home Page)
- Live product search with debounce
- Filter by category
- Sort by: newest, price (asc/desc), rating
- Product modal with image, description, rating, and Add to Cart
- Responsive product grid with glassmorphism cards

### Vendor Dashboard
- Full product CRUD (Create, Read, Update)
- Image upload directly from file system (any size supported)
- Draft → Submit for Approval workflow
- Product status tracking (Draft → Pending → Approved/Rejected)
- Inventory value stats

### Vendor Profile
- Edit store name, description, business license, tax ID
- View-only: commission rate, approval status, join date

### Admin Dashboard
- Review pending products → Approve or Reject
- Create and manage categories
- Full vendor list with status filter and search
- Inline edit: change vendor status and commission rate per vendor

### Cart (Customer)
- Add/remove products from any page
- Live item count badge on navbar
- Cart dropdown with subtotal

---

## ⚠️ Known Limitations & TODOs

| Area | Status | Notes |
|---|---|---|
| Image storage | ⚠️ Local disk | Production should use AWS S3 / Cloudinary |
| Orders | 🔲 Placeholder | Orders page exists but checkout is not fully implemented |
| Payments | 🔲 Not implemented | Razorpay / Stripe integration pending |
| Pagination | 🔲 Partial | Product list has API support; UI pagination not fully built |
| Email notifications | 🔲 Not implemented | No email on vendor approval / order confirmation |
| Tests | 🔲 Not implemented | No unit or integration tests yet |
| Docker | 🔲 Not implemented | No Dockerfile or docker-compose yet |
| HTTPS | 🔲 Dev only | TLS termination needed for production deployment |

---


This project was developed as part of the **Infosys Springboard** program.

To contribute:
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request

---

DEVELOPED BY
TEAM B
