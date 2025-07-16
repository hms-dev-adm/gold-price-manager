// src/setupProxy.js
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // 카페24 API 프록시 설정
  app.use(
    "/api/cafe24",
    createProxyMiddleware({
      target: "https://gongbang301.cafe24api.com",
      changeOrigin: true,
      secure: true,
      pathRewrite: {
        "^/api/cafe24": "", // /api/cafe24 제거
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log(" 프록시 요청:", req.method, req.url);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log("프록시 응답:", proxyRes.statusCode);
      },
      onError: (err, req, res) => {
        console.error("프록시 에러:", err.message);
      },
    })
  );

  // 상품 API를 위한 임시 프록시 (개발 환경에서만)
  app.use(
    "/api/cafe24-products",
    createProxyMiddleware({
      target: "http://localhost:3001", // 임시 로컬 서버
      changeOrigin: true,
      secure: false,
      onError: (err, req, res) => {
        console.error("❌ Products 프록시 에러, 직접 처리:", err.message);
        // 프록시 실패 시 에러 응답
        res.status(500).json({
          error: "개발 환경에서는 Vercel 배포 후 테스트해주세요.",
          message: err.message,
        });
      },
    })
  );
};
