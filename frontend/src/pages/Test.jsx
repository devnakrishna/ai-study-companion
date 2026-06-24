import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { generateQuiz, submitQuiz, evaluateQuiz } from "../services/quizService";
import "../styles/Test.css";

function Test() {
  const location = useLocation();
  const navigate = useNavigate();

  const { topic, level } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [sessionId, setSessionId] = useState(null);

  const [timeLeft, setTimeLeft] = useState(600);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [warningShown, setWarningShown] = useState(false);

  // 🔥 IMPORTANT: keep latest values in refs (fixes auto-submit bug)
  const answersRef = useRef([]);
  const sessionRef = useRef(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    sessionRef.current = sessionId;
  }, [sessionId]);

  const mcqQuestions = questions.filter(q => q.type === "MultiSelect");
  const descQuestions = questions.filter(q => q.type === "Long Answer");

  const answeredCount = answers.filter(
    a => a && a.user_answer && a.user_answer.toString().trim() !== ""
  ).length;

  const totalCount = questions.length;

  // ---------------- FETCH ----------------
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await generateQuiz(topic, level);
      if (data) {
        setQuestions(data.questions);
        setSessionId(data.session_id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [topic, level]);

  useEffect(() => {
    if (!topic || !level) navigate("/");
  }, [topic, level, navigate]);

  useEffect(() => {
    if (topic && level) fetchQuestions();
  }, [topic, level, fetchQuestions]);

  // ---------------- AUTO SUBMIT CORE ----------------
  const submitFlow = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    const formatted = answersRef.current.filter(Boolean);

    try {
      await submitQuiz(sessionRef.current, formatted);
      const result = await evaluateQuiz(sessionRef.current);
      navigate("/result", { state: { result } });
    } catch (err) {
      console.error("Auto submit failed:", err);
    }
  };

  // ---------------- TIMER ----------------
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          submitFlow();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ---------------- 5 MIN WARNING ----------------
  useEffect(() => {
    if (timeLeft === 300 && !warningShown) {
      alert("⚠️ 5 minutes left!");
      setWarningShown(true);
    }
  }, [timeLeft, warningShown]);

  // ---------------- TAB SWITCH CONTROL ----------------
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const next = prev + 1;

          if (next === 1) {
            alert("⚠️ Warning: next tab switch will auto-submit!");
          } else {
            submitFlow();
          }

          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // ---------------- BLOCK BACK BUTTON PROPERLY ----------------
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const onBack = () => {
      window.history.pushState(null, "", window.location.href);
      alert("⚠️ You cannot go back during quiz!");
    };

    window.addEventListener("popstate", onBack);

    return () => window.removeEventListener("popstate", onBack);
  }, []);

  // ---------------- SUBMIT BUTTON ----------------
  const handleSubmit = async () => {
    if (answeredCount !== totalCount) {
      alert("Please answer all questions");
      return;
    }

    submitFlow();
  };

  // ---------------- ANSWERS ----------------
  const handleOptionChange = (index, option) => {
    setAnswers(prev => {
      const updated = [...prev];
      updated[index] = {
        question_id: mcqQuestions[index].id,
        user_answer: option,
      };
      return updated;
    });
  };

  const handleDescChange = (index, value) => {
    const baseIndex = mcqQuestions.length + index;

    setAnswers(prev => {
      const updated = [...prev];

      if (!value || value.trim() === "") {
        updated[baseIndex] = null;
      } else {
        updated[baseIndex] = {
          question_id: descQuestions[index].id,
          user_answer: value,
        };
      }

      return updated;
    });
  };

  // ---------------- UI ----------------
  if (loading) return <div className="empty">Loading...</div>;
  if (!questions.length) return <div className="empty">No questions</div>;

  return (
    <div className="quiz-page">

      {/* HUD (UNCHANGED UI STYLE) */}
      <div className="quiz-hud card" style={{ position: "sticky", top: 0, zIndex: 999 }}>
        <div>📊 {answeredCount}/{totalCount} answered</div>
        <div>
          ⏱ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </div>
      </div>

      {/* QUESTIONS */}
      <div className="quiz-grid">

        {mcqQuestions.map((q, i) => (
          <div className="glass-question" key={i}>
            <h3>{i + 1}. {q.question}</h3>

            <div className="options">
              {q.options.map((opt, j) => (
                <label key={j} className="option-card">
                  <input
                    type="radio"
                    name={`q-${i}`}
                    checked={answers[i]?.user_answer === opt}
                    onChange={() => handleOptionChange(i, opt)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {descQuestions.map((q, i) => (
          <div className="glass-question" key={i}>
            <h3>{mcqQuestions.length + i + 1}. {q.question}</h3>

            <textarea
              className="glass-textarea"
              onChange={(e) => handleDescChange(i, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* SUBMIT */}
      <div className="submit-bar">
        <button className="submit-btn" onClick={handleSubmit}>
          Submit Quiz →
        </button>
      </div>

    </div>
  );
}

export default Test;