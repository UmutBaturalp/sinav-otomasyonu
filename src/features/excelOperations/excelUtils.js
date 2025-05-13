import * as XLSX from "xlsx";

// Parse Excel file and convert to JSON
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // Assume first sheet is our data
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Parse to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Debug log to check data format
        console.log("Excel data parsed:", jsonData[0]);

        // Get column names for debugging
        if (jsonData.length > 0) {
          console.log("Available columns:", Object.keys(jsonData[0]));
        }

        // Transform data to match our application structure
        const students = jsonData.map((row, index) => {
          // Check education type directly
          const educationType =
            row["Eğitim Türü"] ||
            row.EğitimTürü ||
            row["Egitim Türü"] ||
            row.program ||
            "";
          console.log(`Student ${index} education type:`, educationType);

          const student = {
            id: index.toString(),
            studentNumber: parseInt(
              row["Öğrenci No"] || row.studentNumber || row.ÖğrenciNo || "0",
              10
            ),
            name: row["Ad"] || row.name || "",
            surname: row["Soyad"] || row.surname || "",
            program: mapEducationType(educationType),
            classYear: extractClassYear(row["Sınıf"] || row.classYear || "1"),
            assignedClass: null,
          };

          // Debug: log mapped program
          console.log(
            `Student ${student.studentNumber} mapped to program:`,
            student.program
          );

          return student;
        });

        resolve(students);
      } catch (error) {
        reject(
          new Error("Excel dosyası işlenirken hata oluştu: " + error.message)
        );
      }
    };

    reader.onerror = () => {
      reject(new Error("Dosya okuma hatası"));
    };

    reader.readAsArrayBuffer(file);
  });
};

// Helper function to map education type to our program format
function mapEducationType(educationType) {
  if (!educationType) return "day";

  const eduTypeStr = educationType.toString();
  // Check for direct match first (case sensitive)
  if (
    eduTypeStr === "İkinci Öğretim" ||
    eduTypeStr === "İkinci öğretim" ||
    eduTypeStr === "İkinci Oğretim" ||
    eduTypeStr === "İkinci oğretim"
  ) {
    return "night";
  }

  // Then do case-insensitive checks
  const lowerType = eduTypeStr.toLowerCase();

  if (
    lowerType.includes("ikinci") ||
    lowerType.includes("gece") ||
    lowerType.includes("night") ||
    lowerType.includes("i.ö") ||
    lowerType.includes("i.o") ||
    lowerType.includes("iö") ||
    lowerType.includes("io") ||
    lowerType === "ii" ||
    lowerType === "2" ||
    lowerType === "2." ||
    lowerType.includes("second")
  ) {
    return "night";
  }

  return "day"; // Default is day program (örgün)
}

// Helper function to extract class year
function extractClassYear(classYearText) {
  // Try to extract numeric value if exists
  const match = classYearText.match(/\d+/);
  if (match) {
    return match[0];
  }

  // Default to 1st year
  return "1";
}

// Create and export Excel file with class assignments
export const generateExcelReport = (students, classes) => {
  // Group students by assigned class
  const studentsByClass = {};
  const unassignedStudents = students.filter(
    (student) => !student.assignedClass
  );

  students.forEach((student) => {
    if (student.assignedClass) {
      if (!studentsByClass[student.assignedClass]) {
        studentsByClass[student.assignedClass] = [];
      }
      studentsByClass[student.assignedClass].push(student);
    }
  });

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Stil tanımlamaları
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "4472C4" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    },
  };

  const cellStyle = {
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    },
  };

  // 1. Tüm öğrencilerin listesi - Ana sayfa
  const allStudentsData = students.map((student, index) => {
    const assignedClass = classes.find((c) => c.id === student.assignedClass);
    return {
      "Sıra No": index + 1,
      "Öğrenci No": student.studentNumber,
      Ad: student.name,
      Soyad: student.surname,
      "Eğitim Türü": student.program === "day" ? "Örgün" : "İkinci Öğretim",
      Sınıf: student.classYear,
      "Atanan Sınav Salonu": assignedClass ? assignedClass.name : "Atanmamış",
    };
  });

  const allStudentsSheet = XLSX.utils.json_to_sheet(allStudentsData);
  XLSX.utils.book_append_sheet(workbook, allStudentsSheet, "Tüm Öğrenciler");

  // Sütun genişliklerini ayarla
  const wscols = [
    { wch: 8 }, // Sıra No
    { wch: 12 }, // Öğrenci No
    { wch: 15 }, // Ad
    { wch: 15 }, // Soyad
    { wch: 20 }, // Eğitim Türü
    { wch: 10 }, // Sınıf
    { wch: 20 }, // Atanan Sınav Salonu
  ];

  allStudentsSheet["!cols"] = wscols;

  // 2. Özet sayfası
  const summaryData = classes.map((classObj, index) => {
    const studentsInClass = studentsByClass[classObj.id] || [];
    const occupancyRate = (studentsInClass.length / classObj.capacity) * 100;

    return {
      "Sıra No": index + 1,
      "Sınav Salonu": classObj.name,
      Kapasite: classObj.capacity,
      "Öğrenci Sayısı": studentsInClass.length,
      "Doluluk Oranı": `${Math.round(occupancyRate)}%`,
      Durum:
        occupancyRate >= 100
          ? "DOLU"
          : occupancyRate >= 90
          ? "KRİTİK"
          : "UYGUN",
    };
  });

  // En sona boş kontenjan bilgisi
  summaryData.push({
    "Sıra No": "",
    "Sınav Salonu": "TOPLAM",
    Kapasite: classes.reduce((sum, c) => sum + c.capacity, 0),
    "Öğrenci Sayısı": students.length - unassignedStudents.length,
    "Doluluk Oranı": "",
    Durum: `${unassignedStudents.length} atanmamış öğrenci`,
  });

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Özet");

  // 3. Her sınıf için ayrı sayfa
  classes.forEach((classObj) => {
    const studentsInClass = studentsByClass[classObj.id] || [];

    if (studentsInClass.length > 0) {
      const classData = studentsInClass.map((student, index) => ({
        "Sıra No": index + 1,
        "Öğrenci No": student.studentNumber,
        Ad: student.name,
        Soyad: student.surname,
        "Eğitim Türü": student.program === "day" ? "Örgün" : "İkinci Öğretim",
        Sınıf: student.classYear,
      }));

      const classSheet = XLSX.utils.json_to_sheet(classData);
      XLSX.utils.book_append_sheet(
        workbook,
        classSheet,
        `Salon: ${classObj.name}`
      );
    }
  });

  // 4. Atanmamış öğrenciler sayfası
  if (unassignedStudents.length > 0) {
    const unassignedData = unassignedStudents.map((student, index) => ({
      "Sıra No": index + 1,
      "Öğrenci No": student.studentNumber,
      Ad: student.name,
      Soyad: student.surname,
      "Eğitim Türü": student.program === "day" ? "Örgün" : "İkinci Öğretim",
      Sınıf: student.classYear,
    }));

    const unassignedSheet = XLSX.utils.json_to_sheet(unassignedData);
    XLSX.utils.book_append_sheet(
      workbook,
      unassignedSheet,
      "Atanmamış Öğrenciler"
    );
  }

  // Excel dosyasını indir
  XLSX.writeFile(workbook, "Sınav_Salonları_Dağılımı.xlsx");
};

// Automatic distribution of students to classes based on filters and class capacities
export const distributeStudentsToClasses = (
  students,
  classes,
  distributionType = "balanced"
) => {
  if (!students.length || !classes.length) return students;

  // Deep copy students to avoid modifying the original array
  const updatedStudents = JSON.parse(JSON.stringify(students));
  let availableClasses = JSON.parse(JSON.stringify(classes)).filter(
    (c) => c.currentCount < c.capacity
  );

  if (!availableClasses.length) return students;

  // Öğrencileri gruplandır
  // Gruplandırma: tek-örgün, tek-ikinci, çift-örgün, çift-ikinci
  const studentGroups = {
    "odd-day": updatedStudents.filter(
      (s) =>
        s.studentNumber % 2 !== 0 && s.program === "day" && !s.assignedClass
    ),
    "odd-night": updatedStudents.filter(
      (s) =>
        s.studentNumber % 2 !== 0 && s.program === "night" && !s.assignedClass
    ),
    "even-day": updatedStudents.filter(
      (s) =>
        s.studentNumber % 2 === 0 && s.program === "day" && !s.assignedClass
    ),
    "even-night": updatedStudents.filter(
      (s) =>
        s.studentNumber % 2 === 0 && s.program === "night" && !s.assignedClass
    ),
  };

  // Toplam atanmamış öğrenci sayısı
  const totalUnassignedStudents = Object.values(studentGroups).reduce(
    (sum, group) => sum + group.length,
    0
  );

  // Toplam mevcut kapasite
  const totalAvailableCapacity = availableClasses.reduce(
    (sum, c) => sum + (c.capacity - c.currentCount),
    0
  );

  console.log(
    `Toplam atanmamış öğrenci: ${totalUnassignedStudents}, Toplam mevcut kapasite: ${totalAvailableCapacity}`
  );

  // Eğer kapasite yetersizse, uyarı mesajı göster
  if (totalAvailableCapacity < totalUnassignedStudents) {
    console.warn(
      `UYARI: Toplam kapasite yetersiz! ${
        totalUnassignedStudents - totalAvailableCapacity
      } öğrenci açıkta kalacak.`
    );
  }

  // Her grup için kullanılabilir sınıfları hesapla
  const classesPerGroup = calculateClassesForGroups(
    studentGroups,
    availableClasses,
    classes
  );

  if (distributionType === "balanced") {
    // Her grup için dengeli dağıtım yap
    Object.entries(studentGroups).forEach(([groupType, students]) => {
      // Bu grup için atanan sınıfları al
      const classesForThisGroup = classesPerGroup[groupType];
      if (!classesForThisGroup || classesForThisGroup.length === 0) return;

      // Toplam grup kapasitesi
      const totalGroupCapacity = classesForThisGroup.reduce(
        (sum, c) => sum + (c.capacity - c.currentCount),
        0
      );

      // Eğer grup kapasitesi, grup öğrenci sayısından az ise uyarı
      if (totalGroupCapacity < students.length) {
        console.warn(
          `UYARI: ${groupType} grubu için kapasite yetersiz. ${
            students.length - totalGroupCapacity
          } öğrenci açıkta kalacak.`
        );
      }

      // Sınıfları doluluk oranına göre sırala (en az dolu olan önce)
      const sortedClasses = [...classesForThisGroup].sort((a, b) => {
        const aRatio = a.currentCount / a.capacity;
        const bRatio = b.currentCount / b.capacity;
        return aRatio - bRatio;
      });

      // Öğrencileri sırayla dağıt
      students.forEach((student) => {
        // Öğrenciyi yerleştirecek yer bul
        for (let i = 0; i < sortedClasses.length; i++) {
          const targetClass = sortedClasses[i];
          if (targetClass.currentCount < targetClass.capacity) {
            student.assignedClass = targetClass.id;
            targetClass.currentCount++;

            // Sınıfları yeniden sırala
            sortedClasses.sort((a, b) => {
              const aRatio = a.currentCount / a.capacity;
              const bRatio = b.currentCount / b.capacity;
              return aRatio - bRatio;
            });

            break;
          }
        }
      });
    });
  } else {
    // Her grup için sıralı dağıtım yap
    Object.entries(studentGroups).forEach(([groupType, students]) => {
      // Bu grup için atanan sınıfları al
      const classesForThisGroup = classesPerGroup[groupType];
      if (!classesForThisGroup || classesForThisGroup.length === 0) return;

      // Sınıfları ID'ye göre sırala (tutarlı olması için)
      const sortedClasses = [...classesForThisGroup].sort((a, b) => {
        // Önce ID'lerine göre sıralama yaparak tutarlılık sağlıyoruz
        return a.id.localeCompare(b.id);
      });

      // Her sınıfı tamamen doldurmaya çalış
      let classIndex = 0;
      students.forEach((student) => {
        let placed = false;

        // Önce mevcut sınıfı doldurmaya çalış
        while (!placed && classIndex < sortedClasses.length) {
          const targetClass = sortedClasses[classIndex];

          if (targetClass.currentCount < targetClass.capacity) {
            student.assignedClass = targetClass.id;
            targetClass.currentCount++;
            placed = true;
          } else {
            // Mevcut sınıf doluysa, bir sonraki sınıfa geç
            classIndex++;
          }
        }

        // Eğer tüm sınıflar dolduysa ve hala öğrenci kaldıysa
        if (!placed) {
          console.warn(
            `UYARI: ${groupType} grubunda bir öğrenci (id: ${student.id}) için yer bulunamadı.`
          );

          // Yine de en uygun yere yerleştirmeye çalış
          // En az dolu olan sınıfı bul
          const leastFilledClass = sortedClasses.reduce((least, current) => {
            if (
              current.currentCount / current.capacity <
              least.currentCount / least.capacity
            ) {
              return current;
            }
            return least;
          }, sortedClasses[0]);

          if (leastFilledClass) {
            student.assignedClass = leastFilledClass.id;
            leastFilledClass.currentCount++;
            console.log(
              `Öğrenci (id: ${student.id}) en az dolu sınıfa (${leastFilledClass.name}) atandı.`
            );
          }
        }
      });
    });
  }

  // Son bir kontrol: Açıkta kalan öğrenci var mı?
  const unassignedAfter = updatedStudents.filter(
    (s) => !s.assignedClass
  ).length;
  if (unassignedAfter > 0) {
    console.warn(`Dağıtım sonrası ${unassignedAfter} öğrenci açıkta kaldı.`);

    // Açıkta kalan öğrencileri herhangi bir sınıfa yerleştirmeye çalış
    const stillUnassigned = updatedStudents.filter((s) => !s.assignedClass);

    availableClasses = JSON.parse(JSON.stringify(classes));

    // Mevcut doluluk durumunu güncelle
    updatedStudents.forEach((student) => {
      if (student.assignedClass) {
        const targetClass = availableClasses.find(
          (c) => c.id === student.assignedClass
        );
        if (targetClass) {
          targetClass.currentCount++;
        }
      }
    });

    // Boş yeri olan sınıfları bul
    const classesWithSpace = availableClasses.filter(
      (c) => c.currentCount < c.capacity
    );

    if (classesWithSpace.length > 0) {
      stillUnassigned.forEach((student) => {
        // En az dolu sınıfı bul
        const leastFilledClass = classesWithSpace.reduce((least, current) => {
          if (
            current.currentCount / current.capacity <
            least.currentCount / least.capacity
          ) {
            return current;
          }
          return least;
        }, classesWithSpace[0]);

        if (
          leastFilledClass &&
          leastFilledClass.currentCount < leastFilledClass.capacity
        ) {
          student.assignedClass = leastFilledClass.id;
          leastFilledClass.currentCount++;
          console.log(
            `Son geçiş: Öğrenci (id: ${student.id}) sınıfa (${leastFilledClass.name}) atandı.`
          );
        }
      });
    }
  }

  return updatedStudents;
};

// Gruplar için sınıfları dağıt
function calculateClassesForGroups(
  studentGroups,
  availableClasses,
  allClasses
) {
  // Her grupta kaç öğrenci var
  const studentCountPerGroup = {};
  Object.entries(studentGroups).forEach(([groupType, students]) => {
    studentCountPerGroup[groupType] = students.length;
  });

  // Toplam öğrenci sayısı ve toplam kapasite
  const totalStudents = Object.values(studentCountPerGroup).reduce(
    (sum, count) => sum + count,
    0
  );
  const totalCapacity = availableClasses.reduce(
    (sum, cls) => sum + (cls.capacity - cls.currentCount),
    0
  );

  // Boş grupları temizle
  Object.keys(studentCountPerGroup).forEach((groupType) => {
    if (studentCountPerGroup[groupType] === 0) {
      delete studentCountPerGroup[groupType];
    }
  });

  // Eğer öğrenci yoksa veya yeterli kapasite yoksa, boş dön
  if (totalStudents === 0 || totalCapacity === 0) {
    return {};
  }

  // Uyarı: Eğer toplam kapasite, toplam öğrenci sayısından küçükse uyarı ver
  if (totalCapacity < totalStudents) {
    console.warn(
      `UYARI: Toplam kapasite (${totalCapacity}) toplam öğrenci sayısından (${totalStudents}) az! ${
        totalStudents - totalCapacity
      } öğrenci açıkta kalabilir.`
    );
  }

  // Tüm sınıfları gruplandırma yaklaşımı yerine, her grubun ihtiyacına göre sınıf dağıtma
  const classesForGroups = {};

  // Sınıfları öğrenci/kapasite oranına göre sıralayalım
  let sortedClasses = [...availableClasses].sort((a, b) => {
    const aRatio = a.currentCount / a.capacity;
    const bRatio = b.currentCount / b.capacity;
    return aRatio - bRatio; // Doluluk oranı az olanı önce kullan
  });

  // Her grup için gereken kapasite
  const capacityNeeded = {};
  let remainingCapacity = totalCapacity;

  // İlk geçiş: Minimum ihtiyaçları belirle
  Object.entries(studentCountPerGroup).forEach(([groupType, studentCount]) => {
    // Her grup en az kendi boyutu kadar kapasiteye ihtiyaç duyar
    capacityNeeded[groupType] = studentCount;
  });

  // Şimdi her gruba sınıf ata
  Object.entries(studentCountPerGroup).forEach(([groupType, studentCount]) => {
    if (studentCount === 0) return;

    classesForGroups[groupType] = [];
    let neededCapacity = capacityNeeded[groupType];
    let assignedCapacity = 0;

    // İhtiyaç duyulan kapasiteyi karşılamak için sınıf ekle
    while (assignedCapacity < neededCapacity && sortedClasses.length > 0) {
      const nextClass = sortedClasses.shift();
      classesForGroups[groupType].push(nextClass);
      assignedCapacity += nextClass.capacity - nextClass.currentCount;
    }
  });

  // Hala atanmamış sınıf varsa, en çok öğrencisi olan gruplara dağıt
  if (sortedClasses.length > 0) {
    // Grupları öğrenci sayısına göre sırala
    const sortedGroups = Object.entries(studentCountPerGroup).sort(
      (a, b) => b[1] - a[1]
    ); // Öğrenci sayısı çok olanı önce al

    // Kalan sınıfları en çok öğrencisi olan gruptan başlayarak dağıt
    sortedGroups.forEach(([groupType, _]) => {
      if (sortedClasses.length === 0) return;

      // Bu grup için atanmış sınıflar yoksa oluştur
      if (!classesForGroups[groupType]) {
        classesForGroups[groupType] = [];
      }

      // Grup başına en az bir ek sınıf ata (eğer varsa)
      if (sortedClasses.length > 0) {
        classesForGroups[groupType].push(sortedClasses.shift());
      }
    });

    // Hala sınıf kaldıysa, en kalabalık gruba ver
    if (sortedClasses.length > 0 && sortedGroups.length > 0) {
      const largestGroup = sortedGroups[0][0];
      classesForGroups[largestGroup] = [
        ...classesForGroups[largestGroup],
        ...sortedClasses,
      ];
    }
  }

  // Son kontrol: Her gruba en az bir sınıf ata (eğer grup boş değilse)
  Object.entries(studentCountPerGroup).forEach(([groupType, studentCount]) => {
    if (
      studentCount > 0 &&
      (!classesForGroups[groupType] || classesForGroups[groupType].length === 0)
    ) {
      // Eğer bir grup hiç sınıf almadıysa, diğer gruplardan birinden ödünç al
      const groupsWithMultipleClasses = Object.entries(classesForGroups)
        .filter(([_, classes]) => classes.length > 1)
        .map(([type, _]) => type);

      if (groupsWithMultipleClasses.length > 0) {
        // En fazla sınıfa sahip gruptan bir sınıf al
        const donorGroup = groupsWithMultipleClasses[0];
        classesForGroups[groupType] = [classesForGroups[donorGroup].pop()];
      }
    }
  });

  return classesForGroups;
}
