import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTopicPerformance, getTopicHistory, getSessionHistory } from "../services/quizService";
import ModalAlert from "../components/ModalAlert";
import "../styles/Performance.css";

function Performance() {
  const [data, setData] = useState([]);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [topicAttempts, setTopicAttempts] = useState({});
  const [loadingAttempts, setLoadingAttempts] = useState({});
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: "info", message: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const res = await getTopicPerformance();
      setData(res);
    };
    fetchData();
  }, []);

  const getStatus = (score) => {
    if (score >= 75) return "strong";
    if (score >= 50) return "avg";
    return "weak";
  };

  const toggleTopic = async (topic) => {
    const isExpanded = expandedTopic !== topic;
    setExpandedTopic(isExpanded ? topic : null);

    if (isExpanded && !topicAttempts[topic]) {
      setLoadingAttempts(prev => ({ ...prev, [topic]: true }));
      try {
        const res = await getTopicHistory(topic);
        setTopicAttempts(prev => ({
          ...prev,
          [topic]: res || []
        }));
      } catch (err) {
        console.error("Error loading attempts for " + topic, err);
      } finally {
        setLoadingAttempts(prev => ({ ...prev, [topic]: false }));
      }
    }
  };

  const handleAttemptClick = async (sessionId) => {
    try {
      const detailedHistory = await getSessionHistory(sessionId);
      navigate("/result", { state: { result: detailedHistory } });
    } catch (err) {
      console.error("Error loading session details:", err);
      setAlertConfig({
        isOpen: true,
        type: "error",
        message: "Failed to load attempt details."
      });
    }
  };

  return (
    <div className="performance-page">

      <h1>📈 View My Assessments</h1>

      <div className="perf-grid">

        {data.map((item, i) => {
          const isExpanded = expandedTopic === item.topic;
          const attempts = topicAttempts[item.topic] || [];
          const loading = !!loadingAttempts[item.topic];

          return (
            <div key={i} className={`perf-card ${isExpanded ? 'expanded' : ''}`}>

              <div className="perf-card-header" onClick={() => toggleTopic(item.topic)}>
                <h2 className="clickable-topic">
                  {item.topic}
                </h2>
                <span className="expand-arrow">{isExpanded ? '▼' : '▶'}</span>
              </div>

              <div className="bar">
                <div
                  className={`fill ${getStatus(item.avg_score)}`}
                  style={{ width: `${item.avg_score}%` }}
                />
              </div>

              <div className="perf-meta">
                <p>Avg: {item.avg_score}%</p>
                <p>Last: {item.last_score}%</p>
                <p>Attempts: {item.attempts}</p>
              </div>

             {isExpanded && (
  <div className="attempts-section">
    <h3>Attempt History</h3>
    {loading ? (
      <div className="spinner-container" style={{ padding: '10px 0' }}>
        <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
        <span>Loading attempts...</span>
      </div>
    ) : attempts.length > 0 ? ( // ✅ Correctly checks if attempts exist
      <div className="attempts-list">
        {attempts.map((att, idx) => (
          <div
            key={att.id}
            className="attempt-item"
            onClick={() => handleAttemptClick(att.id)}
          >
            <div className="attempt-info">
              <span className="attempt-name">Attempt #{attempts.length - idx}</span>
              <span className="attempt-date">
                {new Date(att.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <span className="attempt-score">{att.percentage}%</span>
          </div>
        ))}
      </div>
    ) : (
      <p className="no-attempts">No attempts found.</p>
    )}
  </div>
)}
              

            </div>
          );
        })}

      </div>

      <button className="back-btn" onClick={() => navigate("/home")}>
        ⬅ Back to Home
      </button>

      <ModalAlert 
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        message={alertConfig.message}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
      />
    </div>
  );
}

export default Performance;