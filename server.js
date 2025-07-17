const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // 이 줄 추가
require("dotenv").config();

const app = express();
const PORT = 3001;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 환경 변수 확인
const mallId = process.env.REACT_APP_CAFE24_MALL_ID || "gongbang301";
const clientId = process.env.REACT_APP_CAFE24_CLIENT_ID;
const clientSecret = process.env.REACT_APP_CAFE24_CLIENT_SECRET;

console.log("🚀 Express 서버 시작 중...");
console.log("환경 변수 확인:");
console.log("- MALL_ID:", mallId);
console.log("- CLIENT_ID:", clientId ? "설정됨" : "❌ 없음");
console.log("- CLIENT_SECRET:", clientSecret ? "설정됨" : "❌ 없음");

// 기본 라우트 (서버 상태 확인)
app.get("/", (req, res) => {
  res.json({
    message: "카페24 프록시 서버가 정상적으로 실행 중입니다!",
    timestamp: new Date().toISOString(),
    endpoints: [
      "POST /api/cafe24-token",
      "POST /api/cafe24-products",
      "GET /api/cafe24-products (테스트용)",
    ],
  });
});
// 카페24 상품 API 테스트용 GET 라우트
app.get("/api/cafe24-products", (req, res) => {
  res.json({
    message: "카페24 상품 API 엔드포인트",
    info: "POST 요청을 사용하여 실제 API를 호출하세요.",
    example: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer your_access_token",
      },
      body: {
        action: "getProducts",
      },
    },
  });
});

// 카페24 토큰 API 프록시
app.post("/api/cafe24-token", async (req, res) => {
  try {
    console.log("=== 토큰 API 요청 ===");
    const { grant_type, code, refresh_token, redirect_uri } = req.body;

    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: "클라이언트 정보가 없습니다." });
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );
    const tokenUrl = `https://${mallId}.cafe24api.com/api/v2/oauth/token`;

    const formData = new URLSearchParams();

    formData.append("grant_type", grant_type);

    if (grant_type === "authorization_code") {
      formData.append("code", code);
      formData.append(
        "redirect_uri",
        redirect_uri || "https://gongbang301.com"
      );
    } else if (grant_type === "refresh_token") {
      formData.append("refresh_token", refresh_token);
    }

    console.log("카페24 토큰 API 호출:", tokenUrl);

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();
    console.log("토큰 API 응답:", response.status);

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error("토큰 API 에러:", error);
    res.status(500).json({ error: "서버 오류", message: error.message });
  }
});

// 카페24 상품 API 프록시
app.post("/api/cafe24-products", async (req, res) => {
  try {
    console.log("=== 상품 API 요청 ===");
    const { action, productNo, method = "GET", body: requestBody } = req.body;

    console.log("요청 파라미터:", { action, productNo, method });

    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!accessToken) {
      console.log("액세스 토큰이 없음");
      return res.status(401).json({ error: "액세스 토큰이 필요합니다." });
    }

    let apiUrl = `https://${mallId}.cafe24api.com/api/v2/admin`;

    // 액션에 따른 엔드포인트 결정
    switch (action) {
      case "getProducts":
        apiUrl += "/products?shop_no=1&limit=50";
        break;
      case "getProduct":
        if (!productNo) {
          return res.status(400).json({ error: "productNo가 필요합니다." });
        }
        apiUrl += `/products/${productNo}?shop_no=1`;
        break;
      case "getVariants":
        if (!productNo) {
          return res.status(400).json({ error: "productNo가 필요합니다." });
        }
        apiUrl += `/products/${productNo}/variants?shop_no=1`;
        break;
      case "getOptions":
        if (!productNo) {
          return res.status(400).json({ error: "productNo가 필요합니다." });
        }
        apiUrl += `/products/${productNo}/options?shop_no=1`;
        break;
      case "updateProduct":
        if (!productNo) {
          return res.status(400).json({ error: "productNo가 필요합니다." });
        }
        apiUrl += `/products/${productNo}`;
        break;
      case "updateVariant":
        if (!productNo || !requestBody?.variant_code) {
          return res
            .status(400)
            .json({ error: "productNo와 variant_code가 필요합니다." });
        }
        apiUrl += `/products/${productNo}/variants/${requestBody.variant_code}`;
        break;
      case "updateOption":
        if (!productNo || !requestBody?.option_no) {
          return res
            .status(400)
            .json({ error: "productNo와 option_no가 필요합니다." });
        }
        apiUrl += `/products/${productNo}/options/${requestBody.option_no}`;
        break;
      default:
        return res.status(400).json({ error: "잘못된 액션입니다: " + action });
    }

    console.log("카페24 상품 API 호출:", { action, method, apiUrl });

    const response = await fetch(apiUrl, {
      method: method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Cafe24-Api-Version": "2024-03-01",
      },
      body: method !== "GET" ? JSON.stringify(requestBody) : undefined,
    });

    const data = await response.json();
    console.log("상품 API 응답:", response.status);

    if (!response.ok) {
      console.error("카페24 API 에러:", data);
      return res.status(response.status).json(data);
    }

    console.log("상품 API 성공:", action);
    res.json(data);
  } catch (error) {
    console.error("상품 API 에러:", error);
    res.status(500).json({ error: "서버 오류", message: error.message });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 개발 서버가 http://localhost:${PORT} 에서 실행 중`);
});
