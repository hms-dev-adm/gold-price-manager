// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import AuthChecker from "./components/AuthChecker.js";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/*" element={<AuthChecker />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
