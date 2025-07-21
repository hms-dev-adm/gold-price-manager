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
