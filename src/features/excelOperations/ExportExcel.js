import React, { useState } from "react";
import { Button, message } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { generateExcelReport } from "./excelUtils";

const ExportExcel = () => {
  const [loading, setLoading] = useState(false);
  const allStudents = useSelector((state) => state.students.allStudents);
  const classes = useSelector((state) => state.classes.classes);

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
    <Button
      type="primary"
      icon={<FileExcelOutlined />}
      onClick={handleExport}
      loading={loading}
      disabled={allStudents.length === 0 || classes.length === 0}
      style={{ marginBottom: 16 }}
    >
      Sınıf Listelerini Excel'e Aktar
    </Button>
  );
};

export default ExportExcel;
