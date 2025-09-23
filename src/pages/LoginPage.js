import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../components/css/login_page.css";
import "../context/AuthContext";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/api/token/", {
        username,
        password,
      });

      // Save JWT tokens in localStorage
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      // Fetch user info to get role
      const userRes = await axios.get("http://localhost:8000/api/users/me/", {
        headers: { Authorization: `Bearer ${res.data.access}` },
      });

      const role = userRes.data.role;
      localStorage.setItem("role", role);

      // Navigate based on role
      if (role === "ADMIN") navigate("/admin-dashboard");
      else if (role === "HR") navigate("/hr-dashboard");
      else if (role === "MANAGER") navigate("/manager-dashboard");
      else if (role === "APPROVER") navigate("/approver-dashboard");
      else navigate("/officer-dashboard");
    } catch (err) {
      console.error(err);
      console.log(err)
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-page d-flex justify-content-center align-items-center vh-100">
      <div className="card card-custom p-4 large shadow" style={{ width: "28rem" }}>
        <p className="text-center mb-4 heading-primary">CONTRACT RENEWAL SYSTEM</p>
        <p className="text-center text-muted mb-4">
          Please log in to access your dashboard.
        </p>
        <form onSubmit={handleLogin}>
          {error && (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          )}
          <div className="mb-3">
            <label htmlFor="username" className="form-label fw-bold">Username</label>
            <input
              type="text"
              id="username"
              className="form-control"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-bold">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-custom btn-custom-primary w-100">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
