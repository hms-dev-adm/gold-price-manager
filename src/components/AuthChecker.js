// src/components/AuthChecker.js (새 파일 생성)
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import App from "../App";
import AuthPage from "./AuthPage";
import ProductManager from "./ProductManager.js";

const AuthChecker = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const savedToken = localStorage.getItem("cafe24_access_token");
    const tokenExpires = localStorage.getItem("cafe24_token_expires");

    if (savedToken && tokenExpires) {
      const isExpired = Date.now() >= parseInt(tokenExpires);
      setIsAuthenticated(!isExpired);
    } else {
      setIsAuthenticated(false);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          fontSize: "18px",
        }}
      >
        로딩 중...
      </div>
    );
  }

  return (
    <Routes>
      {/* 기본 경로 - 토큰 상태에 따라 리다이렉트 */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/auth" replace /> : <App />}
      />

      {/* 인증 페이지 */}
      <Route path="/auth" element={<AuthPage />} />

      {/* 상품 관리 페이지 */}
      <Route
        path="/products"
        element={
          isAuthenticated ? <ProductManager /> : <Navigate to="/" replace />
        }
      />
    </Routes>
  );
};

export default AuthChecker;
