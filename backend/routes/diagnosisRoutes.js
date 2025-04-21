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

router.route('/').post(protect, doctor, createDiagnosis).get(protect, doctor, getDiagnoses);
router.route('/appointment/:id').get(protect, doctor, getDiagnosisByAppointmentId);
router
  .route('/:id')
  .get(protect, doctor, getDiagnosisById)
  .put(protect, doctor, updateDiagnosis)
  .delete(protect, doctor, deleteDiagnosis);

module.exports = router;
