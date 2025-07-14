// 인증 코드 입력 컴포넌트
import React, { useState, useEffect } from "react";
import styled from "styled-components";

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

const AuthCodeInput = ({ initialCode, onTokenReceived }) => {
  const [authCode, setAuthCode] = useState(initialCode || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenData, setTokenData] = useState(null);

  const handleGetToken = async () => {
    if (!authCode.trim()) {
      setError("인증코드를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const token = await getAccessToken(authCode.trim());
      setTokenData(token);

      // 토큰 정보를 로컬 스토리지에 저장
      localStorage.setItem("cafe24_access_token", token.access_token);
      localStorage.setItem("cafe24_refresh_token", token.refresh_token);
      localStorage.setItem(
        "cafe24_token_expires",
        Date.now() + token.expires_in * 1000
      );

      //부모 컴포넌트에 토큰 정보 전달
      onTokenReceived && onTokenReceived(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getAccessToken = async (code) => {
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
        redirect_uri: "https://gongbang301.com/callback",
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

  const handleClearData = () => {
    setAuthCode("");
    setTokenData(null);
    setError("");
    localStorage.removeItem("cafe24_access_token");
    localStorage.removeItem("cafe24_refresh_token");
    localStorage.removeItem("cafe24_token_expires");
  };

  // 초기 코드가 있으면 자동으로 토큰 발급 시도
  useEffect(() => {
    if (initialCode && initialCode.trim()) {
      handleGetToken();
    }
  }, [initialCode]);

  return (
    <AuthContainer>
      <h3>🔐 카페24 인증 코드 입력</h3>

      <InputGroup>
        <Label>Authorization Bearer Access</Label>
        <Input
          type="text"
          value={authCode}
          onChange={(e) => setAuthCode(e.target.value)}
          placeholder="https://gongbang301.com/?code=여기_부분_코드 입력"
          disabled={isLoading || tokenData}
        ></Input>
      </InputGroup>

      <div>
        <Button onClick={handleGetToken} disabled={isLoading || tokenData}>
          {isLoading ? "토큰 발급 중..." : "액세스 토큰 발급"}
        </Button>

        {tokenData && (
          <Button
            onClick={handleClearData}
            style={{ backgroundColor: "#dc3545" }}
          >
            초기화
          </Button>
        )}
      </div>
      {/* err */}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {tokenData && (
        <>
          <SuccessMessage>
            ✅ 액세스 토큰이 성공적으로 발급되었습니다!
          </SuccessMessage>
          <TokenInfo>
            <div>
              <strong>액세스 토큰:</strong>{" "}
              {tokenData.access_token.substring(0, 30)}...
            </div>
            <div>
              <strong>토큰 타입:</strong> {tokenData.token_type}
            </div>
            <div>
              <strong>유효 기간:</strong> {tokenData.expires_in}초
            </div>
            <div>
              <strong>권한:</strong> {tokenData.scope}
            </div>
            <div>
              <strong>발급 시간:</strong> {new Date().toLocaleString()}
            </div>
          </TokenInfo>
        </>
      )}
    </AuthContainer>
  );
};

export default AuthCodeInput;
