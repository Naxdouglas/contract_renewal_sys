import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../components/css/styles.css";

const ApproverDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [activeSection, setActiveSection] = useState("home");
  const [noteInput, setNoteInput] = useState("");
  const [currentRequestId, setCurrentRequestId] = useState(null);

  // Load requests from backend
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch("http://127.0.0.1:8000/api/renewal-requests/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setRequests(data);
        } else {
          console.error("Failed to fetch requests");
        }
      } catch (err) {
        console.error("Error fetching requests:", err);
      }
    };

    fetchRequests();
  }, []);

  // Handle approve/reject
  const handleDecision = async (id, decision) => {
    if (!noteInput.trim()) {
      alert("Please provide strategic notes before making a decision.");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://127.0.0.1:8000/api/renewal-requests/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: decision,
          strategicNote: noteInput,
          returnedToHR: true,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setRequests(requests.map(r => (r.id === id ? updated : r)));
        setNoteInput("");
        setCurrentRequestId(null);
      } else {
        console.error("Failed to update request");
      }
    } catch (err) {
      console.error("Error updating request:", err);
    }
  };

  // Logout redirect
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/"; // back to login
  };

  const pendingRequests = requests.filter(r => r.status === "Pending");
  const approvedRequests = requests.filter(r => r.status === "Approved");
  const rejectedRequests = requests.filter(r => r.status === "Rejected");

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <nav className="sidebar">
        <h4>Approver Options</h4>
        <ul className="nav flex-column text-center">
          <li className="nav-item">
            <button className="btn btn-custom-outline" onClick={() => setActiveSection("home")}>
              Home
            </button>
          </li>
          <li className="nav-item">
            <button className="btn btn-custom-outline" onClick={() => setActiveSection("pending-requests")}>
              Pending Requests
            </button>
          </li>
          <li className="nav-item">
            <button className="btn btn-custom-outline" onClick={() => setActiveSection("approved-requests")}>
              Approved Requests
            </button>
          </li>
          <li className="nav-item">
            <button className="btn btn-custom-outline" onClick={() => setActiveSection("rejected-requests")}>
              Rejected Requests
            </button>
          </li>
          <li className="nav-item">
            <button className="btn btn-custom-danger" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Home Section */}
        {activeSection === "home" && (
          <div>
            <div className="intro-section">
              <div className="card card-dashboard-intro p-4">
                <h1 className="text-center mb-4 heading-primary">Welcome to the Contract Renewal Approver Dashboard</h1>
                <p className="text-center text-muted-small">Use the sidebar to review, approve, or reject contract renewal requests.</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="row text-center mt-4">
              <div className="col-md-4">
                <div className="card card-custom">
                    <h5 className="card-custom text-primary">Pending Requests</h5>
                    <p className="card-text display-4 text-primary">{pendingRequests.length}</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card card-custom">
                  
                    <h5 className="card-custom text-success">Approved Requests</h5>
                    <p className="card-text display-4 text-success">{approvedRequests.length}</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card card-custom">
                    <h5 className="card-custom text-danger">Rejected Requests</h5>
                    <p className="card-text display-4 text-danger">{rejectedRequests.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Requests */}
        {activeSection === "pending-requests" && (
          <div>
            <h1 className="heading-secondary text-center mb-4">Pending Contract Renewal Requests</h1>
            <ul className="list-group">
              {pendingRequests.map(r => (
                <li key={r.id} className="list-group-item d-flex flex-column mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>{r.officer} - {r.position}</strong>
                  </div>
                  <p className="mb-1"><strong>HR Notes:</strong> {r.hrNotes}</p>

                  {currentRequestId === r.id ? (
                    <div className="mt-2">
                      <textarea
                        className="form-control mb-2"
                        placeholder="Enter strategic notes (alignment, funding, staffing)"
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                      ></textarea>
                      <button className="btn btn-success me-2" onClick={() => handleDecision(r.id, "Approved")}>
                        Confirm Approve
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDecision(r.id, "Rejected")}>
                        Confirm Reject
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <button className="btn btn-primary me-2" onClick={() => setCurrentRequestId(r.id)}>
                        Review & Decide
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Approved Requests */}
        {activeSection === "approved-requests" && (
          <div>
            <h1 className="heading-secondary text-center mb-4">Approved Contract Renewals</h1>
            {approvedRequests.length === 0 ? (
              <p>No approved requests yet.</p>
            ) : (
              <ul className="list-group">
                {approvedRequests.map(r => (
                  <li key={r.id} className="list-group-item">
                    <strong>{r.officer} - {r.position}</strong>
                    <p><strong>Strategic Notes:</strong> {r.strategicNote}</p>
                    <p>{r.returnedToHR ? "Decision returned to HR" : "Pending return to HR"}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Rejected Requests */}
        {activeSection === "rejected-requests" && (
          <div>
            <h1 className="heading-secondary text-center mb-4">Rejected Contract Renewals</h1>
            {rejectedRequests.length === 0 ? (
              <p>No rejected requests yet.</p>
            ) : (
              <ul className="list-group">
                {rejectedRequests.map(r => (
                  <li key={r.id} className="list-group-item">
                    <strong>{r.officer} - {r.position}</strong>
                    <p><strong>Strategic Notes:</strong> {r.strategicNote}</p>
                    <p>{r.returnedToHR ? "Decision returned to HR" : "Pending return to HR"}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ApproverDashboard;
