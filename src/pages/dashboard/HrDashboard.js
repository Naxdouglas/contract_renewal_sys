import React, { useState, useEffect } from "react";
import axios from "axios"; 
import "bootstrap/dist/css/bootstrap.min.css";
import "../../components/css/styles.css";

const HrDashboard = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [activeTab, setActiveTab] = useState("view-officers");
  const [officers, setOfficers] = useState([]);
  const [terminatedOfficers, setTerminatedOfficers] = useState([]);
  const [newOfficer, setNewOfficer] = useState({
    name: "",
    position: "",
    contract: "",
    qualification: "",
    conductReport: ""
  });
  const [reportType, setReportType] = useState("");
  const [reportData, setReportData] = useState([]);

  // 🔹 Fetch officers from API
  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      const response = await axios.get("/api/officers/");
      setOfficers(response.data);
    } catch (error) {
      console.error("Error fetching officers:", error);
    }
  };

  // 🔹 Utility: Contract Status
  const getContractStatus = (contractDateStr) => {
    const today = new Date();
    const contractDate = new Date(contractDateStr);
    const diffDays = Math.ceil((contractDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Expired";
    if (diffDays <= 30) return "Expiring Soon";
    return "Active";
  };

  // 🔹 Add new officer (POST)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewOfficer({ ...newOfficer, [name]: value });
  };

  const handleAddOfficer = async (e) => {
  e.preventDefault();

  try {
    // Create user payload — exclude 'contract'
    const { contract, ...userPayload } = newOfficer;

    const payload = {
      ...userPayload,
      password: "TempPass123!" // default password
    };

    // Make API call to create the user
    const userResponse = await axios.post("/api/users/", payload);
    const officerId = userResponse.data.id;

    // Create contract for the officer
    const contractPayload = {
      officer_id: officerId,
      end_date: contract,
      title: "Employment Contract",
      terms: "Default contract terms"
    };

    await axios.post("/api/contracts/", contractPayload);

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

    // Refresh officers list
    fetchOfficers();

    alert("Officer added successfully. Default password is 'TempPass123!'");
  } catch (error) {
    console.error("Error adding officer:", error.response?.data || error.message);

    // Show backend errors in alert if available
    const message = error.response?.data
      ? JSON.stringify(error.response.data)
      : "Failed to add officer.";
    alert(message);
  }
};



  // 🔹 Renew contract (PATCH)
  const renewContract = async (officerId) => {
    const newDate = prompt("Enter new contract end date (YYYY-MM-DD):");
    if (!newDate) return;

    try {
      const response = await axios.patch(`/api/officers/${officerId}/`, { contract: newDate });
      setOfficers(officers.map(o => (o.id === officerId ? response.data : o)));
    } catch (error) {
      console.error("Error renewing contract:", error);
    }
  };

  // 🔹 Terminate officer (DELETE)
  const terminateOfficer = async (officerId) => {
    try {
      await axios.delete(`/api/officers/${officerId}/`);
      const terminated = officers.find(o => o.id === officerId);
      setTerminatedOfficers([...terminatedOfficers, terminated]);
      setOfficers(officers.filter(o => o.id !== officerId));
    } catch (error) {
      console.error("Error terminating officer:", error);
    }
  };

  // 🔹 Toggle compliance (PATCH)
  const toggleCompliance = async (officerId, currentStatus) => {
    try {
      const response = await axios.patch(`/api/officers/${officerId}/`, {
        complianceStatus: !currentStatus,
      });
      setOfficers(officers.map(o => (o.id === officerId ? response.data : o)));
    } catch (error) {
      console.error("Error updating compliance:", error);
    }
  };

  // 🔹 Approve renewal (PATCH)
  const approveRenewal = async (officerId) => {
    const newDate = prompt("Enter new contract end date (YYYY-MM-DD):");
    if (!newDate) return;

    try {
      const response = await axios.patch(`/api/officers/${officerId}/`, {
        contract: newDate,
        renewalApproved: true,
      });
      setOfficers(officers.map(o => (o.id === officerId ? response.data : o)));
    } catch (error) {
      console.error("Error approving renewal:", error);
    }
  };

  // 🔹 Generate Reports (local filtering)
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

  // 🔹 Handle document upload
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

      // Optionally, update officer documents locally
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
      console.error("Error uploading document:", error.response?.data || error.message);
      alert("Failed to upload document.");
    }
  };


  // Stats
  const activeContracts = officers.filter((o) => getContractStatus(o.contract) === "Active").length;
  const pendingRenewals = officers.filter((o) => getContractStatus(o.contract) === "Expiring Soon").length;
  const renewalCases = officers.filter((o) => getContractStatus(o.contract) === "Expiring Soon");

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <nav className="sidebar">
        <h4>HR Options</h4>
        <ul className="nav flex-column text-center">
          <li className="nav-item"><button className="btn btn-custom-outline" onClick={() => setActiveSection("home")}>Home</button></li>
          <li className="nav-item"><button className="btn btn-custom-outline" onClick={() => { setActiveSection("officers"); setActiveTab("view-officers"); }}>Officers Management</button></li>
          <li className="nav-item"><button className="btn btn-custom-outline" onClick={() => { setActiveSection("hr-processes"); setActiveTab("verify-documents"); }}>HR Processes</button></li>
          <li className="nav-item"><button className="btn btn-custom-outline" onClick={() => setActiveSection("reports")}>Generate Reports</button></li>
          <li className="nav-item"><button className="btn btn-custom-danger" onClick={() => alert("Logging out...")}>Logout</button></li>
        </ul>
      </nav>

      <main className="main-content">
        {/* Home Dashboard */} {activeSection === "home" && ( 
        <div> 
          <h1 className="text-center mb-4 heading-primary"> Welcome to the HR Dashboard </h1> 
          <p className="text-center text-muted"> 
            Use the sidebar to navigate through HR-specific options. 
          </p> {/* Quick Stats */}
            <div className="row text-center mt-4">
            <div className="col-md-4">
              <div className="card card-custom"> 
                <h5 className="card-custom-title text-primary">
                  Total Officers
                </h5> 
                <p className="card-text display-4 text-primary">{officers.length}</p> 
              </div>
            </div>
            <div className="col-md-4">
              <div className="card card-custom"> 
                <h5 className="card-custom-title text-success">Active Contracts</h5> 
                <p className="card-text display-4 text-success">{activeContracts}</p> 
              </div>
            </div>
            <div className="col-md-4">
              <div className="card card-custom"> 
                <h5 className="card-custom-title text-warning">Pending Renewals</h5> 
                <p className="card-text display-4 text-warning">{pendingRenewals}</p>  
              </div>
            </div>     
            </div>

            {/* Quick Links */} 
            <div className="row text-center mt-5"> 
              <div className="col-md-6"> 
                <button className="btn btn-custom-primary w-100 shadow-sm" 
                  onClick={() => setActiveSection("view-officers")} > 
                  View Officers 
                </button> 
              </div> 
              <div className="col-md-6"> 
                <button className="btn btn-custom-primary w-100 shadow-sm" 
                  onClick={() => setActiveSection("reports")} > 
                    Generate Reports 
                </button> 
              </div> 
            </div> 
        </div> 
      )}

        {/* Officers Management with Tabs */}
        {activeSection === "officers" && (
          <div>
            <h1 className="text-center mb-4">Officers Management</h1>
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button className={`nav-link ${activeTab==="view-officers"?"active":""}`} onClick={()=>setActiveTab("view-officers")}>View Officers</button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab==="add-officer"?"active":""}`} onClick={()=>setActiveTab("add-officer")}>Add Officer</button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab==="manage-contracts"?"active":""}`} onClick={()=>setActiveTab("manage-contracts")}>Manage Contracts</button>
              </li>
            </ul>

            {activeTab === "view-officers" && (
              <table className="table table-striped table-bordered table-custom">
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
                      <td>{officer.name}</td>
                      <td>{officer.position}</td>
                      <td>{officer.contract}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            { /* --- Add Officer Tab --- */ }
            {activeTab === "add-officer" && (
              <form onSubmit={handleAddOfficer} className="shadow p-4 rounded bg-light">
                <div className="mb-3">
                  <label className="form-label">First Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="first_name" 
                    value={newOfficer.first_name} 
                    onChange={handleChange} 
                    placeholder="Enter first name" 
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
                    placeholder="Enter last name" 
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
                    placeholder="Enter email" 
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
                    placeholder="Enter username" 
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
                    placeholder="Enter phone number" 
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
              <table className="table table-striped table-bordered table-custom">
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
                        <td>{officer.name}</td>
                        <td>{officer.position}</td>
                        <td>{officer.contract}</td>
                        <td>{status}</td>
                        <td>
                          <button className="btn btn-sm btn-success me-2" onClick={()=>{
                            const newDate = prompt(`Enter new contract end date for ${officer.name} (YYYY-MM-DD):`);
                            if(newDate){
                              setOfficers(officers.map(o=>o.id===officer.id?{...o,contract:newDate}:o))
                            }
                          }}>Renew</button>
                          <button className="btn btn-sm btn-danger" onClick={()=>{
                            setOfficers(officers.filter(o=>o.id!==officer.id));
                            setTerminatedOfficers([...terminatedOfficers,{...officer,status}])
                          }}>Terminate</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* HR Processes with Tabs */}
        {activeSection === "hr-processes" && (
          <div>
            <h1 className="text-center mb-4">HR Processes</h1>
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item"><button className={`nav-link ${activeTab==="verify-documents"?"active":""}`} onClick={()=>setActiveTab("verify-documents")}>Verify Documents</button></li>
              <li className="nav-item"><button className={`nav-link ${activeTab==="compliance-check"?"active":""}`} onClick={()=>setActiveTab("compliance-check")}>Compliance Check</button></li>
              <li className="nav-item"><button className={`nav-link ${activeTab==="prepare-renewals"?"active":""}`} onClick={()=>setActiveTab("prepare-renewals")}>Prepare Renewal Cases</button></li>
              <li className="nav-item"><button className={`nav-link ${activeTab==="approve-renewals"?"active":""}`} onClick={()=>setActiveTab("approve-renewals")}>Approve / Issue Renewals</button></li>
            </ul>

            {activeTab==="verify-documents" && (
              <table className="table table-striped table-bordered table-custom">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Documents</th>
                    <th>Upload</th>
                  </tr>
                </thead>
                <tbody>
                  {officers.map((o, idx)=>(
                    <tr key={o.id}>
                      <td>{idx+1}</td>
                      <td>{o.name}</td>
                      <td>{o.documents.length?o.documents.join(", "):"No documents"}</td>
                      <td><input type="file" onChange={(e)=>handleDocumentUpload(e,o.id)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab==="compliance-check" && (
              <table className="table table-striped table-bordered table-custom">
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
                  {officers.map((o,idx)=>(
                    <tr key={o.id}>
                      <td>{idx+1}</td>
                      <td>{o.name}</td>
                      <td>{o.qualification}</td>
                      <td>{o.conductReport}</td>
                      <td>{o.complianceStatus?"Yes":"No"}</td>
                      <td><button className="btn btn-sm btn-warning" onClick={()=>toggleCompliance(o.id)}>Toggle</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab==="prepare-renewals" && (
              <div>
                {renewalCases.length===0? <p className="text-center">No contracts expiring soon.</p>:
                <table className="table table-striped table-bordered table-custom">
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Contract End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renewalCases.map((o,idx)=>(
                      <tr key={o.id}>
                        <td>{idx+1}</td>
                        <td>{o.name}</td>
                        <td>{o.position}</td>
                        <td>{o.contract}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>}
              </div>
            )}

            {activeTab==="approve-renewals" && (
              <table className="table table-striped table-bordered table-custom">
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
                  {officers.map((o,idx)=>(
                    <tr key={o.id}>
                      <td>{idx+1}</td>
                      <td>{o.name}</td>
                      <td>{o.contract}</td>
                      <td>{o.renewalApproved?"Yes":"No"}</td>
                      <td><button className="btn btn-sm btn-success" onClick={()=>approveRenewal(o.id)}>Approve</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Reports */}
        {activeSection==="reports" && (
          <div className="container mt-4">
            <h1 className="text-center mb-4">Generate Reports</h1>
            <div className="mb-3">
              <label className="form-label">Select Report Type</label>
              <select className="form-select" value={reportType} onChange={(e)=>setReportType(e.target.value)}>
                <option value="">-- Choose Report --</option>
                <option value="all">All Officers</option>
                <option value="expiring">Expiring Contracts (Next 30 Days)</option>
                <option value="terminated">Terminated Officers</option>
              </select>
            </div>
            <button className="btn btn-primary mb-3" onClick={generateReport}>Generate</button>
            {reportData.length>0 && (
              <table className="table table-striped table-bordered table-custom">
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
                  {reportData.map((officer,index)=>(
                    <tr key={officer.id}>
                      <td>{index+1}</td>
                      <td>{officer.name}</td>
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
  )
};

export default HrDashboard;
