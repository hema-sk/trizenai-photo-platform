# 📸 TrizenAI - Photo Sharing Platform

> From camera → team uploads → admin selection → private customer gallery.

A full-stack event photo-sharing platform built for the **TrizenAI Full-Stack Internship Challenge**.

The platform supports a real-world workflow where photographers collaboratively upload event photos, an Admin reviews and selects the photos worth sharing, and the customer receives a private gallery link protected by a PIN — without needing to create an account.

---

## 🌍 Live Demo

### Frontend

https://trizenai-photo-platform-silk.vercel.app/

### Backend API

https://trizenai-photo-platform-production.up.railway.app/

### Source Code

https://github.com/hema-sk/trizenai-photo-platform

---

## ✨ What This Project Does

- Admin / Lead can create events, add team members, review uploaded photos, select photos, and publish customer galleries.
- Team Members can view their assigned events, upload photos, and manage their own uploads.
- Customers can open a shared gallery link, enter a PIN, and browse published photos without logging in.
- The application enforces access control at the API level, not only through the frontend UI.
- Photos are stored using Cloudinary rather than directly inside the database.

---

# 👥 User Roles

## 🧑‍💼 Admin / Lead

Admins can:

- Log in
- Create events
- Add team members to events
- View photos uploaded by the event team
- Select photos for publishing
- Create galleries
- Set and change gallery PINs
- Publish galleries
- Copy and share the gallery link

---

## 📷 Team Member

Team Members can:

- Register and log in
- View only events assigned to them
- Upload multiple event photos
- View their uploaded photos
- Remove their own uploaded photos

### Team Members cannot:

- Publish galleries
- Manage other users' photos
- Manage events they are not assigned to

---

## 💌 Customer

Customers do not need an account.

They receive:

- Gallery Link
- Gallery PIN

They can then:

1. Open the gallery link
2. Enter the PIN
3. View the published photos
4. Browse the gallery

---

# 🔄 Application Workflow

```text
Admin
  ↓
Create Event
  ↓
Assign Team Members
  ↓
Team Members Upload Photos
  ↓
Admin Reviews Photos
  ↓
Admin Selects Photos
  ↓
Create Gallery
  ↓
Set Gallery PIN
  ↓
Publish Gallery
  ↓
Customer Opens Gallery Link
  ↓
Enters PIN
  ↓
Browses Published Photos
```

---

# 🛠️ Technology Stack

## Frontend

* React
* Vite
* Tailwind CSS
* Axios
* React Router

## Backend

* Python
* Django
* Django REST Framework
* Simple JWT

## Database

* MySQL

## Photo Storage

* Cloudinary

Uploaded image files are stored in cloud storage rather than directly inside the database.

The database stores photo metadata and the cloud storage location.

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      Customer       │
                    │  Gallery + PIN      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ React + Vite        │
                    │ Frontend            │
                    └──────────┬──────────┘
                               │
                           REST API
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Django REST API     │
                    │                     │
                    │ • Authentication    │
                    │ • Events            │
                    │ • Team Members      │
                    │ • Photos            │
                    │ • Galleries         │
                    └───────┬─────┬───────┘
                            │     │
                 ┌──────────┘     └──────────┐
                 ▼                           ▼
        ┌─────────────────┐        ┌─────────────────┐
        │      MySQL      │        │    Cloudinary   │
        │                 │        │                 │
        │ User data       │        │ Photo files     │
        │ Event data      │        │                 │
        │ Photo metadata  │        │                 │
        │ Gallery data    │        │                 │
        └─────────────────┘        └─────────────────┘
```

The frontend communicates with the backend through REST APIs.

JWT access tokens are used for authenticated requests, while customer gallery access is handled through the gallery share token and PIN flow.

---

# 🗄️ Database Design

## User

Stores application users and their roles.

```text
User
├── id
├── username
├── email
├── password
└── role
    ├── ADMIN
    └── TEAM_MEMBER
```

---

## Event

Represents an event project.

```text
Event
├── id
├── name
├── description
├── location
├── event_date
├── created_by
└── created_at
```

---

## EventMember

Connects team members to their assigned events.

```text
EventMember
├── id
├── event
├── user
└── assigned_at
```

An event and team member combination is unique, preventing duplicate assignments.

---

## Photo

Stores photo metadata.

```text
Photo
├── id
├── event
├── uploaded_by
├── filename
├── storage_location
├── file_size
├── created_at
└── is_selected
```

The actual image file is stored in Cloudinary.

The database stores the photo metadata and storage location.

---

## Gallery

Represents the customer-facing gallery.

```text
Gallery
├── id
├── event
├── share_token
├── pin_hash
├── is_published
├── created_at
└── created_by
```

Each event can have one gallery.

---

# 🔐 Authentication & Authorization

The application uses **JWT-based authentication** for Admin and Team Member accounts.

## Authentication Flow

```text
Login
  ↓
Django REST API
  ↓
JWT Access + Refresh Tokens
  ↓
Frontend Authentication State
  ↓
Access Token attached to API requests
```

The frontend also handles access-token refresh when an authenticated API request receives a `401` response.

---

## Role-Based Authorization

The backend enforces role permissions rather than relying only on frontend UI restrictions.

Examples:

* Admins can create events.
* Team Members can only access their assigned events.
* Team Members can only manage their own uploaded photos.
* Team Members cannot publish galleries.
* Admins can only manage events and galleries belonging to them.
* Customers do not require an authenticated account.

---

# 🔒 Gallery Security

Customer galleries use:

**Share Token + PIN**

The flow is:

```text
Gallery Link
     ↓
Share Token identifies gallery
     ↓
Customer enters PIN
     ↓
Backend verifies PIN
     ↓
Published gallery returned
```

Gallery PINs are stored as password hashes rather than plain text.

Incorrect PINs are rejected, and unpublished galleries cannot be accessed through the public gallery endpoint.

---

# ☁️ Photo Storage

Photo files are stored using **Cloudinary**.

The database stores:

* Photo ID
* Event ID
* Uploaded By
* Filename
* Storage Location
* File Size
* Created At
* Selection status

This keeps binary image files outside the relational database while allowing the application to reference stored images.

Cloudinary configuration is provided through environment variables and is not committed to the repository.

---

# 📡 API Structure

## Authentication

```text
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/refresh/
GET  /api/auth/me/
```

## Events

```text
GET  /api/events/
POST /api/events/create/
GET  /api/events/members/
POST /api/events/members/
```

## Photos

```text
GET    /api/photos/
POST   /api/photos/upload/
PATCH  /api/photos/<photo_id>/select/
DELETE /api/photos/<photo_id>/
```

## Galleries

```text
POST  /api/galleries/create/
GET   /api/galleries/event/<event_id>/
PATCH /api/galleries/<gallery_id>/set-pin/
PATCH /api/galleries/<gallery_id>/publish/
POST  /api/galleries/public/<share_token>/
```

---

# 🧪 Testing

The backend includes automated tests covering the important application flows.

## Test Summary

| Application Area |  Tests |
| ---------------- | -----: |
| Accounts         |      6 |
| Photos           |      8 |
| Galleries        |     11 |
| **Total**        | **25** |

**All 25 tests pass successfully. ✅**

---

## Authentication Tests

The authentication test suite covers:

* Public registration
* Registration cannot create an Admin account
* Admin login
* Team Member login
* Invalid login
* Authentication-protected endpoints
* Authenticated user information

---

## Photo Tests

The photo test suite covers:

* Users can view permitted photos
* Team Members cannot access another member's photos
* Admin event photo access
* Admin isolation between events
* Unassigned users cannot upload
* Users can delete their own photos
* Users cannot delete another member's photos
* Unauthenticated photo access is blocked

---

## Gallery Tests

The gallery test suite covers:

* Gallery creation
* Gallery PIN creation
* Gallery publishing
* Role restrictions
* PIN verification
* Incorrect PIN rejection
* Published photo access
* Unpublished gallery protection
* Invalid gallery link handling
* Admin ownership restrictions
* Gallery PIN changes

---

## Run the Test Suite

```bash
python manage.py test
```

---

# 📁 Project Structure

```text
trizenai-photo-platform/
│
├── accounts/
├── backend/
├── events/
├── frontend/
├── galleries/
├── photos/
│
├── manage.py
├── .gitignore
├── README.md
└── requirements.txt
```

The `frontend` directory contains the React application, while the Django apps contain authentication, event, photo, and gallery functionality.

---

# 🚀 Local Setup

## 1. Clone the Repository

```bash
git clone https://github.com/hema-sk/trizenai-photo-platform.git
cd trizenai-photo-platform
```

---

## 2. Create and Activate a Virtual Environment

### Windows PowerShell

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

---

## 3. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Configure Environment Variables

Create a `.env` file in the project root.

Example:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True

DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=3306

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

For the frontend, create:

```text
frontend/.env
```

with:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

**Never commit actual environment values, passwords, API keys, or other credentials to Git.**

---

## 5. Run Database Migrations

```bash
python manage.py migrate
```

---

## 6. Start the Backend

```bash
python manage.py runserver
```

Backend:

```text
http://127.0.0.1:8000/
```

---

## 7. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

---

## 8. Start the Frontend

```bash
npm run dev
```

Vite will provide the local frontend URL in the terminal.

---

# 🌍 Deployment

The application is deployed as separate frontend and backend services.

## Frontend

```text
React + Vite
      ↓
Frontend Hosting
      ↓
Vercel
```

## Backend

```text
Django + Django REST Framework
      ↓
Backend Hosting
      ↓
Railway
      ↓
MySQL
```

Photo files are stored using:

```text
Cloudinary
```

Production environment variables are configured through the hosting provider rather than committed to the repository.

The frontend production API URL is provided through:

```env
VITE_API_BASE_URL
```

The backend requires the production Django secret, database configuration, Cloudinary configuration, and appropriate allowed-host/security settings.

---

# ⚠️ Known Limitations

The current implementation focuses on the **core challenge workflow** rather than optional features.

Not currently included:

* Photo thumbnails/resizing
* Pagination/infinite scrolling
* Photo search/filtering
* Gallery expiration
* CI/CD pipeline
* Customer accounts
* Advanced photo editing

These features are intentionally outside the core implementation scope.

---

# 🎯 Challenge Coverage

| Requirement                    | Status |
| ------------------------------ | :----: |
| Admin authentication           |    ✅   |
| Team Member authentication     |    ✅   |
| Role-based authorization       |    ✅   |
| Event creation                 |    ✅   |
| Team assignment                |    ✅   |
| Assigned event access          |    ✅   |
| Multiple photo uploads         |    ✅   |
| Cloud photo storage            |    ✅   |
| Photo metadata                 |    ✅   |
| Admin photo review             |    ✅   |
| Photo selection                |    ✅   |
| Gallery creation               |    ✅   |
| Gallery publishing             |    ✅   |
| Shareable gallery link         |    ✅   |
| PIN-protected gallery          |    ✅   |
| Customer without account       |    ✅   |
| Incorrect PIN handling         |    ✅   |
| Unpublished gallery protection |    ✅   |
| Photo access controls          |    ✅   |
| Automated backend tests        |    ✅   |
| Responsive frontend            |    ✅   |
| README documentation           |    ✅   |
| Cloud deployment               |    ✅   |

---

# 🔑 Demo Access

The final internship submission includes:

* Live Application URL
* Demo Admin credentials
* Demo Team Member credentials
* Demo Gallery URL
* Demo Gallery PIN

For security, actual passwords and access credentials are provided separately with the internship submission rather than committed to this public repository.

---

# 💡 A Note on the Build

This project was built around the idea that every role should have a clear responsibility:

```text
Admin
Organize + Review + Publish

Team Member
Upload + Manage Own Work

Customer
Unlock + Browse
```

The implementation prioritizes:

* Complete end-to-end workflow
* API-level authorization
* Secure gallery access
* Cloud photo storage
* Automated backend testing
* Responsive user experience

---

# 📬 TrizenAI Full-Stack Internship Challenge

**Submission Email:**
talent@trizen-ai.com

**Repository:**
https://github.com/hema-sk/trizenai-photo-platform

**Live Application:**
https://trizenai-photo-platform-silk.vercel.app/

---

## 👩‍💻 Built By

**Hemalatha G**

Full-Stack Developer | Building practical web applications with React, Django and MySQL.
