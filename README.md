# HealthTrack

A fitness and habit-tracking web application to help users maintain consistency in their wellness goals.

**Group:** Ethan Phillips, Jonathan Pearson, Samuel Hale

---

## Prerequisites

- **Node.js** (v18+)
- **PostgreSQL** (v14+)

---

## Database Setup

1. **Start PostgreSQL:**
   ```bash
   sudo service postgresql start
   ```

2. **Create user and database:**
   ```bash
   sudo -u postgres createuser postgres -s
   sudo -u postgres createdb healthtrack
   sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
   ```

3. **Run the schema:**
   ```bash
   psql -d healthtrack -f Backend/schema.sql
   ```

---

## Backend Setup

1. **Install dependencies:**
   ```bash
   cd Backend
   npm install
   ```

2. **Configure environment:**
   
   Edit `Backend/.env`:
   ```
   PORT=3000
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=healthtrack
   JWT_SECRET=your_secret_key
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   Server runs at `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users` | Register new user |
| POST | `/users/login` | Login (returns JWT) |
| POST | `/users/logout` | Logout (requires auth) |
| GET | `/users/session` | Get current session (requires auth) |
| GET | `/todo/habits` | Get all habits |
| POST | `/todo/habits` | Create habit (Admin, requires auth) |
| PUT | `/todo/habits/:id` | Update habit (Admin, requires auth) |
| DELETE | `/todo/habits/:id` | Delete habit (Admin, requires auth) |
| GET | `/todo/workouts` | Get all workouts (Exercise Library) |
| POST | `/todo/workouts` | Create workout (Admin, requires auth) |
| GET | `/todo/my-habits` | Get user's assigned habits (requires auth) |
| POST | `/todo/my-habits` | Assign habit to user (requires auth) |
| GET | `/todo/my-workouts` | Get user's workout history (requires auth) |
| POST | `/todo/my-workouts` | Log a workout (requires auth) |
| GET | `/todo/daily-log` | Get today's habits with status (requires auth) |
| POST | `/todo/daily-log` | Toggle habit completion (requires auth) |

**Authentication:** Include JWT in header: `Authorization: Bearer <token>`