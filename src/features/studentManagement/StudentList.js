import React, { useState, useEffect } from "react";
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
import { useWindowSize } from "../../shared/hooks/useWindowSize";

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
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const isTablet = width > 768 && width <= 992;

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
            columns={getResponsiveColumns()}
            dataSource={filteredStudents.filter(
              (s) => s.program === record.program
            )}
            pagination={false}
            rowKey="id"
            className="student-list-table"
            scroll={isMobile ? { x: "max-content" } : {}}
          />
        );
        rowExpandable = (record) => record.isGroupHeader === true;
        break;
      case "studentNumber":
        expandedRowRender = (record) => (
          <Table
            columns={getResponsiveColumns()}
            dataSource={filteredStudents.filter((s) =>
              record.numberType === "even"
                ? s.studentNumber % 2 === 0
                : s.studentNumber % 2 !== 0
            )}
            pagination={false}
            rowKey="id"
            className="student-list-table"
            scroll={isMobile ? { x: "max-content" } : {}}
          />
        );
        rowExpandable = (record) => record.isGroupHeader === true;
        break;
      case "classYear":
        expandedRowRender = (record) => (
          <Table
            columns={getResponsiveColumns().filter(
              (col) => col.key !== "classYear"
            )}
            dataSource={filteredStudents.filter(
              (s) => s.classYear === record.classYear
            )}
            pagination={false}
            rowKey="id"
            className="student-list-table"
            scroll={isMobile ? { x: "max-content" } : {}}
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

  // Responsive columns
  const getResponsiveColumns = () => {
    const baseColumns = [
      {
        title: "Öğrenci No",
        dataIndex: "studentNumber",
        key: "studentNumber",
        sorter: (a, b) => a.studentNumber - b.studentNumber,
        render: (num) => <Text strong>{num}</Text>,
        fixed: "left",
        width: isMobile ? 80 : 120,
      },
      {
        title: "Ad",
        dataIndex: "name",
        key: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (text) => <Text>{text}</Text>,
        ellipsis: true,
      },
      {
        title: "Soyad",
        dataIndex: "surname",
        key: "surname",
        sorter: (a, b) => a.surname.localeCompare(b.surname),
        render: (text) => <Text>{text}</Text>,
        ellipsis: true,
      },
      {
        title: "Program",
        dataIndex: "program",
        key: "program",
        render: (program) => (
          <Tag
            color={program === "day" ? "blue" : "purple"}
            style={{ minWidth: "60px", textAlign: "center" }}
          >
            {program === "day" ? "Örgün" : "İkinci"}
          </Tag>
        ),
        responsive: ["md"],
      },
      {
        title: "Sınıf",
        dataIndex: "classYear",
        key: "classYear",
        render: (year) => (
          <Tag color="default" style={{ textAlign: "center" }}>
            {year}. Sınıf
          </Tag>
        ),
        responsive: ["md"],
      },
      {
        title: "Atama",
        key: "assignedClass",
        render: (_, record) => {
          // Sınıfa atanmışsa, atanan sınıfı göster
          const assignedClass = record.assignedClass
            ? classes.find((c) => c.id === record.assignedClass)
            : null;

          return (
            <Select
              placeholder="Sınıf Seç"
              style={{ width: isMobile ? 100 : 150 }}
              value={record.assignedClass || undefined}
              onChange={(value) =>
                handleClassAssignment(record.id, value, record.assignedClass)
              }
              allowClear
              dropdownMatchSelectWidth={false}
            >
              {classes.map((cls) => {
                // Sınıfın doluluk oranını hesapla
                const assignedCount = getAssignedStudentsCount(cls.id);
                const isFull = assignedCount >= cls.capacity;
                const percentage = Math.round(
                  (assignedCount / cls.capacity) * 100
                );

                return (
                  <Option
                    key={cls.id}
                    value={cls.id}
                    disabled={isFull && cls.id !== record.assignedClass}
                  >
                    <Tooltip
                      title={`${assignedCount}/${cls.capacity} öğrenci (${percentage}% dolu)`}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span>{cls.name}</span>
                        {isFull && (
                          <Badge status="error" style={{ marginLeft: "5px" }} />
                        )}
                      </div>
                    </Tooltip>
                  </Option>
                );
              })}
            </Select>
          );
        },
      },
    ];

    // Mobile'da bazı kolonları birleştir
    if (isMobile) {
      return [
        baseColumns[0], // Öğrenci No
        {
          title: "Ad Soyad",
          key: "fullName",
          render: (_, record) => (
            <div>
              <div>{record.name}</div>
              <div>{record.surname}</div>
              {record.program === "day" ? (
                <Tag color="blue" size="small">
                  Ö
                </Tag>
              ) : (
                <Tag color="purple" size="small">
                  İ
                </Tag>
              )}
              <Tag color="default" size="small">
                {record.classYear}. Sınıf
              </Tag>
            </div>
          ),
        },
        baseColumns[5], // Atama
      ];
    } else if (isTablet) {
      return [
        baseColumns[0], // Öğrenci No
        baseColumns[1], // Ad
        baseColumns[2], // Soyad
        {
          title: "Bilgi",
          key: "info",
          render: (_, record) => (
            <div style={{ display: "flex", gap: "4px" }}>
              <Tag color={record.program === "day" ? "blue" : "purple"}>
                {record.program === "day" ? "Örgün" : "İkinci"}
              </Tag>
              <Tag color="default">{record.classYear}. Sınıf</Tag>
            </div>
          ),
        },
        baseColumns[5], // Atama
      ];
    }

    return baseColumns;
  };

  const getAssignedStudentsCount = (classId) => {
    return filteredStudents.filter((s) => s.assignedClass === classId).length;
  };

  // Gruplandırılmış veri oluşturucu
  const getGroupedData = () => {
    if (groupBy === "none") return filteredStudents;

    // Grup başlıkları ve veri
    let groupedData = [];
    let groupHeaders = [];

    switch (groupBy) {
      case "program":
        // Program türüne göre grup başlıkları oluştur
        groupHeaders = [
          {
            id: "header-day",
            isGroupHeader: true,
            program: "day",
            name: "Örgün Öğretim",
            studentCount: dayProgramStudents,
          },
          {
            id: "header-night",
            isGroupHeader: true,
            program: "night",
            name: "İkinci Öğretim",
            studentCount: nightProgramStudents,
          },
        ];
        // Boş olanları filtrele
        groupHeaders = groupHeaders.filter((header) => header.studentCount > 0);
        groupedData = [...groupHeaders];
        break;

      case "studentNumber":
        // Tek/Çift numaraya göre grup başlıkları
        groupHeaders = [
          {
            id: "header-odd",
            isGroupHeader: true,
            numberType: "odd",
            name: "Tek Numaralı Öğrenciler",
            studentCount: oddNumberStudents,
          },
          {
            id: "header-even",
            isGroupHeader: true,
            numberType: "even",
            name: "Çift Numaralı Öğrenciler",
            studentCount: evenNumberStudents,
          },
        ];
        groupedData = [...groupHeaders];
        break;

      case "classYear":
        // Sınıf yılına göre grup
        Object.entries(yearDistribution).forEach(([year, count]) => {
          groupHeaders.push({
            id: `header-year-${year}`,
            isGroupHeader: true,
            classYear: year,
            name: `${year}. Sınıf Öğrencileri`,
            studentCount: count,
          });
        });
        // Sınıf yılına göre sırala
        groupHeaders.sort((a, b) => a.classYear - b.classYear);
        groupedData = [...groupHeaders];
        break;

      default:
        return filteredStudents;
    }

    return groupedData;
  };

  return (
    <Card
      title={
        <div className="student-list-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <TeamOutlined />
            <span>Öğrenci Listesi</span>
            <Badge
              count={filteredStudents.length}
              style={{ backgroundColor: "#1677ff" }}
            />
          </div>

          <Radio.Group
            value={groupBy}
            onChange={handleGroupingChange}
            buttonStyle="solid"
            size={isMobile ? "small" : "middle"}
          >
            <Radio.Button value="none">Gruplandırma</Radio.Button>
            <Radio.Button value="program">Program</Radio.Button>
            <Radio.Button value="studentNumber">Tek/Çift</Radio.Button>
            <Radio.Button value="classYear">Sınıf</Radio.Button>
          </Radio.Group>
        </div>
      }
      className="student-list-card"
    >
      {filteredStudents.length === 0 ? (
        <Empty
          description="Eşleşen öğrenci bulunamadı"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <>
          <div className="student-list-summary">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8} md={6} lg={6}>
                <Statistic
                  title="Toplam Öğrenci"
                  value={totalStudents}
                  prefix={<TeamOutlined />}
                />
              </Col>
              <Col xs={12} sm={8} md={6} lg={6}>
                <Statistic
                  title="Atanmış"
                  value={assignedStudents}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col xs={12} sm={8} md={6} lg={6}>
                <Statistic
                  title="Atanmamış"
                  value={unassignedStudents}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: "#fa541c" }}
                />
              </Col>
              <Col xs={12} sm={8} md={6} lg={6}>
                <Statistic
                  title="Atama Oranı"
                  value={
                    totalStudents
                      ? Math.round((assignedStudents / totalStudents) * 100)
                      : 0
                  }
                  suffix="%"
                  prefix={<AppstoreOutlined />}
                />
              </Col>
            </Row>
          </div>

          <Table
            columns={getResponsiveColumns()}
            dataSource={
              groupBy === "none" ? filteredStudents : getGroupedData()
            }
            rowKey="id"
            rowClassName={getRowClassName}
            expandable={getExpandableConfig()}
            pagination={
              filteredStudents.length > 10
                ? {
                    pageSize: 10,
                    showTotal: (total) => `Toplam ${total} öğrenci`,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50"],
                  }
                : false
            }
            className="student-list-table"
            size={isMobile ? "small" : "middle"}
            scroll={isMobile ? { x: "max-content" } : {}}
          />
        </>
      )}
    </Card>
  );
};

export default StudentList;
