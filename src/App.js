import React, {useState, useEffect }from 'react';
import styled from 'styled-components';
import {CAFE24_CONFIG} from './utils/constants'
//추가
import AuthCodeInput from './components/AuthCodeInput.js';
import ProductPriceManager from './components/ProductPriceManager.js';

const AppContainer = styled.div`
text-align : center;`

const Section = styled.section`
  margin-bottom: 40px;
`;


const AppHeader = styled.header`
 text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
`;


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); //인증 여부 확인 - 로그인 여부
  const [tokenData, setTokenData] = useState(null); //토큰 정보 저장 객체

  useEffect(()=>{
    // 페이지 로드 시 저장된 토큰 확인
    const savedToken = localStorage.getItem('cafe24_access_token');
    const tokenExpires = localStorage.getItem('cafe24_token_expires');

    if(savedToken && tokenExpires && Date.now() < parseInt(tokenExpires)) {
      setIsAuthenticated(true);
      setTokenData({
        access_token: savedToken,
        expires_at: new Date(parseInt(tokenExpires))
      });
    }
  },[]);

  //새로운 토큰을 받았을때
  const handleTokenReceived = (token) =>{
    setIsAuthenticated(true);
    setTokenData({
      ...token, //받은 토큰의 모든 정보를 복사
      expires_at: new Date(Date.now() + (token.expires_in * 1000))
    });
  };


  return (
<AppContainer>
  <AppHeader>
    {isAuthenticated && tokenData && (
      <div style={{fontSize : '0.9em', marginTop:'10px'}}>
        ✅ 인증됨 | 만료: {tokenData.expires_at.toLocaleString()}
      </div>
    )}
  </AppHeader>

  {/* <InfoSection>
    <h2>현재 설정 상태</h2>

    <ConfigInfo>
      <h3>📋설정 정보</h3>
      <p><strong>Mall ID:</strong> {mallId || '설정되지 않음'}</p>
          <p><strong>Client ID:</strong> {CAFE24_CONFIG.CLIENT_ID?.substring(0, 10)}... {isConfigured ? '✅' : '❌'}</p>
          <p><strong>Redirect URI:</strong> {CAFE24_CONFIG.REDIRECT_URI}</p>
          <p><strong>권한 범위:</strong> {CAFE24_CONFIG.SCOPE}</p>
          <p><strong>설정 완료:</strong> {isConfigured ? '✅ 완료' : '❌ 미완료'}</p>
    </ConfigInfo>

        {!isConfigured && (
          <ConfigInfo style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeaa7' }}>
            <h3>⚠️ 설정이 필요합니다</h3>
            <p>다음 파일을 확인하고 올바른 값으로 설정해주세요:</p>
            <ul style={{ textAlign: 'left' }}>
              <li><code>.env</code> 파일의 환경 변수들</li>
              <li><code>src/utils/constants.js</code> 파일의 CAFE24_CONFIG</li>
              <li>카페24 개발자센터에서 앱 승인 여부</li>
            </ul>
          </ConfigInfo>
        )}

        {tokenUrl && (
          <ConfigInfo style={{ backgroundColor: '#d4edda', border: '1px solid #c3e6cb' }}>
            <h3>🔗 생성된 인증 URL</h3>
            <p style={{ wordBreak: 'break-all', fontSize: '0.9rem' }}>
              {tokenUrl}
            </p>
          </ConfigInfo>
        )}
  </InfoSection> */}

  <Section>
    <AuthCodeInput onTokenReceived={handleTokenReceived}/>
  </Section>

  <Section>
    <ProductPriceManager isAuthenticated={isAuthenticated} />
  </Section>
</AppContainer>
  );
}

export default App;
