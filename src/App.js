import React from "react";
import styled from "styled-components";
import { useAuthCode } from "./hooks/useAuthCode.js";
import AuthCodeDisplay from "./components/AuthCodeDisplay.js";
import ProductPriceManager from "./components/ProductPriceManager";

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2.5rem;
  font-weight: 300;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 15px;
`;

const StatusBadge = styled.div`
  display: inline-block;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
`;

const Section = styled.section`
  margin-bottom: 40px;
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
  font-size: 1.8rem;
`;

const LoadingScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: #666;
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

function App() {
  const {
    authCode,
    tokenData,
    loading,
    error,
    isAuthenticated,
    manualTokenRequest,
    clearAuth,
  } = useAuthCode();

  return (
    <AppContainer>
      <Header>
        <Title>카페24 상품 가격 관리 시스템</Title>
        <Subtitle>금 시세 기반 자동 가격 업데이트</Subtitle>

        {loading ? (
          <StatusBadge>🔄 인증 처리 중...</StatusBadge>
        ) : isAuthenticated ? (
          <StatusBadge>
            ✅ 인증 완료 | 만료: {tokenData?.expires_at?.toLocaleString()}
          </StatusBadge>
        ) : (
          <StatusBadge>❌ 인증 필요</StatusBadge>
        )}
      </Header>

      {loading && (
        <Section>
          <LoadingScreen>
            <Spinner />
            <h3>인증 코드를 처리하고 있습니다...</h3>
            <p>잠시만 기다려주세요.</p>
          </LoadingScreen>
        </Section>
      )}

      {!loading && (
        <Section>
          <SectionTitle>🔐 인증 상태</SectionTitle>
          <AuthCodeDisplay
            authCode={authCode}
            tokenData={tokenData}
            error={error}
            isAuthenticated={isAuthenticated}
            onManualTokenRequest={manualTokenRequest}
            onClearAuth={clearAuth}
          />
        </Section>
      )}

      {isAuthenticated && !loading && (
        <Section>
          <SectionTitle>💰 상품 가격 관리</SectionTitle>
          <ProductPriceManager isAuthenticated={isAuthenticated} />
        </Section>
      )}
    </AppContainer>
  );
}

export default App;
