import { configureStore } from "@reduxjs/toolkit";
import studentReducer from "../../features/studentManagement/studentSlice";
import classReducer from "../../features/classManagement/classSlice";

export const store = configureStore({
  reducer: {
    students: studentReducer,
    classes: classReducer,
  },
});
