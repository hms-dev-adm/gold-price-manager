import React, {useState, useEffect }from 'react';
import styled from 'styled-components';
import {CAFE24_CONFIG} from './utils/constants'

import './App.css';

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
      generateTokenUrl(mallIdParam); //아래
    }

    //토큰 URL 생성
    const generateTokenUrl = (targetMallId) =>{
      setAuthCode(codeParam);
    }
  })





  return (
    <div className="App">
      <header className="App-header">
       <p id="app">앱실행 완료 / <a href="#" id="token-url">API 자격증명 얻기</a></p>
      </header>
    </div>
  );
}

export default App;
