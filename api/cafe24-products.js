// api/cafe24-products.js
export default async function handler(req, res) {
  try {
    console.log("=== Products API 호출 ===");
    console.log("Method:", req.method);
    console.log("Body:", req.body);

    // CORS 헤더 설정
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { action, productNo, method = "GET", body: requestBody } = req.body;

    console.log("파라미터:", { action, productNo, method });

    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    console.log("토큰 확인:", {
      hasAuthHeader: !!authHeader,
      tokenLength: accessToken?.length,
    });

    if (!accessToken) {
      return res.status(401).json({ error: "액세스 토큰이 필요합니다." });
    }

    const mallId = process.env.CAFE24_MALL_ID || "gongbang301";
    let apiUrl = `https://${mallId}.cafe24api.com/api/v2/admin`;

    // 액션에 따른 API 엔드포인트 결정
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

    console.log("카페24 API 호출:", { apiUrl, method });

    const response = await fetch(apiUrl, {
      method: method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Cafe24-Api-Version": "2024-03-01",
      },
      body: method !== "GET" ? JSON.stringify(requestBody) : undefined,
    });

    console.log("카페24 API 응답:", {
      status: response.status,
      ok: response.ok,
    });

    const responseText = await response.text();
    console.log("응답 텍스트:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON 파싱 에러:", parseError);
      return res.status(500).json({
        error: "API 응답 파싱 실패",
        responseText: responseText.slice(0, 500),
        parseError: parseError.message,
      });
    }

    if (!response.ok) {
      console.error("카페24 API 에러:", data);
      return res.status(response.status).json({
        error: "API 호출 실패",
        details: data,
        status: response.status,
      });
    }

    console.log("API 성공");
    return res.status(200).json(data);
  } catch (error) {
    console.error("=== Products API 서버 에러 ===");
    console.error("에러:", error);
    console.error("스택:", error.stack);

    return res.status(500).json({
      error: "서버 오류",
      message: error.message,
    });
  }
}
