const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // 모든 /api 요청을 localhost:3001로 프록시
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:3001",
      changeOrigin: true,
      secure: false,
      logLevel: "debug",
      onProxyReq: (proxyReq, req, res) => {
        console.log("🔄 프록시 요청:", req.method, req.url);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log("📥 프록시 응답:", proxyRes.statusCode);
      },
      onError: (err, req, res) => {
        console.error("❌ 프록시 에러:", err.message);
        res
          .status(500)
          .json({ error: "프록시 서버 에러", message: err.message });
      },
    })
  );
};
