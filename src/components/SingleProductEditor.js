//cafe24 상품 관련 기능 조회, 수정 기능함수들 모음
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import ProductService from "../services/ProductService";

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Section = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  margin-bottom: 15px;
`;

const Button = styled.button`
  background: ${(props) =>
    props.variant === "danger" ? "#dc3545" : "#007bff"};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 10px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ProductCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
`;

const ProductInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const OptionList = styled.div`
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
`;

const OptionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 10px;
`;

const PriceInput = styled.input`
  width: 120px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: right;
`;

const Badge = styled.span`
  background: ${(props) => {
    switch (props.type) {
      case "T":
        return "#28a745";
      case "F":
        return "#007bff";
      case "N":
        return "#6c757d";
      default:
        return "#6c757d";
    }
  }};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-left: 10px;
`;

const SingleProductEditor = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [variants, setVariants] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await ProductService.getProducts();
      setProducts(response.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProductDetails = async (productNo) => {
    setLoading(true);
    setError("");

    try {
      // 상품 상세 정보 조회
      const productResponse = await ProductService.getProduct(productNo);
      const product = productResponse.product;
      setProductDetails(product);

      console.log("상품 상세 정보:", product);

      // 옵션 타입에 따라 추가 정보 조회
      if (product.option_type === "T") {
        // 품목생성형 옵션 조회
        const variantsResponse = await ProductService.getVariants(productNo);
        setVariants(variantsResponse.variants || []);
        setOptions([]);
        console.log("품목생성형 옵션:", variantsResponse.variants);
      } else if (product.option_type === "F") {
        // 상품연동형 옵션 조회
        const optionsResponse = await ProductService.getOptions(productNo);
        setOptions(optionsResponse.options || []);
        setVariants([]);
        console.log("상품연동형 옵션:", optionsResponse.options);
      } else {
        // 옵션 없음
        setVariants([]);
        setOptions([]);
      }
    } catch (err) {
      console.error("상품 상세 조회 실패:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    loadProductDetails(product.product_no);
  };

  const updateBasicPrice = async (newPrice) => {
    if (!selectedProduct) return;

    setLoading(true);
    try {
      await ProductService.updateProductPrice(selectedProduct.product_no, {
        price: newPrice,
        retail_price: newPrice,
        supply_price: Math.floor(newPrice * 0.8),
      });

      alert("기본 가격이 수정되었습니다.");
      loadProductDetails(selectedProduct.product_no);
    } catch (err) {
      alert("가격 수정 실패: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateVariantPrice = async (variantCode, newPrice) => {
    if (!selectedProduct) return;

    setLoading(true);
    try {
      await ProductService.updateVariantPrice(
        selectedProduct.product_no,
        variantCode,
        {
          price: newPrice,
          retail_price: newPrice,
          supply_price: Math.floor(newPrice * 0.8),
        }
      );

      alert("품목 가격이 수정되었습니다.");
      loadProductDetails(selectedProduct.product_no);
    } catch (err) {
      alert("가격 수정 실패: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOptionPrice = async (optionNo, optionValues) => {
    if (!selectedProduct) return;

    setLoading(true);
    try {
      await ProductService.updateOptionPrice(
        selectedProduct.product_no,
        optionNo,
        {
          option_value: optionValues,
        }
      );

      alert("옵션 가격이 수정되었습니다.");
      loadProductDetails(selectedProduct.product_no);
    } catch (err) {
      alert("가격 수정 실패: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOptionTypeLabel = (type) => {
    switch (type) {
      case "T":
        return "품목생성형";
      case "F":
        return "상품연동형";
      case "N":
        return "옵션없음";
      default:
        return "알 수 없음";
    }
  };

  return (
    <Container>
      <Title>단일 상품 가격 수정</Title>

      {error && (
        <div style={{ color: "red", marginBottom: "20px" }}>{error}</div>
      )}

      {/* 상품 검색 */}
      <Section>
        <h3>상품 검색</h3>
        <SearchInput
          type="text"
          placeholder="상품명"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          {filteredProducts.map((product) => (
            <ProductCard key={product.product_no}>
              <ProductInfo>
                <div>
                  <strong>{product.product_name}</strong>
                  <Badge type={product.option_type}>
                    {getOptionTypeLabel(product.option_type)}
                  </Badge>
                </div>
                <div>
                  <span>{parseInt(product.price).toLocaleString()}원</span>
                  <Button
                    onClick={() => handleProductSelect(product)}
                    disabled={loading}
                  >
                    선택
                  </Button>
                </div>
              </ProductInfo>
            </ProductCard>
          ))}
        </div>
      </Section>

      {/* 선택된 상품 정보 */}
      {selectedProduct && (
        <Section>
          <h3>선택된 상품: {selectedProduct.product_name}</h3>

          {productDetails && (
            <div>
              <p>
                <strong>상품 번호:</strong> {productDetails.product_no}
              </p>
              <p>
                <strong>옵션 타입:</strong>{" "}
                {getOptionTypeLabel(productDetails.option_type)}
              </p>
              <p>
                <strong>현재 가격:</strong>{" "}
                {parseInt(productDetails.price).toLocaleString()}원
              </p>

              {/* 기본 가격 수정 */}
              <div style={{ marginTop: "15px" }}>
                <strong>기본 가격 수정:</strong>
                <PriceInput
                  type="number"
                  defaultValue={productDetails.price}
                  onBlur={(e) => {
                    const newPrice = parseInt(e.target.value);
                    if (newPrice !== parseInt(productDetails.price)) {
                      updateBasicPrice(newPrice);
                    }
                  }}
                />
                원
              </div>
            </div>
          )}

          {/* 품목생성형 옵션 */}
          {variants.length > 0 && (
            <OptionList>
              <h4>품목생성형 옵션 ({variants.length}개)</h4>
              {variants.map((variant) => (
                <OptionItem key={variant.variant_code}>
                  <div>
                    <strong>{variant.option_text}</strong>
                    <br />
                    <small>품목 코드: {variant.variant_code}</small>
                  </div>
                  <div>
                    <PriceInput
                      type="number"
                      defaultValue={variant.price}
                      onBlur={(e) => {
                        const newPrice = parseInt(e.target.value);
                        if (newPrice !== parseInt(variant.price)) {
                          updateVariantPrice(variant.variant_code, newPrice);
                        }
                      }}
                    />
                    원
                  </div>
                </OptionItem>
              ))}
            </OptionList>
          )}

          {/* 상품연동형 옵션 */}
          {options.length > 0 && (
            <OptionList>
              <h4>상품연동형 옵션 ({options.length}개)</h4>
              {options.map((option) => (
                <div key={option.option_no}>
                  <h5>{option.option_name}</h5>
                  {option.option_value.map((value, index) => (
                    <OptionItem key={index}>
                      <div>
                        <strong>{value.option_text}</strong>
                      </div>
                      <div>
                        추가금액:
                        <PriceInput
                          type="number"
                          defaultValue={value.additional_amount || 0}
                          onBlur={(e) => {
                            const newAmount = parseInt(e.target.value);
                            const updatedValues = [...option.option_value];
                            updatedValues[index].additional_amount = newAmount;
                            updateOptionPrice(option.option_no, updatedValues);
                          }}
                        />
                        원
                      </div>
                    </OptionItem>
                  ))}
                </div>
              ))}
            </OptionList>
          )}
        </Section>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "20px" }}>처리 중...</div>
      )}
    </Container>
  );
};

export default SingleProductEditor;
