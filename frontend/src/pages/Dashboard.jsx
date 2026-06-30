import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  User,
  GraduationCap,
  School,
  ChevronRight,
  Award,
  AlertCircle,
  Settings,
  BrainCircuit
} from 'lucide-react';
import "../styles/Dashboard.css";

function Home() {
  const navigate = useNavigate();
  const [skillset, setSkillset] = useState({ strong: [], weak: [] });

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    axios.get(`http://localhost:8000/topic-performance/${userId}`)
      .then((res) => {
        const data = res.data;

        
        const strong = data.filter(t => t.avg_score >= 60);
        const weak = data.filter(t => t.avg_score < 60);

        setSkillset({ strong, weak });
      })
      .catch((err) => {
        console.error("Error fetching topic performance:", err);
      });
  }, []);

  const name = localStorage.getItem("name");
  const college = localStorage.getItem("college");
  const department = localStorage.getItem("department");

  return (
    <div className="dashboard-container">

      {/* 1. PROFILE CARD */}
      <div className="profile-hero-card">
        <div className="profile-hero-left">
          <div className="profile-hero-avatar">
            {localStorage.getItem("profile_pic") ? (
              <img
                src={`http://localhost:8000/${localStorage.getItem("profile_pic")}`}
                alt="profile"
                className="profile-hero-avatar-img"
              />
            ) : (
              name ? name.charAt(0).toUpperCase() : <User />
            )}
          </div>
          <div className="profile-hero-details">
            <h1 className="profile-hero-name">Welcome back, {name}! 👋</h1>
            <div className="profile-hero-info">
              <span className="info-item">
                <School className="info-icon" /> {college || "N/A"}
              </span>
              <span className="divider"></span>
              <span className="info-item">
                <GraduationCap className="info-icon" /> {department || "N/A"}
              </span>
            </div>
          </div>
        </div>
        <div className="profile-hero-right">
          <button className="btn-manage-profile" onClick={() => navigate("/profile")}>
            <Settings className="btn-icon" />
            <span>Manage Profile</span>
          </button>
        </div>
      </div>

      {/* 2. TOPIC ANALYTICS SECTION */}
      <div className="analytics-section-card">
        <div className="section-header">
          <BrainCircuit className="section-icon text-indigo" />
          <div className="section-title-group">
            <h2 className="section-title">Topic Analytics</h2>
            <p className="section-subtitle">Insights from your assessments</p>
          </div>
        </div>

        <div className="analytics-grid">
          {/* Strong Topics */}
          <div className="analytics-column strong-column">
            <div className="column-header">
              <Award className="column-icon text-success" />
              <h3>Strong Topics</h3>
            </div>
            <div className="topics-list">
              {skillset.strong.length > 0 ? (
                skillset.strong.map(t => (
                  <div key={t.topic} className="topic-card topic-card-strong">
                    <span className="topic-name">{t.topic}</span>
                    <span className="topic-score-badge green-badge">{Math.round(t.avg_score)}% Avg</span>
                  </div>
                ))
              ) : (
                <div className="empty-topics-state">
                  <p>No strong topics identified yet. Keep practicing!</p>
                </div>
              )}
            </div>
          </div>

          {/* Weak Topics */}
          <div className="analytics-column weak-column">
            <div className="column-header">
              <AlertCircle className="column-icon text-danger" />
              <h3>Weak Topics</h3>
            </div>
            <div className="topics-list">
              {skillset.weak.length > 0 ? (
                skillset.weak.map(t => (
                  <div key={t.topic} className="topic-card topic-card-weak">
                    <span className="topic-name">{t.topic}</span>
                    <span className="topic-score-badge red-badge">{Math.round(t.avg_score)}% Avg</span>
                  </div>
                ))
              ) : (
                <div className="empty-topics-state">
                  <p>Great job! You don't have any weak topics.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN CTA */}
      <div className="cta-challenge-card">
        <div className="cta-content">
          <h2>Ready for your next challenge?</h2>
          <p>Generate a customized, AI-powered assessment on any topic to test your skills.</p>
        </div>
        <button
          className="btn-premium-cta"
          onClick={() => navigate("/newassessment")}
        >
          <span>Start New Assessment</span>
          <ChevronRight className="cta-btn-icon" />
        </button>
      </div>

    </div>
  );
}

export default Home;