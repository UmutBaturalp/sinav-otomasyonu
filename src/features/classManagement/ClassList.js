import React from "react";
import {
  Table,
  Button,
  Progress,
  Space,
  Popconfirm,
  Empty,
  Card,
  Statistic,
  Row,
  Col,
  message,
  Tag,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  TeamOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  NumberOutlined,
  BankOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { removeClass } from "./classSlice";
import { useWindowSize } from "../../shared/hooks/useWindowSize";

const ClassList = () => {
  const dispatch = useDispatch();
  const classes = useSelector((state) => state.classes.classes);
  const allStudents = useSelector((state) => state.students.allStudents);
  const combinedFilters = useSelector(
    (state) => state.students.combinedFilters
  );
  const { width } = useWindowSize();
  const isMobile = width <= 768;

  // Daha doğru doluluk hesaplaması için
  const getAssignedStudentsCount = (classId) => {
    return allStudents.filter((student) => student.assignedClass === classId)
      .length;
  };

  // Sınıfın içerdiği öğrenci gruplarını hesapla
  const getStudentGroupsInClass = (classId) => {
    const studentsInClass = allStudents.filter(
      (s) => s.assignedClass === classId
    );

    // Grupları say
    const groups = {
      "odd-day": 0,
      "odd-night": 0,
      "even-day": 0,
      "even-night": 0,
    };

    studentsInClass.forEach((student) => {
      const numberType = student.studentNumber % 2 === 0 ? "even" : "odd";
      const programType = student.program;
      groups[`${numberType}-${programType}`]++;
    });

    // Sayısı 0 olmayan grupları döndür
    return Object.entries(groups)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]); // En çok öğrencisi olan grup en başta
  };

  // Grup adını formatla
  const formatGroupName = (groupKey, count) => {
    const [numberType, programType] = groupKey.split("-");
    return {
      label: `${numberType === "odd" ? "Tek" : "Çift"} ${
        programType === "day" ? "Örgün" : "İkinci"
      }`,
      count,
      color: getGroupColor(groupKey),
    };
  };

  // Grup rengini belirle
  const getGroupColor = (groupKey) => {
    switch (groupKey) {
      case "odd-day":
        return "blue";
      case "odd-night":
        return "purple";
      case "even-day":
        return "cyan";
      case "even-night":
        return "magenta";
      default:
        return "default";
    }
  };

  const handleRemoveClass = (classId) => {
    // Sınıf silinmeden önce bu sınıfa atanmış öğrenci var mı kontrol et
    const assignedCount = getAssignedStudentsCount(classId);
    if (assignedCount > 0) {
      message.warning(
        `Bu sınıfta ${assignedCount} öğrenci bulunuyor. Önce öğrencileri başka sınıflara atayın.`
      );
      return;
    }

    dispatch(removeClass(classId));
  };

  const columns = [
    {
      title: "Sınıf Adı",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: isMobile ? 100 : 150,
    },
    {
      title: "Kapasite",
      dataIndex: "capacity",
      key: "capacity",
      width: isMobile ? 70 : 100,
      render: (capacity) => (
        <Statistic
          value={capacity}
          valueStyle={{ fontSize: isMobile ? "12px" : "14px" }}
        />
      ),
      responsive: ["sm"],
    },
    {
      title: "Doluluk",
      key: "occupancy",
      render: (_, record) => {
        const assignedCount = getAssignedStudentsCount(record.id);
        const percentage = Math.round((assignedCount / record.capacity) * 100);
        let color = "green";
        let statusIcon = <CheckCircleOutlined />;

        if (percentage >= 90) {
          color = "red";
          statusIcon = <WarningOutlined />;
        } else if (percentage >= 70) {
          color = "orange";
          statusIcon = <TeamOutlined />;
        }

        return (
          <Space direction="vertical" style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {!isMobile && statusIcon}
              <span>
                {assignedCount}/{record.capacity}
              </span>
            </div>
            <Progress
              percent={percentage}
              strokeColor={color}
              status={percentage >= 100 ? "exception" : "active"}
              size="small"
              format={(percent) => `${percent}%`}
            />
          </Space>
        );
      },
    },
    {
      title: (
        <span>
          Öğrenci Grupları{" "}
          <Tooltip title="Bu sınıfa atanmış öğrenci grupları">
            <InfoCircleOutlined />
          </Tooltip>
        </span>
      ),
      key: "studentGroups",
      render: (_, record) => {
        const groupsInClass = getStudentGroupsInClass(record.id);

        if (groupsInClass.length === 0) {
          return <span style={{ color: "#999" }}>Öğrenci atanmamış</span>;
        }

        return (
          <Space wrap>
            {groupsInClass.map(([groupKey, count]) => {
              const { label, color } = formatGroupName(groupKey, count);
              return (
                <Tag color={color} key={groupKey} style={{ margin: "2px" }}>
                  {isMobile
                    ? `${label.split(" ")[0]}:${count}`
                    : `${label}: ${count}`}
                </Tag>
              );
            })}
          </Space>
        );
      },
      responsive: ["md"],
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_, record) => {
        const assignedCount = getAssignedStudentsCount(record.id);

        return (
          <Space>
            <Popconfirm
              title="Bu sınıfı silmek istediğinize emin misiniz?"
              description={
                assignedCount > 0
                  ? `Bu sınıfta ${assignedCount} öğrenci var!`
                  : "Bu işlem geri alınamaz."
              }
              onConfirm={() => handleRemoveClass(record.id)}
              okText="Evet"
              cancelText="Hayır"
              disabled={assignedCount > 0}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size={isMobile ? "small" : "middle"}
                disabled={assignedCount > 0}
                title={
                  assignedCount > 0
                    ? "Önce öğrencileri başka sınıfa atayın"
                    : "Sınıfı sil"
                }
              >
                {!isMobile && "Sil"}
              </Button>
            </Popconfirm>
          </Space>
        );
      },
      width: isMobile ? 70 : 120,
      fixed: isMobile ? "right" : undefined,
    },
  ];

  const getSummary = () => (
    <Card style={{ marginBottom: "16px" }}>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={6} lg={6} xl={4}>
          <Statistic
            title="Toplam Sınıf"
            value={classes.length}
            prefix={<BankOutlined />}
          />
        </Col>
        <Col xs={12} sm={8} md={6} lg={6} xl={4}>
          <Statistic
            title="Toplam Kapasite"
            value={classes.reduce((sum, cls) => sum + cls.capacity, 0)}
            prefix={<TeamOutlined />}
          />
        </Col>
        <Col xs={12} sm={8} md={6} lg={6} xl={4}>
          <Statistic
            title="Atanmış Öğrenci"
            value={allStudents.filter((s) => s.assignedClass).length}
            prefix={<CheckCircleOutlined />}
          />
        </Col>
        <Col xs={12} sm={8} md={6} lg={6} xl={4}>
          <Statistic
            title="Ortalama Doluluk"
            value={
              classes.length
                ? Math.round(
                    (allStudents.filter((s) => s.assignedClass).length /
                      classes.reduce((sum, cls) => sum + cls.capacity, 0)) *
                      100
                  )
                : 0
            }
            suffix="%"
            prefix={<NumberOutlined />}
          />
        </Col>
      </Row>
    </Card>
  );

  return (
    <div className="class-list-container">
      {getSummary()}

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <BankOutlined style={{ marginRight: "8px" }} />
            <span>Sınıf Listesi</span>
          </div>
        }
        className="class-list-card"
      >
        {classes.length === 0 ? (
          <Empty
            description="Henüz hiç sınıf oluşturulmamış"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            rowKey="id"
            dataSource={classes}
            columns={columns}
            bordered
            pagination={false}
            size={isMobile ? "small" : "middle"}
            scroll={{ x: isMobile ? "max-content" : undefined }}
          />
        )}
      </Card>
    </div>
  );
};

export default ClassList;
