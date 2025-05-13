import React, { useState } from "react";
import {
  Upload,
  Button,
  message,
  Space,
  Alert,
  Typography,
  Tag,
  Descriptions,
} from "antd";
import {
  UploadOutlined,
  ExperimentOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { parseExcelFile } from "./excelUtils";
import { setStudents } from "../studentManagement/studentSlice";
import { addClass } from "../classManagement/classSlice";
import {
  generateSampleStudents,
  generateSampleClasses,
} from "../../shared/utils/sampleData";

const { Text, Link } = Typography;

const FileUploader = () => {
  const [loading, setLoading] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const [error, setError] = useState(null);
  const [uploadStats, setUploadStats] = useState(null);
  const dispatch = useDispatch();
  const allStudents = useSelector((state) => state.students.allStudents);

  const handleUpload = async (file) => {
    setLoading(true);
    setError(null);
    setUploadStats(null);
    try {
      const students = await parseExcelFile(file);

      if (students.length === 0) {
        setError(
          "Excel dosyasında öğrenci verisi bulunamadı. Lütfen dosya formatını kontrol edin."
        );
        return false;
      }

      // Validate student data
      const invalidEntries = students.filter(
        (s) =>
          !s.name ||
          !s.surname ||
          isNaN(s.studentNumber) ||
          s.studentNumber === 0
      );

      // Calculate upload statistics
      const dayStudents = students.filter((s) => s.program === "day").length;
      const nightStudents = students.filter(
        (s) => s.program === "night"
      ).length;
      const totalStudents = students.length;

      setUploadStats({
        total: totalStudents,
        day: dayStudents,
        night: nightStudents,
        invalid: invalidEntries.length,
      });

      if (invalidEntries.length > 0) {
        message.warning(
          `${invalidEntries.length} öğrencide eksik veya hatalı bilgi var. Bu öğrenciler işlenecek ama kontrol edilmeli.`
        );
      }

      dispatch(setStudents(students));
      message.success(`${students.length} öğrenci başarıyla yüklendi.`);
    } catch (error) {
      setError(error.message);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
    return false; // Prevent default upload behavior
  };

  const handleLoadSampleData = () => {
    setLoadingSample(true);
    setError(null);
    setUploadStats(null);
    try {
      // Load sample students
      const students = generateSampleStudents();

      // Calculate upload statistics
      const dayStudents = students.filter((s) => s.program === "day").length;
      const nightStudents = students.filter(
        (s) => s.program === "night"
      ).length;
      const totalStudents = students.length;

      setUploadStats({
        total: totalStudents,
        day: dayStudents,
        night: nightStudents,
        invalid: 0,
      });

      dispatch(setStudents(students));

      // Load sample classes
      const classes = generateSampleClasses();
      classes.forEach((classObj) => {
        dispatch(addClass(classObj));
      });

      message.success("Örnek veriler başarıyla yüklendi.");
    } catch (error) {
      setError("Örnek veriler yüklenirken bir hata oluştu: " + error.message);
      message.error(
        "Örnek veriler yüklenirken bir hata oluştu: " + error.message
      );
    } finally {
      setLoadingSample(false);
    }
  };

  const uploadProps = {
    name: "file",
    accept: ".xlsx, .xls",
    showUploadList: false,
    beforeUpload: handleUpload,
  };

  return (
    <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }}>
      <Space>
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />} loading={loading} type="primary">
            Excel Dosyası Yükle
          </Button>
        </Upload>

        <Button
          icon={<ExperimentOutlined />}
          loading={loadingSample}
          onClick={handleLoadSampleData}
        >
          Örnek Veri Yükle
        </Button>
      </Space>

      {error && (
        <Alert
          message="Yükleme Hatası"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
        />
      )}

      {uploadStats && (
        <Alert
          message={`${uploadStats.total} öğrenci yüklendi`}
          description={
            <Descriptions size="small" column={2}>
              <Descriptions.Item label="Örgün Öğretim">
                <Tag color="blue">{uploadStats.day} öğrenci</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="İkinci Öğretim">
                <Tag color="purple">{uploadStats.night} öğrenci</Tag>
              </Descriptions.Item>
              {uploadStats.invalid > 0 && (
                <Descriptions.Item label="Eksik/Hatalı">
                  <Tag color="red">{uploadStats.invalid} öğrenci</Tag>
                </Descriptions.Item>
              )}
            </Descriptions>
          }
          type="success"
          showIcon
        />
      )}

      <Text type="secondary">
        Excel dosyanızın <Text code>Öğrenci No</Text>, <Text code>Ad</Text>,{" "}
        <Text code>Soyad</Text>, <Text code>Eğitim Türü</Text> sütunlarını
        içerdiğinden emin olun. Eğitim türü sütununda "Örgün" veya "İkinci
        Öğretim" değerleri olmalıdır.
      </Text>
    </Space>
  );
};

export default FileUploader;
