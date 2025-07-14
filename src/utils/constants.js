// 설정 상수들
// 카페24 API 설정
export const CAFE24_CONFIG = {
  MALL_ID: process.env.REACT_APP_CAFE24_MALL_ID,
  CLIENT_ID: process.env.REACT_APP_CAFE24_CLIENT_ID,
  CLIENT_SECRET: process.env.REACT_APP_CAFE24_CLIENT_SECRET,
  REDIRECT_URI: process.env.REACT_APP_CAFE24_REDIRECT_URI,
  SCOPE: process.env.REACT_APP_CAFE24_SCOPE,
  SHOP_NO: parseInt(process.env.REACT_APP_CAFE24_SHOP_NO) || 1,
};

// 설정 검증 함수
export const validateCafe24Config = () => {
  const errors = [];

  if (!CAFE24_CONFIG.MALL_ID || CAFE24_CONFIG.MALL_ID.includes("your_")) {
    errors.push("MALL_ID가 설정되지 않았습니다.");
  }

  if (
    !CAFE24_CONFIG.CLIENT_ID ||
    CAFE24_CONFIG.CLIENT_ID.includes("[클라이언트")
  ) {
    errors.push("CLIENT_ID가 설정되지 않았습니다.");
  }

  if (
    !CAFE24_CONFIG.CLIENT_SECRET ||
    CAFE24_CONFIG.CLIENT_SECRET.includes("[클라이언트")
  ) {
    errors.push("CLIENT_SECRET이 설정되지 않았습니다.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 금 가격 설정
export const GOLD_PRICE_CONFIG = {
  DEFAULT_PRICE_PER_GRAM: 85000, // 기본 금 1g당 가격
  DEFAULT_MARGIN_RATE: 0.3, // 기본 마진율 30%
  PRICE_ROUND_UNIT: 100, // 가격 반올림 단위
};

// API 호출 제한 설정
export const API_LIMITS = {
  REQUESTS_PER_SECOND: 10,
  DELAY_BETWEEN_REQUESTS: 100, // 밀리초
};
