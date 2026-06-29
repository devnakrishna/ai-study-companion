import { useEffect, useState, useRef, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import "../styles/ReportCard.css";

export default function ReportCard() {
  const navigate = useNavigate();
  const reportRef = useRef();
  const userId = localStorage.getItem("user_id");
  const [data, setData] = useState({
    name: "Student",
    email: "",
    college: "",
    department: "",
    total_quizzes: 0,
    average_score: 0,
    division: "N/A",
    topics: []
  });

  const [expandedRows, setExpandedRows] = useState({});

  // ---------------- FETCH ----------------
  useEffect(() => {
    if (!userId) return;
    axios.get(`http://localhost:8000/report/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => setData(res.data))
      .catch(console.error);
  }, [userId]);

  const {
    name,
    email,
    college,
    department,
    total_quizzes,
    average_score,
    division,
    topics = []
  } = data;

  const toggleRow = (subject) => {
    setExpandedRows(prev => ({
      ...prev,
      [subject]: !prev[subject]
    }));
  };

  // ---------------- PDF EXPORT ----------------
  const downloadPDF = async () => {
    const element = reportRef.current;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    // Formats filename to Student_Name_Report_Card.pdf
    pdf.save(`${name.replace(/\s+/g, '_')}_Report_Card.pdf`);
  };



  return (
    <div className="report-wrapper">

      {/* ACTION BAR */}
      <div className="report-actions">
        <button onClick={() => navigate("/home")}>Home</button>
        <button onClick={() => window.print()}>Print</button>
        <button onClick={downloadPDF} className="primary">
          Download PDF
        </button>
      </div>

      {/* PROFESSIONAL TRANSCRIPT */}
      <div ref={reportRef} className="report-paper">

        {/* HEADER */}
        <div className="report-header">
          {/* Main Title */}
          <h1 className="report-main-title">Assessment Report</h1>
          <div className="report-meta"></div>
        </div>

        <hr className="divider" />

        {/* STUDENT DETAILS WRAPPER WITH PICTURE PLACEHOLDER */}
        <div className="student-details-wrapper">
          <div className="student-details">
            <div className="detail-group">
              <strong>Student Name</strong> <span>{name}</span>
            </div>
            <div className="detail-group">
              <strong>Email Address</strong> <span>{email || "N/A"}</span>
            </div>
            <div className="detail-group">
              <strong>College</strong> <span>{college || "N/A"}</span>
            </div>
            <div className="detail-group">
              <strong>Department</strong> <span>{department || "N/A"}</span>
            </div>
            <div className="detail-group">
              <strong>Registration No</strong> <span>REG-{new Date().getFullYear()}-00{userId || "0"}</span>
            </div>
            <div className="detail-group">
              <strong>Date Issued</strong> <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <div className="student-avatar-container">
            <div className="student-avatar-placeholder">
              {localStorage.getItem("profile_pic") ? (
                <img
                  src={`http://localhost:8000/${localStorage.getItem("profile_pic")}`}
                  className="report-avatar-img"
                />
              ) : (
                <div className="student-avatar-placeholder">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}

            </div>
            <span className="avatar-label">Official Photo</span>
          </div>
        </div>



        {/* GRADES TABLE */}
        <table className="grades-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th className="text-center">Attempts</th>
              <th className="text-center">Score (%)</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {topics.length > 0 ? (
              topics.map((t, i) => {
                const isExpanded = !!expandedRows[t.subject];
                return (
                  <Fragment key={i}>
                    <tr className={`row-hoverable ${t.average_score < 60
                      ? "weak-row"
                      : t.average_score >= 60
                        ? "strong-row"
                        : ""
                      }`} onClick={() => toggleRow(t.subject)}>
                      <td>
                        <span className="expand-indicator" onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(t.subject);
                        }}
                        >
                          {isExpanded ? "▼" : "▶"}
                        </span>
                        {t.subject}
                      </td>
                      <td className="text-center">{t.attempts}</td>
                      <td className="text-center">{t.average_score}%</td>
                      <td>{t.remarks}</td>
                    </tr>
                    {isExpanded && (
                      <tr className="expanded-details-row">
                        <td colSpan="4">
                          <div className="expanded-details-container">
                            <div className="details-grid">
                              <div className="details-item">
                                <strong>Best Score Achieved</strong>
                                <span>{t.best_score}%</span>
                              </div>
                              <div className="details-item">
                                <strong>Total Questions Attempted</strong>
                                <span>{t.total_questions_attempted} questions</span>
                              </div>
                              <div className="details-item">
                                <strong>Performance Trend</strong>
                                <span>
                                  {t.attempts > 1
                                    ? t.average_score >= t.best_score * 0.8
                                      ? "Improving 📈"
                                      : "Needs Consistency ⚠️"
                                    : "Not enough data"}
                                </span>
                              </div>
                              <div className="details-item">
                                <strong>Average Time Spent</strong>
                                <span>{t.average_time_spent}</span>
                              </div>
                            </div>
                            <div className="improvement-recommendation">
                              <strong>Areas of Improvement & Study Plan</strong>
                              <p>{t.areas_of_improvement}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="no-records">No academic records found.</td>
              </tr>
            )}
          </tbody>
        </table>

        <hr className="subtle-divider" />

        {/* SUMMARY SECTION */}
        <div className="report-summary">
          <div className="summary-item">
            <strong>Total Quizzes</strong>
            <span>{total_quizzes}</span>
          </div>
          <div className="summary-item">
            <strong>Overall Average</strong>
            <span className="summary-value">{average_score?.toFixed(1) || 0}%</span>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${average_score || 0}%` }}></div>
            </div>
          </div>




        </div>
        <div className="ai-insights">
          <h3>AI Performance Insights</h3>

          <p>
            <strong>Strong Areas:</strong>{" "}
            {topics
              .filter(t => t.average_score > 60)
              .map(t => t.subject)
              .join(", ") || "None"}
          </p>

          <p>
            <strong>Weak Areas:</strong>{" "}
            {topics
              .filter(t => t.average_score <= 60)
              .map(t => t.subject)
              .join(", ") || "None"}
          </p>


        </div>

        {/* FOOTER */}
        <div className="report-footer">
          <p>Official Academic Document • AI Study Companion</p>
        </div>

      </div>
    </div>
  );
}