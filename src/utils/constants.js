// 설정 상수들
export const CAFE24_CONFIG = {
  MALL_ID: 'gongbang301',
  CLIENT_ID: 'iamGWDTJPZqpaYNMl8qpyC',
  CLIENT_SECRET: 'v0cbc3gzElSjtxdDOTVKOA',
  SHOP_NO: 1,
  ACCESS_TOKEN: 'your_access_token' // 실제로는 OAuth 플로우로 획득
};

// 금 가격 설정
export const GOLD_PRICE_CONFIG = {
  DEFAULT_PRICE_PER_GRAM: 85000, // 기본 금 1g당 가격
  DEFAULT_MARGIN_RATE: 0.3, // 기본 마진율 30%
  PRICE_ROUND_UNIT: 100 // 가격 반올림 단위
};

// API 호출 제한 설정
export const API_LIMITS = {
  REQUESTS_PER_SECOND: 10,
  DELAY_BETWEEN_REQUESTS: 100 // 밀리초
};