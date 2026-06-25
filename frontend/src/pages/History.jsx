import { useEffect, useState } from "react";
import axios from "axios";

function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    axios.get(`http://localhost:8000/history/${userId}`)
      .then((res) => {
        setHistory(res.data);
      })
      .catch((err) => {
        console.log("History fetch error:", err);
      });
  }, []);

  return (
    <div className="page">

      <h2>📜 Quiz History</h2>

      <div className="history-list">

        {history.map((item) => (
          <div key={item.id} className="card history-card">

            <h3>{item.topic}</h3>

            <p>Score: {item.score}</p>
            <p>Percentage: {item.percentage}%</p>
            <p>Date: {item.created_at}</p>

          </div>
        ))}

      </div>

    </div>
  );
}

export default History;