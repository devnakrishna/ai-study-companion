# 🚀 AI Study Companion

An AI-powered full-stack learning platform that generates quizzes, evaluates answers, and provides personalized performance insights using **FastAPI, React, LangChain, and Google Gemini API**.

---

## 🧠 Project Evolution

This project evolved from a **JSON-based prototype** to a **scalable database-driven system** with AI-powered evaluation and analytics.

---

## ✨ Features

### 🧠 AI Quiz Generation

* Generates **8 MCQs + 2 descriptive questions**
* Based on topic and difficulty
* Powered by **LangChain + Google Gemini**

---

### 📝 Hybrid Answer Evaluation

* ✅ MCQ → Rule-based evaluation
* 🤖 Descriptive → AI-based evaluation using LangChain
* Provides:

  * Score
  * Feedback
  * Improvement suggestions

---

### 📊 Performance Analysis

* Topic-wise performance tracking
* Identifies:

  * Strong areas
  * Weak areas
* Generates structured scorecards

---

### 🎯 Personalized Recommendations

* Suggests learning resources based on weak topics
* Helps focused revision

---

### 💾 Database-Driven System

* Stores:

  * Quiz sessions
  * Questions
  * User answers
* Enables:

  * History tracking
  * Analytics
  * Future scalability

---

## 🏗️ Tech Stack

### Frontend

* React.js
* JavaScript
* CSS

### Backend

* FastAPI
* Python

### AI / LLM

* LangChain
* Google Gemini API

### Database

* MySQL / PostgreSQL

---

## 📁 Project Structure

```
AI-Study-Companion/
│
├── backend/
│   ├── app/
│   │   ├── ai/                 # LLM configuration
│   │   ├── core/               # Config & settings
│   │   ├── db/                 # Database models & connection
│   │   ├── routes/             # API endpoints
│   │   ├── services/           # Business logic
│   │   ├── schemas/            # Request/response validation
│   │   ├── prompts/            # LangChain prompt templates
│   │   └── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── pages/
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/ai-study-companion.git
cd ai-study-companion
```

---

### 2️⃣ Backend Setup (FastAPI)

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate (Mac/Linux)

pip install -r requirements.txt
```

---

### ▶️ Run Backend

```bash
uvicorn app.main:app --reload
```

Backend runs at:

```
http://localhost:8000
```

---

### 3️⃣ Frontend Setup (React)

```bash
cd frontend
npm install
npm start
```

Frontend runs at:

```
http://localhost:3000
```

---

## 🔐 Environment Variables

Create a `.env` file inside `backend/`:

```
GEMINI_API_KEY=your_api_key_here
```

---

## 🔌 API Endpoints

### Generate Quiz

```
POST /generate-quiz
```

### Submit Answers

```
POST /submit
```

### Evaluate Answers

```
POST /evaluate
```

### Get Recommendations

```
POST /recommend
```

---

## 🔄 Workflow

1. User selects topic & difficulty
2. Backend generates quiz using LangChain
3. Quiz session stored in database
4. User submits answers
5. System evaluates:

   * MCQs → rule-based
   * Descriptive → AI-based
6. Results generated:

   * Score
   * Feedback
   * Topic analysis
7. Recommendations generated based on weak areas

---

## ⚠️ Current Limitations

* No authentication system
* Recommendation system is basic
* UI can be further improved

---

## 🚀 Future Improvements

* Add authentication & user profiles
* Implement quiz history dashboard
* Advanced recommendation system (vector search)
* Downloadable performance reports
* Deploy full-stack application

---

## 👨‍💻 Author

Developed as a full-stack AI project to explore:

* AI-powered applications
* LangChain workflows
* FastAPI backend architecture
* React frontend development

---
