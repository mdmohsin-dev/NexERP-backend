# Mini ERP Backend

Backend API for the Mini ERP – Inventory & Sales Management System.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcryptjs
- Multer

## Features

- JWT Authentication
- Role-based Authorization (Admin, Manager, Employee)
- Product Management
- Customer Management
- Sales Management
- Dashboard Analytics
- Product Image Upload
- Admin Seed Script
- Global Error Handling
- Request Validation
- Search & Sorting

## API Base URL

```
https://nexerp-backend-production.up.railway.app/api/v1
```

## Installation

```bash
git clone <backend-repository-url>

cd backend

npm install
```

## Environment Variables

Create a `.env` file using `.env.example`.

```env
PORT=5000

NODE_ENV=development

MONGODB_URI=your_mongodb_uri

JWT_SECRET=your_jwt_secret

JWT_EXPIRES_IN=7d

CLIENT_URL=https://nex-erp-frontend.vercel.app/login

LOW_STOCK_THRESHOLD=5
```

## Run Locally

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Production

```bash
npm start
```

## Seed Admin

```bash
npm run seed:admin
```

## Default Admin Credentials

```
Email:
admin@example.com

Password:
Admin@123
```

> Replace with your actual seeded admin credentials.

## Project Structure

```
src
 ├── modules
 ├── middleware
 ├── routes
 ├── config
 ├── utils
 ├── scripts
 └── server.ts
```

## API Modules

- Authentication
- Products
- Customers
- Sales
- Dashboard