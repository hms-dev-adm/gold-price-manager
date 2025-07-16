// src/components/ProductManager.js (새 파일 생성)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import SingleProductEditor from "./SingleProductEditor";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const Header = styled.header`
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  /* border-radius: 10px; */
  margin-bottom: 30px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2.5rem;
  font-weight: 300;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 15px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const Section = styled.section`
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const TabButton = styled.button`
  background: ${(props) => (props.active ? "#007bff" : "#f8f9fa")};
  color: ${(props) => (props.active ? "white" : "#333")};
  border: 1px solid #ddd;
  padding: 12px 24px;
  cursor: pointer;
  border-radius: 4px 4px 0 0;
  margin-right: 5px;

  &:hover {
    background: ${(props) => (props.active ? "#0056b3" : "#e9ecef")};
  }
`;

const ProductManager = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("single");

  const handleBackToAuth = () => {
    navigate("/auth");
  };

  return (
    <Container>
      <Header>
        <Title>상품 가격 수정페이지</Title>
        <BackButton onClick={handleBackToAuth}>← Auth 컴포넌트로</BackButton>
      </Header>

      <Section>
        <div style={{ marginBottom: "20px" }}>
          <TabButton
            $active={activeTab === "single"}
            onClick={() => setActiveTab("single")}
          >
            단일 상품 수정
          </TabButton>
          <TabButton
            $active={activeTab === "bulk"}
            onClick={() => setActiveTab("bulk")}
          >
            일괄 가격 수정
          </TabButton>
        </div>

        {activeTab === "single" && <SingleProductEditor />}
        {activeTab === "bulk" && <div>asdfasdf</div>}
      </Section>
    </Container>
  );
};

export default ProductManager;
