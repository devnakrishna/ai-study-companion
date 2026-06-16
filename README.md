---

#  AI Study Companion

An AI-powered learning platform that generates quizzes, evaluates answers, and provides personalized feedback and recommendations using **FastAPI, React, LangChain, and Google Gemini API**.

---

##  Features

###  AI Quiz Generation

* Generates MCQ + descriptive questions based on topic and difficulty
* Powered by **LangChain + Gemini**

###  Answer Evaluation

* Automatic MCQ evaluation (exact matching)
* AI-based evaluation for descriptive answers
* Detailed scoring system with percentage breakdown

###  Performance Analysis

* Identifies strong and weak areas
* Generates structured scorecard
* Topic-wise analysis

###  Learning Recommendations

* Generates YouTube-based learning links for weak topics
* Helps targeted revision

###  AI Feedback System

* Provides structured feedback for descriptive answers
* Suggests improvements and corrections

---

##  Tech Stack

### Frontend

* React.js
* JavaScript
* CSS

### Backend

* FastAPI
* Python

### AI / ML

* LangChain
* Google Gemini API (Generative AI)

### Data Handling

* JSON-based temporary storage (can be upgraded to DB later)

---

##  Project Structure

```
AI-Study-Companion/
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── prompts/
│   │   └── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── pages/
│   └── package.json
│
├── latest_quiz.json
├── submissions.json
├── .gitignore
└── README.md
```

---

##  Setup Instructions

###  1. Clone Repository

```bash
git clone https://github.com/your-username/ai-study-companion.git
cd ai-study-companion
```

---

###  2. Backend Setup (FastAPI)

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate (Mac/Linux)

pip install -r requirements.txt
```

###  Run Backend

```bash
uvicorn app.main:app --reload
```

Backend runs at:

```
http://localhost:8000
```

---

###  3. Frontend Setup (React)

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

##  Environment Variables

Create a `.env` file inside backend:

```
GEMINI_API_KEY=your_api_key_here
```

---

##  API Endpoints

###  Quiz Generation

```
POST /generate
```

###  Submit Answers

```
POST /submit
```

###  Evaluation

```
POST /evaluate
```

###  Recommendations

```
POST /recommend
```

---

##  How It Works

1. User enters topic + difficulty
2. Backend generates quiz using AI
3. User submits answers
4. System evaluates:

   * MCQ → rule-based
   * Descriptive → AI-based
5. Generates:

   * Scorecard
   * Weak areas
   * YouTube recommendations

---

##  Current Limitations

* Uses JSON files instead of database
* No authentication system yet
* Recommendations are link-based (not semantic search yet)

---

##  Future Improvements

* Add database (PostgreSQL / MongoDB)
* Add user authentication
* Improve recommendation system (real YouTube API / vector search)
* Add quiz history dashboard
* Deploy backend + frontend

---

##  Author

Built as a personal AI learning project to explore:

* AI integration in web apps
* LangChain workflows
* Full-stack FastAPI + React architecture

---



