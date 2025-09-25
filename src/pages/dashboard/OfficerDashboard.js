import React, { useState, useEffect } from "react";
import axios from "axios";  // Import axios for API requests
import "bootstrap/dist/css/bootstrap.min.css";
import "../../components/css/styles.css";
import "../../components/css/dashboard/officer_dashboard.css";
import good from "../../components/asserts/icons/good.svg";  // Import status image
import defaultProfile from "../../components/asserts/profile/profile.png";  // default image

const OfficerDashboard = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [profilePic, setProfilePic] = useState(defaultProfile);
  const [contract, setContract] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [hrProfile, setHrProfile] = useState({});  // HR profile data

  useEffect(() => {
    // Fetch the contract data from API
    axios.get('/contract')  // Replace with actual API endpoint
      .then(response => {
        setContract(response.data);
      })
      .catch(error => {
        console.error('Error fetching contract data:', error);
      });

    // Fetch notifications from API
    axios.get('/notifications')  // Replace with actual API endpoint
      .then(response => {
        setNotifications(response.data);
      })
      .catch(error => {
        console.error('Error fetching notifications:', error);
      });

    // Fetch HR profile data from API
    axios.get('/profile')  // Replace with actual API endpoint
      .then(response => {
        setHrProfile(response.data);
      })
      .catch(error => {
        console.error('Error fetching profile data:', error);
      });
  }, []);  // Empty dependency array ensures the effect runs once when the component mounts

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
        <div className="profile-section" onClick={() => setActiveSection("profile")}>
          <img src={profilePic} alt="Profile" />
          <h5>{hrProfile.name}</h5>
          <p>{hrProfile.position}</p>
        </div>

        <ul className="nav flex-column text-center">
          <li className="nav-item">
            <button className="btn btn-custom-outline" onClick={() => setActiveSection("home")}>
              Home
            </button>
          </li>
          <li className="nav-item">
            <button className="btn btn-custom-outline" onClick={() => setActiveSection("notifications")}>
              Notifications
            </button>
          </li>
          <li className="nav-item">
            <button className="btn btn-custom-outline" onClick={() => setActiveSection("my-contract")}>
              My Contract
            </button>
          </li>
          <li className="nav-item">
            <button className="btn btn-custom-outline" onClick={() => setActiveSection("request-renewal")}>
              Request Renewal
            </button>
          </li>
          <li className="nav-item">
            <button className="btn btn-custom-danger" onClick={() => alert("Logging out...")}>
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
            {/*Intro-section*/}
            <div className="intro-section">
              <div className="card card-dashboard-intro p-4">
                <h1 className="text-center mb-4 heading-primary">Welcome to the Officer Dashboard</h1>
                <p className="text-center text-muted-small">Use the sidebar to navigate through officer-specific options.</p>
              </div>
            </div>
            
            <div className="row text-center mt-4">
              <div className="col-md-4">
                <div className="card card-custom">
                  <h5 className="card-custom-title text-primary">Contract Status</h5>
                  <p className="card-text">{contract.status || 'No contract stats'}</p>
                  {/* <img src={good} alt="Status" className="status-image" /> */}
                </div>
              </div>
              <div className="col-md-4">
                <div className="card card-custom">
                  <h5 className="card-custom-title text-success">Days Remaining</h5>
                  <p className="card-text display-4 text-success">
                    {contract.contractEnd
                      ? Math.max(
                          0,
                          Math.floor((new Date(contract.contractEnd) - new Date()) / (1000 * 60 * 60 * 24))
                        )
                      : '0'}
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card card-custom">
                  <h5 className="card-custom-title text-warning">Renewal Requests</h5>
                  <p className="card-text">{contract.renewalRequests || 'No pending requests'}</p>
                </div>
              </div>
            </div>

            <div className="row text-center mt-5">
              <div className="col-md-6">
                <button className="btn btn-custom-primary w-100 shadow-sm" onClick={() => setActiveSection("my-contract")}>
                  View My Contract
                </button>
              </div>
              <div className="col-md-6">
                <button className="btn btn-custom-primary w-100 shadow-sm" onClick={() => setActiveSection("request-renewal")}>
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
              <p><strong>Name:</strong> {hrProfile.name || 'Loading...'}</p>
              <p><strong>Position:</strong> {hrProfile.position || 'Loading...'}</p>
              <p><strong>Email:</strong> {hrProfile.email || 'Loading...'}</p>
            </div>
          </div>
        )}

        {/* Notifications Section */}
        {activeSection === "notifications" && (
          <div>
            <h1 className="text-center mb-4 heading-secondary">Notifications</h1>
            <div className="card card-custom p-3">
              <ul className="list-unstyled">
                {notifications.length ? (
                  notifications.map((note) => (
                    <li key={note.id} style={{ marginBottom: "10px", fontWeight: note.read ? "normal" : "bold" }}>
                      <span>[{note.date}] </span>
                      <span>{note.message}</span>
                      {!note.read && (
                        <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => markAsRead(note.id)}>
                          Mark as Read
                        </button>
                      )}
                    </li>
                  ))
                ) : (
                  <p>Loading notifications...</p>
                )}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OfficerDashboard;
