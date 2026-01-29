# Pennywise - Personal Finance Management System

A full-stack web application for managing personal finances, tracking expenses, and analyzing spending patterns built with MongoDB, Express.js, and Vanilla JavaScript.

**Course:** Advanced Databases (NoSQL)   
**Team Size:** 2 Students

---

## Overview

Pennywise is a comprehensive personal finance management system that empowers users to take control of their financial life through:

- **Multi-Account Management** - Track balances across cards, cash, and savings
- **Smart Transaction Tracking** - Record and categorize every income and expense
- **Powerful Analytics** - Visualize spending patterns with advanced aggregations
- **Secure Authentication** - JWT-based security with encrypted passwords
- **Responsive Design** - Works seamlessly on desktop and mobile devices

### Key Highlights
- **18 REST API Endpoints** with full CRUD operations
- **4 Advanced Aggregation Pipelines** for deep financial insights
- **Real-time Balance Updates** using MongoDB operators
- **Tag-based Organization** with $push/$pull operations
- **Optimized Queries** with compound indexes

---

## Features

### User Management
- **Registration & Login** with JWT authentication
- **Secure Password Storage** using bcrypt hashing (10 salt rounds)
- **Session Management** with token-based authorization
- **Protected Routes** with middleware authentication

### Account Management
- **Multiple Account Types:**
  - Checking accounts (Текущий счет)
  - Savings accounts (Сберегательный)
  - Credit cards (Кредитная карта)
  - Cash (Наличные)
- **Real-time Balance Tracking** with automatic updates
- **CRUD Operations** - Create, Read, Update, Delete accounts
- **Account Statistics** - View balance distribution by type

### Transaction Management
- **Income & Expense Tracking** with detailed categorization
- **Flexible Tagging System** - Add/remove tags dynamically
- **Smart Filtering** - Filter by type, category, date range
- **Automatic Balance Updates** - Balance adjusts automatically with each transaction
- **Transaction History** - View complete transaction timeline
- **Edit & Delete** - Full control over past transactions

### Advanced Analytics
Four powerful aggregation pipelines provide deep insights:

1. **Category Statistics**
   - Total spending per category
   - Transaction count by category
   - Average transaction amount
   - Sorted by highest spending

2. **Monthly Trends**
   - Income vs expenses by month
   - Year-over-year comparisons
   - Transaction volume tracking

3. **Total Balance Overview**
   - Aggregated balance across all accounts
   - Account count summary
   - Average balance per account

4. **Account Type Distribution**
   - Balance breakdown by account type
   - Transaction patterns per type

### User Interface
- **Modern Minimalist Design** - Clean, professional appearance
- **Intuitive Navigation** - Easy access to all features
- **Responsive Layout** - Adapts to any screen size
- **Real-time Updates** - Instant feedback on all operations
- **Modal Dialogs** - Streamlined data entry
- **Success/Error Notifications** - Clear user feedback

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | v14+ | JavaScript runtime |
| **Express.js** | 5.2.1 | Web framework |
| **MongoDB** | v4.4+ | NoSQL database |
| **Mongoose** | 9.1.5 | MongoDB ODM |

### Security & Authentication
| Technology | Version | Purpose |
|-----------|---------|---------|
| **jsonwebtoken** | 9.0.3 | JWT tokens |
| **bcryptjs** | 3.0.3 | Password hashing |
| **cors** | 2.8.6 | Cross-origin requests |
| **dotenv** | 17.2.3 | Environment variables |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **HTML5** | Page structure |
| **CSS3** | Modern styling with CSS variables |
| **Vanilla JavaScript** | Client-side logic |
| **Fetch API** | HTTP requests to backend |

### Development Tools
| Tool | Purpose |
|------|---------|
| **nodemon** | Auto-restart on changes |
| **Git & GitHub** | Version control |
| **Postman** | API testing |

---

## Project Structure

```
NOSQLFINAL/
│
├── README.md                    # Project documentation (this file)
│
├── pennywise_backend/           # Backend Application
│   │
│   ├── controllers/             # Business Logic Layer
│   │   ├── authController.js      # User registration & login
│   │   ├── accountController.js   # Account CRUD + aggregations
│   │   └── transactionController.js # Transaction CRUD + aggregations
│   │
│   ├── models/                  # MongoDB Schema Definitions
│   │   ├── User.js                # User model with password hashing
│   │   ├── Account.js             # Account model (types: card/cash/savings)
│   │   └── Transaction.js         # Transaction model with embedded tags
│   │
│   ├── routes/                  # API Route Definitions
│   │   ├── authRoutes.js          # Authentication endpoints
│   │   ├── accountRoutes.js       # Account endpoints (7 routes)
│   │   └── transactionRoutes.js   # Transaction endpoints (11 routes)
│   │
│   ├── middleware/              # Custom Middleware
│   │   └── auth.js                # JWT verification middleware
│   │
│   ├── .env                     # Environment variables (not in Git)
│   ├── .gitignore              # Git ignore rules
│   ├── package.json            # Node.js dependencies
│   ├── package-lock.json       # Dependency lock file
│   ├── seed.js                 # Database seeding script
│   └── server.js               # Application entry point
│
└── frontend/                    # Frontend Application
    │
    ├── index.html              # Login page (main entry)
    │
    ├── pages/                  # Application Pages
    │   ├── register.html         # User registration
    │   ├── dashboard.html        # Main dashboard with stats
    │   ├── accounts.html         # Account management
    │   ├── transactions.html     # Transaction management
    │   └── statistics.html       # Advanced analytics
    │
    ├── css/                    # Stylesheets
    │   └── style.css            # Main stylesheet (modern minimalist)
    │
    ├── js/                     # JavaScript Files
    │   ├── api.js              # API communication layer
    │   ├── auth.js             # Authentication helpers
    │   └── app.js              # Main application logic
    
```

### File Descriptions

**Backend Controllers:**
- `authController.js` - Handles user registration, login, JWT generation
- `accountController.js` - CRUD operations for accounts + aggregations
- `transactionController.js` - CRUD operations for transactions + aggregations

**Backend Models:**
- `User.js` - User schema with password hashing pre-save hook
- `Account.js` - Account schema with userId reference
- `Transaction.js` - Transaction schema with embedded tags array

**Frontend Pages:**
- `index.html` - Login page with authentication form
- `register.html` - Registration page with validation
- `dashboard.html` - Main dashboard showing overview statistics
- `accounts.html` - Account management with create/edit/delete
- `transactions.html` - Transaction management with filters
- `statistics.html` - Advanced analytics and visualizations

---

## Installation Guide

### Prerequisites

Before starting, ensure you have:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/downloads)
- **Code Editor** (VS Code recommended) - [Download](https://code.visualstudio.com/)

### Step-by-Step Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/NoSqlFInal.git
cd NoSqlFInal
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd pennywise_backend

# Install dependencies
npm install

# This installs:
# - express (web framework)
# - mongoose (MongoDB ODM)
# - bcryptjs (password hashing)
# - jsonwebtoken (JWT auth)
# - cors (cross-origin requests)
# - dotenv (environment variables)
# - nodemon (dev dependency)
```

#### 3. Configure Environment Variables

Create a `.env` file in the `pennywise_backend` directory:

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your settings
```

**`.env` file contents:**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/pennywise
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**IMPORTANT:** Never commit the `.env` file to Git! It's already in `.gitignore`.

#### 4. Start MongoDB

**Windows:**
```bash
# If MongoDB is installed as a service:
net start MongoDB

# Or start manually:
mongod
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Verify MongoDB is running:**
```bash
mongosh
# You should see MongoDB shell
# Type: show dbs
# Type: exit
```

#### 5. Start the Backend Server

```bash
# From pennywise_backend directory

# Development mode (with auto-reload):
npm run dev

# Production mode:
npm start
```

**Expected output:**
```
MongoDB Connected
Server running on port 5000
http://localhost:5000
```

**Test the server:**
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok","timestamp":"...","database":"connected"}
```

#### 6. Frontend Setup

Open a new terminal window:

```bash
# From project root
cd frontend

# Option 1: Open directly in browser
open index.html  # macOS
start index.html  # Windows

# Option 2: Use Python HTTP server
python -m http.server 3000
# Then visit: http://localhost:3000

# Option 3: Use Node.js HTTP server
npx http-server -p 3000
# Then visit: http://localhost:3000
```

#### 7. Access the Application

1. Open your browser and go to: `http://localhost:3000` (or open `index.html` directly)
2. Click "Зарегистрироваться" (Register)
3. Create a new account
4. Start managing your finances!

---
