import { createContext, useState, useEffect } from "react";
import api from "../services/api"; // your axios instance

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (token) {
      api.get("users/me/")
        .then(res => setUser(res.data))
        .catch(() => logout());
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const res = await api.post("token/", { username, password });
      localStorage.setItem("token", res.data.access);
      setToken(res.data.access);
      const userRes = await api.get("users/me/");
      setUser(userRes.data);
    } catch (err) {
      console.error(err);
      throw new Error("Invalid username or password");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
