import { CAFE24_CONFIG } from "../utils/constants";

class Cafe24ProductService {
  constructor() {
    this.mallId = CAFE24_CONFIG.MALL_ID;
    this.baseUrl = `https://${this.mallId}.cafe24api.com/api/v2/admin`;
  }

  async getAccessToken() {
    const token = localStorage.getItem("cafe24_access_token");
    const expires = localStorage.getItem("cafe24_token_expires");

    if (!token || !expires) {
      throw new Error("액세스 토큰이 없습니다. 먼저 인증해주세요.");
    }

    if (Date.now() >= parseInt(expires)) {
      throw new Error("토큰이 만료되었습니다. 다시 인증해주세요.");
    }

    return token;
  }

  async apiRequest(endpoint, options = {}) {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Cafe24-Api-Version": "2024-03-01",
        ...options.headers,
      },
    });

    //응답을 못받으면
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API 요청 실패: ${errorData.error?.message || response.status}`
      );
    }

    return await response.json();
  }
}
