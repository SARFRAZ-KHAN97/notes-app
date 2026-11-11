# Simple Note-Taking App

A clean, modern, and full-stack note-taking application with category filtering, date-wise note grouping, working authentication, and strict user isolation.


---

## Tech Stack Used

- **Backend:**
  - Express.js (REST API)
  - MongoDB Atlas
  - JWT for user authentication
  - `bcryptjs` for password hashing
  - `cors` and `dotenv`
- **Frontend:**
  - React.js (Vite 8)
  - Tailwind CSS
  - `lucide-react` icons
  - Axios

---

## Running Locally

### 1. Set Up the Backend Environment

Inside the `notes-backend/` directory, create a `.env` file:

```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_random_secret_string
PORT=3001
```


### 2. Start the Backend API

```bash
cd notes-backend
npm install
npm run dev
```

API runs at **`http://localhost:3001`**. Connects directly to MongoDB Atlas.

### 3. Start the Frontend Web App

In a separate terminal:

```bash
cd notes-frontend
npm install
npm run dev
```

Web app runs at **`http://localhost:3000`**.
