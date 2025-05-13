// Sample data for testing the application without Excel file upload
export const generateSampleStudents = () => {
  const students = [];

  // Generate student numbers starting from 20220001
  const startNumber = 20220001;

  // Generate 50 sample students
  for (let i = 0; i < 50; i++) {
    const studentNumber = startNumber + i;
    // Alternate between "day" (Örgün) and "night" (İkinci Öğretim)
    const program = i % 2 === 0 ? "day" : "night";
    const classYear = String((i % 4) + 1);

    // Generate names using a Turkish name pool
    const names = [
      "Ali",
      "Ayşe",
      "Mehmet",
      "Zeynep",
      "Mustafa",
      "Elif",
      "Ahmet",
      "Emine",
      "Hüseyin",
      "Fatma",
    ];
    const surnames = [
      "Yılmaz",
      "Kaya",
      "Demir",
      "Çelik",
      "Şahin",
      "Koç",
      "Aslan",
      "Bulut",
      "Arslan",
      "Öztürk",
    ];

    const nameIndex = i % names.length;
    const surnameIndex = Math.floor(i / names.length) % surnames.length;

    students.push({
      id: i.toString(),
      studentNumber,
      name: names[nameIndex],
      surname: surnames[surnameIndex],
      program,
      classYear,
      assignedClass: null,
    });
  }

  return students;
};

// Sample classes
export const generateSampleClasses = () => {
  return [
    {
      id: "1",
      name: "A101",
      capacity: 15,
      currentCount: 0,
    },
    {
      id: "2",
      name: "B202",
      capacity: 20,
      currentCount: 0,
    },
    {
      id: "3",
      name: "C303",
      capacity: 25,
      currentCount: 0,
    },
  ];
};
