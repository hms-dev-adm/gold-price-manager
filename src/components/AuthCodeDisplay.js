import React, { useState } from "react";
import styled from "styled-components";

const AuthContainer = styled.div`
  padding: 0;
`;

const StatusCard = styled.div`
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  background: ${(props) => {
    if (props.type === "success") return "#d4edda";
    if (props.type === "error") return "#f8d7da";
    if (props.type === "info") return "#d1ecf1";
    return "#f8f9fa";
  }};
  border: 1px solid
    ${(props) => {
      if (props.type === "success") return "#c3e6cb";
      if (props.type === "error") return "#f5c6cb";
      if (props.type === "info") return "#bee5eb";
      return "#dee2e6";
    }};
  color: ${(props) => {
    if (props.type === "success") return "#155724";
    if (props.type === "error") return "#721c24";
    if (props.type === "info") return "#0c5460";
    return "#495057";
  }};
`;

const CodeInfo = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
  font-family: monospace;
  font-size: 14px;
  border-left: 4px solid #667eea;
`;

const TokenInfo = styled.div`
  background: #e8f5e8;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
  border-left: 4px solid #28a745;
`;

const ManualInput = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #dee2e6;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.25);
  }
`;

const Button = styled.button`
  background: ${(props) =>
    props.variant === "danger" ? "#dc3545" : "#667eea"};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) =>
      props.variant === "danger" ? "#c82333" : "#5a6fd8"};
    transform: translateY(-1px);
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
  }
`;

const AuthCodeDisplay = ({
  authCode,
  tokenData,
  error,
  isAuthenticated,
  onManualTokenRequest,
  onClearAuth,
}) => {
  const [manualCode, setManualCode] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const handleManualSubmit = () => {
    onManualTokenRequest(manualCode);
  };

  const formatUrl = (url) => {
    if (!url) return "";
    return url.length > 80 ? url.substring(0, 80) + "..." : url;
  };

  const extractCodeFromUrl = (url) => {
    const match = url.match(/[?&]code=([^&]+)/);
    return match ? match[1] : "";
  };

  if (error) {
    return (
      <AuthContainer>
        <StatusCard type="error">
          <h3>❌ 인증 실패</h3>
          <p>
            <strong>오류:</strong> {error}
          </p>

          {authCode && (
            <CodeInfo>
              <strong>시도한 인증 코드:</strong>
              <br />
              {authCode}
            </CodeInfo>
          )}

          <div style={{ marginTop: "15px" }}>
            <Button onClick={() => setShowManualInput(!showManualInput)}>
              수동으로 다시 시도
            </Button>
            <Button
              variant="danger"
              onClick={onClearAuth}
              style={{ marginLeft: "10px" }}
            >
              초기화
            </Button>
          </div>
        </StatusCard>

        {showManualInput && (
          <ManualInput>
            <h4>수동 인증 코드 입력</h4>
            <InputGroup>
              <Input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="인증 코드를 입력하세요..."
              />
              <Button onClick={handleManualSubmit}>토큰 발급</Button>
            </InputGroup>
          </ManualInput>
        )}
      </AuthContainer>
    );
  }

  if (isAuthenticated && tokenData) {
    return (
      <AuthContainer>
        <StatusCard type="success">
          <h3>✅ 인증 성공!</h3>
          <p>카페24 API 사용 준비가 완료되었습니다.</p>

          {authCode && (
            <CodeInfo>
              <strong>사용된 인증 코드:</strong>
              <br />
              {authCode}
            </CodeInfo>
          )}

          <TokenInfo>
            <h4>🔑 토큰 정보</h4>
            <p>
              <strong>액세스 토큰:</strong>{" "}
              {tokenData.access_token?.substring(0, 30)}...
            </p>
            <p>
              <strong>토큰 타입:</strong> {tokenData.token_type || "Bearer"}
            </p>
            <p>
              <strong>유효 기간:</strong> {tokenData.expires_in || "N/A"}초
            </p>
            <p>
              <strong>권한:</strong> {tokenData.scope || "N/A"}
            </p>
            <p>
              <strong>만료 시간:</strong>{" "}
              {tokenData.expires_at?.toLocaleString()}
            </p>
          </TokenInfo>

          <Button variant="danger" onClick={onClearAuth}>
            로그아웃
          </Button>
        </StatusCard>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer>
      <StatusCard type="info">
        <h3>🔗 카페24 인증 필요</h3>
        <p>다음 단계를 따라 인증해주세요:</p>

        <ol style={{ marginLeft: "20px", marginTop: "15px" }}>
          <li>카페24 개발자센터에서 OAuth 인증 진행</li>
          <li>
            인증 완료 후 <code>https://gongbang301.com/?code=...</code> 형태의
            URL 확인
          </li>
          <li>해당 URL로 이동하면 자동으로 인증 코드가 감지됩니다</li>
        </ol>

        <div style={{ marginTop: "20px" }}>
          <Button onClick={() => setShowManualInput(!showManualInput)}>
            수동 인증 코드 입력
          </Button>
        </div>
      </StatusCard>

      {showManualInput && (
        <ManualInput>
          <h4>수동 인증 코드 입력</h4>
          <p>
            URL에서 인증 코드가 자동으로 감지되지 않은 경우 직접 입력하세요.
          </p>

          <InputGroup>
            <Input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="예: UQUxjcC7KRzgFPyJsrJNIC"
            />
            <Button onClick={handleManualSubmit}>토큰 발급</Button>
          </InputGroup>

          <small style={{ color: "#666", marginTop: "10px", display: "block" }}>
            💡 팁: 전체 URL을 붙여넣으면 자동으로 코드 부분만 추출됩니다.
          </small>
        </ManualInput>
      )}
    </AuthContainer>
  );
};

export default AuthCodeDisplay;
