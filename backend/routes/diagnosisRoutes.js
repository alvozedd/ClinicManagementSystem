const express = require('express');
const router = express.Router();
const {
  createDiagnosis,
  getDiagnoses,
  getDiagnosisByAppointmentId,
  getDiagnosisById,
  updateDiagnosis,
  deleteDiagnosis,
} = require('../controllers/diagnosisController');
const { protect, doctor } = require('../middleware/authMiddleware');
const { validateDiagnosisCreation } = require('../middleware/validationMiddleware');
const { logDiagnosisAccess, logBulkPhiAccess } = require('../middleware/phiAccessMiddleware');

router.route('/')
  .post(protect, doctor, validateDiagnosisCreation, logDiagnosisAccess, createDiagnosis)
  .get(protect, doctor, logBulkPhiAccess, getDiagnoses);
router.route('/appointment/:id').get(protect, doctor, logBulkPhiAccess, getDiagnosisByAppointmentId);
router
  .route('/:id')
  .get(protect, doctor, logDiagnosisAccess, getDiagnosisById)
  .put(protect, doctor, validateDiagnosisCreation, logDiagnosisAccess, updateDiagnosis)
  .delete(protect, doctor, logDiagnosisAccess, deleteDiagnosis);

module.exports = router;
