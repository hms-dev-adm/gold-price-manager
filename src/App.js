import React, {useState, useEffect }from 'react';
import styled from 'styled-components';
import {CAFE24_CONFIG} from './utils/constants'

const AppContainer = styled.div`
text-align : center;`;

const AppHeader = styled.header`
background-color: #282c34;
padding : 20px;
color: white;
min-height: 50vh;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
font-size: calc(10px+2vmin);
`;

const StatusText = styled.p`
  margin: 0 auto;
  font-size: 1.2rem;
`

const TokenLink = styled.a`
color : #61dafb;
text-decoration: none;
margin-left: 10px;
padding: 10px 20px;
border: 2px solid #61dafb;
border-radius: 5px;

transition: all 0.2 ease-in;

&:hover{
 background-color: #fff;
 color: #282c34;
}

&:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
`;

const InfoSection = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const ConfigInfo = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  text-align: left;
`;



function App() {
  const [mallId, setMallId] = useState('');
  const [tokenUrl, setTokenUrl] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [isConfigured, setIsConfigured] = useState('');
  
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
    }

    //토큰 URL 생성
    const generateTokenUrl = (targetMallId) =>{
      // if(!targetMallId || !CAFE24_CONFIG.CLIENT_ID || !CAFE24_CONFIG.REDIRECT_URI)
      if(!targetMallId || !CAFE24_CONFIG.CLIENT_ID){
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
    
    }
  })

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
    <StatusText>
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
    )}
  </AppHeader>
</AppContainer>
  );
}

export default App;
