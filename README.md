📸 TrizenAI - Photo Sharing Platform

> From camera → team uploads → admin selection → private customer gallery.

A full-stack event photo-sharing platform built for the TrizenAI Full-Stack Internship Challenge.

The platform supports a simple real-world workflow: photographers upload event photos collaboratively, an Admin reviews and selects the photos worth sharing, and the customer receives a private gallery link protected by a PIN - with no customer account required.

✨ What This Project Does

- Admin / Lead can create events, add team members, review uploaded photos, select photos, and publish customer galleries.
- Team Members can view their assigned events, upload photos, and manage their own uploads.
- Customers can open a shared gallery link, enter a PIN, and browse the published photos without logging in.
- The application enforces access control at the API level, not only through the frontend UI.

👥 User Roles

🧑‍💼 Admin / Lead
Admins can:
- Register and log in
- Create events
- Add team members to events
- View photos uploaded by the event team
- Select photos for publishing
- Create galleries
- Set and change gallery PINs
- Publish galleries
- Copy and share the gallery link

📷 Team Member
Team members can:
- Register and log in
- View only events assigned to them
- Upload multiple event photos
- View their uploaded photos
- Remove their own uploaded photos

Team members cannot:
- Publish galleries
- Manage other users' photos
- Manage events they are not assigned to

💌 Customer
Customers do not need an account.
They receive:
- Gallery Link
- Gallery PIN

They can then:
1. Open the gallery link
2. Enter the PIN
3. View the published photos
4. Browse the gallery

🔄 Application Workflow

Admin → Create Event → Assign Team Members → Team Uploads Photos → Admin Reviews → Selects Photos → Creates Gallery → Sets PIN → Publishes → Customer Opens Link → Enters PIN → Browses Photos

🛠️ Tech Stack

Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router

Backend

- Python
- Django
- Django REST Framework
- Simple JWT

Database
- MySQL

Photo Storage
- Cloudinary

Uploaded image files are stored in cloud storage rather than directly inside the database. The database stores photo metadata and the cloud storage location.

🏗️ System Architecture

Customer
    │
    ▼
React + Vite Frontend
    │
    │ REST API
    ▼
Django REST API
    │
    ├── Authentication / JWT
    ├── Events
    ├── Team Members
    ├── Photos
    └── Galleries
          │
          ├──────────────► MySQL
          │
          └──────────────► Cloudinary

The frontend communicates with the backend through REST APIs. JWT access tokens are used for authenticated requests, while customer gallery access is handled through the gallery share token + PIN flow.

🗄️ Database Design

User
Stores application users and their roles.

User
├── id
├── username
├── email
├── password
└── role
      ├── ADMIN
      └── TEAM_MEMBER

Event
Represents an event project.

Event
├── id
├── name
├── description
├── location
├── event_date
├── created_by
└── created_at

EventMember
Connects team members to assigned events.

EventMember
├── id
├── event
├── user
└── assigned_at

An event and team member combination is unique, preventing duplicate assignments.

Photo
Stores photo metadata.

Photo
├── id
├── event
├── uploaded_by
├── filename
├── storage_location
├── file_size
├── created_at
└── is_selected

The actual image file is stored in Cloudinary. The database stores the metadata and storage location.

Gallery
Represents the customer-facing gallery.

Gallery
├── id
├── event
├── share_token
├── pin_hash
├── is_published
├── created_at
└── created_by

Each event can have one gallery.

🔐 Authentication & Authorization
The application uses JWT-based authentication for Admin and Team Member accounts.

Authentication Flow

Login → Django REST API → JWT Access + Refresh Tokens → Frontend Authentication State → Access Token attached to API requests

The frontend also handles access-token refresh when an authenticated API request receives a 401 response.

Role-Based Authorization

The backend enforces role permissions rather than relying only on frontend UI restrictions.

Examples:

- Admins can create events.
- Team Members can only access their assigned events.
- Team Members can only manage their own uploaded photos.
- Team Members cannot publish galleries.
- Admins can only manage events and galleries belonging to them.
- Customers do not require an authenticated account.

🔒 Gallery Security

Customer galleries use:

Share Token + PIN
The flow is:
Gallery Link → Share Token identifies gallery → Customer enters PIN → Backend verifies PIN → Published gallery returned
Gallery PINs are stored as password hashes rather than plain text.
Incorrect PINs are rejected, and unpublished galleries cannot be accessed through the public gallery endpoint.

☁️ Photo Storage

Photo files are stored using Cloudinary.

The database stores:

- Photo ID
- Event ID
- Uploaded By
- Filename
- Storage Location
- File Size
- Created At
- Selection status

This keeps binary image files outside the relational database while allowing the application to reference stored images.

Cloudinary configuration is provided through environment variables and is not committed to the repository.


📡 API Structure

Authentication

POST /api/auth/register/

POST /api/auth/login/

POST /api/auth/refresh/

GET  /api/auth/me/

Events

GET  /api/events/

POST /api/events/create/

GET  /api/events/members/

POST /api/events/members/

Photos

GET    /api/photos/

POST   /api/photos/upload/

PATCH  /api/photos/<id>/select/

DELETE /api/photos/<id>/

Galleries

POST  /api/galleries/create/

GET   /api/galleries/event/<event_id>/

PATCH /api/galleries/<id>/set-pin/

PATCH /api/galleries/<id>/publish/

POST  /api/galleries/public/<share_token>/


🧪 Testing

The backend includes automated tests covering the important application flows.

Current test coverage:

- Accounts → 6 tests
- Photos → 8 tests
- Galleries → 11 tests
- Total → 25 tests
All 25 tests pass successfully.

Authentication Tests

- Public registration
- Registration cannot create an Admin account
- Admin login
- Team Member login
- Invalid login
- Authentication-protected endpoints
- Authenticated user information

Photo Tests

- Users can view permitted photos
- Team Members cannot access another member's photos
- Admin event photo access
- Admin isolation between events
- Unassigned users cannot upload
- Users can delete their own photos
- Users cannot delete another member's photos
- Unauthenticated photo access is blocked

Gallery Tests

- Gallery creation
- Gallery PIN creation
- Gallery publishing
- Role restrictions
- PIN verification
- Incorrect PIN rejection
- Published photo access
- Unpublished gallery protection
- Invalid gallery link handling
- Admin ownership restrictions
- Gallery PIN changes

Run the complete test suite with:

python manage.py test

📁 Project Structure

trizenai-photo-platform/
│
├── accounts/
├── backend/
├── events/
├── galleries/
├── photos/
├── frontend/
├── manage.py
├── .gitignore
└── README.md

The frontend contains the React application, while the Django apps contain authentication, event, photo, and gallery functionality.

🚀 Local Setup

1. Clone the repository
git clone https://github.com/hema-sk/trizenai-photo-platform.git
cd trizenai-photo-platform

2. Create and activate a virtual environment
Windows PowerShell:
python -m venv venv
.\venv\Scripts\Activate.ps1

3. Install backend dependencies
pip install -r requirements.txt

4. Configure environment variables
Create a .env file in the project root.
Example:
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

For the frontend, create:
frontend/.env
with:
VITE_API_BASE_URL=http://127.0.0.1:8000/api
Never commit actual environment values or credentials to Git.

5. Run migrations
python manage.py migrate
6. Start the backend
python manage.py runserver
Backend:
http://127.0.0.1:8000/

7. Install frontend dependencies
Open another terminal:
cd frontend
npm install

8. Start the frontend
npm run dev
Vite will provide the local frontend URL in the terminal.


🌍 Deployment

The application is designed to be deployed as separate frontend and backend services.

Frontend

React + Vite
    ↓
Frontend Hosting

Backend

Django + DRF

    ↓
Backend Hosting
    ↓
MySQL

Photo Files
    ↓
Cloudinary

Production environment variables should be configured through the hosting provider rather than committed to the repository.
The frontend production API URL is provided through:

VITE_API_BASE_URL

The backend requires the production Django secret, database configuration, Cloudinary configuration, and appropriate allowed-host/security settings.


⚠️ Known Limitations
The current implementation focuses on the core challenge workflow rather than optional features.

Not currently included:
- Photo thumbnails/resizing
- Pagination/infinite scrolling
- Photo search/filtering
- Gallery expiration
- CI/CD pipeline
- Customer accounts
- Advanced photo editing
These are intentionally outside the core implementation scope.

🎯 Challenge Coverage

| Requirement                    | Status |
|--------------------------------|--------|
| Admin authentication           | ✅ |
| Team Member authentication     | ✅ |
| Role-based authorization       | ✅ |
| Event creation                 | ✅ |
| Team assignment                | ✅ |
| Assigned event access          | ✅ |
| Multiple photo uploads         | ✅ |
| Cloud photo storage            | ✅ |
| Photo metadata                 | ✅ |
| Admin photo review             | ✅ |
| Photo selection                | ✅ |
| Gallery creation               | ✅ |
| Gallery publishing             | ✅ |
| Shareable gallery link         | ✅ |
| PIN-protected gallery          | ✅ |
| Customer without account       | ✅ |
| Incorrect PIN handling         | ✅ |
| Unpublished gallery protection | ✅ |
| Photo access controls          | ✅ |
| Automated backend tests        | ✅ |
| Responsive frontend            | ✅ |
| README documentation           | ✅ |
| Cloud deployment               | 🚧 |


🔑 Demo Access

The final submission includes:

- Live Application URL
- Demo Admin credentials
- Demo Team Member credentials
- Demo Gallery URL
- Demo Gallery PIN

For security, actual passwords and access credentials are provided separately with the internship submission rather than committed to this public repository.


💡 A Note on the Build

This project was built around the idea that every role should have a clear responsibility:

Admin → Organize + Review + Publish
Team → Upload + Manage own work
Customer → Unlock + Browse

The implementation prioritizes the complete end-to-end workflow, API-level authorization, secure gallery access, cloud photo storage, and a simple responsive experience.


📬 Submission
Challenge: TrizenAI Full-Stack Internship Challenge

Repository:
https://github.com/hema-sk/trizenai-photo-platform

👩‍💻 Built by

Hemalatha G
Full-Stack Developer in progress - currently learning, building, breaking things, fixing them and slowly turning them into actual products! 💻📸