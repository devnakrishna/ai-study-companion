import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ReportCard.css";

export default function ReportCard() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    total_quizzes: 0,
    average_score: 0,
    strong_topics: [],
    weak_topics: []
  });

  useEffect(() => {
    fetch("http://localhost:8000/report/1")
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  const {
    total_quizzes,
    average_score,
    strong_topics,
    weak_topics
  } = data;

  const uniqueWeak = [...new Set(weak_topics)];
  const uniqueStrong = [...new Set(strong_topics)];

  return (
    <div className="report-page">

      {/* HEADER */}
      <div className="report-header">
        <h1>📊 AI Study Report</h1>
        <p>Your learning progress overview</p>
      </div>

      {/* STATS */}
      <div className="report-grid">

        <div className="report-card">
          <h3>Total Quizzes</h3>
          <p>{total_quizzes}</p>
        </div>

        <div className="report-card highlight">
          <h3>Average Score</h3>
          <p>{average_score.toFixed(1)}%</p>
        </div>

      </div>

      {/* INSIGHT */}
      <div className="insight-card">
        <h2>🧠 AI Insight</h2>
        <p>
          Strong in <b>{uniqueStrong?.[0] || "various topics"}</b>,
          but needs focus on <b>{uniqueWeak?.[0] || "consistency"}</b>.
        </p>
      </div>

      {/* STRONG */}
      <div className="topic-section">
        <h2>🟢 Strong Topics</h2>
        <div className="tag-wrap">
          {uniqueStrong.map((t, i) => (
            <span key={i} className="tag green">{t}</span>
          ))}
        </div>
      </div>

      {/* WEAK (CLICKABLE) */}
      <div className="topic-section">
        <h2>🔴 Weak Topics (Revise)</h2>
        <div className="tag-wrap">
          {uniqueWeak.map((t, i) => (
            <a
              key={i}
              className="tag red"
              href={`https://www.youtube.com/results?search_query=${t}+tutorial`}
              target="_blank"
              rel="noreferrer"
            >
              {t}
            </a>
          ))}
        </div>
      </div>

      {/* BUTTON */}
      <button className="back-btn" onClick={() => navigate("/home")}>
        ⬅ Back to Home
      </button>

    </div>
  );
}