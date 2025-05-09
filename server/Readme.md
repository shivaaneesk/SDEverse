# DSAverse Backend

A modern, scalable backend for  **DSAverse** , a collaborative algorithm-sharing platform.

---

## 🔥 Project Vision

DSAverse is a platform where developers and learners can:

* Explore algorithms with intuition, complexity, and code in various languages.
* Contribute their own solutions.
* View and edit content collaboratively.
* Practice, learn, and grow together.

This backend will power features like structured data access, user contributions, and future user accounts.

---

## 📦 Tech Stack

* **Node.js** – JavaScript runtime
* **Express.js** – Fast backend framework
* **MongoDB + Mongoose** – Schema-flexible document DB
* **dotenv** – Manage environment variables
* **bcryptjs** – Password hashing
* **jsonwebtoken** – Auth with JWT
* **cors** – Cross-origin support
* **nodemon** – Dev server auto-reload

---

## 📁 Project Structure

```
DSAverse-backend/
├── config/               # MongoDB connection
│   └── db.js
├── controllers/          # Route logic
│   ├── algorithmController.js
│   ├── contributionController.js
│   └── userController.js
├── middleware/           # Custom middleware
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── models/               # Mongoose schemas
│   ├── Algorithm.js
│   ├── Contribution.js
│   └── User.js
├── routes/               # API routes
│   ├── algorithmRoutes.js
│   ├── contributionRoutes.js
│   └── userRoutes.js
├── utils/                # Helper functions (e.g., validators)
├── .env
├── server.js             # Entry point
└── package.json
```

---

## 🔐 Models Overview

### User

```js
{
  username: String,
  email: String,
  password: String (hashed),
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}
```

### Algorithm

```js
{
  title: String,
  category: String, // e.g. Sorting, Graph, DP
  description: String,
  complexity: {
    time: String,
    space: String
  },
  explanation: String,
  tags: [String],
  links: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}
```

### Contribution

```js
{
  algorithm: { type: mongoose.Schema.Types.ObjectId, ref: 'Algorithm' },
  language: String, // e.g. Python, C++, Java
  code: String,
  contributor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  upvotes: Number,
  createdAt: Date
}
```

---

## 🚀 Core Features (MVP)

### Algorithms

* [X] Create algorithm
* [X] Get all algorithms
* [X] Get algorithm by ID
* [X] Update algorithm (admin only or with moderation)
* [X] Delete algorithm (admin only)

### Contributions

* [X] Add code contribution
* [X] Get contributions by algorithm ID
* [ ] Upvote contributions

### User

* [X] Register
* [X] Login
* [X] Token-based auth (JWT)
* [ ] Profile page (basic)
* [ ] Bookmark/save algorithms

---

## 🌟 Advanced / Future Features

### Community

* [ ] Comments on each algorithm
* [ ] Contribution suggestions/edit requests
* [ ] Algorithm version history

### UI/UX-Enhanced

* [ ] Algorithm difficulty tags (Easy/Medium/Hard)
* [ ] Rich text/Markdown support for explanations
* [ ] Dark mode toggle flag (can be handled in frontend)

### Developer Tools

* [ ] Public API docs (Swagger/OpenAPI)
* [ ] Rate-limiting & protection (Helmet, etc.)
* [ ] Deployment (Render/Heroku + MongoDB Atlas)

---

## 🔗 API Endpoints

### Auth

```
POST   /api/users/register
POST   /api/users/login
```

### Algorithms

```
GET    /api/algorithms
GET    /api/algorithms/:id
POST   /api/algorithms
PUT    /api/algorithms/:id
DELETE /api/algorithms/:id
```

### Contributions

```
GET    /api/contributions/:algorithmId
POST   /api/contributions/:algorithmId
```

---

## 💼 Resume-Worthy Highlights

* Fullstack app with modular Express backend
* MongoDB data modeling with relations (algorithm ↔ contributions ↔ users)
* RESTful API architecture
* Scalable project structure
* Secure user authentication with JWT
* Future-ready for Open Source/Community contributions

---

Let’s now move to implementing files: starting with `server.js`, database connection, and models.
