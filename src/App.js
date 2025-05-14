import React from "react";
import { Layout, Typography, Row, Col, Space } from "antd";
import "./App.css";

// Import components
import FileUploader from "./features/excelOperations/FileUploader";
import StudentFilters from "./features/studentManagement/StudentFilters";
import StudentList from "./features/studentManagement/StudentList";
import ClassForm from "./features/classManagement/ClassForm";
import ClassList from "./features/classManagement/ClassList";
import AutoDistribution from "./features/studentManagement/AutoDistribution";
import ExportExcel from "./features/excelOperations/ExportExcel";
import HistoryControl from "./shared/ui/HistoryControl";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

function App() {
  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={20} sm={16} md={12} lg={12}>
            <Title level={3} className="app-title">
              Sınav Otomasyonu
            </Title>
          </Col>
          <Col xs={24} sm={8} md={12} lg={12} style={{ textAlign: "right" }}>
            <HistoryControl />
          </Col>
        </Row>
      </Header>

      <Layout className="main-content-layout">
        <Content className="main-content">
          <div className="content-section">
            <div className="section-header">
              <Title level={4} className="section-title">
                Excel İşlemleri
              </Title>
            </div>
            <FileUploader />
          </div>

          <div className="content-section">
            <div className="section-header">
              <Title level={4} className="section-title">
                Sınıf Yönetimi
              </Title>
            </div>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={24} lg={8}>
                <ClassForm />
              </Col>
              <Col xs={24} sm={24} md={24} lg={16}>
                <ClassList />
              </Col>
            </Row>
          </div>

          <div className="content-section">
            <div className="section-header">
              <Title level={4} className="section-title">
                Öğrenci Yönetimi
              </Title>
            </div>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12} lg={8}>
                <div className="side-tools">
                  <StudentFilters />
                  <Space
                    direction="vertical"
                    style={{ width: "100%", marginTop: "16px" }}
                    size="middle"
                  >
                    <AutoDistribution />
                    <ExportExcel />
                  </Space>
                </div>
              </Col>
              <Col xs={24} sm={24} md={12} lg={16}>
                <StudentList />
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>

      <Footer className="app-footer">
        Sınav Otomasyonu © {new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}

export default App;
