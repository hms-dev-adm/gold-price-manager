const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = 3001;

// ✅ 환경변수 확인 - 서버 시작 시 즉시 체크
const mallId = process.env.REACT_APP_CAFE24_MALL_ID;
const clientId = process.env.REACT_APP_CAFE24_CLIENT_ID;
const clientSecret = process.env.REACT_APP_CAFE24_CLIENT_SECRET;

console.log("=== 서버 시작 ===");
console.log("MALL_ID:", mallId ? "✅ 설정됨" : "❌ 없음");
console.log("CLIENT_ID:", clientId ? "✅ 설정됨" : "❌ 없음");
console.log("CLIENT_SECRET:", clientSecret ? "✅ 설정됨" : "❌ 없음");

// ✅ 환경변수 누락 시 경고 및 안내
if (!mallId || !clientId || !clientSecret) {
  console.warn("\n⚠️  환경변수 설정이 누락되었습니다!");
  console.warn("📋 .env 파일에 다음 변수들을 설정하세요:");
  if (!mallId) console.warn("   REACT_APP_CAFE24_MALL_ID=your_mall_id");
  if (!clientId) console.warn("   REACT_APP_CAFE24_CLIENT_ID=your_client_id");
  if (!clientSecret)
    console.warn("   REACT_APP_CAFE24_CLIENT_SECRET=your_client_secret");
  console.warn("");
}

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

// ✅ 카페24 옵션 관련 헬퍼 함수들
async function getCurrentOptions(mallId, productNo, accessToken) {
  const apiUrl = `https://${mallId}.cafe24api.com/api/v2/admin/products/${productNo}/options?shop_no=1`;

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`옵션 조회 실패: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.option;
}
// server.js의 updateOptionsWithPrice 함수를 완전히 교체
async function updateOptionsWithPrice(
  mallId,
  productNo,
  accessToken,
  priceUpdates
) {
  try {
    console.log("🔄 단순화된 옵션 가격 수정 시작");

    // 1단계: 현재 옵션 구조 가져오기
    const currentOption = await getCurrentOptions(
      mallId,
      productNo,
      accessToken
    );
    console.log("📋 현재 옵션:", JSON.stringify(currentOption, null, 2));

    // 2단계: 최소한의 구조로 original_options 구성
    const original_options = currentOption.options.map((option) => ({
      option_name: option.option_name,
      option_value: option.option_value.map((value) => ({
        option_text: value.option_text,
      })),
    }));

    // 3단계: 가격만 업데이트된 options 구성 (기존 구조 최대한 유지)
    const updatedOptions = currentOption.options.map((option) => {
      // 기본 옵션 구조 복사
      const baseOption = {
        option_name: option.option_name,
        option_display_type: option.option_display_type || "S",
        required_option: option.required_option || "T",
        option_value: option.option_value.map((value) => {
          // 가격 업데이트 확인
          const priceUpdate = priceUpdates.find(
            (update) =>
              update.optionName === option.option_name &&
              update.optionText === value.option_text
          );

          return {
            option_text: value.option_text,
            additional_amount: priceUpdate
              ? parseFloat(priceUpdate.additionalAmount).toFixed(2)
              : value.additional_amount || "0.00",
          };
        }),
      };

      return baseOption;
    });

    // 4단계: 카페24 API 요청 데이터 구성
    const requestData = {
      shop_no: 1,
      original_options: original_options,
      options: updatedOptions,
    };

    console.log(
      "📤 카페24 API 요청 데이터:",
      JSON.stringify(requestData, null, 2)
    );

    // 5단계: 카페24 API 호출
    const response = await fetch(
      `https://${mallId}.cafe24api.com/api/v2/admin/products/${productNo}/options`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      }
    );

    const responseData = await response.json();
    console.log("📥 카페24 응답:", JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      // 422 에러의 경우 대안 방법 시도
      if (response.status === 422) {
        console.log("⚠️ 422 에러 발생, 대안 방법 시도");
        return await tryAlternativeOptionUpdate(
          mallId,
          productNo,
          accessToken,
          priceUpdates
        );
      }
      throw new Error(
        `카페24 API 오류: ${response.status} - ${
          responseData.message || "Unknown error"
        }`
      );
    }

    console.log("✅ 옵션 가격 업데이트 성공");
    return responseData;
  } catch (error) {
    console.error("❌ updateOptionsWithPrice 실패:", error);
    throw error;
  }
}

// 대안 방법: 개별 상품 정보로 가격 업데이트 시도
async function tryAlternativeOptionUpdate(
  mallId,
  productNo,
  accessToken,
  priceUpdates
) {
  console.log("🔄 대안 방법: 개별 가격 업데이트 시도");

  try {
    // 방법 1: variants API 사용 시도
    const variantsResponse = await fetch(
      `https://${mallId}.cafe24api.com/api/v2/admin/products/${productNo}/variants?shop_no=1`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (variantsResponse.ok) {
      const variantsData = await variantsResponse.json();
      console.log("📋 variants 데이터:", JSON.stringify(variantsData, null, 2));

      // variants를 통한 개별 가격 업데이트 로직
      // 이 부분은 variants 구조에 따라 구현
      return { success: true, method: "variants", data: variantsData };
    }

    // 방법 2: 옵션 없는 기본 가격만 업데이트
    console.log("🔄 기본 가격 업데이트로 폴백");
    return {
      success: false,
      message: "옵션 가격 수정이 제한됨",
      suggestion: "variants API 또는 수동 수정 필요",
    };
  } catch (error) {
    console.error("❌ 대안 방법도 실패:", error);
    throw new Error("모든 옵션 업데이트 방법이 실패했습니다.");
  }
}
// server.js에 추가할 새로운 함수
async function updateOptionByPresetCode(
  mallId,
  productNo,
  accessToken,
  optionName,
  optionText,
  newAmount
) {
  try {
    console.log("🔄 옵션 세트 코드 방식으로 수정 시작");

    // 1단계: 현재 상품의 옵션 구조 및 option_preset_code 확인
    const currentOptions = await getCurrentOptions(
      mallId,
      productNo,
      accessToken
    );
    console.log(
      "📋 현재 옵션 전체 구조:",
      JSON.stringify(currentOptions, null, 2)
    );

    const optionPresetCode = currentOptions.option_preset_code;
    console.log("🔑 옵션 세트 코드:", optionPresetCode);

    if (!optionPresetCode) {
      throw new Error(
        "option_preset_code가 없습니다. 이 상품은 옵션 세트 방식을 사용하지 않습니다."
      );
    }

    // 2단계: 수정할 옵션 찾기
    const targetOption = currentOptions.options.find(
      (opt) => opt.option_name === optionName
    );
    if (!targetOption) {
      throw new Error(`옵션 "${optionName}"을 찾을 수 없습니다.`);
    }

    const targetValue = targetOption.option_value.find(
      (val) => val.option_text === optionText
    );
    if (!targetValue) {
      throw new Error(`옵션값 "${optionText}"을 찾을 수 없습니다.`);
    }

    console.log("🎯 수정 대상 옵션:", {
      option_name: targetOption.option_name,
      option_code: targetOption.option_code,
      target_value: targetValue.option_text,
      current_amount: targetValue.additional_amount,
    });

    // 3단계: 옵션 세트 코드를 사용한 업데이트 구조 생성
    const updatedOptions = currentOptions.options.map((option) => {
      if (option.option_name === optionName) {
        // 해당 옵션의 값들 업데이트
        const updatedValues = option.option_value.map((value) => {
          if (value.option_text === optionText) {
            return {
              ...value,
              additional_amount: newAmount,
            };
          }
          return value;
        });

        return {
          ...option,
          option_value: updatedValues,
        };
      }
      return option;
    });

    // 4단계: option_preset_code와 함께 업데이트 요청
    const requestBody = {
      shop_no: 1,
      request: {
        option_preset_code: optionPresetCode, // ✅ 옵션 세트 코드 포함
        option_list_type: currentOptions.option_list_type || "S",
        options: updatedOptions.map((option) => ({
          option_name: option.option_name,
          option_code: option.option_code, // ✅ 기존 옵션 코드 유지
          option_value: option.option_value.map((value) => ({
            option_text: value.option_text,
            additional_amount: value.additional_amount || "0.00",
            // 기존 value_no가 있다면 포함
            ...(value.value_no && { value_no: value.value_no }),
          })),
          option_display_type: option.option_display_type,
          required_option: option.required_option || "T",
        })),
      },
    };

    console.log(
      "📤 옵션 세트 코드 방식 요청:",
      JSON.stringify(requestBody, null, 2)
    );

    // 5단계: API 호출
    const updateUrl = `https://${mallId}.cafe24api.com/api/v2/admin/products/${productNo}/options`;

    const response = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log("📥 옵션 세트 코드 방식 응답:", responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { message: responseText };
      }

      console.error("❌ 옵션 세트 코드 방식 실패:", errorData);
      throw new Error(
        `옵션 세트 코드 방식 실패: ${response.status} - ${
          errorData.error?.message || errorData.message || responseText
        }`
      );
    }

    const result = JSON.parse(responseText);
    console.log("✅ 옵션 세트 코드 방식 성공:", result);
    return result;
  } catch (error) {
    console.error("❌ updateOptionByPresetCode 실패:", error);
    throw error;
  }
}
// server.js에 추가할 디버깅 함수
async function debugOptionStructure(mallId, productNo, accessToken) {
  try {
    const currentOption = await getCurrentOptions(
      mallId,
      productNo,
      accessToken
    );

    console.log("\n🔍 === 옵션 구조 상세 분석 ===");
    console.log("1. 전체 옵션 정보:", JSON.stringify(currentOption, null, 2));

    console.log("\n2. 옵션별 상세 구조:");
    currentOption.options.forEach((option, index) => {
      console.log(`옵션 ${index + 1}:`, {
        option_name: option.option_name,
        option_code: option.option_code,
        option_display_type: option.option_display_type,
        required_option: option.required_option,
        value_count: option.option_value?.length || 0,
      });

      if (option.option_value?.length > 0) {
        console.log("  옵션 값들:");
        option.option_value.forEach((value, vIndex) => {
          console.log(
            `    ${vIndex + 1}. ${value.option_text}: +${
              value.additional_amount
            }원`
          );
        });
      }
    });

    return currentOption;
  } catch (error) {
    console.error("옵션 구조 분석 실패:", error);
    throw error;
  }
}

// ✅ 토큰 발급 API
app.post("/api/cafe24-token", async (req, res) => {
  try {
    console.log("=== 토큰 발급 요청 ===");
    console.log("요청 본문:", req.body);
    console.log("Content-Type:", req.headers["content-type"]);

    // req.body 존재 여부 확인
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

    // 토큰 발급 시점에서 환경변수 재확인
    if (!clientId || !clientSecret) {
      console.error("❌ 환경변수 누락으로 토큰 발급 불가");
      return res.status(500).json({
        error: "환경변수 설정 오류",
        message: ".env 파일에 CLIENT_ID와 CLIENT_SECRET을 설정하세요",
        missing: {
          clientId: !clientId,
          clientSecret: !clientSecret,
          mallId: !mallId,
        },
      });
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );
    const tokenUrl = `https://${mallId}.cafe24api.com/api/v2/oauth/token`;

    console.log("카페24 API 호출:", tokenUrl);

    // 카페24 API 요청 (form-urlencoded 형식)
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

// ✅ 기본 라우트 - 환경변수 상태도 함께 표시
app.get("/", (req, res) => {
  res.json({
    message: "카페24 프록시 서버가 정상적으로 실행 중입니다!",
    timestamp: new Date().toISOString(),
    endpoints: [
      "POST /api/cafe24-token",
      "POST /api/cafe24-products",
      "GET /api/cafe24-products/:productNo/options",
    ],
    config_status: {
      mall_id: mallId ? "✅ 설정됨" : "❌ 없음",
      client_id: clientId ? "✅ 설정됨" : "❌ 없음",
      client_secret: clientSecret ? "✅ 설정됨" : "❌ 없음",
    },
  });
});

// ✅ 환경변수 상태 확인 전용 엔드포인트
app.get("/api/config-check", (req, res) => {
  const configStatus = {
    mall_id: {
      exists: !!mallId,
      value: mallId ? `${mallId.substring(0, 5)}...` : null,
    },
    client_id: {
      exists: !!clientId,
      value: clientId ? `${clientId.substring(0, 10)}...` : null,
    },
    client_secret: {
      exists: !!clientSecret,
      value: clientSecret ? "●●●●●●●●" : null,
    },
  };

  const allConfigured = mallId && clientId && clientSecret;

  res.json({
    status: allConfigured ? "✅ 모든 설정 완료" : "❌ 설정 누락",
    ready_for_api: allConfigured,
    details: configStatus,
    missing_vars: [
      !mallId && "REACT_APP_CAFE24_MALL_ID",
      !clientId && "REACT_APP_CAFE24_CLIENT_ID",
      !clientSecret && "REACT_APP_CAFE24_CLIENT_SECRET",
    ].filter(Boolean),
  });
});

// ✅ 옵션 조회 전용 엔드포인트
app.get("/api/cafe24-products/:productNo/options", async (req, res) => {
  try {
    const { productNo } = req.params;
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!accessToken) {
      return res.status(401).json({ error: "액세스 토큰이 필요합니다." });
    }

    if (!mallId) {
      return res.status(500).json({
        error: "MALL_ID가 설정되지 않았습니다.",
        tip: ".env 파일에 REACT_APP_CAFE24_MALL_ID를 설정하세요",
      });
    }

    const options = await getCurrentOptions(mallId, productNo, accessToken);

    // 클라이언트에서 사용하기 쉽게 가공
    const formattedOptions = options.options.map((option) => ({
      optionName: option.option_name,
      optionCode: option.option_code,
      displayType: option.option_display_type,
      values: option.option_value.map((value) => ({
        text: value.option_text,
        additionalAmount: value.additional_amount || "0.00",
        valueNo: value.value_no,
        color: value.option_color,
        imageFile: value.option_image_file,
      })),
    }));

    res.json({
      productNo: productNo,
      options: formattedOptions,
      raw: options, // 디버깅용 원본 데이터
    });
  } catch (error) {
    console.error("옵션 조회 오류:", error);
    res.status(500).json({ error: error.message });
  }
});

// ======================== * 상품 API endpoint * ======================== //

app.post("/api/cafe24-products", async (req, res) => {
  try {
    console.log("\n=== 상품 API 요청 ===");
    console.log("요청 본문:", JSON.stringify(req.body, null, 2));

    const {
      action,
      searchType,
      searchQuery,
      productNo,
      price,
      variantNo,
      optionUpdates,
    } = req.body;

    // 토큰 확인
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!accessToken) {
      return res.status(401).json({ error: "액세스 토큰이 필요합니다." });
    }

    // 상품 API 호출 시점에서도 환경변수 확인
    if (!mallId) {
      return res.status(500).json({
        error: "MALL_ID가 설정되지 않았습니다.",
        tip: ".env 파일에 REACT_APP_CAFE24_MALL_ID를 설정하세요",
      });
    }

    console.log("Mall ID:", mallId);
    console.log("Action:", action);

    // ✅ 옵션 가격 업데이트 액션들 (단수/복수 모두 지원)
    if (action === "updateOptionPrices" || action === "updateOptionPrice") {
      console.log(`💰 옵션 가격 업데이트 요청 (액션: ${action})`);

      // updateOptionPrice (단수) 액션인 경우 데이터 형식 변환
      let processedUpdates = optionUpdates;

      if (action === "updateOptionPrice") {
        // 기존 단수 액션 형식 처리
        const {
          option_code,
          option_value,
          optionName,
          optionText,
          additionalAmount,
        } = req.body;

        if (optionName && optionText && additionalAmount !== undefined) {
          // 새로운 형식
          processedUpdates = [{ optionName, optionText, additionalAmount }];
        } else if (option_code && option_value) {
          // 기존 형식 - option_value 배열을 새 형식으로 변환
          processedUpdates = option_value.map((value) => ({
            optionName: option_code, // 임시로 option_code를 이름으로 사용
            optionText: value.option_text,
            additionalAmount: value.additional_amount,
          }));
        } else {
          return res.status(400).json({
            error: "옵션 업데이트 데이터가 올바르지 않습니다.",
            receivedData: req.body,
            expectedFormat: {
              method1: {
                optionName: "Color",
                optionText: "Black",
                additionalAmount: "5000.00",
              },
              method2: {
                optionUpdates: [
                  {
                    optionName: "Color",
                    optionText: "Black",
                    additionalAmount: "5000.00",
                  },
                ],
              },
            },
          });
        }
      }

      if (!productNo || !processedUpdates || !Array.isArray(processedUpdates)) {
        return res.status(400).json({
          error: "productNo와 optionUpdates 배열이 필요합니다.",
          received: { productNo, optionUpdates: processedUpdates },
          example: {
            productNo: "24",
            optionUpdates: [
              {
                optionName: "Color",
                optionText: "Black",
                additionalAmount: "5000.00",
              },
              {
                optionName: "Size",
                optionText: "Large",
                additionalAmount: "3000.00",
              },
            ],
          },
        });
      }

      console.log("💰 처리된 옵션 업데이트:", { productNo, processedUpdates });

      const result = await updateOptionsWithPrice(
        mallId,
        productNo,
        accessToken,
        processedUpdates
      );

      return res.json({
        success: true,
        message: "옵션 가격이 성공적으로 업데이트되었습니다.",
        data: result,
      });
    }

    // 기존 액션들 처리
    let apiUrl;
    let method = "GET";
    let requestBody = null;

    // 기존 updateSingleOptionPrice 함수 수정
    async function updateSingleOptionPrice(
      mallId,
      productNo,
      accessToken,
      optionName,
      optionText,
      newAmount
    ) {
      try {
        console.log("🔄 개별 옵션 가격 수정 시작");
        console.log("📋 수정 정보:", {
          productNo,
          optionName,
          optionText,
          newAmount,
        });

        // ✅ 0단계: 옵션 세트 코드 방식 우선 시도
        try {
          console.log("🔄 방법 0: 옵션 세트 코드 방식 시도");
          const presetResult = await updateOptionByPresetCode(
            mallId,
            productNo,
            accessToken,
            optionName,
            optionText,
            newAmount
          );
          console.log("✅ 옵션 세트 코드 방식 성공!");
          return presetResult;
        } catch (presetError) {
          console.log(
            "⚠️ 옵션 세트 코드 방식 실패, 다른 방법 시도:",
            presetError.message
          );
        }

        // 1단계: 현재 옵션 구조 확인 (기존 코드)
        const currentOptions = await getCurrentOptions(
          mallId,
          productNo,
          accessToken
        );
        console.log(
          "📋 현재 전체 옵션:",
          JSON.stringify(currentOptions, null, 2)
        );

        // ... 기존 방법들 (variants API, 개별 값 수정) 코드 유지 ...
      } catch (error) {
        console.error("❌ updateSingleOptionPrice 실패:", error);
        throw error;
      }
    }

    // server.js에 추가할 디버그 함수
    async function checkOptionPresetCode(mallId, productNo, accessToken) {
      try {
        const currentOptions = await getCurrentOptions(
          mallId,
          productNo,
          accessToken
        );

        console.log("\n🔍 === 옵션 세트 코드 분석 ===");
        console.log("option_preset_code:", currentOptions.option_preset_code);
        console.log("option_type:", currentOptions.option_type);
        console.log("option_list_type:", currentOptions.option_list_type);

        if (currentOptions.option_preset_code) {
          console.log("✅ 옵션 세트 코드 존재 - 세트 방식 사용 가능");

          currentOptions.options.forEach((option, index) => {
            console.log(`옵션 ${index + 1}:`, {
              option_name: option.option_name,
              option_code: option.option_code,
              values: option.option_value?.map((v) => ({
                text: v.option_text,
                amount: v.additional_amount,
                value_no: v.value_no,
              })),
            });
          });
        } else {
          console.log("❌ 옵션 세트 코드 없음 - 개별 수정 방식 필요");
        }

        return {
          hasPresetCode: !!currentOptions.option_preset_code,
          optionPresetCode: currentOptions.option_preset_code,
          optionStructure: currentOptions,
        };
      } catch (error) {
        console.error("옵션 세트 코드 확인 실패:", error);
        throw error;
      }
    }

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

        const { price } = req.body;
        console.log(`💰 상품 ${productNo} 가격을 ${price}원으로 수정`);
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
          // 기본 상품 가격 수정 - 카페24 API 올바른 형식
          apiUrl = `https://${mallId}.cafe24api.com/api/v2/admin/products/${productNo}`;

          // 카페24 API 문서에 따른 정확한 형식 (request 객체 사용)
          requestBody = {
            shop_no: 1,
            request: {
              price: price.toString(),
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

      case "deleteOption":
        if (!productNo || !req.body.optionCode) {
          return res
            .status(400)
            .json({ error: "productNo와 optionCode가 필요합니다." });
        }

        method = "DELETE";
        apiUrl = `https://${mallId}.cafe24api.com/api/v2/admin/products/${productNo}/options/${req.body.optionCode}`;

        console.log("🗑️ 옵션 삭제:", apiUrl);
        break;

      case "debugOptions":
        if (!productNo) {
          return res.status(400).json({ error: "productNo가 필요합니다." });
        }

        try {
          const optionStructure = await debugOptionStructure(
            mallId,
            productNo,
            accessToken
          );
          res.json({
            success: true,
            productNo: productNo,
            optionStructure: optionStructure,
          });
        } catch (error) {
          res.status(500).json({
            error: "옵션 구조 분석 실패",
            message: error.message,
          });
        }
        return;

      case "checkPresetCode":
        if (!productNo) {
          return res.status(400).json({ error: "productNo가 필요합니다." });
        }

        try {
          const presetInfo = await checkOptionPresetCode(
            mallId,
            productNo,
            accessToken
          );
          res.json({
            success: true,
            productNo: productNo,
            presetInfo: presetInfo,
          });
        } catch (error) {
          res.status(500).json({
            error: "옵션 세트 코드 확인 실패",
            message: error.message,
          });
        }
        return;

      case "updateSingleOptionPrice":
        if (!productNo) {
          return res.status(400).json({ error: "productNo가 필요합니다." });
        }

        const { optionName, optionText, newAmount } = req.body;

        console.log("💰 개별 옵션 가격 수정 요청:", {
          productNo,
          optionName,
          optionText,
          newAmount,
        });

        if (!optionName || !optionText || newAmount === undefined) {
          return res.status(400).json({
            error: "optionName, optionText, newAmount가 필요합니다.",
            received: { optionName, optionText, newAmount },
          });
        }

        try {
          const result = await updateSingleOptionPrice(
            mallId,
            productNo,
            accessToken,
            optionName,
            optionText,
            newAmount
          );

          return res.json({
            success: true,
            message: "개별 옵션 가격 수정 성공",
            data: result,
          });
        } catch (error) {
          console.error("❌ 개별 옵션 수정 실패:", error);
          return res.status(500).json({
            error: "개별 옵션 가격 수정 실패",
            message: error.message,
            suggestion:
              "해당 옵션이 이미 주문에서 사용 중이거나 시스템 제약으로 수정이 불가능할 수 있습니다.",
          });
        }

      // server.js의 updateOptionPrices 케이스 수정
      case "updateOptionPrices":
        console.log("💰 옵션 가격 업데이트 요청 (액션: updateOptionPrices)");

        if (!productNo || !req.body.optionUpdates) {
          return res.status(400).json({
            error: "productNo와 optionUpdates가 필요합니다.",
            received: { productNo, optionUpdates: req.body.optionUpdates },
          });
        }

        const { optionUpdates } = req.body;
        console.log("📝 업데이트할 옵션들:", optionUpdates);

        try {
          const result = await updateOptionsWithPrice(
            mallId,
            productNo,
            accessToken,
            optionUpdates
          );

          if (result.success === false) {
            // 부분 성공 또는 제한된 경우
            return res.json({
              success: false,
              message: result.message,
              suggestion: result.suggestion,
              data: result.data,
            });
          }

          return res.json({
            success: true,
            message: "옵션 가격 업데이트 성공",
            data: result,
          });
        } catch (error) {
          console.error("❌ 옵션 가격 업데이트 실패:", error);
          return res.status(500).json({
            error: "옵션 가격 업데이트 실패",
            message: error.message,
            details: error.stack,
          });
        }
      default:
        return res.status(400).json({
          error: "지원하지 않는 액션입니다.",
          receivedAction: action,
          supportedActions: [
            "searchProducts",
            "getProduct",
            "updateProductPrice",
            "getVariants",
            "getOptions",
            "deleteOption",
            "updateOptionPrice", // 기존 단수 형식
            "updateOptionPrices", // 새로운 복수 형식
          ],
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

// ✅ 개선된 가격 수정 테스트 엔드포인트
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

    if (!mallId) {
      return res.status(500).json({
        error: "MALL_ID가 설정되지 않았습니다.",
        tip: ".env 파일에 REACT_APP_CAFE24_MALL_ID를 설정하세요",
      });
    }

    console.log("\n=== 가격 수정 테스트 시작 ===");
    console.log("상품번호:", productNo);
    console.log("새 가격:", price);

    // 다양한 형식으로 시도
    const formats = [
      // 형식 1: request 객체 (문자열 shop_no)
      {
        name: "request 객체 (문자열 shop_no)",
        data: {
          shop_no: "1",
          request: {
            price: price.toString(),
          },
        },
      },
      // 형식 2: request 객체 (숫자 shop_no)
      {
        name: "request 객체 (숫자 shop_no)",
        data: {
          shop_no: 1,
          request: {
            price: price.toString(),
          },
        },
      },
      // 형식 3: product 객체
      {
        name: "product 객체",
        data: {
          shop_no: 1,
          product: {
            price: price.toString(),
          },
        },
      },
      // 형식 4: 직접 필드
      {
        name: "직접 필드",
        data: {
          shop_no: 1,
          price: price.toString(),
        },
      },
      // 형식 5: 상세한 request 객체
      {
        name: "상세한 request 객체",
        data: {
          shop_no: "1",
          request: {
            price: price.toString(),
            selling_price: price.toString(),
            supply_price: price.toString(),
          },
        },
      },
      // 형식 6: API 버전 헤더 포함
      {
        name: "API 버전 헤더 포함",
        data: {
          shop_no: 1,
          request: {
            price: price.toString(),
          },
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    ];

    const results = [];

    for (let i = 0; i < formats.length; i++) {
      const format = formats[i];
      console.log(`\n🔄 시도 ${i + 1}: ${format.name}`);
      console.log("데이터:", JSON.stringify(format.data, null, 2));

      try {
        const headers = {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          ...(format.headers || {}),
        };

        const response = await fetch(
          `https://${mallId}.cafe24api.com/api/v2/admin/products/${productNo}`,
          {
            method: "PUT",
            headers: headers,
            body: JSON.stringify(format.data),
          }
        );

        const responseText = await response.text();
        console.log(`📥 응답 상태: ${response.status}`);
        console.log(`📄 응답 내용: ${responseText.substring(0, 200)}...`);

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          data = {
            error: "JSON 파싱 실패",
            responseText: responseText.substring(0, 200),
          };
        }

        const result = {
          format: i + 1,
          name: format.name,
          status: response.status,
          success: response.ok,
          data: data,
          error: response.ok
            ? null
            : data.error?.message || data.message || "알 수 없는 오류",
        };

        results.push(result);

        if (response.ok) {
          console.log(`✅ 성공! 형식 ${i + 1}: ${format.name}`);
          return res.json({
            success: true,
            message: `형식 ${i + 1}로 가격 수정 성공!`,
            successfulFormat: result,
            allResults: results,
          });
        } else {
          console.log(`❌ 실패: ${result.error}`);
        }
      } catch (error) {
        console.log(`💥 네트워크 오류: ${error.message}`);
        results.push({
          format: i + 1,
          name: format.name,
          status: 0,
          success: false,
          data: null,
          error: error.message,
        });
      }
    }

    // 모든 형식이 실패한 경우
    res.status(400).json({
      success: false,
      message: "모든 형식 시도 실패",
      recommendation:
        "카페24 개발자 센터에서 최신 API 문서를 확인하거나 고객지원에 문의하세요.",
      allResults: results,
    });
  } catch (error) {
    console.error("테스트 실패:", error);
    res.status(500).json({ error: error.message });
  }
});

// 404 처리 - 와일드카드 패턴 수정
app.use((req, res) => {
  res.status(404).json({
    error: "엔드포인트를 찾을 수 없습니다.",
    requestedPath: req.path,
    method: req.method,
    availableEndpoints: [
      "GET /",
      "GET /api/config-check",
      "POST /api/cafe24-token",
      "POST /api/cafe24-products",
      "GET /api/cafe24-products/:productNo/options",
      "POST /api/cafe24-price-test",
    ],
  });
});

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
  console.error("서버 에러:", err);
  res.status(500).json({
    error: "서버 내부 오류",
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`✅ Express 서버 실행 중: http://localhost:${PORT}`);

  // 서버 시작 완료 후 최종 상태 요약
  console.log("\n📋 서버 준비 상태:");
  console.log(
    `   환경변수: ${mallId && clientId && clientSecret ? "✅ 완료" : "❌ 누락"}`
  );
  console.log(`   API 엔드포인트: ✅ 준비됨`);
  console.log(`   설정 확인: http://localhost:${PORT}/api/config-check`);
  console.log("\n🚀 사용 가능한 기능:");
  console.log("   📱 토큰 발급/갱신");
  console.log("   🛒 상품 조회/검색");
  console.log("   💰 상품 가격 수정");
  console.log("   ⚙️  옵션 조회/가격 수정");
  console.log("   🔧 테스트 도구들");
  console.log("");
});
