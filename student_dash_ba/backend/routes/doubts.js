const express = require('express');
const router = express.Router();
const {
  getDoubts,
  getDoubt,
  createDoubt,
  updateDoubt,
  deleteDoubt,
  addAnswer,
  voteAnswer,
  likeDoubt,
  bookmarkDoubt,
  updateDoubtStatus
} = require('../controllers/doubts');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Doubt routes
router.route('/')
  .get(getDoubts)
  .post(createDoubt);

router.route('/:id')
  .get(getDoubt)
  .put(updateDoubt)
  .delete(deleteDoubt);

// Answer routes
router.route('/:id/answers')
  .post(addAnswer);

router.route('/:id/answers/:answerId/vote')
  .post(voteAnswer);

// Interaction routes
router.route('/:id/like')
  .post(likeDoubt);

router.route('/:id/bookmark')
  .post(bookmarkDoubt);

router.route('/:id/status')
  .put(updateDoubtStatus);

module.exports = router;