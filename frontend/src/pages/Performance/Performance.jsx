import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTopicPerformance } from "../../services/quizService";
import "./Performance.css";

function Performance() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPerformance = async () => {
      setLoading(true);
      try {
        const res = await getTopicPerformance();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  if (loading) return <p>Loading performance...</p>;

  if (!data.length) return <p>No performance data yet.</p>;

  return (
    <div className="performance-container">
      <h1>Your Topic Performance</h1>

      {data.map((item, index) => {
        let status = "";
        if (item.avg_score >= 75) status = "Strong 💪";
        else if (item.avg_score >= 50) status = "Average 🙂";
        else status = "Weak ⚠️";

        return (
          <div key={index} className="performance-card">
            <h2>{item.topic}</h2>
            <p>Average Score: {item.avg_score}%</p>
            <p>Last Score: {item.last_score}%</p>
            <p>Attempts: {item.attempts}</p>
            <p>Status: {status}</p>
          </div>
        );
      })}
    <button className="back-btn" onClick={() => navigate("/")}>
  ⬅ Back to Home
</button>
    </div>
  );
}

export default Performance;