import { useState, useEffect } from "react";
import { CAFE24_CONFIG } from "../utils/constants";

export const useAuthCode = () => {
  const [authCode, setAuthCode] = useState("");
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // URL에서 인증 코드 자동 추출
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    if (code) {
      console.log("URL에서 인증 코드 발견:", code);
      setAuthCode(code);

      // 자동으로 토큰 발급 시도
      getAccessTokenFromCode(code, state);
    } else {
      // 저장된 토큰 확인
      checkSavedToken();
    }
  }, []);

  const checkSavedToken = () => {
    const savedToken = localStorage.getItem("cafe24_access_token");
    const tokenExpires = localStorage.getItem("cafe24_token_expires");

    if (savedToken && tokenExpires && Date.now() < parseInt(tokenExpires)) {
      setIsAuthenticated(true);
      setTokenData({
        access_token: savedToken,
        expires_at: new Date(parseInt(tokenExpires)),
      });
    }
  };

  const getAccessTokenFromCode = async (code, state) => {
    setLoading(true);
    setError("");

    try {
      const token = await requestAccessToken(code, state);

      // 토큰 저장
      localStorage.setItem("cafe24_access_token", token.access_token);
      localStorage.setItem("cafe24_refresh_token", token.refresh_token);
      localStorage.setItem(
        "cafe24_token_expires",
        Date.now() + token.expires_in * 1000
      );

      setTokenData({
        ...token,
        expires_at: new Date(Date.now() + token.expires_in * 1000),
      });
      setIsAuthenticated(true);

      // URL에서 파라미터 제거 (선택사항)
      const url = new URL(window.location);
      url.searchParams.delete("code");
      url.searchParams.delete("state");
      window.history.replaceState({}, "", url);
    } catch (err) {
      console.error("토큰 발급 실패:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestAccessToken = async (code, state) => {
    const url = `https://gongbang301.cafe24api.com/api/v2/oauth/token`;
    const clientId = process.env.REACT_APP_CAFE24_CLIENT_ID;
    const clientSecret = process.env.REACT_APP_CAFE24_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("클라이언트 ID 또는 시크릿이 설정되지 않았습니다.");
    }

    const credentials = btoa(`${clientId}:${clientSecret}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: "https://gongbang301.com", // 실제 리다이렉트 URI
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `토큰 발급 실패: ${errorData.error_description || response.status}`
      );
    }

    return await response.json();
  };

  const manualTokenRequest = async (manualCode) => {
    if (!manualCode.trim()) {
      setError("인증 코드를 입력해주세요.");
      return;
    }

    await getAccessTokenFromCode(manualCode.trim());
  };

  const clearAuth = () => {
    localStorage.removeItem("cafe24_access_token");
    localStorage.removeItem("cafe24_refresh_token");
    localStorage.removeItem("cafe24_token_expires");
    setTokenData(null);
    setIsAuthenticated(false);
    setAuthCode("");
    setError("");
  };

  return {
    authCode,
    tokenData,
    loading,
    error,
    isAuthenticated,
    manualTokenRequest,
    clearAuth,
  };
};
