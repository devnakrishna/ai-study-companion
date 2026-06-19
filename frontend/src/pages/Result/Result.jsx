import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getRecommendations } from "../../services/quizService";
import "./Result.css";
import ReviewCard from "../../components/ReviewCard";

const Result = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { result } = location.state || {};
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!result) return;

      const weakAreas = result.weak_areas || [];

      const recData = await getRecommendations(weakAreas);
      setRecommendations(recData.recommendations || []);
    };

    fetchRecommendations();
  }, [result]);

  if (!result) {
    return <p>No result found</p>;
  }

  const scorecard = result?.scorecard;
  if (!result || !result.scorecard) {
  return <p>Loading result...</p>;
}
  const strong = result.strong_areas || [];
  const weak = result.weak_areas || [];

  return (
    <div className="result-container">
      <h2>Quiz Result</h2>

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
      
      {result.review?.map((r, i) => (
        <ReviewCard key={i} review={r} />
      ))}

      {result.feedback?.length > 0 && (
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
      <div className="buttonContainer">
        <button onClick={() => navigate("/performance")}>
         See Your Overall Performance 📊
        </button>
        <button onClick={() => navigate("/report")}
        className="report-btn">
        📊 View Full Report Card
        </button>
        <button onClick={() => navigate("/")}>
        Back to Home
        </button>
      </div>
    </div>
  );
};

export default Result;