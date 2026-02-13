const express = require('express');
const {
  getDoubts,
  getDoubt,
  createDoubt,
  updateDoubt,
  deleteDoubt,
  respondToDoubt,
  resolveDoubt,
  getDoubtStats,
  generateAISuggestion
} = require('../controllers/doubts');
const { validateDoubt, validate } = require('../middleware/validation');

const router = express.Router();

router.route('/')
  .get(getDoubts)
  .post(validateDoubt, validate, createDoubt);

router.route('/:id')
  .get(getDoubt)
  .put(updateDoubt)
  .delete(deleteDoubt);

router.post('/:id/respond', respondToDoubt);
router.put('/:id/resolve', resolveDoubt);
router.get('/stats/overview', getDoubtStats);
router.post('/:id/ai-suggestion', generateAISuggestion);

module.exports = router;