import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { CAFE24_CONFIG } from "./utils/constants";
import AuthCodeInput from "./components/AuthCodeInput";
import ProductPriceManager from "./components/ProductPriceManager";

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const AppHeader = styled.header`
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  border-radius: 10px;
  margin-bottom: 20px;
`;

const StatusText = styled.p`
  margin: 0;
  font-size: 1.2rem;
`;

const TokenLink = styled.a`
  color: #61dafb;
  text-decoration: none;
  margin-left: 10px;
  padding: 10px 20px;
  border: 2px solid #61dafb;
  border-radius: 5px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #61dafb;
    color: #282c34;
  }
`;

const InfoSection = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto 20px auto;
`;

const ConfigInfo = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  text-align: left;
`;

const Section = styled.section`
  margin-bottom: 40px;
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
`;

const AuthCodeDisplay = styled.div`
  background: #e8f5e8;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  border-left: 4px solid #28a745;
`;

const ErrorDisplay = styled.div`
  background: #f8d7da;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  border-left: 4px solid #dc3545;
  color: #721c24;
`;

function App() {
  const [mallId, setMallId] = useState("");
  const [tokenUrl, setTokenUrl] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(true); // 디버그 정보 표시 여부, 안보기 - false
  const [configError, setConfigError] = useState("");

  console.log("환경 변수 확인:");
  console.log("MALL_ID:", process.env.REACT_APP_CAFE24_MALL_ID);
  console.log("CLIENT_ID:", process.env.REACT_APP_CAFE24_CLIENT_ID);
  console.log("CLIENT_SECRET:", process.env.REACT_APP_CAFE24_CLIENT_SECRET);
  console.log("모든 환경 변수:", process.env);

  // 토큰 URL 생성
  const generateTokenUrl = (targetMallId) => {
    //기본 설정 확인
    //mallId
    if (!targetMallId) {
      console.error("Mall ID가 없습니다.");
      setConfigError("Mall ID가 설정되지 않았습니다.");
      return;
    }

    //clientId
    if (!CAFE24_CONFIG.CLIENT_ID || CAFE24_CONFIG.CLIENT_ID.includes("your_")) {
      console.error("Client ID가 올바르게 설정되지 않았습니다.");
      setConfigError("Client ID가 올바르게 설정되지 않았습니다.");
      return;
    }

    //redirect_url
    if (!CAFE24_CONFIG.REDIRECT_URI) {
      console.error("Redirect URI가 설정되지 않았습니다.");
      setConfigError("Redirect URI가 설정되지 않았습니다.");
      return;
    }

    const authUrl =
      `https://${targetMallId}.cafe24api.com/api/v2/oauth/authorize?` +
      `response_type=code` +
      `&client_id=${CAFE24_CONFIG.CLIENT_ID}` +
      `&state=S256` +
      `&redirect_uri=${encodeURIComponent(CAFE24_CONFIG.REDIRECT_URI)}` +
      `&scope=${encodeURIComponent(CAFE24_CONFIG.SCOPE)}`;

    setTokenUrl(authUrl);
    setConfigError(""); //error clear
    console.log("생성된 토큰 URL:", authUrl);
  };

  // 설정 확인
  const checkConfiguration = () => {
    const hasRequiredConfig =
      CAFE24_CONFIG.CLIENT_ID &&
      !CAFE24_CONFIG.CLIENT_ID.includes("your_") &&
      CAFE24_CONFIG.CLIENT_SECRET &&
      !CAFE24_CONFIG.CLIENT_SECRET.includes("your_") &&
      CAFE24_CONFIG.MALL_ID &&
      !CAFE24_CONFIG.MALL_ID.includes("your_");

    setIsConfigured(hasRequiredConfig);

    if (!hasRequiredConfig) {
      let errorMsg = "필수 설정이 누락되었습니다: ";
      const missing = [];

      if (
        !CAFE24_CONFIG.CLIENT_ID ||
        CAFE24_CONFIG.CLIENT_ID.includes("your_")
      ) {
        missing.push("CLIENT_ID");
      }
      if (
        !CAFE24_CONFIG.CLIENT_SECRET ||
        CAFE24_CONFIG.CLIENT_SECRET.includes("your_")
      ) {
        missing.push("CLIENT_SECRET");
      }
      if (!CAFE24_CONFIG.MALL_ID || CAFE24_CONFIG.MALL_ID.includes("your_")) {
        missing.push("MALL_ID");
      }

      setConfigError(errorMsg + missing.join(", "));
    } else {
      setConfigError("");
    }

    console.log("설정 확인 결과:", hasRequiredConfig ? "✅ 완료" : "❌ 미완료");
    return hasRequiredConfig;
  };

  // mall id & 인증코드 확인
  useEffect(() => {
    console.log("App 초기화 시작...");

    const url = new URL(window.location.href);
    const urlParams = url.searchParams;

    // mall id 확인
    const mallIdParam = urlParams.get("mall_id");
    const codeParam = urlParams.get("code");
    const stateParam = urlParams.get("state");

    console.log("URL 파라미터:", { mallIdParam, codeParam, stateParam });

    // Mall ID 설정
    let targetMallId = mallIdParam || CAFE24_CONFIG.MALL_ID;

    if (targetMallId && !targetMallId.includes("your_")) {
      setMallId(targetMallId);
      console.log("🏢 Mall ID 설정:", targetMallId);
    } else {
      console.error("❌ 유효한 Mall ID를 찾을 수 없습니다.");
      setConfigError("유효한 Mall ID를 찾을 수 없습니다.");
    }

    if (mallIdParam) {
      setMallId(mallIdParam);
      generateTokenUrl(mallIdParam);
    } else {
      // URL에 mall_id가 없는 경우 디폴트 값 불러오기
      if (CAFE24_CONFIG.MALL_ID && !CAFE24_CONFIG.MALL_ID.includes("your_")) {
        setMallId(CAFE24_CONFIG.MALL_ID);
        generateTokenUrl(CAFE24_CONFIG.MALL_ID);
      }
    }

    // 인증 코드 확인
    if (codeParam) {
      setAuthCode(codeParam);
      console.log("받은 인증 코드:", codeParam);
      console.log("상태값:", stateParam);
    }

    // 설정 확인 및 토큰 URL 생성
    const configValid = checkConfiguration();
    if (configValid && targetMallId) {
      generateTokenUrl(targetMallId);
    }

    // 저장된 토큰 확인
    const savedToken = localStorage.getItem("cafe24_access_token");
    const tokenExpires = localStorage.getItem("cafe24_token_expires");

    if (savedToken && tokenExpires && Date.now() < parseInt(tokenExpires)) {
      setIsAuthenticated(true);
      console.log("저장된 토큰 발견, 인증 상태로 설정");
    }
    console.log("✅ App 초기화 완료");
  }, []);

  // 인증 링크 클릭 handler
  const handleAuthClick = (e) => {
    if (!tokenUrl) {
      e.preventDefault();
      console.error("❌ 토큰 URL이 생성되지 않았습니다.");
      alert("토큰 URL이 생성되지 않았습니다. 설정을 확인해주세요.");
      setShowDebugInfo(true); // 디버그 정보 표시
      return;
    }

    console.log("🔗 인증 링크 클릭:", tokenUrl);
  };

  // 토큰 발급 완료 handler
  const handleTokenReceived = (tokenData) => {
    setIsAuthenticated(true);
    console.log("토큰 발급 완료:", tokenData);

    // URL에서 인증 코드 파라미터 제거 (선택사항)
    const url = new URL(window.location);
    url.searchParams.delete("code");
    url.searchParams.delete("state");
    window.history.replaceState({}, "", url);
  };

  // 로그아웃 handler
  const handleLogout = () => {
    localStorage.removeItem("cafe24_access_token");
    localStorage.removeItem("cafe24_refresh_token");
    localStorage.removeItem("cafe24_token_expires");
    setIsAuthenticated(false);
    setAuthCode("");
    console.log("로그아웃 완료");
  };

  return (
    <AppContainer>
      <AppHeader>
        <StatusText>
          앱실행 완료 /
          <TokenLink
            href={tokenUrl || "#"}
            onClick={handleAuthClick}
            style={{
              opacity: tokenUrl ? 1 : 0.6,
              cursor: tokenUrl ? "pointer" : "not-allowed",
            }}
          >
            {tokenUrl ? "API 자격증명 얻기" : "설정 확인 필요"}
          </TokenLink>
        </StatusText>
        {/* 설정 에러 표시 */}
        {configError && (
          <ErrorDisplay>
            <p>⚠️ {configError}</p>
            <button
              onClick={() => setShowDebugInfo(true)}
              style={{
                background: "#007bff",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              설정 정보 확인
            </button>
          </ErrorDisplay>
        )}
        {authCode && (
          <AuthCodeDisplay>
            <p>✅ 인증 코드를 받았습니다!</p>
            <p>코드: {authCode.substring(0, 20)}...</p>
            <p>상태: 토큰 발급 대기중</p>
          </AuthCodeDisplay>
        )}

        {isAuthenticated && (
          <AuthCodeDisplay>
            <p>🔐 인증 완료!</p>
            <p>카페24 API 사용 준비 완료</p>
            <button
              onClick={handleLogout}
              style={{
                background: "#dc3545",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              로그아웃
            </button>
          </AuthCodeDisplay>
        )}
      </AppHeader>

      {/* 디버그 정보 표시 */}
      {showDebugInfo && (
        <InfoSection>
          <h2>현재 설정 상태</h2>

          <ConfigInfo>
            <h3>📋 설정 정보</h3>
            <p>
              <strong>Mall ID:</strong> {mallId || "설정되지 않음"}
            </p>
            <p>
              <strong>Client ID:</strong>{" "}
              {CAFE24_CONFIG.CLIENT_ID?.substring(0, 10)}...{" "}
              {isConfigured ? "✅" : "❌"}
            </p>
            <p>
              <strong>Redirect URI:</strong> {CAFE24_CONFIG.REDIRECT_URI}
            </p>
            <p>
              <strong>권한 범위:</strong> {CAFE24_CONFIG.SCOPE}
            </p>
            <p>
              <strong>설정 완료:</strong>{" "}
              {isConfigured ? "✅ 완료" : "❌ 미완료"}
            </p>
            <p>
              <strong>인증 상태:</strong>{" "}
              {isAuthenticated ? "✅ 인증됨" : "❌ 미인증"}
            </p>
          </ConfigInfo>

          {!isConfigured && (
            <ConfigInfo
              style={{
                backgroundColor: "#fff3cd",
                border: "1px solid #ffeaa7",
              }}
            >
              <h3>⚠️ 설정이 필요합니다</h3>
              <p>다음 파일을 확인하고 올바른 값으로 설정해주세요:</p>
              <ul style={{ textAlign: "left" }}>
                <li>
                  <code>.env</code> 파일의 환경 변수들
                </li>
                <li>
                  <code>src/utils/constants.js</code> 파일의 CAFE24_CONFIG
                </li>
                <li>카페24 개발자센터에서 앱 승인 여부</li>
              </ul>
            </ConfigInfo>
          )}

          {tokenUrl && (
            <ConfigInfo
              style={{
                backgroundColor: "#d4edda",
                border: "1px solid #c3e6cb",
              }}
            >
              <h3>🔗 생성된 인증 URL</h3>
              <p style={{ wordBreak: "break-all", fontSize: "0.9rem" }}>
                {tokenUrl}
              </p>
            </ConfigInfo>
          )}

          <button
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            style={{
              background: "#6c757d",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            디버그 정보 {showDebugInfo ? "숨기기" : "보기"}
          </button>
        </InfoSection>
      )}

      {/* 인증 코드 입력 섹션 */}
      <Section>
        <h2>🔐 인증 관리</h2>
        <AuthCodeInput
          initialCode={authCode}
          onTokenReceived={handleTokenReceived}
        />
      </Section>

      {/* 상품 가격 관리 섹션 */}
      {isAuthenticated && (
        <Section>
          <h2>💰 상품 가격 관리</h2>
          <ProductPriceManager isAuthenticated={isAuthenticated} />
        </Section>
      )}
    </AppContainer>
  );
}

export default App;
