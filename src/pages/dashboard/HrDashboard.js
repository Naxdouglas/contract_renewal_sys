import React, { useState, useEffect } from "react";
import axios from "axios";
import defaultProfile from "../../components/asserts/profile/profile.png"; // default image 
import "../../components/css/styles.css";
import "../../components/css/dashboard/hr_dashboard.css";

axios.defaults.baseURL = 'http://localhost:8000/api/'; //backend URL
axios.defaults.headers.common['Authorization'] = 'Bearer ${token}';

const HrDashboard = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [activeTab, setActiveTab] = useState("view-officers");
  const [officers, setOfficers] = useState([]);
  const [terminatedOfficers, setTerminatedOfficers] = useState([]);
  const [newOfficer, setNewOfficer] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    role: "OFFICER",
    phone: "",
    contract: ""
  });
  const [reportType, setReportType] = useState("");
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      const response = await axios.get("/api/users/?search=OFFICER");
      const filtered = response.data.filter(user => user.role === "OFFICER");
      setOfficers(filtered);
    } catch (error) {
      console.error("Error fetching officers:", error);
    }
  };

  const getContractStatus = (contractDateStr) => {
    const today = new Date();
    const contractDate = new Date(contractDateStr);
    const diffDays = Math.ceil((contractDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Expired";
    if (diffDays <= 30) return "Expiring Soon";
    return "Active";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewOfficer({ ...newOfficer, [name]: value });
  };

  const handleAddOfficer = async (e) => {
    e.preventDefault();
    try {
      const { first_name, last_name, email, username, role, phone, contract } = newOfficer;
      // Create user
      const userResponse = await axios.post("users/", {
        username,
        first_name,
        last_name,
        email,
        role,
        phone,
        password: "TempPass123!"
      });
      const officerId = userResponse.data.id;

      // Create contract
      await axios.post("contracts/", {
        officer_id: officerId,
        end_date: contract,
        title: "Employment Contract",
        terms: "Default contract terms"
      });

      // Reset form
      setNewOfficer({
        first_name: "",
        last_name: "",
        email: "",
        username: "",
        role: "OFFICER",
        phone: "",
        contract: ""
      });
      setActiveTab("view-officers");
      fetchOfficers();
      alert("Officer added successfully. Default password is 'TempPass123!'");
    } catch (error) {
      console.error("Error adding officer:", error);
      alert("Failed to add officer.");
    }
  };

  const renewContract = async (officerId) => {
    const newDate = prompt("Enter new contract end date (YYYY-MM-DD):");
    if (!newDate) return;
    try {
      await axios.patch(`/api/users/${officerId}/`, { contract: newDate });
      fetchOfficers();
    } catch (error) {
      console.error("Error renewing contract:", error);
    }
  };

  const terminateOfficer = async (officerId) => {
    try {
      await axios.delete(`/api/users/${officerId}/`);
      const terminated = officers.find(o => o.id === officerId);
      setTerminatedOfficers([...terminatedOfficers, { ...terminated, status: getContractStatus(terminated.contract) }]);
      setOfficers(officers.filter(o => o.id !== officerId));
    } catch (error) {
      console.error("Error terminating officer:", error);
    }
  };

  const toggleCompliance = async (officerId, currentStatus) => {
    try {
      await axios.patch(`/api/users/${officerId}/`, { complianceStatus: !currentStatus });
      fetchOfficers();
    } catch (error) {
      console.error("Error toggling compliance:", error);
    }
  };

  const approveRenewal = async (officerId) => {
    const newDate = prompt("Enter new contract end date (YYYY-MM-DD):");
    if (!newDate) return;
    try {
      await axios.patch(`/api/users/${officerId}/`, { contract: newDate, renewalApproved: true });
      fetchOfficers();
    } catch (error) {
      console.error("Error approving renewal:", error);
    }
  };

  const generateReport = () => {
    const data = officers.map((o) => ({
      ...o,
      status: getContractStatus(o.contract),
    }));

    let filtered = [];
    if (reportType === "all") filtered = data;
    else if (reportType === "expiring") filtered = data.filter((o) => o.status === "Expiring Soon");
    else if (reportType === "terminated") filtered = terminatedOfficers;

    setReportData(filtered);
  };

  const handleDocumentUpload = async (e, officerId) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("document", file);
    try {
      const response = await axios.post(`/api/documents/upload/${officerId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(`Document "${response.data.name}" uploaded successfully!`);
      setOfficers(officers.map(o => {
        if (o.id === officerId) {
          return {
            ...o,
            documents: o.documents ? [...o.documents, response.data.name] : [response.data.name]
          };
        }
        return o;
      }));
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Failed to upload document.");
    }
  };

  const activeContracts = officers.filter((o) => getContractStatus(o.contract) === "Active").length;
  const pendingRenewals = officers.filter((o) => getContractStatus(o.contract) === "Expiring Soon").length;
  const renewalCases = officers.filter((o) => getContractStatus(o.contract) === "Expiring Soon");

  return (
    <div className="dashboard-wrapper" style={{ display: "flex" }}>
      {/* Sidebar */}
        <nav className="sidebar" style={{ width: "250px" }}>
          <h4>HR Options</h4>
          <div className="profile-section" onClick={() => setActiveSection("profile")}>
            <img src={defaultProfile} alt="Profile" />
            {/* <h5>{defaultProfile.name}</h5>
            <p>{defaultProfile.position}</p> */}
          </div>

          <ul className="nav flex-column text-center">
            <li className="nav-item">
              <button className="btn btn-custom-outline" onClick={() => setActiveSection("home")}>
                Home
              </button>
            </li>
            <li className="nav-item">
              <button
                className="btn btn-custom-outline"
                onClick={() => {
                  setActiveSection("officers");
                  setActiveTab("view-officers");
                }}
              >
                Officers Management
              </button>
            </li>
            <li className="nav-item">
              <button
                className="btn btn-custom-outline"
                onClick={() => {
                  setActiveSection("hr-processes");
                  setActiveTab("verify-documents");
                }}
              >
                HR Processes
              </button>
            </li>
            <li className="nav-item">
              <button className="btn btn-custom-outline" onClick={() => { setActiveSection("reports"); setReportData([]); }}>
                Generate Reports
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
        {/* Home Dashboard */}
        {activeSection === "home" && (
          <div>
            <div className="intro-section">
              <div className="card card-dashboard-intro p-4">
                <h1 className="text-center mb-4 heading-primary">Welcome to the HR Dashboard</h1>
                <p className="text-center text-muted-small">Use the sidebar to navigate through HR-specific options.</p>
              </div>
            </div>
            {/* Quick Stats */}
            <div className="row text-center mb-4">
              <div className="col-md-4 mb-3">
                <div className="card card-custom">
                  <h5 className="text-primary">Total Officers</h5>
                  <p className="display-4">{officers.length}</p>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="card card-custom">
                  <h5 className="text-success">Active Contracts</h5>
                  <p className="display-4">{activeContracts}</p>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="card card-custom">
                  <h5 className="text-warning">Pending Renewals</h5>
                  <p className="display-4">{pendingRenewals}</p>
                </div>
              </div>
            </div>
            {/* Quick Links */}
            <div className="row text-center mt-5">
              <div className="col-md-6 mb-2">
                <button className="btn btn-custom-primary w-100 shadow-sm" onClick={() => { setActiveSection("officers"); setActiveTab("view-officers"); }}>View Officers</button>
              </div>
              <div className="col-md-6 mb-2">
                <button className="btn btn-custom-primary w-100 shadow-sm" onClick={() => { setActiveSection("reports"); setReportData([]); }}>Generate Reports</button>
              </div>
            </div>
          </div>
        )}

        {/* Officers Management with Tabs */}
        {activeSection === "officers" && (
          <div>
            <h2 className="text-center mb-4">Officers Management</h2>
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "view-officers" ? "active" : ""}`}
                  onClick={() => setActiveTab("view-officers")}
                >
                  View Officers
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "add-officer" ? "active" : ""}`}
                  onClick={() => setActiveTab("add-officer")}
                >
                  Add Officer
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "manage-contracts" ? "active" : ""}`}
                  onClick={() => setActiveTab("manage-contracts")}
                >
                  Manage Contracts
                </button>
              </li>
            </ul>

            {activeTab === "view-officers" && (
              <table className="table table-striped table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Contract End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {officers.map((officer, index) => (
                    <tr key={officer.id}>
                      <td>{index + 1}</td>
                      <td>{officer.first_name} {officer.last_name}</td>
                      <td>{officer.position}</td>
                      <td>{officer.contract}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "add-officer" && (
              <form onSubmit={handleAddOfficer} className="border p-4 mb-4 bg-light rounded shadow-sm">
                <div className="mb-3">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="first_name"
                    value={newOfficer.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="last_name"
                    value={newOfficer.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={newOfficer.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    value={newOfficer.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    name="role"
                    value={newOfficer.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="OFFICER">Officer</option>
                    <option value="HR">HR</option>
                    <option value="MANAGER">Manager</option>
                    <option value="APPROVER">Approver</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={newOfficer.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Contract End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="contract"
                    value={newOfficer.contract}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">Add Officer</button>
              </form>
            )}

            {activeTab === "manage-contracts" && (
              <table className="table table-striped table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Contract End Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {officers.map((officer, index) => {
                    const status = getContractStatus(officer.contract);
                    return (
                      <tr key={officer.id}>
                        <td>{index + 1}</td>
                        <td>{officer.first_name} {officer.last_name}</td>
                        <td>{officer.position}</td>
                        <td>{officer.contract}</td>
                        <td>{status}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-success me-2"
                            onClick={() => {
                              const newDate = prompt(`Enter new contract end date for ${officer.first_name} ${officer.last_name} (YYYY-MM-DD):`);
                              if (newDate) {
                                axios
                                  .patch(`/api/users/${officer.id}/`, { contract: newDate })
                                  .then(() => fetchOfficers())
                                  .catch(console.error);
                              }
                            }}
                          >
                            Renew
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              axios
                                .delete(`/api/users/${officer.id}/`)
                                .then(() => {
                                  setOfficers(officers.filter(o => o.id !== officer.id));
                                  setTerminatedOfficers([...terminatedOfficers, { ...officer, status }]);
                                })
                                .catch(console.error);
                            }}
                          >
                            Terminate
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* HR Processes */}
        {activeSection === "hr-processes" && (
          <div>
            <h2 className="text-center mb-4">HR Processes</h2>
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "verify-documents" ? "active" : ""}`}
                  onClick={() => setActiveTab("verify-documents")}
                >
                  Verify Documents
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "compliance-check" ? "active" : ""}`}
                  onClick={() => setActiveTab("compliance-check")}
                >
                  Compliance Check
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "prepare-renewals" ? "active" : ""}`}
                  onClick={() => setActiveTab("prepare-renewals")}
                >
                  Prepare Renewal Cases
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "approve-renewals" ? "active" : ""}`}
                  onClick={() => setActiveTab("approve-renewals")}
                >
                  Approve / Issue Renewals
                </button>
              </li>
            </ul>

            {activeTab === "verify-documents" && (
              <table className="table table-striped table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Documents</th>
                    <th>Upload</th>
                  </tr>
                </thead>
                <tbody>
                  {officers.map((o, idx) => (
                    <tr key={o.id}>
                      <td>{idx + 1}</td>
                      <td>{o.first_name} {o.last_name}</td>
                      <td>{o.documents && o.documents.length ? o.documents.join(", ") : "No documents"}</td>
                      <td>
                        <input
                          type="file"
                          onChange={(e) => handleDocumentUpload(e, o.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "compliance-check" && (
              <table className="table table-striped table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Qualification</th>
                    <th>Conduct Report</th>
                    <th>Compliant?</th>
                    <th>Toggle</th>
                  </tr>
                </thead>
                <tbody>
                  {officers.map((o, idx) => (
                    <tr key={o.id}>
                      <td>{idx + 1}</td>
                      <td>{o.first_name} {o.last_name}</td>
                      <td>{o.qualification}</td>
                      <td>{o.conductReport}</td>
                      <td>{o.complianceStatus ? "Yes" : "No"}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => toggleCompliance(o.id, o.complianceStatus)}
                        >
                          Toggle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "prepare-renewals" && (
              <div>
                {renewalCases.length === 0 ? (
                  <p className="text-center">No contracts expiring soon.</p>
                ) : (
                  <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Contract End Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renewalCases.map((o, idx) => (
                        <tr key={o.id}>
                          <td>{idx + 1}</td>
                          <td>{o.first_name} {o.last_name}</td>
                          <td>{o.position}</td>
                          <td>{o.contract}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === "approve-renewals" && (
              <table className="table table-striped table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Contract End Date</th>
                    <th>Renewal Approved?</th>
                    <th>Approve Renewal</th>
                  </tr>
                </thead>
                <tbody>
                  {officers.map((o, idx) => (
                    <tr key={o.id}>
                      <td>{idx + 1}</td>
                      <td>{o.first_name} {o.last_name}</td>
                      <td>{o.contract}</td>
                      <td>{o.renewalApproved ? "Yes" : "No"}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => approveRenewal(o.id)}
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Reports */}
        {activeSection === "reports" && (
          <div>
            <h2 className="text-center mb-4">Generate Reports</h2>
            <div className="mb-3">
              <label className="form-label">Select Report Type</label>
              <select
                className="form-select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="">-- Choose Report --</option>
                <option value="all">All Officers</option>
                <option value="expiring">Expiring Contracts (Next 30 Days)</option>
                <option value="terminated">Terminated Officers</option>
              </select>
            </div>
            <button className="btn btn-primary mb-3" onClick={generateReport}>Generate</button>
            {reportData.length > 0 && (
              <table className="table table-striped table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Contract End Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((officer, index) => (
                    <tr key={officer.id}>
                      <td>{index + 1}</td>
                      <td>{officer.first_name} {officer.last_name}</td>
                      <td>{officer.position}</td>
                      <td>{officer.contract}</td>
                      <td>{officer.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default HrDashboard;