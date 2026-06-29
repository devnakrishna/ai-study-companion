import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, PlayCircle, BrainCircuit, CheckCircle, Target, BarChart } from 'lucide-react';
import { getRecommendations } from "../services/quizService"; // adjust path if needed
import "../styles/Result.css"; // Uses the CSS file provided previously

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract result from router state
  const result = location.state?.result;

  // States for Accordions and Recommendations
  const [openAccordion, setOpenAccordion] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Toggle Accordion logic (closes the other automatically)
  const toggleAccordion = (section) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  useEffect(() => {
    const fetchRecs = async () => {
      // CHANGED: result.weak_areas -> result.insights.weak_topics
      if (result?.insights?.weak_topics?.length > 0) {
        setLoadingRecs(true);
        try {
          const res = await getRecommendations(result.insights.weak_topics);

          // Using res.recommendations || res || [] acts as a safety net 
          // depending on if your backend returns an object or a direct array
          setRecommendations(res.recommendations || res || []);
        } catch (err) {
          console.error("Recommendation error:", err);
          setRecommendations([]);
        } finally {
          setLoadingRecs(false);
        }
      }
    };

    fetchRecs();
  }, [result]);

  // Safety check
  if (!result) return <div className="result-wrapper text-center p-12">No result found</div>;

  // Derived Values

  const scorecard = result.scorecard || {
    mcq: { score: 0, total: 0 },
    descriptive: { score: 0, total: 0 },
    total_score: 0,
    total_questions: 0,
    percentage: 0
  };
  const insights = result.insights || {};
  const review = result.review || [];

  const getPerformanceText = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Needs Improvement";
  };

  // Split review array into correct and wrong logic
  const correctAnswers = review.filter((r) => {
    if (r.type === "mcq") return r.is_correct;
    return (r.score || 0) >= 3;
  });

  const wrongAnswers = review.filter((r) => {
    if (r.type === "mcq") return !r.is_correct;
    return (r.score || 0) < 3;
  });



  return (
    <div className="result-wrapper">
      <div className="result-container">

        {/* Header & Actions */}
        <div className="header-section">
          <h1 className="page-title">Study Session Results</h1>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={() => navigate("/performance")}>
              📊 Previous Assessments
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/report")}>
              Report Card
            </button>
            <button className="btn btn-primary" onClick={() => navigate("/home")}>
              Go to Home
            </button>
          </div>
        </div>

        {/* 1. Core Metrics Section */}
        <div className="metrics-card-three-columns">
          <div className="metric-column-box">
            <p className="label text-muted" style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.05em', color: '#4f46e5' }}>Your Score</p>
            <div className="score-value">{scorecard.percentage}%</div>
          </div>

          <div className="metric-column-box">
            <Target className="icon icon-primary" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <p className="label text-muted" style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.05em', color: '#4f46e5', margin: 0 }}>Skillset Level</p>
              <p className="stat-value" style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', textAlign: 'center' }}>{insights?.skillset || "Beginner"}</p>
            </div>
          </div>

          <div className="metric-column-box">
            <BarChart className="icon icon-success" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <p className="label text-muted" style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.05em', color: '#4f46e5', margin: 0 }}>Performance</p>
              <p className="stat-value" style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', textAlign: 'center' }}>{getPerformanceText(scorecard.percentage)}</p>
            </div>
          </div>
        </div>

        {/* 2. The Three Columns */}
        <div className="columns-grid">
          <div className="card text-center">
            <p className="column-value">{scorecard.total_score}/{scorecard.total_questions}</p>
            <p className="label text-muted">Total Score</p>
          </div>
          <div className="card text-center">
            <p className="column-value">{scorecard.mcq?.score}/{scorecard.mcq?.total}</p>
            <p className="label text-muted">Multiple Choice Questions</p>
          </div>
          <div className="card text-center">
            <p className="column-value">{scorecard.descriptive.score}/{scorecard.descriptive.total}</p>
            <p className="label text-muted">Descriptive</p>
          </div>
        </div>

        {/* 3. AI Insights & Recommendations */}
        <div className="card insights-card">


          <div className="insights-header">
            <BrainCircuit className="icon icon-primary" />
            <h2>AI Performance Insights</h2>
          </div>

          <div className="insights-grid">
            {/* Strong Topics as Chips */}
            <div className="insight-box glass">
              <p className="label text-success mb-2">Strong In</p>
              <div className="chips-container">
                {insights?.strong_topics?.length > 0 ? (
                  insights.strong_topics.map((topic, idx) => (
                    <span key={idx} className="chip chip-success">{topic}</span>
                  ))
                ) : (
                  <span className="text-muted text-sm font-medium">Keep practicing!</span>
                )}
              </div>
            </div>

            {/* Weak Topics as Chips */}
            <div className="insight-box glass">
              <p className="label text-danger mb-2">Needs Focus</p>
              <div className="chips-container">
                {insights?.weak_topics?.length > 0 ? (
                  insights.weak_topics.map((topic, idx) => (
                    <span key={idx} className="chip chip-danger">{topic}</span>
                  ))
                ) : (
                  <span className="text-muted text-sm font-medium">None detected! Great job.</span>
                )}
              </div>
            </div>
          </div>

          {/* YouTube Recommendations as Clickable Chips */}
          {insights?.weak_topics?.length > 0 && (
            <div className="resources-section mt-4">
              <h3 className="mb-3">Recommended YouTube Tutorials:</h3>
              {loadingRecs ? (
                <div className="spinner-container" style={{ justifyContent: 'flex-start', padding: '10px 0' }}>
                  <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                  <span className="text-muted text-sm">Loading customized video links...</span>
                </div>
              ) : (
                <div className="chips-container">
                  {recommendations.length > 0 ? (
                    recommendations.map((vid, idx) => (
                      <a
                        key={idx}
                        href={vid.youtube} /* CHANGED from vid.url */
                        target="_blank"
                        rel="noopener noreferrer"
                        className="chip chip-youtube"
                      >
                        <PlayCircle className="icon-sm" />
                        <span>{vid.topic} Tutorial</span> {/* CHANGED from vid.title */}
                      </a>
                    ))
                  ) : (
                    <p className="text-muted text-sm">No specific videos found at this time.</p>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* 4. Assessment Overview */}
        <div className="card answers-review-card">
          <div className="insights-header" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BrainCircuit className="icon icon-primary" />
            <h2 style={{ fontSize: '1.25rem', color: '#1e1b4b', fontWeight: '700', margin: 0 }}>
              Assessment Overview
            </h2>
          </div>

          <div className="accordions-container">

            {/* Correct Answers Accordion */}
            <div className="card accordion" style={{ border: '1px solid var(--border-color)', boxShadow: 'none', margin: 0 }}>
              <button className="accordion-btn" onClick={() => toggleAccordion('correct')}>
                <div className="accordion-title">
                  <CheckCircle className="icon icon-success" />
                  <span>Answers you knew ({correctAnswers.length})</span>
                </div>
                <ChevronDown className={`icon chevron ${openAccordion === 'correct' ? 'open' : ''}`} />
              </button>

              {openAccordion === 'correct' && (
                <div className="accordion-content">
                  <ul className="content-list">
                    {correctAnswers.map((q, i) => (
                      <li key={i} className="list-item bg-success-light border-success">
                        <p className="question">{i + 1}. {q.question}</p>
                        <p className="answer"><b>Your Answer:</b> {q.your_answer}</p>

                        {q.type !== "mcq" && q.feedback && (
                          <div className="mt-2">
                            <p className="concept mt-1">🤖 {q.feedback}</p>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Wrong Answers Accordion */}
            <div className="card accordion" style={{ border: '1px solid var(--border-color)', boxShadow: 'none', margin: 0 }}>
              <button className="accordion-btn" onClick={() => toggleAccordion('wrong')}>
                <div className="accordion-title">
                  <Target className="icon icon-danger" />
                  <span>Concepts to review ({wrongAnswers.length})</span>
                </div>
                <ChevronDown className={`icon chevron ${openAccordion === 'wrong' ? 'open' : ''}`} />
              </button>

              {openAccordion === 'wrong' && (
                <div className="accordion-content">
                  <ul className="content-list">
                    {wrongAnswers.map((q, i) => {
                      // Check if the user left it completely blank
                      const isUnanswered = !q.your_answer || q.your_answer.trim() === "";

                      return (
                        <li key={i} className="list-item bg-danger-light border-danger">
                          <p className="question">{i + 1}. {q.question}</p>

                          {/* Display "Not answered" if blank */}
                          <p className="answer mb-1">
                            <b>Your Answer:</b> {isUnanswered ? (
                              <span className="text-danger" style={{ fontStyle: 'italic', fontWeight: '500' }}>
                                Not answered
                              </span>
                            ) : (
                              q.your_answer
                            )}
                          </p>

                          {q.type === "mcq" && q.correct_answer && (
                            <p className="text-danger font-medium mb-1"><b>Correct Answer:</b> {q.correct_answer}</p>
                          )}

                          {q.type === "mcq" ? (
                            null
                          ) : (
                            <div className="mt-2">
                              <p className="text-danger font-medium">Score: {q.score || 0}/5</p>
                              {q.feedback && <p className="concept mt-1">🤖 {q.feedback}</p>}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Result;