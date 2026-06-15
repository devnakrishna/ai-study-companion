import React from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  
  const [topic, setTopic] = React.useState("");
  const [level, setLevel] = React.useState("Beginner");

  const navigate = useNavigate();
  const handleStartQuiz = () => {
    
    if (!topic.trim()) {
      alert("Please enter a topic");
      return;
    }

    const payload = { topic, level };
    navigate("/test", { state: payload });
  };

  return (
    <div className="home-container">
      <div className="home-card">
      <h1>AI Study Companion</h1>

      <p className="subtitle">
        Enter a topic and test your knowledge with AI-generated quizzes
      </p>

      <input
        type="text"
        placeholder="Enter topic (e.g., Java, Python)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <select value={level} 
      onChange={(e) => setLevel(e.target.value)}>
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>

      </select>

      <button onClick={handleStartQuiz} disabled={!topic.trim()}>
        Start Quiz
      </button>
      </div>
    </div>
  );
};

export default Home;