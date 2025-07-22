// 인증 코드 입력 컴포넌트
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { CAFE24_CONFIG } from "../utils/constants";

const AuthContainer = styled.div`
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-right: 10px;

  &:hover {
    background: #0056b3;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
`;

const TokenInfo = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 15px;
  border-radius: 4px;
  margin-top: 15px;
  font-family: monospace;
  font-size: 14px;
`;

//proxy
const ResultBox = styled.div`
  background: ${(props) => (props.$success ? "#d4edda" : "#f8d7da")};
  border: 1px solid ${(props) => (props.$success ? "#c3e6cb" : "#f5c6cb")};
  color: ${(props) => (props.$success ? "#155724" : "#721c24")};
  padding: 15px;
  border-radius: 4px;
  margin-top: 15px;
`;

const DebugBox = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 15px;
  border-radius: 4px;
  margin-top: 15px;
  font-family: monospace;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
`;

const AuthCodeInput = ({ initialCode, onTokenReceived }) => {
  const [authCode, setAuthCode] = useState(initialCode || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenData, setTokenData] = useState(null);
  //proxy
  const [debugInfo, setDebugInfo] = useState("");
  const [showDebug, setShowDebug] = useState(true);

  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (initialCode && initialCode.trim()) {
      setAuthCode(initialCode);
      addDebugInfo(`초기 인증 코드 감지: ${initialCode.substring(0, 20)}...`);
    }
    checkSavedToken();
  }, [initialCode]);

  const addDebugInfo = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo((prev) => prev + `[${timestamp}] ${message}\n`);
  };

  const checkSavedToken = () => {
    const savedToken = localStorage.getItem("cafe24_access_token");
    const tokenExpires = localStorage.getItem("cafe24_token_expires");

    if (savedToken && tokenExpires && Date.now() < parseInt(tokenExpires)) {
      setTokenData({
        access_token: savedToken,
        expires_at: new Date(parseInt(tokenExpires)),
        scope: localStorage.getItem("cafe24_token_scope") || "N/A",
      });
      addDebugInfo("저장된 유효한 토큰 발견");
    }
  };

  const handleGetToken = async () => {
    if (!authCode.trim()) {
      setError("인증코드를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");
    setDebugInfo("토큰 요청 시작...\n");

    try {
      const token = await getAccessTokenWithDebug(authCode.trim());

      const expiresAt = Date.now() + token.expires_in * 1000;

      localStorage.setItem("cafe24_access_token", token.access_token);
      localStorage.setItem("cafe24_token_expires", expiresAt.toString());

      if (token.refresh_token) {
        localStorage.setItem("cafe24_refresh_token", token.refresh_token);
      }

      setTokenData({
        ...token,
        expires_at: new Date(expiresAt),
      });

      addDebugInfo(" ✅ 토큰 저장 완료");

      if (onTokenReceived) {
        onTokenReceived(token);
      }
    } catch (err) {
      setError(err.message);
      addDebugInfo(`❌: ${err.message}`);
      setTokenData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getAccessTokenWithDebug = async (code) => {
    const clientId = process.env.REACT_APP_CAFE24_CLIENT_ID;
    const clientSecret = process.env.REACT_APP_CAFE24_CLIENT_SECRET;
    const redirectUri = process.env.REACT_APP_CAFE24_REDIRECT_URI;

    //환경변수 확인
    if (!clientId || !clientSecret) {
      throw new Error(
        "환경변수가 설정되지 않았습니다. CLIENT_ID 또는 CLIENT_SECRET을 확인하세요."
      );
    }
    if (!redirectUri) {
      throw new Error("REDIRECT_URI가 설정되지 않았습니다.");
    }

    // Base64 인코딩 !
    const authString = `${clientId}:${clientSecret}`;
    const base64Credentials = btoa(authString);
    addDebugInfo(
      `Base64 인코딩: ${authString} -> ${base64Credentials.substring(0, 30)}...`
    );

    // 요청 URL
    const tokenUrl = `/api/cafe24-token`;
    addDebugInfo(`요청 URL: ${tokenUrl}`);

    // ✅ 올바른 form-urlencoded 데이터 구성
    const formData = new URLSearchParams();
    formData.append("grant_type", "authorization_code");
    formData.append("code", code);
    formData.append("redirect_uri", redirectUri);

    addDebugInfo(`📤 요청 데이터: ${formData.toString()}`);
    addDebugInfo(`📤 Content-Type: application/x-www-form-urlencoded`);

    try {
      addDebugInfo("토큰 요청 전송 중...");

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${base64Credentials}`,
          "Content-Type": "application/x-www-form-urlencoded", // ✅ 일관된 헤더
        },
        body: formData.toString(),
      });

      addDebugInfo(`응답 수신: ${response.status} ${response.statusText}`);

      const responseText = await response.text();
      addDebugInfo(`응답 내용: ${responseText}`);

      //Json 파싱 시도
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        addDebugInfo(`JSON ❌: ${parseError.message}`);
        throw new Error(`응답 파싱 실패: ${responseText}`);
      }

      //에러 응답처리
      if (!response.ok) {
        addDebugInfo(
          `❌ API 에러 (${response.status}): ${JSON.stringify(data, null, 2)}`
        );

        const errorMessage =
          data.error_description ||
          data.error ||
          data.message ||
          `HTTP ${response.status} 에러`;

        throw new Error(`토큰 발급 실패: ${errorMessage}`);
      }
      // ✅ 성공 응답 처리
      if (response.ok) {
        const data = JSON.parse(responseText);

        // ✅ scope 정보 확인 및 저장
        console.log("토큰 발급 응답:", data);
        console.log("받은 권한(scope):", data.scope);

        // scope가 응답에 포함되어 있다면 저장
        if (data.scope) {
          localStorage.setItem("cafe24_token_scope", data.scope);
        } else {
          console.warn("⚠️ 응답에 scope 정보가 없습니다");
          localStorage.setItem("cafe24_token_scope", "unknown");
        }

        addDebugInfo(`✅ 토큰 발급 성공!`);
        addDebugInfo(`- 액세스 토큰: ${data.access_token.substring(0, 30)}...`);
        addDebugInfo(`- 만료 시간: ${data.expires_in}초`);
        addDebugInfo(`- 권한(scope): ${data.scope || "N/A"}`);
      }
      if (data.refresh_token) {
        addDebugInfo(
          `- 리프레시 토큰: ${data.refresh_token.substring(0, 30)}...`
        );
      }

      return data;
    } catch (fetchError) {
      addDebugInfo(`네트워크 에러: ${fetchError.message}`);
      // ✅ 구체적인 에러 메시지 제공
      if (fetchError.message.includes("Failed to fetch")) {
        throw new Error(
          "서버에 연결할 수 없습니다. Express 서버(localhost:3001)가 실행 중인지 확인하세요."
        );
      }

      throw fetchError;
    }
  };
  const handleRefreshToken = async () => {
    const refreshToken = localStorage.getItem("cafe24_refresh_token");
    if (!refreshToken) {
      setError("refresh_token이 없습니다. 다시 로그인해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");
    setDebugInfo("토큰 갱신 시작...\n");

    try {
      const clientId = process.env.REACT_APP_CAFE24_CLIENT_ID;
      const clientSecret = process.env.REACT_APP_CAFE24_CLIENT_SECRET;
      const base64Credentials = btoa(`${clientId}:${clientSecret}`);

      const tokenUrl = "/api/cafe24-token";

      const formData = new URLSearchParams();
      formData.append("grant_type", "refresh_token");
      formData.append("refresh_token", refreshToken);

      addDebugInfo(`refresh_token: ${refreshToken.substring(0, 20)}...`);

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${base64Credentials}`,
          "Content-Type": "application/x-www-form-urlencoded", // ✅ 수정됨
        },
        body: formData.toString(),
      });

      const responseText = await response.text();
      addDebugInfo(`갱신 응답: ${response.status} - ${responseText}`);

      const data = JSON.parse(responseText);

      if (!response.ok) {
        const errorMessage =
          data.error_description || data.error || `HTTP ${response.status}`;
        throw new Error(`토큰 갱신 실패: ${errorMessage}`);
      }

      // 새 토큰 저장
      const expiresAt = Date.now() + data.expires_in * 1000;
      localStorage.setItem("cafe24_access_token", data.access_token);
      localStorage.setItem("cafe24_token_expires", expiresAt.toString());

      if (data.refresh_token) {
        localStorage.setItem("cafe24_refresh_token", data.refresh_token);
      }

      addDebugInfo("✅ 토큰 갱신 성공!");
    } catch (error) {
      setError(error.message);
      addDebugInfo(`❌ 갱신 에러: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearTokenData = () => {
    localStorage.removeItem("cafe24_access_token");
    localStorage.removeItem("cafe24_refresh_token");
    localStorage.removeItem("cafe24_token_expires");
    localStorage.removeItem("cafe24_token_scope");

    setTokenData(null);
    setAuthCode("");
    setError("");
    setDebugInfo("🗑️ 토큰 데이터 초기화 완료\n");
  };

  // ✅ 토큰 만료 시간 계산
  const getTimeRemaining = () => {
    if (!tokenData?.expires_at) return null;

    const now = Date.now();
    const expiresAt = tokenData.expires_at.getTime();
    const remaining = expiresAt - now;

    if (remaining <= 0) return "만료됨";

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}시간 ${minutes}분 남음`;
  };

  return (
    <AuthContainer>
      <h3>🔐 카페24 인증 코드 입력 v2.4</h3>

      {!tokenData ? (
        <div>
          <Input
            type="text"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            placeholder="인증 코드를 입력하세요 (예: UQUxjcC7KRzgFPyJsrJNIC)"
            disabled={isLoading}
          />

          <Button
            onClick={handleGetToken}
            disabled={isLoading || !authCode.trim()}
          >
            {isLoading ? "토큰 발급 중..." : "액세스 토큰 발급"}
          </Button>
        </div>
      ) : (
        <div>
          <ResultBox $success={true}>
            <h4>✅ 토큰 발급 성공!</h4>
            <p>
              <strong>액세스 토큰:</strong>{" "}
              {tokenData.access_token?.substring(0, 30)}...
            </p>
            <p>
              <strong>만료시간:</strong>{" "}
              {tokenData.expires_at?.toLocaleString()}
            </p>
            <p>
              <strong>남은 시간:</strong> {getTimeRemaining()}
            </p>
            <p>
              <strong>권한:</strong> {tokenData.scope}
            </p>
          </ResultBox>

          <div style={{ marginTop: "15px" }}>
            <Button onClick={handleRefreshToken} disabled={isLoading}>
              {isLoading ? "갱신 중..." : "🔄 토큰 갱신"}
            </Button>
            <Button variant="danger" onClick={clearTokenData}>
              🗑️ 토큰 초기화
            </Button>
          </div>
        </div>
      )}

      {error && (
        <ResultBox $success={false}>
          <h4>❌ 오류 발생</h4>
          <p>{error}</p>
          <details style={{ marginTop: "10px" }}>
            <summary>문제 해결 방법</summary>
            <ul style={{ margin: "10px 0", paddingLeft: "20px" }}>
              <li>Express 서버가 실행 중인지 확인 (node server.js)</li>
              <li>환경변수가 올바르게 설정되었는지 확인</li>
              <li>인증 코드가 1분 내에 사용되었는지 확인</li>
              <li>redirect_uri가 카페24 앱 설정과 일치하는지 확인</li>
            </ul>
          </details>
        </ResultBox>
      )}

      {/* 디버그 정보 */}
      <div style={{ marginTop: "20px" }}>
        <Button
          variant="secondary"
          onClick={() => setShowDebug(!showDebug)}
          style={{ fontSize: "14px", padding: "8px 16px" }}
        >
          디버그 정보 {showDebug ? "숨기기" : "보기"}
        </Button>

        {showDebug && debugInfo && (
          <DebugBox>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <h5 style={{ margin: 0 }}>🔍 요청/응답 디버그 정보</h5>
              <button
                onClick={() => setDebugInfo("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                🗑️ 로그 지우기
              </button>
            </div>
            <pre
              style={{ whiteSpace: "pre-wrap", margin: 0, fontSize: "11px" }}
            >
              {debugInfo}
            </pre>
          </DebugBox>
        )}
      </div>
    </AuthContainer>
  );
};

export default AuthCodeInput;
