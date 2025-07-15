// api/cafe24-token.js
export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // OPTIONS 요청 처리 (preflight)
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // POST 요청만 허용
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { grant_type, code, refresh_token, redirect_uri } = req.body;

    if (!grant_type) {
      return res.status(400).json({ error: "grant_type이 필요합니다." });
    }

    // authorization_code 방식일 때 code 필요
    if (grant_type === "authorization_code" && !code) {
      return res.status(400).json({ error: "인증 코드가 필요합니다." });
    }

    // refresh_token 방식일 때 refresh_token 필요
    if (grant_type === "refresh_token" && !refresh_token) {
      return res.status(400).json({ error: "refresh_token이 필요합니다." });
    }

    const mallId = process.env.CAFE24_MALL_ID || "gongbang301";
    const clientId = process.env.CAFE24_CLIENT_ID;
    const clientSecret = process.env.CAFE24_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res
        .status(500)
        .json({ error: "서버 설정 오류: 클라이언트 정보가 없습니다." });
    }

    // Base64 인코딩 (카페24 정책에 따라)
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );
    const tokenUrl = `https://${mallId}.cafe24api.com/api/v2/oauth/token`;

    console.log("토큰 요청:", {
      tokenUrl,
      grant_type,
      code: code ? code.substring(0, 10) + "..." : undefined,
      has_refresh_token: !!refresh_token,
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

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("토큰 발급/갱신 실패:", data);
      return res.status(response.status).json({
        error: "토큰 발급/갱신 실패",
        details: data,
      });
    }

    console.log("토큰 발급/갱신 성공");
    res.status(200).json(data);
  } catch (error) {
    console.error("API 오류:", error);
    res.status(500).json({
      error: "서버 오류",
      message: error.message,
    });
  }
}
