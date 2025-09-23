import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../components/css/styles.css";
import "../../components/css/dashboard/officer_dashboard.css";
import good from "../../components/asserts/icons/good.svg"; // Import status image
import defaultProfile from "../../components/asserts/profile/profile.png"; // default image


const OfficerDashboard = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [profilePic, setProfilePic] = useState(defaultProfile);

  const mockContract = {
    officer: "Jane Smith",
    position: "Analyst",
    contractEnd: "2024-06-30",
    status: "Pending Renewal",
    email: "jane.smith@example.com",
    phone: "+123456789",
  };

  // Mock notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Your contract renewal request has been submitted.",
      type: "info",
      date: "2025-09-01",
      read: false,
    },
    {
      id: 2,
      message: "HR is reviewing your contract renewal request.",
      type: "warning",
      date: "2025-09-02",
      read: false,
    },
    {
      id: 3,
      message: "Your contract renewal has been approved 🎉",
      type: "success",
      date: "2025-09-03",
      read: false,
    },
  ]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  return (
    <div className="dashboard-wrapper" style={{ display: "flex" }}>
      {/* Sidebar */}
      <nav className="sidebar">
        <h4>Officer Options</h4>
        <div
          className="profile-section"
          onClick={() => setActiveSection("profile")}
        >
          <img src={profilePic} alt="Profile" />
          <h5>{mockContract.officer}</h5>
          <p>{mockContract.position}</p>
        </div>

        <ul className="nav flex-column text-center">
          <li className="nav-item">
            <button
              className="btn btn-custom-outline"
              onClick={() => setActiveSection("home")}
            >
              Home
            </button>
          </li>
          <li className="nav-item">
            <button
              className="btn btn-custom-outline"
              onClick={() => setActiveSection("notifications")}
            >
              Notifications
            </button>
          </li>
          <li className="nav-item">
            <button
              className="btn btn-custom-outline"
              onClick={() => setActiveSection("my-contract")}
            >
              My Contract
            </button>
          </li>
          <li className="nav-item">
            <button
              className="btn btn-custom-outline"
              onClick={() => setActiveSection("request-renewal")}
            >
              Request Renewal
            </button>
          </li>
          <li className="nav-item">
            <button
              className="btn btn-custom-danger"
              onClick={() => alert("Logging out...")}
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="main-content" style={{ flexGrow: 1 }}>
        {/* Home Section */}
        {activeSection === "home" && (
          <div>
            <h1 className="text-center mb-4 heading-primary">
              Welcome to the Officer Dashboard
            </h1>
            <p className="text-center text-muted text-muted-small">
              Use the sidebar to navigate through officer-specific options.
            </p>

            <div className="row text-center mt-4">
              <div className="col-md-4">

                <div className="card card-custom">
                  <h5 className="card-custom-title text-primary">Contract Status</h5>
                  <p className="card-text">{mockContract.status}</p>

                  <img src={good} alt="Status" className="status-image" />

                </div>

              </div>
              <div className="col-md-4">
                <div className="card card-custom">
                  <h5 className="card-custom-title text-success">Days Remaining</h5>
                  <p className="card-text display-4 text-success">
                    {Math.max(
                      0,
                      Math.floor(
                        (new Date(mockContract.contractEnd) - new Date()) /
                          (1000 * 60 * 60 * 24)
                      )
                    )}
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card card-custom">
                  <h5 className="card-custom-title text-warning">Renewal Requests</h5>
                  <p className="card-text">No pending requests</p>
                </div>
              </div>
            </div>

            <div className="row text-center mt-5">
              <div className="col-md-6">
                <button
                  className="btn btn-custom-primary w-100 shadow-sm"
                  onClick={() => setActiveSection("my-contract")}
                >
                  View My Contract
                </button>
              </div>
              <div className="col-md-6">
                <button
                  className="btn btn-custom-primary w-100 shadow-sm"
                  onClick={() => setActiveSection("request-renewal")}
                >
                  Request Renewal
                </button>
              </div>
            </div>

            <div className="mt-5 text-center">
              <h5>Helpful Resources</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="/policies" target="_blank" rel="noopener noreferrer">
                    Company Policies
                  </a>
                </li>
                <li>
                  <a href="/faq" target="_blank" rel="noopener noreferrer">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="/contact-hr" target="_blank" rel="noopener noreferrer">
                    Contact HR
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Profile Section */}
        {activeSection === "profile" && (
          <div className="profile-page">
            <h1 className="text-center mb-4 heading-secondary">My Profile</h1>
            <img src={profilePic} alt="Profile" />
            <label className="change-photo-btn">
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </label>
            <div className="profile-details-card">
              <p><strong>Name:</strong> {mockContract.officer}</p>
              <p><strong>Position:</strong> {mockContract.position}</p>
              <p><strong>Contract End:</strong> {mockContract.contractEnd}</p>
              <p><strong>Status:</strong> {mockContract.status}</p>
              <p><strong>Email:</strong> {mockContract.email}</p>
              <p><strong>Phone:</strong> {mockContract.phone}</p>
            </div>
          </div>
        )}

        {/* My Contract Section */}
        {activeSection === "my-contract" && (
          <div>
            <h1 className="text-center mb-4 heading-secondary">My Contract</h1>
            <div className="card card-custom">
              <h2 className="card-custom-title">Contract Details</h2>
              <p><strong>Name:</strong> {mockContract.officer}</p>
              <p><strong>Position:</strong> {mockContract.position}</p>
              <p><strong>Contract End:</strong> {mockContract.contractEnd}</p>
              <p><strong>Status:</strong> {mockContract.status}</p>
            </div>
            {/* Download Contract Button */}

            <button className="btn btn-custom btn-custom-primary mt-3">
              Download Contract (PDF)
            </button>
          </div>
        )}

        {/* Request Renewal Section */}
        {activeSection === "request-renewal" && (
          <div>
            <h1 className="text-center mb-4 heading-secondary">Request Renewal</h1>
            <div className="card card-custom">
              <p className="lead">
                Click the button below to request a renewal for your contract.
              </p>
              <button className="btn btn-custom btn-custom-primary w-100">
                Request Renewal
              </button>
            </div>
          </div>
        )}

        {/* Notifications Section */}
        {activeSection === "notifications" && (
          <div>
            <h1 className="text-center mb-4 heading-secondary">Notifications</h1>
            <div className="card card-custom p-3">
              <ul className="list-unstyled">
                {notifications.map((note) => (
                  <li
                    key={note.id}
                    style={{
                      marginBottom: "10px",
                      fontWeight: note.read ? "normal" : "bold",
                    }}
                  >
                    <span>[{note.date}] </span>
                    <span>{note.message}</span>
                    {!note.read && (
                      <button
                        className="btn btn-sm btn-outline-secondary ms-2"
                        onClick={() => markAsRead(note.id)}
                      >
                        Mark as Read
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OfficerDashboard;
