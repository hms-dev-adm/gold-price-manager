// api/cafe24-token.js
export default async function handler(req, res) {
  try {
    console.log("=== API 함수 시작 ===");
    console.log("Method:", req.method);
    console.log("URL:", req.url);

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

    // OPTIONS 요청 처리 (preflight)
    if (req.method === "OPTIONS") {
      console.log("OPTIONS 요청 처리");
      return res.status(200).end();
    }

    // GET 요청 - 테스트용
    if (req.method === "GET") {
      console.log("GET 요청 처리");
      return res.status(200).json({
        message: "Cafe24 Token API is working!",
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
      });
    }

    // POST 요청만 허용
    if (req.method !== "POST") {
      console.log("허용되지 않는 메소드:", req.method);
      return res.status(405).json({ error: "Method not allowed" });
    }

    console.log("POST 요청 처리 시작");
    console.log("Request body:", req.body);

    // 요청 body 확인
    if (!req.body) {
      console.log("Request body가 없음");
      return res.status(400).json({ error: "Request body is required" });
    }

    const { grant_type, code, refresh_token, redirect_uri } = req.body;

    console.log("파라미터 확인:", {
      grant_type,
      hasCode: !!code,
      hasRefreshToken: !!refresh_token,
      redirect_uri,
    });

    if (!grant_type) {
      console.log("grant_type이 없음");
      return res.status(400).json({ error: "grant_type이 필요합니다." });
    }

    // authorization_code 방식일 때 code 필요
    if (grant_type === "authorization_code" && !code) {
      console.log("authorization_code 방식인데 code가 없음");
      return res.status(400).json({ error: "인증 코드가 필요합니다." });
    }

    // refresh_token 방식일 때 refresh_token 필요
    if (grant_type === "refresh_token" && !refresh_token) {
      console.log("refresh_token 방식인데 refresh_token이 없음");
      return res.status(400).json({ error: "refresh_token이 필요합니다." });
    }

    // 환경 변수 확인
    const mallId = process.env.CAFE24_MALL_ID || "gongbang301";
    const clientId = process.env.CAFE24_CLIENT_ID;
    const clientSecret = process.env.CAFE24_CLIENT_SECRET;

    console.log("환경 변수 확인:", {
      mallId,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
    });

    if (!clientId || !clientSecret) {
      console.log("클라이언트 정보가 없음");
      return res.status(500).json({
        error: "서버 설정 오류: 클라이언트 정보가 없습니다.",
        debug: {
          mallId,
          hasClientId: !!clientId,
          hasClientSecret: !!clientSecret,
        },
      });
    }

    // Base64 인코딩
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );
    const tokenUrl = `https://${mallId}.cafe24api.com/api/v2/oauth/token`;

    console.log("카페24 API 호출 준비:", {
      tokenUrl,
      credentialsLength: credentials.length,
    });

    // URLSearchParams로 form-urlencoded 형식 생성
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

    console.log("폼 데이터:", formData.toString());

    // 카페24 API 호출
    console.log("카페24 API 호출 시작");
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Cafe24-Api-Version": "2024-12-01",
      },
      body: formData.toString(),
    });

    console.log("카페24 API 응답 상태:", response.status);

    const responseText = await response.text();
    console.log("카페24 API 응답 텍스트:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON 파싱 에러:", parseError);
      return res.status(500).json({
        error: "API 응답 파싱 실패",
        responseText,
        parseError: parseError.message,
      });
    }

    if (!response.ok) {
      console.error("카페24 API 에러:", data);
      return res.status(response.status).json({
        error: "토큰 발급/갱신 실패",
        details: data,
        status: response.status,
      });
    }

    console.log("토큰 발급/갱신 성공");
    return res.status(200).json(data);
  } catch (error) {
    console.error("=== 함수 실행 중 에러 ===");
    console.error("에러 메시지:", error.message);
    console.error("스택 트레이스:", error.stack);

    return res.status(500).json({
      error: "서버 내부 오류",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
