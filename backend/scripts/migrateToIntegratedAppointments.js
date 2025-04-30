/**
 * Migration script to convert existing appointments and queue entries
 * to the new integrated appointment system
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const Appointment = require('../models/appointmentModel');
const QueueEntry = require('../models/queueEntryModel');
const IntegratedAppointment = require('../models/integratedAppointmentModel');
const Diagnosis = require('../models/diagnosisModel');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'.red.bold));
db.once('open', () => {
  console.log('Connected to MongoDB'.green.bold);
});

/**
 * Main migration function
 */
const migrateData = async () => {
  try {
    console.log('Starting migration to integrated appointment system...'.yellow.bold);
    
    // Get counts before migration
    const appointmentCount = await Appointment.countDocuments();
    const queueEntryCount = await QueueEntry.countDocuments();
    const diagnosisCount = await Diagnosis.countDocuments();
    
    console.log(`Found ${appointmentCount} appointments, ${queueEntryCount} queue entries, and ${diagnosisCount} diagnoses`.cyan);
    
    // Check if there are already integrated appointments
    const existingIntegratedCount = await IntegratedAppointment.countDocuments();
    
    if (existingIntegratedCount > 0) {
      console.log(`WARNING: There are already ${existingIntegratedCount} integrated appointments in the database`.yellow);
      const answer = await promptUser('Do you want to continue and potentially create duplicates? (yes/no): ');
      
      if (answer.toLowerCase() !== 'yes') {
        console.log('Migration aborted'.red);
        process.exit(0);
      }
    }
    
    // Get all appointments
    const appointments = await Appointment.find().populate('patient_id');
    console.log(`Processing ${appointments.length} appointments...`.cyan);
    
    // Get all queue entries
    const queueEntries = await QueueEntry.find().populate('appointment_id');
    console.log(`Processing ${queueEntries.length} queue entries...`.cyan);
    
    // Get all diagnoses
    const diagnoses = await Diagnosis.find();
    console.log(`Processing ${diagnoses.length} diagnoses...`.cyan);
    
    // Create a map of diagnoses by appointment ID for quick lookup
    const diagnosisMap = {};
    diagnoses.forEach(diagnosis => {
      if (!diagnosisMap[diagnosis.appointment_id]) {
        diagnosisMap[diagnosis.appointment_id] = [];
      }
      diagnosisMap[diagnosis.appointment_id].push(diagnosis);
    });
    
    // Create a map of queue entries by appointment ID for quick lookup
    const queueEntryMap = {};
    queueEntries.forEach(entry => {
      if (entry.appointment_id) {
        queueEntryMap[entry.appointment_id.toString()] = entry;
      }
    });
    
    // Process each appointment and create an integrated appointment
    const integratedAppointments = [];
    let migratedCount = 0;
    
    for (const appointment of appointments) {
      try {
        // Skip if patient_id is missing
        if (!appointment.patient_id) {
          console.log(`Skipping appointment ${appointment._id} - missing patient_id`.yellow);
          continue;
        }
        
        // Get the queue entry for this appointment if it exists
        const queueEntry = queueEntryMap[appointment._id.toString()];
        
        // Get diagnoses for this appointment if they exist
        const appointmentDiagnoses = diagnosisMap[appointment._id.toString()] || [];
        
        // Determine the status based on appointment status and queue entry
        let status = 'Scheduled';
        if (appointment.status === 'Completed' || appointment.status === 'Cancelled' || appointment.status === 'No-show') {
          status = appointment.status;
        } else if (queueEntry) {
          if (queueEntry.status === 'In Progress') {
            status = 'In-progress';
          } else if (queueEntry.status === 'Waiting') {
            status = 'Checked-in';
          }
        }
        
        // Create diagnosis object if diagnoses exist
        let diagnosisData = null;
        if (appointmentDiagnoses.length > 0) {
          // Sort diagnoses by creation date (newest first)
          appointmentDiagnoses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          // Get the most recent diagnosis
          const latestDiagnosis = appointmentDiagnoses[0];
          
          // Try to parse the diagnosis text as JSON
          try {
            diagnosisData = JSON.parse(latestDiagnosis.diagnosis_text);
          } catch (e) {
            // If parsing fails, use the text as is
            diagnosisData = {
              text: latestDiagnosis.diagnosis_text
            };
          }
        }
        
        // Create the integrated appointment
        const integratedAppointment = new IntegratedAppointment({
          patient_id: appointment.patient_id._id,
          scheduled_date: appointment.date,
          type: appointment.type || 'Consultation',
          reason: appointment.reason,
          status: status,
          created_by_user_id: appointment.created_by_user_id,
          createdBy: appointment.createdBy || 'secretary',
          notes: appointment.notes,
          diagnosis: diagnosisData,
          is_walk_in: appointment.is_walk_in || false
        });
        
        // Add queue information if it exists
        if (queueEntry) {
          integratedAppointment.queue_number = queueEntry.ticket_number;
          integratedAppointment.queue_position = queueEntry.position;
          
          // Add timestamps if they exist
          if (queueEntry.check_in_time) {
            integratedAppointment.check_in_time = queueEntry.check_in_time;
          }
          
          if (queueEntry.start_time) {
            integratedAppointment.start_time = queueEntry.start_time;
          }
          
          if (queueEntry.end_time) {
            integratedAppointment.end_time = queueEntry.end_time;
          }
        }
        
        // Add to the array for bulk insertion
        integratedAppointments.push(integratedAppointment);
        migratedCount++;
        
        // Log progress every 100 appointments
        if (migratedCount % 100 === 0) {
          console.log(`Processed ${migratedCount} appointments...`.gray);
        }
      } catch (error) {
        console.error(`Error processing appointment ${appointment._id}:`.red, error);
      }
    }
    
    // Insert all integrated appointments
    if (integratedAppointments.length > 0) {
      console.log(`Inserting ${integratedAppointments.length} integrated appointments...`.cyan);
      await IntegratedAppointment.insertMany(integratedAppointments);
      console.log(`Successfully migrated ${integratedAppointments.length} appointments to the integrated system`.green.bold);
    } else {
      console.log('No appointments to migrate'.yellow);
    }
    
    // Get counts after migration
    const newIntegratedCount = await IntegratedAppointment.countDocuments();
    console.log(`Total integrated appointments after migration: ${newIntegratedCount}`.green);
    
    console.log('Migration completed successfully'.green.bold);
  } catch (error) {
    console.error('Migration failed:'.red.bold, error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed'.gray);
  }
};

/**
 * Helper function to prompt the user for input
 */
const promptUser = (question) => {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    readline.question(question, answer => {
      readline.close();
      resolve(answer);
    });
  });
};

// Run the migration
migrateData();
