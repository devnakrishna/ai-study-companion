import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { User, Save, AlertCircle, CheckCircle } from "lucide-react";
import ModalAlert from "../components/ModalAlert";
import "../styles/Profile.css";

export default function Profile() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [colleges, setColleges] = useState([]);
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [department, setDepartment] = useState(localStorage.getItem("department") || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: "info", message: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    // Populate from local storage initially
    setFirstName(localStorage.getItem("first_name") || "");
    setLastName(localStorage.getItem("last_name") || "");
    setContact(localStorage.getItem("contact_no") || "");
    setAddress(localStorage.getItem("address") || "");
    setCollegeId(localStorage.getItem("college_id") || "");

    // Fetch fresh profile from backend
    axios.get("http://localhost:8000/users/profile", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((res) => {
        const data = res.data;
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setContact(data.contact_no || "");
        setAddress(data.address || "");
        setCollegeId(data.college_id || "");
        setEmail(data.email || "");
        setDepartment(data.department || "");

        // Sync local storage
        localStorage.setItem("first_name", data.first_name || "");
        localStorage.setItem("last_name", data.last_name || "");
        localStorage.setItem("email", data.email || "");
        localStorage.setItem("college_id", data.college_id || "");
        localStorage.setItem("college", data.college || "N/A");
        localStorage.setItem("department", data.department || "");
        localStorage.setItem("contact_no", data.contact_no || "");
        localStorage.setItem("address", data.address || "");
        localStorage.setItem("name", `${data.first_name || ""} ${data.last_name || ""}`.trim() || data.email);
      })
      .catch((err) => {
        console.error("Error fetching profile details:", err);
        setError("Failed to load registered profile details.");
      });
  }, []);
  useEffect(() => {
    axios.get("http://localhost:8000/colleges")
      .then(res => setColleges(res.data))
      .catch(console.error);
  }, []);
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:8000/users/upload-profile-pic",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      localStorage.setItem("profile_pic", res.data.profile_pic);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setAlertConfig({
        isOpen: true,
        type: "error",
        message: "Both password fields required"
      });
      return;
    }
    try {
      await axios.put("http://localhost:8000/users/change-password", {
        current_password: currentPassword,
        new_password: newPassword
      },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      setAlertConfig({
        isOpen: true,
        type: "success",
        message: "Password updated successfully!"
      });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setAlertConfig({
        isOpen: true,
        type: "error",
        message: err.response?.data?.detail || "Failed to update password."
      });
    }
  };
  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !collegeId ||
      !department.trim() ||
      !contact.trim() ||
      !address.trim()
    ) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put("http://localhost:8000/users/profile", {
        first_name: firstName,
        last_name: lastName,
        email,
        college_id: collegeId,
        department,
        contact_no: contact,
        address
      },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const data = response.data;

      // Update local storage values immediately
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("first_name", data.first_name);
      localStorage.setItem("last_name", data.last_name);
      localStorage.setItem("email", data.email);
      localStorage.setItem("college_id", data.college_id);
      localStorage.setItem("college", data.college || "N/A");
      localStorage.setItem("department", data.department);
      localStorage.setItem("contact_no", data.contact_no);
      localStorage.setItem("address", data.address);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("name", `${data.first_name || ""} ${data.last_name || ""}`.trim() || data.email);

      setSuccess("Profile updated successfully!");

      // Let it show success for 1 second, then navigate back
      setTimeout(() => {
        navigate("/home");

      }, 1000);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to update profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card-premium">

        {/* Profile Header */}
        <div className="profile-header-section">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-large">
              {localStorage.getItem("profile_pic") ? (
                <img
                  src={`http://localhost:8000/uploads/${localStorage.getItem("profile_pic")}`}
                  alt="profile"
                  className="profile-img"
                />
              ) : (
                firstName ? firstName.charAt(0).toUpperCase() : <User />
              )}
            </div>
            <label className="upload-btn">
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                hidden
              />
            </label>
          </div>
          <div className="profile-title-group">
            <h2>Manage Profile</h2>
            <p>Update your personal information and academic details</p>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="profile-error-alert">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="profile-success-alert">
            <CheckCircle size={20} />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave}>
          <div className="profile-form-grid">

            <div className="form-group-custom">
              <label>First Name</label>
              <input className="input-custom" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" required />
            </div>
            <div className="form-group-custom">
              <label>Last Name</label>
              <input className="input-custom" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" required />
            </div>
            <div className="form-group-custom">
              <label>Contact no</label>
              <input className="input-custom" value={contact} onChange={e => setContact(e.target.value)} placeholder="Contact No" required />
            </div>
            <div className="form-group-custom">
              <label>Address</label>
              <input className="input-custom" value={address} onChange={e => setAddress(e.target.value)} placeholder="Address" required />
            </div>
            <div className="form-group-custom">
              <label>Email Address</label>
              <input
                type="email"
                className="input-custom"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group-custom">
              <label>College</label>
              <select
                className="input-custom"
                value={collegeId}
                onChange={(e) => setCollegeId(Number(e.target.value))}
                required
              >
                <option value="">Select College</option>
                {colleges.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group-custom">
              <label>Department</label>
              <input
                type="text"
                className="input-custom"
                placeholder="Enter your department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={loading}
              />
            </div>

          </div>

          {/* Action buttons */}
          <div className="profile-actions-row">
            <button
              type="button"
              className="btn-profile-cancel"
              onClick={() => navigate("/home")}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-profile-save"
              disabled={loading}
            >
              <Save size={18} />
              <span>{loading ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>

        </form>
        <div className="password-section-premium">
          <h3>🔐 Change Password</h3>

          <div className="password-form-grid">
            <div className="form-group-custom">
              <label>Current Password</label>
              <input
                type="password"
                className="input-custom"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="form-group-custom">
              <label>New Password</label>
              <input
                type="password"
                className="input-custom"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <button type="button" className="btn-password-update" onClick={handleChangePassword}>
            Update Password
          </button>
        </div>
      </div>
      <ModalAlert 
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        message={alertConfig.message}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
      />
    </div>
  );
}