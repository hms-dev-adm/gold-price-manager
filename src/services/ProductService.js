class ProductService {
  // constructor() {
  //   // 개발 환경에서는 다른 엔드포인트 사용
  //   this.baseUrl =
  //     process.env.NODE_ENV === "development"
  //       ? "/api/cafe24-products-local" // 로컬 개발용
  //       : "/api/cafe24-products"; // Vercel 배포용
  // }

  constructor() {
    this.baseUrl = "/api/cafe24-products";
  }
  async getAccessToken() {
    const token = localStorage.getItem("cafe24_access_token");
    const expires = localStorage.getItem("cafe24_token_expires");

    if (!token || !expires) {
      throw new Error("액세스 토큰이 없습니다.");
    }

    if (Date.now() >= parseInt(expires)) {
      throw new Error("토큰이 만료되었습니다.");
    }

    return token;
  }

  async apiCall(action, options = {}) {
    //실제 api
    const token = await this.getAccessToken();

    console.log("ProductService API 호출:", { action, options });

     const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action,
        ...options
      })
    });
    console.log("ProductService 응답:", {
      status: response.status,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ProductService 에러:", errorData);
      throw new Error(`API 호출 실패: ${errorData.error || response.status}`);
    }

    return await response.json();
  }

  // 상품 목록 조회
  async getProducts() {
    return await this.apiCall("getProducts");
  }

  // 상품 상세 조회
  async getProduct(productNo) {
    return await this.apiCall("getProduct", { productNo });
  }

  // 품목생성형 옵션 조회
  async getVariants(productNo) {
    return await this.apiCall("getVariants", { productNo });
  }

  // 상품연동형 옵션 조회
  async getOptions(productNo) {
    return await this.apiCall("getOptions", { productNo });
  }

  // 기본 상품 가격 수정
  async updateProductPrice(productNo, priceData) {
    return await this.apiCall("updateProduct", {
      productNo,
      method: "PUT",
      body: {
        shop_no: 1,
        ...priceData,
      },
    });
  }

  // 품목생성형 옵션 가격 수정
  async updateVariantPrice(productNo, variantCode, priceData) {
    return await this.apiCall("updateVariant", {
      productNo,
      method: "PUT",
      body: {
        shop_no: 1,
        variant_code: variantCode,
        ...priceData,
      },
    });
  }

  // 상품연동형 옵션 가격 수정
  async updateOptionPrice(productNo, optionNo, optionData) {
    return await this.apiCall("updateOption", {
      productNo,
      method: "PUT",
      body: {
        shop_no: 1,
        option_no: optionNo,
        ...optionData,
      },
    });
  }
}

export default new ProductService();
