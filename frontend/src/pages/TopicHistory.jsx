import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTopicHistory } from "../services/quizService";
import "../styles/TopicHistory.css";

function TopicHistory() {
  const { topic } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await getTopicHistory(topic);
      setData(res);
    };

    fetchHistory();
  }, [topic]);

  return (
    <div className="history-page">

      <h1>📘 {topic} History</h1>

      {!data.length && <p>No quizzes yet.</p>}

      <div className="history-grid">
        {data.map((q, i) => (
          <div key={i} className="history-card card">
            <h3>Attempt #{data.length - i}</h3>
            <p>Score: {q.percentage}%</p>
            <p>Date: {q.created_at}</p>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={() => navigate("/performance")}>
        ⬅ Back
      </button>
    </div>
  );
}

export default TopicHistory;