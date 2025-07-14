import React, {useState, useEffect }from 'react';
import styled from 'styled-components';
import {CAFE24_CONFIG} from './utils/constants.js'
//추가
import AuthCodeInput from './components/AuthCodeInput.js/index.js';
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
  const [mallId, setMallId] = useState('');
  const [tokenUrl, setTokenUrl] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [isConfigured, setIsConfigured] = useState('');
  
    //토큰 URL 생성
    const generateTokenUrl = (targetMallId) =>{
      // if(!targetMallId || !CAFE24_CONFIG.CLIENT_ID || !CAFE24_CONFIG.REDIRECT_URI)
      if(!targetMallId || !CAFE24_CONFIG.CLIENT_ID || !CAFE24_CONFIG.REDIRECT_URI){
        console.error('필수 설정 정보가 없습니다.');
        return;
      }

      const authUrl = `https://${targetMallId}.cafe24api.com/api/v2/oauth/authorize?`+
      `response_type=code` +
      `&client_id=${CAFE24_CONFIG.CLIENT_ID}` +
      `&state=S256` +
      `&redirect_uri=${encodeURIComponent(CAFE24_CONFIG.REDIRECT_URI)}` +
      `&scope=${encodeURIComponent(CAFE24_CONFIG.SCOPE)}`;

      setTokenUrl(authUrl);
    };

    const checkConfiguration = () => {
      const hasRequiredConfig = 
      CAFE24_CONFIG.CLIENT_ID && 
      !CAFE24_CONFIG.CLIENT_ID.includes('your_') &&
      CAFE24_CONFIG.CLIENT_SECRET && 
      !CAFE24_CONFIG.CLIENT_SECRET.includes('your_') &&
      CAFE24_CONFIG.MALL_ID && 
      !CAFE24_CONFIG.MALL_ID.includes('your_');

      setIsConfigured(hasRequiredConfig);
    }

  //mall id & 인증코드 확인
  useEffect(()=>{
    const url = new URL(window.location.href);
    const urlParams = url.searchParams;

    //mall id
    const mallIdParam = urlParams.get('mall_id');
    const codeParam = urlParams.get('code');
    const stateParam = urlParams.get('state');
    
    if(mallIdParam){
      setMallId(mallIdParam);
      generateTokenUrl(mallIdParam); //아래 기능 구현
    } else {

      //URL에 mall_id가 없는 경우 디폴드 값 불러오기
      if(CAFE24_CONFIG.MALL_ID && !CAFE24_CONFIG.MALL_ID.includes('your_')){
        setMallId(CAFE24_CONFIG.MALL_ID);
        generateTokenUrl(CAFE24_CONFIG.MALL_ID);
      }
    }

    //인증 코드가 있는 경우
    if(codeParam){
      setAuthCode(codeParam);
      console.log('받은 인증 코드: ', codeParam);
      console.log('상태값: ', stateParam)
    }

    //설정 유효성 검사 -test
  },[])

  //인증 링크 클릭 handler
  const handleAuthClick = (e) => {
    if(!tokenUrl){
      e.preventDefault();
      alert('token url이 생성되지 않았습니다. 설정을 확인해주세요.')
    }
  }





  return (
<AppContainer>
  <AppHeader>
    {/* <StatusText>
      앱실행 완료 / {
        tokenUrl?(
          <TokenLink href={tokenUrl} onClick={handleAuthClick}>
            API 자격증명 얻기
          </TokenLink>
        ) : (
          <TokenLink href="#" onClick={(e)=> e.preventDefault()}>
            설정 필요 !
          </TokenLink>
        )
      }
    </StatusText>
    {authCode && (
      <div style={{marginTop:'20px', fontSize:'0.8em'}}>
        <p>✅ 인증 코드를 받았습니다!</p>
        <p>코드 : {authCode.substring(0, 20)}...</p>
      </div>
    )} */}
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
    {/* <AuthCodeInput onTokenReceived={handleTokenReceived}/> */}
  </Section>

  <Section>
    {/* <ProductPriceManager isAuthenticated={isAuthenticated} /> */}
  </Section>
</AppContainer>
  );
}

export default App;
