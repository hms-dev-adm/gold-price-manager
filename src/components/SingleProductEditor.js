import React, { useState } from "react";
import styled from "styled-components";

// Styled Components
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

const SearchInputGroup = styled.div`
  display: flex;
  gap: 8px;
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

const ProductPrice = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #000;
  margin-bottom: 8px;
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
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

const OptionsSection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;
`;

const BasicPriceSection = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
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

const OptionValueMeta = styled.div`
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
`;

const OptionValueLabel = styled.div`
  font-size: 11px;
  color: #666;
  margin-bottom: 6px;
`;

const OptionPrice = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
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

// 헬퍼 함수들
const createOptionKey = (productNo, optionName, optionText) =>
  `${productNo}_${optionName}_${optionText}`;

const createBasicPriceKey = (productNo) => `basic_${productNo}`;

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

// 카스텀 훅 for API calls
const useApiCall = () => {
  const callApi = async (endpoint, data, method = "POST") => {
    const accessToken = localStorage.getItem("cafe24_access_token");
    if (!accessToken) {
      throw new Error("로그인이 필요합니다.");
    }

    const options = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    };

    if (method !== "GET") {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(endpoint, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || result.error || `HTTP ${response.status}`
      );
    }

    return result;
  };

  return { callApi };
};

// 기본 가격 편집 컴포넌트
const BasicPriceEditor = ({
  product,
  editingPrices,
  setEditingPrices,
  savingPrices,
  priceUpdateSuccess,
  onSave,
}) => {
  const basicPriceKey = createBasicPriceKey(product.product_no);
  const isEditing = editingPrices[basicPriceKey] !== undefined;
  const isSaving = savingPrices[basicPriceKey];
  const isSuccess = priceUpdateSuccess[basicPriceKey];

  const startEdit = () => {
    setEditingPrices((prev) => ({
      ...prev,
      [basicPriceKey]: product.price,
    }));
  };

  const cancelEdit = () => {
    setEditingPrices((prev) => {
      const newState = { ...prev };
      delete newState[basicPriceKey];
      return newState;
    });
  };

  const handleSave = () => {
    onSave(product.product_no, editingPrices[basicPriceKey]);
  };

  const handleInputChange = (value) => {
    setEditingPrices((prev) => ({
      ...prev,
      [basicPriceKey]: value,
    }));
  };

  return (
    <BasicPriceSection>
      <OptionTitle>기본 가격 수정</OptionTitle>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "14px" }}>현재 가격:</span>
        <strong>{parseInt(product.price || 0).toLocaleString()}원</strong>

        {!isEditing ? (
          <ActionButton onClick={startEdit}>가격 수정</ActionButton>
        ) : (
          <PriceEditForm onSubmit={(e) => e.preventDefault()}>
            <PriceInput
              type="number"
              value={editingPrices[basicPriceKey]}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="새 가격"
              disabled={isSaving}
            />
            <span>원</span>

            {(() => {
              const diff = calculatePriceDifference(
                product.price,
                editingPrices[basicPriceKey]
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

            <ActionButton onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  저장중
                  <LoadingSpinner />
                </>
              ) : (
                "저장"
              )}
            </ActionButton>
            <ActionButton onClick={cancelEdit} disabled={isSaving}>
              취소
            </ActionButton>
          </PriceEditForm>
        )}
      </div>
      {isSuccess && (
        <SuccessMessage>
          ✓ 기본 가격이 성공적으로 수정되었습니다.
        </SuccessMessage>
      )}
    </BasicPriceSection>
  );
};

// 옵션 값 편집 컴포넌트
const OptionValueEditor = ({
  product,
  option,
  value,
  editingPrices,
  setEditingPrices,
  savingPrices,
  priceUpdateSuccess,
  onSave,
}) => {
  const optionKey = createOptionKey(
    product.product_no,
    option.option_name,
    value.option_text
  );
  const isEditing = editingPrices[optionKey] !== undefined;
  const isSaving = savingPrices[optionKey];
  const isSuccess = priceUpdateSuccess[optionKey];

  const startEdit = () => {
    setEditingPrices((prev) => ({
      ...prev,
      [optionKey]: parseFloat(value.additional_amount || 0).toString(),
    }));
  };

  const cancelEdit = () => {
    setEditingPrices((prev) => {
      const newState = { ...prev };
      delete newState[optionKey];
      return newState;
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSave(product.product_no, option, value, editingPrices[optionKey]);
  };

  const handleInputChange = (inputValue) => {
    setEditingPrices((prev) => ({
      ...prev,
      [optionKey]: inputValue,
    }));
  };

  // 수정 버튼 클릭시 카페24 관리자 페이지로 이동
  const handleEditClick = () => {
    const adminUrl = `https://gongbang301.cafe24.com/disp/admin/shop1/product/optionregister?related_type=1&Page=1&option_code=${option.option_code}`;
    window.open(adminUrl, "_blank");
  };

  return (
    <OptionValueCard>
      <OptionValueName>{value.option_text}</OptionValueName>
      <OptionValueMeta>
        값 번호: {value.value_no || "N/A"} | 코드: {option.option_code}
      </OptionValueMeta>
      <OptionValueLabel>추가 금액:</OptionValueLabel>
      <OptionPrice>
        +{parseInt(value.additional_amount || 0).toLocaleString()}원
      </OptionPrice>

      <ActionButton
        onClick={handleEditClick}
        title={`카페24 관리자에서 ${value.option_text} 옵션 수정`}
      >
        수정
      </ActionButton>

      {isSuccess && <SuccessMessage>✓ 수정 완료</SuccessMessage>}
    </OptionValueCard>
  );
};

// 옵션 세트 컴포넌트
const OptionSet = ({
  product,
  option,
  editingPrices,
  setEditingPrices,
  savingPrices,
  priceUpdateSuccess,
  onSaveOption,
}) => {
  return (
    <OptionSetContainer>
      <OptionSetHeader>
        <OptionSetTitle>
          {option.option_name || "옵션명 없음"}
          <span
            style={{ fontSize: "11px", color: "#718096", marginLeft: "8px" }}
          >
            ({option.option_display_type || "표시타입 없음"})
          </span>
        </OptionSetTitle>
        <div style={{ fontSize: "12px", color: "#4a5568" }}>
          <span>코드: {option.option_code || "N/A"}</span>
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

      {option.option_value &&
      Array.isArray(option.option_value) &&
      option.option_value.length > 0 ? (
        <OptionValueGrid>
          {option.option_value.map((value, valueIndex) => (
            <OptionValueEditor
              key={value.value_no || valueIndex}
              product={product}
              option={option}
              value={value}
              editingPrices={editingPrices}
              setEditingPrices={setEditingPrices}
              savingPrices={savingPrices}
              priceUpdateSuccess={priceUpdateSuccess}
              onSave={onSaveOption}
            />
          ))}
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
};

// 메인 컴포넌트
const ProductSearchPage = () => {
  // 상태 관리
  const [searchType, setSearchType] = useState("model");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedProducts, setExpandedProducts] = useState({});
  const [editingPrices, setEditingPrices] = useState({});
  const [savingPrices, setSavingPrices] = useState({});
  const [priceUpdateSuccess, setPriceUpdateSuccess] = useState({});
  const [optionCodes, setOptionCodes] = useState({}); //옵션코드

  const { callApi } = useApiCall();

  // 검색 관련 함수들
  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setError("검색어를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSearchResults([]);
    setExpandedProducts({});
    setOptionCodes({});

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

      const data = await callApi("/api/cafe24-products", {
        action: "searchProducts",
        searchType: searchType,
        searchQuery: searchQuery.trim(),
      });

      setSearchResults(data.products || []);
      console.log("검색 결과:", data.products);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      performSearch();
    }
  };

  // UI 상태 관리
  const toggleOptions = (productNo) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productNo]: !prev[productNo],
    }));
  };

  // 가격 수정 관련 함수들
  const updateSearchResults = (productNo, updates) => {
    setSearchResults((prev) =>
      prev.map((product) =>
        product.product_no === productNo ? { ...product, ...updates } : product
      )
    );
  };

  const showSuccessMessage = (key, duration = 3000) => {
    setPriceUpdateSuccess((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setPriceUpdateSuccess((prev) => ({ ...prev, [key]: false }));
    }, duration);
  };

  const clearEditingState = (key) => {
    setEditingPrices((prev) => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  const setSavingState = (key, isSaving) => {
    setSavingPrices((prev) => ({ ...prev, [key]: isSaving }));
  };

  // 기본 가격 저장
  const saveBasicPrice = async (productNo, newPrice) => {
    const key = createBasicPriceKey(productNo);
    setSavingState(key, true);

    try {
      console.log("💰 가격 수정 요청:", { productNo, newPrice });

      const result = await callApi("/api/cafe24-products", {
        action: "updateProductPrice",
        productNo: productNo,
        price: newPrice,
      });

      console.log("📥 가격 수정 응답:", result);

      // UI 업데이트
      updateSearchResults(productNo, {
        price: newPrice,
        selling_price: newPrice,
      });

      clearEditingState(key);
      showSuccessMessage(key);

      alert(
        `가격이 ${parseInt(
          newPrice
        ).toLocaleString()}원으로 성공적으로 수정되었습니다!`
      );
    } catch (error) {
      console.error("❌ 가격 수정 실패:", error);

      // 실패 시 테스트 엔드포인트로 재시도
      try {
        console.log("🔄 기본 방식 실패, 테스트 엔드포인트로 재시도...");

        const testResult = await callApi("/api/cafe24-price-test", {
          productNo: productNo,
          price: newPrice,
        });

        console.log("✅ 테스트 엔드포인트로 성공!");

        updateSearchResults(productNo, {
          price: newPrice,
          selling_price: newPrice,
        });

        clearEditingState(key);
        showSuccessMessage(key);

        alert(
          `가격이 ${parseInt(
            newPrice
          ).toLocaleString()}원으로 성공적으로 수정되었습니다!`
        );
      } catch (testError) {
        alert(
          `가격 수정 실패: ${testError.message}\n\n해결 방법:\n1. 토큰이 유효한지 확인\n2. 상품이 수정 가능한 상태인지 확인\n3. 카페24 관리자 권한 확인`
        );
      }
    } finally {
      setSavingState(key, false);
    }
  };

  const saveOptionPrice = async (productNo, option, value, newAmount) => {
    const optionKey = createOptionKey(
      productNo,
      option.option_name,
      value.option_text
    );
    const amount = parseFloat(newAmount);

    if (isNaN(amount) || amount < 0) {
      alert("유효한 금액을 입력해주세요.");
      return;
    }

    setSavingState(optionKey, true);

    try {
      console.log("💰 옵션 가격 수정 시작:", {
        productNo,
        optionName: option.option_name,
        optionText: value.option_text,
        optionCode: option.option_code,
        valueNo: value.value_no,
        newAmount: amount,
      });

      // 먼저 value_no 방식 시도
      const result = await callApi("/api/cafe24-products", {
        action: "updateOptionValueByNo",
        productNo: productNo,
        optionCode: option.option_code,
        valueNo: value.value_no,
        additionalAmount: amount.toFixed(2),
      });

      console.log("📋 옵션 코드 수정 결과:", result);

      if (result.success) {
        if (result.readOnly) {
          alert(
            `⚠️ 카페24 API 제약 안내\n\n` +
              `옵션: ${option.option_name} - ${value.option_text}\n` +
              `값 번호: ${value.value_no}\n` +
              `새 가격: ${amount.toLocaleString()}원\n\n` +
              `카페24 API 제약으로 UI에만 반영됩니다.\n` +
              `실제 수정은 카페24 관리자에서 진행해주세요.`
          );
        } else {
          console.log("✅ 옵션 수정 성공!");
        }

        // UI 업데이트
        setSearchResults((prev) =>
          prev.map((product) => {
            if (product.product_no === productNo) {
              const updatedProduct = { ...product };

              if (updatedProduct.options?.options) {
                updatedProduct.options.options =
                  updatedProduct.options.options.map((opt) => {
                    if (opt.option_code === option.option_code) {
                      return {
                        ...opt,
                        option_value: opt.option_value.map((val) => {
                          if (val.value_no === value.value_no) {
                            return {
                              ...val,
                              additional_amount: amount.toFixed(2),
                            };
                          }
                          return val;
                        }),
                      };
                    }
                    return opt;
                  });
              }

              return updatedProduct;
            }
            return product;
          })
        );

        clearEditingState(optionKey);
        showSuccessMessage(optionKey);
      } else {
        throw new Error(result.message || "옵션 가격 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("❌ 옵션 가격 수정 실패:", error);
      alert(
        `❌ 옵션 가격 수정 실패\n\n` +
          `에러: ${error.message}\n\n` +
          `옵션: ${option.option_name} - ${value.option_text}\n` +
          `카페24 관리자에서 직접 수정해주세요.`
      );
    } finally {
      setSavingState(optionKey, false);
    }
  };

  // 렌더링
  return (
    <Container>
      <PageTitle>상품 검색 및 관리</PageTitle>

      {/* 검색 섹션 */}
      <SearchSection>
        <SectionTitle>상품 검색</SectionTitle>

        <SearchTypeGroup>
          {[
            { value: "model", label: "모델번호" },
            { value: "name", label: "상품명" },
            { value: "code", label: "상품코드" },
            { value: "id", label: "상품번호" },
          ].map(({ value, label }) => (
            <RadioButton key={value} $checked={searchType === value}>
              <input
                type="radio"
                value={value}
                checked={searchType === value}
                onChange={(e) => setSearchType(e.target.value)}
              />
              {label}
            </RadioButton>
          ))}
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

      {/* 에러 메시지 */}
      {error && <ErrorMessage>❌ {error}</ErrorMessage>}

      {/* 검색 결과 */}
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

              {/* 옵션 및 가격 관리 섹션 */}
              {expandedProducts[product.product_no] && (
                <OptionsSection>
                  {/* 기본 가격 수정 */}
                  <BasicPriceEditor
                    product={product}
                    editingPrices={editingPrices}
                    setEditingPrices={setEditingPrices}
                    savingPrices={savingPrices}
                    priceUpdateSuccess={priceUpdateSuccess}
                    onSave={saveBasicPrice}
                  />

                  {/* 옵션 목록 */}
                  {product.options?.options?.length > 0 && (
                    <OptionGroup>
                      <OptionTitle>
                        상품 옵션 설정 ({product.options.options.length}개)
                      </OptionTitle>

                      {product.options.options.map((option, optionIndex) => (
                        <OptionSet
                          key={option.option_code || optionIndex}
                          product={product}
                          option={option}
                          editingPrices={editingPrices}
                          setEditingPrices={setEditingPrices}
                          savingPrices={savingPrices}
                          priceUpdateSuccess={priceUpdateSuccess}
                          onSaveOption={saveOptionPrice}
                        />
                      ))}

                      {/* 옵션 요약 */}
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
                        {product.options.options.length}개 옵션 세트,{" "}
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

      {/* 검색 결과 없음 */}
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
