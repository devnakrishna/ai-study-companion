import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Test.css";

function Test() {
  const location = useLocation();
  const navigate = useNavigate();

  const { topic, level } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState([]);

  const fetchQuestions = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level }),
      });

      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (topic && level) fetchQuestions();
  }, [topic, level]);

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-card">
          <h2 className="loading-text">
            Generating your quiz ⏳<span className="dots"></span></h2>
          <p>Please wait while AI prepares your questions</p>
        </div>
      </div>
    );

  if (!questions.length) return <div className="empty">No questions available.</div>;

  const mcqQuestions = questions.filter(q => q.type === "MultiSelect");
  const descQuestions = questions.filter(q => q.type === "Long Answer");

  const handleOptionChange = (qIndex, option) => {
    setAnswers(prev => {
      const updated = [...prev];

      updated[qIndex] = {
        type: "MultiSelect",
        question: mcqQuestions[qIndex].question,
        answer: option,
      };

      return updated;
    });
  };

  const handleDescChange = (index, value) => {
    const baseIndex = mcqQuestions.length + index;

    setAnswers(prev => {
      const updated = [...prev];

      updated[baseIndex] = {
        type: "Long Answer",
        question: descQuestions[index].question,
        answer: value,
      };

      return updated;
    });
  };

  const handleSubmit = async () => {
    const formatted = answers.filter(Boolean);

    if (formatted.length !== questions.length) {
      alert("Please answer all questions");
      return;
    }

    await fetch("http://localhost:8000/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formatted),
    });

    navigate("/result");
  };

  return (
    <div className="quiz-container">
      <h1 className="title">AI Quiz</h1>

      {/* MCQs */}
      <h2 className="section-title">Multiple Choice Questions</h2>

      {mcqQuestions.map((q, i) => (
        <div key={i} className="question-card">
          <p className="question">{q.question}</p>

          {q.options.map((opt, j) => (
            <label key={j} className="option">
              <input
                type="radio"
                name={`mcq-${i}`}
                checked={answers[i]?.answer === opt}
                onChange={() => handleOptionChange(i, opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      ))}

      {/* Descriptive */}
      <h2 className="section-title">Descriptive Questions</h2>

      {descQuestions.map((q, i) => (
        <div key={i} className="question-card">
          <p className="question">{q.question}</p>
          <textarea
            className="textarea"
            onChange={(e) => handleDescChange(i, e.target.value)}
          />
        </div>
      ))}

      <button className="submit-btn" onClick={handleSubmit}>
        Submit Quiz
      </button>
    </div>
  );
}

export default Test;