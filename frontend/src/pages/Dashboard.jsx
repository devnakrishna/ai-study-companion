import MainLayout from "../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function Home() {
  const navigate = useNavigate();
   const [skillset, setSkillset] = useState({ strong: [], weak: [] });

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    axios.get(`http://localhost:8000/topic-performance/${userId}`)
      .then((res) => {
        const data = res.data;

        const strong = data.filter(t => t.avg_score >= 75);
        const weak = data.filter(t => t.avg_score < 75);

        setSkillset({ strong, weak });
      });
  }, []);

  const name = localStorage.getItem("name");
  const college = localStorage.getItem("college");
  const department=localStorage.getItem("department");

  return (
    

      <div className="dashboard">

        {/* HERO SECTION */}
        <div className="card hero-card">
          <h2>Welcome back, {name} 👋</h2>
          <p>College: {college}</p>
          <p>Department: {department}</p>
          
        </div>

        {/* INSIGHTS SECTION (SKILLSET ONLY FOR NOW) */}
        <div className="dashboard-grid">

          <div className="card stat-card">
            <h3>💡 Skillset</h3>

            <div>
          <p><b>Strong Topics:</b></p>
          {skillset.strong.map(t => (
            <span key={t.topic} className="tag green">
              {t.topic}
            </span>
          ))}
        </div>
        <div style={{ marginTop: "10px" }}>
          <p><b>Weak Topics:</b></p>
          {skillset.weak.map(t => (
            <span key={t.topic} className="tag red">
              {t.topic}
            </span>
          ))}
        </div>
           
          </div>

        </div>

        {/* MAIN CTA */}
        <div className="card cta-card">

          <h2>Ready for your next challenge?</h2>

          <button
            className="btn btn-primary big-btn"
            onClick={() => navigate("/newassessment")}
          >
            🚀 Start New Assessment
          </button>

        </div>

      </div>

    
  );
}

export default Home;