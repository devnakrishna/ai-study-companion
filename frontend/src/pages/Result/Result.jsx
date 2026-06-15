import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Result.css";

const Result = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
  const evaluate = async () => {
    const res = await fetch("http://localhost:8000/evaluate", {
      method: "POST",
    });

    const data = await res.json();
    setResult(data);

    // 👇 SAFE FALLBACK (important)
    const weakAreas = data?.weak_areas || [];

    const recRes = await fetch("http://localhost:8000/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ weak_areas: weakAreas }),
    });

    const recData = await recRes.json();
    setRecommendations(recData.recommendations || []);
  };

  evaluate();
}, []);
  const scorecard = result?.scorecard;
  const strong = result?.strong_areas || [];
  const weak = result?.weak_areas || [];
  
  return (
    <div className="result-container">
      <h2>Quiz Result</h2>

      {!result && <p>Calculating score...</p>}

      {scorecard && (
  <div>
    <h2>
      Score: {scorecard.total_score}/{scorecard.total_questions}
    </h2>

    <h3>Percentage: {scorecard.percentage}%</h3>

    <p>
      MCQ: {scorecard.mcq.score}/{scorecard.mcq.total}
    </p>

    <p>
      Descriptive: {scorecard.descriptive.score}/{scorecard.descriptive.total}
    </p>
  </div>
)}
      {strong.length > 0 && (
        <div>
          <h3>🟢 Strong Areas</h3>
          <ul>
            {strong.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {weak.length > 0 && (
        <div>
          <h3>🔴 Weak Areas</h3>
          <ul>
            {weak.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {recommendations.length > 0 && (
        <div>
          <h3>📺 Learn more from YouTube</h3>

          {recommendations.map((r, i) => (
            <div key={i}>
              <p>{r.topic}</p>

              <a href={r.youtube} target="_blank" rel="noreferrer">
                Watch videos
            </a>
            </div>
          ))}
        </div>
      )}
      {result?.review?.map((r, i) => (
  <div key={i} className="review-card">

    <p className="q">{r.question}</p>

    <p>
      <b>Your Answer:</b>{" "}
      <span className={r.is_correct ? "correct" : "wrong"}>
        {r.your_answer}
      </span>
    </p>

    {r.type === "mcq" && (
      <p>
        <b>Correct Answer:</b>{" "}
        <span className="correct">{r.correct_answer}</span>
      </p>
    )}
  </div>
))}
      {result?.feedback?.length > 0 && (
      <div>
        <h3>AI Feedback</h3>

        {result.feedback.map((f, i) => (
          <div key={i} className="feedback-card">
            <p><b>Q:</b> {f.question}</p>
            <p><b>Score:</b> {f.score}/5</p>
            <p>{f.feedback}</p>
          </div>
        ))}
      </div>
    )}

      <button onClick={() => navigate("/")}>
        Back to Home
      </button>
    </div>
  );
};

export default Result;