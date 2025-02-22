# Dark Store Management System

## Overview
Dark Store Management System is a TypeScript-based backend project designed to manage **branch operations**, **inventory**, **workers**, and **orders** efficiently. This system includes **authentication**, **authorization**, and various business logics for managing a dark store's lifecycle.

## Features
- **User Authentication & Authorization** (JWT-based authentication, hashed passwords)
- **Branch & Schedule Management**
- **Inventory & Stock Control**
- **Order Processing & Delivery Tracking**
- **Worker Management & Role-based Access Control**
- **Operational Logging**

## Tech Stack
- **Backend:** Node.js, TypeScript, Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma / TypeORM
- **Authentication:** JWT, bcrypt
- **API Testing:** Postman / Insomnia
- **Logging:** Winston / Morgan

## Database Schema
The system is structured around multiple tables that manage branches, users, inventory, orders, and operations.

### 1. **Branch Management**
- `branch`: Stores branch details such as name, address, timezone, and operational status.
- `branch_schedule`: Defines opening/closing schedules for each branch.
- `branch_items`: Tracks inventory at each branch.
- `branch_shelfs`: Stores information about storage locations within a branch.

### 2. **Inventory & Stock Management**
- `item`: Represents all products in the system.
- `storage_type`: Defines the storage requirements for each item.
- `product_type`: Categorizes products (e.g., dairy, beverages).

### 3. **Order & Delivery Management**
- `order_`: Handles the order lifecycle from preparation to delivery.
- `acceptance`: Manages incoming inventory stock acceptance.
- `worker`: Tracks workers and their statuses (e.g., available, on break, delivering orders).

### 4. **User & Authentication**
- `user_`: Stores customer details, including payment information.
- `worker`: Manages employees with role-based access.
- `operation`: Logs all system operations for audit purposes.

## Authentication & Authorization
- **JWT-based authentication** for users and workers.
- **Password hashing** with bcrypt.
- **Role-based access control (RBAC)** to restrict endpoints based on user roles.

## Example API Endpoints
```http
POST /auth/signup       # Register a new user
POST /auth/login        # Authenticate user
GET  /branches          # Retrieve all branches
POST /orders            # Create a new order
PATCH /orders/:id       # Update order status
```

## Installation
1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourrepo/dark-store.git
   cd dark-store
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**
   ```sh
   cp .env.example .env
   # Update database URL, JWT secret, etc.
   ```

4. **Run database migrations:**
   ```sh
   npx prisma migrate dev
   ```

5. **Start the application:**
   ```sh
   npm run dev
   ```
