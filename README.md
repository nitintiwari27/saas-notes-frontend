# Multi-Tenant  SAAS Notes Application

> A secure, multi-tenant notes application with role-based access control and subscription-based feature gating.

---

## Overview
Whenever a new user registers, they automatically become the Admin of that account. After logging in, the Admin can invite other members to join the account.

Each account on the Free Plan is limited to creating up to three notes in total. Once this limit is reached, no additional notes can be created unless the account is upgraded. Only the Admin has the authority to upgrade the account.

Members can only perform CRUD operations (Create, Read, Update, Delete) on notes, while subscription management and upgrades remain restricted to the Admin.

For handling payments, Razorpay has been integrated into the system.

---

## Features

- **Multi-Tenancy**: Support for multiple tenants/account with strict data isolation

- **Authentication**: JWT-based authentication system

- **Authorization**: Role-based access control (Admin/Member)

- **Subscription Plans**: Free (3 notes limit) and Pro (unlimited notes)

- **CRUD Operations**: Full Create, Read, Update, Delete functionality for notes

- **Responsive Frontend**: Minimal React-based UI hosted on Vercel

---

## Multi-Tenancy Approach

This application uses the shared schema with **account_id** column approach for multi-tenancy. All tenant data is stored in the same database schema, but each table contains a **account_id** that ensures strict data isolation between tenants/accounts. This approach was chosen because:

  - It's efficient for a moderate number of tenants

  - Simplifies database maintenance compared to schema-per-tenant

  - Reduces infrastructure costs compared to database-per-tenant

  - Maintains strong data isolation through application-level checks
  
All database queries include a tenant filter to prevent cross-tenant data access.

---

## Authentication & Authorization

- JWT-based login. JWT payload contains:
  - `user id`
  - `account id`
  - `role` (`admin` or `member`)

- Roles & permissions
  - **Admin**: invite users, upgrade subscriptions (POST `/tenants/:slug/upgrade`).
  - **Member**: create, view, edit, delete notes within the tenant.

### Test Accounts
All accounts has same password: `password`.

- **Globex**:
    
    - Admin Email: `admin@globex.test`
    - User Email: `user@globex.test`
- **Acme**:
    
    - Admin Email: `admin@acme.test`
    - User Email: `user@acme.test`


---

## Subscription Feature Gating

- **Free Plan**: Account limited to a maximum of **3 notes** (total across all tenant/account members).
- **Pro Plan**: Unlimited notes.
- **Upgrade Endpoint**: `POST /tenants/:slug/upgrade` — only accessible to Admins belonging to that account. When called, the tenant's subscription status is set to `pro` and the note limit is lifted immediately.

Implementation details:
- Each tenant has a `plan` column: `free` or `pro`.
- When creating a note, the backend checks the tenant's plan. If `free` and `noteCount >= accountLimit(3)`, the request returns `403` with payload 
```
{
    "success": false,
    "message": {
        "message": "Note limit exceeded for your current plan",
        "details": {
            "currentPlan": "free",
            "noteCount": 3,
            "maxNotes": 3,
            "upgradeRequired": true
        }
    },
    "errors": null,
    "timestamp": "2025-09-15T20:14:24.078Z"
}
```
- When the upgrade endpoint succeeds, tenant record is updated and the check will allow unlimited notes.

---

## Notes API (CRUD)

All endpoints are protected and require a valid JWT. Every endpoint enforces tenant isolation and role enforcement.

**Base path**: `/`

### Endpoints

- `POST /notes` — Create a note.
  - Members & Admins allowed.
  - Enforces tenant note limit for Free plan.

- `GET /notes` — List all notes for the current tenant.
  - Returns notes belonging to the `account` from JWT.

- `GET /notes/:id` — Retrieve a specific note (must belong to current account).

- `PUT /notes/:id` — Update a note (must belong to current account).

- `DELETE /notes/:id` — Delete a note (must belong to current account).

- `POST /tenants/:slug/upgrade` — Upgrade a tenant to Pro (Admin only).

- `POST /auth/invite` —Invite a member (Admin only).

- `GET /health` — Health check. Returns `{ "status": "ok" }`.

---

## Health

- `GET /health` returns `{ "status": "ok" }`.

---

## Frontend

- Minimal frontend (hosted on Vercel) that allows:
  - Login using the predefined accounts.
  - List notes for the logged-in tenant.
  - Create new notes.
  - Delete notes.
  - When tenant is Free and has reached the 3-note limit, the UI shows a clear **"Upgrade to Pro"** CTA that triggers `POST /tenants/:slug/upgrade` (Admin only). For Members, the button will not be visible.

- After login, the frontend stores the JWT in `localStorage` and uses it in `Authorization: Bearer <token>` for API requests.
- The frontend reads the `account` from the token (or user profile endpoint) and displays tenant-specific data.

---

## Deployment (Vercel)

**Backend**
- The backend is deployed on render.

**Frontend**
- The frontend is a React app deployed to Vercel.
- Configure the frontend's environment variable `VITE_API_URL` to point to the deployed backend API.


---
