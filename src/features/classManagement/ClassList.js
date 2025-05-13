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

const ClassList = () => {
  const dispatch = useDispatch();
  const classes = useSelector((state) => state.classes.classes);
  const allStudents = useSelector((state) => state.students.allStudents);
  const combinedFilters = useSelector(
    (state) => state.students.combinedFilters
  );

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
    },
    {
      title: "Kapasite",
      dataIndex: "capacity",
      key: "capacity",
      render: (capacity) => (
        <Statistic value={capacity} valueStyle={{ fontSize: "14px" }} />
      ),
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
              {statusIcon}
              <span>
                {assignedCount}/{record.capacity} öğrenci
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
                <Tag color={color} key={groupKey}>
                  {label}: {count}
                </Tag>
              );
            })}
          </Space>
        );
      },
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
              onConfirm={() => handleRemoveClass(record.id)}
              okText="Evet"
              cancelText="Hayır"
              disabled={assignedCount > 0}
            >
              <Button
                icon={<DeleteOutlined />}
                danger
                disabled={assignedCount > 0}
                title={
                  assignedCount > 0 ? "Öğrenci atanmış sınıflar silinemez" : ""
                }
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  // Sınıf istatistikleri
  const totalCapacity = classes.reduce((sum, c) => sum + c.capacity, 0);
  const totalAssignedStudents = allStudents.filter(
    (s) => s.assignedClass
  ).length;
  const remainingCapacity = totalCapacity - totalAssignedStudents;

  if (!classes.length) {
    return <Empty description="Henüz sınıf eklenmedi" />;
  }

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Toplam Sınıf"
              value={classes.length}
              prefix={<TeamOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic title="Toplam Kapasite" value={totalCapacity} />
          </Col>
          <Col span={8}>
            <Statistic
              title="Boş Kontenjan"
              value={remainingCapacity}
              valueStyle={{ color: remainingCapacity > 0 ? "green" : "red" }}
            />
          </Col>
        </Row>

        {combinedFilters.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 8 }}>
              <strong>Aktif Grup Filtreleri:</strong>
            </div>
            <Space wrap>
              {combinedFilters.map((combo) => {
                const [numType, progType] = combo.split("-");
                return (
                  <Tag key={combo} color={getGroupColor(combo)}>
                    {numType === "odd" ? "Tek" : "Çift"}{" "}
                    {progType === "day" ? "Örgün" : "İkinci Öğretim"}
                  </Tag>
                );
              })}
            </Space>
          </div>
        )}
      </Card>

      <Table
        columns={columns}
        dataSource={classes}
        rowKey="id"
        pagination={false}
        title={() => <h3>Sınıf Listesi</h3>}
      />
    </>
  );
};

export default ClassList;
