const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updatePreferences,
  getProfile
} = require('../controllers/users');
const { authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', getProfile);
router.put('/preferences', updatePreferences);

// Admin only routes
router.use(authorize('admin'));

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;