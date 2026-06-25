import { useState } from "react";
import axios from "axios";
import { Search, Building2, GraduationCap, Crown, Award, BookOpen, Users } from "lucide-react";
import "../styles/Admin.css"; 

function Admin() {
  const [users, setUsers] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    college: "",
    department: ""
  });

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const fetchData = () => {
    setLoading(true);
    axios.get("http://localhost:8000/admin/users-ranking", {
      params: {
        college: filters.college || null,
        department: filters.department || null
      }
    })
    .then(res => {
      setUsers(res.data);
      setSearched(true);
      setLoading(false);
    })
    .catch(err => {
      console.log(err);
      setLoading(false);
    });
  };

  return (
    <div className="admin-wrapper">
      <div className="admin-container">
        
        {/* HEADER */}
        <div className="admin-header">
          <div className="title-wrapper">
            <Crown className="icon-title" />
            <h2>Admin Dashboard</h2>
          </div>
          <p className="subtitle">Manage and track student performance rankings</p>
        </div>

        {/* SEARCH CARD */}
        <div className="admin-card search-section">
          <div className="search-flex">
            
            <div className="input-wrapper">
              <Building2 className="input-icon" />
              <input
                name="college"
                value={filters.college}
                onChange={handleChange}
                placeholder="Search by college name..."
                className="admin-input"
              />
            </div>

            <div className="input-wrapper">
              <GraduationCap className="input-icon" />
              <input
                name="department"
                value={filters.department}
                onChange={handleChange}
                placeholder="Search by department..."
                className="admin-input"
              />
            </div>

            <button className="btn-search" onClick={fetchData} disabled={loading}>
              <Search className="btn-icon" />
              {loading ? "Searching..." : "Search Users"}
            </button>
            
          </div>
        </div>

        {/* RESULTS SECTION */}
        <div className="results-section">
          
          {!searched ? (
            <div className="empty-state">
              <div className="empty-icon-wrapper">
                <Users className="empty-icon" />
              </div>
              <h3>Ready to search</h3>
              <p>Enter a college or department above to view student rankings.</p>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrapper">
                <Search className="empty-icon" />
              </div>
              <h3>No students found</h3>
              <p>Try adjusting your search filters to find results.</p>
            </div>
          ) : (
            <div className="ranking-list">
              {users.map((u, index) => (
                <div key={u.user_id} className="admin-card rank-card">
                  
                  {/* Rank Badge */}
                  <div className={`rank-badge ${index < 3 ? 'top-rank' : ''}`}>
                    #{u.rank}
                  </div>

                  {/* User Info */}
                  <div className="user-info">
                    <h3 className="user-name">{u.name}</h3>
                    <div className="user-meta">
                      <span className="meta-item">
                        <Building2 className="meta-icon" /> {u.college}
                      </span>
                      <span className="meta-item">
                        <GraduationCap className="meta-icon" /> {u.department}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="user-stats">
                    <div className="stat-box highlight">
                      <span className="stat-label">Skill Score</span>
                      <span className="stat-value"><Award className="stat-icon" /> {u.skill_score}%</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Topics</span>
                      <span className="stat-value"><BookOpen className="stat-icon" /> {u.topics_count}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Admin;