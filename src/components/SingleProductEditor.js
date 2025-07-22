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

const ProductSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("name");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [debugInfo, setDebugInfo] = useState("");
  const [showDebug, setShowDebug] = useState(false);

  const addDebugInfo = (message) => {
    const timestamp = new Date().toISOString().split("T")[1].slice(0, 8);
    setDebugInfo((prev) => `[${timestamp}] ${message}\n${prev}`);
    console.log(`[ProductSearch] ${message}`);
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

    try {
      addDebugInfo(`Searching: ${searchQuery} (${searchType})`);

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

      addDebugInfo(`Request: ${JSON.stringify(requestBody)}`);

      const response = await fetch("/api/cafe24-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      addDebugInfo(`Response: ${response.status}`);

      const data = await response.json();

      if (!response.ok) {
        // 에러 상세 정보 로깅
        console.error("API 에러 상세:", data);
        addDebugInfo(`Error details: ${JSON.stringify(data)}`);

        // 구체적인 에러 메시지 생성
        let errorMessage =
          data.message || data.error || `HTTP ${response.status}`;

        // 카페24 API 특정 에러 처리
        if (data.code) {
          errorMessage += ` (코드: ${data.code})`;
        }

        if (data.details?.error?.message) {
          errorMessage = data.details.error.message;
        }

        throw new Error(errorMessage);
      }

      addDebugInfo(`Found: ${data.products?.length || 0} products`);

      setSearchResults(data.products || []);

      // 콘솔에 상세 정보 출력
      if (data.products?.length > 0) {
        console.group("🔍 상품 검색 결과");
        console.table(
          data.products.map((p) => ({
            번호: p.product_no,
            상품명: p.product_name,
            코드: p.product_code,
            가격: p.price,
            진열: p.display === "T" ? "진열함" : "진열안함",
          }))
        );
        console.groupEnd();
      }
    } catch (err) {
      console.error("검색 실패:", err);
      setError(err.message);
      addDebugInfo(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductDetail = async (productNo) => {
    try {
      addDebugInfo(`Fetching details for product ${productNo}`);

      const accessToken = localStorage.getItem("cafe24_access_token");

      const response = await fetch("/api/cafe24-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: "getProduct",
          productNo: productNo,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.group(`📋 상품 #${productNo} 상세 정보`);
        console.log(data.product);
        console.groupEnd();
        addDebugInfo(`Product ${productNo} details loaded`);
      }
    } catch (error) {
      addDebugInfo(`Error loading product ${productNo}: ${error.message}`);
    }
  };

  // 키보드 단축키 (디버그 패널 토글)
  useEffect(() => {
    // 토큰 정보 확인
    console.log("Mall ID:", process.env.REACT_APP_CAFE24_MALL_ID);
    console.log("Token Scope:", localStorage.getItem("cafe24_token_scope"));
    console.log(
      "Token Expires:",
      new Date(parseInt(localStorage.getItem("cafe24_token_expires")))
    );

    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        setShowDebug(!showDebug);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showDebug]);

  return (
    <Container>
      <PageTitle>상품 관리</PageTitle>

      <SearchSection>
        <SectionTitle>상품 검색</SectionTitle>

        <SearchTypeGroup>
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
              searchType === "name"
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

          <ProductTable>
            <TableHeader>
              <tr>
                <th style={{ width: "60px" }}>번호</th>
                <th>상품명</th>
                <th style={{ width: "100px" }}>가격</th>
                <th style={{ width: "80px" }}>진열</th>
                <th style={{ width: "80px" }}>옵션</th>
                <th style={{ width: "100px" }}>액션</th>
              </tr>
            </TableHeader>
            <TableBody>
              {searchResults.map((product) => (
                <tr key={product.product_no}>
                  <td>{product.product_no}</td>
                  <td>
                    <ProductName>{product.product_name}</ProductName>
                    {product.product_code && (
                      <ProductCode>{product.product_code}</ProductCode>
                    )}
                  </td>
                  <td>
                    <Price>
                      {parseInt(product.price || 0).toLocaleString()}원
                    </Price>
                  </td>
                  <td>
                    <Badge $active={product.display === "T"}>
                      {product.display === "T" ? "진열" : "미진열"}
                    </Badge>
                  </td>
                  <td>
                    <Badge>
                      {product.option_type === "T"
                        ? "품목형"
                        : product.option_type === "F"
                        ? "연동형"
                        : "없음"}
                    </Badge>
                  </td>
                  <td>
                    <ActionButton
                      onClick={() => handleProductDetail(product.product_no)}
                    >
                      상세보기
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </TableBody>
          </ProductTable>
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

      {showDebug && debugInfo && (
        <DebugPanel>
          <pre>{debugInfo}</pre>
          <div style={{ marginTop: "8px", fontSize: "10px", opacity: 0.7 }}>
            Ctrl+D to toggle
          </div>
        </DebugPanel>
      )}
    </Container>
  );
};

export default ProductSearchPage;
