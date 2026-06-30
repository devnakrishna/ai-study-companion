# 🚀 AI Study Companion

An AI-powered, full-stack adaptive learning platform that generates quizzes, evaluates answers using AI and rule-based systems, tracks detailed learning analytics, and provides personalized study recommendations. Built using **FastAPI (Python), React (JS), SQLAlchemy (MySQL/PostgreSQL), LangChain, and the Google Gemini API**.

---

## 🧠 Project Evolution

This project evolved from a **JSON-based prototype** with basic mock endpoints to a **production-ready database-driven platform** featuring secure JWT Authentication, Role-Based Access Control (RBAC), multi-tenant College Administration, and a detailed student performance telemetry system.

---

## ✨ Features

### 🔐 Security & Identity Management
* **JWT Authentication:** Secure user sessions using JWT tokens (`Authorization: Bearer <token>`).
* **Role-Based Access Control (RBAC):** Distinct interfaces and API authorization levels for **Students** and **Admins**.
* **Official Domain Signups:** Enforces official college email verification (e.g., matching the college's configured domain like `@iit.edu`).
* **Profile Customization:** Users can edit profile details, change passwords, and upload custom profile pictures (managed via local static directories).

### 🧠 Adaptive AI Quiz Generation
* **Custom Quiz Delivery:** Generates **8 MCQs + 2 descriptive questions** tailored to any chosen topic and difficulty level (`beginner`, `intermediate`, `advanced`).
* **Advanced AI Pipeline:** Powered by **LangChain** and **Google Gemini** for context-aware, high-quality question generation.

### 📝 Hybrid Answer Evaluation
* **MCQ Auto-Grading:** Rule-based instant grading of multiple-choice questions.
* **AI Descriptive Grading:** Uses **LangChain + Gemini** to read user-submitted text answers and returns:
  * Awarded score / marks
  * In-depth qualitative feedback
  * Actionable key improvement suggestions

### 📊 Performance Analytics & Report Cards
* **Student Dashboard:** Real-time summary of total quizzes taken, average score, list of strong topics (average score $\ge 70\%$), weak topics (average score $\le 40\%$), and recent activity.
* **Topic-Wise Tracking:** Tracks attempts, average scores, and last-attempt marks for every subject.
* **Academic Report Cards:** Generates comprehensive report summaries including overall division classification ("First Class with Distinction", "First Class", etc.), letter grades per topic (A+, A, B, etc.), time spent, and detailed feedback remarks.

### 🎯 Smart Recommendations
* **Scraped YouTube Tutorials:** Auto-queries and recommends relevant learning videos/tutorials for identified weak areas using search scraping.

### 🏢 Multi-Tenant College Administration
* **College Registry:** Admins can register and manage colleges, including contact info, point of contact, and custom email domains.
* **Department Specializations:** Add or remove academic streams (e.g., CSE, ECE) for colleges.
* **Student Ranking Directory:** Query students' performance, filterable by college, department, topic, and minimum scores.
* **College Metrics & History:** In-depth aggregate reports showing student counts, total quizzes attempted, overall average, and detailed score logs for all students in a college.

---

## 🏗️ Tech Stack

* **Frontend:** React.js, React Router, CSS Variables (for responsive/dynamic components)
* **Backend:** FastAPI (Python), Uvicorn, Pydantic
* **AI Core:** LangChain, Google Gemini API (`gemini-1.5-flash`)
* **Database:** SQLAlchemy ORM, SQLite/MySQL/PostgreSQL (Auto-initializes tables on app startup)
* **File Uploads:** FastAPI `UploadFile` (stores assets locally under `uploads/`)

---

## 📁 Project Structure

```
AI-Study-Companion/
│
├── backend/
│   ├── app/
│   │   ├── ai/                 # Gemini configuration & setup
│   │   ├── core/               # App configuration & JWT security utilities
│   │   ├── db/                 # DB connection and SQLAlchemy models
│   │   ├── routes/             # FastAPI routers (Admin, Quiz, Auth, Profile, etc.)
│   │   ├── services/           # AI quiz generation, evaluation & report logic
│   │   ├── schemas/            # Pydantic data schemas
│   │   ├── prompts/            # LangChain structured system prompts
│   │   ├── utils/              # Helper utilities
│   │   └── main.py             # FastAPI entry point & routers binding
│   │
│   ├── uploads/                # Local profile picture uploads
│   ├── .env                    # Configured environment variables (ignored by git)
│   ├── .env.example            # Environment variables template
│   └── requirements.txt        # Python backend dependencies
│
├── frontend/
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── layouts/            # Shared layouts
│   │   ├── pages/              # Application pages (Dashboard, Admin, Quiz, etc.)
│   │   ├── services/           # API fetch wrappers (quizService.js, etc.)
│   │   ├── styles/             # Modular CSS stylesheet components
│   │   └── App.jsx             # Main Router structure
│   └── package.json            # Node.js dependencies & scripts
│
├── .gitignore
└── README.md
```

---

## 🔐 Environment Variables

Before running the backend, create a `.env` file inside the `backend/` directory. You can copy the template from `backend/.env.example`:

```bash
cp backend/.env.example backend/.env
```

Define the following variables inside `backend/.env`:

* `GEMINI_API_KEY`: Your Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/).
* `DATABASE_URL`: Connection string for your SQL database (e.g., `mysql+pymysql://username:password@localhost:3306/db_name` or `sqlite:///./sqlite.db`).
* `JWT_SECRET`: A secure, secret key for signing JWT tokens.

---

## 🔌 API Reference

### 🔓 Public / Authentication Endpoints
* `POST /signup` - Register a new student account (verifies domain, department, password constraints).
* `POST /login` - Sign in and receive a JWT access token.
* `GET /colleges` - Retrieve all registered colleges for the signup dropdown.
* `GET /colleges/{college_id}/departments` - Fetch departments belonging to a specific college.

### 👤 Profile Management (Requires Authentication)
* `GET /users/profile` - Fetch the active user's profile details.
* `PUT /users/profile` - Update profile data (restricted college change for students).
* `POST /users/upload-profile-pic` - Upload a profile image.
* `DELETE /users/remove-profile-pic` - Remove the current profile image.
* `PUT /users/change-password` - Change the current user's password.

### 📝 Quiz Engine (Requires Authentication)
* `POST /create-session` - Generates questions for a topic/difficulty and returns the session details.
* `POST /submit/{session_id}` - Evaluates MCQs and queues descriptive answers for AI evaluation.
* `POST /evaluate/{session_id}` - Runs/re-runs AI evaluation on descriptive questions.

### 📊 Performance & History (Requires Authentication)
* `GET /dashboard/{user_id}` - Retrieve dashboard summary statistics.
* `GET /topic-performance/{user_id}` - Fetch average/last scores per topic.
* `GET /topic-history/{user_id}/{topic}` - Retrieve full attempt log for a specific topic.
* `GET /history/{user_id}` - Fetch all finished quiz sessions.
* `GET /history/session/{session_id}` - Get a detailed breakdown of a specific session's results.
* `POST /recommend` - Get curated video recommendation links for weak topics.
* `GET /report/{user_id}` - Generate an academic scorecard/report card.

### 🛡️ Admin Endpoints (Requires Admin Role)
* `POST /admin/create-student` - Register a student account directly.
* `GET /admin/users-ranking` - View ranked students with college, department, topic, and score filters.
* `GET /admin/college-rankings` - Fetch college performance leaderboards.
* `GET /admin/colleges` - List colleges, student counts, and specializations.
* `POST /admin/colleges` - Create a new college profile.
* `PUT /admin/colleges/{college_id}` - Update college details.
* `POST /admin/specializations` - Add a specialization/department.
* `DELETE /admin/specializations/{spec_id}` - Remove a specialization.
* `GET /admin/colleges/{college_id}/metrics` - Access performance metrics and full assessment logs for all students in a college.

---

## ⚙️ Setup & Installation

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/ai-study-companion.git
cd ai-study-companion
```

### 2️⃣ Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables inside `.env` (refer to `.env.example`).
5. Run the FastAPI application:
   ```bash
   uvicorn app.main:app --reload
   ```
   * The API docs will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3️⃣ Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm start
   ```
   * Access the web interface at: [http://localhost:3000](http://localhost:3000)

---

## 📊 Database Schema

```mermaid
erDiagram
    COLLEGES ||--o{ USERS : houses
    COLLEGES ||--o{ SPECIALIZATIONS : offers
    USERS ||--o{ QUIZ_SESSIONS : attempts
    USERS ||--o{ TOPIC_PERFORMANCE : tracks
    QUIZ_SESSIONS ||--o{ QUESTIONS : contains
    QUIZ_SESSIONS ||--o{ USER_ANSWERS : receives
    QUESTIONS ||--o{ USER_ANSWERS : evaluates
    
    COLLEGES {
        int id PK
        string name UNIQUE
        string email
        string contact_no
        string address
        string point_of_contact
        datetime created_at
    }

    USERS {
        int id PK
        int college_id FK
        string first_name
        string last_name
        string email UNIQUE
        string password_hash
        string contact_no
        string address
        string profile_pic
        string department
        string role "student | admin"
        datetime created_at
    }

    SPECIALIZATIONS {
        int id PK
        string name
        int college_id FK
    }

    QUIZ_SESSIONS {
        int id PK
        int user_id FK
        string topic
        string level "beginner | intermediate | advanced"
        int total_questions
        int score
        float percentage
        datetime created_at
    }

    QUESTIONS {
        int id PK
        int session_id FK
        string question_text
        string question_type "MCQ | DESCRIPTIVE"
        string options "JSON"
        string correct_answer
        string topic
    }

    USER_ANSWERS {
        int id PK
        int session_id FK
        int question_id FK
        string user_answer
        boolean is_correct
        int marks_awarded
        string ai_feedback
    }

    TOPIC_PERFORMANCE {
        int id PK
        int user_id FK
        string topic
        int total_attempts
        float total_score
        float avg_score
        float last_score
        datetime last_updated
    }
```
