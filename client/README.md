# SDE Interview Prep Web App (Frontend)

A modern, full-featured SDE Interview Preparation website built using **React**, **Redux Toolkit**, **Tailwind CSS v4**, and **Vite**. This frontend interfaces with a backend API that supports user authentication, algorithm content management, voting, nested commenting, and proposal submissions.

## 🌐 Live Preview

> Coming soon after deployment

---

## 📁 Folder Structure

```
client/
├── public/
├── src/
│   ├── assets/               # Images, logos, icons
│   ├── components/
│   │   ├── layout/           # Navbar, Footer
│   │   ├── common/           # Reusable widgets like loaders, modals
│   │   ├── algorithm/        # Algorithm display + code components
│   │   ├── comments/         # Nested comment & reply UIs
│   │   └── auth/             # Login/Register forms
│   ├── pages/                # Route-based views
│   ├── redux/
│   │   ├── store.js
│   │   └── slices/           # Redux Toolkit slices (auth, algo, comments, etc.)
│   ├── services/             # Axios instance & API functions
│   ├── utils/                # Helper functions (JWT decode, formatters)
│   ├── App.jsx               # Main App component with routing
│   ├── main.jsx              # React DOM entry
│   └── index.css             # Tailwind base + custom styles
├── .env                      # VITE_ prefixed environment vars
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── package.json
└── README.md
```

---

## 🚀 Tech Stack

* **React 18** with Hooks
* **Redux Toolkit** for state management
* **React Router DOM v6** for routing
* **Tailwind CSS v4** for utility-first styling
* **Axios** with interceptors
* **JWT-based Auth** with role-based protection

---

## 🔐 Features

* ✅ Admin/User login & register
* ✅ View algorithm list & detailed page
* ✅ Add, update, delete algorithms (admin only)
* ✅ Upvote/Downvote algorithms
* ✅ Nested commenting with reply support
* ✅ View & manage proposals for content changes

---

## 📦 Setup Instructions

1. **Install dependencies**

```bash
npm install
```

2. **Set environment variables** in `.env`

```
VITE_API_URL=http://localhost:5000/api
```

3. **Run the dev server**

```bash
npm run dev
```

4. **Build for production**

```bash
npm run build
```

---

## 🧠 Backend Overview

This frontend is connected to a custom backend that supports:

* RESTful APIs for algorithms, auth, users, and comments
* JWT-based authentication
* Role-based access control (admin/user)
* Nested comment threads and change proposal handling

---

## 🤝 Contribution

Pull requests and ideas are welcome! Make sure to open an issue first to discuss major changes.

---

## 📄 License

[MIT](LICENSE)

---

**Made with ❤️ for SDE aspirants by Harsh Dev**
