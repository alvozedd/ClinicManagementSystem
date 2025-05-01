const fetch = require('node-fetch');

async function addPatient() {
  try {
    const patientData = {
      name: "John Doe",
      gender: "Male",
      phone: "1234567890",
      year_of_birth: 1980,
      next_of_kin_name: "Jane Doe",
      next_of_kin_relationship: "Spouse",
      next_of_kin_phone: "0987654321",
      medicalHistory: [
        {
          condition: "None",
          diagnosedDate: new Date().toISOString().split('T')[0],
          notes: "Initial record"
        }
      ],
      allergies: ["None"],
      medications: [
        {
          name: "None",
          dosage: "N/A",
          frequency: "N/A",
          startDate: new Date().toISOString().split('T')[0]
        }
      ],
      createdBy: "doctor"
    };

    console.log('Attempting to add patient with data:', patientData);

    // Try multiple endpoints
    const endpoints = [
      'http://localhost:5000/api/patients',
      'http://localhost:5000/patients',
      'https://clinicmanagementsystem-production-081b.up.railway.app/api/patients',
      'https://clinicmanagementsystem-production-081b.up.railway.app/patients'
    ];

    let success = false;
    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(patientData)
        });

        const responseText = await response.text();
        console.log(`Response status: ${response.status}`);
        console.log(`Response body: ${responseText}`);

        if (response.ok) {
          console.log('Successfully added patient!');
          success = true;
          break;
        } else {
          console.log(`Failed with status: ${response.status}`);
        }
      } catch (error) {
        console.error(`Error with endpoint ${endpoint}:`, error.message);
        lastError = error;
      }
    }

    if (!success) {
      console.error('All endpoints failed. Last error:', lastError);
    }
  } catch (error) {
    console.error('Error in test script:', error);
  }
}

addPatient();
