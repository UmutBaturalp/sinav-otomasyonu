import React from "react";
import { Button, Space } from "antd";
import { UndoOutlined, RedoOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  undo as undoStudents,
  redo as redoStudents,
} from "../../features/studentManagement/studentSlice";
import {
  undo as undoClasses,
  redo as redoClasses,
} from "../../features/classManagement/classSlice";

const HistoryControl = () => {
  const dispatch = useDispatch();

  const studentHistory = useSelector((state) => state.students.history);
  const studentHistoryIndex = useSelector(
    (state) => state.students.currentHistoryIndex
  );

  const classHistory = useSelector((state) => state.classes.history);
  const classHistoryIndex = useSelector(
    (state) => state.classes.currentHistoryIndex
  );

  const handleUndo = () => {
    dispatch(undoStudents());
    dispatch(undoClasses());
  };

  const handleRedo = () => {
    dispatch(redoStudents());
    dispatch(redoClasses());
  };

  const canUndo = studentHistoryIndex > 0 || classHistoryIndex > 0;
  const canRedo =
    studentHistoryIndex < studentHistory.length - 1 ||
    classHistoryIndex < classHistory.length - 1;

  return (
    <Space style={{ marginBottom: 16 }}>
      <Button icon={<UndoOutlined />} onClick={handleUndo} disabled={!canUndo}>
        Geri Al
      </Button>
      <Button icon={<RedoOutlined />} onClick={handleRedo} disabled={!canRedo}>
        Yinele
      </Button>
    </Space>
  );
};

export default HistoryControl;
