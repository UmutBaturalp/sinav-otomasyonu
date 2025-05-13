import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allStudents: [],
  filteredStudents: [],
  filters: {
    studentNumber: "all", // 'even', 'odd', 'all'
    program: "all", // 'day', 'night', 'all'
  },
  combinedFilters: [], // ['odd-day', 'even-night', etc.]
  groupBy: "none", // 'none', 'program', 'studentNumber', 'combined'
  history: [],
  currentHistoryIndex: -1,
};

export const studentSlice = createSlice({
  name: "students",
  initialState,
  reducers: {
    setStudents: (state, action) => {
      state.allStudents = action.payload;
      state.filteredStudents = action.payload;

      // Update history
      const newState = {
        ...state,
        allStudents: [...state.allStudents],
        filteredStudents: [...state.filteredStudents],
      };

      state.history = [
        ...state.history.slice(0, state.currentHistoryIndex + 1),
        newState,
      ];
      state.currentHistoryIndex = state.history.length - 1;
    },
    applyFilters: (state, action) => {
      // Önce filtreleri güncelle
      state.filters = { ...state.filters, ...action.payload };

      // Temel filtrelemeyi uygula
      let filtered = [...state.allStudents];

      // CombinedFilters varsa, o filtreleri uygula
      if (action.payload.combinedFilters) {
        state.combinedFilters = action.payload.combinedFilters;

        if (state.combinedFilters.length > 0) {
          filtered = filtered.filter((student) => {
            const numberType = student.studentNumber % 2 === 0 ? "even" : "odd";
            const programType = student.program;

            // Öğrencinin kombinasyon içinde olup olmadığını kontrol et
            return state.combinedFilters.some((combo) => {
              const [numFilter, progFilter] = combo.split("-");
              return numFilter === numberType && progFilter === programType;
            });
          });

          // Kombine filtre kullanılıyorsa, diğer tekil filtreleri devre dışı bırak
          state.filters.studentNumber = "all";
          state.filters.program = "all";
        }
      } else if (
        state.combinedFilters.length > 0 &&
        !action.payload.resetCombined
      ) {
        // Eğer mevcut kombinasyon filtreleri varsa ve resetCombined belirtilmemişse, kombinasyonları uygula
        filtered = filtered.filter((student) => {
          const numberType = student.studentNumber % 2 === 0 ? "even" : "odd";
          const programType = student.program;

          return state.combinedFilters.some((combo) => {
            const [numFilter, progFilter] = combo.split("-");
            return numFilter === numberType && progFilter === programType;
          });
        });
      } else {
        // Standart filtreleri uygula
        // Filter by student number (even/odd)
        if (state.filters.studentNumber === "even") {
          filtered = filtered.filter(
            (student) => student.studentNumber % 2 === 0
          );
        } else if (state.filters.studentNumber === "odd") {
          filtered = filtered.filter(
            (student) => student.studentNumber % 2 !== 0
          );
        }

        // Filter by program (day/night)
        if (state.filters.program !== "all") {
          filtered = filtered.filter(
            (student) => student.program === state.filters.program
          );
        }
      }

      // Filtreleme sonrası grup bilgisi ekle
      if (
        state.filters.studentNumber === "all" ||
        state.filters.program === "all" ||
        state.combinedFilters.length > 0
      ) {
        // Öğrencileri gruplandırarak işaretle (UI'da gruplanmış gösterim için)
        filtered = filtered.map((student) => {
          const studentInfo = { ...student };

          // Öğrenci numarasına göre tek/çift grubu belirle
          if (
            state.filters.studentNumber === "all" ||
            state.combinedFilters.length > 0
          ) {
            studentInfo.numberGroup =
              student.studentNumber % 2 === 0 ? "even" : "odd";
          }

          // Program grubunu belirle
          if (
            state.filters.program === "all" ||
            state.combinedFilters.length > 0
          ) {
            studentInfo.programGroup = student.program;
          }

          // Kombinasyon grubu belirle
          if (state.combinedFilters.length > 0) {
            const numberType = student.studentNumber % 2 === 0 ? "even" : "odd";
            const programType = student.program;
            studentInfo.combinedGroup = `${numberType}-${programType}`;
          }

          return studentInfo;
        });
      }

      state.filteredStudents = filtered;

      // Update history
      const newState = {
        ...state,
        allStudents: [...state.allStudents],
        filteredStudents: [...state.filteredStudents],
        filters: { ...state.filters },
        combinedFilters: [...state.combinedFilters],
      };

      state.history = [
        ...state.history.slice(0, state.currentHistoryIndex + 1),
        newState,
      ];
      state.currentHistoryIndex = state.history.length - 1;
    },
    setCombinedFilters: (state, action) => {
      state.combinedFilters = action.payload;

      // Kombine filtreleri uygulamak için applyFilters reducer'ı çağrılmalı
      // Bu reducer direkt filtrelemeyi yapmaz, sadece state'i günceller
    },
    clearCombinedFilters: (state) => {
      state.combinedFilters = [];

      // applyFilters ile birlikte çağrılmalı
    },
    setGroupBy: (state, action) => {
      state.groupBy = action.payload;
    },
    assignStudentToClass: (state, action) => {
      const { studentId, classId } = action.payload;

      // Update students in both arrays
      const studentInAll = state.allStudents.find((s) => s.id === studentId);
      if (studentInAll) {
        studentInAll.assignedClass = classId;
      }

      const studentInFiltered = state.filteredStudents.find(
        (s) => s.id === studentId
      );
      if (studentInFiltered) {
        studentInFiltered.assignedClass = classId;
      }

      // Update history
      const newState = {
        ...state,
        allStudents: [...state.allStudents],
        filteredStudents: [...state.filteredStudents],
      };

      state.history = [
        ...state.history.slice(0, state.currentHistoryIndex + 1),
        newState,
      ];
      state.currentHistoryIndex = state.history.length - 1;
    },
    unassignStudent: (state, action) => {
      const studentId = action.payload;

      // Update students in both arrays
      const studentInAll = state.allStudents.find((s) => s.id === studentId);
      if (studentInAll) {
        studentInAll.assignedClass = null;
      }

      const studentInFiltered = state.filteredStudents.find(
        (s) => s.id === studentId
      );
      if (studentInFiltered) {
        studentInFiltered.assignedClass = null;
      }

      // Update history
      const newState = {
        ...state,
        allStudents: [...state.allStudents],
        filteredStudents: [...state.filteredStudents],
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
        state.allStudents = prevState.allStudents;
        state.filteredStudents = prevState.filteredStudents;
        state.filters = prevState.filters || state.filters;
        state.combinedFilters = prevState.combinedFilters || [];
      }
    },
    redo: (state) => {
      if (state.currentHistoryIndex < state.history.length - 1) {
        state.currentHistoryIndex += 1;
        const nextState = state.history[state.currentHistoryIndex];
        state.allStudents = nextState.allStudents;
        state.filteredStudents = nextState.filteredStudents;
        state.filters = nextState.filters || state.filters;
        state.combinedFilters = nextState.combinedFilters || [];
      }
    },
  },
});

export const {
  setStudents,
  applyFilters,
  setCombinedFilters,
  clearCombinedFilters,
  setGroupBy,
  assignStudentToClass,
  unassignStudent,
  undo,
  redo,
} = studentSlice.actions;

export default studentSlice.reducer;
