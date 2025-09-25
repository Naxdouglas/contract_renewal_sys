import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../components/css/styles.css";

const Dashboard = () => {
  const [activeRole, setActiveRole] = useState("HR"); // HR, Manager, Approver, Admin
  const [activeSection, setActiveSection] = useState("home");

  // State for dynamic data (replace with real API calls)
  const [officers, setOfficers] = useState([]);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);

  // Actions
  const submitHRRequest = (id) => {
    setOfficers(prev => prev.map(o => o.id === id ? { ...o, hrSubmitted: true } : o));
  };

  const addManagerRecommendation = (id, rec) => {
    setOfficers(prev => prev.map(o => o.id === id ? { ...o, managerRecommendation: rec } : o));
  };

  const approverDecision = (id, decision) => {
    setOfficers(prev => prev.map(o => o.id === id ? { ...o, approverDecision: decision } : o));
  };

  const closeTicket = (id) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "Closed" } : t));
  };

  const sidebarOptions = {
    HR: ["Home", "Officers Requests"],
    Manager: ["Home", "Staff Requests", "Performance Evaluation"],
    Approver: ["Home", "Pending Requests", "Approved Requests", "Rejected Requests"],
    Admin: ["Home", "Manage Users", "Support Tickets"],
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <nav className="sidebar">
        <h4>{activeRole} Dashboard</h4>
        <ul className="nav flex-column text-center">
          {sidebarOptions[activeRole].map((opt) => (
            <li key={opt} className="nav-item">
              <button
                className="btn btn-custom-outline"
                onClick={() => setActiveSection(opt.toLowerCase().replace(" ", "-"))}
              >
                {opt}
              </button>
            </li>
          ))}
          <li className="nav-item">
            <button className="btn btn-custom-danger" onClick={() => alert("Logging out...")}>Logout</button>
          </li>
        </ul>

        <hr />
        <div className="text-center mt-2">
          <label>Switch Role:</label>
          <select
            className="form-select"
            value={activeRole}
            onChange={(e) => {
              setActiveRole(e.target.value);
              setActiveSection("home");
            }}
          >
            <option value="HR">HR</option>
            <option value="Manager">Manager</option>
            <option value="Approver">Approver</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {activeSection === "home" && (
          <div>
            <h1 className="heading-primary text-center mb-4">Welcome to {activeRole} Dashboard</h1>
            <div className="row text-center mt-4">
              {activeRole === "HR" && (
                <div className="col-md-6">
                  <div className="card shadow-lg border-0">
                    <div className="card-body">
                      <h5>Total Officers</h5>
                      <p className="display-4">{officers.length}</p>
                    </div>
                  </div>
                </div>
              )}
              {activeRole === "Admin" && (
                <>
                  <div className="col-md-4">
                    <div className="card shadow-lg border-0">
                      <div className="card-body">
                        <h5>Total Users</h5>
                        <p className="display-4">{users.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card shadow-lg border-0">
                      <div className="card-body">
                        <h5>Open Tickets</h5>
                        <p className="display-4">{tickets.filter(t => t.status === "Open").length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card shadow-lg border-0">
                      <div className="card-body">
                        <h5>Closed Tickets</h5>
                        <p className="display-4">{tickets.filter(t => t.status === "Closed").length}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* HR: Submit Requests */}
        {activeSection === "officers-requests" && activeRole === "HR" && (
          <div>
            <h2 className="heading-secondary text-center mb-4">Submit Contract Renewal Requests</h2>
            <ul className="list-group">
              {officers.map((o) => (
                <li key={o.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {o.name} ({o.position})
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={o.hrSubmitted}
                    onClick={() => submitHRRequest(o.id)}
                  >
                    {o.hrSubmitted ? "Submitted" : "Submit Request"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Manager: Staff Requests */}
        {activeSection === "staff-requests" && activeRole === "Manager" && (
          <div>
            <h2 className="heading-secondary text-center mb-4">Staff Renewal Requests</h2>
            <ul className="list-group">
              {officers.filter((o) => o.hrSubmitted).map((o) => (
                <li key={o.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {o.name} ({o.position})
                  <div>
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={() => addManagerRecommendation(o.id, "Renew")}
                    >
                      Recommend Renew
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => addManagerRecommendation(o.id, "Do Not Renew")}
                    >
                      Do Not Renew
                    </button>
                  </div>
                  {o.managerRecommendation && (
                    <div className="mt-2">
                      <strong>Recommendation:</strong> {o.managerRecommendation}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Approver: Pending Requests */}
        {activeSection === "pending-requests" && activeRole === "Approver" && (
          <div>
            <h2 className="heading-secondary text-center mb-4">Pending Requests from Managers</h2>
            <ul className="list-group">
              {officers.filter((o) => o.managerRecommendation).map((o) => (
                <li key={o.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {o.name} ({o.position}) - Manager Recommendation: {o.managerRecommendation}
                  <div>
                    <button className="btn btn-success btn-sm me-2" onClick={() => approverDecision(o.id, "Approved")}>
                      Approve
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => approverDecision(o.id, "Rejected")}>
                      Reject
                    </button>
                  </div>
                  {o.approverDecision && (
                    <div className="mt-2">
                      <strong>Decision:</strong> {o.approverDecision}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Admin: Support Tickets */}
        {activeSection === "support-tickets" && activeRole === "Admin" && (
          <div>
            <h2 className="heading-secondary text-center mb-4">Support Tickets</h2>
            <ul className="list-group">
              {tickets.map((t) => (
                <li key={t.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {t.user}: {t.issue} (Status: {t.status})
                  {t.status === "Open" && (
                    <button className="btn btn-success btn-sm" onClick={() => closeTicket(t.id)}>
                      Close Ticket
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;