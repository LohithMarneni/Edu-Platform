const express = require('express');
const router = express.Router();
const {
  getQuizzes, getQuiz, getQuizResults, createQuiz, updateQuiz, deleteQuiz
} = require('../controllers/standaloneQuizzes');
const { protect, authorize } = require('../middleware/auth');

// All teacher routes require auth
router.use(protect, authorize('teacher'));

router.route('/').get(getQuizzes).post(createQuiz);
router.route('/:id').get(getQuiz).put(updateQuiz).delete(deleteQuiz);
router.get('/:id/results', getQuizResults);

module.exports = router;
