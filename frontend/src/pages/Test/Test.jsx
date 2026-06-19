import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { generateQuiz,submitQuiz } from "../../services/quizService";
import { evaluateQuiz } from "../../services/quizService";
import "./Test.css";

function Test() {
  const location = useLocation();
  const navigate = useNavigate();

  const { topic, level } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [sessionId, setSessionId] = useState(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);

    try {
      const data = await generateQuiz(topic, level);
      if(data){
        setQuestions(data.questions);
        setSessionId(data.session_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [topic, level]);
  
  useEffect(() => {
  if (!topic || !level) {
    navigate("/");
  }
}, [topic, level, navigate]);

  useEffect(() => {
    if (topic && level) fetchQuestions();
  }, [topic, level]);

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-card">
          <h2 className="loading-text">
            Generating your quiz ⏳<span className="dots"></span>
          </h2>
          <p>Please wait while AI prepares your questions</p>
        </div>
      </div>
    );

  if (!questions.length)
    return <div className="empty">No questions available.</div>;

  const mcqQuestions = questions.filter(
    (q) => q.type === "MultiSelect"
  );

  const descQuestions = questions.filter(
    (q) => q.type === "Long Answer"
  );

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
    updated[baseIndex] = {
  question_id: descQuestions[index].id,
  user_answer: value,
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

  await submitQuiz(sessionId, formatted);

  const result = await evaluateQuiz(sessionId);

  navigate("/result", { state: { result } });
};

   

  return (
    <div className="quiz-container">
      <h1 className="title">AI Quiz</h1>

      <h2 className="section-title">
        Multiple Choice Questions
      </h2>

      {mcqQuestions.map((q, i) => (
        <div key={i} className="question-card">
          <p className="question">{q.question}</p>

          {q.options.map((opt, j) => (
            <label key={j} className="option">
              <input
                type="radio"
                name={`mcq-${i}`}
                checked={answers[i]?.user_answer=== opt}
                onChange={() =>
                  handleOptionChange(i, opt)
                }
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      ))}

      <h2 className="section-title">
        Descriptive Questions
      </h2>

      {descQuestions.map((q, i) => (
        <div key={i} className="question-card">
          <p className="question">{q.question}</p>

          <textarea
            className="textarea"
            onChange={(e) =>
              handleDescChange(i, e.target.value)
            }
          />
        </div>
      ))}

      <button
        className="submit-btn"
        onClick={handleSubmit}
      >
        Submit Quiz
      </button>
    </div>
  );
}

export default Test;