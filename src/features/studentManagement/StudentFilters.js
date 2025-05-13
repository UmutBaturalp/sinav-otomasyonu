import React, { useState, useEffect } from "react";
import {
  Radio,
  Card,
  Select,
  Form,
  Button,
  Space,
  Tooltip,
  Statistic,
  Row,
  Col,
  Divider,
  Alert,
  Badge,
  Checkbox,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { applyFilters, setCombinedFilters } from "./studentSlice";
import {
  QuestionCircleOutlined,
  FilterOutlined,
  TeamOutlined,
  NumberOutlined,
  BankOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  PartitionOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const StudentFilters = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.students.filters);
  const combinedFilters = useSelector(
    (state) => state.students.combinedFilters
  );
  const allStudents = useSelector((state) => state.students.allStudents);
  const filteredStudents = useSelector(
    (state) => state.students.filteredStudents
  );
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedCombos, setSelectedCombos] = useState([]);

  // Kombine filtre seçimlerini mevcut state ile senkronize et
  useEffect(() => {
    setSelectedCombos(combinedFilters);
  }, [combinedFilters]);

  // Filtreleme istatistikleri
  const totalStudents = allStudents.length;
  const filteredTotal = filteredStudents.length;
  const filterActive =
    filters.studentNumber !== "all" ||
    filters.program !== "all" ||
    combinedFilters.length > 0;

  // Eğitim türü dağılımı
  const dayProgramCount = allStudents.filter((s) => s.program === "day").length;
  const nightProgramCount = allStudents.filter(
    (s) => s.program === "night"
  ).length;

  // Tek/Çift numara dağılımı
  const evenNumberCount = allStudents.filter(
    (s) => s.studentNumber % 2 === 0
  ).length;
  const oddNumberCount = allStudents.filter(
    (s) => s.studentNumber % 2 !== 0
  ).length;

  // Kombinasyon dağılımları
  const oddDayCount = allStudents.filter(
    (s) => s.studentNumber % 2 !== 0 && s.program === "day"
  ).length;

  const oddNightCount = allStudents.filter(
    (s) => s.studentNumber % 2 !== 0 && s.program === "night"
  ).length;

  const evenDayCount = allStudents.filter(
    (s) => s.studentNumber % 2 === 0 && s.program === "day"
  ).length;

  const evenNightCount = allStudents.filter(
    (s) => s.studentNumber % 2 === 0 && s.program === "night"
  ).length;

  const handleFilterChange = (values) => {
    // Eğer kombine filtre aktifse ve temel filtreler değiştiriliyorsa kombine filtreleri temizle
    if (activeTab === "basic" && combinedFilters.length > 0) {
      dispatch(setCombinedFilters([]));
    }

    dispatch(applyFilters(values));
  };

  const handleCombinedFilterChange = (checkedValues) => {
    setSelectedCombos(checkedValues);
    dispatch(setCombinedFilters(checkedValues));
    dispatch(applyFilters({ combinedFilters: checkedValues }));
  };

  const resetFilters = () => {
    form.resetFields();
    setSelectedCombos([]);
    dispatch(setCombinedFilters([]));
    dispatch(
      applyFilters({
        studentNumber: "all",
        program: "all",
        resetCombined: true,
      })
    );
    setActiveTab("basic");
  };

  const tabChange = (key) => {
    setActiveTab(key);

    // Temel filtrelere geçildiğinde kombine filtreleri temizle
    if (key === "basic" && combinedFilters.length > 0) {
      dispatch(setCombinedFilters([]));
      dispatch(applyFilters({ resetCombined: true }));
    }
    // Kombine filtrelere geçildiğinde temel filtreleri temizle
    else if (
      key === "combined" &&
      (filters.studentNumber !== "all" || filters.program !== "all")
    ) {
      form.setFieldsValue({
        studentNumber: "all",
        program: "all",
      });
      dispatch(
        applyFilters({
          studentNumber: "all",
          program: "all",
        })
      );
    }
  };

  // Get filter tag color based on type
  const getFilterTagColor = (type) => {
    const colors = {
      studentNumber: "blue",
      program: "purple",
      combined: "volcano",
    };
    return colors[type] || "default";
  };

  return (
    <Card
      className="filter-card"
      title={
        <div className="card-title-with-badge">
          <FilterOutlined style={{ marginRight: 8 }} />
          <span>Öğrenci Filtreleri</span>
          {filterActive && (
            <Badge
              count={
                (filters.studentNumber !== "all" ? 1 : 0) +
                (filters.program !== "all" ? 1 : 0) +
                (combinedFilters.length > 0 ? 1 : 0)
              }
              style={{ marginLeft: 8 }}
            />
          )}
        </div>
      }
    >
      {filterActive && (
        <Alert
          message={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text strong>Filtre Aktif</Text>
              <Text type="secondary">
                {filteredTotal} / {totalStudents} öğrenci
              </Text>
            </div>
          }
          description={
            <div className="active-filters">
              {filters.studentNumber !== "all" && (
                <Tag
                  color={getFilterTagColor("studentNumber")}
                  className="filter-tag"
                >
                  {filters.studentNumber === "even"
                    ? "Çift Numaralı"
                    : "Tek Numaralı"}
                </Tag>
              )}
              {filters.program !== "all" && (
                <Tag
                  color={getFilterTagColor("program")}
                  className="filter-tag"
                >
                  {filters.program === "day"
                    ? "Örgün Öğretim"
                    : "İkinci Öğretim"}
                </Tag>
              )}
              {combinedFilters.length > 0 && (
                <div className="combined-filter-tags">
                  {combinedFilters.map((combo) => {
                    const [numType, progType] = combo.split("-");
                    return (
                      <Tag
                        key={combo}
                        color={getFilterTagColor("combined")}
                        className="filter-tag"
                      >
                        {numType === "odd" ? "Tek" : "Çift"} +{" "}
                        {progType === "day" ? "Örgün" : "İkinci"}
                      </Tag>
                    );
                  })}
                </div>
              )}
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={resetFilters}
            >
              Temizle
            </Button>
          }
        />
      )}

      <Tabs
        activeKey={activeTab}
        onChange={tabChange}
        type="card"
        className="filter-tabs"
      >
        <TabPane
          tab={
            <span>
              <FilterOutlined /> Temel Filtreler
            </span>
          }
          key="basic"
        >
          <Form
            form={form}
            initialValues={filters}
            onValuesChange={handleFilterChange}
            layout="vertical"
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item
                  name="studentNumber"
                  label={
                    <div className="form-label-with-icon">
                      <NumberOutlined />
                      <span>Öğrenci Numarası</span>
                      <Tooltip title="Öğrencileri tek/çift numaralara göre filtreleyin">
                        <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                      </Tooltip>
                    </div>
                  }
                >
                  <Radio.Group
                    buttonStyle="solid"
                    className="radio-button-group"
                  >
                    <Radio.Button value="all">
                      Tümü ({totalStudents})
                    </Radio.Button>
                    <Radio.Button value="even">
                      Çift ({evenNumberCount})
                    </Radio.Button>
                    <Radio.Button value="odd">
                      Tek ({oddNumberCount})
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="program"
                  label={
                    <div className="form-label-with-icon">
                      <BankOutlined />
                      <span>Eğitim Türü</span>
                      <Tooltip title="Öğrencileri örgün/ikinci öğretim durumuna göre filtreleyin">
                        <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                      </Tooltip>
                    </div>
                  }
                >
                  <Radio.Group
                    buttonStyle="solid"
                    className="radio-button-group"
                  >
                    <Radio.Button value="all">
                      Tümü ({totalStudents})
                    </Radio.Button>
                    <Radio.Button value="day">
                      Örgün ({dayProgramCount})
                    </Radio.Button>
                    <Radio.Button value="night">
                      İkinci ({nightProgramCount})
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>

              <Col span={24}>
                <div className="stats-container">
                  <Title level={5} className="stats-title">
                    <AppstoreOutlined /> Dağılım İstatistikleri
                  </Title>
                  <Row gutter={[16, 16]}>
                    <Col xs={12} md={6}>
                      <Statistic
                        title="Tek Numara"
                        value={oddNumberCount}
                        valueStyle={{ color: "#1677ff" }}
                        suffix={`/${totalStudents}`}
                      />
                    </Col>
                    <Col xs={12} md={6}>
                      <Statistic
                        title="Çift Numara"
                        value={evenNumberCount}
                        valueStyle={{ color: "#1677ff" }}
                        suffix={`/${totalStudents}`}
                      />
                    </Col>
                    <Col xs={12} md={6}>
                      <Statistic
                        title="Örgün"
                        value={dayProgramCount}
                        valueStyle={{ color: "#722ed1" }}
                        suffix={`/${totalStudents}`}
                      />
                    </Col>
                    <Col xs={12} md={6}>
                      <Statistic
                        title="İkinci"
                        value={nightProgramCount}
                        valueStyle={{ color: "#722ed1" }}
                        suffix={`/${totalStudents}`}
                      />
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </Form>
        </TabPane>

        <TabPane
          tab={
            <span>
              <PartitionOutlined /> Kombine Filtreler
            </span>
          }
          key="combined"
        >
          <div className="combined-filter-container">
            <div className="combined-filter-explanation">
              <Text>
                Kombine filtreleri kullanarak tek/çift numaralı ve örgün/ikinci
                öğretim öğrencilerini aynı anda seçebilirsiniz.
              </Text>
            </div>

            <Checkbox.Group
              className="combined-checkbox-group"
              value={selectedCombos}
              onChange={handleCombinedFilterChange}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div className="combo-checkbox-container">
                    <Checkbox value="odd-day" className="combo-checkbox">
                      <Space direction="vertical" size={0}>
                        <Text strong>Tek + Örgün</Text>
                        <Text type="secondary">{oddDayCount} öğrenci</Text>
                      </Space>
                    </Checkbox>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="combo-checkbox-container">
                    <Checkbox value="odd-night" className="combo-checkbox">
                      <Space direction="vertical" size={0}>
                        <Text strong>Tek + İkinci</Text>
                        <Text type="secondary">{oddNightCount} öğrenci</Text>
                      </Space>
                    </Checkbox>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="combo-checkbox-container">
                    <Checkbox value="even-day" className="combo-checkbox">
                      <Space direction="vertical" size={0}>
                        <Text strong>Çift + Örgün</Text>
                        <Text type="secondary">{evenDayCount} öğrenci</Text>
                      </Space>
                    </Checkbox>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="combo-checkbox-container">
                    <Checkbox value="even-night" className="combo-checkbox">
                      <Space direction="vertical" size={0}>
                        <Text strong>Çift + İkinci</Text>
                        <Text type="secondary">{evenNightCount} öğrenci</Text>
                      </Space>
                    </Checkbox>
                  </div>
                </Col>
              </Row>
            </Checkbox.Group>
          </div>
        </TabPane>
      </Tabs>

      <div className="filter-actions">
        <Button
          icon={<ReloadOutlined />}
          onClick={resetFilters}
          disabled={!filterActive}
        >
          Filtreleri Temizle
        </Button>
      </div>
    </Card>
  );
};

export default StudentFilters;
