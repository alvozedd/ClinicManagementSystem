const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  refreshToken,
  logoutUser,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validationMiddleware');

router.route('/').post(protect, admin, validateUserRegistration, registerUser).get(protect, admin, getUsers);
router.post('/login', validateUserLogin, authUser);
router.post('/refresh-token', refreshToken);
router.post('/logout', logoutUser);
router
  .route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;
