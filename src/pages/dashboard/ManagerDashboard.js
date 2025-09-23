import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../components/css/styles.css";

// Mock data for renewal requests received from HR
const mockRequests = [
  { id: 1, officer: "Jane Smith", position: "Analyst", hrNotes: "Recommended by HR", performance: {}, recommendation: "", forwarded: false },
  { id: 2, officer: "John Doe", position: "Manager", hrNotes: "Review for renewal", performance: {}, recommendation: "", forwarded: false },
];

const ManagerDashboard = () => {
  const [requests, setRequests] = useState(mockRequests);
  const [activeSection, setActiveSection] = useState("home");
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [performanceInput, setPerformanceInput] = useState({
    teaching: "",
    research: "",
    discipline: "",
    contribution: "",
  });
  const [recommendationInput, setRecommendationInput] = useState("");

  const handleEvaluationChange = (e) => {
    const { name, value } = e.target;
    setPerformanceInput({ ...performanceInput, [name]: value });
  };

  const handleSubmitEvaluation = (id) => {
    if (!performanceInput.teaching || !performanceInput.research || !performanceInput.discipline || !performanceInput.contribution || !recommendationInput) {
      alert("Please fill in all evaluation fields and recommendation.");
      return;
    }

    setRequests(
      requests.map(r =>
        r.id === id
          ? { ...r, performance: performanceInput, recommendation: recommendationInput, forwarded: true }
          : r
      )
    );

    setCurrentRequestId(null);
    setPerformanceInput({ teaching: "", research: "", discipline: "", contribution: "" });
    setRecommendationInput("");
  };

  const pendingRequests = requests.filter(r => !r.forwarded);
  const forwardedRequests = requests.filter(r => r.forwarded);

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <nav className="sidebar">
        <h4>Manager Options</h4>
        <ul className="nav flex-column text-center">
          <li className="nav-item">
            <button className="btn btn-custom-outline" onClick={() => setActiveSection("home")}>Home</button>
          </li>
          <li className="nav-item">
            <button className="btn btn-custom-outline" onClick={() => setActiveSection("pending-requests")}>Pending Evaluations</button>
          </li>
          <li className="nav-item">
            <button className="btn btn-custom-outline" onClick={() => setActiveSection("forwarded-requests")}>Forwarded to HR</button>
          </li>
          <li className="nav-item">
            <button className="btn btn-custom-danger" onClick={() => alert("Logging out...")}>Logout</button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Home Section */}
        {activeSection === "home" && (
          <div>
            <h1 className="heading-primary text-center mb-4">Welcome to the Manager Dashboard</h1>
            <p className="text-muted-small text-center">Use the sidebar to review, evaluate, and recommend staff contract renewals.</p>

            <div className="row text-center mt-4">
              <div className="col-md-6">
                <div className="card shadow-lg border-0">
                  <div className="card-body">
                    <h5 className="card-title text-primary">Pending Evaluations</h5>
                    <p className="card-text display-4 text-primary">{pendingRequests.length}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card shadow-lg border-0">
                  <div className="card-body">
                    <h5 className="card-title text-success">Forwarded to HR</h5>
                    <p className="card-text display-4 text-success">{forwardedRequests.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Evaluations */}
        {activeSection === "pending-requests" && (
          <div>
            <h1 className="heading-secondary text-center mb-4">Pending Staff Evaluations</h1>
            <ul className="list-group">
              {pendingRequests.map(r => (
                <li key={r.id} className="list-group-item d-flex flex-column mb-3">
                  <strong>{r.officer} - {r.position}</strong>
                  <p><strong>HR Notes:</strong> {r.hrNotes}</p>

                  {currentRequestId === r.id ? (
                    <div className="mt-2">
                      <div className="mb-2">
                        <label>Teaching Evaluation</label>
                        <input type="text" className="form-control" name="teaching" value={performanceInput.teaching} onChange={handleEvaluationChange} />
                      </div>
                      <div className="mb-2">
                        <label>Research Evaluation</label>
                        <input type="text" className="form-control" name="research" value={performanceInput.research} onChange={handleEvaluationChange} />
                      </div>
                      <div className="mb-2">
                        <label>Work Discipline</label>
                        <input type="text" className="form-control" name="discipline" value={performanceInput.discipline} onChange={handleEvaluationChange} />
                      </div>
                      <div className="mb-2">
                        <label>Contribution to Department</label>
                        <input type="text" className="form-control" name="contribution" value={performanceInput.contribution} onChange={handleEvaluationChange} />
                      </div>
                      <div className="mb-2">
                        <label>Recommendation</label>
                        <select className="form-select" value={recommendationInput} onChange={(e) => setRecommendationInput(e.target.value)}>
                          <option value="">-- Select --</option>
                          <option value="Renew">Renew</option>
                          <option value="Do Not Renew">Do Not Renew</option>
                        </select>
                      </div>
                      <button className="btn btn-success w-100" onClick={() => handleSubmitEvaluation(r.id)}>Forward to HR</button>
                    </div>
                  ) : (
                    <button className="btn btn-primary mt-2" onClick={() => setCurrentRequestId(r.id)}>Evaluate & Recommend</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Forwarded to HR */}
        {activeSection === "forwarded-requests" && (
          <div>
            <h1 className="heading-secondary text-center mb-4">Evaluations Forwarded to HR</h1>
            {forwardedRequests.length === 0 ? (
              <p>No evaluations forwarded yet.</p>
            ) : (
              <ul className="list-group">
                {forwardedRequests.map(r => (
                  <li key={r.id} className="list-group-item">
                    <strong>{r.officer} - {r.position}</strong>
                    <p><strong>Performance Evaluation:</strong></p>
                    <ul>
                      <li>Teaching: {r.performance.teaching}</li>
                      <li>Research: {r.performance.research}</li>
                      <li>Discipline: {r.performance.discipline}</li>
                      <li>Contribution: {r.performance.contribution}</li>
                    </ul>
                    <p><strong>Recommendation:</strong> {r.recommendation}</p>
                    <p>Forwarded to HR: {r.forwarded ? "Yes" : "No"}</p>
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

export default ManagerDashboard;
