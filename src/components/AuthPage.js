// src/components/AuthPage.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const Header = styled.header`
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 10px;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 300;
`;

const Section = styled.section`
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  margin-bottom: 15px;
  box-sizing: border-box;
`;

const Button = styled.button`
  background: ${(props) =>
    props.variant === "danger" ? "#dc3545" : "#b6ca30"};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-right: 10px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ToggleButton = styled.button`
  background: #b6ca30;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 15px;
`;

const ResultBox = styled.div`
  background: ${(props) => (props.success ? "#d4edda" : "#f8d7da")};
  border: 1px solid ${(props) => (props.success ? "#c3e6cb" : "#f5c6cb")};
  color: ${(props) => (props.success ? "#155724" : "#721c24")};
  padding: 15px;
  border-radius: 4px;
  margin-top: 15px;
`;

const TokenInfo = styled.div`
  background: #e8f5e8;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #28a745;
  margin-top: 20px;
`;

const DebugSection = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
  font-family: monospace;
  font-size: 14px;
`;

const StorageItem = styled.div`
  background: #fff;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 10px;
`;

const NavigationSection = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
`;

const AuthPage = () => {
  const navigate = useNavigate();

  const [authCode, setAuthCode] = useState("");
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDebugMode, setShowDebugMode] = useState(false);
  const [storageData, setStorageData] = useState({});

  useEffect(() => {
    // URL에서 인증 코드 자동 추출
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      setAuthCode(code);
      console.log("URL에서 인증 코드 감지:", code);
    }

    // 저장된 토큰 확인
    checkSavedToken();
    // 로컬 스토리지 데이터 확인
    loadStorageData();
  }, []);

  const loadStorageData = () => {
    const storage = {
      cafe24_access_token: localStorage.getItem("cafe24_access_token"),
      cafe24_refresh_token: localStorage.getItem("cafe24_refresh_token"),
      cafe24_token_expires: localStorage.getItem("cafe24_token_expires"),
      cafe24_token_scope: localStorage.getItem("cafe24_token_scope"),
      cafe24_token_issued_at: localStorage.getItem("cafe24_token_issued_at"),
    };
    setStorageData(storage);
  };

  const checkSavedToken = () => {
    const savedToken = localStorage.getItem("cafe24_access_token");
    const tokenExpires = localStorage.getItem("cafe24_token_expires");
    const tokenScope = localStorage.getItem("cafe24_token_scope");
    const tokenIssuedAt = localStorage.getItem("cafe24_token_issued_at");

    if (savedToken && tokenExpires) {
      const isExpired = Date.now() >= parseInt(tokenExpires);

      if (!isExpired) {
        setIsAuthenticated(true);
        setTokenData({
          access_token: savedToken,
          expires_at: new Date(parseInt(tokenExpires)),
          scope: tokenScope,
          issued_at: tokenIssuedAt ? new Date(parseInt(tokenIssuedAt)) : null,
        });
        setShowDebugMode(true);
      } else {
        setIsAuthenticated(false);
        setTokenData(null);
      }
    }
  };

  const handleGetToken = async () => {
    if (!authCode.trim()) {
      setError("인증 코드를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = await getAccessToken(authCode.trim());
      saveTokenData(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 수정된 getAccessToken 함수 - 더 강력한 에러 처리
  const getAccessToken = async (code) => {
    try {
      console.log("토큰 발급 시도:", code.substring(0, 10) + "...");

      // 1단계: Express 서버 연결 확인
      const healthCheck = await fetch("/api/health", { method: "GET" });
      if (!healthCheck.ok) {
        throw new Error(
          "Express 서버에 연결할 수 없습니다. 'node server.js'로 서버를 시작하세요."
        );
      }

      // 2단계: 토큰 요청
      const response = await fetch("/api/cafe24-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code: code,
          redirect_uri:
            process.env.REACT_APP_CAFE24_REDIRECT_URI ||
            "https://gongbang301.com",
        }),
      });

      console.log("응답 상태:", response.status);
      console.log("응답 헤더:", response.headers.get("content-type"));

      // 3단계: 응답 타입 확인
      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        console.error("JSON이 아닌 응답:", textResponse.substring(0, 500));

        // HTML 에러 페이지인 경우
        if (
          textResponse.includes("<html") ||
          textResponse.includes("<!DOCTYPE")
        ) {
          throw new Error(
            `서버에서 HTML 에러 페이지를 반환했습니다 (상태: ${response.status}). Express 서버가 올바르게 실행되고 있는지 확인하세요.`
          );
        }

        throw new Error(`예상하지 못한 응답 형식: ${contentType}`);
      }

      // 4단계: JSON 파싱
      const data = await response.json();
      console.log("파싱된 응답:", data);

      // 5단계: 응답 상태 확인
      if (!response.ok) {
        const errorMessage =
          data.error || data.message || `HTTP ${response.status}`;
        throw new Error(`토큰 발급 실패: ${errorMessage}`);
      }

      // 6단계: 필수 필드 확인
      if (!data.access_token) {
        throw new Error("응답에 access_token이 없습니다.");
      }

      return data;
    } catch (error) {
      console.error("토큰 발급 오류:", error);

      // 네트워크 오류인 경우 더 친절한 메시지
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Express 서버에 연결할 수 없습니다. 터미널에서 'node server.js'를 실행하여 서버를 시작하세요."
        );
      }

      throw error;
    }
  };

  const saveTokenData = (token) => {
    const expiresAt = Date.now() + token.expires_in * 1000;
    const issuedAt = Date.now();

    // 토큰 정보 저장
    localStorage.setItem("cafe24_access_token", token.access_token);
    localStorage.setItem("cafe24_token_expires", expiresAt.toString());
    localStorage.setItem("cafe24_token_scope", token.scope || "N/A");
    localStorage.setItem("cafe24_token_issued_at", issuedAt.toString());

    if (token.refresh_token) {
      localStorage.setItem("cafe24_refresh_token", token.refresh_token);
    }

    setTokenData({
      ...token,
      expires_at: new Date(expiresAt),
      issued_at: new Date(issuedAt),
    });

    setIsAuthenticated(true);
    setShowDebugMode(true);
    loadStorageData();
    console.log("토큰 저장 완료");
  };

  // ✅ 수정된 토큰 갱신 함수
  const handleRefreshToken = async () => {
    const refreshToken = localStorage.getItem("cafe24_refresh_token");
    if (!refreshToken) {
      setError("refresh_token이 없습니다. 다시 로그인해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/cafe24-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      // 응답 타입 확인
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        throw new Error(
          `서버에서 JSON이 아닌 응답을 반환했습니다: ${textResponse.substring(
            0,
            100
          )}`
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`토큰 갱신 실패: ${data.error || response.status}`);
      }

      saveTokenData(data);
      alert("토큰이 성공적으로 갱신되었습니다.");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cafe24_access_token");
    localStorage.removeItem("cafe24_refresh_token");
    localStorage.removeItem("cafe24_token_expires");
    localStorage.removeItem("cafe24_token_scope");
    localStorage.removeItem("cafe24_token_issued_at");

    setTokenData(null);
    setIsAuthenticated(false);
    setAuthCode("");
    setError("");
    setShowDebugMode(false);
    loadStorageData();

    alert("로그아웃되었습니다.");
    navigate("/");
  };

  const handleGoToProducts = () => {
    navigate("/products");
  };

  const getTokenTimeRemaining = () => {
    if (!tokenData?.expires_at) return null;
    const now = Date.now();
    const remaining = tokenData.expires_at.getTime() - now;

    if (remaining <= 0) return "만료됨";

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    return `${hours}시간 ${minutes}분 ${seconds}초`;
  };

  // ✅ 추가: 서버 상태 확인 함수
  const checkServerStatus = async () => {
    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        alert("✅ Express 서버가 정상적으로 실행 중입니다.");
      } else {
        alert("❌ Express 서버에 문제가 있습니다.");
      }
    } catch (error) {
      alert(
        "❌ Express 서버에 연결할 수 없습니다. 'node server.js'를 실행하세요."
      );
    }
  };

  return (
    <Container>
      <Header>
        <Title>카페24 API Auth (수정된 버전)</Title>
        <p>Authorization Debugging v2.0</p>

        {/* 서버 상태 확인 버튼 추가 */}
        <button
          onClick={checkServerStatus}
          style={{
            padding: "8px 16px",
            background: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            marginTop: "10px",
          }}
        >
          🔍 서버 상태 확인
        </button>
      </Header>

      {!isAuthenticated ? (
        <Section>
          <h2>🔐 인증 코드 입력</h2>
          <Input
            type="text"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            placeholder="인증 코드를 입력하세요 (예: UQUxjcC7KRzgFPyJsrJNIC)"
            disabled={loading}
          />

          <Button
            onClick={handleGetToken}
            disabled={loading || !authCode.trim()}
          >
            {loading ? "토큰 발급 중..." : "액세스 토큰 발급"}
          </Button>

          {error && (
            <ResultBox success={false}>
              <h4>❌ 오류 발생</h4>
              <p>{error}</p>

              {/* 문제 해결 힌트 */}
              <details style={{ marginTop: "10px" }}>
                <summary style={{ cursor: "pointer", color: "#007bff" }}>
                  🔧 문제 해결 방법 보기
                </summary>
                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px",
                    background: "#f8f9fa",
                    borderRadius: "4px",
                  }}
                >
                  <h5>일반적인 해결책:</h5>
                  <ul style={{ margin: "10px 0", paddingLeft: "20px" }}>
                    <li>
                      Express 서버 실행: <code>node server.js</code>
                    </li>
                    <li>
                      환경변수 확인: <code>.env</code> 파일의 CLIENT_ID,
                      CLIENT_SECRET
                    </li>
                    <li>인증 코드 유효성: 1분 이내에 사용해야 함</li>
                    <li>Redirect URI: 카페24 앱 설정과 일치해야 함</li>
                  </ul>
                </div>
              </details>
            </ResultBox>
          )}
        </Section>
      ) : (
        <Section>
          <h2>✅ 인증 완료!</h2>

          <TokenInfo>
            <h3>🔑 토큰 정보</h3>
            <p>
              <strong>액세스 토큰:</strong>{" "}
              {tokenData.access_token?.substring(0, 30)}...
            </p>
            <p>
              <strong>발급 시간:</strong>{" "}
              {tokenData.issued_at?.toLocaleString()}
            </p>
            <p>
              <strong>만료 시간:</strong>{" "}
              {tokenData.expires_at?.toLocaleString()}
            </p>
            <p>
              <strong>남은 시간:</strong>{" "}
              <span
                style={{
                  color:
                    getTokenTimeRemaining() === "만료됨"
                      ? "#dc3545"
                      : "#28a745",
                  fontWeight: "bold",
                }}
              >
                {getTokenTimeRemaining()}
              </span>
            </p>
            <p>
              <strong>권한:</strong>
              <span
                style={{
                  color: tokenData.scope === "N/A" ? "#dc3545" : "#28a745",
                }}
              >
                {tokenData.scope}
              </span>
              {tokenData.scope === "N/A" && (
                <small
                  style={{
                    display: "block",
                    color: "#dc3545",
                    marginTop: "5px",
                  }}
                >
                  ⚠️ 권한이 없습니다. 카페24 앱 설정에서 필요한 권한을
                  활성화하세요.
                </small>
              )}
            </p>
          </TokenInfo>

          <NavigationSection>
            <Button variant="success" onClick={handleGoToProducts}>
              Go To Product Manager
            </Button>
          </NavigationSection>

          <ToggleButton onClick={() => setShowDebugMode(!showDebugMode)}>
            {showDebugMode ? "🔍 디버그 모드 숨기기" : "🔍 디버그 모드 보기"}
          </ToggleButton>

          {showDebugMode && (
            <DebugSection>
              <h4>🛠️ 디버그 정보</h4>

              <div style={{ marginBottom: "20px" }}>
                <h5>📦 로컬 스토리지 데이터:</h5>
                {Object.entries(storageData).map(([key, value]) => (
                  <StorageItem key={key}>
                    <strong>{key}:</strong>
                    <br />
                    <span style={{ wordBreak: "break-all" }}>
                      {value || "null"}
                    </span>
                    {key === "cafe24_token_expires" && value && (
                      <div
                        style={{
                          marginTop: "5px",
                          color: "#666",
                          fontSize: "12px",
                        }}
                      >
                        → {new Date(parseInt(value)).toLocaleString()}
                      </div>
                    )}
                    {key === "cafe24_token_issued_at" && value && (
                      <div
                        style={{
                          marginTop: "5px",
                          color: "#666",
                          fontSize: "12px",
                        }}
                      >
                        → {new Date(parseInt(value)).toLocaleString()}
                      </div>
                    )}
                  </StorageItem>
                ))}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h5>⏰ 토큰 상태:</h5>
                <p>
                  <strong>현재 시간:</strong> {new Date().toLocaleString()}
                </p>
                <p>
                  <strong>토큰 유효성:</strong>{" "}
                  {Date.now() <
                  parseInt(storageData.cafe24_token_expires || "0")
                    ? "✅ 유효"
                    : "❌ 만료"}
                </p>
                <p>
                  <strong>남은 시간:</strong> {getTokenTimeRemaining()}
                </p>
              </div>
            </DebugSection>
          )}

          <div style={{ marginTop: "20px" }}>
            <Button onClick={handleRefreshToken} disabled={loading}>
              {loading ? "갱신 중..." : "🔄 토큰 갱신"}
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              🚪 로그아웃
            </Button>
          </div>

          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              background: "#d1ecf1",
              borderRadius: "4px",
              border: "1px solid #bee5eb",
              color: "#0c5460",
            }}
          >
            <h4>📋 사용 안내</h4>
            <p>• 이 창을 닫아도 토큰이 유지됩니다.</p>
            <p>• 메인 페이지를 새로고침하면 토큰이 자동으로 인식됩니다.</p>
            <p>• 토큰 만료 시 "토큰 갱신" 버튼을 클릭하세요.</p>
            <p>• 권한 문제 시 카페24 개발자 센터에서 앱 설정을 확인하세요.</p>
          </div>
        </Section>
      )}
    </Container>
  );
};

export default AuthPage;
