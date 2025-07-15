// src/setupProxy.js
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api/cafe24",
    createProxyMiddleware({
      target: "https://gongbang301.cafe24api.com",
      changeOrigin: true,
      secure: true,
      pathRewrite: {
        "^/api/cafe24": "", // /api/cafe24를 제거하고 요청
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log("프록시 요청:", req.method, req.url);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log("프록시 응답:", proxyRes.statusCode);
      },
      onError: (err, req, res) => {
        console.error("프록시 에러:", err);
      },
    })
  );
};
