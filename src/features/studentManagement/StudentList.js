import React, { useState } from "react";
import {
  Table,
  Tag,
  Select,
  Empty,
  Tooltip,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Divider,
  Radio,
  Alert,
  Badge,
  Space,
  Button,
} from "antd";
import {
  TeamOutlined,
  InfoCircleOutlined,
  UserOutlined,
  AppstoreOutlined,
  ClusterOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import {
  assignStudentToClass,
  unassignStudent,
  setGroupBy,
} from "./studentSlice";
import {
  incrementClassCount,
  decrementClassCount,
} from "../classManagement/classSlice";
import "./StudentList.css";

const { Option } = Select;
const { Text, Title } = Typography;

const StudentList = () => {
  const dispatch = useDispatch();
  const filteredStudents = useSelector(
    (state) => state.students.filteredStudents
  );
  const filters = useSelector((state) => state.students.filters);
  const groupBy = useSelector((state) => state.students.groupBy);
  const classes = useSelector((state) => state.classes.classes);

  // Ek istatistikler hesapla
  const totalStudents = filteredStudents.length;
  const assignedStudents = filteredStudents.filter(
    (s) => s.assignedClass
  ).length;
  const unassignedStudents = totalStudents - assignedStudents;

  // Program türlerine göre istatistikler
  const dayProgramStudents = filteredStudents.filter(
    (s) => s.program === "day"
  ).length;
  const nightProgramStudents = filteredStudents.filter(
    (s) => s.program === "night"
  ).length;

  // Tek/Çift numaralı öğrenciler
  const evenNumberStudents = filteredStudents.filter(
    (s) => s.studentNumber % 2 === 0
  ).length;
  const oddNumberStudents = filteredStudents.filter(
    (s) => s.studentNumber % 2 !== 0
  ).length;

  // Sınıf yıllarına göre dağılım
  const yearDistribution = {};
  filteredStudents.forEach((student) => {
    yearDistribution[student.classYear] =
      (yearDistribution[student.classYear] || 0) + 1;
  });

  // Atama işlevleri
  const handleClassAssignment = (studentId, classId, previousClassId) => {
    // If unassigning
    if (!classId && previousClassId) {
      dispatch(unassignStudent(studentId));
      dispatch(decrementClassCount(previousClassId));
      return;
    }

    // If changing class
    if (previousClassId) {
      dispatch(decrementClassCount(previousClassId));
    }

    // Assign new class
    dispatch(assignStudentToClass({ studentId, classId }));
    dispatch(incrementClassCount(classId));
  };

  // Gruplandırma seçimini işle
  const handleGroupingChange = (e) => {
    dispatch(setGroupBy(e.target.value));
  };

  // Gruplandırma fonksiyonu
  const getRowClassName = (record) => {
    let className = record.assignedClass ? "assigned-student-row " : "";

    // Program türüne göre renklendirme
    if (record.program === "day") {
      className += "day-program-row ";
    } else {
      className += "night-program-row ";
    }

    // Tek/Çift numaralı öğrencileri ayrı renklerde göster
    className +=
      record.studentNumber % 2 === 0 ? "even-number-row " : "odd-number-row ";

    return className;
  };

  // Tabloda gruplandırma için expandable yapısı
  const getExpandableConfig = () => {
    if (groupBy === "none") return {};

    let expandedRowRender;
    let rowExpandable;
    let expandRowByClick = true;

    switch (groupBy) {
      case "program":
        expandedRowRender = (record) => (
          <Table
            columns={columns.filter((col) => col.key !== "program")}
            dataSource={filteredStudents.filter(
              (s) => s.program === record.program
            )}
            pagination={false}
            rowKey="id"
            className="student-list-table"
          />
        );
        rowExpandable = (record) => record.isGroupHeader === true;
        break;
      case "studentNumber":
        expandedRowRender = (record) => (
          <Table
            columns={columns}
            dataSource={filteredStudents.filter((s) =>
              record.numberType === "even"
                ? s.studentNumber % 2 === 0
                : s.studentNumber % 2 !== 0
            )}
            pagination={false}
            rowKey="id"
            className="student-list-table"
          />
        );
        rowExpandable = (record) => record.isGroupHeader === true;
        break;
      case "classYear":
        expandedRowRender = (record) => (
          <Table
            columns={columns.filter((col) => col.key !== "classYear")}
            dataSource={filteredStudents.filter(
              (s) => s.classYear === record.classYear
            )}
            pagination={false}
            rowKey="id"
          />
        );
        rowExpandable = (record) => record.isGroupHeader === true;
        break;
      default:
        return {};
    }

    return {
      expandedRowRender,
      rowExpandable,
      expandRowByClick,
    };
  };

  const columns = [
    {
      title: "Öğrenci No",
      dataIndex: "studentNumber",
      key: "studentNumber",
      sorter: (a, b) => a.studentNumber - b.studentNumber,
      render: (num) => <Text strong>{num}</Text>,
      fixed: "left",
      width: 120,
    },
    {
      title: "Ad",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Soyad",
      dataIndex: "surname",
      key: "surname",
      sorter: (a, b) => a.surname.localeCompare(b.surname),
    },
    {
      title: "Eğitim Türü",
      dataIndex: "program",
      key: "program",
      render: (program) => {
        let color, text, description;

        if (program === "day") {
          color = "blue";
          text = "Örgün Öğretim";
          description = "Normal öğretim programı";
        } else {
          color = "purple";
          text = "İkinci Öğretim";
          description = "Akşam/İkinci öğretim programı";
        }

        return (
          <Tooltip title={description}>
            <Tag color={color}>{text}</Tag>
          </Tooltip>
        );
      },
      filters: [
        { text: "Örgün Öğretim", value: "day" },
        { text: "İkinci Öğretim", value: "night" },
      ],
      onFilter: (value, record) => record.program === value,
    },
    {
      title: "Sınıf",
      dataIndex: "classYear",
      key: "classYear",
      render: (year) => `${year}. Sınıf`,
      filters: [
        { text: "1. Sınıf", value: "1" },
        { text: "2. Sınıf", value: "2" },
        { text: "3. Sınıf", value: "3" },
        { text: "4. Sınıf", value: "4" },
      ],
      onFilter: (value, record) => record.classYear === value,
    },
    {
      title: "Atanacağı Sınıf",
      key: "assignedClass",
      render: (_, record) => {
        const availableClasses = classes.filter((c) => {
          const currentCount = getAssignedStudentsCount(c.id);
          return currentCount < c.capacity || record.assignedClass === c.id;
        });

        return (
          <Select
            style={{ width: 160 }}
            value={record.assignedClass}
            onChange={(classId) =>
              handleClassAssignment(record.id, classId, record.assignedClass)
            }
            placeholder="Sınıf seçin"
            allowClear
          >
            {availableClasses.map((cls) => {
              const currentCount = getAssignedStudentsCount(cls.id);
              const isFull =
                currentCount >= cls.capacity && record.assignedClass !== cls.id;
              const occupancyRate = Math.round(
                (currentCount / cls.capacity) * 100
              );

              return (
                <Option key={cls.id} value={cls.id} disabled={isFull}>
                  <Tooltip
                    title={`${currentCount}/${cls.capacity} - ${occupancyRate}% dolu`}
                  >
                    {cls.name}{" "}
                    {isFull ? "(Dolu)" : `(${currentCount}/${cls.capacity})`}
                  </Tooltip>
                </Option>
              );
            })}
          </Select>
        );
      },
    },
    {
      title: "Durum",
      key: "status",
      render: (_, record) => {
        if (record.assignedClass) {
          const assignedClass = classes.find(
            (c) => c.id === record.assignedClass
          );
          return (
            <div className="assigned-to-class">
              <CheckCircleOutlined />
              <span>{assignedClass ? assignedClass.name : "Atandı"}</span>
            </div>
          );
        }
        return (
          <div className="unassigned-to-class">
            <ExclamationCircleOutlined />
            <span>Atanmamış</span>
          </div>
        );
      },
    },
  ];

  const getAssignedStudentsCount = (classId) => {
    return filteredStudents.filter((s) => s.assignedClass === classId).length;
  };

  const getGroupedData = () => {
    if (groupBy === "none") return filteredStudents;

    const groupedData = [];

    if (groupBy === "program") {
      // Önce örgün öğrenciler
      if (dayProgramStudents > 0) {
        groupedData.push({
          id: "group-day",
          name: "Örgün Öğretim Öğrencileri",
          program: "day",
          isGroupHeader: true,
          studentCount: dayProgramStudents,
        });
      }

      // Sonra ikinci öğretim öğrenciler
      if (nightProgramStudents > 0) {
        groupedData.push({
          id: "group-night",
          name: "İkinci Öğretim Öğrencileri",
          program: "night",
          isGroupHeader: true,
          studentCount: nightProgramStudents,
        });
      }
    } else if (groupBy === "studentNumber") {
      // Önce tek numaralı öğrenciler
      if (oddNumberStudents > 0) {
        groupedData.push({
          id: "group-odd",
          name: "Tek Numaralı Öğrenciler",
          numberType: "odd",
          isGroupHeader: true,
          studentCount: oddNumberStudents,
        });
      }

      // Sonra çift numaralı öğrenciler
      if (evenNumberStudents > 0) {
        groupedData.push({
          id: "group-even",
          name: "Çift Numaralı Öğrenciler",
          numberType: "even",
          isGroupHeader: true,
          studentCount: evenNumberStudents,
        });
      }
    }

    return groupedData;
  };

  return (
    <Card
      className="student-list-card"
      title={
        <div className="student-list-header">
          <div className="card-title-with-badge">
            <TeamOutlined style={{ marginRight: 8 }} />
            <span>Öğrenci Listesi</span>
            <Badge
              count={totalStudents}
              style={{ marginLeft: 8 }}
              overflowCount={999}
            />
          </div>
        </div>
      }
    >
      {filteredStudents.length > 0 ? (
        <>
          <div className="student-list-controls">
            <div>
              <Text strong>Görünüm:</Text>
              <Radio.Group
                onChange={handleGroupingChange}
                value={groupBy}
                buttonStyle="solid"
                style={{ marginLeft: 8 }}
              >
                <Radio.Button value="none">
                  <AppstoreOutlined /> Tümü
                </Radio.Button>
                <Radio.Button value="program">
                  <UserOutlined /> Eğitim Türüne Göre
                </Radio.Button>
                <Radio.Button value="studentNumber">
                  <ClusterOutlined /> Numaraya Göre
                </Radio.Button>
              </Radio.Group>
            </div>
          </div>

          <div className="student-list-summary">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Toplam Öğrenci"
                  value={totalStudents}
                  prefix={<TeamOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Atanan Öğrenci"
                  value={assignedStudents}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Tek Numaralı"
                  value={oddNumberStudents}
                  suffix={`/${totalStudents}`}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Çift Numaralı"
                  value={evenNumberStudents}
                  suffix={`/${totalStudents}`}
                />
              </Col>
            </Row>
          </div>

          <div className="student-list-table">
            <Table
              columns={columns}
              dataSource={
                groupBy === "none" ? filteredStudents : getGroupedData()
              }
              rowKey="id"
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50", "100"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} arası gösteriliyor (toplam ${total})`,
              }}
              rowClassName={getRowClassName}
              expandable={getExpandableConfig()}
              scroll={{ x: "max-content" }}
            />
          </div>
        </>
      ) : (
        <div className="empty-student-list">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Öğrenci bulunamadı. Lütfen öğrenci ekleyin veya filtrelerinizi değiştirin."
          />
        </div>
      )}
    </Card>
  );
};

export default StudentList;
