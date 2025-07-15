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
        console.log("🔄 프록시 요청:", req.method, req.url);
        console.log(
          "🎯 실제 요청 URL:",
          proxyReq.getHeader("host") + proxyReq.path
        );
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log("📥 프록시 응답:", proxyRes.statusCode);
      },
      onError: (err, req, res) => {
        console.error("❌ 프록시 에러:", err.message);
        res.status(500).json({ error: "프록시 에러", message: err.message });
      },
    })
  );
};
