________________________________________
 UroHealth Central Ltd – Agent Prompt Bundle
Clinic Booking & Patient Management System
________________________________________
 1. System Overview Prompt
You are building a simple clinic booking and patient management system for UroHealth Central Ltd.
This system will serve one clinic with:
•	One Doctor
•	One Secretary
•	One Admin
Key Concepts:
•	Patients do not log in.
•	Patients select only a date for their appointments.
•	The secretary manages all patient records and bookings (including internal time scheduling if needed).
•	The doctor adds diagnosis notes, visible only to them.
•	The admin manages system users.
Goals:
•	Simple UX
•	Flexible scheduling (no fixed slots)
•	Mobile-friendly design
•	Prioritize patient management, not strict scheduling
________________________________________
 2. Database Schema Prompt
Design the schema for a no-code-friendly backend like Supabase with the following tables:
users
•	id (PK), email, role (admin, doctor, secretary)
patients
•	id (PK), name, gender, phone
•	next_of_kin_name, next_of_kin_relationship, next_of_kin_phone
•	created_by_user_id (FK to users)
appointments
•	id (PK), patient_id (FK), appointment_date
•	optional_time, notes
•	created_by_user_id (FK to users)
diagnoses
•	id (PK), appointment_id (FK), diagnosis_text
•	created_by_user_id (FK to users)
Relationships:
•	One patient → many appointments
•	One appointment → one optional diagnosis
•	Users can create all records based on their role
________________________________________
3. Secretary UX Prompt
Design the secretary's dashboard with these features:
•	View all patients in a list
•	Add new patients with full details (including next of kin)
•	Search and filter patient records
•	Select a patient and:
o	Create an appointment (set date, optional time, notes)
o	Rebook by selecting a new date
•	View all past and upcoming appointments
•	Cannot access or view diagnosis notes
UI: Clean layout with basic forms, lists, and filters. Optimized for tablets or laptops.
________________________________________
 4. Doctor UX Prompt
Design the doctor's dashboard with:
•	Patient search and view
•	Expandable list of a patient's past appointments
•	For each appointment:
o	View date and notes
o	Add or edit diagnosis (private to doctor only)
Diagnosis is always tied to a specific appointment.
The doctor cannot modify bookings or patient info.
UI: Simple list view with collapsible sections for each patient.
________________________________________
 5. Role-Based Access Control (RLS) Prompt
Define access rules in Supabase:
•	Admin: full access to all tables
•	Doctor:
o	View all patients and appointments
o	View and manage diagnosis records they created
•	Secretary:
o	Can create/view patients and appointments
o	Cannot see or modify diagnosis records
•	Patients:
o	Do not log in. They only choose a date via a public form.
Use created_by_user_id fields to trace who added each record and apply access filters accordingly.
________________________________________
 6. Booking Flow Prompt
Describe how booking works:
•	The patient chooses a date via a public form.
•	The form sends that date to the system or secretary.
•	The secretary logs in:
o	Finds the patient (or creates a new one)
o	Adds an appointment with the chosen date (and optional time/notes)
•	Appointment is saved and linked to the patient.
________________________________________
7. Diagnosis Flow Prompt
Describe how the doctor works with diagnoses:
•	Doctor searches for a patient
•	Views their past appointments
•	For each appointment:
o	Views notes and adds/edit a diagnosis
•	Diagnoses are visible only to the doctor
•	Doctor uses diagnosis history to inform treatment decisions
________________________________________
8. Rebooking Flow Prompt
Explain rebooking process:
•	Secretary searches for the patient
•	Clicks "Rebook" and selects a new date (optional time)
•	A new appointment record is created for the patient
•	The doctor sees the new appointment alongside all past ones
•	Secretary does not need to duplicate patient data
________________________________________

