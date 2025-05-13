import React, { useState } from "react";
import { Form, Input, Button, InputNumber, Card, Alert, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { addClass } from "./classSlice";

const ClassForm = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const classes = useSelector((state) => state.classes.classes);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (values) => {
    setSubmitting(true);
    try {
      // Check if class name already exists
      const classNameExists = classes.some(
        (c) => c.name.toLowerCase() === values.name.toLowerCase()
      );

      if (classNameExists) {
        form.setFields([
          {
            name: "name",
            errors: [
              "Bu sınıf adı zaten mevcut. Lütfen farklı bir isim seçin.",
            ],
          },
        ]);
        setSubmitting(false);
        return;
      }

      dispatch(
        addClass({
          name: values.name,
          capacity: parseInt(values.capacity, 10),
        })
      );
      message.success(`${values.name} sınıfı başarıyla eklendi.`);
      form.resetFields();
    } catch (error) {
      message.error(`Sınıf eklenirken bir hata oluştu: ${error.message}`);
      console.error("Sınıf eklenirken hata:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="Yeni Sınıf Ekle" style={{ marginBottom: 16 }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ capacity: 30 }}
        validateMessages={{
          required: "${label} alanı zorunludur!",
          types: {
            number: "${label} geçerli bir sayı olmalıdır!",
          },
          number: {
            min: "${label} değeri ${min} veya daha büyük olmalıdır!",
            max: "${label} değeri ${max} veya daha küçük olmalıdır!",
          },
        }}
      >
        <Form.Item
          name="name"
          label="Sınıf Adı"
          rules={[
            { required: true, message: "Lütfen sınıf adını giriniz!" },
            { min: 2, message: "Sınıf adı en az 2 karakter olmalıdır!" },
            { max: 20, message: "Sınıf adı en fazla 20 karakter olabilir!" },
          ]}
          tooltip="Örneğin: A101, Laboratuvar-1, vb."
        >
          <Input placeholder="Örn: A101, Lab1, vb." />
        </Form.Item>

        <Form.Item
          name="capacity"
          label="Kapasite"
          rules={[
            { required: true, message: "Lütfen sınıf kapasitesini giriniz!" },
            { type: "number", min: 1, message: "Kapasite en az 1 olmalıdır!" },
          ]}
          tooltip="Sınıfa yerleştirilebilecek maksimum öğrenci sayısı"
        >
          <InputNumber min={1} max={500} style={{ width: "100%" }} />
        </Form.Item>

        {classes.length > 0 && (
          <Alert
            message={`${classes.length} sınıf tanımlandı`}
            description={`Toplam kapasite: ${classes.reduce(
              (sum, c) => sum + c.capacity,
              0
            )} öğrenci`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            Sınıf Ekle
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ClassForm;
