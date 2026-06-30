import { useState } from "react";

export default function Topbar() {
  const name = localStorage.getItem("name");
  const email = localStorage.getItem("email");
  const college = localStorage.getItem("college");

  const [open, setOpen] = useState(false);

  return (
    <div className="topbar">

      <div className="topbar-left">
        <h2>Dashboard</h2>
      </div>

      {/* PROFILE AREA */}
      <div
        className="profile-wrapper"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >

        <div className="profile-pill">
          <div className="avatar">
            {localStorage.getItem("profile_pic") ? (
              <img src={`http://localhost:8000/${localStorage.getItem("profile_pic")}`} alt="avatar" />
            ) : (
              name?.charAt(0).toUpperCase()
            )}
          </div>
          <span>{name}</span>
        </div>

        {/* DROPDOWN CARD */}
        {open && (
          <div className="profile-card">

            <div className="profile-header">
              <div className="avatar big">
                {localStorage.getItem("profile_pic") ? (
                  <img src={`http://localhost:8000/${localStorage.getItem("profile_pic")}`} alt="avatar" />
                ) : (
                  name?.charAt(0).toUpperCase()
                )}
              </div>

              <div>
                <h4>{name}</h4>
                <p>{email}</p>
              </div>
            </div>

            <div className="profile-body">
              <p>🏫 {college}</p>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}