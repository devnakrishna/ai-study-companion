import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTopicPerformance } from "../services/quizService";
import "../styles/Performance.css";

function Performance() {
  const [data, setData] = useState([]);
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

  return (
    <div className="performance-page">

      <h1>📈 Topic Performance</h1>

      <div className="perf-grid">

        {data.map((item, i) => (
          <div key={i} className="perf-card">

            <h2
  className="clickable-topic"
  onClick={() => navigate(`/topic/${item.topic}`)}
>
  {item.topic}
</h2>

            <div className="bar">
              <div
                className={`fill ${getStatus(item.avg_score)}`}
                style={{ width: `${item.avg_score}%` }}
              />
            </div>

            <p>Avg: {item.avg_score}%</p>
            <p>Last: {item.last_score}%</p>
            <p>Attempts: {item.attempts}</p>

          </div>
        ))}

      </div>

      <button className="back-btn" onClick={() => navigate("/home")}>
        ⬅ Back to Home
      </button>

    </div>
  );
}

export default Performance;