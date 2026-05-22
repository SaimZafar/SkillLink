# SkillLink — Freelance Marketplace System

A full-stack freelance marketplace system built as a semester project for
Database Management Systems (CSC 220) at Bahria University Islamabad.

SkillLink models the complete lifecycle of freelance work — user registration,
project posting, competitive bidding, contract creation, milestone-based
payment tracking, and mutual reviews — powered by a fully normalized
Oracle XE relational database.

---

## Live System Overview

| Layer | Technology | Details |
|-------|-----------|---------|
| Database | Oracle XE 21c | 15 tables, normalized to 3NF |
| Backend | Node.js + Express | 35 REST API endpoints |
| Frontend | React.js | 3 role-based interfaces |
| Auth | JWT | Client, Freelancer, Admin roles |
| DB Client | DBeaver | SQL editor and schema browser |

---

## How It Works

1. A **Client** registers and posts a project with budget and deadline
2. **Freelancers** browse open projects and submit bids
3. Client reviews bids and selects the best one
4. A **Contract** is automatically created via an atomic transaction
5. Client releases **Payment** on milestone completion
6. Both parties leave a **Review** after project completion
7. **Admin** monitors the entire platform from a read-only dashboard

---

## Database Design

- **15 Tables** covering all entities in the freelancing workflow
- **Specialization** — Users supertype splits into Client and Freelancer subtypes (disjoint, total)
- **Weak Entities** — Bids and Reviews depend on identifying entities
- **M:N Relationships** — Resolved through User\_Skills and Project\_Category junction tables
- **3NF Normalization** — No repeating groups, no partial dependencies, no transitive dependencies
- **3 Atomic Transactions** — User registration, bid acceptance, payment recording
- **Constraints** — PK, FK, UNIQUE, CHECK, NOT NULL, DEFAULT enforced throughout

---

## Key Features

- Role-based access control at three levels (route, navigation, page)
- JWT authentication with 7-day token validity
- Atomic bid acceptance: accepts winner, rejects all others, creates contract, sends notification in one transaction
- Milestone-based payments — multiple payments per contract supported
- Mutual review system — both client and freelancer can rate each other
- Dispute tracking with status management
- Admin panel with visibility into all 15 Oracle tables
- Connection pooling for efficient database access

---

## Project Structure

```
SkillLink/
│
├── README.md
│
├── database/
│   ├── 01_sequences.sql
│   ├── 02_create_tables.sql
│   ├── 03_insert_data.sql
│   └── 04_queries.sql
│
├── backend/
│   ├── app.js
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   └── routes/
│       ├── auth.js
│       ├── projects.js
│       ├── bids.js
│       ├── contracts.js
│       ├── payments.js
│       ├── reviews.js
│       ├── disputes.js
│       ├── notifications.js
│       ├── admin.js
│       └── adminAuth.js
│
├── frontend/
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── App.js
│       ├── context/
│       │   └── AuthContext.js
│       ├── components/
│       │   ├── Sidebar.js
│       │   ├── PrivateRoute.js
│       │   └── AdminRoute.js
│       └── pages/
│           ├── Login.js
│           ├── Register.js
│           ├── Dashboard.js
│           ├── Projects.js
│           ├── Bids.js
│           ├── Contracts.js
│           ├── Payments.js
│           ├── Reviews.js
│           ├── Disputes.js
│           ├── Notifications.js
│           ├── AdminDashboard.js
│           ├── AdminUsers.js
│           ├── AdminProjects.js
│           ├── AdminBids.js
│           ├── AdminContracts.js
│           ├── AdminPayments.js
│           ├── AdminReviews.js
│           ├── AdminSkills.js
│           ├── AdminDisputes.js
│           └── AdminNotifications.js
│
└── docs/
    ├── ERD.png
    ├── RDM.png
    ├── SkillLink_Proposal.pdf
    └── SkillLink_Complete_Report.pdf
```

## Setup Instructions

### 1. Database Setup

Open DBeaver, connect to Oracle XE, and run the SQL scripts in order:

```sql
-- Run these in DBeaver one by one in this exact order
01_sequences.sql
02_create_tables.sql
03_insert_data.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your Oracle credentials in .env
node app.js
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app will open at `http://localhost:3000`

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:
PORT=5000
DB_USER=your_schema_name
DB_PASSWORD=your_password
DB_CONNECT_STRING=localhost:1521/XE
JWT_SECRET=your_secret_key

---

## API Endpoints Summary

| Route File | Endpoints | Tables Involved |
|-----------|-----------|----------------|
| auth.js | POST /register, POST /login | users, client\_profile, freelancer\_profile |
| projects.js | GET, POST, DELETE /projects | projects, categories, bids |
| bids.js | GET, POST /bids, PUT /accept | bids, projects, freelancer\_profile |
| contracts.js | GET /contracts | contracts, bids, projects, users |
| payments.js | GET, POST /payments | payments, contracts, bids, projects |
| reviews.js | GET, POST /reviews | reviews, contracts, users |
| disputes.js | GET, POST, PUT /disputes | disputes, contracts, users |
| notifications.js | GET, PUT /notifications | notifications, users |
| admin.js | GET /admin/\* | All 15 tables |
| adminAuth.js | POST /admin/login | admins |

---

## Database Tables

| Table | Type | Description |
|-------|------|-------------|
| users | Supertype | All registered users |
| client\_profile | Subtype | Client-specific data |
| freelancer\_profile | Subtype | Freelancer-specific data |
| skills | Strong Entity | Available skills |
| user\_skills | Associative | M:N users and skills |
| categories | Strong Entity | Project categories |
| projects | Strong Entity | Posted projects |
| project\_category | Associative | M:N projects and categories |
| bids | Weak + Associative | Freelancer proposals |
| contracts | Strong Entity | Accepted agreements |
| payments | Strong Entity | Payment records |
| reviews | Weak Entity | Post-contract feedback |
| project\_files | Strong Entity | File metadata |
| disputes | Strong Entity | Contract disputes |
| notifications | Strong Entity | System notifications |

---

## Group Members

| Name | Enrollment No. | Module |
|------|---------------|--------|
| Zairish Fatima | 01-135241-052 | Skills, Categories, Notifications |
| Maryam Qadir | 01-135241-028 | Users, Profiles, Projects |
| Saim Zafar | 01-135241-045 | Bids, Contracts, Payments, Reviews |

---

## Course Information

| | |
|-|-|
| **Course** | Database Management System |
| **Code** | CSC 220 |
| **Instructor** | Ms. Mehwish Pervaiz |
| **Class** | BSIT 5A |
| **University** | Bahria University Islamabad |
| **Semester** | 5th Semester, 2025-2026 |
