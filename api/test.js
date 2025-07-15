// api/test.js
export default function handler(req, res) {
  res.status(200).json({
    message: "API Routes 테스트 성공!",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    headers: req.headers,
  });
}
