// Mock data for the UroHealth Central application
import { STORAGE_KEYS, loadFromLocalStorage, saveToLocalStorage } from '../utils/localStorage';

// Initial patients data (used only if no data exists in localStorage)
const initialPatients = [
  {
    id: 'P001',
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: '1975-05-12',
    gender: 'Male',
    phone: '(555) 123-4567',
    email: 'john.smith@example.com',
    address: '123 Main St, Anytown, CA 90210',
    insuranceProvider: 'Blue Cross',
    insuranceNumber: 'BC12345678',
    nextOfKinName: 'Mary Smith',
    nextOfKinRelationship: 'Wife',
    nextOfKinPhone: '(555) 987-6543',
    medicalHistory: [
      { condition: 'Hypertension', diagnosedDate: '2018-03-15', notes: 'Controlled with medication' },
      { condition: 'Type 2 Diabetes', diagnosedDate: '2019-07-22', notes: 'Diet controlled' }
    ],
    medications: [
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', startDate: '2018-03-20' },
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', startDate: '2019-08-01' }
    ],
    allergies: ['Penicillin', 'Sulfa drugs'],
    lastVisit: '2023-11-15'
  },
  {
    id: 'P002',
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: '1982-09-23',
    gender: 'Female',
    phone: '(555) 987-6543',
    email: 'sarah.j@example.com',
    address: '456 Oak Ave, Somewhere, NY 10001',
    insuranceProvider: 'Aetna',
    insuranceNumber: 'AE98765432',
    nextOfKinName: 'Robert Johnson',
    nextOfKinRelationship: 'Husband',
    nextOfKinPhone: '(555) 456-7890',
    medicalHistory: [
      { condition: 'Asthma', diagnosedDate: '2010-01-10', notes: 'Mild, exercise-induced' },
      { condition: 'Migraine', diagnosedDate: '2015-11-05', notes: 'Occurs monthly' }
    ],
    medications: [
      { name: 'Albuterol', dosage: '90mcg', frequency: 'As needed', startDate: '2010-01-15' },
      { name: 'Sumatriptan', dosage: '50mg', frequency: 'As needed for migraine', startDate: '2015-11-10' }
    ],
    allergies: ['Latex'],
    lastVisit: '2023-12-05'
  },
  {
    id: 'P003',
    firstName: 'Michael',
    lastName: 'Chen',
    dateOfBirth: '1990-11-30',
    gender: 'Male',
    phone: '(555) 456-7890',
    email: 'mchen@example.com',
    address: '789 Pine St, Elsewhere, TX 75001',
    insuranceProvider: 'United Healthcare',
    insuranceNumber: 'UH45678901',
    nextOfKinName: 'Lin Chen',
    nextOfKinRelationship: 'Mother',
    nextOfKinPhone: '(555) 222-3333',
    medicalHistory: [
      { condition: 'Kidney stones', diagnosedDate: '2021-06-18', notes: 'Recurrent' }
    ],
    medications: [
      { name: 'Potassium Citrate', dosage: '10mEq', frequency: 'Twice daily', startDate: '2021-06-25' }
    ],
    allergies: [],
    lastVisit: '2024-01-20'
  },
  {
    id: 'P004',
    firstName: 'Emily',
    lastName: 'Davis',
    dateOfBirth: '1965-03-08',
    gender: 'Female',
    phone: '(555) 234-5678',
    email: 'emily.d@example.com',
    address: '101 Maple Dr, Nowhere, FL 33101',
    insuranceProvider: 'Medicare',
    insuranceNumber: 'MC78901234',
    nextOfKinName: 'James Davis',
    nextOfKinRelationship: 'Son',
    nextOfKinPhone: '(555) 444-5555',
    medicalHistory: [
      { condition: 'Osteoarthritis', diagnosedDate: '2017-09-12', notes: 'Affecting knees and hips' },
      { condition: 'Hypertension', diagnosedDate: '2015-04-30', notes: 'Well controlled' },
      { condition: 'Osteoporosis', diagnosedDate: '2019-02-15', notes: 'Mild' }
    ],
    medications: [
      { name: 'Acetaminophen', dosage: '500mg', frequency: 'As needed for pain', startDate: '2017-09-15' },
      { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', startDate: '2015-05-05' },
      { name: 'Alendronate', dosage: '70mg', frequency: 'Once weekly', startDate: '2019-02-20' }
    ],
    allergies: ['Codeine', 'Shellfish'],
    lastVisit: '2024-02-10'
  },
  {
    id: 'P005',
    firstName: 'Robert',
    lastName: 'Wilson',
    dateOfBirth: '1978-07-17',
    gender: 'Male',
    phone: '(555) 876-5432',
    email: 'rwilson@example.com',
    address: '222 Elm St, Someplace, WA 98001',
    insuranceProvider: 'Cigna',
    insuranceNumber: 'CI23456789',
    nextOfKinName: 'Jennifer Wilson',
    nextOfKinRelationship: 'Sister',
    nextOfKinPhone: '(555) 777-8888',
    medicalHistory: [
      { condition: 'Lower back pain', diagnosedDate: '2020-10-05', notes: 'Due to herniated disc' },
      { condition: 'Anxiety disorder', diagnosedDate: '2019-03-12', notes: 'Mild to moderate' }
    ],
    medications: [
      { name: 'Cyclobenzaprine', dosage: '10mg', frequency: 'As needed for muscle spasms', startDate: '2020-10-10' },
      { name: 'Sertraline', dosage: '50mg', frequency: 'Once daily', startDate: '2019-03-20' }
    ],
    allergies: ['Ibuprofen'],
    lastVisit: '2023-09-30'
  }
];

// Initial appointments data (used only if no data exists in localStorage)
const initialAppointments = [
  {
    id: 'A001',
    patientId: 'P001',
    patientName: 'John Smith',
    date: '2024-04-15',
    time: '09:00',
    duration: 30,
    type: 'Follow-up',
    reason: 'Blood pressure check',
    status: 'Scheduled',
    notes: 'Patient to bring medication list'
  },
  {
    id: 'A002',
    patientId: 'P002',
    patientName: 'Sarah Johnson',
    date: '2024-04-15',
    time: '10:00',
    duration: 45,
    type: 'Follow-up',
    reason: 'Asthma management',
    status: 'Scheduled',
    notes: 'Review peak flow measurements'
  },
  {
    id: 'A003',
    patientId: 'P003',
    patientName: 'Michael Chen',
    date: '2024-04-16',
    time: '14:30',
    duration: 60,
    type: 'Consultation',
    reason: 'Kidney stone follow-up',
    status: 'Scheduled',
    notes: 'Review recent lab results'
  },
  {
    id: 'A004',
    patientId: 'P004',
    patientName: 'Emily Davis',
    date: '2024-04-17',
    time: '11:15',
    duration: 30,
    type: 'Follow-up',
    reason: 'Medication review',
    status: 'Scheduled',
    notes: 'Discuss pain management options'
  },
  {
    id: 'A005',
    patientId: 'P005',
    patientName: 'Robert Wilson',
    date: '2024-04-18',
    time: '15:00',
    duration: 45,
    type: 'Follow-up',
    reason: 'Back pain assessment',
    status: 'Scheduled',
    notes: 'Bring recent MRI results'
  },
  {
    id: 'A006',
    patientId: 'P001',
    patientName: 'John Smith',
    date: '2024-03-15',
    time: '09:30',
    duration: 30,
    type: 'Follow-up',
    reason: 'Diabetes check',
    status: 'Completed',
    notes: 'A1C levels improved. Continue current medication.'
  },
  {
    id: 'A007',
    patientId: 'P002',
    patientName: 'Sarah Johnson',
    date: '2024-03-10',
    time: '14:00',
    duration: 30,
    type: 'Urgent',
    reason: 'Migraine episode',
    status: 'Completed',
    notes: 'Prescribed acute medication. Discussed triggers.'
  }
];

// Initial medical reports data (used only if no data exists in localStorage)
const initialReports = [
  {
    id: 'R001',
    patientId: 'P001',
    patientName: 'John Smith',
    date: '2024-03-15',
    type: 'Lab Results',
    title: 'Comprehensive Metabolic Panel',
    content: 'Blood glucose: 110 mg/dL (slightly elevated)\nCreatinine: 0.9 mg/dL (normal)\nBUN: 15 mg/dL (normal)\nSodium: 140 mEq/L (normal)\nPotassium: 4.0 mEq/L (normal)\nChloride: 102 mEq/L (normal)\nCalcium: 9.5 mg/dL (normal)',
    doctor: 'Dr. Williams',
    status: 'Final'
  },
  {
    id: 'R002',
    patientId: 'P001',
    patientName: 'John Smith',
    date: '2024-03-15',
    type: 'Clinical Note',
    title: 'Follow-up Visit',
    content: 'Patient reports feeling well. Blood pressure 130/80. Heart rate 72 bpm. Lungs clear. Diabetes well-controlled with current regimen. Continue medications as prescribed. Follow up in 3 months.',
    doctor: 'Dr. Williams',
    status: 'Final'
  },
  {
    id: 'R003',
    patientId: 'P002',
    patientName: 'Sarah Johnson',
    date: '2024-03-10',
    type: 'Clinical Note',
    title: 'Urgent Visit - Migraine',
    content: 'Patient presented with severe migraine, visual aura, nausea. Reports stress as trigger. Administered sumatriptan in office with good response. Discussed stress management techniques. Advised to keep migraine diary.',
    doctor: 'Dr. Martinez',
    status: 'Final'
  },
  {
    id: 'R004',
    patientId: 'P003',
    patientName: 'Michael Chen',
    date: '2024-01-20',
    type: 'Imaging',
    title: 'Abdominal CT Scan',
    content: 'Multiple small (2-3mm) calcifications in right kidney. No hydronephrosis. No evidence of obstruction. Findings consistent with nephrolithiasis. Recommend increased fluid intake and follow-up in 3 months.',
    doctor: 'Dr. Johnson',
    status: 'Final'
  },
  {
    id: 'R005',
    patientId: 'P004',
    patientName: 'Emily Davis',
    date: '2024-02-10',
    type: 'Lab Results',
    title: 'Bone Density Scan',
    content: 'T-score: -2.1 (lumbar spine), -1.8 (femoral neck). Findings consistent with osteoporosis. Recommend calcium and vitamin D supplementation. Continue alendronate therapy.',
    doctor: 'Dr. Williams',
    status: 'Final'
  },
  {
    id: 'R006',
    patientId: 'P005',
    patientName: 'Robert Wilson',
    date: '2023-09-30',
    type: 'Imaging',
    title: 'Lumbar MRI',
    content: 'L4-L5 disc herniation with mild compression of the thecal sac. Mild degenerative changes at L3-L4. No significant spinal stenosis. Findings consistent with reported symptoms of lower back pain with occasional radiculopathy.',
    doctor: 'Dr. Martinez',
    status: 'Final'
  }
];

// Today's appointments (for dashboard)
export const getTodaysAppointments = () => {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];

  // For demo purposes, we'll pretend today is 2024-04-15
  const demoDate = '2024-04-15';

  return appointments.filter(appointment =>
    appointment.date === demoDate && appointment.status === 'Scheduled'
  ).sort((a, b) => a.time.localeCompare(b.time));
};

// Recent patients (for dashboard)
export const getRecentPatients = () => {
  // Sort patients by last visit date (most recent first)
  return [...patients].sort((a, b) =>
    new Date(b.lastVisit) - new Date(a.lastVisit)
  ).slice(0, 5); // Get top 5
};

// Recent reports (for dashboard)
export const getRecentReports = () => {
  // Sort reports by date (most recent first)
  return [...reports].sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  ).slice(0, 5); // Get top 5
};

// Load data from localStorage or use initial data if not available
export const patients = loadFromLocalStorage(STORAGE_KEYS.PATIENTS, initialPatients);
export const appointments = loadFromLocalStorage(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
export const reports = loadFromLocalStorage(STORAGE_KEYS.REPORTS, initialReports);

// Save data to localStorage
export const savePatients = (data) => {
  saveToLocalStorage(STORAGE_KEYS.PATIENTS, data);
};

export const saveAppointments = (data) => {
  saveToLocalStorage(STORAGE_KEYS.APPOINTMENTS, data);
};

export const saveReports = (data) => {
  saveToLocalStorage(STORAGE_KEYS.REPORTS, data);
};
