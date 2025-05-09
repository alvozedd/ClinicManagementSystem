const express = require('express');
const router = express.Router();
const {
  createDiagnosis,
  getDiagnoses,
  getDiagnosisByAppointmentId,
  getDiagnosesByPatientId,
  getDiagnosisById,
  updateDiagnosis,
  deleteDiagnosis,
} = require('../controllers/diagnosisController');
const { protect, doctor } = require('../middleware/authMiddleware');
const { validateDiagnosisCreation } = require('../middleware/validationMiddleware');

router.route('/').post(protect, doctor, validateDiagnosisCreation, createDiagnosis).get(protect, doctor, getDiagnoses);
router.route('/appointment/:id').get(protect, doctor, getDiagnosisByAppointmentId);
router.route('/patient/:id').get(protect, getDiagnosesByPatientId);
router
  .route('/:id')
  .get(protect, doctor, getDiagnosisById)
  .put(protect, doctor, validateDiagnosisCreation, updateDiagnosis)
  .delete(protect, doctor, deleteDiagnosis);

module.exports = router;
