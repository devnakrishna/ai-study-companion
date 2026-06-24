import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Master.css";
import "../styles/Home.css";

const Home = () => {
  const [topic, setTopic] = React.useState("");
  const [level, setLevel] = React.useState("");

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleStart = () => {
    if (!topic.trim() || !level) return;
    navigate("/test", { state: { topic, level } });
  };

  return (
    <div className="dashboard">

      {/* NAVIGATION BAR */}
      <div className="topbar">

        <div>
          <h2 className="title">AI Study Companion</h2>
                  </div>
        <div className="nav-actions">
            <button
            className="btn btn-secondary"
            onClick={() => navigate("/performance")}
          >
           📊 View my Previous Performance
          </button>

          
        <button
            className="btn btn-danger"
            onClick={handleLogout}
          >
              ↪️ Logout
          </button>
          </div>        

      </div>

      {/* WORKSPACE */}
      <div className="workspace">

        <div className="glass-card">
          <div className="title-action-row">

          <h1 className="hero-title">Start Quiz</h1>
          <div className="right-inline">

          <div className="info-badge">
    i
    <span className="tooltip">
      Enter a topic and select difficulty.
      AI will generate MCQ + descriptive questions and evaluate your answers instantly.
    </span>
  </div>
  </div>
  </div>


          <input
            className="input"
            placeholder="Topic (e.g. Data Structures, AI, DBMS)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          {/* SELECT WITH INDICATOR */}
          <div className="select-wrapper">
            <select
              className="input select"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="">Select difficulty</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <button
            className={`btn btn-primary big-btn ${topic && level ? "active" : "disabled"}`}
            onClick={handleStart}
            
          >
            Generate Quiz
          </button>

        </div>

      </div>
           
    </div>
  );
};

export default Home;