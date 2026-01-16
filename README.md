# SMART STOCK MANAGEMENT SYSTEM – Frontend

Enterprise-grade Stock Management Web Application (Angular)

---

## 🧾 Project Overview

**SMART STOCK MANAGEMENT SYSTEM** is a professional web application designed to manage stock, movements, purchases, and statistics for companies (commerce / industry / construction).

This repository contains the **Frontend** of the application, built with **Angular** and consuming a **Spring Boot REST API**.

The frontend strictly respects backend business rules and does **not** re-implement any business logic.

---

## 🛠 Tech Stack

- **Angular** (latest stable)
- **TypeScript**
- **Tailwind CSS**
- **JWT Authentication**
- **Role-based Access Control**
- **Lazy-loaded Modules**
- **Clean Architecture**

---

## 🔐 Authentication & Security

- Authentication is based on **JWT**
- Token is stored securely in `localStorage`
- All secured API calls include:

Authorization: Bearer <JWT_TOKEN>

yaml
Copy code

- Global HTTP interceptors handle:
  - JWT injection
  - 401 → redirect to login
  - 403 → access denied
  - 500 → generic error

---

## 👥 User Roles

### ADMIN
- Full access
- Manage products
- Manage fournisseurs
- Manage stock movements
- Create & validate achats
- View financial statistics (HT / TVA / TTC)
- Export Excel files

### COMPTABLE
- Read-only access
- View products & stock
- View movements
- View stock-related statistics
- ❌ No access to achats
- ❌ No access to financial values
- ❌ No Excel export

> UI elements and routes are strictly hidden based on role.

---

## 📂 Application Pages

### Existing Core Pages
- `/dashboard` – Role-based dashboard
- `/products` – Product management & stock alerts
- `/movements` – Stock movements history
- `/achats` – Purchases (ADMIN only)
- `/fournisseurs` – Fournisseur management (ADMIN CRUD)

---

## 📊 Dashboard Behavior

### ADMIN Dashboard
- Total HT / TVA / TTC
- Export achats to Excel
- Top products by stock consumption
- Stock alerts overview

### COMPTABLE Dashboard
- Number of products
- Number of stock alerts
- Top products by stock consumption
- ❌ No financial data

---

## 🚨 Stock Alerts

- Stock alerts are **fully managed by the backend**
- Frontend uses:
  - `stockAlert` boolean
  - `/api/produits/alerts` endpoint
- Frontend **never calculates stock or alerts**

Alerts are:
- Highlighted in product list
- Displayed as badges
- Counted on dashboard

---

## 🧩 Architecture Rules

- No business logic in frontend
- No stock or financial calculations
- Backend is the **single source of truth**
- Services handle API calls
- Components focus on UI & UX
- All new features are added incrementally
- Existing routes/components are never broken

---

## ⚙️ Environment Configuration

Backend base URL:

http://localhost:8080

nginx
Copy code

Frontend runs on:

http://localhost:4200

yaml
Copy code

---

## ▶️ Run the Project Locally

### 1. Install dependencies
```bash
npm install
2. Run development server
bash
Copy code
ng serve
3. Open browser
arduino
Copy code
http://localhost:4200
📦 Build for Production
bash
Copy code
ng build --configuration production
