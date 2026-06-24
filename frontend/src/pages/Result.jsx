import { useState } from "react";
import "../styles/Result.css";
import { useLocation, useNavigate } from "react-router-dom";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state?.result;

  const [openCorrect, setOpenCorrect] = useState(true);
  const [openWrong, setOpenWrong] = useState(false);

  if (!result) return <div className="empty">No result found</div>;

  const score = result.scorecard?.percentage || 0;

  const getLevel = () => {
    if (score >= 80) return "🔥 Advanced Level. Excellent Performance";
    if (score >= 60) return "👍 Intermediate Level.Good Performance";
    if (score >= 40) return "⚠️ Beginner Level. Average Performance";
    return "❌ Needs Improvement";
  };

  // FIXED FILTER LOGIC (clean + safe)
  const correct = result.review.filter((r) => {
    if (r.type === "mcq") return r.is_correct;
    return r.score >= 3;
  });

  const wrong = result.review.filter((r) => {
    if (r.type === "mcq") return !r.is_correct;
    return r.score < 3;
  });

  return (
    <div className="result-page">

      {/* TOP SUMMARY */}
      <div className="result-hero card">
        <h1>{getLevel()}</h1>
        <h2 className="score">{score}%</h2>

        <p className="text-muted">
          {result.scorecard.total_questions} questions attempted
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="summary-grid">

        <div className="card summary-card">
          <h3>Total</h3>
          <p>{result.scorecard.total_questions}</p>
        </div>

        <div className="card summary-card">
          <h3>MCQ Score</h3>
          <p>{result.scorecard.mcq.score}/{result.scorecard.mcq.total}</p>
        </div>

        <div className="card summary-card">
          <h3>Descriptive</h3>
          <p>{result.scorecard.descriptive.score}/{result.scorecard.descriptive.total}</p>
        </div>

      </div>

      {/* CORRECT */}
      <div className="section">
        <button
          className="accordion-title correct"
          onClick={() => setOpenCorrect(!openCorrect)}
        >
          ✅ Correct Answers ({correct.length})
        </button>

        {openCorrect && (
          <div className="grid">
            {correct.map((q, i) => (
              <div className="review-card correct-card" key={i}>
                <h4>{i + 1}. {q.question}</h4>

                <p><b>Your Answer:</b> {q.your_answer}</p>

                {/* FIXED SCORE DISPLAY */}
                {q.type === "mcq" ? (
                  <p className="score-mini">
                    Score: {q.is_correct ? "1/1" : "0/1"}
                  </p>
                ) : (
                  <p className="score-mini">
                    Score: {q.score}/5
                  </p>
                )}

                {q.type === "descriptive" && (
                  <p className="ai-feedback">
                    🤖 {q.feedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WRONG */}
      <div className="section">
        <button
          className="accordion-title wrong"
          onClick={() => setOpenWrong(!openWrong)}
        >
          ❌ Needs Review ({wrong.length})
        </button>

        {openWrong && (
          <div className="grid">
            {wrong.map((q, i) => (
              <div className="review-card wrong-card" key={i}>
                <h4>{i + 1}. {q.question}</h4>

                <p><b>Your Answer:</b> {q.your_answer}</p>

                {q.type === "mcq" && q.correct_answer && (
                  <p><b>Correct Answer:</b> {q.correct_answer}</p>
                )}

                {q.type === "descriptive" && (
                  <p className="ai-feedback">
                    🤖 {q.feedback}
                  </p>
                )}

                {/* FIXED SCORE DISPLAY */}
                {q.type === "mcq" ? (
                  <p className="score-mini">
                    Score: 0/1
                  </p>
                ) : (
                  <p className="score-mini">
                    Score: {q.score}/5
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTION BUTTONS (UNCHANGED UI STRUCTURE) */}
      <div className="actions">
        <button className="btn btn-primary" onClick={() => navigate("/home")}>
          Home
        </button>

        <button className="btn btn-secondary" onClick={() => navigate("/performance")}>
          📊 View my Previous Performance
        </button>

        <button className="btn btn-secondary" onClick={() => navigate("/report")}>
          Report Card
        </button>
      </div>

    </div>
  );
}

export default Result;