const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // 이 줄 추가
require("dotenv").config();

const app = express();
const PORT = 3001;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 요청 로깅 미들웨어 (디버깅용)
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("Raw Body Type:", typeof req.body);
  next();
});

app.post("/api/cafe24-token", async (req, res) => {
  try {
    console.log("=== 토큰 발급 요청 ===");
    console.log("요청 본문:", req.body);
    console.log("Content-Type:", req.headers["content-type"]);

    // ✅ req.body 존재 여부 확인
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error("❌ 요청 본문이 비어있습니다.");
      return res.status(400).json({
        error: "요청 본문이 비어있습니다.",
        contentType: req.headers["content-type"],
        bodyKeys: Object.keys(req.body || {}),
      });
    }

    const { grant_type, code, redirect_uri } = req.body;

    console.log("파라미터 확인:", {
      grant_type,
      code: code ? code.substring(0, 20) + "..." : "undefined",
      redirect_uri,
    });

    if (!grant_type) {
      return res.status(400).json({ error: "grant_type이 필요합니다." });
    }

    if (!code && grant_type === "authorization_code") {
      return res.status(400).json({ error: "code가 필요합니다." });
    }

    const mallId = process.env.REACT_APP_CAFE24_MALL_ID;
    const clientId = process.env.REACT_APP_CAFE24_CLIENT_ID;
    const clientSecret = process.env.REACT_APP_CAFE24_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("환경변수 누락");
      return res.status(500).json({
        error: "환경변수 설정 오류",
        missing: {
          clientId: !clientId,
          clientSecret: !clientSecret,
        },
      });
    }
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );
    const tokenUrl = `https://${mallId}.cafe24api.com/api/v2/oauth/token`;

    console.log("카페24 API 호출:", tokenUrl);

    // ✅ 카페24 API 요청 (form-urlencoded 형식)
    const formData = new URLSearchParams();
    formData.append("grant_type", grant_type);

    if (grant_type === "authorization_code") {
      formData.append("code", code);
      formData.append("redirect_uri", redirect_uri);
    } else if (grant_type === "refresh_token") {
      formData.append("refresh_token", req.body.refresh_token);
    }

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    console.log("카페24 응답 상태:", response.status);

    const responseText = await response.text();
    console.log("카페24 응답 내용:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON 파싱 실패:", parseError);
      return res.status(500).json({
        error: "JSON 파싱 실패",
        responseText: responseText.substring(0, 500),
      });
    }

    if (!response.ok) {
      console.error("카페24 API 오류:", data);
      return res.status(response.status).json({
        error: "카페24 API 오류",
        details: data,
      });
    }

    console.log("✅ 토큰 발급 성공");
    res.json(data);
  } catch (error) {
    console.error("서버 에러:", error);
    res.status(500).json({
      error: "서버 오류",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// 기본 라우트 (서버 상태 확인)
app.get("/", (req, res) => {
  res.json({
    message: "카페24 프록시 서버가 정상적으로 실행 중입니다!",
    timestamp: new Date().toISOString(),
    endpoints: ["POST /api/cafe24-token"],
  });
});

app.listen(PORT, () => {
  console.log(`✅ Express 서버 실행 중: http://localhost:${PORT}`);
});

// ------------------------ * 상품 API endpoint * ------------------------ //

app.post("/api/cafe24-products", async (req, res) => {
  try {
    console.log("=== 상품 API 요청 ===");
    console.log("요청 본문:", JSON.stringify(req.body, null, 2));

    const { action, searchType, searchQuery, productNo } = req.body;

    // 디버깅을 위한 상세 로그
    console.log("파싱된 값:");
    console.log("- action:", action, typeof action);
    console.log("- searchType:", searchType);
    console.log("- searchQuery:", searchQuery);
    console.log("- productNo:", productNo);

    // 액션 검증
    if (!action || typeof action !== "string") {
      return res.status(400).json({
        error: "action이 필요합니다.",
        received: { action, type: typeof action },
        body: req.body,
      });
    }

    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!accessToken) {
      return res.status(401).json({ error: "액세스 토큰이 필요합니다." });
    }

    const mallId = process.env.REACT_APP_CAFE24_MALL_ID;

    if (!mallId) {
      return res.status(500).json({ error: "MALL_ID가 설정되지 않았습니다." });
    }

    let apiUrl;
    let method = "POST";
    let bodyData = null;
    let apiParams = "?shop_no=1";

    switch (action) {
      case "searchProducts":
        console.log("📦 상품 검색 요청");

        //get
        apiUrl = `https://${mallId}.cafe24api.com/api/v2/admin/products`;

        let params = new URLSearchParams();
        params.append("shop_no", "1");
        params.append("limit", "100"); // 더 많은 검색 결과

        // 검색 조건 추가
        if (searchType && searchQuery) {
          if (searchType === "name") {
            params.append("product_name", searchQuery);
          } else if (searchType === "code") {
            params.append("product_code", searchQuery);
          } else if (searchType === "id") {
            params.append("product_no", searchQuery);
          }
        }

        // GET 요청이므로 파라미터를 URL에 추가
        apiUrl = `${apiUrl}?${params.toString()}`;
        console.log("🌐 GET 요청 URL:", apiUrl);
        break;

      case "getProduct":
        if (!productNo) {
          return res.status(400).json({ error: "productNo가 필요합니다." });
        }
        console.log("📋 상품 상세 조회:", productNo);
        apiUrl = `https://${mallId}.cafe24api.com/api/v2/admin/products/${productNo}?shop_no=1`;
        break;

      case "updateProduct":
        if (!productNo) {
          return res.status(400).json({ error: "productNo가 필요합니다." });
        }
        console.log("✏️ 상품 수정:", productNo);
        method = "PUT";
        apiUrl = `https://${mallId}.cafe24api.com/api/v2/admin/products/${productNo}`;
        bodyData = req.body.updateData; // 수정할 데이터
        break;

      case "getVariants":
        if (!productNo) {
          return res.status(400).json({ error: "productNo가 필요합니다." });
        }
        console.log("🔧 상품 옵션(variants) 조회:", productNo);
        apiUrl = `https://${mallId}.cafe24api.com/api/v2/admin/products/${productNo}/variants?shop_no=1`;
        break;

      case "getOptions":
        if (!productNo) {
          return res.status(400).json({ error: "productNo가 필요합니다." });
        }
        console.log("⚙️ 상품 옵션(options) 조회:", productNo);
        apiUrl = `https://${mallId}.cafe24api.com/api/v2/admin/products/${productNo}/options?shop_no=1`;
        break;

      default:
        console.log("❌ 지원하지 않는 액션:", action);
        return res.status(400).json({
          error: "지원하지 않는 액션입니다.",
          supportedActions: [
            "searchProducts",
            "getProduct",
            "updateProduct",
            "getVariants",
            "getOptions",
          ],
          receivedAction: action,
        });
    }

    console.log(`🚀 카페24 API ${method} 요청:`, apiUrl);

    // 카페24 API 요청 옵션
    const fetchOptions = {
      method: method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Cafe24-Api-Version": "2024-12-01", // API 버전 명시
      },
    };

    // PUT/POST 요청인 경우에만 body 추가
    if (method !== "GET" && bodyData) {
      fetchOptions.body = JSON.stringify(bodyData);
    }

    // 카페24 API 요청
    const response = await fetch(apiUrl, fetchOptions);

    console.log("카페24 API 응답 상태:", response.status);

    const responseText = await response.text();
    console.log("📄 응답 내용:", responseText.substring(0, 200));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON 파싱 실패:", parseError);
      return res.status(500).json({
        error: "API 응답 파싱 실패",
        responseText: responseText.substring(0, 300),
        parseError: parseError.message,
      });
    }
    // 카페24 API 에러 처리
    if (!response.ok) {
      console.error("❌ 카페24 API 에러:", data);

      // 카페24 API의 구체적인 에러 메시지 전달
      const errorMessage =
        data.error?.message || data.message || "알 수 없는 오류";

      return res.status(response.status).json({
        error: "카페24 API 오류",
        message: errorMessage,
        code: data.error?.code,
        details: data,
      });
    }

    console.log("✅ 상품 API 성공");

    // 검색 결과 로깅
    if (action === "searchProducts" && data.products) {
      console.log(`📦 검색 결과: ${data.products.length}개 상품 발견`);
      if (data.products.length > 0) {
        console.log("첫 3개 상품:");
        data.products.slice(0, 3).forEach((product, index) => {
          console.log(
            `${index + 1}. [${product.product_no}] ${product.product_name} - ${
              product.price
            }원`
          );
        });
      }
    }

    res.json(data);
  } catch (error) {
    console.error("❌ 상품 API 서버 에러:", error);
    res.status(500).json({
      error: "서버 오류",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// 상품 API 테스트 엔드포인트
app.get("/api/cafe24-products/test", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!accessToken) {
      return res.status(401).json({ error: "토큰을 헤더에 포함해주세요." });
    }

    const mallId = process.env.REACT_APP_CAFE24_MALL_ID;
    const testUrl = `https://${mallId}.cafe24api.com/api/v2/admin/products?shop_no=1&limit=5`;

    console.log("🧪 테스트 API 호출:", testUrl);

    const response = await fetch(testUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Cafe24-Api-Version": "2024-12-01",
      },
    });

    const data = await response.json();

    res.json({
      message: "테스트 성공",
      status: response.status,
      productCount: data.products?.length || 0,
      firstProduct: data.products?.[0] || null,
    });
  } catch (error) {
    res.status(500).json({
      error: "테스트 실패",
      message: error.message,
    });
  }
});
