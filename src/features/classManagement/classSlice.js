import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  classes: [],
  history: [],
  currentHistoryIndex: -1,
};

export const classSlice = createSlice({
  name: "classes",
  initialState,
  reducers: {
    addClass: (state, action) => {
      const newClass = {
        id: Date.now().toString(),
        name: action.payload.name,
        capacity: action.payload.capacity,
        currentCount: 0,
      };

      // Add the new class
      state.classes.push(newClass);

      // Update history
      const newState = {
        ...state,
        classes: [...state.classes],
      };

      state.history = [
        ...state.history.slice(0, state.currentHistoryIndex + 1),
        newState,
      ];
      state.currentHistoryIndex = state.history.length - 1;
    },
    removeClass: (state, action) => {
      state.classes = state.classes.filter((c) => c.id !== action.payload);

      // Update history
      const newState = {
        ...state,
        classes: [...state.classes],
      };

      state.history = [
        ...state.history.slice(0, state.currentHistoryIndex + 1),
        newState,
      ];
      state.currentHistoryIndex = state.history.length - 1;
    },
    incrementClassCount: (state, action) => {
      const classToUpdate = state.classes.find((c) => c.id === action.payload);
      if (classToUpdate) {
        classToUpdate.currentCount += 1;
      }

      // Update history
      const newState = {
        ...state,
        classes: [...state.classes],
      };

      state.history = [
        ...state.history.slice(0, state.currentHistoryIndex + 1),
        newState,
      ];
      state.currentHistoryIndex = state.history.length - 1;
    },
    decrementClassCount: (state, action) => {
      const classToUpdate = state.classes.find((c) => c.id === action.payload);
      if (classToUpdate && classToUpdate.currentCount > 0) {
        classToUpdate.currentCount -= 1;
      }

      // Update history
      const newState = {
        ...state,
        classes: [...state.classes],
      };

      state.history = [
        ...state.history.slice(0, state.currentHistoryIndex + 1),
        newState,
      ];
      state.currentHistoryIndex = state.history.length - 1;
    },
    editClass: (state, action) => {
      const { id, name, capacity } = action.payload;
      const classToUpdate = state.classes.find((c) => c.id === id);

      if (classToUpdate) {
        classToUpdate.name = name;
        classToUpdate.capacity = capacity;
      }

      // Update history
      const newState = {
        ...state,
        classes: [...state.classes],
      };

      state.history = [
        ...state.history.slice(0, state.currentHistoryIndex + 1),
        newState,
      ];
      state.currentHistoryIndex = state.history.length - 1;
    },
    undo: (state) => {
      if (state.currentHistoryIndex > 0) {
        state.currentHistoryIndex -= 1;
        const prevState = state.history[state.currentHistoryIndex];
        state.classes = prevState.classes;
      }
    },
    redo: (state) => {
      if (state.currentHistoryIndex < state.history.length - 1) {
        state.currentHistoryIndex += 1;
        const nextState = state.history[state.currentHistoryIndex];
        state.classes = nextState.classes;
      }
    },
  },
});

export const {
  addClass,
  removeClass,
  incrementClassCount,
  decrementClassCount,
  editClass,
  undo,
  redo,
} = classSlice.actions;

export default classSlice.reducer;
