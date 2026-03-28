const express = require('express');
const router = express.Router();
const {
  studentGetQuizzes, studentGetQuiz, studentSubmitQuiz, studentGetScoreboard
} = require('../controllers/standaloneQuizzes');

// All public - no auth required
router.get('/', studentGetQuizzes);
router.get('/:id', studentGetQuiz);
router.post('/:id/submit', studentSubmitQuiz);
router.get('/:id/scoreboard', studentGetScoreboard);

module.exports = router;
