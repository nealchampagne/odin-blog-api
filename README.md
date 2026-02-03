# Odin Blog API

## Description
This is my implementation of the API backend for the Blog API project from the Odin Project's NodeJS course as a part of their Full-Stack Javascript curriculum.

Absolutely, Neal — here’s a clean, confident, production‑ready README for your **backend API**, written in the same tone as your other two. It’s honest about the proof‑of‑concept nature but still presents the project like a real, intentional service.

You can drop this directly into your backend repo.

---

# **Odin Blog API – Backend**

## **Overview**
This is the **Backend API** for the Odin Blog project.  
It provides a clean, REST‑style interface for managing blog posts, comments, and admin authentication. The API is consumed by two separate frontends:

- **Admin Dashboard** (private)  
- **Reader Frontend** (public)

The backend is built with a focus on clarity, maintainability, and proof‑of‑concept deployment. It uses a managed Postgres database and JWT‑based authentication to keep the admin workflow secure and isolated.

---

## **Tech Stack**
- **Node.js + Express**  
- **TypeScript**  
- **Prisma ORM**  
- **PostgreSQL** 
- **JWT authentication**  
- **CORS** for multi‑frontend support  

---

## **Features**
- Admin authentication (login + JWT issuance)  
- CRUD operations for blog posts  
- Draft vs published post handling  
- Comment retrieval and moderation  
- Pagination for posts and comments  
- Clean separation between public and protected routes  
- Centralized error handling  
- Prisma schema + migrations  

---

## **Environment Variables**
Create a `.env` file in the project root with:

```
DATABASE_URL=postgres://...
JWT_SECRET=your-secret
PORT=3000
```

### **DATABASE_URL**
Provided by Aiven (or your local Postgres instance).

### **JWT_SECRET**
Used to sign and verify admin tokens.

### **PORT**
Defaults to `3000` if not set.

---

## **Local Development**

### **Install dependencies**
```
npm install
```

### **Run database migrations**
```
npx prisma migrate dev
```

### **Start the development server**
```
npm run dev
```

The API will be available at:

```
http://localhost:3000
```

---

## **Scripts**

### **Start in development**
```
npm run dev
```

### **Build for production**
```
npm run build
```

### **Start production build**
```
npm start
```

### **Run Prisma migrations**
```
npx prisma migrate deploy
```

### **Generate Prisma client**
```
npx prisma generate
```

---

## **API Structure**

### **USERS**
- `POST /signup` — register new user (public)
- `POST /login` — authenticate user return JWT (public)
- `GET /` — list all users (admin)
- `GET /:id` — get user by id (admin)
- `PATCH /:id` — update user by id (admin)
- `DELETE /:id` — delete user by id (admin)

### **Posts**
- `GET /posts` — list posts (public)
- `GET /posts/:id` — get a single post (public)
- `POST /posts` — create post (admin)
- `PATCH /posts/:id` — update post (admin)
- `DELETE /posts/:id` — delete post (admin)
- `PUT /posts/:id/publish` — publish (admin)
- `PUT /posts/:id/unpublish` — unpublish (admin)

### **Comments**
- `GET /posts/:id/comments` — list comments for a post (public)
- `PATCH /posts/:postId/comments/:commentId` — update post (authenticated)
- `DELETE /posts/:postId/comments/:commentId` — delete comment (admin)

---

## **Authentication**
Admin routes require a valid JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are issued via the `/login` endpoint.

The admin user is created via the Prisma seed script.

---

## **Deployment**
This backend is designed to deploy cleanly to free-tier hosting providers such as:

- **Render**  
- **Railway**  
- **Fly.io**  

## **CORS**
Since two separate frontends consume this API, CORS must allow both origins.

Example:

```ts
app.use(cors({
  origin: [
    "https://your-admin-frontend.com",
    "https://your-reader-frontend.com"
  ],
  credentials: true
}));
```

For proof‑of‑concept simplicity:

```ts
app.use(cors({ origin: "*" }));
```

---

## **Project Status**
This backend is a **proof‑of‑concept** designed to validate:

- a clean REST API  
- Prisma + Postgres integration  
- JWT authentication  
- multi‑frontend architecture  
- free‑tier deployment pipeline  

Future improvements could include:

- rate limiting  
- richer validation  
- role-based access control  
- image uploads  
- comment creation endpoints  
- analytics endpoints  

---

## **License**
MIT (or your preferred license)