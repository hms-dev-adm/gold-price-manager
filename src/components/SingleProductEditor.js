import React, { useState, useEffect } from "react";
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

const SearchForm = styled.form`
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

const Button = styled.button`
  padding: 10px 20px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
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

const LoadingContainer = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 14px;
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

const ProductTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const TableHeader = styled.thead`
  border-bottom: 2px solid #e5e5e5;

  th {
    text-align: left;
    padding: 12px 8px;
    font-weight: 500;
    color: #666;
    font-size: 13px;
  }
`;

const TableBody = styled.tbody`
  tr {
    border-bottom: 1px solid #f5f5f5;

    &:hover {
      background: #fafafa;
    }
  }

  td {
    padding: 16px 8px;
    color: #333;
  }
`;

const ProductName = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const ProductCode = styled.div`
  font-size: 12px;
  color: #666;
`;

const Price = styled.div`
  font-weight: 500;
  text-align: right;
`;

const ProductMeta = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const MetaItem = styled.div`
  font-size: 13px;
  color: #666;

  strong {
    color: #333;
    font-weight: 500;
  }
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

const ProductActions = styled.div`
  display: flex;
  gap: 8px;
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

const DebugPanel = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  max-height: 300px;
  background: #000;
  color: #0f0;
  padding: 16px;
  border-radius: 8px;
  font-family: "Monaco", "Courier New", monospace;
  font-size: 11px;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  pre {
    margin: 0;
    white-space: pre-wrap;
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

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const OptionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 13px;
`;

const OptionName = styled.span`
  flex: 1;
  color: #333;
`;

const OptionPrice = styled.span`
  font-weight: 500;
  color: #000;
  margin-left: 16px;
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

const ProductSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("model"); //검색 기본값
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [expandedProducts, setExpandedProducts] = useState({});
  const [productOptions, setProductOptions] = useState({});
  const [editingPrices, setEditingPrices] = useState({});

  //가격 업데이트 State
  const [savingPrices, setSavingPrices] = useState({});
  const [priceUpdateSuccess, setPriceUpdateSuccess] = useState({});

  //상품 옵션 정보 로드
  const loadProductOptions = async (productNo) => {
    try {
      const accessToken = localStorage.getItem("cafe24_access_token");

      //variants 조회 (품목형 옵션)
      const variantResponse = await fetch("/api/cafe24-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: "getVariants",
          productNo: productNo,
        }),
      });

      if (variantResponse.ok) {
        const variantsData = await variantResponse.json();

        setProductOptions((prev) => ({
          ...prev,
          [productNo]: {
            ...prev[productNo],
            variants: variantsData.variants || [],
          },
        }));
      }
    } catch (error) {
      console.error("옵션 로드 실패 : ", error);
    }
  };

  // 옵션 토글
  const toggleProductOptions = async (productNo) => {
    const isExpanded = expandedProducts[productNo];

    if (!isExpanded && !productOptions[productNo]) {
      await loadProductOptions(productNo);
    }

    setExpandedProducts((prev) => ({
      ...prev,
      [productNo]: !isExpanded,
    }));
  };

  // 가격 수정 시작
  const startPriceEdit = (productNo, variantNo, currentPrice) => {
    const key = variantNo ? `${productNo}_${variantNo}` : productNo;
    setEditingPrices((prev) => ({
      ...prev,
      [key]: currentPrice || "0",
    }));
    // 성공 메시지 제거
    setPriceUpdateSuccess((prev) => {
      const newSuccess = { ...prev };
      delete newSuccess[key];
      return newSuccess;
    });
  };

  // 가격 수정 취소
  const cancelPriceEdit = (productNo, variantNo) => {
    const key = variantNo ? `${productNo}_${variantNo}` : productNo;
    setEditingPrices((prev) => {
      const newPrices = { ...prev };
      delete newPrices[key];
      return newPrices;
    });
  };

  // 가격 저장
  const savePriceEdit = async (productNo, variantNo) => {
    const key = variantNo ? `${productNo}_${variantNo}` : productNo;
    const newPrice = editingPrices[key];

    if (!newPrice || isNaN(newPrice) || parseFloat(newPrice) < 0) {
      alert("유효한 가격을 입력해주세요.");
      return;
    }

    // 옵션 가격 수정 제한 알림
    if (variantNo) {
      alert(
        "옵션 가격 수정은 카페24 API 제한으로 인해 지원되지 않습니다.\n기본 상품 가격만 수정 가능합니다."
      );
      cancelPriceEdit(productNo, variantNo);
      return;
    }

    setSavingPrices((prev) => ({ ...prev, [key]: true }));

    try {
      const accessToken = localStorage.getItem("cafe24_access_token");

      // 먼저 테스트 엔드포인트로 시도
      console.log("가격 수정 테스트 시작...");

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

      const testData = await testResponse.json();

      if (testResponse.ok) {
        console.log("✅ 가격 수정 성공! 사용된 형식:", testData.format);

        // UI 업데이트
        setSearchResults((prev) =>
          prev.map((product) => {
            if (product.product_no === productNo) {
              return { ...product, price: newPrice };
            }
            return product;
          })
        );

        cancelPriceEdit(productNo, variantNo);
        setPriceUpdateSuccess((prev) => ({ ...prev, [key]: true }));

        setTimeout(() => {
          setPriceUpdateSuccess((prev) => {
            const newSuccess = { ...prev };
            delete newSuccess[key];
            return newSuccess;
          });
        }, 3000);
      } else {
        throw new Error(testData.message || "가격 수정 실패");
      }
    } catch (error) {
      console.error("가격 수정 실패:", error);
      alert(
        `가격 수정 실패: ${error.message}\n\n카페24 관리자 페이지에서 직접 수정하시거나,\nAPI 권한을 확인해주세요.`
      );
    } finally {
      setSavingPrices((prev) => {
        const newSaving = { ...prev };
        delete newSaving[key];
        return newSaving;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError("검색어를 입력하세요.");
      return;
    }
    await performSearch();
  };

  const performSearch = async () => {
    setIsLoading(true);
    setError("");
    setSearchResults([]);
    setExpandedProducts({});
    setProductOptions({});

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

      // 콘솔에 상세 정보 출력
      // if (data.products?.length > 0) {
      //   console.group("🔍 상품 검색 결과");
      //   console.table(
      //     data.products.map((p) => ({
      //       번호: p.product_no,
      //       상품명: p.product_name,
      //       코드: p.product_code,
      //       가격: p.price,
      //       진열: p.display === "T" ? "진열함" : "진열안함",
      //     }))
      //   );
      //   console.groupEnd();
      // }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleProductDetail = async (productNo) => {
  //   try {
  //     addDebugInfo(`Fetching details for product ${productNo}`);

  //     const accessToken = localStorage.getItem("cafe24_access_token");

  //     const response = await fetch("/api/cafe24-products", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //       body: JSON.stringify({
  //         action: "getProduct",
  //         productNo: productNo,
  //       }),
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       console.group(`📋 상품 #${productNo} 상세 정보`);
  //       console.log(data.product);
  //       console.groupEnd();
  //       addDebugInfo(`Product ${productNo} details loaded`);
  //     }
  //   } catch (error) {
  //     addDebugInfo(`Error loading product ${productNo}: ${error.message}`);
  //   }
  // };

  // // 키보드 단축키 (디버그 패널 토글)
  // useEffect(() => {
  //   // 토큰 정보 확인
  //   console.log("Mall ID:", process.env.REACT_APP_CAFE24_MALL_ID);
  //   console.log("Token Scope:", localStorage.getItem("cafe24_token_scope"));
  //   console.log(
  //     "Token Expires:",
  //     new Date(parseInt(localStorage.getItem("cafe24_token_expires")))
  //   );

  //   const handleKeyPress = (e) => {
  //     if (e.ctrlKey && e.key === "d") {
  //       e.preventDefault();
  //       setShowDebug(!showDebug);
  //     }
  //   };
  //   window.addEventListener("keydown", handleKeyPress);
  //   return () => window.removeEventListener("keydown", handleKeyPress);
  // }, [showDebug]);

  return (
    <Container>
      <PageTitle>상품 관리</PageTitle>

      <SearchSection>
        <SectionTitle>상품 검색</SectionTitle>

        <SearchTypeGroup>
          <RadioButton $checked={searchType === "model"}>
            <input
              type="radio"
              name="searchType"
              value="model"
              checked={searchType === "model"}
              onChange={(e) => setSearchType(e.target.value)}
            />
            모델번호
          </RadioButton>
          <RadioButton $checked={searchType === "name"}>
            <input
              type="radio"
              name="searchType"
              value="name"
              checked={searchType === "name"}
              onChange={(e) => setSearchType(e.target.value)}
            />
            상품명
          </RadioButton>
          <RadioButton $checked={searchType === "code"}>
            <input
              type="radio"
              name="searchType"
              value="code"
              checked={searchType === "code"}
              onChange={(e) => setSearchType(e.target.value)}
            />
            상품코드
          </RadioButton>
          <RadioButton $checked={searchType === "id"}>
            <input
              type="radio"
              name="searchType"
              value="id"
              checked={searchType === "id"}
              onChange={(e) => setSearchType(e.target.value)}
            />
            상품번호
          </RadioButton>
        </SearchTypeGroup>

        <SearchForm onSubmit={handleSubmit}>
          <SearchInput
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              searchType === "model"
                ? "모델번호 입력 (부분 검색 가능)"
                : searchType === "name"
                ? "상품명 입력"
                : searchType === "code"
                ? "상품코드 입력"
                : "상품번호 입력"
            }
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !searchQuery.trim()}>
            {isLoading ? "검색 중..." : "검색"}
          </Button>
        </SearchForm>
      </SearchSection>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {searchResults.length > 0 && (
        <ResultsSection>
          <SectionTitle>검색 결과 ({searchResults.length})</SectionTitle>

          {searchResults.map((product) => (
            <ProductCard key={product.product_no}>
              <ProductHeader>
                <ProductInfo>
                  <ProductName>{product.product_name}</ProductName>
                  <ProductMeta>
                    <MetaItem>
                      <strong>상품번호:</strong> {product.product_no}
                    </MetaItem>
                    <MetaItem>
                      <strong>모델번호:</strong> {product.model_name || "N/A"}
                    </MetaItem>
                    <MetaItem>
                      <strong>상품코드:</strong> {product.product_code || "N/A"}
                    </MetaItem>
                    <MetaItem>
                      <strong>판매가:</strong>{" "}
                      {parseInt(product.price || 0).toLocaleString()}원
                    </MetaItem>
                    <MetaItem>
                      <Badge
                        $type={product.display === "T" ? "active" : "inactive"}
                      >
                        {product.display === "T" ? "진열" : "미진열"}
                      </Badge>
                    </MetaItem>
                    <MetaItem>
                      <Badge>
                        {product.option_type === "T"
                          ? "품목형 옵션"
                          : product.option_type === "F"
                          ? "연동형 옵션"
                          : "옵션없음"}
                      </Badge>
                    </MetaItem>
                  </ProductMeta>
                </ProductInfo>

                <ProductActions>
                  <ActionButton
                    $variant="primary"
                    onClick={() => toggleProductOptions(product.product_no)}
                  >
                    {expandedProducts[product.product_no]
                      ? "옵션 닫기"
                      : "옵션 및 가격 관리"}
                  </ActionButton>
                </ProductActions>
              </ProductHeader>

              {expandedProducts[product.product_no] && (
                <OptionsSection>
                  {/* 기본 상품 가격 수정 */}
                  <OptionGroup>
                    <OptionTitle>기본 상품 가격</OptionTitle>
                    <OptionsList>
                      <OptionItem>
                        <OptionName>기본 판매가</OptionName>
                        {editingPrices[product.product_no] !== undefined ? (
                          <PriceEditForm
                            onSubmit={(e) => {
                              e.preventDefault();
                              savePriceEdit(product.product_no);
                            }}
                          >
                            <PriceInput
                              type="number"
                              value={editingPrices[product.product_no]}
                              onChange={(e) =>
                                setEditingPrices((prev) => ({
                                  ...prev,
                                  [product.product_no]: e.target.value,
                                }))
                              }
                              disabled={savingPrices[product.product_no]}
                            />
                            <ActionButton
                              type="submit"
                              disabled={savingPrices[product.product_no]}
                            >
                              {savingPrices[product.product_no] ? (
                                <>
                                  저장중
                                  <LoadingSpinner />
                                </>
                              ) : (
                                "저장"
                              )}
                            </ActionButton>
                            <ActionButton
                              type="button"
                              onClick={() =>
                                cancelPriceEdit(product.product_no)
                              }
                              disabled={savingPrices[product.product_no]}
                            >
                              취소
                            </ActionButton>
                          </PriceEditForm>
                        ) : (
                          <>
                            <OptionPrice>
                              {parseInt(product.price || 0).toLocaleString()}원
                            </OptionPrice>
                            <ActionButton
                              onClick={() =>
                                startPriceEdit(
                                  product.product_no,
                                  null,
                                  product.price
                                )
                              }
                            >
                              수정
                            </ActionButton>
                          </>
                        )}
                      </OptionItem>
                      {priceUpdateSuccess[product.product_no] && (
                        <SuccessMessage>
                          ✓ 가격이 성공적으로 수정되었습니다.
                        </SuccessMessage>
                      )}
                    </OptionsList>
                  </OptionGroup>

                  {/* 품목형 옵션 (variants) */}
                  {product.option_type === "T" &&
                    productOptions[product.product_no]?.variants?.length >
                      0 && (
                      <OptionGroup>
                        <OptionTitle>품목형 옵션 (Variants)</OptionTitle>
                        <OptionsList>
                          {productOptions[product.product_no].variants.map(
                            (variant) => {
                              const variantKey = `${product.product_no}_${variant.variant_no}`;
                              return (
                                <div key={variant.variant_no}>
                                  <OptionItem>
                                    <OptionName>
                                      {variant.option_value ||
                                        variant.variant_name ||
                                        `옵션 ${variant.variant_no}`}
                                    </OptionName>
                                    {editingPrices[variantKey] !== undefined ? (
                                      <PriceEditForm
                                        onSubmit={(e) => {
                                          e.preventDefault();
                                          savePriceEdit(
                                            product.product_no,
                                            variant.variant_no
                                          );
                                        }}
                                      >
                                        <PriceInput
                                          type="number"
                                          value={editingPrices[variantKey]}
                                          onChange={(e) =>
                                            setEditingPrices((prev) => ({
                                              ...prev,
                                              [variantKey]: e.target.value,
                                            }))
                                          }
                                          disabled={savingPrices[variantKey]}
                                        />
                                        <ActionButton
                                          type="submit"
                                          disabled={savingPrices[variantKey]}
                                        >
                                          {savingPrices[variantKey] ? (
                                            <>
                                              저장중
                                              <LoadingSpinner />
                                            </>
                                          ) : (
                                            "저장"
                                          )}
                                        </ActionButton>
                                        <ActionButton
                                          type="button"
                                          onClick={() =>
                                            cancelPriceEdit(
                                              product.product_no,
                                              variant.variant_no
                                            )
                                          }
                                          disabled={savingPrices[variantKey]}
                                        >
                                          취소
                                        </ActionButton>
                                      </PriceEditForm>
                                    ) : (
                                      <>
                                        <OptionPrice>
                                          {parseInt(
                                            variant.price || product.price || 0
                                          ).toLocaleString()}
                                          원
                                        </OptionPrice>
                                        <ActionButton
                                          onClick={() =>
                                            startPriceEdit(
                                              product.product_no,
                                              variant.variant_no,
                                              variant.price || product.price
                                            )
                                          }
                                        >
                                          수정
                                        </ActionButton>
                                      </>
                                    )}
                                  </OptionItem>
                                  {priceUpdateSuccess[variantKey] && (
                                    <SuccessMessage>
                                      ✓ 옵션 가격이 성공적으로 수정되었습니다.
                                    </SuccessMessage>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </OptionsList>
                      </OptionGroup>
                    )}

                  {/* 연동형 옵션은 읽기 전용 */}
                  {product.option_type === "F" &&
                    productOptions[product.product_no]?.options?.length > 0 && (
                      <OptionGroup>
                        <OptionTitle>
                          연동형 옵션 (Options) - 읽기 전용
                        </OptionTitle>
                        <OptionsList>
                          {productOptions[product.product_no].options.map(
                            (option, index) => (
                              <OptionItem key={index}>
                                <OptionName>
                                  {option.option_name}: {option.option_value}
                                </OptionName>
                                <OptionPrice>
                                  추가금액:{" "}
                                  {parseInt(
                                    option.option_price || 0
                                  ).toLocaleString()}
                                  원
                                </OptionPrice>
                              </OptionItem>
                            )
                          )}
                        </OptionsList>
                      </OptionGroup>
                    )}

                  {/* 옵션 로딩 중 */}
                  {!productOptions[product.product_no]?.variants?.length &&
                    !productOptions[product.product_no]?.options?.length &&
                    product.option_type !== "E" && (
                      <EmptyState>
                        <p>옵션 정보를 불러오는 중...</p>
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
