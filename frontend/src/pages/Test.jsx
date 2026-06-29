import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { generateQuiz, submitQuiz, evaluateQuiz } from "../services/quizService";
import ModalAlert from "../components/ModalAlert";
import "../styles/Test.css";

function Test() {
  const location = useLocation();
  const navigate = useNavigate();

  const { topic, level } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [sessionId, setSessionId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [timeLeft, setTimeLeft] = useState(600);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: "info", message: "", onClose: null });

  // ---------------- FETCH ----------------
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    const data = await generateQuiz(topic, level);
    setQuestions(data.questions);
    setSessionId(data.session_id);
    setLoading(false);
  }, [topic, level]);

  useEffect(() => {
    if (topic && level) fetchQuestions();
  }, [topic, level, fetchQuestions]);

  const allQuestions = questions;
  const currentQuestion = allQuestions[currentIndex];

  // ---------------- TIMER ----------------
  useEffect(() => {
    if (!questions.length) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [questions]);

  // ---------------- FORMAT ANSWERS ----------------
  const getFormattedAnswers = () => {
    return Object.entries(answers).map(([qid, ans]) => ({
      question_id: Number(qid),
      user_answer: ans
    }));
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async () => {
    if (!sessionId) return;

    try {
      await submitQuiz(sessionId, getFormattedAnswers());
      const result = await evaluateQuiz(sessionId);
      navigate("/result", { state: { result } });
    } catch (err) {
      console.error(err);
      navigate("/result", {
        state: { result: { scorecard: {}, review: [] } }
      });
    }
  };

  // ---------------- ANSWER ----------------
  const setAnswer = (qid, value) => {
    setAnswers(prev => ({
      ...prev,
      [qid]: value
    }));
  };

  // ---------------- TAB SWITCH (FIXED RELIABLE) ----------------
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;

          if (newCount === 1) {
            setAlertConfig({
              isOpen: true,
              type: "error",
              message: "⚠️ Warning: Next tab switch will auto-submit the quiz!"
            });
          }

          if (newCount >= 2) {
            setTimeout(() => {
              handleSubmit(); // GUARANTEED EXECUTION
            }, 200);
          }

          return newCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [answers, sessionId]);

  // ---------------- BACK BUTTON BLOCK (FIXED) ----------------
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handleBack = () => {
      setAlertConfig({
        isOpen: true,
        type: "error",
        message: "⚠️ You cannot go back during the quiz. Submitting...",
        onClose: () => {
          handleSubmit();
        }
      });

      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handleBack);

    return () => window.addEventListener("popstate", handleBack);
  }, [answers]);

  // ---------------- LOADING (PRESERVED) ----------------
  if (loading) {
    return (
      <div className="ai-loading-page">
        <div className="ai-loading-card">

          {/* Animated Orb */}
          <div className="ai-orb"></div>

          {/* Title */}
          <h2 className="ai-title">Generating your assessment</h2>

          {/* Subtext */}
          <p className="ai-subtext">Our AI is preparing questions for</p>

          {/* Topic Highlight */}
          <div className="ai-topic">{topic}</div>

          {/* Progress Dots */}
          <div className="ai-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>

        </div>
      </div>
    );
  }

  if (!questions.length) return <div>No questions</div>;

  return (
    <div className="test-page-light">

      {/* HEADER */}
      <div className="test-header">

        <div>
          <h2>Assessment</h2>

          {/* PROGRESS BAR */}
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${(Object.keys(answers).length / questions.length) * 100}%`
              }}
            />
          </div>

        </div>

        <div className="hud-box">

          {/* ANSWERED */}
          <div className="answered-pill">
            {Object.keys(answers).length} / {questions.length}
          </div>

          {/* BIG TIMER */}
          <div className="timer-box big-timer">
            ⏱ {Math.floor(timeLeft / 60)}:
            {String(timeLeft % 60).padStart(2, "0")}
          </div>

        </div>

      </div>


      {/* MAIN */}
      <div className="layout-light">

        {/* QUESTION */}
        <div className="question-card">

          <h2 className="question-title">
            Q{currentIndex + 1}. {currentQuestion.question}
          </h2>

          {currentQuestion.type === "MultiSelect" ? (
            currentQuestion.options.map((opt, i) => (
              <label key={i} className="option-light">
                <input
                  type="radio"
                  checked={answers[currentQuestion.id] === opt}
                  onChange={() => setAnswer(currentQuestion.id, opt)}
                />
                {opt}
              </label>
            ))
          ) : (
            <textarea
              className="text-light"
              value={answers[currentQuestion.id] || ""}
              onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
            />
          )}

          <div className="nav-buttons">
            <button disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(i => i - 1)}>
              Prev
            </button>

            {currentIndex === questions.length - 1 ? (
              <button onClick={handleSubmit}>
                Submit
              </button>
            ) : (
              <button onClick={() => setCurrentIndex(i => i + 1)}>
                Next
              </button>
            )}
          </div>

        </div>

        {/* SIDEBAR */}
        <div className="side-panel-cards">

          <h3>Questions</h3>

          <div className="card-grid">
            {questions.map((q, i) => {
              const answered = answers[q.id];

              return (
                <div
                  key={q.id}
                  className={`q-card ${answered ? "done" : ""}`}
                  onClick={() => setCurrentIndex(i)}
                >
                  <div className="q-header">
                    <div className="q-num">Q{i + 1}</div>
                    <div className="q-status">
                      {answered ? "✔ Answered" : "Pending"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
      <ModalAlert 
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        message={alertConfig.message}
        onClose={() => {
          if (alertConfig.onClose) alertConfig.onClose();
          setAlertConfig(prev => ({ ...prev, isOpen: false, onClose: null }));
        }}
      />
    </div>
  );
}

export default Test;