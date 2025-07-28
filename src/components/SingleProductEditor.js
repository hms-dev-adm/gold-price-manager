import React, { useState } from "react";
import styled from "styled-components";

// 전문적이고 미니멀한 스타일링
const Container = styled.div`
  max-width: 1024px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #333;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #000;
`;

const SearchSection = styled.section`
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #000;
`;

const SearchTypeGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const RadioButton = styled.label`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border: 1px solid ${(props) => (props.$checked ? "#000" : "#e5e5e5")};
  background: ${(props) => (props.$checked ? "#000" : "#fff")};
  color: ${(props) => (props.$checked ? "#fff" : "#666")};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  input {
    display: none;
  }

  &:hover {
    border-color: #000;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #000;
  }

  &::placeholder {
    color: #999;
  }
`;

const ResultsSection = styled.section`
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 24px;
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 16px;
`;

const ProductCard = styled.div`
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: #999;
  }
`;

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const ProductMeta = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  background: ${(props) => (props.$active ? "#e0f2fe" : "#f3f4f6")};
  color: ${(props) => (props.$active ? "#0369a1" : "#6b7280")};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  background: #fff;
  color: #666;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #fafafa;
    border-color: #000;
    color: #000;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;

  h3 {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px;
    color: #333;
  }

  p {
    font-size: 14px;
  }
`;

// 옵션 스타일 추가
const OptionsSection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;
`;

const OptionGroup = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const OptionTitle = styled.h4`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
`;

const PriceEditForm = styled.form`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PriceInput = styled.input`
  width: 120px;
  padding: 6px 10px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 13px;
  text-align: right;

  &:focus {
    outline: none;
    border-color: #000;
  }
`;

const SuccessMessage = styled.div`
  background: #d1fae5;
  border: 1px solid #6ee7b7;
  color: #065f46;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  margin-top: 8px;
`;

const LoadingSpinner = styled.span`
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 8px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const SearchButton = styled.button`
  background: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background: #333;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const BasicPriceSection = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

//옵션
const OptionSetContainer = styled.div`
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 16px;
  margin-top: 12px;
`;

const OptionSetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const OptionSetTitle = styled.h5`
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
`;

const OptionValueGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
`;

const OptionValueCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 10px;
  font-size: 12px;
`;

const OptionValueName = styled.div`
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 4px;
`;

const SearchInputGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ProductPrice = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #000;
  margin-bottom: 8px;
`;
const OptionToggleButton = styled.button`
  background: #f8f9fa;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  color: #333;

  &:hover {
    background: #e9ecef;
  }
`;

const PriceDifference = styled.span`
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  white-space: nowrap;

  ${(props) =>
    props.$isIncrease
      ? `
    background: #fff3cd;
    color: #856404;
  `
      : props.$isDecrease
      ? `
    background: #cce7ff;
    color: #004085;
  `
      : `
    color: #666;
  `}
`;

const ProductSearchPage = () => {
  const [searchType, setSearchType] = useState("model");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedProducts, setExpandedProducts] = useState({});

  // 가격 수정 관련 상태
  const [editingPrices, setEditingPrices] = useState({});
  const [savingPrices, setSavingPrices] = useState({});
  const [priceUpdateSuccess, setPriceUpdateSuccess] = useState({});

  // 검색 실행
  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setError("검색어를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSearchResults([]);
    setExpandedProducts({});

    try {
      const accessToken = localStorage.getItem("cafe24_access_token");
      const tokenExpires = localStorage.getItem("cafe24_token_expires");

      if (
        !accessToken ||
        !tokenExpires ||
        Date.now() >= parseInt(tokenExpires)
      ) {
        throw new Error("토큰이 없거나 만료되었습니다.");
      }

      const requestBody = {
        action: "searchProducts",
        searchType: searchType,
        searchQuery: searchQuery.trim(),
      };

      const response = await fetch("/api/cafe24-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || errorData.error || `HTTP ${response.status}`
        );
      }

      const data = await response.json();
      setSearchResults(data.products || []);

      // 데이터 구조 확인을 위한 로그
      console.log("검색 결과:", data.products);
      if (data.products && data.products.length > 0) {
        console.log("첫 번째 상품의 옵션:", data.products[0].options);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      performSearch();
    }
  };

  // 옵션 토글
  const toggleOptions = (productNo) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productNo]: !prev[productNo],
    }));
  };

  // 가격 차이 계산 함수
  const calculatePriceDifference = (currentPrice, newPrice) => {
    const current = parseFloat(currentPrice) || 0;
    const newVal = parseFloat(newPrice) || 0;
    const difference = newVal - current;

    if (difference === 0) return null;

    const percentage = current > 0 ? (difference / current) * 100 : 0;
    const isIncrease = difference > 0;

    return {
      amount: Math.abs(difference),
      percentage: Math.abs(percentage),
      isIncrease,
      isDecrease: difference < 0,
    };
  };

  // 기본 가격 수정 시작
  const startBasicPriceEdit = (productNo, currentPrice) => {
    setEditingPrices((prev) => ({
      ...prev,
      [`basic_${productNo}`]: currentPrice,
    }));
  };

  // 기본 가격 수정 취소
  const cancelBasicPriceEdit = (productNo) => {
    setEditingPrices((prev) => {
      const newState = { ...prev };
      delete newState[`basic_${productNo}`];
      return newState;
    });
  };

  // 기본 가격 저장
  const saveBasicPrice = async (productNo, newPrice) => {
    const key = `basic_${productNo}`;
    setSavingPrices((prev) => ({ ...prev, [key]: true }));

    try {
      const accessToken = localStorage.getItem("cafe24_access_token");

      console.log("💰 가격 수정 요청:", { productNo, newPrice });

      const response = await fetch("/api/cafe24-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: "updateProductPrice",
          productNo: productNo,
          price: newPrice,
        }),
      });

      const result = await response.json();
      console.log("📥 가격 수정 응답:", result);

      if (!response.ok) {
        // 실패한 경우 테스트 엔드포인트로 재시도
        console.log("🔄 기본 방식 실패, 테스트 엔드포인트로 재시도...");

        const testResponse = await fetch("/api/cafe24-price-test", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            productNo: productNo,
            price: newPrice,
          }),
        });

        const testResult = await testResponse.json();
        console.log("📥 테스트 응답:", testResult);

        if (!testResponse.ok) {
          throw new Error(
            testResult.message || result.error || "가격 수정에 실패했습니다."
          );
        }

        // 테스트로 성공한 경우의 결과 사용
        console.log("✅ 테스트 엔드포인트로 성공!");
      }

      // 성공 시 UI 업데이트
      setSearchResults((prev) =>
        prev.map((product) =>
          product.product_no === productNo
            ? {
                ...product,
                price: newPrice,
                // 추가로 selling_price도 업데이트할 수 있음
                selling_price: newPrice,
              }
            : product
        )
      );

      // 편집 상태 제거
      setEditingPrices((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });

      // 성공 메시지 표시
      setPriceUpdateSuccess((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setPriceUpdateSuccess((prev) => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });
      }, 3000);

      // 알림
      alert(
        `가격이 ${parseInt(
          newPrice
        ).toLocaleString()}원으로 성공적으로 수정되었습니다!`
      );
    } catch (error) {
      console.error("❌ 가격 수정 실패:", error);
      alert(
        `가격 수정 실패: ${error.message}\n\n해결 방법:\n1. 토큰이 유효한지 확인\n2. 상품이 수정 가능한 상태인지 확인\n3. 카페24 관리자 권한 확인`
      );
    } finally {
      setSavingPrices((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  // 옵션 추가 금액 수정 시작 (수정된 버전)
  const startOptionPriceEdit = (
    productNo,
    optionName,
    optionText,
    currentAmount
  ) => {
    const key = `option_${productNo}_${optionName}_${optionText}`;
    setEditingPrices((prev) => ({
      ...prev,
      [key]: parseFloat(currentAmount || 0).toString(),
    }));
    console.log("🔧 옵션 가격 수정 시작:", {
      productNo,
      optionName,
      optionText,
      currentAmount,
    });
  };

  // 옵션 추가 금액 수정 취소 (수정된 버전)
  const cancelOptionPriceEdit = (productNo, optionName, optionText) => {
    const key = `option_${productNo}_${optionName}_${optionText}`;
    setEditingPrices((prev) => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
    console.log("❌ 옵션 가격 수정 취소:", {
      productNo,
      optionName,
      optionText,
    });
  };

  const saveOptionPrice = async (
    productNo,
    optionName,
    optionText,
    newAmount
  ) => {
    // 1. 고유 키 생성 (옵션명 + 옵션값으로 식별)
    const optionKey = `${productNo}_${optionName}_${optionText}`;

    console.log("💰 옵션 가격 저장 시작:", {
      productNo,
      optionName,
      optionText,
      newAmount,
      optionKey,
    });

    // 2. 입력값 검증
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount < 0) {
      alert("유효한 금액을 입력해주세요.");
      return;
    }

    // 3. 저장 중 상태 설정 (로딩 스피너 표시)
    setSavingPrices((prev) => ({
      ...prev,
      [optionKey]: true,
    }));

    // 4. 기존 성공 메시지 제거
    setPriceUpdateSuccess((prev) => ({
      ...prev,
      [optionKey]: false,
    }));

    try {
      console.log("📤 API 호출 시작...");

      // 5. 토큰 확인
      const accessToken = localStorage.getItem("cafe24_access_token");
      if (!accessToken) {
        throw new Error("로그인이 필요합니다.");
      }

      // 6. 카페24 API 호출
      const response = await fetch("/api/cafe24-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: "updateOptionPrices",
          productNo: productNo,
          optionUpdates: [
            {
              optionName: optionName,
              optionText: optionText,
              additionalAmount: amount.toFixed(2),
            },
          ],
        }),
      });

      console.log("📥 API 응답 상태:", response.status);

      if (!response.ok) {
        // HTTP 에러 처리
        const errorData = await response.json();
        console.error("❌ API 에러:", errorData);
        throw new Error(
          errorData.error ||
            errorData.message ||
            `서버 오류: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("✅ API 응답 성공:", result);

      if (!result.success) {
        // API는 성공했지만 비즈니스 로직 실패
        throw new Error(result.message || "옵션 가격 수정에 실패했습니다.");
      }

      console.log("🎉 옵션 가격 수정 성공!");

      // 7. UI 즉시 업데이트 (검색 결과에서 해당 옵션 가격 변경)
      setSearchResults((prev) =>
        prev.map((product) => {
          if (product.product_no === productNo) {
            // 해당 상품의 옵션 정보 업데이트
            const updatedProduct = { ...product };

            if (updatedProduct.options?.options) {
              updatedProduct.options.options =
                updatedProduct.options.options.map((option) => {
                  if (option.option_name === optionName) {
                    return {
                      ...option,
                      option_value: option.option_value.map((value) => {
                        if (value.option_text === optionText) {
                          return {
                            ...value,
                            additional_amount: amount.toFixed(2),
                          };
                        }
                        return value;
                      }),
                    };
                  }
                  return option;
                });
            }

            console.log("🔄 UI 업데이트 완료:", updatedProduct);
            return updatedProduct;
          }
          return product;
        })
      );

      // 8. 성공 메시지 표시
      setPriceUpdateSuccess((prev) => ({
        ...prev,
        [optionKey]: true,
      }));

      // 9. 편집 상태 종료
      setEditingPrices((prev) => {
        const newState = { ...prev };
        delete newState[optionKey];
        return newState;
      });

      // 10. 성공 알림
      console.log(
        `✅ ${optionName} - ${optionText} 옵션의 추가 금액이 ${amount.toLocaleString()}원으로 성공적으로 수정되었습니다!`
      );

      // 11. 3초 후 성공 메시지 자동 숨김
      setTimeout(() => {
        setPriceUpdateSuccess((prev) => ({
          ...prev,
          [optionKey]: false,
        }));
      }, 3000);
    } catch (error) {
      console.error("❌ 옵션 가격 수정 실패:", error);

      // 12. 에러 처리 및 사용자 알림
      let errorMessage = "옵션 가격 수정 중 오류가 발생했습니다.";

      if (error.message.includes("422")) {
        errorMessage = "카페24 API 형식 오류입니다. 옵션 구조를 확인해주세요.";
      } else if (error.message.includes("401")) {
        errorMessage = "인증이 만료되었습니다. 다시 로그인해주세요.";
      } else if (error.message.includes("option is being used")) {
        errorMessage = "이 옵션은 주문에서 사용 중이어서 수정할 수 없습니다.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(
        `❌ ${errorMessage}\n\n상세 정보:\n옵션: ${optionName} - ${optionText}\n새 가격: ${amount.toLocaleString()}원`
      );

      // 13. 에러 발생 시에도 편집 상태는 유지 (사용자가 다시 시도할 수 있도록)
    } finally {
      // 14. 로딩 상태 해제 (성공/실패 관계없이)
      setSavingPrices((prev) => ({
        ...prev,
        [optionKey]: false,
      }));

      console.log("🏁 옵션 가격 저장 과정 완료");
    }
  };

  return (
    <Container>
      <PageTitle>상품 검색 및 관리</PageTitle>

      <SearchSection>
        <SectionTitle>상품 검색</SectionTitle>

        <SearchTypeGroup>
          <RadioButton $checked={searchType === "model"}>
            <input
              type="radio"
              value="model"
              checked={searchType === "model"}
              onChange={(e) => setSearchType(e.target.value)}
            />
            모델번호
          </RadioButton>
          <RadioButton $checked={searchType === "name"}>
            <input
              type="radio"
              value="name"
              checked={searchType === "name"}
              onChange={(e) => setSearchType(e.target.value)}
            />
            상품명
          </RadioButton>
          <RadioButton $checked={searchType === "code"}>
            <input
              type="radio"
              value="code"
              checked={searchType === "code"}
              onChange={(e) => setSearchType(e.target.value)}
            />
            상품코드
          </RadioButton>
          <RadioButton $checked={searchType === "id"}>
            <input
              type="radio"
              value="id"
              checked={searchType === "id"}
              onChange={(e) => setSearchType(e.target.value)}
            />
            상품번호
          </RadioButton>
        </SearchTypeGroup>

        <SearchInputGroup>
          <SearchInput
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`${
              searchType === "model"
                ? "모델번호"
                : searchType === "name"
                ? "상품명"
                : searchType === "code"
                ? "상품코드"
                : "상품번호"
            }를 입력하세요 (부분 검색 가능)`}
            disabled={isLoading}
          />
          <SearchButton
            onClick={performSearch}
            disabled={isLoading || !searchQuery.trim()}
          >
            {isLoading ? (
              <>
                검색 중<LoadingSpinner />
              </>
            ) : (
              "검색"
            )}
          </SearchButton>
        </SearchInputGroup>
      </SearchSection>

      {error && <ErrorMessage>❌ {error}</ErrorMessage>}

      {searchResults.length > 0 && (
        <ResultsSection>
          <SectionTitle>검색 결과 ({searchResults.length}개)</SectionTitle>

          {searchResults.map((product) => (
            <ProductCard key={product.product_no}>
              <ProductHeader>
                <ProductInfo>
                  <ProductName>{product.product_name}</ProductName>
                  <ProductMeta>
                    <span>상품번호: {product.product_no}</span>
                    <span>모델번호: {product.model_name || "N/A"}</span>
                    <span>상품코드: {product.product_code || "N/A"}</span>
                  </ProductMeta>
                  <ProductPrice>
                    판매가: {parseInt(product.price || 0).toLocaleString()}원
                  </ProductPrice>
                  <div style={{ fontSize: "13px", color: "#666" }}>
                    옵션 타입:{" "}
                    {product.option_type === "E"
                      ? "옵션 없음"
                      : product.option_type === "T"
                      ? "품목형"
                      : product.option_type === "F"
                      ? "연동형"
                      : "알 수 없음"}
                  </div>
                </ProductInfo>

                <OptionToggleButton
                  onClick={() => toggleOptions(product.product_no)}
                >
                  {expandedProducts[product.product_no]
                    ? "숨기기"
                    : "옵션 및 가격 관리"}
                </OptionToggleButton>
              </ProductHeader>

              {expandedProducts[product.product_no] && (
                <OptionsSection>
                  {/* 기본 가격 수정 */}
                  <BasicPriceSection>
                    <OptionTitle>기본 가격 수정</OptionTitle>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ fontSize: "14px" }}>현재 가격:</span>
                      <strong>
                        {parseInt(product.price || 0).toLocaleString()}원
                      </strong>

                      {editingPrices[`basic_${product.product_no}`] ===
                      undefined ? (
                        <ActionButton
                          className="primary"
                          onClick={() =>
                            startBasicPriceEdit(
                              product.product_no,
                              product.price
                            )
                          }
                        >
                          가격 수정
                        </ActionButton>
                      ) : (
                        <PriceEditForm>
                          <PriceInput
                            type="number"
                            value={editingPrices[`basic_${product.product_no}`]}
                            onChange={(e) =>
                              setEditingPrices((prev) => ({
                                ...prev,
                                [`basic_${product.product_no}`]: e.target.value,
                              }))
                            }
                            placeholder="새 가격"
                          />
                          <span>원</span>

                          {(() => {
                            const diff = calculatePriceDifference(
                              product.price,
                              editingPrices[`basic_${product.product_no}`]
                            );
                            return (
                              diff && (
                                <PriceDifference
                                  $isIncrease={diff.isIncrease}
                                  $isDecrease={diff.isDecrease}
                                >
                                  {diff.isIncrease ? "+" : "-"}
                                  {diff.amount.toLocaleString()}원 (
                                  {diff.percentage.toFixed(1)}%)
                                </PriceDifference>
                              )
                            );
                          })()}

                          <ActionButton
                            className="primary"
                            onClick={() =>
                              saveBasicPrice(
                                product.product_no,
                                editingPrices[`basic_${product.product_no}`]
                              )
                            }
                            disabled={
                              savingPrices[`basic_${product.product_no}`]
                            }
                          >
                            {savingPrices[`basic_${product.product_no}`] ? (
                              <>
                                저장중
                                <LoadingSpinner />
                              </>
                            ) : (
                              "저장"
                            )}
                          </ActionButton>
                          <ActionButton
                            onClick={() =>
                              cancelBasicPriceEdit(product.product_no)
                            }
                            disabled={
                              savingPrices[`basic_${product.product_no}`]
                            }
                          >
                            취소
                          </ActionButton>
                        </PriceEditForm>
                      )}
                    </div>
                    {priceUpdateSuccess[`basic_${product.product_no}`] && (
                      <SuccessMessage>
                        ✓ 기본 가격이 성공적으로 수정되었습니다.
                      </SuccessMessage>
                    )}
                  </BasicPriceSection>

                  {/* embed=options로 받은 옵션 데이터 표시 */}
                  {product.options &&
                    product.options.options &&
                    product.options.options.length > 0 && (
                      <OptionGroup>
                        <OptionTitle>
                          상품 옵션 설정 ({product.options.options.length}개)
                        </OptionTitle>

                        {product.options.options.map((option, optionIndex) => {
                          return (
                            <OptionSetContainer
                              key={option.option_code || optionIndex}
                            >
                              <OptionSetHeader>
                                <OptionSetTitle>
                                  {option.option_name || "옵션명 없음"}
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      color: "#718096",
                                      marginLeft: "8px",
                                    }}
                                  >
                                    (
                                    {option.option_display_type ||
                                      "표시타입 없음"}
                                    )
                                  </span>
                                </OptionSetTitle>
                                <div
                                  style={{ fontSize: "12px", color: "#4a5568" }}
                                >
                                  <span>
                                    코드: {option.option_code || "N/A"}
                                  </span>
                                  {option.required_option === "T" && (
                                    <Badge
                                      style={{
                                        marginLeft: "8px",
                                        background: "#fed7d7",
                                        color: "#c53030",
                                      }}
                                    >
                                      필수
                                    </Badge>
                                  )}
                                </div>
                              </OptionSetHeader>

                              {/* option_value 배열 확인 및 표시 */}
                              {option.option_value &&
                              Array.isArray(option.option_value) &&
                              option.option_value.length > 0 ? (
                                <OptionValueGrid>
                                  {option.option_value.map(
                                    (valueObj, valueIndex) => {
                                      const optionKey = `option_${product.product_no}_${option.option_name}_${valueObj.option_text}`;
                                      const currentAdditionalPrice = parseFloat(
                                        valueObj.additional_amount || 0
                                      );
                                      const isEditingPrice =
                                        editingPrices[optionKey] !== undefined;

                                      return (
                                        <OptionValueCard
                                          key={valueObj.value_no || valueIndex}
                                        >
                                          <OptionValueName>
                                            {valueObj.option_text ||
                                              `옵션값 ${valueIndex + 1}`}
                                          </OptionValueName>

                                          <div
                                            style={{
                                              fontSize: "11px",
                                              color: "#718096",
                                              marginTop: "4px",
                                            }}
                                          >
                                            {valueObj.value_no && (
                                              <div>
                                                값 번호: {valueObj.value_no}
                                              </div>
                                            )}
                                          </div>

                                          {/* 추가 금액 수정 폼 */}
                                          <div style={{ marginTop: "8px" }}>
                                            <div
                                              style={{
                                                fontSize: "11px",
                                                color: "#4a5568",
                                                marginBottom: "4px",
                                              }}
                                            >
                                              추가 금액:
                                            </div>
                                            {isEditingPrice ? (
                                              <PriceEditForm>
                                                <PriceInput
                                                  type="number"
                                                  style={{
                                                    width: "80px",
                                                    fontSize: "12px",
                                                  }}
                                                  value={
                                                    editingPrices[optionKey]
                                                  }
                                                  onChange={(e) =>
                                                    setEditingPrices(
                                                      (prev) => ({
                                                        ...prev,
                                                        [optionKey]:
                                                          e.target.value,
                                                      })
                                                    )
                                                  }
                                                  placeholder="금액"
                                                />
                                                <span
                                                  style={{ fontSize: "11px" }}
                                                >
                                                  원
                                                </span>

                                                {(() => {
                                                  const diff =
                                                    calculatePriceDifference(
                                                      currentAdditionalPrice,
                                                      editingPrices[optionKey]
                                                    );
                                                  return (
                                                    diff && (
                                                      <PriceDifference
                                                        $isIncrease={
                                                          diff.isIncrease
                                                        }
                                                        $isDecrease={
                                                          diff.isDecrease
                                                        }
                                                        style={{
                                                          fontSize: "10px",
                                                        }}
                                                      >
                                                        {diff.isIncrease
                                                          ? "+"
                                                          : "-"}
                                                        {diff.amount.toLocaleString()}
                                                        원
                                                      </PriceDifference>
                                                    )
                                                  );
                                                })()}

                                                <ActionButton
                                                  style={{
                                                    fontSize: "10px",
                                                    padding: "4px 8px",
                                                  }}
                                                  className="primary"
                                                  onClick={() =>
                                                    saveOptionPrice(
                                                      product.product_no,
                                                      option.option_name,
                                                      valueObj.option_text,
                                                      editingPrices[optionKey]
                                                    )
                                                  }
                                                  disabled={
                                                    savingPrices[optionKey]
                                                  }
                                                >
                                                  {savingPrices[optionKey]
                                                    ? "저장중"
                                                    : "저장"}
                                                </ActionButton>
                                                <ActionButton
                                                  style={{
                                                    fontSize: "10px",
                                                    padding: "4px 8px",
                                                  }}
                                                  onClick={() =>
                                                    cancelOptionPriceEdit(
                                                      product.product_no,
                                                      option.option_name,
                                                      valueObj.option_text
                                                    )
                                                  }
                                                  disabled={
                                                    savingPrices[optionKey]
                                                  }
                                                >
                                                  취소
                                                </ActionButton>
                                              </PriceEditForm>
                                            ) : (
                                              <div
                                                style={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  gap: "8px",
                                                }}
                                              >
                                                <span
                                                  style={{
                                                    fontSize: "12px",
                                                    fontWeight: "500",
                                                  }}
                                                >
                                                  +
                                                  {currentAdditionalPrice.toLocaleString()}
                                                  원
                                                </span>
                                                <ActionButton
                                                  style={{
                                                    fontSize: "10px",
                                                    padding: "4px 8px",
                                                  }}
                                                  onClick={() =>
                                                    startOptionPriceEdit(
                                                      product.product_no,
                                                      option.option_name,
                                                      valueObj.option_text,
                                                      currentAdditionalPrice
                                                    )
                                                  }
                                                >
                                                  수정
                                                </ActionButton>
                                              </div>
                                            )}
                                            {priceUpdateSuccess[optionKey] && (
                                              <SuccessMessage
                                                style={{
                                                  fontSize: "10px",
                                                  marginTop: "4px",
                                                  padding: "4px 6px",
                                                }}
                                              >
                                                ✓ 수정 완료
                                              </SuccessMessage>
                                            )}
                                          </div>
                                        </OptionValueCard>
                                      );
                                    }
                                  )}
                                </OptionValueGrid>
                              ) : (
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#666",
                                    fontStyle: "italic",
                                    padding: "8px",
                                  }}
                                >
                                  옵션 값이 없습니다.
                                </div>
                              )}
                            </OptionSetContainer>
                          );
                        })}

                        {/* 옵션 요약 정보 */}
                        <div
                          style={{
                            marginTop: "16px",
                            padding: "12px",
                            background: "#f0f0f0",
                            borderRadius: "6px",
                            fontSize: "12px",
                            color: "#666",
                          }}
                        >
                          <strong>옵션 요약:</strong> 총{" "}
                          {product.options.options.length}개 옵션 세트,
                          {product.options.options.reduce(
                            (total, opt) =>
                              total +
                              (opt.option_value ? opt.option_value.length : 0),
                            0
                          )}
                          개 옵션 값
                        </div>
                      </OptionGroup>
                    )}

                  {/* 옵션이 없는 경우 */}
                  {(!product.options?.options?.length ||
                    product.option_type === "E") && (
                    <EmptyState>
                      <p>등록된 옵션이 없습니다.</p>
                    </EmptyState>
                  )}
                </OptionsSection>
              )}
            </ProductCard>
          ))}
        </ResultsSection>
      )}

      {!isLoading && searchResults.length === 0 && searchQuery && !error && (
        <ResultsSection>
          <EmptyState>
            <h3>검색 결과가 없습니다</h3>
            <p>다른 검색어를 시도해보세요.</p>
          </EmptyState>
        </ResultsSection>
      )}
    </Container>
  );
};

export default ProductSearchPage;
