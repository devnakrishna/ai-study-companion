import { useState, useEffect } from "react";
import axios from "axios";
import {
  Search, Building2, GraduationCap, Crown, Award, BookOpen, Users,
  Plus, Mail, MapPin, ArrowLeft, BarChart3, Percent, Calendar, Settings,
  Phone, User
} from "lucide-react";
import ModalAlert from "../components/ModalAlert";
import "../styles/Admin.css";

function Admin() {
  const [activeTab, setActiveTab] = useState("rankings"); // "rankings" | "colleges"

  // Student Rankings State
  const [users, setUsers] = useState([]);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    department: ""
  });
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: "info", message: "", onConfirm: null });
  const [filters, setFilters] = useState({
    college: "",
    department: "",
    topic: "",
    score: ""
  });

  // Colleges State
  const [colleges, setColleges] = useState([]);
  const [collegeSearch, setCollegeSearch] = useState("");
  const [newCollege, setNewCollege] = useState({ name: "", email: "", location: "", contact_no: "", point_of_contact: "" });
  const [newSpec, setNewSpec] = useState({ name: "", collegeId: "" });
  const [selectedCollegeId, setSelectedCollegeId] = useState(null);
  const [collegeMetrics, setCollegeMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // College Editing State
  const [editingCollegeId, setEditingCollegeId] = useState(null);
  const [editCollegeData, setEditCollegeData] = useState({ name: "", email: "", location: "", contact_no: "", point_of_contact: "" });

  useEffect(() => {
    fetchRankedUsers();
    fetchCollegeMetrics();
    fetchColleges();
  }, []);
  // Student ranking search handler
  const handleRankingChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };
  const handleAddStudent = async () => {
    try {
      await axios.post(
        "http://localhost:8000/admin/create-student",
        newStudent
      );

      setAlertConfig({
        isOpen: true,
        type: "success",
        message: "Student added successfully!"
      });
      fetchRankedUsers();

    } catch (err) {
      console.error(err);
      setAlertConfig({
        isOpen: true,
        type: "error",
        message: err.response?.data?.detail || "Failed to add student."
      });
    }
  };

  const fetchRankedUsers = () => {
    setLoading(true);
    axios.get("http://localhost:8000/admin/users-ranking", {
      params: {
        college: filters.college || null,
        department: filters.department || null,
        topic: filters.topic || null,
        score: filters.score || null
      }
    })
      .then(res => {
        setUsers(res.data);
        setSearched(true);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  // Fetch colleges directory
  const fetchColleges = () => {
    setLoading(true);

    axios.get("http://localhost:8000/admin/colleges", {
      params: collegeSearch?.trim()
        ? { search: collegeSearch.trim() }
        : {}
    })
      .then(res => {
        console.log("COLLEGES DATA:", res.data); // 👈 DEBUG
        setColleges(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (activeTab === "colleges") {
      fetchColleges();
    }
  }, [activeTab]);

  // Create college profile
  const handleCreateCollege = (e) => {
    e.preventDefault();
    if (!newCollege.name) return;

    axios.post("http://localhost:8000/admin/colleges", newCollege)
      .then(res => {
        setColleges([res.data, ...colleges]);
        setNewCollege({ name: "", email: "", location: "", contact_no: "", point_of_contact: "" });
        setAlertConfig({
          isOpen: true,
          type: "success",
          message: "College Profile created successfully!"
        });
      })
      .catch(err => {
        console.error(err);
        setAlertConfig({
          isOpen: true,
          type: "error",
          message: err.response?.data?.detail || "Failed to create college"
        });
      });
  };

  // College Editing Handlers
  const startEditCollege = (college) => {
    setEditingCollegeId(college.id);
    setEditCollegeData({
      name: college.name,
      email: college.email || "",
      location: college.location || "",
      contact_no: college.contact_no || "",
      point_of_contact: college.point_of_contact || ""
    });
  };

  const handleUpdateCollege = (e, collegeId) => {
    e.preventDefault();
    if (!editCollegeData.name.trim()) return;

    axios.put(`http://localhost:8000/admin/colleges/${collegeId}`, editCollegeData)
      .then(res => {
        setColleges(colleges.map(c => c.id === collegeId ? res.data : c));
        setEditingCollegeId(null);
        setAlertConfig({
          isOpen: true,
          type: "success",
          message: "College details updated successfully!"
        });
      })
      .catch(err => {
        console.error(err);
        setAlertConfig({
          isOpen: true,
          type: "error",
          message: err.response?.data?.detail || "Failed to update college details"
        });
      });
  };

  // Create specialization
  const handleCreateSpecialization = (e, collegeId) => {
    e.preventDefault();
    const specName = newSpec.name.trim();
    if (!specName) return;

    axios.post("http://localhost:8000/admin/specializations", {
      name: specName,
      college_id: collegeId
    })
      .then(res => {
        setColleges(colleges.map(c => {
          if (c.id === collegeId) {
            return {
              ...c,
              specializations: [...c.specializations, res.data]
            };
          }
          return c;
        }));
        setNewSpec({ name: "", collegeId: "" });
        setAlertConfig({
          isOpen: true,
          type: "success",
          message: "Specialization added successfully!"
        });
      })
      .catch(err => {
        console.error(err);
        setAlertConfig({
          isOpen: true,
          type: "error",
          message: err.response?.data?.detail || "Failed to add specialization"
        });
      });
  };

  const handleDeleteSpecialization = (collegeId, specId) => {
    setAlertConfig({
      isOpen: true,
      type: "confirm",
      message: "Are you sure you want to delete this specialization?",
      onConfirm: () => {
        axios.delete(`http://localhost:8000/admin/specializations/${specId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        })
          .then(() => {
            setColleges(colleges.map(c => {
              if (c.id === collegeId) {
                return {
                  ...c,
                  specializations: c.specializations.filter(s => s.id !== specId)
                };
              }
              return c;
            }));
            setAlertConfig({
              isOpen: true,
              type: "success",
              message: "Specialization deleted successfully!"
            });
          })
          .catch(err => {
            console.error(err);
            setAlertConfig({
              isOpen: true,
              type: "error",
              message: err.response?.data?.detail || "Failed to delete specialization"
            });
          });
      }
    });
  };

  // Fetch drill-down metrics
  const fetchCollegeMetrics = (collegeId) => {
    setLoadingMetrics(true);
    setSelectedCollegeId(collegeId);
    axios.get(`http://localhost:8000/admin/colleges/${collegeId}/metrics`)
      .then(res => {
        setCollegeMetrics(res.data);
        setLoadingMetrics(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingMetrics(false);
      });
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="admin-wrapper">
      <div className="admin-container">

        {/* HEADER */}
        <div className="admin-header">
          <div className="header-flex">
            <div className="title-wrapper">
              <Crown className="icon-title" />
              <h2>Admin Dashboard</h2>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
          <p className="subtitle">Manage institutions, specializations, and view deep-dive analytics</p>
        </div>

        {/* TABS NAVIGATION */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === "rankings" ? "active" : ""}`}
            onClick={() => { setActiveTab("rankings"); setSelectedCollegeId(null); }}
          >
            📊 Student Rankings
          </button>
          <button
            className={`tab-btn ${activeTab === "colleges" ? "active" : ""}`}
            onClick={() => { setActiveTab("colleges"); setSelectedCollegeId(null); }}
          >
            🏫 Colleges Directory
          </button>
        </div>

        {/* --- STUDENT RANKINGS TAB --- */}
        {activeTab === "rankings" && (
          <>
            {/* SEARCH CARD */}
            <div className="admin-card search-section">
              <div className="search-flex">
                <div className="input-wrapper">
                  <Building2 className="input-icon" />
                  <input
                    name="college"
                    value={filters.college}
                    onChange={handleRankingChange}
                    placeholder="Search by college name..."
                    className="admin-input"
                  />
                </div>

                <div className="input-wrapper">
                  <GraduationCap className="input-icon" />
                  <input
                    name="department"
                    value={filters.department}
                    onChange={handleRankingChange}
                    placeholder="Search by department..."
                    className="admin-input"
                  />
                </div>

                <div className="input-wrapper">
                  <BookOpen className="input-icon" />
                  <input
                    name="topic"
                    value={filters.topic}
                    onChange={handleRankingChange}
                    placeholder="Search by topic..."
                    className="admin-input"
                  />
                </div>

                <div className="input-wrapper">
                  <Award className="input-icon" />
                  <input
                    name="score"
                    type="number"
                    min="0"
                    max="100"
                    value={filters.score}
                    onChange={handleRankingChange}
                    placeholder="Min Score (%)"
                    className="admin-input"
                  />
                </div>

                <button className="btn-search" onClick={fetchRankedUsers} disabled={loading}>
                  <Search className="btn-icon" />
                  {loading ? "Searching..." : "Search Users"}
                </button>
              </div>
            </div>

            {/* RESULTS LIST */}
            <div className="results-section">
              {!searched ? (
                <div className="empty-state">
                  <div className="empty-icon-wrapper">
                    <Users className="empty-icon" />
                  </div>
                  <h3>Ready to search</h3>
                  <p>Enter a college or department above to view student rankings.</p>
                </div>
              ) : loading ? (
                <div className="spinner-container">
                  <div className="spinner"></div>
                  <span>Fetching student rankings...</span>
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
                      <div className={`rank-badge ${index < 3 ? 'top-rank' : ''}`}>
                        #{u.rank}
                      </div>

                      <div className="user-info">
                        <h3 className="user-name">{u.name}</h3>
                        <div className="user-meta">
                          <span className="meta-item">
                            <Building2 className="meta-icon" /> {u.college || "N/A"}
                          </span>
                          <span className="meta-item">
                            <GraduationCap className="meta-icon" /> {u.department || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="user-stats">
                        <div className="stat-box highlight">
                          <span className="stat-label">
                            {u.topic ? `Avg Score in ${u.topic}` : "Skill Score"}
                          </span>
                          <span className="stat-value"><Award className="stat-icon" /> {u.skill_score}%</span>
                        </div>
                        <div className="stat-box">
                          <span className="stat-label">Attempts</span>
                          <span className="stat-value">{u.attempts !== undefined ? u.attempts : 0}</span>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* --- COLLEGES DIRECTORY TAB --- */}
        {activeTab === "colleges" && !selectedCollegeId && (
          <div className="colleges-tab-layout">

            {/* LEFT COLUMN: REGISTRATION PORTAL */}
            <div className="admin-card portal-card">
              <h3>Create College Profile</h3>
              <form onSubmit={handleCreateCollege} className="portal-form">
                <div className="form-group">
                  <label>College Name</label>
                  <input
                    type="text"
                    placeholder="e.g. VIT University"
                    value={newCollege.name}
                    onChange={e => setNewCollege({ ...newCollege, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Official Email</label>
                  <input
                    type="email"
                    placeholder="e.g. admin@vit.edu"
                    value={newCollege.email}
                    onChange={e => setNewCollege({ ...newCollege, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Vellore, Tamil Nadu"
                    value={newCollege.location}
                    onChange={e => setNewCollege({ ...newCollege, location: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 0416-2202020"
                    value={newCollege.contact_no}
                    onChange={e => setNewCollege({ ...newCollege, contact_no: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Point of Contact (POC)</label>
                  <input
                    type="text"
                    placeholder="e.g. Dean of Academics"
                    value={newCollege.point_of_contact}
                    onChange={e => setNewCollege({ ...newCollege, point_of_contact: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-portal-submit">
                  <Plus className="btn-icon" /> Add College Profile
                </button>
              </form>
            </div>

            {/* RIGHT COLUMN: COLLEGE DIRECTORY */}
            <div className="directory-content">
              <div className="admin-card search-section" style={{ padding: '16px' }}>
                <div className="search-flex" style={{ width: '100%' }}>
                  <div className="input-wrapper">
                    <Search className="input-icon" />
                    <input
                      placeholder="Search colleges by name, location or specialization..."
                      value={collegeSearch}
                      onChange={e => setCollegeSearch(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <button className="btn-search" onClick={fetchColleges}>
                    Search
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="spinner-container">
                  <div className="spinner"></div>
                  <span>Loading directory...</span>
                </div>
              ) : colleges.length === 0 ? (
                <div className="empty-state">
                  <Building2 className="empty-icon" />
                  <h3>No Colleges Registered</h3>
                  <p>Add a new profile on the left to get started.</p>
                </div>
              ) : (
                <div className="colleges-grid-list">
                  {colleges.map(c => {
                    const isEditing = editingCollegeId === c.id;
                    return (
                      <div key={c.id} className={`admin-card college-profile-card ${isEditing ? 'editing' : ''}`}>
                        {isEditing ? (
                          <form onSubmit={(e) => handleUpdateCollege(e, c.id)} className="edit-college-form">
                            <div className="form-group-edit">
                              <label>College Name</label>
                              <input
                                type="text"
                                className="edit-input"
                                value={editCollegeData.name}
                                onChange={(e) => setEditCollegeData({ ...editCollegeData, name: e.target.value })}
                                required
                              />
                            </div>
                            <div className="form-group-edit">
                              <label>Official Email</label>
                              <input
                                type="email"
                                className="edit-input"
                                value={editCollegeData.email}
                                onChange={(e) => setEditCollegeData({ ...editCollegeData, email: e.target.value })}
                              />
                            </div>
                            <div className="form-group-edit">
                              <label>Location</label>
                              <input
                                type="text"
                                className="edit-input"
                                value={editCollegeData.location}
                                onChange={(e) => setEditCollegeData({ ...editCollegeData, location: e.target.value })}
                              />
                            </div>
                            <div className="form-group-edit">
                              <label>Contact Number</label>
                              <input
                                type="text"
                                className="edit-input"
                                value={editCollegeData.contact_no}
                                onChange={(e) => setEditCollegeData({ ...editCollegeData, contact_no: e.target.value })}
                              />
                            </div>
                            <div className="form-group-edit">
                              <label>Point of Contact (POC)</label>
                              <input
                                type="text"
                                className="edit-input"
                                value={editCollegeData.point_of_contact}
                                onChange={(e) => setEditCollegeData({ ...editCollegeData, point_of_contact: e.target.value })}
                              />
                            </div>
                            <div className="edit-actions">
                              <button type="submit" className="btn-save-edit">Save</button>
                              <button type="button" className="btn-cancel-edit" onClick={() => setEditingCollegeId(null)}>Cancel</button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="college-card-header">
                              <h4>{c.name}</h4>
                              <div className="college-actions">
                                <button className="btn-edit-college" onClick={() => startEditCollege(c)}>
                                  Edit
                                </button>
                                <button className="btn-drilldown" onClick={() => fetchCollegeMetrics(c.id)}>
                                  View Analytics →
                                </button>
                              </div>
                            </div>

                            <div className="college-card-meta">
                              {c.email && (
                                <div className="meta-item">
                                  <Mail className="meta-icon" /> {c.email}
                                </div>
                              )}
                              {c.location && (
                                <div className="meta-item">
                                  <MapPin className="meta-icon" /> {c.location}
                                </div>
                              )}
                              {c.contact_no && (
                                <div className="meta-item">
                                  <Phone className="meta-icon" /> {c.contact_no}
                                </div>
                              )}
                              {c.point_of_contact && (
                                <div className="meta-item">
                                  <User className="meta-icon" /> POC: {c.point_of_contact}
                                </div>
                              )}
                            </div>

                            {/* SPECIALIZATIONS LIST */}
                            <div className="specializations-box">
                              <h5>Specializations:</h5>
                              <div className="specs-chips">
                                {c.specializations?.length > 0 ? (
                                  c.specializations.map(s => (
                                    <span key={s.id} className="spec-chip">
                                      {s.name}
                                      <button
                                        type="button"
                                        className="delete-spec-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteSpecialization(c.id, s.id);
                                        }}
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          color: '#ef4444',
                                          marginLeft: '8px',
                                          cursor: 'pointer',
                                          fontWeight: 'bold',
                                          fontSize: '12px',
                                          padding: '0 2px'
                                        }}
                                      >
                                        &times;
                                      </button>
                                    </span>
                                  ))
                                ) : (
                                  <span className="no-specs">None assigned</span>
                                )}
                              </div>

                              {/* ADD SPEC INLINE FORM */}
                              <form
                                className="inline-spec-form"
                                onSubmit={e => handleCreateSpecialization(e, c.id)}
                              >
                                <input
                                  type="text"
                                  placeholder="Add specialization..."
                                  value={newSpec.collegeId === c.id ? newSpec.name : ""}
                                  onChange={e => setNewSpec({ name: e.target.value, collegeId: c.id })}
                                  required
                                />
                                <button type="submit">Add</button>
                              </form>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* --- DEEP-DIVE DRILLDOWN METRICS VIEW --- */}
        {activeTab === "colleges" && selectedCollegeId && (
          <div className="drilldown-layout">
            <button className="btn-back" onClick={() => { setSelectedCollegeId(null); setCollegeMetrics(null); }}>
              <ArrowLeft className="btn-icon" /> Back to Colleges Directory
            </button>

            {loadingMetrics || !collegeMetrics ? (
              <div className="spinner-container">
                <div className="spinner"></div>
                <span>Generating metrics summary...</span>
              </div>
            ) : (
              <div className="metrics-summary-view">

                {/* College Summary Banner */}
                <div className="admin-card summary-banner-card">
                  <div className="summary-banner-info">
                    <Building2 className="banner-big-icon" />
                    <div>
                      <h3>{collegeMetrics.college_name}</h3>
                      <div className="banner-sub-meta">
                        {collegeMetrics.email && <span>📧 {collegeMetrics.email}</span>}
                        {collegeMetrics.location && <span>📍 {collegeMetrics.location}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="banner-stats-grid">
                    <div className="banner-stat">
                      <span className="lbl">Total Students</span>
                      <span className="val"><Users className="stat-icon-sm" /> {collegeMetrics.total_users}</span>
                    </div>
                    <div className="banner-stat">
                      <span className="lbl">Quizzes Taken</span>
                      <span className="val"><BookOpen className="stat-icon-sm" /> {collegeMetrics.total_quizzes}</span>
                    </div>
                    <div className="banner-stat highlight">
                      <span className="lbl">Average Score</span>
                      <span className="val"><BarChart3 className="stat-icon-sm" /> {collegeMetrics.average_score}%</span>
                    </div>
                  </div>
                </div>

                {/* Users List Title */}
                <h4 className="section-title-label">Registered Students & Quiz Summaries</h4>

                {collegeMetrics.users.length === 0 ? (
                  <div className="empty-state">
                    <h3>No Users Registered</h3>
                    <p>There are no students registered under this college name.</p>
                  </div>
                ) : (
                  <div className="drilldown-users-list">
                    {collegeMetrics.users.map(u => (
                      <div key={u.user_id} className="admin-card drilldown-user-card">

                        <div className="user-drilldown-header">
                          <div>
                            <h5>{u.name}</h5>
                            <span className="user-sub">{u.email} | Dept: {u.department || "N/A"}</span>
                          </div>

                          <div className="user-score-box">
                            <div className="score-stat">
                              <span className="lbl">Quizzes</span>
                              <span className="val">{u.quizzes_count}</span>
                            </div>
                            <div className="score-stat highlight">
                              <span className="lbl">Avg Score</span>
                              <span className="val">{u.average_score}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Quizzes Sublist */}
                        {u.quizzes.length > 0 && (
                          <div className="quizzes-history-table-wrapper">
                            <h6>Quiz Attempts History:</h6>
                            <table className="drilldown-table">
                              <thead>
                                <tr>
                                  <th>Topic</th>
                                  <th>Level</th>
                                  <th>Score</th>
                                  <th>Percentage</th>
                                  <th>Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {u.quizzes.map((q, idx) => (
                                  <tr key={idx}>
                                    <td><b>{q.topic}</b></td>
                                    <td><span className={`lvl-tag ${q.level.toLowerCase()}`}>{q.level}</span></td>
                                    <td>{q.score}/{q.total_questions}</td>
                                    <td><b>{q.percentage}%</b></td>
                                    <td>{new Date(q.date).toLocaleDateString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>
        )}

      </div>
      <ModalAlert 
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false, onConfirm: null }))}
      />
    </div>
  );
}

export default Admin;