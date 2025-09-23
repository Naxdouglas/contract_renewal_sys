import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../components/css/styles.css";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    role: "OFFICER",
    phone: "",
  });
  const [editUserId, setEditUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({});
  const [error, setError] = useState("");

  // ✅ Use correct token key
  const token = localStorage.getItem("token");

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/users/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Users API response:", res.data);
      setUsers(res.data.results || res.data.users || res.data); // adjust to API format
    } catch (err) {
      console.error(err);
      setError("Failed to load users. Please try again.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle input changes
  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleEditUserChange = (e) => {
    const { name, value } = e.target;
    setEditUserData({ ...editUserData, [name]: value });
  };

  // Create new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8000/api/users/",
        { ...newUser },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewUser({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        email: "",
        role: "OFFICER",
        phone: "",
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to create user. Check console for details.");
    }
  };

  // Delete user
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/users/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user. Check console for details.");
    }
  };

  // Start editing a user
  const startEditUser = (user) => {
    setEditUserId(user.id);
    setEditUserData({
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
    });
  };

  // Save edited user
  const handleSaveEdit = async (id) => {
    try {
      await axios.put(
        `http://localhost:8000/api/users/${id}/`,
        { ...editUserData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditUserId(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update user. Check console for details.");
    }
  };

  // Close ticket
  const closeTicket = (id) => {
    setTickets(tickets.map((t) => (t.id === id ? { ...t, status: "Closed" } : t)));
  };

  const openTickets = tickets.filter((t) => t.status === "Open");
  const closedTickets = tickets.filter((t) => t.status === "Closed");

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <nav className="sidebar">
        <h4>Admin Options</h4>
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
              onClick={() => setActiveSection("manage-users")}
            >
              Manage Users
            </button>
          </li>
          <li className="nav-item">
            <button
              className="btn btn-custom-outline"
              onClick={() => setActiveSection("support-tickets")}
            >
              Support Tickets
            </button>
          </li>
          <li className="nav-item">
            <button
              className="btn btn-custom-danger"
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Home */}
        {activeSection === "home" && (
          <div>
            <h1 className="heading-primary text-center mb-4">
              Welcome to the System Admin Dashboard
            </h1>
            <p className="text-muted-small text-center">
              Manage system access, ensure data security, and provide technical
              support.
            </p>
            <div className="row text-center mt-4">
              <div className="col-md-4">
                <div className="card shadow-lg border-0">
                  <div className="card-body">
                    <h5 className="card-title text-primary">Total Users</h5>
                    <p className="card-text display-4 text-primary">
                      {users.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card shadow-lg border-0">
                  <div className="card-body">
                    <h5 className="card-title text-success">Open Tickets</h5>
                    <p className="card-text display-4 text-success">
                      {openTickets.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card shadow-lg border-0">
                  <div className="card-body">
                    <h5 className="card-title text-danger">Closed Tickets</h5>
                    <p className="card-text display-4 text-danger">
                      {closedTickets.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manage Users */}
        {activeSection === "manage-users" && (
          <div>
            <h1 className="heading-secondary text-center mb-4">
              Manage System Users
            </h1>

            {/* Add User Form */}
            <form
              onSubmit={handleAddUser}
              className="shadow p-4 rounded bg-light mb-4"
            >
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Username</label>
                  <input
                    name="username"
                    value={newUser.username}
                    onChange={handleNewUserChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Role</label>
                  <select
                    name="role"
                    value={newUser.role}
                    onChange={handleNewUserChange}
                    className="form-select"
                    required
                  >
                    <option value="">-- Select Role --</option>
                    <option value="HR">HR</option>
                    <option value="MANAGER">Manager</option>
                    <option value="APPROVER">Approver</option>
                    <option value="OFFICER">Officer</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    name="email"
                    value={newUser.email}
                    onChange={handleNewUserChange}
                    type="email"
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Password</label>
                  <input
                    name="password"
                    value={newUser.password}
                    onChange={handleNewUserChange}
                    type="password"
                    className="form-control"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Create User
              </button>
            </form>

            {/* Users Table */}
            <table className="table table-striped table-bordered table-custom">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u.id}>
                    <td>{idx + 1}</td>
                    <td>
                      {editUserId === u.id ? (
                        <input
                          name="username"
                          value={editUserData.username}
                          onChange={handleEditUserChange}
                          className="form-control"
                        />
                      ) : (
                        u.username
                      )}
                    </td>
                    <td>
                      {editUserId === u.id ? (
                        <select
                          name="role"
                          value={editUserData.role}
                          onChange={handleEditUserChange}
                          className="form-select"
                        >
                          <option value="HR">HR</option>
                          <option value="MANAGER">Manager</option>
                          <option value="APPROVER">Approver</option>
                          <option value="OFFICER">Officer</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      ) : (
                        u.role
                      )}
                    </td>
                    <td>
                      {editUserId === u.id ? (
                        <input
                          name="email"
                          value={editUserData.email}
                          onChange={handleEditUserChange}
                          className="form-control"
                        />
                      ) : (
                        u.email
                      )}
                    </td>
                    <td>
                      {editUserId === u.id ? (
                        <>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => handleSaveEdit(u.id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEditUserId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={() => startEditUser(u)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Support Tickets */}
        {activeSection === "support-tickets" && (
          <div>
            <h1 className="heading-secondary text-center mb-4">
              Support Tickets
            </h1>
            {tickets.length === 0 ? (
              <p>No support tickets.</p>
            ) : (
              <ul className="list-group">
                {tickets.map((t) => (
                  <li
                    key={t.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{t.user}</strong>: {t.issue} <br />
                      Status: <strong>{t.status}</strong>
                    </div>
                    {t.status === "Open" && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => closeTicket(t.id)}
                      >
                        Close Ticket
                      </button>
                    )}
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

export default AdminDashboard;
