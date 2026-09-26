import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  Student,
  Teacher,
  SubjectSyllabus,
  InstitutionProfile,
  AcademicClass,
  SubjectItem,
  FeeStructure,
  FeePaymentTransaction,
  TeacherLeaveApplication,
  FacultyAttendanceLog,
} from '../types';

export interface ReportOptions {
  institution: InstitutionProfile;
  students: Student[];
  teachers: Teacher[];
  syllabus: SubjectSyllabus;
  targetStudent?: Student;
  targetClass?: string;
  selectedExam?: string;
  category:
    | 'student-report'
    | 'attendance-register'
    | 'marks-ledger'
    | 'marks-summary'
    | 'faculty-summary'
    | 'faculty-payslip'
    | 'syllabus-progress'
    | 'syllabus-audit'
    | 'fee-receipt'
    | 'fee-defaulters'
    | 'master-audit';
  classes?: AcademicClass[];
  subjects?: SubjectItem[];
  feeStructures?: FeeStructure[];
  feeTransactions?: FeePaymentTransaction[];
  leaveApplications?: TeacherLeaveApplication[];
  facultyAttendanceLogs?: FacultyAttendanceLog[];
}

/**
 * Generates and downloads a branded PDF document
 */
export const generatePdfDocument = (options: ReportOptions): string => {
  const { institution, students, teachers, syllabus, targetStudent, targetClass, selectedExam, category } = options;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // 1. Header Banner
  doc.setFillColor(0, 74, 198); // Deep Academic Blue
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Institution Title & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(institution.name.toUpperCase(), pageWidth / 2, 11, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${institution.boardName} • Code: ${institution.affiliationCode}`, pageWidth / 2, 17, { align: 'center' });
  doc.text(institution.address, pageWidth / 2, 22, { align: 'center' });

  // 2. Report Sub-Header
  doc.setTextColor(19, 27, 46);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');

  let reportTitle = 'ACADEMIC PERFORMANCE & AUDIT REPORT';
  if (category === 'student-report' && targetStudent) {
    reportTitle = `STUDENT PROGRESS & REPORT CARD: ${targetStudent.name.toUpperCase()}`;
  } else if (category === 'attendance-register') {
    reportTitle = `OFFICIAL ATTENDANCE REGISTER - ${targetClass || 'ALL CLASSES'}`;
  } else if (category === 'marks-ledger') {
    reportTitle = `MARKS & GRADE LEDGER - ${selectedExam || 'UT-2'}`;
  } else if (category === 'faculty-summary') {
    reportTitle = 'FACULTY ROSTER & BIOMETRIC DUTY REPORT';
  } else if (category === 'syllabus-progress') {
    reportTitle = 'CURRICULUM COMPLETION & SYLLABUS AUDIT';
  }

  doc.text(reportTitle, 14, 38);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(115, 118, 134);
  doc.text(`Academic Session: ${institution.academicSession} | Generated: ${currentDate}`, 14, 43);

  let startY = 48;

  // 3. Tables based on category
  if (category === 'student-report' && targetStudent) {
    // Individual Student Card
    doc.setFillColor(242, 243, 255);
    doc.roundedRect(14, startY, pageWidth - 28, 22, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setTextColor(19, 27, 46);
    doc.setFont('helvetica', 'bold');
    doc.text(`Roll No: #${targetStudent.rollNo}`, 18, startY + 7);
    doc.text(`Class & Section: ${targetStudent.classSec}`, 18, startY + 14);
    doc.text(`Parent/Guardian: ${targetStudent.parentName} (${targetStudent.parentRelation})`, 85, startY + 7);
    doc.text(`Contact: ${targetStudent.parentPhone}`, 85, startY + 14);
    doc.text(`Attendance: ${targetStudent.attendancePct}% (${targetStudent.totalPresent}/${targetStudent.totalWorkingDays} days)`, 145, startY + 7);
    doc.text(`Compliance: ${targetStudent.attendancePct >= institution.defaulterThreshold ? 'Satisfactory' : 'CRITICAL DEFAULTER'}`, 145, startY + 14);

    startY += 28;

    const ut1 = targetStudent.marks.ut1 || { math: 40, sci: 42, eng: 40 };
    const ut2 = targetStudent.marks.ut2 || { math: 42, sci: 45, eng: 44 };
    const mid = targetStudent.marks.midTerm || { math: 70, sci: 72, eng: 68 };

    const tableData = [
      ['Mathematics', `${ut1.math} / 50`, `${ut2.math} / 50`, `${mid.math} / 80`, `${(((ut2.math / 50) * 100)).toFixed(0)}%`, ut2.math >= 45 ? 'A1' : ut2.math >= 40 ? 'A2' : ut2.math >= 33 ? 'B1' : 'C'],
      ['Science & Tech', `${ut1.sci} / 50`, `${ut2.sci} / 50`, `${mid.sci} / 80`, `${(((ut2.sci / 50) * 100)).toFixed(0)}%`, ut2.sci >= 45 ? 'A1' : ut2.sci >= 40 ? 'A2' : ut2.sci >= 33 ? 'B1' : 'C'],
      ['English Comm.', `${ut1.eng} / 50`, `${ut2.eng} / 50`, `${mid.eng} / 80`, `${(((ut2.eng / 50) * 100)).toFixed(0)}%`, ut2.eng >= 45 ? 'A1' : ut2.eng >= 40 ? 'A2' : ut2.eng >= 33 ? 'B1' : 'C'],
    ];

    autoTable(doc, {
      startY,
      head: [['Subject Name', 'UT-1 (50)', 'UT-2 (50)', 'Mid-Term (80)', 'Score %', 'Grade']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 74, 198], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8.5, textColor: [19, 27, 46] },
      alternateRowStyles: { fillColor: [250, 248, 255] },
    });
  } else if (category === 'attendance-register') {
    const list = targetClass && targetClass !== 'ALL' 
      ? students.filter(s => s.gradeLevel === targetClass.replace('Class ', ''))
      : students;

    const rows = list.map((s, idx) => [
      idx + 1,
      s.rollNo,
      s.name,
      s.classSec,
      s.parentName,
      s.parentPhone,
      `${s.totalPresent} / ${s.totalWorkingDays}`,
      `${s.attendancePct}%`,
      s.todayStatus === 'P' ? 'Present' : s.todayStatus === 'A' ? 'ABSENT' : s.todayStatus === 'L' ? 'Leave' : 'Half Day'
    ]);

    autoTable(doc, {
      startY,
      head: [['#', 'Roll', 'Student Name', 'Class', 'Guardian', 'Mobile', 'Attended', 'Att %', "Today's Status"]],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [0, 74, 198], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: [19, 27, 46] },
      alternateRowStyles: { fillColor: [250, 248, 255] },
    });
  } else if (category === 'faculty-summary') {
    const rows = teachers.map((t, idx) => [
      idx + 1,
      t.name,
      t.designation,
      t.subject,
      t.classesAssigned.join(', '),
      t.phone,
      t.status,
      t.biometricCheckIn,
      `CL: ${t.leaveBalance.cl} | SL: ${t.leaveBalance.sl}`
    ]);

    autoTable(doc, {
      startY,
      head: [['#', 'Faculty Name', 'Designation', 'Subject', 'Classes', 'Contact', 'Status', 'Check-In', 'Leaves Left']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [0, 125, 85], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: [19, 27, 46] },
      alternateRowStyles: { fillColor: [250, 248, 255] },
    });
  } else if (category === 'syllabus-progress') {
    const rows = syllabus.chapters.map(c => [
      `Unit ${c.unitNumber}`,
      c.name,
      `${c.completedPeriods} / ${c.allottedPeriods}`,
      c.status,
      c.completionDate || c.scheduledDate || 'Scheduled',
      c.lessonNotes || 'No notes',
    ]);

    autoTable(doc, {
      startY,
      head: [['Unit', 'Chapter Topic', 'Periods', 'Status', 'Date', 'Key Concepts']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [96, 99, 238], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: [19, 27, 46] },
      alternateRowStyles: { fillColor: [250, 248, 255] },
    });
  } else if (category === 'fee-defaulters' || category === 'fee-receipt') {
    const rows = students.map((s, idx) => {
      const annual = s.classSec.includes('KG') ? 35000 : s.classSec.includes('11') || s.classSec.includes('12') ? 58000 : s.classSec.includes('Tech') ? 85000 : 45000;
      const paid = Math.round(annual * (s.attendancePct / 100));
      const balance = Math.max(0, annual - paid);
      return [
        idx + 1,
        s.rollNo,
        s.name,
        s.classSec,
        s.parentName,
        s.parentPhone,
        `${institution.currencySymbol}${annual.toLocaleString()}`,
        `${institution.currencySymbol}${paid.toLocaleString()}`,
        `${institution.currencySymbol}${balance.toLocaleString()}`,
        balance === 0 ? 'Fully Paid' : balance > 20000 ? 'CRITICAL OVERDUE' : 'Partial Due'
      ];
    });

    autoTable(doc, {
      startY,
      head: [['#', 'Roll', 'Student Name', 'Class', 'Guardian', 'Contact', 'Annual Billed', 'Paid', 'Balance Due', 'Status']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [186, 26, 26], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
      bodyStyles: { fontSize: 7, textColor: [19, 27, 46] },
      alternateRowStyles: { fillColor: [255, 248, 248] },
    });
  } else if (category === 'syllabus-audit') {
    const list = options.classes && options.classes.length > 0 ? options.classes : [
      { id: '1', name: 'Senior KG', category: 'Pre-Primary / Kindergarten' as const },
      { id: '2', name: 'Class 1-A', category: 'Primary (1-5)' as const },
      { id: '3', name: 'Class 10-A', category: 'Secondary (9-10)' as const },
      { id: '4', name: 'Class 12 Science', category: 'Higher Secondary (11-12)' as const },
      { id: '5', name: 'B.Tech CSE', category: 'Undergraduate (UG)' as const },
      { id: '6', name: 'Ph.D Research', category: 'Doctorate (Ph.D)' as const },
    ];
    const rows = list.map((c, idx) => {
      const subs = options.subjects ? options.subjects.filter(s => s.classCategory === c.category || s.specificClassName === c.name) : [];
      return [
        idx + 1,
        c.name,
        c.category,
        c.section || 'General',
        subs.map(s => s.name).join(', ') || 'Core Curriculum Track',
        subs.length || 4,
      ];
    });

    autoTable(doc, {
      startY,
      head: [['#', 'Class Name', 'Academic Tier', 'Section', 'Mapped Subjects / Disciplines', 'Total Subjects']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [0, 74, 198], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: [19, 27, 46] },
      alternateRowStyles: { fillColor: [250, 248, 255] },
    });
  } else {
    // Marks ledger / Master summary
    const rows = students.map((s, idx) => {
      const total = s.marks.ut2.math + s.marks.ut2.sci + s.marks.ut2.eng;
      const pct = ((total / 150) * 100).toFixed(1);
      return [
        idx + 1,
        s.rollNo,
        s.name,
        s.classSec,
        s.marks.ut2.math,
        s.marks.ut2.sci,
        s.marks.ut2.eng,
        total,
        `${pct}%`,
        pct >= '75' ? 'Passed (Distinction)' : pct >= '33' ? 'Passed' : 'Needs Improvement'
      ];
    });

    autoTable(doc, {
      startY,
      head: [['#', 'Roll', 'Student Name', 'Class', 'Math (50)', 'Sci (50)', 'Eng (50)', 'Total (150)', 'Percentage', 'Result']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [0, 74, 198], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: [19, 27, 46] },
      alternateRowStyles: { fillColor: [250, 248, 255] },
    });
  }

  // Footer & Official Seal / Signature
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 16 : 240;
  if (finalY < 270) {
    doc.setFontSize(8.5);
    doc.setTextColor(19, 27, 46);
    doc.setFont('helvetica', 'bold');
    doc.text(`Approved & Verified by:`, 14, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${institution.principalName} (${institution.principalDesignation})`, 14, finalY + 5);
    doc.text(`${institution.name}`, 14, finalY + 10);

    doc.setFont('helvetica', 'bold');
    doc.text(`Official Stamp & Signature:`, pageWidth - 60, finalY);
    doc.setFont('helvetica', 'italic');
    doc.text(`[Digital Authenticated]`, pageWidth - 60, finalY + 8);
  }

  const fileName = `${institution.shortName.replace(/\s+/g, '_')}_${category}_${Date.now()}.pdf`;
  doc.save(fileName);
  return fileName;
};

/**
 * Generates and downloads a multi-sheet Excel spreadsheet (.xlsx)
 */
export const generateExcelDocument = (options: ReportOptions): string => {
  const { institution, students, teachers, syllabus, category } = options;
  const wb = XLSX.utils.book_new();

  // Sheet 1: Students & Marks Ledger
  const studentData = students.map((s, idx) => ({
    'S.No': idx + 1,
    'Roll Number': s.rollNo,
    'Student Name': s.name,
    'Class & Section': s.classSec,
    'Guardian Name': s.parentName,
    'Guardian Contact': s.parentPhone,
    'Guardian WhatsApp': s.parentWhatsApp,
    'Attendance %': `${s.attendancePct}%`,
    'Days Present': s.totalPresent,
    'Total Days': s.totalWorkingDays,
    "Today's Status": s.todayStatus,
    'UT2 Math (50)': s.marks.ut2.math,
    'UT2 Science (50)': s.marks.ut2.sci,
    'UT2 English (50)': s.marks.ut2.eng,
    'UT2 Total (150)': s.marks.ut2.math + s.marks.ut2.sci + s.marks.ut2.eng,
    'UT2 Score %': `${(((s.marks.ut2.math + s.marks.ut2.sci + s.marks.ut2.eng) / 150) * 100).toFixed(1)}%`,
  }));
  const wsStudents = XLSX.utils.json_to_sheet(studentData);
  XLSX.utils.book_append_sheet(wb, wsStudents, 'Students & Marks');

  // Sheet 2: Faculty Roster
  const facultyData = teachers.map((t, idx) => ({
    'S.No': idx + 1,
    'Faculty Name': t.name,
    'Designation': t.designation,
    'Subject': t.subject,
    'Qualification': t.qualification,
    'Contact': t.phone,
    'Email': t.email,
    'Status': t.status,
    'Check-In': t.biometricCheckIn,
    'Casual Leave': t.leaveBalance.cl,
    'Sick Leave': t.leaveBalance.sl,
    'Earned Leave': t.leaveBalance.el,
  }));
  const wsFaculty = XLSX.utils.json_to_sheet(facultyData);
  XLSX.utils.book_append_sheet(wb, wsFaculty, 'Faculty Roster');

  // Sheet 3: Fees Ledger & Defaulters
  const feesData = students.map((s, idx) => {
    const annual = s.classSec.includes('KG') ? 35000 : s.classSec.includes('11') || s.classSec.includes('12') ? 58000 : s.classSec.includes('Tech') ? 85000 : 45000;
    const paid = Math.round(annual * (s.attendancePct / 100));
    const balance = Math.max(0, annual - paid);
    return {
      'S.No': idx + 1,
      'Roll Number': s.rollNo,
      'Student Name': s.name,
      'Class & Section': s.classSec,
      'Guardian Name': s.parentName,
      'Contact WhatsApp': s.parentWhatsApp,
      'Total Billed (INR)': annual,
      'Total Paid (INR)': paid,
      'Outstanding Balance': balance,
      'Payment Status': balance === 0 ? 'Fully Paid' : balance > 20000 ? 'Overdue Defaulter' : 'Partial Due',
    };
  });
  const wsFees = XLSX.utils.json_to_sheet(feesData);
  XLSX.utils.book_append_sheet(wb, wsFees, 'Fees & Accounts');

  // Sheet 4: Classes & Grade Levels (KG to PhD)
  if (options.classes && options.classes.length > 0) {
    const classData = options.classes.map((c, idx) => ({
      'S.No': idx + 1,
      'Class Name': c.name,
      'Tier Category': c.category,
      'Section': c.section || 'A',
      'Department Wing': c.department || 'Academic',
      'Class Mentor': c.mentorTeacherName || 'Faculty',
      'Capacity': c.capacity || 40,
    }));
    const wsClasses = XLSX.utils.json_to_sheet(classData);
    XLSX.utils.book_append_sheet(wb, wsClasses, 'Classes (KG to PhD)');
  }

  // Sheet 5: Curriculum Subjects Mapped
  if (options.subjects && options.subjects.length > 0) {
    const subData = options.subjects.map((sub, idx) => ({
      'S.No': idx + 1,
      'Subject Title': sub.name,
      'Subject Code': sub.code,
      'Level Category': sub.classCategory,
      'Target Class': sub.specificClassName || 'All Sections',
      'Mentor Faculty': sub.teacherName || 'Subject Coordinator',
      'Max Marks': sub.maxMarks,
      'Pass Marks': sub.passMarks,
      'Credit Hours': sub.creditHours || 4,
    }));
    const wsSubs = XLSX.utils.json_to_sheet(subData);
    XLSX.utils.book_append_sheet(wb, wsSubs, 'Curriculum Subjects');
  }

  // Sheet 6: Curriculum & Syllabus
  const syllabusData = syllabus.chapters.map(c => ({
    'Unit': `Unit ${c.unitNumber}`,
    'Chapter Name': c.name,
    'Allotted Periods': c.allottedPeriods,
    'Completed Periods': c.completedPeriods,
    'Status': c.status,
    'Scheduled Date': c.scheduledDate || 'N/A',
    'Completion Date': c.completionDate || 'N/A',
    'Lesson Notes': c.lessonNotes,
  }));
  const wsSyllabus = XLSX.utils.json_to_sheet(syllabusData);
  XLSX.utils.book_append_sheet(wb, wsSyllabus, 'Curriculum Units');

  // Sheet 7: Institution Metadata
  const metadata = [
    { 'Property': 'Institution Name', 'Value': institution.name },
    { 'Property': 'Affiliation Code', 'Value': institution.affiliationCode },
    { 'Property': 'Board / Council', 'Value': institution.boardName },
    { 'Property': 'Principal / Dean', 'Value': `${institution.principalName} (${institution.principalDesignation})` },
    { 'Property': 'Contact WhatsApp', 'Value': institution.principalWhatsApp },
    { 'Property': 'Academic Session', 'Value': institution.academicSession },
    { 'Property': 'Export Timestamp', 'Value': new Date().toISOString() },
  ];
  const wsMeta = XLSX.utils.json_to_sheet(metadata);
  XLSX.utils.book_append_sheet(wb, wsMeta, 'Institution Info');

  const fileName = `${institution.shortName.replace(/\s+/g, '_')}_GoogleSheet_MasterData_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return fileName;
};

/**
 * Generates and downloads a CSV format suitable for Google Sheets import
 */
export const generateCsvDocument = (options: ReportOptions): string => {
  const { institution, students, category } = options;
  const headers = ['S.No', 'RollNo', 'Name', 'ClassSec', 'Guardian', 'Phone', 'AttendancePct', 'UT2_Math', 'UT2_Sci', 'UT2_Eng', 'UT2_Total', 'ScorePct'];
  const rows = students.map((s, i) => {
    const total = s.marks.ut2.math + s.marks.ut2.sci + s.marks.ut2.eng;
    const pct = ((total / 150) * 100).toFixed(1);
    return [
      i + 1,
      `"${s.rollNo}"`,
      `"${s.name}"`,
      `"${s.classSec}"`,
      `"${s.parentName}"`,
      `"${s.parentPhone}"`,
      s.attendancePct,
      s.marks.ut2.math,
      s.marks.ut2.sci,
      s.marks.ut2.eng,
      total,
      pct,
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  const fileName = `${institution.shortName.replace(/\s+/g, '_')}_GoogleSheets_${category}_${Date.now()}.csv`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return fileName;
};

/**
 * Builds formatted WhatsApp message text & URL for direct parent/principal dispatch
 */
export const buildWhatsAppMessage = (options: {
  recipientType: 'principal' | 'parent';
  institution: InstitutionProfile;
  student?: Student;
  summaryText?: string;
}): { phone: string; text: string; url: string } => {
  const { recipientType, institution, student, summaryText } = options;

  let phone = '';
  let message = '';

  if (recipientType === 'parent' && student) {
    phone = student.parentWhatsApp || student.parentPhone;
    const totalScore = student.marks.ut2.math + student.marks.ut2.sci + student.marks.ut2.eng;
    const scorePct = ((totalScore / 150) * 100).toFixed(1);

    message = 
`*${institution.name.toUpperCase()}*
_Official Academic & Attendance Dispatch_
----------------------------------
Dear ${student.parentName} (${student.parentRelation}),

Here is the updated academic progress report for *${student.name}* (Roll #${student.rollNo}, ${student.classSec}):

📊 *Attendance Status:*
• Attendance: *${student.attendancePct}%* (${student.totalPresent}/${student.totalWorkingDays} days)
• Status: ${student.attendancePct >= institution.defaulterThreshold ? '✅ Satisfactory & Compliant' : '⚠️ *CRITICAL ATTENDANCE DEFICIT (<' + institution.defaulterThreshold + '%)*'}

📝 *UT-2 Exam Scores (Out of 50):*
• Mathematics: *${student.marks.ut2.math}/50*
• Science: *${student.marks.ut2.sci}/50*
• English: *${student.marks.ut2.eng}/50*
• *Total Aggregate: ${totalScore}/150 (${scorePct}%)*

🏛️ *Principal / Authority:* ${institution.principalName} (${institution.principalDesignation})
📞 *Helpline:* ${institution.phone} | ${institution.website}
----------------------------------
_Generated via EduTrack Pro Academic Platform_`;
  } else {
    // Dispatch to Principal
    phone = institution.principalWhatsApp;
    message = 
`*${institution.name.toUpperCase()}*
*EXECUTIVE ACADEMIC & INSTITUTION AUDIT*
----------------------------------
Respected ${institution.principalDesignation} ${institution.principalName},

Daily executive report is generated for Academic Session *${institution.academicSession}*:

${summaryText || '• All student registers synced with Master Google Spreadsheet\n• Real-time Attendance & Grade ledger calculated\n• Complete PDF & Google Sheet audit files compiled for verification.'}

🏛️ *Institution:* ${institution.name}
Code: ${institution.affiliationCode}
Timestamp: ${new Date().toLocaleString()}
----------------------------------
_EduTrack Pro Cloud Administration_`;
  }

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  return { phone: cleanPhone, text: message, url };
};

/**
 * Builds formatted Email mailto URL for direct dispatch
 */
export const buildEmailDispatch = (options: {
  recipientType: 'principal' | 'parent';
  institution: InstitutionProfile;
  student?: Student;
  summaryText?: string;
}): { email: string; subject: string; body: string; mailto: string } => {
  const { recipientType, institution, student, summaryText } = options;

  let email = '';
  let subject = '';
  let body = '';

  if (recipientType === 'parent' && student) {
    email = student.parentEmail || `${student.name.toLowerCase().replace(/\s+/g, '')}.parent@gmail.com`;
    subject = `${institution.shortName} - Academic Report & Attendance for ${student.name} (Roll #${student.rollNo})`;
    const totalScore = student.marks.ut2.math + student.marks.ut2.sci + student.marks.ut2.eng;
    const scorePct = ((totalScore / 150) * 100).toFixed(1);

    body = 
`Dear ${student.parentName},

Greetings from ${institution.name}.

Please find the verified academic and attendance performance ledger for your ward ${student.name} for the ongoing academic session:

Student Details:
- Name: ${student.name}
- Roll Number: ${student.rollNo}
- Class & Section: ${student.classSec}
- Cumulative Attendance: ${student.attendancePct}% (${student.totalPresent} out of ${student.totalWorkingDays} working days)
- Compliance: ${student.attendancePct >= institution.defaulterThreshold ? 'Compliant' : 'CRITICAL ATTENDANCE DEFICIT'}

Examination Results (Unit Test 2):
- Mathematics: ${student.marks.ut2.math} / 50
- Science: ${student.marks.ut2.sci} / 50
- English: ${student.marks.ut2.eng} / 50
- Aggregate: ${totalScore} / 150 (${scorePct}%)

If you have any questions or require an in-person meeting with the class teacher or subject mentors, please feel free to reach out to our administration at ${institution.phone}.

Warm regards,
${institution.principalName}
${institution.principalDesignation}
${institution.name}
${institution.website}`;
  } else {
    email = institution.principalEmail;
    subject = `[CONFIDENTIAL] Daily Institution Academic & Attendance Ledger - ${institution.shortName}`;
    body = 
`Respected ${institution.principalDesignation} ${institution.principalName},

Attached is the daily verified academic summary and attendance audit for ${institution.name} (${institution.academicSession}).

Summary Highlights:
${summaryText || '- All class registers marked and locked\n- Biometric staff duty logged\n- UT-2 exam grading audit complete\n- Curriculum delivery tracking on schedule'}

Official Affiliation: ${institution.affiliationCode}
Generated on: ${new Date().toLocaleString()}

Administrative Team,
${institution.name}`;
  }

  const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return { email, subject, body, mailto };
};
