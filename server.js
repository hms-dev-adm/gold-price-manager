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

// server.js - 카페24 API 수정 (API 버전 제거)
// server.js의 상품 API 부분 전체를 다시 수정 (7.24)
app.post("/api/cafe24-products", async (req, res) => {
  try {
    console.log("\n=== 상품 API 요청 ===");
    console.log("요청 본문:", JSON.stringify(req.body, null, 2));

    const { action, searchType, searchQuery, productNo, price, variantNo } =
      req.body;

    // 토큰 확인
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!accessToken) {
      return res.status(401).json({ error: "액세스 토큰이 필요합니다." });
    }

    const mallId = process.env.REACT_APP_CAFE24_MALL_ID || "gongbang301";

    console.log("Mall ID:", mallId);
    console.log("Action:", action);

    // let으로 변경하여 재할당 가능하게 함
    let apiUrl;
    let method = "GET";
    let requestBody = null;

    switch (action) {
      case "searchProducts":
        apiUrl = `https://${mallId}.cafe24api.com/api/v2/admin/products?shop_no=1&limit=100&embed=options`;
        break;

      case "getProduct":
        if (!productNo) {
          return res.status(400).json({ error: "productNo가 필요합니다." });
        }
        apiUrl = `https://${mallId}.cafe24api.com/api/v2/admin/products/${productNo}?shop_no=1&embed=options`;
        break;

      case "updateProductPrice":
        if (!productNo) {
          return res.status(400).json({ error: "productNo가 필요합니다." });
        }

        console.log("💰 가격 수정 요청:", { productNo, price, variantNo });

        if (!price || price < 0) {
          return res.status(400).json({ error: "유효한 가격을 입력해주세요." });
        }

        method = "PUT";

        if (variantNo) {
          // Variant 가격 수정은 지원하지 않는 경우가 많음
          return res.status(400).json({
            error: "옵션 가격 수정은 카페24 API에서 제한적으로 지원됩니다.",
            message: "기본 상품 가격만 수정 가능합니다.",
          });
        } else {
          // 기본 상품 가격 수정
          apiUrl = `https://${mallId}.cafe24api.com/api/v2/admin/products/${productNo}`;

          // 카페24 API 문서에 따른 정확한 형식
          requestBody = {
            shop_no: 1, // 숫자로
            product: {
              // request가 아닌 product
              price: price.toString(), // 가격만 전송
            },
          };
        }
        break;

      case "getVariants":
        if (!productNo) {
          return res.status(400).json({ error: "productNo가 필요합니다." });
        }
        apiUrl = `https://${mallId}.cafe24api.com/api/v2/admin/products/${productNo}/variants?shop_no=1`;
        break;

      case "getOptions":
        if (!productNo) {
          return res.status(400).json({ error: "productNo가 필요합니다." });
        }
        apiUrl = `https://${mallId}.cafe24api.com/api/v2/admin/products/${productNo}/options?shop_no=1`;
        break;

      default:
        return res.status(400).json({
          error: "지원하지 않는 액션입니다.",
          receivedAction: action,
        });
    }

    console.log(`🚀 카페24 API 호출: ${method} ${apiUrl}`);
    if (requestBody) {
      console.log("📤 요청 데이터:", JSON.stringify(requestBody, null, 2));
    }

    // fetch 옵션 설정
    const fetchOptions = {
      method: method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    // PUT/POST 요청인 경우에만 body 추가
    if (method !== "GET" && requestBody) {
      fetchOptions.body = JSON.stringify(requestBody);
    }

    // 카페24 API 호출
    const response = await fetch(apiUrl, fetchOptions);

    console.log("📥 응답 상태:", response.status);

    const responseText = await response.text();
    console.log("📄 응답 내용:", responseText.substring(0, 500));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON 파싱 실패:", parseError);
      return res.status(500).json({
        error: "API 응답 파싱 실패",
        responseText: responseText.substring(0, 500),
      });
    }

    // 에러 체크
    if (!response.ok) {
      console.error("❌ 카페24 API 에러:", data);

      // 400 에러인 경우 더 자세한 정보 제공
      if (response.status === 400) {
        return res.status(400).json({
          error: "카페24 API 요청 형식 오류",
          message: data.error?.message || "요청 파라미터를 확인해주세요.",
          details: data,
          tip: "카페24 API는 가격 수정 시 추가 필드가 필요할 수 있습니다.",
        });
      }

      return res.status(response.status).json({
        error: "카페24 API 오류",
        details: data,
      });
    }

    // searchProducts인 경우 클라이언트 사이드 필터링
    if (action === "searchProducts" && searchQuery && data.products) {
      const originalCount = data.products.length;

      data.products = data.products.filter((product) => {
        if (searchType === "name") {
          return product.product_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());
        } else if (searchType === "code") {
          return product.product_code
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());
        } else if (searchType === "id") {
          return product.product_no?.toString() === searchQuery;
        } else if (searchType === "model") {
          return product.model_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());
        }
        return true;
      });

      console.log(`✅ 필터링: ${originalCount}개 → ${data.products.length}개`);
    }

    console.log("✅ 성공적으로 완료");
    res.json(data);
  } catch (error) {
    console.error("❌ 서버 에러:", error);
    res.status(500).json({
      error: "서버 내부 오류",
      message: error.message,
    });
  }
});

// 간단한 가격 수정 테스트 엔드포인트
app.post("/api/cafe24-price-test", async (req, res) => {
  try {
    const { productNo, price } = req.body;
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!accessToken) {
      return res.status(401).json({ error: "토큰이 필요합니다." });
    }

    const mallId = process.env.REACT_APP_CAFE24_MALL_ID || "gongbang301";

    // 다양한 형식으로 시도
    const formats = [
      // 형식 1: product 객체
      {
        shop_no: 1,
        product: {
          price: price.toString(),
        },
      },
      // 형식 2: request 객체
      {
        shop_no: 1,
        request: {
          price: price.toString(),
        },
      },
      // 형식 3: 직접 필드
      {
        shop_no: 1,
        price: price.toString(),
      },
      // 형식 4: fields 파라미터 사용
      {
        shop_no: 1,
        fields: ["price"],
        product: {
          price: price.toString(),
        },
      },
    ];

    for (let i = 0; i < formats.length; i++) {
      console.log(`\n시도 ${i + 1}:`, JSON.stringify(formats[i], null, 2));

      const response = await fetch(
        `https://${mallId}.cafe24api.com/api/v2/admin/products/${productNo}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formats[i]),
        }
      );

      const data = await response.json();

      if (response.ok) {
        return res.json({
          success: true,
          format: i + 1,
          data: data,
        });
      }

      console.log(`형식 ${i + 1} 실패:`, data.error?.message);
    }

    res.status(400).json({
      error: "모든 형식 시도 실패",
      message: "카페24 API 문서를 확인해주세요.",
    });
  } catch (error) {
    console.error("테스트 실패:", error);
    res.status(500).json({ error: error.message });
  }
});
