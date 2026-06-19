import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReportCard.css";

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

  if (!data || Object.keys(data).length === 0) {
    return <div className="loading">Loading report...</div>;
  }
  
  const {
  total_quizzes,
  average_score,
  strong_topics,
  weak_topics
} = data;
const uniqueWeakTopics = [...new Set(weak_topics)];
const uniqueStrongTopics = [...new Set(strong_topics)];

  return (
    <div className="container">

      <h1 className="title">📊 AI Study Report Card</h1>

      {/* SUMMARY */}
      <div className="cardRow">

        <div className="card">
          <h3>Total Quizzes</h3>
          <p className="bigText">{total_quizzes ?? 0}</p>
        </div>

        <div className="card">
          <h3>Average Score</h3>
          <p className="bigText">{((average_score/5)*100).toFixed(1)}%</p>
        </div>

      </div>
      <div className="section">
        <h2>🧠 AI Insight</h2>
         <p>
          You are strong in <b>{strong_topics?.[0] || "general topics"}</b>, 
          but need improvement in <b>{uniqueWeakTopics?.[0] || "consistency"}</b>.
          </p>
      </div>
      {/* STRONG */}
      <div className="section">
        <h2>🟢 Strong Topics</h2>
        <div className="tagContainer">
          {uniqueStrongTopics?.length ? uniqueStrongTopics.map((t, i) => (
            <span key={i} className="greenTag">{t}</span>
          )) : <p>No strong topics yet</p>}
        </div>
      </div>

      
      {/* WEAK */}
      <div className="section">
        <h2>🔴 Weak Topics</h2>
        <div className="tagContainer">
          {uniqueWeakTopics?.length ? uniqueWeakTopics.map((t, i) => (
            <span key={i} className="redTag">{t}</span>
          )) : <p>Great job 🎉 No weak topics</p>}
        </div>
      </div>

      
    
    <button className="homeBtn" onClick={() => navigate("/")}>
    ⬅ Back to Home
    </button>
  </div>
  );
}