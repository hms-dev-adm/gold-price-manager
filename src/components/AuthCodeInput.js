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
  background: ${(props) => (props.success ? "#d4edda" : "#f8d7da")};
  border: 1px solid ${(props) => (props.success ? "#c3e6cb" : "#f5c6cb")};
  color: ${(props) => (props.success ? "#155724" : "#721c24")};
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
`;

const AuthCodeInput = ({ initialCode, onTokenReceived }) => {
  const [authCode, setAuthCode] = useState(initialCode || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenData, setTokenData] = useState(null);
  //proxy
  const [debugInfo, setDebugInfo] = useState("");
  const [showDebug, setShowDebug] = useState(true);

  useEffect(() => {
    if (initialCode && initialCode.trim()) {
      setAuthCode(initialCode);
      // 자동으로 토큰 발급 시도하지 않고 사용자가 버튼 클릭하도록 함

      addDebugInfo(`초기 인증 코드 감지: ${initialCode.substring(0, 20)}...`);
    }
    // 저장된 토큰 확인
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
      // setTokenData(token);

      // 토큰 정보를 로컬 스토리지에 저장
      const expiresAt = Date.now() + token.expires_in * 1000;
      localStorage.setItem("cafe24_access_token", token.access_token);
      if (token.refresh_token) {
        localStorage.setItem("cafe24_refresh_token", token.refresh_token);
      }
      localStorage.setItem("cafe24_token_expires", expiresAt.toString());
      setTokenData({
        ...token,
        expires_at: new Date(expiresAt),
      });

      addDebugInfo("토큰 저장 완료");
      onTokenReceived && onTokenReceived(token);
    } catch (err) {
      setError(err.message);
      addDebugInfo(`에러: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getAccessTokenWithDebug = async (code) => {
    const clientId = process.env.REACT_APP_CAFE24_CLIENT_ID;
    const clientSecret = process.env.REACT_APP_CAFE24_CLIENT_SECRET;
    const mallId = process.env.REACT_APP_CAFE24_MALL_ID;
    const redirectUri = process.env.REACT_APP_CAFE24_REDIRECT_URI;

    if (!clientId || !clientSecret) {
      throw new Error("클라이언트 ID 또는 시크릿이 설정되지 않았습니다.");
    }

    // 1. Base64 인코딩
    const authString = `${clientId}:${clientSecret}`;
    const base64Credentials = btoa(authString);
    addDebugInfo(
      `Base64 인코딩: ${authString} -> ${base64Credentials.substring(0, 30)}...`
    );

    // 2. 요청 URL 구성
    const tokenUrl = `/api/cafe24/api/v2/oauth/token`;
    addDebugInfo(`요청 URL: ${tokenUrl}`);

    // 3. 필수 파라미터 구성 (카페24 문서에 따라)
    const formData = new URLSearchParams();
    formData.append("grant_type", "authorization_code");
    formData.append("code", code);
    formData.append("redirect_uri", redirectUri);

    addDebugInfo(`요청 파라미터:`);
    addDebugInfo(`- grant_type: authorization_code`);
    addDebugInfo(`- code: ${code.substring(0, 20)}...`);
    addDebugInfo(`- redirect_uri: ${redirectUri}`);

    // 4. 헤더 구성
    const headers = {
      Authorization: `Basic ${base64Credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    };
    addDebugInfo(`요청 헤더:`);
    addDebugInfo(
      `- Authorization: Basic ${base64Credentials.substring(0, 30)}...`
    );
    addDebugInfo(`- Content-Type: application/x-www-form-urlencoded`);
    try {
      addDebugInfo("토큰 요청 전송 중...");

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: headers,
        body: formData.toString(),
      });

      addDebugInfo(`응답 수신: ${response.status} ${response.statusText}`);

      const responseText = await response.text();
      addDebugInfo(`응답 내용: ${responseText}`);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        addDebugInfo(`JSON 파싱 실패: ${parseError.message}`);
        throw new Error(`응답 파싱 실패: ${responseText}`);
      }

      if (!response.ok) {
        addDebugInfo(`API 에러: ${JSON.stringify(data, null, 2)}`);
        throw new Error(
          `토큰 발급 실패 (${response.status}): ${
            data.error_description || data.error || "알 수 없는 오류"
          }`
        );
      }

      addDebugInfo(`토큰 발급 성공!`);
      addDebugInfo(`- 액세스 토큰: ${data.access_token.substring(0, 30)}...`);
      addDebugInfo(`- 만료 시간: ${data.expires_in}초`);
      addDebugInfo(`- 권한: ${data.scope || "N/A"}`);

      return data;
    } catch (fetchError) {
      addDebugInfo(`네트워크 에러: ${fetchError.message}`);
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

      const tokenUrl = "/api/cafe24/api/v2/oauth/token";

      const formData = new URLSearchParams();
      formData.append("grant_type", "refresh_token");
      formData.append("refresh_token", refreshToken);

      setDebugInfo((prev) => prev + `갱신 요청: ${formData.toString()}\n`);
      addDebugInfo(`refresh_token: ${refreshToken.substring(0, 20)}...`);

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${base64Credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const responseText = await response.text();
      addDebugInfo(`갱신 응답: ${response.status} - ${responseText}`);

      const data = JSON.parse(responseText);

      if (!response.ok) {
        throw new Error(
          `토큰 갱신 실패: ${
            data.error_description || data.error || response.status
          }`
        );
      }

      // 새 토큰 저장
      const expiresAt = Date.now() + data.expires_in * 1000;
      localStorage.setItem("cafe24_access_token", data.access_token);
      localStorage.setItem("cafe24_token_expires", expiresAt.toString());

      setTokenData({
        ...data,
        expires_at: new Date(expiresAt),
      });

      setDebugInfo((prev) => prev + "토큰 갱신 성공!\n");
    } catch (error) {
      setError(error.message);
      setDebugInfo((prev) => prev + `갱신 에러: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearTokenData = () => {
    localStorage.removeItem("cafe24_access_token");
    localStorage.removeItem("cafe24_refresh_token");
    localStorage.removeItem("cafe24_token_expires");
    setTokenData(null);
    setAuthCode("");
    setError("");
    setDebugInfo("");
  };

  return (
    <AuthContainer>
      <h3>🔐 카페24 인증 코드 입력 v2.1 정책준수테스트</h3>

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
          <ResultBox success={true}>
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
              <strong>권한:</strong> {tokenData.scope}
            </p>
          </ResultBox>

          <div style={{ marginTop: "15px" }}>
            <Button onClick={handleRefreshToken} disabled={isLoading}>
              {isLoading ? "갱신 중..." : "refresh_token으로 갱신"}
            </Button>
            <Button variant="danger" onClick={clearTokenData}>
              초기화
            </Button>
          </div>
        </div>
      )}

      {error && (
        <ResultBox success={false}>
          <h4>❌ 오류 발생</h4>
          <p>{error}</p>
        </ResultBox>
      )}

      {/* 디버그 정보 */}
      <div style={{ marginTop: "20px" }}>
        <Button
          onClick={() => setShowDebug(!showDebug)}
          style={{
            background: "#6c757d",
            fontSize: "14px",
            padding: "8px 16px",
          }}
        >
          디버그 정보 {showDebug ? "숨기기" : "보기"}
        </Button>

        {showDebug && debugInfo && (
          <DebugBox>
            <h5>🔍 요청/응답 디버그 정보</h5>
            <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{debugInfo}</pre>
          </DebugBox>
        )}
      </div>
    </AuthContainer>
  );
};

export default AuthCodeInput;
