import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/NewAssessment.css";
function NewAssessment() {
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");

  const handleStart = () => {
    if (!topic || !level) return;

    navigate("/test", {
      state: { topic, level }
    });
  };

  return (
    <div className="assessment-page">

      <div className="assessment-card">

        {/* INFO BADGE */}
        <div className="info-badge">
          i
          <span className="tooltip">
            AI will generate personalized MCQ + descriptive questions based on your topic.
          </span>
        </div>

        {/* TITLE */}
        <h2 className="assessment-title">New Assessment</h2>
        
        {/* INPUTS */}
        <div className="assessment-form">

          <input
            className="input"
            placeholder="Enter topic (e.g. DBMS, AI, OS)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <select
            className="input"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="">Select skill level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

        </div>

        {/* BUTTON */}
        <button
          className={`start-btn ${topic && level ? "active" : ""}`}
          onClick={handleStart}
        >
          🚀 Start Assessment
        </button>

      </div>

    </div>
  );
}

export default NewAssessment;