import React, { useState } from "react";
import { Button, message, Card, Space, Tooltip } from "antd";
import { FileExcelOutlined, DownloadOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { generateExcelReport } from "./excelUtils";
import { useWindowSize } from "../../shared/hooks/useWindowSize";

const ExportExcel = () => {
  const [loading, setLoading] = useState(false);
  const allStudents = useSelector((state) => state.students.allStudents);
  const classes = useSelector((state) => state.classes.classes);
  const { width } = useWindowSize();
  const isMobile = width <= 768;

  const assignedStudents = allStudents.filter((s) => s.assignedClass).length;

  const handleExport = () => {
    if (allStudents.length === 0) {
      message.error("Dışa aktarılacak öğrenci bulunamadı!");
      return;
    }

    if (classes.length === 0) {
      message.error("Dışa aktarılacak sınıf bulunamadı!");
      return;
    }

    setLoading(true);

    try {
      generateExcelReport(allStudents, classes);
      message.success("Excel dosyası başarıyla oluşturuldu!");
    } catch (error) {
      message.error(
        "Excel dosyası oluşturulurken bir hata oluştu: " + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className="export-excel-card"
      title={
        <Space>
          <DownloadOutlined />
          <span>Dışa Aktar</span>
        </Space>
      }
      size={isMobile ? "small" : "default"}
    >
      <Tooltip
        title={
          assignedStudents === 0 ? "Önce öğrencileri sınıflara atayın" : ""
        }
      >
        <Button
          type="primary"
          icon={<FileExcelOutlined />}
          onClick={handleExport}
          loading={loading}
          disabled={
            allStudents.length === 0 ||
            classes.length === 0 ||
            assignedStudents === 0
          }
          block={isMobile}
          size={isMobile ? "middle" : "large"}
        >
          {isMobile ? "Excel'e Aktar" : "Sınıf Listelerini Excel'e Aktar"}
        </Button>
      </Tooltip>

      {allStudents.length > 0 && classes.length > 0 && (
        <div
          style={{
            marginTop: "8px",
            fontSize: isMobile ? "12px" : "14px",
            color: "#8c8c8c",
          }}
        >
          {assignedStudents} / {allStudents.length} öğrenci sınıflara atanmış
        </div>
      )}
    </Card>
  );
};

export default ExportExcel;
