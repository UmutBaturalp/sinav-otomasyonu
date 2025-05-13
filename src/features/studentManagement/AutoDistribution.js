import React, { useState } from "react";
import {
  Card,
  Button,
  Radio,
  Space,
  message,
  Alert,
  Steps,
  Collapse,
  Row,
  Col,
  Statistic,
  Tooltip,
  Progress,
  Badge,
  Divider,
  Typography,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { distributeStudentsToClasses } from "../excelOperations/excelUtils";
import { setStudents } from "./studentSlice";
import {
  RocketOutlined,
  InfoCircleOutlined,
  BarChartOutlined,
  PartitionOutlined,
  OrderedListOutlined,
  TeamOutlined,
  FilterOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

const { Panel } = Collapse;
const { Step } = Steps;
const { Text, Title } = Typography;

const AutoDistribution = () => {
  const [distributionType, setDistributionType] = useState("balanced");
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const dispatch = useDispatch();
  const filteredStudents = useSelector(
    (state) => state.students.filteredStudents
  );
  const allStudents = useSelector((state) => state.students.allStudents);
  const classes = useSelector((state) => state.classes.classes);
  const filters = useSelector((state) => state.students.filters);
  const combinedFilters = useSelector(
    (state) => state.students.combinedFilters
  );

  // İstatistikler
  const totalStudents = filteredStudents.length;
  const unassignedCount = filteredStudents.filter(
    (s) => !s.assignedClass
  ).length;
  const assignedCount = totalStudents - unassignedCount;
  const totalCapacity = classes.reduce((sum, c) => sum + c.capacity, 0);
  const totalAssigned = classes.reduce(
    (sum, c) =>
      sum + filteredStudents.filter((s) => s.assignedClass === c.id).length,
    0
  );
  const remainingCapacity = totalCapacity - totalAssigned;

  // Program bazında dağılım
  const dayStudents = filteredStudents.filter(
    (s) => s.program === "day"
  ).length;
  const nightStudents = filteredStudents.filter(
    (s) => s.program === "night"
  ).length;

  // Tek/Çift numaralı öğrenci dağılımı
  const evenStudents = filteredStudents.filter(
    (s) => s.studentNumber % 2 === 0
  ).length;
  const oddStudents = filteredStudents.filter(
    (s) => s.studentNumber % 2 !== 0
  ).length;

  // Sınıflara göre doluluk oranları
  const classOccupancyRates = classes.map((c) => {
    const assignedToClass = filteredStudents.filter(
      (s) => s.assignedClass === c.id
    ).length;
    return {
      ...c,
      assignedCount: assignedToClass,
      occupancyRate: Math.round((assignedToClass / c.capacity) * 100),
    };
  });

  // Filtreleme aktif mi?
  const isFilterActive =
    filters.studentNumber !== "all" ||
    filters.program !== "all" ||
    combinedFilters.length > 0;

  const handleDistribute = () => {
    if (filteredStudents.length === 0) {
      message.error("Dağıtılacak öğrenci bulunamadı!");
      return;
    }

    if (classes.length === 0) {
      message.error("Önce sınıf eklemelisiniz!");
      return;
    }

    setLoading(true);

    try {
      // Kapasite kontrolleri
      if (totalAssigned >= totalCapacity) {
        message.warning(
          "Tüm sınıflar dolu! Daha fazla sınıf ekleyin veya kapasiteleri arttırın."
        );
        setLoading(false);
        return;
      }

      if (unassignedCount > remainingCapacity) {
        message.warning(
          `Uyarı: ${unassignedCount} öğrenci var ama sadece ${remainingCapacity} kapasiteli yer kaldı. Bazı öğrenciler atanmayacak.`
        );
      }

      // Dağıtımı yap
      const updatedStudents = distributeStudentsToClasses(
        filteredStudents,
        JSON.parse(JSON.stringify(classes)),
        distributionType
      );

      dispatch(setStudents(updatedStudents));

      // Sonuç bilgisi
      const assignedAfter = updatedStudents.filter(
        (s) => s.assignedClass
      ).length;
      const assignedNew = assignedAfter - assignedCount;

      if (assignedNew > 0) {
        message.success(
          `${assignedNew} öğrenci sınıflara yerleştirildi! Toplam ${assignedAfter} öğrenci atandı.`
        );
      } else {
        message.info("Tüm öğrenciler zaten sınıflara atanmış.");
      }
    } catch (error) {
      message.error("Dağıtım sırasında bir hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className="distribution-card"
      title={
        <div className="card-title-with-badge">
          <ThunderboltOutlined style={{ marginRight: 8 }} />
          <span>Otomatik Dağıtım</span>
          {unassignedCount > 0 && (
            <Badge
              count={unassignedCount}
              overflowCount={99}
              title={`${unassignedCount} öğrenci atanmamış`}
              style={{ marginLeft: 8 }}
            />
          )}
        </div>
      }
      extra={
        <Tooltip title="Dağıtım detaylarını göster/gizle">
          <Button
            icon={<InfoCircleOutlined />}
            onClick={() => setShowDetails(!showDetails)}
            type="text"
          />
        </Tooltip>
      }
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        {filteredStudents.length > 0 && (
          <div className="distribution-status">
            <Alert
              message={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text strong>Dağıtım Durumu</Text>
                  <Text
                    type={
                      unassignedCount > 0
                        ? remainingCapacity >= unassignedCount
                          ? "success"
                          : "danger"
                        : "success"
                    }
                    strong
                  >
                    {unassignedCount > 0
                      ? `${unassignedCount} öğrenci atanabilir ${
                          remainingCapacity >= unassignedCount ? "✓" : "✗"
                        }`
                      : "Tüm öğrenciler atandı ✓"}
                  </Text>
                </div>
              }
              description={
                <div className="distribution-stats">
                  <Progress
                    percent={Math.round((assignedCount / totalStudents) * 100)}
                    status={unassignedCount > 0 ? "active" : "success"}
                    format={() => `${assignedCount}/${totalStudents}`}
                  />

                  <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
                    <Col xs={8}>
                      <Statistic
                        title={<Text type="secondary">Toplam</Text>}
                        value={totalStudents}
                        valueStyle={{ fontSize: "16px" }}
                      />
                    </Col>
                    <Col xs={8}>
                      <Statistic
                        title={<Text type="secondary">Atanan</Text>}
                        value={assignedCount}
                        valueStyle={{ fontSize: "16px", color: "#52c41a" }}
                      />
                    </Col>
                    <Col xs={8}>
                      <Statistic
                        title={<Text type="secondary">Kapasite</Text>}
                        value={remainingCapacity}
                        valueStyle={{
                          fontSize: "16px",
                          color:
                            remainingCapacity >= unassignedCount
                              ? "#52c41a"
                              : "#f5222d",
                        }}
                      />
                    </Col>
                  </Row>
                </div>
              }
              type={remainingCapacity >= unassignedCount ? "info" : "warning"}
              showIcon
              style={{ marginBottom: 16 }}
            />
          </div>
        )}

        <div className="distribution-options">
          <Text strong>Dağıtım Yöntemi</Text>
          <Radio.Group
            value={distributionType}
            onChange={(e) => setDistributionType(e.target.value)}
            buttonStyle="solid"
            className="radio-button-group"
            style={{ marginTop: 8 }}
          >
            <Radio.Button value="balanced">
              <Tooltip title="Öğrencileri mümkün olduğunca eşit dağıtır">
                <Space>
                  <BarChartOutlined />
                  <span>Dengeli Dağıtım</span>
                </Space>
              </Tooltip>
            </Radio.Button>
            <Radio.Button value="byGroup">
              <Tooltip title="Tek/çift numaralı ve örgün/ikinci öğretim öğrencileri ayrı sınıflara dağıtır">
                <Space>
                  <PartitionOutlined />
                  <span>Gruplara Göre</span>
                </Space>
              </Tooltip>
            </Radio.Button>
          </Radio.Group>
        </div>

        {showDetails && (
          <div className="distribution-details">
            <Collapse bordered={false} defaultActiveKey={[]}>
              <Panel
                header={
                  <Text strong>
                    <InfoCircleOutlined /> Dağıtım Detayları
                  </Text>
                }
                key="1"
                className="distribution-panel"
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <Text type="secondary">Program Dağılımı:</Text>
                    <div
                      style={{ display: "flex", gap: "16px", marginTop: "8px" }}
                    >
                      <Statistic
                        title="Örgün Öğretim"
                        value={dayStudents}
                        suffix={`/${totalStudents}`}
                        valueStyle={{ fontSize: "14px" }}
                      />
                      <Statistic
                        title="İkinci Öğretim"
                        value={nightStudents}
                        suffix={`/${totalStudents}`}
                        valueStyle={{ fontSize: "14px" }}
                      />
                    </div>
                  </div>

                  <div>
                    <Text type="secondary">Numara Dağılımı:</Text>
                    <div
                      style={{ display: "flex", gap: "16px", marginTop: "8px" }}
                    >
                      <Statistic
                        title="Tek Numaralı"
                        value={oddStudents}
                        suffix={`/${totalStudents}`}
                        valueStyle={{ fontSize: "14px" }}
                      />
                      <Statistic
                        title="Çift Numaralı"
                        value={evenStudents}
                        suffix={`/${totalStudents}`}
                        valueStyle={{ fontSize: "14px" }}
                      />
                    </div>
                  </div>

                  {isFilterActive && (
                    <Alert
                      message="Filtreleme Aktif"
                      description="Şu anda sadece filtrelenen öğrenciler dağıtılacak. Filtrelerinizi temizleyerek tüm öğrencileri dağıtabilirsiniz."
                      type="warning"
                      showIcon
                    />
                  )}
                </Space>
              </Panel>
            </Collapse>
          </div>
        )}

        <div className="distribution-actions" style={{ marginTop: 16 }}>
          <Button
            type="primary"
            icon={<RocketOutlined />}
            onClick={handleDistribute}
            loading={loading}
            disabled={
              filteredStudents.length === 0 ||
              classes.length === 0 ||
              unassignedCount === 0
            }
            block
          >
            {unassignedCount > 0
              ? `${unassignedCount} Öğrenciyi Dağıt`
              : "Tüm Öğrenciler Dağıtıldı"}
          </Button>
        </div>
      </Space>
    </Card>
  );
};

export default AutoDistribution;
